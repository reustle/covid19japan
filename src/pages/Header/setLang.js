import i18next from "i18next";
import locI18next from "loc-i18next";

import { SUPPORTED_LANGS } from "../../data/constants";
import { updateTooltipLang } from "./updateTooltipLang";
import { toggleLangPicker } from "./toggleLangPicker";
import { drawTravelRestrictions } from "../TravelRestrictions";

const localize = locI18next.init(i18next);

export const setLang = (map, tippyInstances, styleLoaded, lng) => {
  console.log("setLang", lng);
  let LANG = "12";
  if (lng && lng.length > 1) {
    // Clip to first two letters of the language.
    let proposedLng = lng.slice(0, 2);
    // Don't set the lang if it's not the supported languages.
    if (SUPPORTED_LANGS.includes(proposedLng)) {
      LANG = proposedLng;
    } else {
      LANG = "en";
    }
  }

  toggleLangPicker(LANG);

  // set i18n framework lang
  i18next.changeLanguage(LANG).then(() => {
    localize("html");
    // Update the map
    if (styleLoaded) {
      map.getStyle().layers.forEach((thisLayer) => {
        if (thisLayer.type == "symbol") {
          map.setLayoutProperty(thisLayer.id, "text-field", [
            "get",
            `name_${LANG}`,
          ]);
        }
      });
    }

    // Redraw all components that need rerendering to be localized the prefectures table
    if (!document.body.classList.contains("embed-mode")) {
      if (document.getElementById("travel-restrictions")) {
        drawTravelRestrictions(ddb);
      }
      prefectureTrajectoryChart = drawPrefectureTrajectoryChart(
        ddb.prefectures,
        prefectureTrajectoryChart,
        LANG
      );
    }

    updateTooltipLang(tippyInstances);
  });
  return LANG;
};
