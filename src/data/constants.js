import languageResources, { LANGUAGES } from "../i18n";

export const TIME_FORMAT = "MMMM d yyyy, HH:mm";

export const TIME_PERIOD_ALL_TIME = 0;
export const TIME_PERIOD_THREE_MONTHS = 90;

export const COLOR_ACTIVE = "rgb(223,14,31)";
export const COLOR_ACTIVE_LIGHT = " rgb(223, 144, 144)";
export const COLOR_CONFIRMED = "rgb(244,67,54)";
export const COLOR_RECOVERED = "rgb(25,118,210)";
export const COLOR_DECEASED = "rgb(55,71,79)";
export const COLOR_DECEASED_LIGHT = "rgb(155,155,159)";
export const COLOR_CHART_BAR = "rgb(164,173,192)";
export const COLOR_TESTED_DAILY = "rgb(209,214,223)";
export const COLOR_TESTED = "rgba(6, 67, 128, 1)";
export const COLOR_TESTED_LIGHT = "rgb(210, 210, 220)";
export const SUPPORTED_LANGS = LANGUAGES;
export const COLOR_YELLOW = "rgb(254,234,203)";
export const COLOR_ORANGE = "rgb(251,155,127)";
export const COLOR_RED = "rgb(245,67,54)";
export const COLOR_DARK_RED = "rgb(176,1,13)";
export const COLOR_BURGUNDY = "rgb(186,0,13)";
export const COLOR_DARK_BURGUNDY = "rgb(114,4,5)";
export const COLOR_BLACK = "rgba(0,0,0,1)";
export const COLOR_NONE = "rgba(235, 243, 244, 1)";
export const JSON_PATH = "https://data.covid19japan.com/summary/latest.json";
export const PAGE_TITLE = "Coronavirus Disease (COVID-19) Japan Tracker";
export const PREFECTURE_PAINT = ["match", ["get", "name"]];

export const MAP_COLOR_BOUNDARIES = {
  1: COLOR_NONE,
  50: COLOR_YELLOW,
  100: COLOR_ORANGE,
  500: COLOR_RED,
  1000: COLOR_DARK_RED,
  Infinity: COLOR_DARK_BURGUNDY,
};
export const LEGEND_CLASSES = ["none", "one", "two", "three", "four", "five"];

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

export const kpiTypes = [
  "confirmed",
  "recovered",
  "critical",
  "deceased",
  "active",
  "tested",
];

export const languageOptions = [
  { value: "en", label: "🇺🇸 \xa0 English" },
  { value: "ja", label: "🇯🇵 \xa0 日本語" },
  { value: "id", label: "🇮🇩 \xa0 Bahasa Indonesia" },
  { value: "cs", label: "🇨🇿 \xa0 Čeština" },
  { value: "de", label: "🇩🇪 \xa0 Deutsch" },
  { value: "es", label: "🇪🇸 \xa0 Español" },
  { value: "fr", label: "🇫🇷 \xa0 Français" },
  { value: "it", label: "🇮🇹 \xa0 Italiano" },
  { value: "ph", label: "🇵🇭 \xa0 Filipino" },
  { value: "pl", label: "🇵🇱 \xa0 Polski" },
  { value: "pt", label: "🇵🇹 \xa0 Português" },
  { value: "fi", label: "🇫🇮 \xa0 Suomi" },
  { value: "tr", label: "🇹🇷 \xa0 Türkçe" },
  { value: "bn", label: "🇧🇩 \xa0 বাংলা" },
  { value: "hi", label: "🇮🇳 \xa0 हिंदी" },
  { value: "uk", label: "🇺🇦 \xa0 Українська" },
  { value: "zh", label: "🇨🇳 \xa0 中文 (繁體)" },
  { value: "ar", label: "🇸🇦 \xa0 العربية" },
  { value: "ru", label: "🇷🇺 \xa0 Русский" },
  { value: "th", label: "🇹🇭 \xa0 ภาษาไทย" },
  { value: "fa", label: "🇮🇷 \xa0 فارسی" },
  { value: "np", label: "🇳🇵 \xa0 नेपाली" },
];
