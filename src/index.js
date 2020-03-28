
// Injects required polyfills for IE11
import 'core-js/stable'
import 'whatwg-fetch'

// Add all non-polyfill deps below.
import _ from 'lodash'
import Chart from 'chart.js'
import tippy from 'tippy.js'
import * as d3 from 'd3'
import * as c3 from 'c3'


mapboxgl.accessToken = 'pk.eyJ1IjoicmV1c3RsZSIsImEiOiJjazZtaHE4ZnkwMG9iM3BxYnFmaDgxbzQ0In0.nOiHGcSCRNa9MD9WxLIm7g'
const PREFECTURE_JSON_PATH = 'static/prefectures.geojson'
const JSON_PATH = 'https://data.covid19japan.com/summary/latest.json'
const TIME_FORMAT = 'YYYY-MM-DD'
const COLOR_ACTIVE = 'rgb(223,14,31)'
const COLOR_CONFIRMED = 'rgb(244,67,54)'
const COLOR_RECOVERED = 'rgb(25,118,210)'
const COLOR_DECEASED = 'rgb(55,71,79)'
const COLOR_TESTED = 'rgb(164,173,192)'
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
    japan: [
      {
        name: 'China',
        nameJa: '中国',
        regions: 'Hubei Province, Zhejiang Province',
      },
      {
        name: 'Iceland',
        nameJa: 'アイスランド',
        regions: 'the whole country',
      },
      {
        name: 'Iran',
        nameJa: 'イラン',
        regions: 'Gilan Province , Qom Province, Tehran Province, Alborz Province, Isfahan Province, Qazvin Province, Golestan Province, Semnan Province, Manzandaran Province, Markazi Province, Lorestan Province',
      },
      {
        name: 'Italy',
        nameJa: '伊井',
        regions: 'Veneto Region, Emilia-Romagna Region, Piedmont Region, Marche Region, Lombardy Region, Aosta Valley Region, Trentino-South Tyrol Region, Friuli-Venezia Giulia Region, Liguria Region',
      },
      {
        name: 'Korea',
        nameJa: '大韓民国',
        regions: 'Daegu-guangyeok-si, or Cheondo-gun, Gyeongsan-si, Andong-si, Yeongcheon-si, Chilgok-gun, Uiseong-gun, Seongju-gun, Gunwigun in Gyeongsangbuk-do',
      },
      {
        name: 'San Marino',
        nameJa: 'サンマリノ',
        regions: 'the whole country',
      },
      {
        name: 'Spain',
        nameJa: 'スペイン',
        regions: 'Chartered Community of Navarre, Basque Autonomous Community, Community of Madrid, La Rioja',
      },
      {
        name: 'Switzerland',
        nameJa: 'スイス',
        regions: 'Canton of Ticino, Canton of Basel-Stadt',
      },
    ],
    foreignBorders: [
      {
        name: 'Canada',
        nameJa: 'カナダ',
        noEntry: true,
        link: 'https://travel.gc.ca/travelling/advisories'
      },
      {
        name: 'USA',
        nameJa: '米国',
        noEntry: false,
        link: 'https://www.dhs.gov/'
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
        columns: [
          cols.Date,
          cols.Confirmed,
          cols.Active,
          cols.Recovered,
          cols.Deceased,
          //cols.Tested
        ]
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
            return value + ' (' + (diff>=0?'+':'') + diff + ')'
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
        color: function(color, d){ return COLOR_TESTED },
        columns: [
          cols.Confirmed
        ],
        type: 'bar'
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


function drawPrefectureTable(prefectures, totals) {

  // Draw the Cases By Prefecture table
  let dataTable = document.querySelector('#prefectures-table tbody')
  let dataTableFoot = document.querySelector('#prefectures-table tfoot')
  let unspecifiedRow = ''

  // Remove the loading cell
  dataTable.innerHTML = ''

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

    // TODO Make this pretty

    if(pref.name == 'Unspecified'){
      // Save the "Unspecified" row for the end of the table
      unspecifiedRow = "<tr><td><em>" + prefStr + "</em></td><td>" + pref.confirmed + "</td><td>" + (pref.recovered?pref.recovered:'') + "</td><td>" + pref.deaths + "</td></tr>"
    }else if (pref.name == 'Total'){
      // Skip
    }else{
      dataTable.innerHTML = dataTable.innerHTML + "<tr><td>" + prefStr + "</td><td>" + pref.confirmed + "</td><td>" + (pref.recovered?pref.recovered:'') + "</td><td>" + (pref.deceased?pref.deceased:'') + "</td></tr>"
    }
    return true
  })

  dataTable.innerHTML = dataTable.innerHTML + unspecifiedRow

  let totalStr = 'Total'
  if(LANG == 'ja'){
    totalStr = '計'
  }

  dataTableFoot.innerHTML = "<tr class='totals'><td>" + totalStr + "</td><td>" + totals.confirmed + "</td><td>" + totals.recovered + "</td><td>" + totals.deceased + "</td></tr>"
}

function drawJapaneseBorderTable(countries) {
  let dataTable = document.querySelector('#japan-border-table tbody')

  // Remove the loading cell
  dataTable.innerHTML = ''

  // Iterate through and render table rows
  _.orderBy(countries, 'name', 'desc').map(function(country){
    let name = (LANG == 'en') ? country.name : country.nameJa

    dataTable.innerHTML = dataTable.innerHTML + "<tr><td>" + name + "</td><td>" + country.regions + "</td></tr>"
    return true
  })
}

function drawForeignBordersTable(countries) {
  let dataTable = document.querySelector('#foreign-borders-table tbody')

  // Remove the loading cell
  dataTable.innerHTML = ''

  // Iterate through and render table rows
  _.orderBy(countries, 'name', 'desc').map(function(country){
    let name = (LANG == 'en') ? country.name : country.nameJa

    dataTable.innerHTML = dataTable.innerHTML + "<tr><td>" + name + "</td><td>" + (country.noEntry ? "✓" : "") +
    `</td><td><a href="${country.link}">` + country.link + "</a></td></tr>"
    return true
  })
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

      // Redraw the foreign borders restriction table
      if(document.getElementById('foreign-borders-table')){
        drawForeignBordersTable(ddb.travelRestrictions.foreignBorders)
      }

      // Redraw the japan borders restriction table
      if(document.getElementById('japan-borders-table')){
        drawJapaneseBorderTable(ddb.travelRestrictions.japan)
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
      drawJapaneseBorderTable(ddb.travelRestrictions.japan)
      drawForeignBordersTable(ddb.travelRestrictions.foreignBorders)
      drawTrendChart(ddb.trend)
      drawDailyIncreaseChart(ddb.trend)
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
