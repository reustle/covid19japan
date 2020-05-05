import i18next from "i18next";

const prefectureId = (prefectureName) => {
  return prefectureName.toLowerCase().replace(/[\s]+/g, "_");
};

const prefectureTrendChartURL = (prefectureName) => {
  let filename = prefectureId(prefectureName);
  return `https://data.covid19japan.com/charts/${filename}.svg`;
};

export const drawPrefectureTable = (prefectures, totals) => {
  // Draw the Cases By Prefecture table
  const dataTable = document.querySelector("#prefectures-table");
  // Abort if dataTable is not accessible.
  if (!dataTable) {
    return;
  }

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
  prefectureRows.id = "prefecture-rows";

  const pseudoPrefectureRows = document.createElement("tbody");
  pseudoPrefectureRows.id = "pseudo-prefecture-rows";

  const cruiseRows = document.createElement("tbody");
  cruiseRows.id = "cruise-rows";

  const totalRows = document.querySelector("#prefectures-table #total-rows");

  const rowGroups = {
    cruise: cruiseRows,
    "pseudo-prefecture": pseudoPrefectureRows,
  };

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
    //trendCell.innerHTML = `<object type="image/svg+xml" class="trend-svg" data="${trendURL}"></object>`;
    trendCell.innerHTML = `<img class="trend-svg" src="${trendURL}">`;

    if (isPseudoPrefecture) {
      rowGroups[isPseudoPrefecture.rowGroup].appendChild(existingRow);
    } else {
      prefectureRows.appendChild(existingRow);
    }
  });

  const existingPrefectureRows = document.querySelector("#prefecture-rows");
  if (existingPrefectureRows) {
    dataTable.replaceChild(prefectureRows, existingPrefectureRows);
  }

  const existingPseudoPrefectureRows = document.querySelector(
    "#pseudo-prefecture-rows"
  );
  if (existingPseudoPrefectureRows) {
    dataTable.replaceChild(pseudoPrefectureRows, existingPseudoPrefectureRows);
  }

  const existingCruiseRows = document.querySelector("#cruise-rows");
  if (existingCruiseRows) {
    dataTable.replaceChild(cruiseRows, existingCruiseRows);
  }

  if (totalRows) {
    totalRows.querySelector(".prefecture").innerHTML = i18next.t("total");
    totalRows.querySelector(".confirmed").innerHTML = totals.confirmed;
    totalRows.querySelector(".recovered").innerHTML = totals.recovered;
    totalRows.querySelector(".deceased").innerHTML = totals.deceased;
  }
};

export const initPrefectureTableToggle = () => {
  let showMoreRows = document.querySelector("#show-more-rows");
  if (showMoreRows) {
    showMoreRows.addEventListener("click", (e) => {
      const table = document.querySelector("#prefectures-table");
      if (table) {
        table.classList.add("show-more");
      }
      e.preventDefault();
      return false;
    });
  }

  let hideMoreRows = document.querySelector("#hide-more-rows");
  if (hideMoreRows) {
    hideMoreRows.addEventListener("click", (e) => {
      const table = document.querySelector("#prefectures-table");
      if (table) {
        table.classList.remove("show-more");
        window.scrollTo(0, table.offsetTop - 60); // 60 = fuzz
      }
      e.preventDefault();
      return false;
    });
  }
};
