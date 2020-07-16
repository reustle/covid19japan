import { el, div } from "../quickelement";
import _ from "lodash";

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
    });
};

export const createRegionBox = (regionName, region) => {
  const regionId = regionName.toLowerCase();
  const box = div(["region-box", "region-area"], { id: "region-osaka" }, [
    div("vitals", {}, [
      div("label", { "data-i18n": `regions.${regionId}` }, regionName),
      div(["active", "metric"], {}, [
        div("value-label", { "data-i18n": "active" }, "Active"),
        div("value", {}, "" + region.active),
        div("diff", null, "&nbsp;"),
      ]),
      div(["confirmed", "metric"], {}, [
        div("value-label", { "data-i18n": "confirmed" }, "Confirmed"),
        div("value", {}, "" + region.confirmed),
        div("diff", null, `&nbsp;(+${region.newlyConfirmed})`),
      ]),
      div(["deceased", "metric"], {}, [
        div("value-label", { "data-i18n": "deceased" }, "Deceased"),
        div("value", {}, "" + region.deceased),
        div("diff", null, "&nbsp;"),
      ]),
    ]),
    div("region-box-prefectures"),
  ]);
  return box;
};

export const createPrefectureBox = (prefecture) => {
  const prefectureId = prefecture.name.toLowerCase();
  const box = div(
    ["region-box", "region-inner-box"],
    { id: `region-${prefectureId}` },
    [
      div(
        "label",
        { "data-i18n": `prefectures.${prefectureId}` },
        prefecture.name
      ),
      div(["confirmed", "metric"], {}, [
        div("value-label", { "data-i18n": "confirmed" }, "Confirmed"),
        div("value", {}, "" + prefecture.confirmed),
        div("diff", null, `&nbsp;(+${prefecture.newlyConfirmed})`),
      ]),
      div("chart"),
      div(
        "chart-caption",
        { "data-i18n": "regional-chart-caption" },
        "Confirmed cases by day"
      ),
    ]
  );
  return box;
};

export const drawRegionalCharts = (prefectureData, regionalData) => {
  for (let prefecture of prefectureData) {
    let prefectureId = prefecture.name.toLowerCase();
    let regionBox = document.querySelector(`#region-${prefectureId}`);
    if (regionBox) {
      let e;
      e = regionBox.querySelector(".confirmed .value");
      if (e) {
        e.innerHTML = `${prefecture.confirmed}`;
      }
      e = regionBox.querySelector(".confirmed .diff");
      if (e) {
        e.innerHTML = `(+${prefecture.newlyConfirmed})`;
      }
      let chartElement = regionBox.querySelector(".chart");
      drawRegionChart(`${prefectureId}_confirmed_daily.svg`, chartElement);
    }
  }

  if (regionalData) {
    const regionalContainer = document.querySelector(
      "#regional-charts-container"
    );
    const sortedRegions = Object.entries(regionalData).sort((a, b) => {
      return parseInt(b[1].active) - parseInt(a[1].active);
    });
    for (let [regionName, regionData] of sortedRegions) {
      let regionBox = createRegionBox(regionName, regionData);
      regionalContainer.appendChild(regionBox);

      let prefectureNames = regionData.prefectures;
      if (prefectureNames) {
        let prefecturesContainer = regionBox.querySelector(
          ".region-box-prefectures"
        );

        let prefectures = _.map(prefectureNames, (name) => {
          return _.find(prefectureData, ["name", name]);
        });
        prefectures = _.reverse(
          _.sortBy(prefectures, ["newlyConfirmed", "active"])
        );
        prefectures = prefectures.slice(0, 4);

        for (let prefecture of prefectures) {
          if (!prefecture) {
            continue;
          }
          let prefectureBox = createPrefectureBox(prefecture);
          let chartElement = prefectureBox.querySelector(".chart");
          let prefectureId = prefecture.name.toLowerCase();
          drawRegionChart(`${prefectureId}_confirmed_daily.svg`, chartElement);
          prefecturesContainer.appendChild(prefectureBox);
        }
      }
    }
  }
};
