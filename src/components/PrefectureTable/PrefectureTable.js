import * as c3 from "c3";
import map from "lodash/map";
import max from "lodash/max";
import takeRight from "lodash/takeRight";
import concat from "lodash/concat";
import orderBy from "lodash/orderBy";
import i18next from "i18next";

import { COLOR_CONFIRMED } from "../../data/constants";

// TODO not sure about prefectureTrendCharts, it never changes
const drawPrefectureTrend = (
  elementId,
  seriesData,
  maxConfirmedIncrease,
  prefectureTrendCharts
) => {
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
    interaction: { enabled: false },
    data: {
      type: "bar",
      columns: [concat(["confirmed"], last30days)],
      colors: { confirmed: COLOR_CONFIRMED },
    },
    bar: {
      width: { ratio: 0.65 },
      zerobased: true,
    },
    axis: {
      x: {
        show: false,
        min: 0,
        padding: 5,
      },
      y: {
        show: false,
        min: 0,
        max: yMax,
        padding: 1,
      },
    },
    size: {
      height: 40,
    },

    legend: { show: false },
    tooltip: { show: false },
    point: { show: false },
  });
  return prefectureTrendCharts;
};

// Run CPU intensive processing in a separate macrotask
const enqueueMacrotask = (callback, delay = 0) => {
  setTimeout(callback, delay);
};

const drawPrefectureTable = (prefectures, totals, prefectureTrendCharts) => {
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

  const portOfEntryRows = document.createElement("tbody");
  portOfEntryRows.id = "portofentry-rows";
  dataTable.insertBefore(portOfEntryRows, dataTableFoot);

  const unspecifiedRows = document.createElement("tbody");
  unspecifiedRows.id = "unspecified-rows";
  dataTable.insertBefore(unspecifiedRows, dataTableFoot);

  // Work out the largest daily increase
  const maxConfirmedIncrease = max(
    map(prefectures, (pref) => {
      return max(pref.dailyConfirmedCount);
    })
  );

  // Parse values so we can sort
  map(prefectures, (pref) => {
    pref.confirmed = pref.confirmed ? parseInt(pref.confirmed) : 0;
    pref.recovered = pref.recovered ? parseInt(pref.recovered) : 0;
    // TODO change to deceased
    pref.deceased = pref.deaths ? parseInt(pref.deaths) : 0;
    pref.active =
      pref.confirmed - ((pref.recovered || 0) + (pref.deceased || 0));
  });

  // Iterate through and render table rows
  orderBy(prefectures, "confirmed", "desc").map((pref) => {
    if (!pref.confirmed && !pref.recovered && !pref.deceased) {
      return;
    }

    let increment =
      pref.dailyConfirmedCount[pref.dailyConfirmedCount.length - 1];
    let incrementString = "";
    if (increment > 0) {
      incrementString = `<span class='increment'>(+${increment})</span>`;
    }

    if (pref.name == "Unspecified") {
      unspecifiedRows.innerHTML = `<tr>
        <td class="prefecture" data-i18n="unspecified">${i18next.t(
          "unspecified"
        )}</td>
        <td class="trend"><div id="Unspecified-trend"></div></td>
        <td class="count">${pref.confirmed} ${incrementString}</td>
        <td class="count">${pref.recovered ? pref.recovered : ""}</td>
        <td class="count">${pref.deceased ? pref.deceased : ""}</td>
        <td class="count">${pref.active || ""}</td>
        </tr>`;
      enqueueMacrotask(() => {
        prefectureTrendCharts = drawPrefectureTrend(
          `#Unspecified-trend`,
          pref.dailyConfirmedCount,
          maxConfirmedIncrease,
          prefectureTrendCharts
        );
      });
    } else if (pref.name == "Port Quarantine" || pref.name == "Port of Entry") {
      // Override Port Quartantine name as "Port of Entry". The name in the spreadsheet is
      //  confusing.
      //
      // TODO(liquidx): move this hack into covid19japan-data.
      portOfEntryRows.innerHTML = `<tr>
        <td class="prefecture" data-i18n="port-of-entry">${i18next.t(
          "port-of-entry"
        )}</td>
        <td class="trend"><div id="PortOfEntry-trend"></div></td>
        <td class="count">${pref.confirmed} ${incrementString}</td>
        <td class="count">${pref.recovered ? pref.recovered : ""}</td>
        <td class="count">${pref.deceased ? pref.deceased : ""}</td>
        <td class="count">${pref.active || ""}</td>
        </tr>`;
      enqueueMacrotask(() => {
        prefectureTrendCharts = drawPrefectureTrend(
          `#PortOfEntry-trend`,
          pref.dailyConfirmedCount,
          maxConfirmedIncrease,
          prefectureTrendCharts
        );
      });
    } else if (pref.name == "Total") {
      // Skip
    } else {
      let row = document.createElement("tr");
      prefectureRows.appendChild(row);
      row.innerHTML = `
        <td class="prefecture" data-i18n="prefectures.${pref.name}">${i18next.t(
        "prefectures." + pref.name
      )}</td>
        <td class="trend"><div id="${pref.name}-trend"></div></td>
        <td class="count">${pref.confirmed} ${incrementString}</td>
        <td class="count">${pref.recovered ? pref.recovered : ""}</td>
        <td class="count">${pref.deceased ? pref.deceased : ""}</td>
        <td class="count">${pref.active || ""}</td>
      `;
      enqueueMacrotask(() => {
        prefectureTrendCharts = drawPrefectureTrend(
          `#${pref.name}-trend`,
          pref.dailyConfirmedCount,
          maxConfirmedIncrease,
          prefectureTrendCharts
        );
      });
    }
    return true;
  });

  dataTableFoot.innerHTML = `<tr class='totals'>
        <td data-i18n="total">${i18next.t("total")}</td>
        <td class="trend"></td>
        <td class="count">${totals.confirmed}</td>
        <td class="count">${totals.recovered}</td>
        <td class="count">${totals.deceased}</td>
        <td class="count">${
          totals.confirmed - totals.recovered - totals.deceased
        }</td>
        </tr>`;

  return prefectureTrendCharts;
};

export default drawPrefectureTable;
