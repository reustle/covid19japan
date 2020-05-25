import i18next from "i18next";
import twemoji from "twemoji";

/**
 * Parse the string for an emoji and convert to image
 * @param {string} emoji Emoji
 * @returns {HTMLImageElement}
 */
const parseEmoji = (emoji) => {
  return twemoji.parse(emoji, {
    folder: "svg",
    ext: ".svg",
  });
};

/**
 * Adds the localized "name" property to each country on the array.
 *
 * @param {array} countries The countries to loaclize
 */
const localizeCountryNames = (countries) => {
  const countryData = require("i18n-iso-countries");
  var language = i18next.language;
  try {
    countryData.registerLocale(
      require("i18n-iso-countries/langs/" + language + ".json")
    );
  } catch (err) {
    // Fall back to English
    language = "en";
    countryData.registerLocale(require("i18n-iso-countries/langs/en.json"));
  }
  countries.forEach((country) => {
    const countryKey = `countries.${country.code}`;
    const localizedName = i18next.exists(countryKey)
      ? i18next.t(countryKey)
      : countryData.getName(country.code, language);
    country.name = localizedName || country.name;
  });
};

/**
 * Creates a list of countries, sorted by name.
 *
 * @param {array} countries
 * @returns The list of countries as HTML.
 */
const createCountryList = (countries) => {
  return countries
    .sort((a, b) => a["name"].localeCompare(b["name"], i18next.language))
    .map((country) => {
      return `<a href="${country.link}" class="country-link">${parseEmoji(
        country.emoji
      )}${country.name}</a>`;
    })
    .join(", ");
};

/**
 * Populate the travel restrictions element with the list of countries.
 *
 * @param {string} titleId The element ID for the title.
 * @param {string} elementId The element ID for the contents.
 * @param {array} countries The list of countries for the content.
 */
const populateTravelRestriction = (titleId, elementId, countries) => {
  // Hide category title if the category is empty.
  if (!countries || !countries.length) {
    const title = document.querySelector(titleId);
    if (title) {
      title.hidden = true;
    }
    return;
  }
  // Target element for the list
  const banned = document.querySelector(elementId);
  if (!banned) {
    return;
  }

  localizeCountryNames(countries);
  banned.innerHTML = createCountryList(countries);
};

export const drawTravelRestrictions = (ddb) => {
  const banned = ddb.travelRestrictions.japan.banned;
  const visaRequired = ddb.travelRestrictions.japan.visaRequired;
  const selfQuarantine = ddb.travelRestrictions.selfQuarantine;
  const other = ddb.travelRestrictions.japan.other;

  // Hide entire travel restrictions section if all categories are empty.
  if (
    (!banned || !banned.length) &&
    (!visaRequired || !visaRequired.length) &&
    (!selfQuarantine || !selfQuarantine.length) &&
    (!other || !other.length)
  ) {
    const travelResSection = document.querySelector("#travel-restrictions");
    if (travelResSection) {
      travelResSection.hidden = true;
    }
  } else {
    populateTravelRestriction("#banned-entry-title", "#banned-entry", banned);
    populateTravelRestriction(
      "#visa-required-title",
      "#visa-required",
      visaRequired
    );
    populateTravelRestriction(
      "#self-quarantine-title",
      "#self-quarantine",
      selfQuarantine
    );
    populateTravelRestriction(
      "#other-restrictions-title",
      "#other-restrictions",
      other
    );
  }
};

export default drawTravelRestrictions;
