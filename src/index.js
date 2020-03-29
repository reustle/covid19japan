
// Injects required polyfills for IE11
import 'core-js/stable'
import 'whatwg-fetch'

// Add all non-polyfill deps below.
import _ from 'lodash'
import tippy from 'tippy.js'
import * as d3 from 'd3'
import * as c3 from 'c3'
import ApexCharts from 'apexcharts'

mapboxgl.accessToken = 'pk.eyJ1IjoicmV1c3RsZSIsImEiOiJjazZtaHE4ZnkwMG9iM3BxYnFmaDgxbzQ0In0.nOiHGcSCRNa9MD9WxLIm7g'
const PREFECTURE_JSON_PATH = 'static/prefectures.geojson'
const JSON_PATH = 'https://data.covid19japan.com/summary/latest.json'
const TIME_FORMAT = 'YYYY-MM-DD'
const COLOR_ACTIVE = 'rgb(223,14,31)'
const COLOR_CONFIRMED = 'rgb(244,67,54)'
const COLOR_RECOVERED = 'rgb(25,118,210)'
const COLOR_DECEASED = 'rgb(55,71,79)'
const COLOR_TESTED = 'rgb(164,173,192)'
const COLOR_TESTED_DAILY = 'rgb(209,214,223)'
const COLOR_INCREASE = 'rgb(163,172,191)'
const PAGE_TITLE = 'Coronavirus Disease (COVID-19) Japan Tracker'
let LANG = 'en'


// Global vars
let ddb = {
  prefectures: undefined,
  trend: undefined,
  totals: {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
    tested: 0,
    critical: 0
  },
  totalsDiff: {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
    tested: 0,
    critical: 0
  },
  travelRestrictions: {
    japan: {
      banned: [
        {
          name: 'Andorra',
          nameJa: 'アンドラ',
          emoji: '🇦🇩',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Austria',
          nameJa: 'オーストリア',
          emoji: '🇦🇹',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Belgium',
          nameJa: 'ベルギー',
          emoji: '🇧🇪',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'China',
          nameJa: '中国',
          emoji: '🇨🇳',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Estonia',
          nameJa: 'エストニア',
          emoji: '🇪🇪',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'France',
          nameJa: '仏国',
          emoji: '🇫🇷',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Germany',
          nameJa: '独国',
          emoji: '🇩🇪',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Iceland',
          nameJa: 'アイスランド',
          emoji: '🇮🇸',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Iran',
          nameJa: 'イラン',
          emoji: '🇮🇷',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Ireland',
          nameJa: 'アイルランド',
          emoji: '🇮🇪',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Italy',
          nameJa: '伊井',
          emoji: '🇮🇹',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Korea',
          nameJa: '大韓民国',
          emoji: '🇰🇷',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Liechtenstein',
          nameJa: 'リヒテンシュタイン',
          emoji: '🇱🇮',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Luxembourg',
          nameJa: 'ルクセンブルク',
          emoji: '🇱🇺',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Malta',
          nameJa: 'マルタ',
          emoji: '🇲🇹',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Monaco',
          nameJa: 'モナコ',
          emoji: '🇲🇨',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Netherlands',
          nameJa: 'オランダ',
          emoji: '🇳🇱',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Norway',
          nameJa: 'ノルウェー',
          emoji: '🇳🇴',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Portugal',
          nameJa: '葡萄牙',
          emoji: '🇵🇹',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'San Marino',
          nameJa: 'サンマリノ',
          emoji: '🇸🇲',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Slovenia',
          nameJa: 'スロベニア',
          emoji: '🇸🇮',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Spain',
          nameJa: 'スペイン',
          emoji: '🇪🇸',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Sweden',
          nameJa: 'スウェーデン',
          emoji: '🇸🇪',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Switzerland',
          nameJa: 'スイス',
          emoji: '🇨🇭',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Vatican',
          nameJa: 'バチカン市国',
          emoji: '🇻🇦',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        },
        {
          name: 'Westerdam (Cruise Ship)',
          nameJa: 'ウェスターダム（船）',
          emoji: '🛳',
          link: 'http://www.moj.go.jp/content/001316999.pdf'
        }
      ],
      visaRequired: [],
      selfQuarantine: [],
      other: []
    },
    foreignBorders: [
      {
        banned: [],
        visaRequired: [],
        selfQuarantine: [],
        other: []
      },
    ],
  }
}
let map = undefined



// IE11 forEach Polyfill
if ('NodeList' in window && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

// Returns true if this is a network error
function isNetworkError(err) {
  if (err && err.name && err.name == 'TypeError') {
    if (err.toString() == 'TypeError: Failed to fetch') {
      return true
    }
  }
  return false
}

// Fetches data from the JSON_PATH but applies an exponential
// backoff if there is an error.
function loadData(callback) {
  let delay = 2 * 1000 // 2 seconds

  const tryFetch = function(retryFn) {
    // Load the json data file
    fetch(JSON_PATH)
    .then(function(res){
      return res.json()
    })
    .then(function(data){
      callback(data)
    })
    .catch(function(err) {
      retryFn(delay, err)
      delay *= 2  // exponential backoff.

      // throwing the error again so it is logged in sentry/debuggable.
      if (!isNetworkError(err)) {
        throw err
      }
    })
  }

  const retryFetchWithDelay = function(delay, err) {
    console.log(err + ': retrying after ' + delay + 'ms.')
    setTimeout(function() { tryFetch(retryFetchWithDelay) }, delay)
  }

  tryFetch(retryFetchWithDelay)
}


function calculateTotals(daily) {
  // Calculate the totals

  let totals = {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
    critical: 0,
    tested: 0
  }
  let totalsDiff = {
    confirmed: 1,
    recovered: 1,
    deceased: 1,
    critical: 1,
    tested: 1
  }

  // If there is an empty cell, fall back to the previous row
  function pullLatestSumAndDiff(rowKey, totalKey) {
    let latest = {}
    let dayBefore = {}
    let twoDaysBefore = {}
    if (daily.length > 2) {
      twoDaysBefore = daily[daily.length - 3]
    }
    if (daily.length > 1) {
      dayBefore = daily[daily.length - 2]
    }
    if (daily.length > 0) {
      latest = daily[daily.length - 1]
    }

    if (latest && dayBefore && latest[rowKey] && dayBefore[rowKey]) {
      totals[totalKey] = latest[rowKey]
      totalsDiff[totalKey] = latest[rowKey] - dayBefore[rowKey]
    }

    if (totalsDiff[totalKey] <= 0 && twoDaysBefore && twoDaysBefore[rowKey]) {
      totalsDiff[totalKey] = latest[rowKey] - twoDaysBefore[rowKey]
    }
  }

  pullLatestSumAndDiff('testedCumulative', 'tested')
  pullLatestSumAndDiff('criticalCumulative', 'critical')
  pullLatestSumAndDiff('confirmedCumulative', 'confirmed')
  pullLatestSumAndDiff('recoveredCumulative', 'recovered')
  pullLatestSumAndDiff('deceasedCumulative', 'deceased')

  return [totals, totalsDiff]
}


function drawMap() {
  // Initialize Map

  map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/light-v10',
    zoom: 4,
    minZoom: 3.5,
    maxZoom: 7,
    center: {
      lng: 139.11792973051274,
      lat: 38.52245616545571
    },
    maxBounds: [
      {lat: 12.118318014416644, lng: 100.01240618330542}, // SW
      {lat: 59.34721256263214, lng: 175.3273570446982} // NE
    ]
  })

  map.dragRotate.disable()
  map.touchZoomRotate.disableRotation()
  map.scrollZoom.disable()
  map.addControl(new mapboxgl.NavigationControl({
    showCompass: false,
    showZoom: true
  }))
}

function getRGBColor(color) {
  return color.substring(4, color.length-1)
    .replace(/ /g, '')
    .split(',');
}


function drawTrendChart(sheetTrend) {

  var cols = {
    Date: ['Date'],
    Confirmed: ['Confirmed'],
    Active: ['Active'],
    Critical: ['Critical'],
    Deceased: ['Deceased'],
    Recovered: ['Recovered'],
    Tested: ['Tested'],
  }

  for(var i = 0; i < sheetTrend.length; i++) {
    var row = sheetTrend[i]

    if(i === 0){
      // Skip early feb data point
      continue
    }

    cols.Date.push(row.date)
    cols.Confirmed.push(row.confirmedCumulative)
    cols.Critical.push(row.criticalCumulative)
    cols.Deceased.push(row.deceasedCumulative)
    cols.Recovered.push(row.recoveredCumulative)
    cols.Active.push(row.confirmedCumulative - row.deceasedCumulative - row.recoveredCumulative)
    cols.Tested.push(row.testedCumulative)

  }

  var chart = c3.generate({
    bindto: '#trend-chart',
    data: {
        x: 'Date',
        color: function(color, d){ 
          if(d && d.index === cols.Date.length-2 ) {
            let rgb = getRGBColor(color)
            return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.6})`
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
          [cols.Confirmed[0]]: [{'start': cols.Date[cols.Date.length-2], 'style':'dashed'}],
          [cols.Active[0]]: [{'start': cols.Date[cols.Date.length-2], 'style':'dashed'}],
          [cols.Recovered[0]]: [{'start': cols.Date[cols.Date.length-2], 'style':'dashed'}],
          [cols.Deceased[0]]: [{'start': cols.Date[cols.Date.length-2], 'style':'dashed'}]
          //[cols.Tested[0]]: [{'start': cols.Date[cols.Date.length-2], 'style':'dashed'}],
        }
    },
    color: {
      pattern: [COLOR_CONFIRMED, COLOR_ACTIVE, COLOR_RECOVERED, COLOR_DECEASED]
    },
    point: {
      r: 3,
    },
    axis: {
        x: {
            type: 'timeseries',
            tick: {
              format: '%b %d',
              count: 6
            }
        },
        y: {
          padding: {
            bottom: 0
          },
          tick: {
            values: [0, 100, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]
          }
        }
    },
    tooltip: {
      format: {
        value: function (value, ratio, id, index) {
          if(index && cols[id][index]){
            var diff = parseInt(value) - cols[id][index]
            return `${value} (${(diff>=0?'+':'') + diff}) ${
              index === cols.Date.length-2 ? LANG === 'en' ? 'Provisional' : '暫定' : ''
            }`
          }else{
            return value
          }
        }
      }
    },
    grid: {
      x: {
        show: true
      },
      y: {
        show: true
      }
    },
    padding: {
      right: 24
    }
  })
}


function drawDailyIncreaseChart(sheetTrend) {

  var cols = {
    Date: ['Date'],
    Confirmed: ['New Cases'],
  }

  for(var i = 0; i < sheetTrend.length; i++) {
    var row = sheetTrend[i]

    if(i === 0){
      // Skip early feb data point
      continue
    }

    cols.Date.push(row.date)
    cols.Confirmed.push(row.confirmed)

  }

  var chart = c3.generate({
    bindto: '#daily-increase-chart',
    data: {
        color: function(color, d){ 
          if(d && d.index === cols.Date.length-2 ) {
            return COLOR_TESTED_DAILY;
          } else {
            return COLOR_TESTED;
          }
        },
        columns: [
          cols.Confirmed
        ],
        type: 'bar',
        regions: {
          [cols.Confirmed[0]]: [{'start': cols.Date[cols.Date.length-2], 'style':'dashed'}],
        }
    },
    bar: {
        width: {
            ratio: 0.8
        }
    },
    axis: {
      x: {
        tick: {
          format: function (x) {
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            // x+1 because the list is prefixed with the label
            var xDate = new Date(cols.Date[x+1])
            return months[xDate.getMonth()] + ' ' + xDate.getDate()
          }
        }
      },
      y: {
        tick: {
          values: [0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400]
        }
      }
    },
    tooltip: {
      format: {
        value: function (value, ratio, id, index) {
          return `${value} ${
            (index === cols.Date.length-2 ? LANG === 'en' ? 'Provisional' : '暫定' : '')
          }`
        }
      }
    },
    grid: {
      x: {
        show: true
      },
      y: {
        show: true
      }
    },
    legend: {
      hide: true
    },
    padding: {
      right: 24
    }
  })
}

function drawSparkLine(elementId, seriesData, maxConfirmedIncrease) {
  // Draw the sparkline (for last 30 days)
  let last30days = _.takeRight(seriesData, 30)
  var options = {
    series: [ { data: last30days }],
    chart: {
      type: 'bar',
      width: 200,
      height: 30,
      sparkline: { enabled: true },
      animations: { enabled: false },
    },
    colors: [ COLOR_CONFIRMED ],
    plotOptions: { bar: { columnWidth: '95%' } },
    xaxis: { crosshairs: { width: 1 } },
    yaxis: { max: maxConfirmedIncrease },
    tooltip: { 
      fixed: { enabled: false },
      x: { show: false },
      y: { title: { formatter: function (seriesName) { return '' } } },
      marker: { show: false }
    }
  };

  // Need an artificial delay for the html element to attach.
  setTimeout( function() { 
    var chart = new ApexCharts(document.querySelector(elementId), options);
    chart.render();
  }, 1000);
}

function drawPrefectureTrajectoryChart(prefectures) {
  const minimumConfirmed = 50;
  const filteredPrefectures = _.filter(prefectures, function(prefecture) {
    return prefecture.confirmed >= minimumConfirmed
  });
  const trajectories = _.map(filteredPrefectures, function(prefecture) {
    const cumulativeConfirmed = _.reduce(prefecture.dailyConfirmedCount, function(result, value) {
      if(result.length > 0) {
        const sum = result[result.length - 1] + value;
        result.push(sum);
        return result;
      } else {
        return [value];
      }
    }, []);
    const cumulativeConfirmedFromMinimum = _.filter(cumulativeConfirmed, function(value) {
      return value >= minimumConfirmed;
    });
    return {
      name: prefecture.name,
      name_ja: prefecture.name_ja,
      confirmed: prefecture.confirmed,
      cumulativeConfirmed: cumulativeConfirmedFromMinimum
    }
  })

  const columns = _.map(trajectories, function(prefecture) {
    return [prefecture.name].concat(prefecture.cumulativeConfirmed);
  });

  const labelPosition = _.reduce(trajectories, function(result, value) {
    // Show on second to last point to avoid cutoff
    result[value.name] = value.cumulativeConfirmed.length - 1;
    return result;
  }, {});

  const maxDays = _.reduce(_.values(labelPosition), function(a, b) {
    return Math.max(a, b);
  }, 0)

  const nameMap = _.reduce(trajectories, function(result, value) {
    if(LANG === 'en') {
      result[value.name] = value.name;
    } else {
      result[value.name] = value.name_ja;
    }
    return result;
  }, {});

  c3.generate({
    bindto: '#prefecture-trajectory',
    axis: {
      y: {
        min: minimumConfirmed,
        padding: {
          bottom: 0
        },
      },
      x: {
        // Set max x value to be 1 greater to avoid label cutoff
        max: maxDays + 1,
        label: `Number of Days since ${minimumConfirmed}th case`,
      }
    },
    data: {
      columns: columns,
      labels: {
        format: function(v, id, i) {
          if(id) {
            if(i === labelPosition[id]) {
              return id;
            }
          }
        }
      },
      names: nameMap
    },
    grid: {
      x: {
        show: true
      },
      y: {
        show: true
      }
    },
    padding: {
      right: 24
    }
  })
}


function drawPrefectureTable(prefectures, totals) {

  // Draw the Cases By Prefecture table
  let dataTable = document.querySelector('#prefectures-table tbody')
  let dataTableFoot = document.querySelector('#prefectures-table tfoot')
  let unspecifiedRow = ''
  let portOfEntryRow = ''

  // Remove the loading cell
  dataTable.innerHTML = ''

  // Work out the largest daily increase
  let maxConfirmedIncrease = _.max(_.map(prefectures, pref => { return _.max(pref.dailyConfirmedCount) }))

  // Parse values so we can sort
  _.map(prefectures, function(pref){
    pref.confirmed = (pref.confirmed?parseInt(pref.confirmed):0)
    pref.recovered = (pref.recovered?parseInt(pref.recovered):0)
    // TODO change to deceased
    pref.deceased = (pref.deaths?parseInt(pref.deaths):0)
  })

  // Iterate through and render table rows
  _.orderBy(prefectures, 'confirmed', 'desc').map(function(pref){
    if(!pref.confirmed && !pref.recovered && !pref.deceased){
      return
    }

    let prefStr
    if(LANG == 'en'){
      prefStr = pref.name
    }else{
      prefStr = pref.name_ja
    }

    let increment = pref.dailyConfirmedCount[pref.dailyConfirmedCount.length - 1]
    let incrementString = ''
    if (increment > 0) {
      incrementString = `<span class='increment'>(+${increment})</span>`
    }
    
    if (pref.name == 'Unspecified'){
      // Save the "Unspecified" row for the end of the table
      unspecifiedRow = `<td class="prefecture">${prefStr}</td>` +
        `<td class="sparkline"><div id="Unspecified-sparkline"></div></td>` +
        `<td class="count">${pref.confirmed} ${incrementString}</td>` +
        `<td class="count">${pref.recovered ? pref.recovered : 0}</td>` +
        `<td class="count">${pref.deceased ? pref.deceased : 0}</td>` +
        `</tr>`
        drawSparkLine(`#Unspecified-sparkline`, pref.dailyConfirmedCount, maxConfirmedIncrease)
    } else if (pref.name == 'Port Quarantine' || pref.name == 'Port of Entry') {
      portOfEntryRow = `<td class="prefecture" data-ja="空港検疫">Port of Entry</td>` +
        `<td class="sparkline"><div id="PortOfEntry-sparkline"></div></td>` +
        `<td class="count">${pref.confirmed} ${incrementString}</td>` +
        `<td class="count">${pref.recovered ? pref.recovered : 0}</td>` +
        `<td class="count">${pref.deceased ? pref.deceased : 0}</td>` +
        `</tr>`  
        drawSparkLine(`#PortOfEntry-sparkline`, pref.dailyConfirmedCount, maxConfirmedIncrease)
    } else if (pref.name == 'Total'){
      // Skip
    } else {
      dataTable.innerHTML += `<tr>` +
        `<td class="prefecture">${prefStr}</td>` +
        `<td class="sparkline"><div id="${pref.name}-sparkline"></div></td>` +
        `<td class="count">${pref.confirmed} ${incrementString}</td>` +
        `<td class="count">${pref.recovered ? pref.recovered : ''}</td>` +
        `<td class="count">${pref.deceased ? pref.deceased : ''}</td>` +
        `</tr>`
      drawSparkLine(`#${pref.name}-sparkline`, pref.dailyConfirmedCount, maxConfirmedIncrease)
    }
    return true
  })

  dataTable.innerHTML = dataTable.innerHTML + unspecifiedRow + portOfEntryRow

  let totalStr = 'Total'
  if(LANG == 'ja'){
    totalStr = '計'
  }

  dataTableFoot.innerHTML = `<tr class='totals'>` +
        `<td>${totalStr}</td>` +
        `<td class="sparkline"></td>` +
        `<td class="count">${totals.confirmed}</td>` +
        `<td class="count">${totals.recovered}</td>` +
        `<td class="count">${totals.deceased}</td>` +
        `</tr>`

  // draw sparklines.

}

function drawTravelRestrictions() {
  travelRestrictionsHelper('#banned-entry', ddb.travelRestrictions.japan.banned);
  travelRestrictionsHelper('#visa-required', ddb.travelRestrictions.japan.visaRequired);
  travelRestrictionsHelper('#self-quarantine', ddb.travelRestrictions.japan.selfQuarantine);
  travelRestrictionsHelper('#other-restrictions', ddb.travelRestrictions.japan.other);

  /*travelRestrictionsHelper('#foreign-banned-entry', ddb.travelRestrictions.foreignBorders.banned);
  travelRestrictionsHelper('#foreign-visa-required', ddb.travelRestrictions.foreignBorders.visaRequired);
  travelRestrictionsHelper('#foreign-self-quarantine', ddb.travelRestrictions.foreignBorders.selfQuarantine);
  travelRestrictionsHelper('#foreign-other-restrictions', ddb.travelRestrictions.foreignBorders.other);
  */
}

function travelRestrictionsHelper(elementId, countries) {
  let countryList = [];
  // Iterate through and render country links
  _.orderBy(countries, 'name', 'desc').map(function(country){
    let name = (LANG == 'en') ? country.name : country.nameJa;

    countryList.unshift(`<a href="${country.link}">${country.emoji}${name}</a>`);
    return true;
  })

  let banned = document.querySelector(elementId);
  banned.innerHTML = countryList.join(', ');
}

function drawKpis(totals, totalsDiff) {
  // Draw the KPI values

  function setKpi(key, value) {
    document.querySelector('#kpi-' + key + ' .value').innerHTML = value
  }
  function setKpiDiff(key, value) {
    let diffDir = (value >= 0?'+':'')
    document.querySelector('#kpi-' + key + ' .diff').innerHTML = '( ' + diffDir + value + ' )'
  }

  setKpi('confirmed', totals.confirmed)
  setKpiDiff('confirmed', totalsDiff.confirmed)
  setKpi('recovered', totals.recovered)
  setKpiDiff('recovered', totalsDiff.recovered)
  setKpi('deceased', totals.deceased)
  setKpiDiff('deceased', totalsDiff.deceased)
  setKpi('critical', totals.critical)
  setKpiDiff('critical', totalsDiff.critical)
  setKpi('tested', totals.tested)
  setKpiDiff('tested', totalsDiff.tested)
  setKpi('active', (totals.confirmed - totals.recovered) - totals.deceased)
  setKpiDiff('active', (totalsDiff.confirmed - totalsDiff.recovered) - totalsDiff.deceased)
}


function drawLastUpdated(lastUpdated) {
  // Draw the last updated time

  // TODO we should be parsing the date, but I
  // don't trust the user input on the sheet
  //let prettyUpdatedTime = moment(lastUpdated).format('MMM D, YYYY') + ' JST'
  document.getElementById('last-updated').innerHTML = lastUpdated
}


function drawPageTitleCount(confirmed) {
  // Update the number of confirmed cases in the title

  document.title = "(" + confirmed + ") " + PAGE_TITLE
}

/**
 * drawMapPrefectures
 * @param {*} pageDraws - number of redraws to screen
 */
function drawMapPrefectures(pageDraws) {
  // Find the index of the first symbol layer
  // in the map style so we can draw the
  // prefecture colors behind it

  var firstSymbolId
  var layers = map.getStyle().layers
  for(var i = 0; i < layers.length; i++) {
    if(layers[i].type === 'symbol') {
      firstSymbolId = layers[i].id
      break;
    }
  }

  // Start the Mapbox search expression
  let prefecturePaint = [
    'match',
    ['get', 'NAME_1'],
  ]

  // Go through all prefectures looking for cases
  ddb.prefectures.map(function(prefecture){

    let cases = parseInt(prefecture.confirmed)
    if(cases > 0){
      prefecturePaint.push(prefecture.name)

      if(cases <= 50){
        // 1-50 cases
        prefecturePaint.push('rgb(253,234,203)')
      }else if(cases <= 100){
        // 51-100 cases
        prefecturePaint.push('rgb(251,155,127)')
      }else if(cases <= 200){
        // 101-200 cases
        prefecturePaint.push('rgb(244,67,54)')
      }else{
        // 201+ cases
        prefecturePaint.push('rgb(186,0,13)')
      }
    }

  })

  // Add a final value to the list for the default color
  prefecturePaint.push('rgba(0,0,0,0)')


  if (pageDraws === 0) {
    // If it is the first time drawing the map

    map.addSource('prefectures', {
      type: 'geojson',
      data: PREFECTURE_JSON_PATH,
    })

    // Add the prefecture color layer to the map
    map.addLayer({
      'id': 'prefecture-layer',
      'type': 'fill',
      'source': 'prefectures',
      'layout': {},
      'paint': {
        'fill-color': prefecturePaint,
        'fill-opacity': 0.8
      }
    }, firstSymbolId)

    // Add another layer with type "line"
    // to provide a styled prefecture border
    let prefBorderLayer = map.addLayer({
      'id': 'prefecture-outline-layer',
      'type': 'line',
      'source': 'prefectures',
      'layout': {},
      'paint': {
        'line-width': 0.5,
        'line-color': '#c0c0c0',
        'line-opacity': 0.5
      }
    }, firstSymbolId)

  } else {
    // Update prefecture paint properties

    map.setPaintProperty('prefecture-layer', 'fill-color', prefecturePaint)

  }
}

function initDataTranslate() {
  // Handle language switching using data params

  const selector = '[data-ja]'
  const parseNode = function(cb) {
    document.querySelectorAll(selector).forEach(cb)
  }

  // Default website is in English. Extract it as the attr data-en="..."
  parseNode(function(el) {
    el.dataset['en'] = el.textContent
  })

  // Language selector event handler
  document.querySelectorAll('[data-lang-picker]').forEach(function(pick) {
    pick.addEventListener('click', function(e){
      e.preventDefault()
      LANG = e.target.dataset.langPicker

      // Toggle the html lang tags
      parseNode(function(el) {
        if (!el.dataset[LANG]) return;
        el.textContent = el.dataset[LANG]
      })

      // Update the map
      map.getStyle().layers.forEach(function(thisLayer){
        if(thisLayer.type == 'symbol'){
          map.setLayoutProperty(thisLayer.id, 'text-field', ['get','name_' + LANG])
        }
      })

      // Redraw the prefectures table
      if(document.getElementById('prefectures-table')){
        drawPrefectureTable(ddb.prefectures, ddb.totals)
      }

      if (document.getElementById('travel-restrictions')){
        drawTravelRestrictions();
      }

      // Toggle the lang picker
      document.querySelectorAll('a[data-lang-picker]').forEach(function(el){
        el.style.display = 'inline'
      })
      document.querySelector('a[data-lang-picker='+LANG+']').style.display = 'none'

    })
  })
}

function loadDataOnPage() {
  loadData(function(data) {
    jsonData = data

    ddb.prefectures = jsonData.prefectures
    let newTotals = calculateTotals(jsonData.daily)
    ddb.totals = newTotals[0]
    ddb.totalsDiff = newTotals[1]
    ddb.trend = jsonData.daily
    ddb.lastUpdated = jsonData.updated

    drawKpis(ddb.totals, ddb.totalsDiff)
    if (!document.body.classList.contains('embed-mode')) {
      drawLastUpdated(ddb.lastUpdated)
      drawPageTitleCount(ddb.totals.confirmed)
      drawPrefectureTable(ddb.prefectures, ddb.totals)
      drawTravelRestrictions()
      drawTrendChart(ddb.trend)
      drawDailyIncreaseChart(ddb.trend)
      drawPrefectureTrajectoryChart(ddb.prefectures);
    }

    whenMapAndDataReady()
  })
}

var pageDraws = 0
var styleLoaded = false
var jsonData = undefined
function whenMapAndDataReady(){
  // This runs drawMapPref only when
  // both style and json data are ready

  if(!styleLoaded || !jsonData){
    return
  }

  drawMapPrefectures(pageDraws)
}


window.onload = function(){

  // Enable tooltips
  tippy('[data-tippy-content]')

  initDataTranslate()
  drawMap()

  map.once('style.load', function(e) {
    styleLoaded = true
    whenMapAndDataReady()
  })

  loadDataOnPage()

  // Reload data every INTERVAL
  const FIVE_MINUTES_IN_MS = 300000
  setInterval(function() {
    pageDraws++
    loadDataOnPage()
  }, FIVE_MINUTES_IN_MS)
}
