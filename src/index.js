// Injects required polyfills for IE11
import "core-js/stable";
import "whatwg-fetch";
import "classlist-polyfill";

// Add all non-polyfill deps below.
import _ from "lodash";
import tippy from "tippy.js";
import * as d3 from "d3";
import * as c3 from "c3";
import moment from "moment";

// Localization deps
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import locI18next from "loc-i18next";
import translationEn from "./i18n/en.json";
import translationJa from "./i18n/ja.json";

mapboxgl.accessToken =
  "pk.eyJ1IjoicmV1c3RsZSIsImEiOiJjazZtaHE4ZnkwMG9iM3BxYnFmaDgxbzQ0In0.nOiHGcSCRNa9MD9WxLIm7g";
const PREFECTURE_JSON_PATH = "static/prefectures.geojson";
const JSON_PATH = "https://data.covid19japan.com/summary/latest.json";
const TIME_FORMAT = "YYYY-MM-DD";
const COLOR_ACTIVE = "rgb(223,14,31)";
const COLOR_CONFIRMED = "rgb(244,67,54)";
const COLOR_RECOVERED = "rgb(25,118,210)";
const COLOR_DECEASED = "rgb(55,71,79)";
const COLOR_TESTED = "rgb(164,173,192)";
const COLOR_TESTED_DAILY = "rgb(209,214,223)";
const COLOR_INCREASE = "rgb(163,172,191)";
const PAGE_TITLE = "Coronavirus Disease (COVID-19) Japan Tracker";
let LANG = "en";

// Global vars
let ddb = {
  prefectures: undefined,
  trend: undefined,
  totals: {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
    tested: 0,
    critical: 0,
  },
  totalsDiff: {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
    tested: 0,
    critical: 0,
  },
  travelRestrictions: {
    japan: {
      banned: [
        // refer to the keys under "countries" in the i18n files for names
        {
          name: "andorra",
          emoji: "🇦🇩",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "austria",
          emoji: "🇦🇹",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "belgium",
          emoji: "🇧🇪",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "china",
          emoji: "🇨🇳",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "estonia",
          emoji: "🇪🇪",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "france",
          emoji: "🇫🇷",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "germany",
          emoji: "🇩🇪",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "iceland",
          emoji: "🇮🇸",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "iran",
          emoji: "🇮🇷",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "ireland",
          emoji: "🇮🇪",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "italy",
          emoji: "🇮🇹",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "korea",
          emoji: "🇰🇷",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "liechtenstein",
          emoji: "🇱🇮",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "luxembourg",
          emoji: "🇱🇺",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "malta",
          emoji: "🇲🇹",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "monaco",
          emoji: "🇲🇨",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "netherlands",
          emoji: "🇳🇱",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "norway",
          emoji: "🇳🇴",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "portugal",
          emoji: "🇵🇹",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "sanmarino",
          emoji: "🇸🇲",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "slovenia",
          emoji: "🇸🇮",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "spain",
          emoji: "🇪🇸",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "sweden",
          emoji: "🇸🇪",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "switzerland",
          emoji: "🇨🇭",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "vatican",
          emoji: "🇻🇦",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
        {
          name: "westerdam",
          emoji: "🛳",
          link: "http://www.moj.go.jp/content/001316999.pdf",
        },
      ],
      visaRequired: [],
      selfQuarantine: [],
      other: [],
    },
    foreignBorders: [
      {
        banned: [],
        visaRequired: [],
        selfQuarantine: [],
        other: [],
      },
    ],
  },
};
let map = undefined;

// IE11 forEach Polyfill
if ("NodeList" in window && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

// Fetches data from the JSON_PATH but applies an exponential
// backoff if there is an error.
function loadData(callback) {
  let delay = 2 * 1000; // 2 seconds

  const tryFetch = function (retryFn) {
    // Load the json data file
    fetch(JSON_PATH)
      .then(function (res) {
        return res.json();
      })
      .catch(function (networkError) {
        retryFn(delay, networkError);
        delay *= 2; // exponential backoff.
      })
      .then(function (data) {
        // If there was a network error, data will null.
        if (data) {
          callback(data);
        }
      });
  };

  const retryFetchWithDelay = function (delay, err) {
    console.log(err + ": retrying after " + delay + "ms.");
    setTimeout(function () {
      tryFetch(retryFetchWithDelay);
    }, delay);
  };

  tryFetch(retryFetchWithDelay);
}

function calculateTotals(daily) {
  // Calculate the totals
  let totals = {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
    critical: 0,
    tested: 0,
  };
  let totalsDiff = {
    confirmed: 1,
    recovered: 1,
    deceased: 1,
    critical: 1,
    tested: 1,
  };

  // If there is an empty cell, fall back to the previous row
  function pullLatestSumAndDiff(rowKey, totalKey) {
    let latest = {};
    let dayBefore = {};
    let twoDaysBefore = {};
    if (daily.length > 2) {
      twoDaysBefore = daily[daily.length - 3];
    }
    if (daily.length > 1) {
      dayBefore = daily[daily.length - 2];
    }
    if (daily.length > 0) {
      latest = daily[daily.length - 1];
    }

    if (latest && dayBefore && latest[rowKey] && dayBefore[rowKey]) {
      totals[totalKey] = latest[rowKey];
      totalsDiff[totalKey] = latest[rowKey] - dayBefore[rowKey];
    }

    if (totalsDiff[totalKey] <= 0 && twoDaysBefore && twoDaysBefore[rowKey]) {
      totalsDiff[totalKey] = latest[rowKey] - twoDaysBefore[rowKey];
    }
  }

  pullLatestSumAndDiff("testedCumulative", "tested");
  pullLatestSumAndDiff("criticalCumulative", "critical");
  pullLatestSumAndDiff("confirmedCumulative", "confirmed");
  pullLatestSumAndDiff("recoveredCumulative", "recovered");
  pullLatestSumAndDiff("deceasedCumulative", "deceased");

  return [totals, totalsDiff];
}

function drawMap() {
  // Initialize Map

  map = new mapboxgl.Map({
    container: "map-container",
    style: "mapbox://styles/mapbox/light-v10",
    zoom: 4,
    minZoom: 3.5,
    maxZoom: 7,
    center: {
      lng: 139.11792973051274,
      lat: 38.52245616545571,
    },
    maxBounds: [
      { lat: 12.118318014416644, lng: 100.01240618330542 }, // SW
      { lat: 59.34721256263214, lng: 175.3273570446982 }, // NE
    ],
  });

  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();
  map.scrollZoom.disable();
  map.addControl(
    new mapboxgl.NavigationControl({
      showCompass: false,
      showZoom: true,
    })
  );
}

function drawTrendChart(sheetTrend) {
  var cols = {
    Date: ["Date"],
    Confirmed: ["Confirmed"],
    Active: ["Active"],
    Critical: ["Critical"],
    Deceased: ["Deceased"],
    Recovered: ["Recovered"],
    Tested: ["Tested"],
  };

  for (var i = 0; i < sheetTrend.length; i++) {
    var row = sheetTrend[i];

    if (i === 0) {
      // Skip early feb data point
      continue;
    }

    cols.Date.push(row.date);
    cols.Confirmed.push(row.confirmedCumulative);
    cols.Critical.push(row.criticalCumulative);
    cols.Deceased.push(row.deceasedCumulative);
    cols.Recovered.push(row.recoveredCumulative);
    cols.Active.push(
      row.confirmedCumulative - row.deceasedCumulative - row.recoveredCumulative
    );
    cols.Tested.push(row.testedCumulative);
  }

  var chart = c3.generate({
    bindto: "#trend-chart",
    data: {
      x: "Date",
      color: function (color, d) {
        if (d && d.index === cols.Date.length - 2) {
          let newColor = d3.color(color);
          newColor.opacity = 0.6;
          return newColor;
        } else {
          return color;
        }
      },
      columns: [
        cols.Date,
        cols.Confirmed,
        cols.Active,
        cols.Recovered,
        cols.Deceased,
        //cols.Tested
      ],
      regions: {
        [cols.Confirmed[0]]: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
        ],
        [cols.Active[0]]: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
        ],
        [cols.Recovered[0]]: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
        ],
        [cols.Deceased[0]]: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
        ],
        //[cols.Tested[0]]: [{'start': cols.Date[cols.Date.length-2], 'style':'dashed'}],
      },
    },
    color: {
      pattern: [COLOR_CONFIRMED, COLOR_ACTIVE, COLOR_RECOVERED, COLOR_DECEASED],
    },
    point: {
      r: 3,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d",
          count: 6,
        },
      },
      y: {
        padding: {
          bottom: 0,
        },
        tick: {
          values: [
            0,
            100,
            500,
            1000,
            1500,
            2000,
            2500,
            3000,
            3500,
            4000,
            4500,
            5000,
          ],
        },
      },
    },
    tooltip: {
      format: {
        value: function (value, ratio, id, index) {
          if (index && cols[id][index]) {
            var diff = parseInt(value) - cols[id][index];
            return `${value} (${(diff >= 0 ? "+" : "") + diff}) ${
              index === cols.Date.length - 2 ? i18next.t("provisional") : ""
            }`;
          } else {
            return value;
          }
        },
      },
    },
    grid: {
      x: {
        show: true,
      },
      y: {
        show: true,
      },
    },
    padding: {
      right: 24,
    },
  });
}

function drawDailyIncreaseChart(sheetTrend) {
  var cols = {
    Date: ["Date"],
    Confirmed: ["New Cases"],
  };

  for (var i = 0; i < sheetTrend.length; i++) {
    var row = sheetTrend[i];

    if (i === 0) {
      // Skip early feb data point
      continue;
    }

    cols.Date.push(row.date);
    cols.Confirmed.push(row.confirmed);
  }

  var chart = c3.generate({
    bindto: "#daily-increase-chart",
    data: {
      color: function (color, d) {
        if (d && d.index === cols.Date.length - 2) {
          return COLOR_TESTED_DAILY;
        } else {
          return COLOR_TESTED;
        }
      },
      columns: [cols.Confirmed],
      type: "bar",
      regions: {
        [cols.Confirmed[0]]: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
        ],
      },
    },
    bar: {
      width: {
        ratio: 0.8,
      },
    },
    axis: {
      x: {
        tick: {
          format: function (x) {
            var months = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];

            // x+1 because the list is prefixed with the label
            var xDate = new Date(cols.Date[x + 1]);
            return months[xDate.getMonth()] + " " + xDate.getDate();
          },
        },
      },
      y: {
        tick: {
          values: [
            0,
            25,
            50,
            75,
            100,
            125,
            150,
            175,
            200,
            225,
            250,
            275,
            300,
            325,
            350,
            375,
            400,
          ],
        },
      },
    },
    tooltip: {
      format: {
        value: function (value, ratio, id, index) {
          return `${value} ${
            index === cols.Date.length - 2 ? i18next.t("provisional") : ""
          }`;
        },
      },
    },
    grid: {
      x: {
        show: true,
      },
      y: {
        show: true,
      },
    },
    legend: {
      hide: true,
    },
    padding: {
      right: 24,
    },
  });
}

function drawPrefectureTrend(elementId, seriesData, maxConfirmedIncrease) {
  let yMax = maxConfirmedIncrease;
  let prefectureMax = _.max(seriesData);
  if (prefectureMax / maxConfirmedIncrease < 0.1) {
    yMax = prefectureMax * 5; // artificially scale up low values to make it look ok.
  }

  const period = 30; // days
  let last30days = _.takeRight(seriesData, period);
  c3.generate({
    bindto: elementId,
    interaction: { enabled: false },
    data: {
      type: "bar",
      columns: [_.concat(["confirmed"], last30days)],
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
}

function drawPrefectureTrajectoryChart(prefectures) {
  const minimumConfirmed = 50;
  const filteredPrefectures = _.filter(prefectures, function (prefecture) {
    return prefecture.confirmed >= minimumConfirmed;
  });
  const trajectories = _.map(filteredPrefectures, function (prefecture) {
    const cumulativeConfirmed = _.reduce(
      prefecture.dailyConfirmedCount,
      function (result, value) {
        if (result.length > 0) {
          const sum = result[result.length - 1] + value;
          result.push(sum);
          return result;
        } else {
          return [value];
        }
      },
      []
    );
    const cumulativeConfirmedFromMinimum = _.filter(
      cumulativeConfirmed,
      function (value) {
        return value >= minimumConfirmed;
      }
    );
    return {
      name: prefecture.name,
      name_ja: prefecture.name_ja,
      confirmed: prefecture.confirmed,
      cumulativeConfirmed: cumulativeConfirmedFromMinimum,
    };
  });

  const columns = _.map(trajectories, function (prefecture) {
    return [prefecture.name].concat(prefecture.cumulativeConfirmed);
  });

  // Mapping of id (name) to the last index for each trajectory.
  const lastIndex = _.reduce(
    trajectories,
    function (result, value) {
      result[value.name] = value.cumulativeConfirmed.length - 1;
      return result;
    },
    {}
  );

  const regions = _.mapValues(lastIndex, function (value) {
    if (value > 0) {
      return [{ start: value - 1, end: value, style: "dashed" }];
    } else {
      return [];
    }
  });

  const maxDays = _.reduce(
    _.values(lastIndex),
    function (a, b) {
      return Math.max(a, b);
    },
    0
  );

  const nameMap = _.reduce(
    trajectories,
    function (result, value) {
      if (LANG === "en") {
        result[value.name] = value.name;
      } else {
        result[value.name] = value.name_ja;
      }
      return result;
    },
    {}
  );

  c3.generate({
    bindto: "#prefecture-trajectory",
    axis: {
      y: {
        min: minimumConfirmed,
        padding: {
          bottom: 0,
        },
      },
      x: {
        // Set max x value to be 2 greater to avoid label cutoff
        max: maxDays + 2,
        label: `Number of Days since ${minimumConfirmed}th case`,
      },
    },
    data: {
      columns: columns,
      labels: {
        format: function (v, id, i) {
          if (id) {
            if (i === lastIndex[id]) {
              return id;
            }
          }
        },
      },
      names: nameMap,
      color: function (color, d) {
        if (d && d.index && d.index === lastIndex[d.id]) {
          let newColor = d3.color(color);
          newColor.opacity = 0.6;
          return newColor;
        } else {
          return color;
        }
      },
      regions: regions,
    },
    grid: {
      x: {
        show: true,
      },
      y: {
        show: true,
      },
    },
    padding: {
      right: 24,
    },
  });
}

function drawPrefectureTable(prefectures, totals) {
  // Draw the Cases By Prefecture table
  let dataTable = document.querySelector("#prefectures-table");
  let dataTableFoot = document.querySelector("#prefectures-table tfoot");

  // Abort if dataTable or dataTableFoot is not accessible.
  if (!dataTable || !dataTableFoot) {
    console.error("Unable to find #prefecture-table");
    return;
  }

  // Remove any tbody elements (including the loading indicator).
  for (let tbody of document.querySelectorAll("#prefectures-table tbody")) {
    tbody.parentNode.removeChild(tbody);
  }

  let prefectureRows = document.createElement("tbody");
  prefectureRows.id = "prefecture-rows";
  dataTable.appendChild(prefectureRows);

  let portOfEntryRows = document.createElement("tbody");
  portOfEntryRows.id = "portofentry-rows";
  dataTable.appendChild(portOfEntryRows);

  let unspecifiedRows = document.createElement("tbody");
  unspecifiedRows.id = "unspecified-rows";
  dataTable.appendChild(unspecifiedRows);

  // Work out the largest daily increase
  let maxConfirmedIncrease = _.max(
    _.map(prefectures, (pref) => {
      return _.max(pref.dailyConfirmedCount);
    })
  );

  // Parse values so we can sort
  _.map(prefectures, function (pref) {
    pref.confirmed = pref.confirmed ? parseInt(pref.confirmed) : 0;
    pref.recovered = pref.recovered ? parseInt(pref.recovered) : 0;
    // TODO change to deceased
    pref.deceased = pref.deaths ? parseInt(pref.deaths) : 0;
  });

  // Iterate through and render table rows
  _.orderBy(prefectures, "confirmed", "desc").map(function (pref) {
    if (!pref.confirmed && !pref.recovered && !pref.deceased) {
      return;
    }

    let prefStr;
    if (LANG == "en") {
      prefStr = pref.name;
    } else {
      prefStr = pref.name_ja;
    }

    let increment =
      pref.dailyConfirmedCount[pref.dailyConfirmedCount.length - 1];
    let incrementString = "";
    if (increment > 0) {
      incrementString = `<span class='increment'>(+${increment})</span>`;
    }

    if (pref.name == "Unspecified") {
      unspecifiedRows.innerHTML = `<tr>
        <td class="prefecture">${prefStr}</td>
        <td class="trend"><div id="Unspecified-trend"></div></td>
        <td class="count">${pref.confirmed} ${incrementString}</td>
        <td class="count">${pref.recovered ? pref.recovered : ""}</td>
        <td class="count">${pref.deceased ? pref.deceased : ""}</td>
        </tr>`;
      drawPrefectureTrend(
        `#Unspecified-trend`,
        pref.dailyConfirmedCount,
        maxConfirmedIncrease
      );
    } else if (pref.name == "Port Quarantine" || pref.name == "Port of Entry") {
      // Override Port Quartantine name as "Port of Entry". The name in the spreadsheet is
      //  confusing.
      //
      // TODO(liquidx): move this hack into covid19japan-data.
      portOfEntryRows.innerHTML = `<tr>
        <td class="prefecture">${i18next.t("port-of-entry")}</td>
        <td class="trend"><div id="PortOfEntry-trend"></div></td>
        <td class="count">${pref.confirmed} ${incrementString}</td>
        <td class="count">${pref.recovered ? pref.recovered : ""}</td>
        <td class="count">${pref.deceased ? pref.deceased : ""}</td>
        </tr>`;
      drawPrefectureTrend(
        `#PortOfEntry-trend`,
        pref.dailyConfirmedCount,
        maxConfirmedIncrease
      );
    } else if (pref.name == "Total") {
      // Skip
    } else {
      let row = document.createElement("tr");
      prefectureRows.appendChild(row);
      row.innerHTML = `
        <td class="prefecture">${prefStr}</td>
        <td class="trend"><div id="${pref.name}-trend"></div></td>
        <td class="count">${pref.confirmed} ${incrementString}</td>
        <td class="count">${pref.recovered ? pref.recovered : ""}</td>
        <td class="count">${pref.deceased ? pref.deceased : ""}</td>
      `;
      drawPrefectureTrend(
        `#${pref.name}-trend`,
        pref.dailyConfirmedCount,
        maxConfirmedIncrease
      );
    }
    return true;
  });

  dataTableFoot.innerHTML = `<tr class='totals'>
        <td>${i18next.t("total")}</td>
        <td class="trend"></td>
        <td class="count">${totals.confirmed}</td>
        <td class="count">${totals.recovered}</td>
        <td class="count">${totals.deceased}</td>
        </tr>`;
}

function drawTravelRestrictions() {
  travelRestrictionsHelper(
    "#banned-entry",
    ddb.travelRestrictions.japan.banned
  );
  travelRestrictionsHelper(
    "#visa-required",
    ddb.travelRestrictions.japan.visaRequired
  );
  travelRestrictionsHelper(
    "#self-quarantine",
    ddb.travelRestrictions.japan.selfQuarantine
  );
  travelRestrictionsHelper(
    "#other-restrictions",
    ddb.travelRestrictions.japan.other
  );

  /*travelRestrictionsHelper('#foreign-banned-entry', ddb.travelRestrictions.foreignBorders.banned);
  travelRestrictionsHelper('#foreign-visa-required', ddb.travelRestrictions.foreignBorders.visaRequired);
  travelRestrictionsHelper('#foreign-self-quarantine', ddb.travelRestrictions.foreignBorders.selfQuarantine);
  travelRestrictionsHelper('#foreign-other-restrictions', ddb.travelRestrictions.foreignBorders.other);
  */
}

function travelRestrictionsHelper(elementId, countries) {
  let countryList = [];
  // Iterate through and render country links
  _.orderBy(countries, "name", "desc").map(function (country) {
    let name = i18next.t(`countries.${country.name}`);
    countryList.unshift(
      `<a href="${country.link}">${country.emoji}${name}</a>`
    );
    return true;
  });

  let banned = document.querySelector(elementId);
  if (banned) {
    banned.innerHTML = countryList.join(", ");
  }
}

function drawKpis(totals, totalsDiff) {
  // Draw the KPI values

  function setKpi(key, value) {
    document.querySelector("#kpi-" + key + " .value").innerHTML = value;
  }
  function setKpiDiff(key, value) {
    let diffDir = value >= 0 ? "+" : "";
    document.querySelector("#kpi-" + key + " .diff").innerHTML =
      "( " + diffDir + value + " )";
  }

  setKpi("confirmed", totals.confirmed);
  setKpiDiff("confirmed", totalsDiff.confirmed);
  setKpi("recovered", totals.recovered);
  setKpiDiff("recovered", totalsDiff.recovered);
  setKpi("deceased", totals.deceased);
  setKpiDiff("deceased", totalsDiff.deceased);
  setKpi("critical", totals.critical);
  setKpiDiff("critical", totalsDiff.critical);
  setKpi("tested", totals.tested);
  setKpiDiff("tested", totalsDiff.tested);
  setKpi("active", totals.confirmed - totals.recovered - totals.deceased);
  setKpiDiff(
    "active",
    totalsDiff.confirmed - totalsDiff.recovered - totalsDiff.deceased
  );
}

/**
 * @param {string} lastUpdated - MMM DD YYYY, HH:mm JST (e.g. Mar 29 2020, 15:53 JST)
 */
function drawLastUpdated(lastUpdated) {
  // Draw the last updated time

  const display = document.getElementById("last-updated");
  if (!display) {
    return;
  }

  // TODO we should be parsing the date, but I
  // don't trust the user input on the sheet
  const lastUpdatedMoment = moment(
    lastUpdated.slice(0, -4),
    "MMM DD YYYY, HH:mm"
  ).utcOffset(9, true); // JST offset
  if (!lastUpdatedMoment.isValid()) {
    // Fall back to raw value on failed parse
    display.textContent = lastUpdated;
    return;
  }
  const relativeTime = {
    en: lastUpdatedMoment.clone().locale("en").fromNow(),
    ja: lastUpdatedMoment.clone().locale("ja").fromNow(),
  };

  display.textContent = relativeTime[LANG];
  display.setAttribute("title", lastUpdated);
  display.setAttribute("data-en", relativeTime["en"]);
  display.setAttribute("data-ja", relativeTime["ja"]);
}

function drawPageTitleCount(confirmed) {
  // Update the number of confirmed cases in the title

  document.title = "(" + confirmed + ") " + PAGE_TITLE;
}

/**
 * drawMapPrefectures
 * @param {*} pageDraws - number of redraws to screen
 */
function drawMapPrefectures(pageDraws) {
  // Find the index of the first symbol layer
  // in the map style so we can draw the
  // prefecture colors behind it

  var firstSymbolId;
  var layers = map.getStyle().layers;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol") {
      firstSymbolId = layers[i].id;
      break;
    }
  }

  // Start the Mapbox search expression
  let prefecturePaint = ["match", ["get", "NAME_1"]];

  // Go through all prefectures looking for cases
  ddb.prefectures.map(function (prefecture) {
    let cases = parseInt(prefecture.confirmed);
    if (cases > 0) {
      prefecturePaint.push(prefecture.name);

      if (cases <= 50) {
        // 1-50 cases
        prefecturePaint.push("rgb(253,234,203)");
      } else if (cases <= 100) {
        // 51-100 cases
        prefecturePaint.push("rgb(251,155,127)");
      } else if (cases <= 200) {
        // 101-200 cases
        prefecturePaint.push("rgb(244,67,54)");
      } else {
        // 201+ cases
        prefecturePaint.push("rgb(186,0,13)");
      }
    }
  });

  // Add a final value to the list for the default color
  prefecturePaint.push("rgba(0,0,0,0)");

  if (pageDraws === 0) {
    // If it is the first time drawing the map

    map.addSource("prefectures", {
      type: "geojson",
      data: PREFECTURE_JSON_PATH,
    });

    // Add the prefecture color layer to the map
    map.addLayer(
      {
        id: "prefecture-layer",
        type: "fill",
        source: "prefectures",
        layout: {},
        paint: {
          "fill-color": prefecturePaint,
          "fill-opacity": 0.8,
        },
      },
      firstSymbolId
    );

    // Add another layer with type "line"
    // to provide a styled prefecture border
    let prefBorderLayer = map.addLayer(
      {
        id: "prefecture-outline-layer",
        type: "line",
        source: "prefectures",
        layout: {},
        paint: {
          "line-width": 0.5,
          "line-color": "#c0c0c0",
          "line-opacity": 0.5,
        },
      },
      firstSymbolId
    );
  } else {
    // Update prefecture paint properties

    map.setPaintProperty("prefecture-layer", "fill-color", prefecturePaint);
  }
}

// localize must be accessible globally
const localize = locI18next.init(i18next);
function initDataTranslate() {
  // load translation framework
  i18next
    .use(LanguageDetector)
    .init({
      fallbackLng: "en",
      resources: {
        en: {
          translation: translationEn,
        },
        ja: {
          translation: translationJa,
        },
      },
    })
    .then(() => {
      setLang(i18next.language);
    });

  // Language selector event handler
  document.querySelectorAll("[data-lang-picker]").forEach(function (pick) {
    pick.addEventListener("click", function (e) {
      e.preventDefault();
      setLang(e.target.dataset.langPicker);
    });
  });
}

function setLang(lng) {
  // set global var
  LANG = lng;

  // toggle picker
  toggleLangPicker();

  // set i18n framework lang
  i18next.changeLanguage(LANG).then(() => {
    localize("html");
    // Update the map
    map.getStyle().layers.forEach(function (thisLayer) {
      if (thisLayer.type == "symbol") {
        map.setLayoutProperty(thisLayer.id, "text-field", [
          "get",
          "name_" + LANG,
        ]);
      }
    });

    // Redraw all components that need rerendering to be localized the prefectures table
    if (!document.body.classList.contains("embed-mode")) {
      if (document.getElementById("prefectures-table")) {
        drawPrefectureTable(ddb.prefectures, ddb.totals);
      }

      if (document.getElementById("travel-restrictions")) {
        drawTravelRestrictions();
      }

      drawPrefectureTrajectoryChart(ddb.prefectures);
    }
  });
}

function toggleLangPicker() {
  // Toggle the lang picker
  document.querySelectorAll("a[data-lang-picker]").forEach(function (el) {
    el.style.display = "inline";
  });
  document.querySelector("a[data-lang-picker=" + LANG + "]").style.display =
    "none";
}

function loadDataOnPage() {
  loadData(function (data) {
    jsonData = data;

    ddb.prefectures = jsonData.prefectures;
    let newTotals = calculateTotals(jsonData.daily);
    ddb.totals = newTotals[0];
    ddb.totalsDiff = newTotals[1];
    ddb.trend = jsonData.daily;
    ddb.lastUpdated = jsonData.updated;

    drawKpis(ddb.totals, ddb.totalsDiff);
    if (!document.body.classList.contains("embed-mode")) {
      drawLastUpdated(ddb.lastUpdated);
      drawPageTitleCount(ddb.totals.confirmed);
      drawPrefectureTable(ddb.prefectures, ddb.totals);
      drawTravelRestrictions();
      drawTrendChart(ddb.trend);
      drawDailyIncreaseChart(ddb.trend);
      drawPrefectureTrajectoryChart(ddb.prefectures);
    }

    whenMapAndDataReady();
  });
}

var pageDraws = 0;
var styleLoaded = false;
var jsonData = undefined;
function whenMapAndDataReady() {
  // This runs drawMapPref only when
  // both style and json data are ready

  if (!styleLoaded || !jsonData) {
    return;
  }

  drawMapPrefectures(pageDraws);
}

window.onload = function () {
  // Enable tooltips
  tippy("[data-tippy-content]");

  initDataTranslate();
  drawMap();

  map.once("style.load", function (e) {
    styleLoaded = true;
    whenMapAndDataReady();
  });

  loadDataOnPage();

  // Reload data every INTERVAL
  const FIVE_MINUTES_IN_MS = 300000;
  setInterval(function () {
    pageDraws++;
    loadDataOnPage();
  }, FIVE_MINUTES_IN_MS);
};
