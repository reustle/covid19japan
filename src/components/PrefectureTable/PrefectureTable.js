import i18next from "i18next";
import { is } from "date-fns/esm/locale";

const prefectureId = (prefectureName) => {
  return prefectureName.toLowerCase().replace(/[\s]+/g, "_");
};

const prefectureTrendChartURL = (prefectureName) => {
  let filename = prefectureId(prefectureName);
  return `https://data.covid19japan.com/charts/${filename}.svg`;
};

const drawPrefectureTable = (prefectures, totals) => {
  // Draw the Cases By Prefecture table
  const dataTable = document.querySelector("#prefectures-table");
  const dataTableFoot = document.querySelector("#prefectures-table tfoot");

  // Abort if dataTable or dataTableFoot is not accessible.
  if (!dataTable || !dataTableFoot) {
    return;
  }

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

  // Ensure data is present.
  prefectures.map((pref) => {
    pref.confirmed = pref.confirmed ? parseInt(pref.confirmed) : 0;
    pref.recovered = pref.recovered ? parseInt(pref.recovered) : 0;
    pref.deceased = pref.deceased ? parseInt(pref.deceased) : 0;
  });

  const prefectureRows = document.createElement("tbody");
  prefectureRows.id = "prefecture-rows";

  const pseudoPrefectureRows = document.createElement("tbody");
  pseudoPrefectureRows.id = "pseudo-prefecture-rows";

  const unspecifiedRows = document.createElement("tbody");
  unspecifiedRows.id = "unspecified-rows";

  prefectures.map((pref) => {
    let prefId = prefectureId(pref.name);
    let rowId = `row-${prefId}`;
    let existingRow = document.querySelector(`#${rowId}`);
    if (!existingRow) {
      console.log("Could not find row " + rowId);
      return;
    }

    let stringId = `prefectures.${pref.name}`;
    let isPseudoPrefecture = pseudoPrefectures[pref.name];
    let trendURL = prefectureTrendChartURL(pref.name);

    let todayConfirmedString = "";
    let yesterdayConfirmedString = "";
    if (pref.newlyConfirmed > 0) {
      todayConfirmedString = `(&nbsp;+${pref.newlyConfirmed}&nbsp;)`;
    }
    if (pref.yesterdayConfirmed > 0) {
      yesterdayConfirmedString = `(&nbsp;+${pref.yesterdayConfirmed}&nbsp;)`;
    }

    if (isPseudoPrefecture) {
      stringId = isPseudoPrefecture.stringId;
    }

    existingRow.querySelector("td.prefecture").innerHTML = i18next.t(stringId);
    existingRow
      .querySelector("td.prefecture")
      .setAttribute("data-i18n", stringId);
    existingRow.querySelector("td.confirmed").innerHTML = pref.confirmed;
    existingRow.querySelector(
      "td.delta .increment .today"
    ).innerHTML = todayConfirmedString;
    existingRow.querySelector(
      "td.delta .increment .yesterday"
    ).innerHTML = yesterdayConfirmedString;

    existingRow.querySelector("td.recovered").innerHTML = pref.recovered;
    existingRow.querySelector("td.deceased").innerHTML = pref.deceased;

    let trendCell = existingRow.querySelector("td.trend");
    trendCell.innerHTML = `<img src="${trendURL}">`;

    if (isPseudoPrefecture && pref.name == "Unspecified") {
      unspecifiedRows.appendChild(existingRow);
    } else if (isPseudoPrefecture) {
      pseudoPrefectureRows.appendChild(existingRow);
    } else {
      prefectureRows.appendChild(existingRow);
    }
  });

  dataTable.replaceChild(
    prefectureRows,
    dataTable.querySelector("#prefecture-rows")
  );
  dataTable.replaceChild(
    pseudoPrefectureRows,
    dataTable.querySelector("#pseudo-prefecture-rows")
  );
  dataTable.replaceChild(
    unspecifiedRows,
    dataTable.querySelector("#unspecified-rows")
  );

  dataTableFoot.querySelector(".prefecture").innerHTML = i18next.t("total");
  dataTableFoot.querySelector(".confirmed").innerHTML = totals.confirmed;
  dataTableFoot.querySelector(".recovered").innerHTML = totals.recovered;
  dataTableFoot.querySelector(".deceased").innerHTML = totals.deceased;
};

export default drawPrefectureTable;
