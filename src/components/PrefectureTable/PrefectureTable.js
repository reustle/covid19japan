import i18next from "i18next";

const prefectureTrendChartURL = (prefectureName) => {
  let filename = prefectureName.toLowerCase().replace(/[\s]+/g, "_");
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
  const maxConfirmedIncrease = prefectures
    .map((pref) => {
      return pref.dailyConfirmedCount.reduce((max, value) =>
        max > value ? max : value
      );
    })
    .reduce((max, value) => (max > value ? max : value));

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
  prefectures.map((pref) => {
    pref.confirmed = pref.confirmed ? parseInt(pref.confirmed) : 0;
    pref.recovered = pref.recovered ? parseInt(pref.recovered) : 0;
    // TODO change to deceased
    pref.deceased = pref.deaths ? parseInt(pref.deaths) : 0;
  });

  // Iterate through and render table rows
  const sortedPrefectures = prefectures
    .concat()
    .sort((a, b) => b["confirmed"] - a["confirmed"]);
  sortedPrefectures.map((pref) => {
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
        let trendURL = prefectureTrendChartURL(pref.name);
        let row = document.createElement("tr");
        row.innerHTML = `<td class="prefecture" data-i18n="${stringId}">${i18next.t(
          stringId
        )}</td>
          <td class="trend"><div id="${trendElementId}"><img src="${trendURL}"></div></td>
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
      }
    } else {
      let stringId = `prefectures.${pref.name}`;
      let row = document.createElement("tr");
      let trendURL = prefectureTrendChartURL(pref.name);
      prefectureRows.appendChild(row);
      row.innerHTML = `
        <td class="prefecture" data-i18n="${stringId}">${i18next.t(
        stringId
      )}</td>
        <td class="trend"><div id="${
          pref.name
        }-trend"><img src="${trendURL}"></div></td>
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
