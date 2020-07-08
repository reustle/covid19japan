import i18next from "i18next";

const prefectureId = (prefectureName) => {
  return prefectureName.toLowerCase().replace(/[\s]+/g, "_");
};

const prefectureTrendChartURL = (prefectureName) => {
  let filename = prefectureId(prefectureName);
  return `https://data.covid19japan.com/charts/${filename}.svg`;
};

const prefectureTableRow = (id) => {
  let row = document.createElement("tr");
  row.classList.add("prefecture-row");
  row.classList.add(id);

  for (let cellClass of [
    "prefecture",
    "trend",
    "confirmed",
    "delta",
    "recovered",
    "deceased",
  ]) {
    let cell = document.createElement("td");
    cell.classList.add(cellClass);
    row.appendChild(cell);
  }

  let deltaCell = row.querySelector(".delta");
  if (deltaCell) {
    deltaCell.innerHTML =
      '<div class="increment"><div class="today"></div><div class="yesterday"></div></div>';
  }
  return row;
};

export const drawPrefectureTable = (prefectureTable, prefectures, totals) => {
  // Abort if prefectureTable is not accessible.
  if (!prefectureTable) {
    return;
  }

  // Check if prefectureTable needs any pseudo prefecture rows.
  const existingPrefectureRows = prefectureTable.querySelector(
    ".prefecture-rows"
  );
  const existingPseudoPrefectureRows = prefectureTable.querySelector(
    ".pseudo-prefecture-rows"
  );
  const existingCruiseRows = prefectureTable.querySelector(".cruise-rows");
  const existingTotalRows = prefectureTable.querySelector(".total-rows");

  // Special prefectures to handle when we iterate through them.
  const pseudoPrefectures = {
    Unspecified: {
      stringId: "pseudo-prefectures.unspecified",
      className: "Unspecified",
      rowGroup: "pseudo-prefecture",
    },
    "Port Quarantine": {
      stringId: "pseudo-prefectures.port-of-entry",
      className: "PortOfEntry",
      rowGroup: "pseudo-prefecture",
    },
    "Diamond Princess Cruise Ship": {
      stringId: "pseudo-prefectures.diamond-princess",
      className: "DiamondPrincess",
      rowGroup: "cruise",
    },
    "Nagasaki Cruise Ship": {
      stringId: "pseudo-prefectures.nagasaki-cruise",
      className: "NagasakiCruise",
      rowGroup: "cruise",
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
  prefectureRows.classList.add("prefecture-rows");

  const pseudoPrefectureRows = document.createElement("tbody");
  pseudoPrefectureRows.classList.add("pseudo-prefecture-rows");

  const cruiseRows = document.createElement("tbody");
  cruiseRows.classList.add("cruise-rows");

  const rowGroups = {
    cruise: cruiseRows,
    "pseudo-prefecture": pseudoPrefectureRows,
  };

  let totalNewlyConfirmed = 0;
  let totalYesterdayConfirmed = 0;

  prefectures.map((pref, i) => {
    let rowId = `row${i}`;
    let row = prefectureTable.querySelector(`.${rowId}`);
    if (!row) {
      row = prefectureTableRow(rowId);
    }

    let stringId = `prefectures.${pref.name}`;
    let isPseudoPrefecture = pseudoPrefectures[pref.name];
    let trendURL = prefectureTrendChartURL(pref.name);

    let todayConfirmedString = "";
    let yesterdayConfirmedString = "";
    if (pref.newlyConfirmed > 0) {
      totalNewlyConfirmed += pref.newlyConfirmed;
      todayConfirmedString = `(&nbsp;+${pref.newlyConfirmed}&nbsp;)`;
    }
    if (pref.yesterdayConfirmed > 0) {
      yesterdayConfirmedString = `(&nbsp;+${pref.yesterdayConfirmed}&nbsp;)`;
      totalYesterdayConfirmed += pref.yesterdayConfirmed;
    }

    if (isPseudoPrefecture && !existingPseudoPrefectureRows) {
      return;
    }

    if (isPseudoPrefecture) {
      stringId = isPseudoPrefecture.stringId;
    }

    row.querySelector("td.prefecture").innerHTML = i18next.t(stringId);
    row.querySelector("td.prefecture").setAttribute("data-i18n", stringId);
    row.querySelector("td.confirmed").innerHTML = pref.confirmed;
    row.querySelector(".today").innerHTML = todayConfirmedString;
    row.querySelector(".yesterday").innerHTML = yesterdayConfirmedString;
    row.querySelector("td.recovered").innerHTML = pref.recovered;
    row.querySelector("td.deceased").innerHTML = pref.deceased;

    let trendCell = row.querySelector("td.trend");
    trendCell.innerHTML = `<img class="trend-svg" src="${trendURL}">`;

    if (isPseudoPrefecture) {
      rowGroups[isPseudoPrefecture.rowGroup].appendChild(row);
    } else {
      prefectureRows.appendChild(row);
    }
  });

  if (existingPrefectureRows) {
    prefectureTable.replaceChild(prefectureRows, existingPrefectureRows);
  }

  if (existingPseudoPrefectureRows) {
    prefectureTable.replaceChild(
      pseudoPrefectureRows,
      existingPseudoPrefectureRows
    );
  }

  if (existingCruiseRows) {
    prefectureTable.replaceChild(cruiseRows, existingCruiseRows);
  }

  if (existingTotalRows) {
    existingTotalRows.querySelector(".prefecture").innerHTML = i18next.t(
      "total"
    );
    existingTotalRows.querySelector(".confirmed").innerHTML = totals.confirmed;
    existingTotalRows.querySelector(".recovered").innerHTML = totals.recovered;
    existingTotalRows.querySelector(".deceased").innerHTML = totals.deceased;
    let todayConfirmedString = "";
    let yesterdayConfirmedString = "";
    if (totalNewlyConfirmed > 0) {
      todayConfirmedString = `(&nbsp;+${totalNewlyConfirmed}&nbsp;)`;
    }
    if (totalYesterdayConfirmed > 0) {
      yesterdayConfirmedString = `(&nbsp;+${totalYesterdayConfirmed}&nbsp;)`;
    }
    existingTotalRows.querySelector(".today").innerHTML = todayConfirmedString;
    existingTotalRows.querySelector(
      ".yesterday"
    ).innerHTML = yesterdayConfirmedString;
  }

  // Remove any loaders
  prefectureTable.classList.remove("loading");
};

export const drawAllPrefectureTable = (prefectures, totals) => {
  let allPrefectureTable = document.querySelector("#prefectures-table");
  drawPrefectureTable(allPrefectureTable, prefectures, totals);
};

export const drawTopPrefectureTable = (prefectures, totals) => {
  let topPrefectureTable = document.querySelector("#top-prefectures-table");
  drawPrefectureTable(topPrefectureTable, prefectures, totals);
};
