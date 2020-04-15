import translationEn from "../i18n/en.json";
import translationJa from "../i18n/ja.json";

export const TIME_FORMAT = "MMMM d yyyy, HH:mm";
export const CHART_TIME_PERIOD = 60;
export const COLOR_ACTIVE = "rgb(223,14,31)";
export const COLOR_CONFIRMED = "rgb(244,67,54)";
export const COLOR_RECOVERED = "rgb(25,118,210)";
export const COLOR_DECEASED = "rgb(55,71,79)";
export const COLOR_TESTED = "rgb(164,173,192)";
export const COLOR_TESTED_DAILY = "rgb(209,214,223)";
export const SUPPORTED_LANGS = ["en", "ja"];
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

// Data from https://en.wikipedia.org/wiki/List_of_Japanese_prefectures_by_population
// Latest Census Population Oct 1, 2015
// http://the-japan-news.com/news/article/0002776944
export const PREFECTURE_POPULATION_IN_CHUMAN = {
  Japan: 1271.10047,
  Tokyo: 135.13734,
  Kanagawa: 91.27323,
  Osaka: 88.38908,
  Aichi: 74.84094,
  Saitama: 72.61271,
  Chiba: 62.24027,
  Hyogo: 55.36989,
  Hokkaido: 53.83579,
  Fukuoka: 51.02871,
  Shizuoka: 37.01181,
  Ibaraki: 29.17857,
  Hiroshima: 28.44963,
  Kyoto: 26.1014,
  Niigata: 23.05098,
  Miyagi: 23.34215,
  Nagano: 20.99759,
  Gifu: 20.32533,
  Gunma: 19.73476,
  Tochigi: 19.74671,
  Fukushima: 19.13606,
  Okayama: 19.22181,
  Mie: 18.15827,
  Kumamoto: 17.86969,
  Kagoshima: 16.48752,
  Yamaguchi: 14.05007,
  Ehime: 13.8584,
  Nagasaki: 13.7778,
  Shiga: 14.13184,
  Okinawa: 14.34138,
  Nara: 13.65008,
  Aomori: 13.08649,
  Iwate: 12.79814,
  Oita: 11.66729,
  Ishikawa: 11.54343,
  Yamagata: 11.22957,
  Miyazaki: 11.04377,
  Toyama: 10.66883,
  Akita: 10.22839,
  Wakayama: 9.6385,
  Kagawa: 9.76756,
  Yamanashi: 8.35165,
  Saga: 8.33245,
  Fukui: 7.87099,
  Tokushima: 7.56063,
  Kochi: 7.28461,
  Shimane: 6.94188,
  Tottori: 5.73648,
};
