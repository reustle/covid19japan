import languageResources, { LANGUAGES } from "../i18n";

export const TIME_FORMAT = "MMMM d yyyy, HH:mm";
export const CHART_TIME_PERIOD = 60;
export const COLOR_ACTIVE = "rgb(223,14,31)";
export const COLOR_CONFIRMED = "rgb(244,67,54)";
export const COLOR_RECOVERED = "rgb(25,118,210)";
export const COLOR_DECEASED = "rgb(55,71,79)";
export const COLOR_TESTED = "rgb(164,173,192)";
export const COLOR_TESTED_DAILY = "rgb(209,214,223)";
export const SUPPORTED_LANGS = LANGUAGES;
export const COLOR_YELLOW = "rgb(253,234,203)";
export const COLOR_ORANGE = "rgb(251,155,127)";
export const COLOR_RED = "rgb(244,67,54)";
export const COLOR_BURGUNDY = "rgb(186,0,13)";
export const COLOR_BLACK = "rgba(0,0,0,0)";
export const PREFECTURE_JSON_PATH = "static/prefectures.geojson";
export const JSON_PATH = "https://data.covid19japan.com/summary/latest.json";
export const PAGE_TITLE = "Coronavirus Disease (COVID-19) Japan Tracker";
export const PREFECTURE_PAINT = ["match", ["get", "NAME_1"]];
export const MAP_CONFIG = {
  container: "map-container",
  style: "mapbox://styles/mapbox/light-v10",
  zoom: 4,
  minZoom: 3.5,
  maxZoom: 7,
  center: {
    lng: 139.11792973051274,
    lat: 38.52245616545571,
  },
  maxBounds: [
    { lat: 12.118318014416644, lng: 100.01240618330542 }, // SW
    { lat: 59.34721256263214, lng: 175.3273570446982 }, // NE
  ],
};

export const LANG_CONFIG = {
  fallbackLng: "en",
  lowerCaseLng: true,
  detection: {
    order: ["querystring", "cookie", "navigator"],
    caches: ["cookie"],
    cookieMinutes: 60 * 24 * 365,
  },
  resources: languageResources,
};

export const DDB_COMMON = {
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
};
