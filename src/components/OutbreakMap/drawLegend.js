import i18next from "i18next";
import { LEGEND_CLASSES, MAP_COLOR_BOUNDARIES } from "../../data/constants";
import { maybeIntlNumberFormat } from "../../i18n";

const getLegendLabel = (boundary, previousBoundary, formatNumber) => {
  if (previousBoundary === 0) {
    return i18next.t("cases-none");
  }
  if (!isFinite(boundary)) {
    return i18next.t("cases-last", { from: formatNumber(previousBoundary) });
  }
  return i18next.t("cases-range", {
    from: formatNumber(previousBoundary),
    to: formatNumber(boundary - 1),
  });
};

export const drawLegend = (lang) => {
  const formatNumber = maybeIntlNumberFormat(lang);
  var classIndex = 0;
  var previousBoundary = 0;
  var html = "";
  for (let boundary of Object.keys(MAP_COLOR_BOUNDARIES).sort(
    (a, b) => a - b
  )) {
    let label = getLegendLabel(boundary, previousBoundary, formatNumber);
    html += `<div><span class="${LEGEND_CLASSES[classIndex]}">▉</span> ${label}</div>`;

    classIndex = (classIndex + 1) % LEGEND_CLASSES.length;
    previousBoundary = boundary;
  }
  return html;
};
