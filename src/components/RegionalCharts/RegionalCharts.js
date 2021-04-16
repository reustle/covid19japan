import i18next from "i18next";
import _ from "lodash";

import { span, div } from "quickelement";
import { maybeIntlNumberFormat } from "../../i18n";

const MAX_REGIONS_IN_TOP_REGIONS = 4;
const MAX_PREFECTURES_IN_TOP_REGIONS = 4;

const drawRegionChart = (chartName, element) => {
  let svgURL = `https://data.covid19japan.com/charts/${chartName}`;
  fetch(svgURL)
    .then((response) => {
      if (response.status == 200) {
        return response.text();
      }
      return "";
    })
    .then((text) => {
      if (element) {
        element.innerHTML = text;
      }
    })
    .catch((e) => {
      console.log(e, svgURL);
    });
};

const confirmedDiffValue = (placeData, numberFormatter) => {
  let diffValue = "";
  if (!placeData) {
    return diffValue;
  }

  if (placeData.newlyConfirmed) {
    const newlyConfirmed = numberFormatter(placeData.newlyConfirmed);
    diffValue = `&nbsp;(+${newlyConfirmed})`;
  } else if (placeData.yesterdayConfirmed) {
    const yesterdayConfirmed = numberFormatter(placeData.yesterdayConfirmed);
    diffValue = [span("yesterday", {}, `&nbsp;(+${yesterdayConfirmed})`)];
  }
  return diffValue;
};

export const createTopRegionBox = (
  regionName,
  region,
  topPrefectures,
  numberFormatter
) => {
  const regionId = regionName.toLowerCase();
  const localizedRegionName = i18next.t(`regions.${regionName}`);
  const diffValue = confirmedDiffValue(region, numberFormatter);

  const topPrefectureStringElements = _.map(topPrefectures, (p) => {
    const prefectureKey = `prefectures.${p.name}`;
    let localizedName = i18next.t(prefectureKey);
    if (p.newlyConfirmed > 0) {
      const newlyConfirmed = numberFormatter(p.newlyConfirmed);
      return span("", {}, [
        span("", { "data-i18n": prefectureKey }, localizedName),
        span("", {}, `&nbsp;(+${newlyConfirmed})`),
        span("", {}, `&nbsp;`),
      ]);
    } else {
      return span("", {}, [
        span("", { "data-i18n": prefectureKey }, localizedName),
        span("", {}, `&nbsp;`),
      ]);
    }
  });

  const box = div(["region-box", "region-top"], { id: `region-${regionId}` }, [
    div("title", {}, [
      span("", { "data-i18n": `regions.${regionName}` }, localizedRegionName),
      span("prefecture-sum", {}, topPrefectureStringElements),
    ]),
    div("vitals", {}, [
      div("vitals-left", {}, [
        div("metrics", {}, [
          div(["active", "metric"], {}, [
            div("value-label", { "data-i18n": "active" }, i18next.t("active")),
            div("value", {}, numberFormatter(region.active)),
            div("diff", null, "&nbsp;"),
          ]),
          div(["deceased", "metric"], {}, [
            div("value-label", { "data-i18n": "deaths" }, i18next.t("deaths")),
            div("value", {}, numberFormatter(region.deceased)),
            div("diff", null, "&nbsp;"),
          ]),
          div(["confirmed", "metric"], {}, [
            div(
              "value-label",
              { "data-i18n": "confirmed" },
              i18next.t("confirmed")
            ),
            div("value", {}, numberFormatter(region.confirmed)),
            div("diff", null, diffValue),
          ]),
        ]),
      ]),
      div("vitals-right", {}, [
        div("chart"),
        div(
          "chart-caption",
          { "data-i18n": "confirmed-chart-caption" },
          i18next.t("confirmed-chart-caption")
        ),
      ]),
    ]),
    div("region-box-prefectures"),
  ]);

  box.addEventListener("click", (e) => {
    let r = document.querySelector(`#region-${regionId}`);
    if (r) {
      r.scrollIntoView(true);
    }
  });

  return box;
};

export const createRegionBox = (regionName, region, numberFormatter) => {
  const regionId = regionName.toLowerCase();
  const localizedRegionName = i18next.t(`regions.${regionName}`);
  const diffValue = confirmedDiffValue(region, numberFormatter);

  let confirmed = region.confirmed;
  if (typeof confirmed == "number") {
    confirmed = numberFormatter(confirmed);
  }

  let active = region.active;
  if (typeof active == "number") {
    active = numberFormatter(active);
  } else if (active === null) {
    active = "0";
  }

  let deceased = region.deceased;
  if (typeof deceased == "number") {
    deceased = numberFormatter(deceased);
  }

  const box = div(["region-box", "region-area"], { id: `region-${regionId}` }, [
    div("vitals", {}, [
      div(
        "title",
        { "data-i18n": `regions.${regionName}` },
        localizedRegionName
      ),
      div("metrics", {}, [
        div(["active", "metric"], {}, [
          div("value-label", { "data-i18n": "active" }, i18next.t("active")),
          div("value", {}, active),
          div("diff", null, "&nbsp;"),
        ]),
        div(["deceased", "metric"], {}, [
          div("value-label", { "data-i18n": "deaths" }, i18next.t("deaths")),
          div("value", {}, deceased),
          div("diff", null, "&nbsp;"),
        ]),
        div(["confirmed", "metric"], {}, [
          div(
            "value-label",
            { "data-i18n": "confirmed" },
            i18next.t("confirmed")
          ),
          div("value", {}, confirmed),
          div("diff", null, diffValue),
        ]),
      ]),
    ]),
    div("region-box-prefectures"),
  ]);
  return box;
};

export const createPrefectureBox = (
  prefecture,
  prefectureStringKey,
  numberFormatter
) => {
  if (!prefectureStringKey) {
    prefectureStringKey = `prefectures.${prefecture.name}`;
  }

  const prefectureId = prefecture.name.toLowerCase();
  const localizedPrefectureName = i18next.t(prefectureStringKey);
  const diffConfirmedValue = confirmedDiffValue(prefecture, numberFormatter);
  const diffActiveValue = confirmedDiffValue(prefecture, numberFormatter);

  let boxClasses = ["region-box", "region-prefecture"];
  if (prefecture.active == 0) {
    boxClasses.push("inactive");
  }

  let valueLabel = i18next.t("active-cases");
  let valueKey = { "data-i18n": "active-cases" };
  if (prefecture.active == 0) {
    valueLabel = i18next.t("no-active-cases");
    valueKey = { "data-i18n": "no-active-cases" };
  }

  let confirmed = prefecture.confirmed;
  if (typeof confirmed == "number") {
    confirmed = numberFormatter(confirmed);
  }

  let active = prefecture.active;
  if (typeof active == "number") {
    active = numberFormatter(active);
  } else if (!active) {
    active = "0";
  }

  let deceased = prefecture.deceased;
  if (typeof deceased == "number") {
    deceased = numberFormatter(deceased);
  }

  const box = div(boxClasses, { id: `region-${prefectureId}` }, [
    div(
      "title",
      { "data-i18n": prefectureStringKey, title: localizedPrefectureName },
      localizedPrefectureName
    ),
    div(["metrics-and-chart"], {}, [
      div(["metrics"], {}, [
        div(["active", "metric"], {}, [
          div("value-label", valueKey, valueLabel),
          div("value", {}, active),
          div("diff", null, diffActiveValue),
        ]),
        div(["deceased", "metric"], {}, [
          div("value-label", { "data-i18n": "deaths" }, i18next.t("deaths")),
          div("value", {}, deceased),
        ]),
        div(["confirmed", "metric"], {}, [
          div(
            "value-label",
            { "data-i18n": "confirmed" },
            i18next.t("confirmed")
          ),
          div("value", {}, confirmed),
          div("diff", null, diffConfirmedValue),
        ]),
      ]),
      div("chart-and-caption", {}, [
        div("chart"),
        div(
          "chart-caption",
          { "data-i18n": "confirmed-chart-caption" },
          i18next.t("confirmed-chart-caption")
        ),
      ]),
    ]),
  ]);
  return box;
};

export const drawRegionalCharts = (prefectureData, regionalData, lang) => {
  if (!regionalData) {
    return;
  }

  const numberFormatter = maybeIntlNumberFormat(lang);

  const regionalContainer = document.querySelector(
    "#regional-charts-container"
  );

  if (!regionalContainer) {
    return;
  }

  // Remove all existing regional containers first
  const existingRegionElements = regionalContainer.querySelectorAll(
    ".region-area"
  );
  existingRegionElements.forEach((o) => {
    o.parentElement.removeChild(o);
  });

  if (!regionalData || !regionalData.slice) {
    return;
  }

  for (let regionData of regionalData) {
    let regionName = regionData.name;
    let regionBox = createRegionBox(regionName, regionData, numberFormatter);
    regionalContainer.appendChild(regionBox);

    let prefectureNames = regionData.prefectures;
    if (prefectureNames) {
      let prefecturesContainer = regionBox.querySelector(
        ".region-box-prefectures"
      );

      let prefectures = _.map(prefectureNames, (name) => {
        return _.find(prefectureData, ["name", name]);
      });
      prefectures = prefectures.sort((a, b) => {
        let deltaA = a.newlyConfirmed;
        let deltaB = b.newlyConfirmed;
        if (deltaA < 1 && a.yesterdayConfirmed > 0) {
          deltaA = a.yesterdayConfirmed;
        }
        if (deltaB < 1 && b.yesterdayConfirmed > 0) {
          deltaB = b.yesterdayConfirmed;
        }
        if (deltaA < deltaB) {
          return 1;
        } else if (deltaB < deltaA) {
          return -1;
        } else if (a.active < b.active) {
          return 1;
        } else if (b.active < a.active) {
          return -1;
        }
        return b.confirmed - a.confirmed;
      });

      for (let prefecture of prefectures) {
        if (!prefecture) {
          continue;
        }
        let prefectureBox = createPrefectureBox(
          prefecture,
          null,
          numberFormatter
        );
        let chartElement = prefectureBox.querySelector(".chart");
        if (chartElement) {
          let prefectureId = prefecture.name.toLowerCase();
          drawRegionChart(`${prefectureId}_confirmed_daily.svg`, chartElement);
        }
        prefecturesContainer.appendChild(prefectureBox);
      }
    }
  }

  // Include pseudo prefectures.
  const pseudoRegionData = {
    active: "-",
    confirmed: "-",
    deceased: "-",
  };
  let pseudoRegionBox = createRegionBox(
    "Other",
    pseudoRegionData,
    numberFormatter
  );
  let pseudoRegionPrefectureContainer = pseudoRegionBox.querySelector(
    ".region-box-prefectures"
  );

  let sortedPrefectures = prefectureData.sort((a, b) => {
    let deltaA = a.newlyConfirmed;
    let deltaB = b.newlyConfirmed;
    if (deltaA < 1 && a.yesterdayConfirmed > 0) {
      deltaA = a.yesterdayConfirmed;
    }
    if (deltaB < 1 && b.yesterdayConfirmed > 0) {
      deltaB = b.yesterdayConfirmed;
    }

    if (deltaA < deltaB) {
      return 1;
    } else if (deltaB < deltaA) {
      return -1;
    } else {
      return a.active - b.active;
    }
  });

  for (let prefecture of sortedPrefectures) {
    if (prefecture.pseudoPrefecture && prefecture.identifier != "unspecified") {
      let prefectureStringKey = "pseudo-prefectures." + prefecture.identifier;
      let prefectureBox = createPrefectureBox(
        prefecture,
        prefectureStringKey,
        numberFormatter
      );
      let chartElement = prefectureBox.querySelector(".chart");
      if (chartElement) {
        let prefectureId = prefecture.name.toLowerCase().replace(/[\s]+/g, "_");
        drawRegionChart(`${prefectureId}_confirmed_daily.svg`, chartElement);
      }
      pseudoRegionPrefectureContainer.appendChild(prefectureBox);
    }
  }
  if (pseudoRegionPrefectureContainer.children.length > 0) {
    regionalContainer.appendChild(pseudoRegionBox);
  }
};

export const drawTopRegions = (prefectureData, regionalData, lang) => {
  const regionalContainer = document.querySelector(
    "#prefecture-top-table-container"
  );
  if (!regionalContainer) {
    return;
  }

  const numberFormatter = maybeIntlNumberFormat(lang);

  const existingRegionElements = regionalContainer.querySelectorAll(
    ".region-top"
  );
  existingRegionElements.forEach((o) => {
    o.parentElement.removeChild(o);
  });

  if (!regionalData || !regionalData.slice) {
    return;
  }

  let sortedRegions = regionalData.slice(0, MAX_REGIONS_IN_TOP_REGIONS);

  for (let regionData of sortedRegions) {
    let prefectures = _.map(regionData.prefectures, (name) => {
      return _.find(prefectureData, ["name", name]);
    });
    prefectures = _.reverse(
      _.sortBy(prefectures, ["newlyConfirmed", "yesterdayConfirmed", "active"])
    );
    prefectures = prefectures.slice(0, MAX_PREFECTURES_IN_TOP_REGIONS);

    let regionBox = createTopRegionBox(
      regionData.name,
      regionData,
      prefectures,
      numberFormatter
    );
    regionalContainer.appendChild(regionBox);

    let chartElement = regionBox.querySelector(".chart");
    if (chartElement) {
      const regionId = regionData.name.toLowerCase();
      drawRegionChart(`region_${regionId}_confirmed_daily.svg`, chartElement);
    }
  }
};
