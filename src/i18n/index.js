import {
  enUS,
  ja,
  es,
  de,
  ptBR,
  fr,
  id,
  pl,
  fi,
  it,
  cs,
  ar,
  bn,
  hi,
} from "date-fns/locale";


// Add new languages and their emoji flag here. Make sure the array indices line up.
export const LANGUAGES = [
  "en",
  "ja",
  "id",
  "cs",
  "de",
  "es",
  "fr",
  "it",
  "pl",
  "pt",
  "fi",
  "ar",
  "bn",
  "hi",

];
export const LANGUAGE_NAMES = [
  "English",
  "日本語",
  "Bahasa Indonesia",
  "Čeština",
  "Deutsch",
  "Español",
  "Français",
  "Italiano",
  "Polski",
  "Português",
  "Suomi",
  "العربية",
  "বাংলা",
  "हिंदी",
];

// Add locales for date-fns here. Make sure the keys match the languages in LANGUAGES.
export const LOCALES = {
  en: enUS,
  ja: ja,
  es: es,
  de: de,
  pt: ptBR,
  fr: fr,
  id: id,
  pl: pl,
  it: it,
  fi: fi,
  ar: ar,
  cs: cs,
  bn: bn,
  hi: hi,
};

const generateExport = () => {
  const resources = {};
  for (const language of LANGUAGES) {
    resources[language] = {
      translation: require(`./${language}.json`),
    };
  }
  return resources;
};

export default generateExport();
