import * as c3 from "c3";
import map from "lodash/map";
import max from "lodash/max";
import takeRight from "lodash/takeRight";
import concat from "lodash/concat";
import orderBy from "lodash/orderBy";
import i18next from "i18next";

import { COLOR_CONFIRMED } from "../../data/constants";

// Global that ensures we clean up any prefectureTrend charts on redraw.
let prefectureTrendCharts = {};

const drawPrefectureTrend = (elementId, seriesData, maxConfirmedIncrease) => {
  let yMax = maxConfirmedIncrease;
  let prefectureMax = max(seriesData);
  if (prefectureMax / maxConfirmedIncrease < 0.1) {
    yMax = prefectureMax * 5; // artificially scale up low values to make it look ok.
  }

  const period = 30; // days
  let last30days = takeRight(seriesData, period);

  if (prefectureTrendCharts[elementId]) {
    prefectureTrendCharts[elementId].destroy();
  }
  prefectureTrendCharts[elementId] = c3.generate({
    bindto: elementId,
    padding: { left: 0, right: 0, top: 0, bottom: 0 },
    interaction: { enabled: false },
    data: {
      type: "bar",
      columns: [concat(["confirmed"], last30days)],
      colors: { confirmed: COLOR_CONFIRMED },
    },
    bar: {
      width: { ratio: 1 },
      zerobased: true,
    },
    axis: {
      x: {
        show: false,
        min: 0,
        padding: { left: 0, right: 0 },
      },
      y: {
        show: false,
        min: 0,
        max: yMax,
        padding: { top: 0, bottom: 0 },
      },
    },
    size: {
      height: 30,
      width: 120,
    },
    legend: { show: false },
    tooltip: { show: false },
    point: { show: false },
  });
};

// Run CPU intensive processing in a separate macrotask
const enqueueMacrotask = (callback, delay = 0) => {
  setTimeout(callback, delay);
};

const drawPrefectureTable = (prefectures, totals) => {
  // Draw the Cases By Prefecture table
  const dataTable = document.querySelector("#prefectures-table");
  const dataTableFoot = document.querySelector("#prefectures-table tfoot");

  // Abort if dataTable or dataTableFoot is not accessible.
  if (!dataTable || !dataTableFoot) {
    return;
  }

  // Remove any tbody elements (including the loading indicator).
  for (let tbody of document.querySelectorAll("#prefectures-table tbody")) {
    tbody.parentNode.removeChild(tbody);
  }

  const prefectureRows = document.createElement("tbody");
  prefectureRows.id = "prefecture-rows";
  dataTable.insertBefore(prefectureRows, dataTableFoot);

  const pseudoPrefectureRows = document.createElement("tbody");
  pseudoPrefectureRows.id = "pseudoPrefecture-rows";
  dataTable.insertBefore(pseudoPrefectureRows, dataTableFoot);

  const unspecifiedRows = document.createElement("tbody");
  unspecifiedRows.id = "unspecified-rows";
  dataTable.insertBefore(unspecifiedRows, dataTableFoot);

  // Work out the largest daily increase
  const maxConfirmedIncrease = max(
    map(prefectures, (pref) => {
      return max(pref.dailyConfirmedCount);
    })
  );

  // Special prefectures to handle when we iterate through them.
  const pseudoPrefectures = {
    Unspecified: {
      stringId: "pseudo-prefectures.unspecified",
      className: "Unspecified",
    },
    "Port Quarantine": {
      stringId: "pseudo-prefectures.port-of-entry",
      className: "PortOfEntry",
    },
    "Diamond Princess Cruise Ship": {
      stringId: "pseudo-prefectures.diamond-princess",
      className: "DiamondPrincess",
    },
    "Nagasaki Cruise Ship": {
      stringId: "pseudo-prefectures.nagasaki-cruise",
      className: "NagasakiCruise",
    },
    Total: {}, // Left blank so we can ignore it.
  };

  // Parse values so we can sort
  map(prefectures, (pref) => {
    pref.confirmed = pref.confirmed ? parseInt(pref.confirmed) : 0;
    pref.recovered = pref.recovered ? parseInt(pref.recovered) : 0;
    // TODO change to deceased
    pref.deceased = pref.deaths ? parseInt(pref.deaths) : 0;
  });

  // Iterate through and render table rows
  orderBy(prefectures, "confirmed", "desc").map((pref) => {
    if (!pref.confirmed && !pref.recovered && !pref.deceased) {
      return;
    }

    let incrementString = "";
    let todayConfirmedString = "";
    let yesterdayConfirmedString = "";
    if (pref.newlyConfirmed > 0) {
      todayConfirmedString = `(&nbsp;+${pref.newlyConfirmed}&nbsp;)`;
    }
    if (pref.yesterdayConfirmed > 0) {
      yesterdayConfirmedString = `(&nbsp;+${pref.yesterdayConfirmed}&nbsp;)`;
    }

    let isPseudoPrefecture = pseudoPrefectures[pref.name];
    if (isPseudoPrefecture) {
      if (isPseudoPrefecture.stringId) {
        let stringId = isPseudoPrefecture.stringId;
        let trendElementId = `${isPseudoPrefecture.className}-trend`;
        let row = document.createElement("tr");
        row.innerHTML = `<td class="prefecture" data-i18n="${stringId}">${i18next.t(
          stringId
        )}</td>
          <td class="trend"><div id="${trendElementId}"></div></td>
          <td class="count confirmed">${pref.confirmed}</td>
          <td class="delta">
            <div class="increment">
              <span class="today">${todayConfirmedString}</span>
              <span class="yesterday">${yesterdayConfirmedString}</span>
            </div>
          </td>
          <td class="count recovered">${
            pref.recovered ? pref.recovered : ""
          }</td>
          <td class="count deceased">${
            pref.deceased ? pref.deceased : ""
          }</td>`;

        if (pref.name == "Unspecified") {
          unspecifiedRows.appendChild(row);
        } else {
          pseudoPrefectureRows.appendChild(row);
        }
        enqueueMacrotask(() => {
          drawPrefectureTrend(
            "#" + trendElementId,
            pref.dailyConfirmedCount,
            maxConfirmedIncrease
          );
        });
      }
    } else {
      let stringId = `prefectures.${pref.name}`;
      let row = document.createElement("tr");
      prefectureRows.appendChild(row);
      row.innerHTML = `
        <td class="prefecture" data-i18n="${stringId}">${i18next.t(
        stringId
      )}</td>
        <td class="trend"><div id="${pref.name}-trend"></div></td>
        <td class="count confirmed">${pref.confirmed} ${incrementString}</td>
        <td class="delta">
          <div class="increment">
            <span class="today">${todayConfirmedString}</span>
            <span class="yesterday">${yesterdayConfirmedString}</span>
          </div>
        </td>
        <td class="count recovered">${pref.recovered ? pref.recovered : ""}</td>
        <td class="count deceased">${pref.deceased ? pref.deceased : ""}</td>
      `;
      enqueueMacrotask(() => {
        drawPrefectureTrend(
          `#${pref.name}-trend`,
          pref.dailyConfirmedCount,
          maxConfirmedIncrease
        );
      });
    }
    return true;
  });

  dataTableFoot.innerHTML = `<tr class='totals'>
        <td data-i18n="total">${i18next.t("total")}</td>
        <td class="trend"></td>
        <td class="count" colspan="2">${totals.confirmed}</td>
        <td class="count recovered">${totals.recovered}</td>
        <td class="count deceased">${totals.deceased}</td>
        </tr>`;
};

export default drawPrefectureTable;
