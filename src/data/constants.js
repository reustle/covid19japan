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
export const PREFECTURE_JSON_PATH = "static/prefectures.geojson";
export const JSON_PATH = "https://data.covid19japan.com/summary/latest.json";
export const PAGE_TITLE = "Coronavirus Disease (COVID-19) Japan Tracker";
export const PREFECTURE_PAINT = ["match", ["get", "NAME_1"]];
export const MAP_CONFIG = {
  container: "map-container",
  style: "mapbox://styles/mapbox/light-v10",
  zoom: 4.2,
  minZoom: 3.5,
  maxZoom: 7,
  bearing: -25.5,
  pitch: 50,
  center: {
    lng: 134.240472073148,
    lat: 37.286501707813514,
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

// Sourced from https://en.wikipedia.org/wiki/List_of_Japanese_prefectures_by_population
export const PREFECTURE_POPULATIONS = {
  Tokyo: 13195974,
  Kanagawa: 9058094,
  Osaka: 8861012,
  Aichi: 7416336,
  Saitama: 7207139,
  Chiba: 6214148,
  Hyogo: 5581968,
  Hokkaido: 5485952,
  Fukuoka: 5079291,
  Shizuoka: 3749274,
  Ibaraki: 2957706,
  Hiroshima: 2855045,
  Kyoto: 2631671,
  Niigata: 2362158,
  Miyagi: 2326735,
  Nagano: 2142167,
  Gifu: 2070908,
  Gunma: 2000514,
  Tochigi: 2000010,
  Fukushima: 1989834,
  Okayama: 1940559,
  Mie: 1847223,
  Kumamoto: 1812575,
  Kagoshima: 1698695,
  Yamaguchi: 1442428,
  Ehime: 1423406,
  Nagasaki: 1417423,
  Shiga: 1413513,
  Okinawa: 1401066,
  Nara: 1395845,
  Aomori: 1362820,
  Iwate: 1314076,
  Oita: 1191430,
  Ishikawa: 1166309,
  Yamagata: 1161214,
  Miyazaki: 1130983,
  Toyama: 1087745,
  Akita: 1074858,
  Wakayama: 995010,
  Kagawa: 991947,
  Yamanashi: 857459,
  Saga: 846787,
  Fukui: 802906,
  Tokushima: 780236,
  Kochi: 758469,
  Shimane: 712292,
  Tottori: 585494,
};

// Sourced from https://simplemaps.com/data/jp-cities.
// "Center" -> largest population city, not geographical center
export const PREFECTURE_CENTERS = {
  Tokyo: { lat: 35.685, long: 139.751389 },
  Osaka: { lat: 34.683333, long: 135.516667 },
  Kanagawa: { lat: 35.433333, long: 139.65 },
  Aichi: { lat: 35.183333, long: 136.9 },
  Fukuoka: { lat: 33.6, long: 130.416667 },
  Hokkaido: { lat: 43.066667, long: 141.35 },
  Miyagi: { lat: 38.266667, long: 140.866667 },
  Hiroshima: { lat: 34.4, long: 132.45 },
  Kyoto: { lat: 35.016667, long: 135.75 },
  Hyogo: { lat: 34.683333, long: 135.183333 },
  Shizuoka: { lat: 34.7, long: 137.733333 },
  Okinawa: { lat: 26.166667, long: 127.666667 },
  Okayama: { lat: 34.65, long: 133.933333 },
  Kumamoto: { lat: 32.783333, long: 130.733333 },
  Tochigi: { lat: 36.566667, long: 139.883333 },
  Nagano: { lat: 36.65, long: 138.183333 },
  Niigata: { lat: 37.9, long: 139 },
  Kagoshima: { lat: 31.566667, long: 130.55 },
  Ishikawa: { lat: 36.6, long: 136.616667 },
  Shiga: { lat: 35, long: 135.866667 },
  Ehime: { lat: 33.85, long: 132.716667 },
  Mie: { lat: 34.733333, long: 136.516667 },
  oita: { lat: 33.233333, long: 131.6 },
  Tokushima: { lat: 34.066667, long: 134.566667 },
  Wakayama: { lat: 34.233333, long: 135.166667 },
  Nagasaki: { lat: 32.75, long: 129.883333 },
  Gifu: { lat: 35.433333, long: 136.783333 },
  Fukushima: { lat: 37.05, long: 140.883333 },
  Ibaraki: { lat: 36.35, long: 140.45 },
  Gunma: { lat: 36.4, long: 139.083333 },
  Saitama: { lat: 35.908611, long: 139.485278 },
  Kochi: { lat: 33.55, long: 133.533333 },
  Kagawa: { lat: 34.333333, long: 134.05 },
  Toyama: { lat: 36.7, long: 137.216667 },
  Miyazaki: { lat: 31.916667, long: 131.416667 },
  Akita: { lat: 39.716667, long: 140.1 },
  Aomori: { lat: 40.816667, long: 140.733333 },
  Iwate: { lat: 39.7, long: 141.15 },
  Yamagata: { lat: 38.233333, long: 140.366667 },
  Fukui: { lat: 36.04803, long: 136.188686 },
  Yamanashi: { lat: 35.666667, long: 138.566667 },
  Shimane: { lat: 35.483333, long: 133.05 },
  Tottori: { lat: 35.5, long: 134.233333 },
  Chiba: { lat: 35.6, long: 140.116667 },
  Nara: { lat: 34.683333, long: 135.833333 },
  Saga: { lat: 33.233333, long: 130.3 },
  Yamaguchi: { lat: 34.183333, long: 131.466667 },
};
