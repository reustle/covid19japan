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
export const COLOR_YELLOW = "rgb(254,234,203)";
export const COLOR_ORANGE = "rgb(251,155,127)";
export const COLOR_RED = "rgb(245,67,54)";
export const COLOR_DARK_RED = "rgb(176,1,13)";
export const COLOR_BURGUNDY = "rgb(186,0,13)";
export const COLOR_DARK_BURGUNDY = "rgb(114,4,5)";
export const COLOR_BLACK = "rgba(0,0,0,1)";
export const COLOR_NONE = "rgba(255, 255, 255, 0)";
export const JSON_PATH = "https://data.covid19japan.com/summary/latest.json";
export const PAGE_TITLE = "Coronavirus Disease (COVID-19) Japan Tracker";
export const PREFECTURE_PAINT = ["match", ["get", "NAME_1"]];

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
