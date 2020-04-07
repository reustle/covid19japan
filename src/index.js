// Injects required polyfills for IE11
import "core-js/stable";
import "whatwg-fetch";
import "classlist-polyfill";

// Add all non-polyfill deps below.
import _ from "lodash";

import { drawLastUpdated } from "./pages/Header/drawLastUpdated";
import { toggleLangPicker } from "./pages/Header/toggleLangPicker";
import { updateTooltipLang } from "./pages/Header/updateTooltipLang";

import { drawKpis } from "./pages/KPI";
import { drawMap } from "./pages/OutebreakMap";
import { calculateTotals } from "./data/helper";
import { drawTrendChart } from "./pages/SpreadTrend";
import { drawDailyIncreaseChart } from "./pages/DailyIncrease";
import { drawPrefectureTrajectoryChart } from "./pages/TrajectoryChart";
import { drawPrefectureTable } from "./pages/PrefectureTable";
import { drawTravelRestrictions } from "./pages/TravelRestrictions";

// Localization deps
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import locI18next from "loc-i18next";
import translationEn from "./i18n/en.json";
import translationJa from "./i18n/ja.json";

// import static data
import travelRestrictions from "./data/travelRestrictions"; // refer to the keys under "countries" in the i18n files for names

mapboxgl.accessToken =
  "pk.eyJ1IjoicmV1c3RsZSIsImEiOiJjazZtaHE4ZnkwMG9iM3BxYnFmaDgxbzQ0In0.nOiHGcSCRNa9MD9WxLIm7g";
const PREFECTURE_JSON_PATH = "static/prefectures.geojson";
const JSON_PATH = "https://data.covid19japan.com/summary/latest.json";
const PAGE_TITLE = "Coronavirus Disease (COVID-19) Japan Tracker";

const SUPPORTED_LANGS = ["en", "ja"];
let LANG = "en";

// Global vars
const ddb = {
  prefectures: undefined,
  trend: undefined,
  totals: {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
    tested: 0,
    critical: 0,
  },
  totalsDiff: {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
    tested: 0,
    critical: 0,
  },
  travelRestrictions,
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

const drawPageTitleCount = (confirmed) => {
  // Update the number of confirmed cases in the title

  document.title = `(${confirmed}) ${PAGE_TITLE}`;
};

/**
 * drawMapPrefectures
 * @param {*} pageDraws - number of redraws to screen
 */
const drawMapPrefectures = (pageDraws) => {
  // Find the index of the first symbol layer
  // in the map style so we can draw the
  // prefecture colors behind it

  let firstSymbolId;
  const { layers = [] } = map.getStyle();
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol") {
      firstSymbolId = layers[i].id;
      break;
    }
  }

  // Start the Mapbox search expression
  const prefecturePaint = ["match", ["get", "NAME_1"]];

  // Go through all prefectures looking for cases
  ddb.prefectures.map((prefecture) => {
    let cases = parseInt(prefecture.confirmed);
    if (cases > 0) {
      prefecturePaint.push(prefecture.name);

      if (cases <= 50) {
        // 1-50 cases
        prefecturePaint.push("rgb(253,234,203)");
      } else if (cases <= 100) {
        // 51-100 cases
        prefecturePaint.push("rgb(251,155,127)");
      } else if (cases <= 200) {
        // 101-200 cases
        prefecturePaint.push("rgb(244,67,54)");
      } else {
        // 201+ cases
        prefecturePaint.push("rgb(186,0,13)");
      }
    }
  });

  // Add a final value to the list for the default color
  prefecturePaint.push("rgba(0,0,0,0)");

  if (pageDraws === 0) {
    // If it is the first time drawing the map

    map.addSource("prefectures", {
      type: "geojson",
      data: PREFECTURE_JSON_PATH,
    });

    // Add the prefecture color layer to the map
    map.addLayer(
      {
        id: "prefecture-layer",
        type: "fill",
        source: "prefectures",
        layout: {},
        paint: {
          "fill-color": prefecturePaint,
          "fill-opacity": 0.8,
        },
      },
      firstSymbolId
    );

    // Add another layer with type "line"
    // to provide a styled prefecture border
    let prefBorderLayer = map.addLayer(
      {
        id: "prefecture-outline-layer",
        type: "line",
        source: "prefectures",
        layout: {},
        paint: {
          "line-width": 0.5,
          "line-color": "#c0c0c0",
          "line-opacity": 0.5,
        },
      },
      firstSymbolId
    );
  } else {
    // Update prefecture paint properties

    map.setPaintProperty("prefecture-layer", "fill-color", prefecturePaint);
  }
};

// localize must be accessible globally
const localize = locI18next.init(i18next);

const initDataTranslate = () => {
  // load translation framework
  i18next
    .use(LanguageDetector)
    .init({
      fallbackLng: "en",
      lowerCaseLng: true,
      detection: {
        order: ["querystring", "navigator"],
      },
      resources: {
        en: {
          translation: translationEn,
        },
        ja: {
          translation: translationJa,
        },
      },
    })
    .then(() => {
      setLang(i18next.language);
    });

  // Language selector event handler
  if (document.querySelectorAll("[data-lang-picker]")) {
    document.querySelectorAll("[data-lang-picker]").forEach((pick) => {
      pick.addEventListener("click", (e) => {
        e.preventDefault();
        setLang(e.target.dataset.langPicker);
      });
    });
  }
};

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
      prefectureTrajectoryChart = drawPrefectureTrajectoryChart(
        ddb.prefectures,
        prefectureTrajectoryChart,
        LANG
      );
    }

    tippyInstances = updateTooltipLang(tippyInstances);
  });
};

const loadDataOnPage = () => {
  loadData((data) => {
    jsonData = data;

    ddb.prefectures = jsonData.prefectures;
    let newTotals = calculateTotals(jsonData.daily);
    ddb.totals = newTotals[0];
    ddb.totalsDiff = newTotals[1];
    ddb.trend = jsonData.daily;
    ddb.lastUpdated = jsonData.updated;

    drawKpis(ddb.totals, ddb.totalsDiff);
    if (!document.body.classList.contains("embed-mode")) {
      drawLastUpdated(ddb.lastUpdated, LANG);
      drawPageTitleCount(ddb.totals.confirmed);
      prefectureTrendCharts = drawPrefectureTable(
        ddb.prefectures,
        ddb.totals,
        prefectureTrendCharts
      );
      drawTravelRestrictions(ddb);
      trendChart = drawTrendChart(ddb.trend, trendChart);
      dailyIncreaseChart = drawDailyIncreaseChart(
        ddb.trend,
        dailyIncreaseChart
      );
      prefectureTrajectoryChart = drawPrefectureTrajectoryChart(
        ddb.prefectures,
        prefectureTrajectoryChart,
        LANG
      );
    }

    whenMapAndDataReady();
  });
};

let pageDraws = 0;
let styleLoaded = false;
let jsonData = undefined;
const whenMapAndDataReady = () => {
  // This runs drawMapPref only when
  // both style and json data are ready
  if (!styleLoaded || !jsonData) {
    return;
  }
  drawMapPrefectures(pageDraws);
};

window.onload = () => {
  initDataTranslate();
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
    whenMapAndDataReady();
  });
  loadDataOnPage();

  // Reload data every five minutes
  const FIVE_MINUTES_IN_MS = 300000;
  const recursiveDataLoad = () => {
    pageDraws++;
    loadDataOnPage();
    setTimeout(recursiveDataLoad, FIVE_MINUTES_IN_MS);
  };

  setTimeout(recursiveDataLoad, FIVE_MINUTES_IN_MS);
};
