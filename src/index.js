// Injects required polyfills for IE11
import "core-js/stable";
import "whatwg-fetch";
import "classlist-polyfill";
import "custom-event-polyfill";

// Add all non-polyfill deps below.
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import locI18next from "loc-i18next";

import { calculateTotals } from "./data/helper";
import header from "./components/Header";
import drawDailyIncreaseChart from "./components/DailyIncreaseChart";
import drawKpis from "./components/Kpi";
import mapDrawer from "./components/OutbreakMap";
import drawPrefectureTable from "./components/PrefectureTable";
import drawTrendChart from "./components/SpreadTrendChart";
import drawPrefectureTrajectoryChart from "./components/TrajectoryChart";
import drawTravelRestrictions from "./components/TravelRestrictions";

const {
  toggleLangPicker,
  updateTooltipLang,
  drawPageTitleCount,
  drawLastUpdated,
} = header;

const { drawMap, drawMapPrefectures } = mapDrawer;

import {
  LANG_CONFIG,
  JSON_PATH,
  SUPPORTED_LANGS,
  DDB_COMMON,
} from "./data/constants";
import travelRestrictions from "./data/travelRestrictions"; // refer to the keys under "countries" in the i18n files for names

mapboxgl.accessToken =
  "pk.eyJ1IjoicmV1c3RsZSIsImEiOiJjazZtaHE4ZnkwMG9iM3BxYnFmaDgxbzQ0In0.nOiHGcSCRNa9MD9WxLIm7g";
let LANG = "en";

// Global vars
const ddb = {
  ...DDB_COMMON,
  travelRestrictions,
};

ddb.isLoaded = function () {
  return !!ddb.lastUpdated;
};
ddb.isUpdated = function () {
  return (
    ddb.isLoaded() &&
    (!ddb.previouslyUpdated || ddb.lastUpdated > ddb.previouslyUpdated)
  );
};

let map = undefined;
let tippyInstances;

// IE11 forEach Polyfill
if ("NodeList" in window && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = (callback, thisArg) => {
    thisArg = thisArg || window;
    for (let i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

// Fetches data from the JSON_PATH but applies an exponential
// backoff if there is an error.
const loadData = (callback) => {
  let delay = 2 * 1000; // 2 seconds

  const tryFetch = (retryFn) => {
    // Load the json data file
    fetch(JSON_PATH)
      .then((res) => res.json())
      .catch((networkError) => {
        retryFn(delay, networkError);
        delay *= 2; // exponential backoff.
      })
      .then((data) => {
        // If there was a network error, data will null.
        if (data) {
          callback(data);
        }
      });
  };

  const retryFetchWithDelay = (delay, err) => {
    console.log(`${err}: retrying after ${delay}ms.`);
    setTimeout(() => {
      tryFetch(retryFetchWithDelay);
    }, delay);
  };

  tryFetch(retryFetchWithDelay);
};

// Keep a reference around to destroy it if we redraw this.
let trendChart = null;

// Keep reference to current chart in order to clean up when redrawing.
let dailyIncreaseChart = null;

// Keep reference to chart in order to destroy it when redrawing.
let prefectureTrajectoryChart = null;

// Dictionary of all the trend charts so that we can cleanup when redrawing.
let prefectureTrendCharts = {};

// localize must be accessible globally
const localize = locI18next.init(i18next);

const setLang = (lng) => {
  if (lng && lng.length > 1) {
    // Clip to first two letters of the language.
    let proposedLng = lng.slice(0, 2);
    // Don't set the lang if it's not the supported languages.
    if (SUPPORTED_LANGS.includes(proposedLng)) {
      LANG = proposedLng;
    }
  }

  toggleLangPicker(LANG);

  // set i18n framework lang
  i18next.changeLanguage(LANG).then(() => {
    localize("html");
    // Update the map
    if (styleLoaded) {
      map.getStyle().layers.forEach((thisLayer) => {
        if (thisLayer.type == "symbol") {
          map.setLayoutProperty(thisLayer.id, "text-field", [
            "get",
            `name_${LANG}`,
          ]);
        }
      });
    }

    // Redraw all components that need rerendering to be localized the prefectures table
    if (!document.body.classList.contains("embed-mode")) {
      if (document.getElementById("travel-restrictions")) {
        drawTravelRestrictions(ddb);
      }
      if (ddb.isLoaded()) {
        trendChart = drawTrendChart(ddb.trend, trendChart, LANG);
        dailyIncreaseChart = drawDailyIncreaseChart(
          ddb.trend,
          dailyIncreaseChart,
          LANG
        );
        prefectureTrajectoryChart = drawPrefectureTrajectoryChart(
          ddb.prefectures,
          prefectureTrajectoryChart,
          LANG
        );
      }
    }

    tippyInstances = updateTooltipLang(tippyInstances);
  });
};

const initDataTranslate = () => {
  // load translation framework
  i18next
    .use(LanguageDetector)
    .init(LANG_CONFIG)
    .then(() => {
      setLang(i18next.language);
    });

  // Language selector event handler
  const langPickers = document.querySelectorAll("[data-lang-picker]");
  if (langPickers) {
    langPickers.forEach((pick) => {
      pick.addEventListener("click", (e) => {
        e.preventDefault();
        setLang(e.target.dataset.langPicker);
      });
    });
  }
};

let pageDraws = 0;
let styleLoaded = false;
let jsonData = undefined;
const whenMapAndDataReady = (ddb, map) => {
  // This runs drawMapPref only when
  // both style and json data are ready
  if (!styleLoaded || !jsonData) {
    return;
  }
  drawMapPrefectures(pageDraws, ddb, map);
};

const loadDataOnPage = () => {
  loadData((data) => {
    jsonData = data;

    if (!ddb.isLoaded() || jsonData.updated > ddb.lastUpdated) {
      ddb.previouslyUpdated = ddb.lastUpdated;
      ddb.lastUpdated = jsonData.updated;
      ddb.prefectures = jsonData.prefectures;
      let newTotals = calculateTotals(jsonData.daily);
      ddb.totals = newTotals[0];
      ddb.totalsDiff = newTotals[1];
      ddb.trend = jsonData.daily;

      const event = new CustomEvent("covid19japan-redraw");
      document.dispatchEvent(event);
    }
  });
};

const startReloadTimer = () => {
  let reloadInterval = 3;
  setTimeout(() => location.reload(), reloadInterval * 60 * 60 * 1000);
};

const initMap = () => {
  map = drawMap(mapboxgl, map);

  map.once("style.load", () => {
    styleLoaded = true;

    map.getStyle().layers.forEach((thisLayer) => {
      if (thisLayer.type == "symbol") {
        map.setLayoutProperty(thisLayer.id, "text-field", [
          "get",
          `name_${LANG}`,
        ]);
      }
    });
  });
};

// Reload data every five minutes
const FIVE_MINUTES_IN_MS = 300000;
const recursiveDataLoad = () => {
  pageDraws++;
  loadDataOnPage();
  setTimeout(recursiveDataLoad, FIVE_MINUTES_IN_MS);
};

// Call only if ddb is updated.
// Uses a setTimeout to queue a new macrotask
const callIfUpdated = (callback, delay = 0) => {
  if (ddb.isUpdated()) {
    setTimeout(callback, delay);
  }
};

document.addEventListener("covid19japan-redraw", () => {
  callIfUpdated(() => drawKpis(ddb.totals, ddb.totalsDiff));
  if (!document.body.classList.contains("embed-mode")) {
    callIfUpdated(() => drawLastUpdated(ddb.lastUpdated, LANG));
    callIfUpdated(() => drawPageTitleCount(ddb.totals.confirmed));
    callIfUpdated(() => {
      trendChart = drawTrendChart(ddb.trend, trendChart, LANG);
    });
    callIfUpdated(() => {
      dailyIncreaseChart = drawDailyIncreaseChart(
        ddb.trend,
        dailyIncreaseChart,
        LANG
      );
    });
    callIfUpdated(() => {
      prefectureTrajectoryChart = drawPrefectureTrajectoryChart(
        ddb.prefectures,
        prefectureTrajectoryChart,
        LANG
      );
    }, 32);
    callIfUpdated(() => {
      prefectureTrendCharts = drawPrefectureTable(
        ddb.prefectures,
        ddb.totals,
        prefectureTrendCharts
      );
    }, 32);
    callIfUpdated(() => drawTravelRestrictions(ddb));
  }

  callIfUpdated(() => whenMapAndDataReady(ddb, map));
});

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  loadDataOnPage();
  initDataTranslate();
  setTimeout(recursiveDataLoad, FIVE_MINUTES_IN_MS);
  startReloadTimer();
});
