import i18next from "i18next";
import orderBy from "lodash/orderBy";
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
  orderBy(countries, "name", "desc").map((country) => {
    const name = i18next.t(`countries.${country.name}`);
    countryList.unshift(
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
