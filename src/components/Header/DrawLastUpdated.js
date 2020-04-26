import i18next from "i18next";
import { formatDistanceToNow, parse, parseISO } from "date-fns";
import { enUS, ja } from "date-fns/locale";

import { TIME_FORMAT } from "../../data/constants";

/**
 * @param {string} lastUpdatedString - MMM DD YYYY, HH:mm JST (e.g. Mar 29 2020, 15:53 JST)
 */
const drawLastUpdated = (lastUpdatedString, lang) => {
  // Draw the last updated time
  // If this is called before data is loaded, lastUpdated can be null.
  if (!lastUpdatedString) {
    return;
  }

  const display = document.getElementById("last-updated");
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
  const relativeTime = {
    en: formatDistanceToNow(lastUpdated, {
      locale: enUS,
      addSuffix: true,
    }),
    ja: formatDistanceToNow(lastUpdated, { locale: ja, addSuffix: true }),
  };

  display.textContent = relativeTime[lang];
  display.setAttribute("title", lastUpdatedString);
  i18next.addResource(
    "en",
    "translation",
    "last-updated-time",
    relativeTime["en"]
  );
  i18next.addResource(
    "ja",
    "translation",
    "last-updated-time",
    relativeTime["ja"]
  );
  display.setAttribute("data-i18n", "last-updated-time");
};

export default drawLastUpdated;
