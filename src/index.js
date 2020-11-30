// Polyfills for IE11.
// Avoid including core-js/stable in it's entirety to minimize bundle size.
// Instead, individually import required core-js polyfills below.
//
// See: https://github.com/zloirock/core-js#usage for list of features.
import "core-js/es/object/assign";
import "core-js/es/array/find";
import "core-js/es/symbol";
import "core-js/es/symbol/async-iterator";
import "core-js/es/symbol/iterator";
import "core-js/es/promise";
import "core-js/es/map";
import "core-js/es/array/includes";
import "core-js/web/dom-collections";

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
import {
  drawRegionalCharts,
  drawTopRegions,
} from "./components/RegionalCharts/RegionalCharts";

const {
  toggleLangPicker,
  updateTooltipLang,
  drawPageTitleCount,
  drawLastUpdated,
  updatePageDirectionClass,
} = header;

const { drawMap, drawMapPrefectures } = mapDrawer;

import {
  LANG_CONFIG,
  JSON_PATH,
  SUPPORTED_LANGS,
  DDB_COMMON,
  TIME_PERIOD_ALL_TIME,
  TIME_PERIOD_THREE_MONTHS,
  COLOR_TESTED,
  COLOR_CONFIRMED,
  COLOR_CHART_BAR,
  COLOR_ACTIVE,
  COLOR_ACTIVE_LIGHT,
  COLOR_DECEASED,
  COLOR_DECEASED_LIGHT,
} from "./data/constants";
import { LANGUAGES, LANGUAGE_NAMES } from "./i18n";

//
// Globals
//

let LANG = "en";
let CHART_TIME_PERIOD = TIME_PERIOD_ALL_TIME;

const PAGE_STATE = {
  map: null,
  mapLoaded: false,
  mapShouldLoad: true,
  styleLoaded: false,
  dataLoaded: false,
};

const ddb = {
  ...DDB_COMMON,
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

// Keep reference to current chart in order to clean up when redrawing.
let dailyConfirmedCasesChart = null;
let dailyActiveCasesChart = null;
let dailyDeathsCasesChart = null;
let dailyTestsCasesChart = null;

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

  updatePageDirectionClass(i18next.dir(LANG));

  // set i18n framework lang
  i18next.changeLanguage(LANG).then(() => {
    localize("html");
    // Update the map
    if (PAGE_STATE.styleLoaded && PAGE_STATE.map) {
      let map = PAGE_STATE.map;
      map.getStyle().layers.forEach((thisLayer) => {
        if (thisLayer.type == "symbol") {
          map.setLayoutProperty(thisLayer.id, "text-field", [
            "get",
            `name_${LANG}`,
          ]);
        }
      });
      drawMapPrefectures(ddb, PAGE_STATE.map, LANG);
    }

    // Redraw all components that need rerendering to be localized the prefectures table
    if (!document.body.classList.contains("embed-mode")) {
      if (ddb.isLoaded()) {
        const event = new CustomEvent("covid19japan-redraw");
        document.dispatchEvent(event);
      }
    }

    sendResizeMessage();
    updateTooltipLang();
  });
};

const populateLanguageSelector = () => {
  const parent = document.getElementsByClassName("lang-picker-languages")[0];
  parent.innerHTML = "";
  for (let i in LANGUAGES) {
    parent.innerHTML =
      parent.innerHTML +
      `<a href="#" class="lang-picker-button" data-lang-picker='${LANGUAGES[i]}'>${LANGUAGE_NAMES[i]}</a> `;
    if (i <= LANGUAGES.length - 2)
      parent.innerHTML = parent.innerHTML + `&nbsp;| `;
  }
};

const initDataTranslate = () => {
  // load translation framework
  i18next
    .use(LanguageDetector)
    .init(LANG_CONFIG)
    .then(() => {
      setLang(i18next.language);
    });

  populateLanguageSelector();

  // Language selector event handler
  const langPickers = document.querySelectorAll("[data-lang-picker]");
  if (langPickers) {
    langPickers.forEach((pick) => {
      pick.addEventListener("click", (e) => {
        e.preventDefault();
        // Go up the DOM tree until we find the langPicker
        let elem = e.target;
        while (elem && (!elem.dataset || !elem.dataset.langPicker)) {
          elem = elem.parentElement;
        }
        if (elem) {
          setLang(elem.dataset.langPicker);
        }
      });
    });
  }
};

const initChartTimePeriodSelector = () => {
  const allTimeLink = document.querySelector("#time-period-all-time");

  if (allTimeLink) {
    allTimeLink.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector("#time-period-all-time").classList.add("selected");
      document
        .querySelector("#time-period-three-months")
        .classList.remove("selected");
      CHART_TIME_PERIOD = TIME_PERIOD_ALL_TIME;
      const event = new CustomEvent("covid19japan-redraw");
      document.dispatchEvent(event);
    });
  }

  const threeMonthsLink = document.querySelector("#time-period-three-months");
  if (threeMonthsLink) {
    threeMonthsLink.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelector("#time-period-all-time")
        .classList.remove("selected");
      document
        .querySelector("#time-period-three-months")
        .classList.add("selected");
      CHART_TIME_PERIOD = TIME_PERIOD_THREE_MONTHS;
      const event = new CustomEvent("covid19japan-redraw");
      document.dispatchEvent(event);
    });
  }
};

const whenMapAndDataReady = () => {
  // This runs drawMapPref only when
  // both style and json data are ready
  if (!PAGE_STATE.styleLoaded || !PAGE_STATE.dataLoaded || !PAGE_STATE.map) {
    return;
  }
  drawMapPrefectures(ddb, PAGE_STATE.map, LANG);
};

const loadDataOnPage = () => {
  loadData((summaryData) => {
    if (!ddb.isLoaded() || summaryData.updated > ddb.lastUpdated) {
      ddb.previouslyUpdated = ddb.lastUpdated;
      ddb.lastUpdated = summaryData.updated;
      ddb.prefectures = summaryData.prefectures;
      ddb.regions = summaryData.regions;
      let newTotals = calculateTotals(summaryData.daily);
      ddb.totals = newTotals[0];
      ddb.totalsDiff = newTotals[1];
      ddb.trend = summaryData.daily;

      PAGE_STATE.dataLoaded = ddb.isLoaded();

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
  if (typeof window.mapboxgl === "undefined") {
    // mapbox js hasn't loaded yet, defer initializing the map after 3s
    console.log("Mapbox not loaded. Defering initialization for 3s.");
    setTimeout(initMap, 3000);
    return;
  }
  console.log("Initializing map.");
  doInitMap();
};

const doInitMap = () => {
  let map = PAGE_STATE.map;

  if (window.mapboxgl.supported() && PAGE_STATE.mapShouldLoad) {
    map = drawMap();
    PAGE_STATE.map = map;
  } else {
    // Hide the outbreak map.
    let mapContainer = document.querySelector("#prefecture-map-container");
    if (mapContainer) {
      mapContainer.style.display = "none";
    }
  }

  if (map) {
    map.once("style.load", () => {
      PAGE_STATE.styleLoaded = true;
      let layers = map.getStyle().layers;
      if (layers) {
        layers.forEach((thisLayer) => {
          if (thisLayer.type == "symbol") {
            map.setLayoutProperty(thisLayer.id, "text-field", [
              "get",
              `name_${LANG}`,
            ]);
          }
        });
      }
      whenMapAndDataReady();
    });
  }
};

// Reload data every five minutes
const FIVE_MINUTES_IN_MS = 300000;
const recursiveDataLoad = () => {
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

/**
 * Sends message to window parent. Allows pages that embed this to resize the iFrame.
 */
const sendResizeMessage = () => {
  const height = document.getElementsByTagName("html")[0].scrollHeight;
  window.parent.postMessage(
    {
      name: "setHeight",
      payload: height,
    },
    "*"
  );
};

document.addEventListener("covid19japan-redraw", () => {
  callIfUpdated(() => drawKpis(ddb.totals, ddb.totalsDiff, LANG));
  if (!document.body.classList.contains("embed")) {
    callIfUpdated(() => drawLastUpdated(ddb.lastUpdated, LANG));
    callIfUpdated(() => drawPageTitleCount(ddb.totals.confirmed, LANG));

    callIfUpdated(() => {
      dailyConfirmedCasesChart = drawDailyIncreaseChart(
        ddb.trend,
        dailyConfirmedCasesChart,
        LANG,
        "confirmed",
        "confirmedAvg7d",
        COLOR_CHART_BAR,
        COLOR_CONFIRMED,
        "#daily-confirmed-chart",
        CHART_TIME_PERIOD
      );
    });

    callIfUpdated(() => {
      dailyActiveCasesChart = drawDailyIncreaseChart(
        ddb.trend,
        dailyActiveCasesChart,
        LANG,
        "activeCumulative",
        "",
        COLOR_ACTIVE_LIGHT,
        COLOR_ACTIVE,
        "#daily-active-chart",
        CHART_TIME_PERIOD
      );
    });

    callIfUpdated(() => {
      dailyDeathsCasesChart = drawDailyIncreaseChart(
        ddb.trend,
        dailyDeathsCasesChart,
        LANG,
        "deceased",
        "deceasedAvg7d",
        COLOR_DECEASED_LIGHT,
        COLOR_DECEASED,
        "#daily-deaths-chart",
        CHART_TIME_PERIOD
      );
    });

    callIfUpdated(() => {
      dailyTestsCasesChart = drawDailyIncreaseChart(
        ddb.trend,
        dailyTestsCasesChart,
        LANG,
        "tested",
        "",
        COLOR_TESTED,
        COLOR_TESTED,
        "#daily-tests-chart",
        CHART_TIME_PERIOD
      );
    });

    callIfUpdated(() => {
      drawTopRegions(ddb.prefectures, ddb.regions, LANG);
      drawRegionalCharts(ddb.prefectures, ddb.regions, LANG);
    }, 32);
  }

  callIfUpdated(() => whenMapAndDataReady());
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.href.indexOf("nomap") != -1) {
    PAGE_STATE.mapShouldLoad = false;
  }
  initMap();
  loadDataOnPage();
  initDataTranslate();
  initChartTimePeriodSelector();
  setTimeout(recursiveDataLoad, FIVE_MINUTES_IN_MS);
  startReloadTimer();
});

window.addEventListener("load", () => {
  sendResizeMessage();
});
