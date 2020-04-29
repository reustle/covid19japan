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

const travelRestrictionsHelper = (elementId, countries) => {
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
};

export const drawTravelRestrictions = (ddb) => {
  travelRestrictionsHelper(
    "#banned-entry",
    ddb.travelRestrictions.japan.banned
  );
  travelRestrictionsHelper(
    "#visa-required",
    ddb.travelRestrictions.japan.visaRequired
  );
  travelRestrictionsHelper(
    "#self-quarantine",
    ddb.travelRestrictions.japan.selfQuarantine
  );
  travelRestrictionsHelper(
    "#other-restrictions",
    ddb.travelRestrictions.japan.other
  );
};

export default drawTravelRestrictions;
