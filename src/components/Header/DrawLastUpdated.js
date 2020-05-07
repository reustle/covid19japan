import i18next from "i18next";
import { formatDistanceToNow, parse, parseISO } from "date-fns";

import { LANGUAGES, LOCALES } from "../../i18n";
import { TIME_FORMAT } from "../../data/constants";

const addRelativeTimeLocalization = (lastUpdated, language) => {
  const relativeTime = getLocalizedRelativeTime(lastUpdated, language);
  i18next.addResource(
    language,
    "translation",
    "last-updated-time",
    relativeTime
  );
};

const getLocalizedRelativeTime = (lastUpdated, language) => {
  const locale = LOCALES[language];
  return formatDistanceToNow(lastUpdated, {
    locale,
    addSuffix: true,
  });
};

/**
 * @param {string} lastUpdatedString - MMM DD YYYY, HH:mm JST (e.g. Mar 29 2020, 15:53 JST)
 */
const drawLastUpdated = (lastUpdatedString, currentLanguage) => {
  // Draw the last updated time
  // If this is called before data is loaded, lastUpdated can be null.
  if (!lastUpdatedString) {
    return;
  }

  const display = document.getElementById("last-updated-time");
  if (!display) {
    return;
  }

  let lastUpdated;
  try {
    lastUpdated = parseISO(lastUpdatedString);
    // If the timestamp is not ISO, fall back on the old date format
    // TODO: remove after ISO time format is fully deployed
    if (lastUpdated === "Invalid Date") {
      lastUpdated = parse(
        lastUpdatedString.slice(0, -4),
        TIME_FORMAT,
        new Date()
      );
    }
  } catch (e) {
    // Fall back to raw value on failed parse
    display.textContent = lastUpdatedString;
    return;
  }

  for (const language of LANGUAGES) {
    addRelativeTimeLocalization(lastUpdated, language);
  }

  display.setAttribute("title", lastUpdatedString);
  display.setAttribute("data-i18n", "last-updated-time");
  display.textContent = i18next.getResource(
    currentLanguage,
    "translation",
    "last-updated-time"
  );
};

export default drawLastUpdated;
