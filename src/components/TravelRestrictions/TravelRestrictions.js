import i18next from "i18next";
import orderBy from "lodash/orderBy";
import twemoji from "twemoji";

const travelRestrictionsHelper = (elementId, countries) => {
  const countryList = [];
  // Iterate through and render country links
  orderBy(countries, "name", "desc").map((country) => {
    const name = i18next.t(`countries.${country.name}`);
    countryList.unshift(
      `<a href="${country.link}">${country.emoji}${name}</a>`
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
  // replace emoji with twemoji on windows
  if (navigator.oscpu.toLowerCase().contains("windows")) {
    twemoji.parse("#travel-restrictions");
  }
};

export default drawTravelRestrictions;
