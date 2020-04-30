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

const travelRestrictionsHelper = (titleId, elementId, countries) => {
  // Hide category title if the category is empty.
  if (!countries || !countries.length) {
    const title = document.querySelector(titleId);
    if (title) {
      title.hidden = true;
    }
  } else {
    const countryList = [];
    // Iterate through and render country links
    countries.sort((a, b) => {
      a["name"] < b["name"] ? 1 : b["name"] > a["name"] ? -1 : 0;
    });
    countries.map((country) => {
      const name = i18next.t(`countries.${country.name}`);
      countryList.push(
        `<a href="${country.link}" class="country-link">${parseEmoji(
          country.emoji
        )}${name}</a>`
      );
      return true;
    });

    const banned = document.querySelector(elementId);
    if (banned) {
      banned.innerHTML = countryList.join(", ");
    }
  }
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
    travelRestrictionsHelper("#banned-entry-title", "#banned-entry", banned);
    travelRestrictionsHelper(
      "#visa-required-title",
      "#visa-required",
      visaRequired
    );
    travelRestrictionsHelper(
      "#self-quarantine-title",
      "#self-quarantine",
      selfQuarantine
    );
    travelRestrictionsHelper(
      "#other-restrictions-title",
      "#other-restrictions",
      other
    );
  }
};

export default drawTravelRestrictions;
