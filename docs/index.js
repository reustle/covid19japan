/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

mapboxgl.accessToken = 'pk.eyJ1IjoicmV1c3RsZSIsImEiOiJjazZtaHE4ZnkwMG9iM3BxYnFmaDgxbzQ0In0.nOiHGcSCRNa9MD9WxLIm7g'
const PREFECTURE_JSON_PATH = 'static/prefectures.geojson'
const JSON_PATH = 'https://covid19japan.s3.ap-northeast-1.amazonaws.com/data.json'
const TIME_FORMAT = 'YYYY-MM-DD'
const COLOR_CONFIRMED = 'rgb(244,67,54)'
const COLOR_RECOVERED = 'rgb(25,118,210)'
const COLOR_DECEASED = 'rgb(55,71,79)'
const COLOR_INCREASE = 'rgb(163,172,191)'
const PAGE_TITLE = 'Coronavirus Disease (COVID-19) Japan Tracker'
let LANG = 'en'

const EMPTY_DATA = {
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
  }
}

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
  }
}
let map = undefined



// IE11 forEach Polyfill
if ('NodeList' in window && !NodeList.prototype.forEach) {
  console.info('polyfill for IE11');
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}



function loadData(callback) {
  // Load the json data file
  
  fetch(JSON_PATH)
  .then(function(res){
    return res.json()
  })
  .then(function(data){
    hideFetchErrorState()
    callback(data)
  })
  .catch(function(err) {
    drawFetchErrorState(err)
    drawKpis(EMPTY_DATA.totals, EMPTY_DATA.totalsDiff)
  })
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
  function pullLatestSumAndDiff(key) {
    if(daily[daily.length-1][key].length){
      totals[key] = parseInt(daily[daily.length-1][key])
      totalsDiff[key] = totals[key] - parseInt(daily[daily.length-2][key])
    }else{
      totals[key] = parseInt(daily[daily.length-2][key])
      totalsDiff[key] = totals[key] - parseInt(daily[daily.length-3][key])
    }
  }

  pullLatestSumAndDiff('tested')
  pullLatestSumAndDiff('critical')
  pullLatestSumAndDiff('confirmed')
  pullLatestSumAndDiff('recovered')
  pullLatestSumAndDiff('deceased')

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

  let lastUpdated = ''
  let labelSet = []
  let confirmedSet = []
  let recoveredSet = []
  let deceasedSet = []
  let dailyIncreaseSet = []

  let prevConfirmed = -1
  sheetTrend.map(function(trendData){
    labelSet.push(new Date(trendData.date))
    confirmedSet.push({
      x: new Date(trendData.date),
      y: parseInt(trendData.confirmed)
    })
    recoveredSet.push({
      x: new Date(trendData.date),
      y: parseInt(trendData.recovered)
    })
    deceasedSet.push({
      x: new Date(trendData.date),
      y: parseInt(trendData.deceased)
    })
    dailyIncreaseSet.push({
      x: new Date(trendData.date),
      y: prevConfirmed === -1 ? 0 : parseInt(trendData.confirmed) - prevConfirmed
    })

    prevConfirmed = parseInt(trendData.confirmed)
    lastUpdated = trendData.date
  })

  var ctx = document.getElementById('trend-chart').getContext('2d')
  Chart.defaults.global.defaultFontFamily = "'Open Sans', helvetica, sans-serif"
  Chart.defaults.global.defaultFontSize = 16
  Chart.defaults.global.defaultFontColor = 'rgb(0,10,18)'

  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labelSet,
      datasets: [
        {
          label: 'Deceased',
          borderColor: COLOR_DECEASED,
          backgroundColor: COLOR_DECEASED,
          fill: false,
          data: deceasedSet
        },
        {
          label: 'Recovered',
          borderColor: COLOR_RECOVERED,
          backgroundColor: COLOR_RECOVERED,
          fill: false,
          data: recoveredSet
        },
        {
          label: 'Confirmed',
          borderColor: COLOR_CONFIRMED,
          backgroundColor: COLOR_CONFIRMED,
          fill: false,
          data: confirmedSet
        },
        {
          label: 'Daily Increase',
          borderColor: COLOR_INCREASE,
          backgroundColor: COLOR_INCREASE,
          fill: false,
          data: dailyIncreaseSet
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      elements: {
        line: {
          tension: 0.1
        }
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            parser: TIME_FORMAT,
            round: 'day',
            tooltipFormat: 'll'
          },
          scaleLabel: {
            display: true,
            labelString: 'Date'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Cases'
          }
        }]
      }
    }
  });
}


function drawPrefectureTable(prefectures, totals) {
  // Draw the Cases By Prefecture table

  let dataTable = document.querySelector('#prefectures-table tbody')
  let unspecifiedRow = ''

  // Remove the loading cell
  dataTable.innerHTML = ''

  // Parse values so we can sort
  _.map(prefectures, function(pref){
    // TODO change to confirmed
    pref.confirmed = (pref.cases?parseInt(pref.cases):0)
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
        prefStr = pref.prefecture
    }else{
      prefStr = pref.prefectureja
    }
    
    // TODO Make this pretty
    
    if(pref.prefecture == 'Unspecified'){
      // Save the "Unspecified" row for the end of the table
      unspecifiedRow = "<tr><td><em>" + prefStr + "</em></td><td>" + pref.confirmed + "</td><td>" + pref.recovered + "</td><td>" + pref.deaths + "</td></tr>"
    }else if (pref.prefecture == 'Total'){
      // Skip
    }else{
      dataTable.innerHTML = dataTable.innerHTML + "<tr><td>" + prefStr + "</td><td>" + pref.confirmed + "</td><td></td><td>" + (pref.deceased?pref.deceased:'') + "</td></tr>"
    }
    return true
  })

  dataTable.innerHTML = dataTable.innerHTML + unspecifiedRow

  let totalStr = 'Total'
  if(LANG == 'ja'){
    totalStr = '計'
  }

  dataTable.innerHTML = dataTable.innerHTML + "<tr class='totals'><td>" + totalStr + "</td><td>" + totals.confirmed + "</td><td>" + totals.recovered + "</td><td>" + totals.deceased + "</td></tr>"
}

function drawFetchErrorState(error) {
  document.body.classList.add('error');

  let errorMessage = document.querySelector('#error-message')
  if (errorMessage) {
    errorMessage.innerHTML = 'Unable to get data.'
  }

  let retry = document.querySelector('#retry-button')
  if (retry) {
    retry.onclick = loadDataOnPage
  }

  let kpi = document.querySelector('#error-retry')
  if (kpi) {
    kpi.classList.add('error')
  }
}

function hideFetchErrorState() {
  let kpi = document.querySelector('#error-retry')
  if (kpi) {
    kpi.classList.remove('error')
  }
  document.body.classList.remove('error');

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
    
    let cases = parseInt(prefecture.cases)
    if(cases > 0){
      prefecturePaint.push(prefecture.prefecture)
      
      if(cases <= 10){
        // 1-10 cases
        prefecturePaint.push('rgb(253,234,203)')
      }else if(cases <= 25){
        // 11-25 cases
        prefecturePaint.push('rgb(251,155,127)')
      }else if(cases <= 50){
        // 26-50 cases
        prefecturePaint.push('rgb(244,67,54)')
      }else{
        // 51+ cases
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
    ddb.lastUpdated = jsonData.updated[0].lastupdated

    drawKpis(ddb.totals, ddb.totalsDiff)
    if (!document.body.classList.contains('embed-mode')) {
      drawLastUpdated(ddb.lastUpdated)
      drawPageTitleCount(ddb.totals.confirmed)
      drawPrefectureTable(ddb.prefectures, ddb.totals)
      drawTrendChart(ddb.trend)
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

/***/ }),

/***/ "./src/index.scss":
/*!************************!*\
  !*** ./src/index.scss ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ 0:
/*!*********************************************!*\
  !*** multi ./src/index.js ./src/index.scss ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ./src/index.js */"./src/index.js");
module.exports = __webpack_require__(/*! ./src/index.scss */"./src/index.scss");


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9pbmRleC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsaUJBQWlCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBOzs7O0FBSUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLE9BQU8saURBQWlEO0FBQ3hELE9BQU8sK0NBQStDO0FBQ3REO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLEVBQUU7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxnQkFBZ0IsbUJBQW1CO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEdBQUc7O0FBRUg7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTCxHQUFHO0FBQ0g7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7O0FBR0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxDOzs7Ozs7Ozs7OztBQzFrQkEsdUMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9cIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuIiwibWFwYm94Z2wuYWNjZXNzVG9rZW4gPSAncGsuZXlKMUlqb2ljbVYxYzNSc1pTSXNJbUVpT2lKamF6WnRhSEU0Wm5rd01HOWlNM0J4WW5GbWFEZ3hielEwSW4wLm5PaUhHY1NDUk5hOU1EOVd4TEltN2cnXG5jb25zdCBQUkVGRUNUVVJFX0pTT05fUEFUSCA9ICdzdGF0aWMvcHJlZmVjdHVyZXMuZ2VvanNvbidcbmNvbnN0IEpTT05fUEFUSCA9ICdodHRwczovL2NvdmlkMTlqYXBhbi5zMy5hcC1ub3J0aGVhc3QtMS5hbWF6b25hd3MuY29tL2RhdGEuanNvbidcbmNvbnN0IFRJTUVfRk9STUFUID0gJ1lZWVktTU0tREQnXG5jb25zdCBDT0xPUl9DT05GSVJNRUQgPSAncmdiKDI0NCw2Nyw1NCknXG5jb25zdCBDT0xPUl9SRUNPVkVSRUQgPSAncmdiKDI1LDExOCwyMTApJ1xuY29uc3QgQ09MT1JfREVDRUFTRUQgPSAncmdiKDU1LDcxLDc5KSdcbmNvbnN0IENPTE9SX0lOQ1JFQVNFID0gJ3JnYigxNjMsMTcyLDE5MSknXG5jb25zdCBQQUdFX1RJVExFID0gJ0Nvcm9uYXZpcnVzIERpc2Vhc2UgKENPVklELTE5KSBKYXBhbiBUcmFja2VyJ1xubGV0IExBTkcgPSAnZW4nXG5cbmNvbnN0IEVNUFRZX0RBVEEgPSB7XG4gIHRvdGFsczoge1xuICAgIGNvbmZpcm1lZDogMCxcbiAgICByZWNvdmVyZWQ6IDAsXG4gICAgZGVjZWFzZWQ6IDAsXG4gICAgdGVzdGVkOiAwLFxuICAgIGNyaXRpY2FsOiAwXG4gIH0sXG4gIHRvdGFsc0RpZmY6IHtcbiAgICBjb25maXJtZWQ6IDAsXG4gICAgcmVjb3ZlcmVkOiAwLFxuICAgIGRlY2Vhc2VkOiAwLFxuICAgIHRlc3RlZDogMCxcbiAgICBjcml0aWNhbDogMFxuICB9XG59XG5cbi8vIEdsb2JhbCB2YXJzXG5sZXQgZGRiID0ge1xuICBwcmVmZWN0dXJlczogdW5kZWZpbmVkLFxuICB0cmVuZDogdW5kZWZpbmVkLFxuICB0b3RhbHM6IHtcbiAgICBjb25maXJtZWQ6IDAsXG4gICAgcmVjb3ZlcmVkOiAwLFxuICAgIGRlY2Vhc2VkOiAwLFxuICAgIHRlc3RlZDogMCxcbiAgICBjcml0aWNhbDogMFxuICB9LFxuICB0b3RhbHNEaWZmOiB7XG4gICAgY29uZmlybWVkOiAwLFxuICAgIHJlY292ZXJlZDogMCxcbiAgICBkZWNlYXNlZDogMCxcbiAgICB0ZXN0ZWQ6IDAsXG4gICAgY3JpdGljYWw6IDBcbiAgfVxufVxubGV0IG1hcCA9IHVuZGVmaW5lZFxuXG5cblxuLy8gSUUxMSBmb3JFYWNoIFBvbHlmaWxsXG5pZiAoJ05vZGVMaXN0JyBpbiB3aW5kb3cgJiYgIU5vZGVMaXN0LnByb3RvdHlwZS5mb3JFYWNoKSB7XG4gIGNvbnNvbGUuaW5mbygncG9seWZpbGwgZm9yIElFMTEnKTtcbiAgTm9kZUxpc3QucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICB0aGlzQXJnID0gdGhpc0FyZyB8fCB3aW5kb3c7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHRoaXNbaV0sIGksIHRoaXMpO1xuICAgIH1cbiAgfTtcbn1cblxuXG5cbmZ1bmN0aW9uIGxvYWREYXRhKGNhbGxiYWNrKSB7XG4gIC8vIExvYWQgdGhlIGpzb24gZGF0YSBmaWxlXG4gIFxuICBmZXRjaChKU09OX1BBVEgpXG4gIC50aGVuKGZ1bmN0aW9uKHJlcyl7XG4gICAgcmV0dXJuIHJlcy5qc29uKClcbiAgfSlcbiAgLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgaGlkZUZldGNoRXJyb3JTdGF0ZSgpXG4gICAgY2FsbGJhY2soZGF0YSlcbiAgfSlcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgIGRyYXdGZXRjaEVycm9yU3RhdGUoZXJyKVxuICAgIGRyYXdLcGlzKEVNUFRZX0RBVEEudG90YWxzLCBFTVBUWV9EQVRBLnRvdGFsc0RpZmYpXG4gIH0pXG59XG5cblxuZnVuY3Rpb24gY2FsY3VsYXRlVG90YWxzKGRhaWx5KSB7XG4gIC8vIENhbGN1bGF0ZSB0aGUgdG90YWxzXG5cbiAgbGV0IHRvdGFscyA9IHtcbiAgICBjb25maXJtZWQ6IDAsXG4gICAgcmVjb3ZlcmVkOiAwLFxuICAgIGRlY2Vhc2VkOiAwLFxuICAgIGNyaXRpY2FsOiAwLFxuICAgIHRlc3RlZDogMFxuICB9XG4gIGxldCB0b3RhbHNEaWZmID0ge1xuICAgIGNvbmZpcm1lZDogMSxcbiAgICByZWNvdmVyZWQ6IDEsXG4gICAgZGVjZWFzZWQ6IDEsXG4gICAgY3JpdGljYWw6IDEsXG4gICAgdGVzdGVkOiAxXG4gIH1cblxuICAvLyBJZiB0aGVyZSBpcyBhbiBlbXB0eSBjZWxsLCBmYWxsIGJhY2sgdG8gdGhlIHByZXZpb3VzIHJvd1xuICBmdW5jdGlvbiBwdWxsTGF0ZXN0U3VtQW5kRGlmZihrZXkpIHtcbiAgICBpZihkYWlseVtkYWlseS5sZW5ndGgtMV1ba2V5XS5sZW5ndGgpe1xuICAgICAgdG90YWxzW2tleV0gPSBwYXJzZUludChkYWlseVtkYWlseS5sZW5ndGgtMV1ba2V5XSlcbiAgICAgIHRvdGFsc0RpZmZba2V5XSA9IHRvdGFsc1trZXldIC0gcGFyc2VJbnQoZGFpbHlbZGFpbHkubGVuZ3RoLTJdW2tleV0pXG4gICAgfWVsc2V7XG4gICAgICB0b3RhbHNba2V5XSA9IHBhcnNlSW50KGRhaWx5W2RhaWx5Lmxlbmd0aC0yXVtrZXldKVxuICAgICAgdG90YWxzRGlmZltrZXldID0gdG90YWxzW2tleV0gLSBwYXJzZUludChkYWlseVtkYWlseS5sZW5ndGgtM11ba2V5XSlcbiAgICB9XG4gIH1cblxuICBwdWxsTGF0ZXN0U3VtQW5kRGlmZigndGVzdGVkJylcbiAgcHVsbExhdGVzdFN1bUFuZERpZmYoJ2NyaXRpY2FsJylcbiAgcHVsbExhdGVzdFN1bUFuZERpZmYoJ2NvbmZpcm1lZCcpXG4gIHB1bGxMYXRlc3RTdW1BbmREaWZmKCdyZWNvdmVyZWQnKVxuICBwdWxsTGF0ZXN0U3VtQW5kRGlmZignZGVjZWFzZWQnKVxuXG4gIHJldHVybiBbdG90YWxzLCB0b3RhbHNEaWZmXVxufVxuXG5cbmZ1bmN0aW9uIGRyYXdNYXAoKSB7XG4gIC8vIEluaXRpYWxpemUgTWFwXG5cbiAgbWFwID0gbmV3IG1hcGJveGdsLk1hcCh7XG4gICAgY29udGFpbmVyOiAnbWFwLWNvbnRhaW5lcicsXG4gICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2xpZ2h0LXYxMCcsXG4gICAgem9vbTogNCxcbiAgICBtaW5ab29tOiAzLjUsXG4gICAgbWF4Wm9vbTogNyxcbiAgICBjZW50ZXI6IHtcbiAgICAgIGxuZzogMTM5LjExNzkyOTczMDUxMjc0LFxuICAgICAgbGF0OiAzOC41MjI0NTYxNjU0NTU3MVxuICAgIH0sXG4gICAgbWF4Qm91bmRzOiBbXG4gICAgICB7bGF0OiAxMi4xMTgzMTgwMTQ0MTY2NDQsIGxuZzogMTAwLjAxMjQwNjE4MzMwNTQyfSwgLy8gU1dcbiAgICAgIHtsYXQ6IDU5LjM0NzIxMjU2MjYzMjE0LCBsbmc6IDE3NS4zMjczNTcwNDQ2OTgyfSAvLyBORVxuICAgIF1cbiAgfSlcblxuICBtYXAuZHJhZ1JvdGF0ZS5kaXNhYmxlKClcbiAgbWFwLnRvdWNoWm9vbVJvdGF0ZS5kaXNhYmxlUm90YXRpb24oKVxuICBtYXAuc2Nyb2xsWm9vbS5kaXNhYmxlKClcbiAgbWFwLmFkZENvbnRyb2wobmV3IG1hcGJveGdsLk5hdmlnYXRpb25Db250cm9sKHtcbiAgICBzaG93Q29tcGFzczogZmFsc2UsXG4gICAgc2hvd1pvb206IHRydWVcbiAgfSkpXG59XG5cblxuZnVuY3Rpb24gZHJhd1RyZW5kQ2hhcnQoc2hlZXRUcmVuZCkge1xuXG4gIGxldCBsYXN0VXBkYXRlZCA9ICcnXG4gIGxldCBsYWJlbFNldCA9IFtdXG4gIGxldCBjb25maXJtZWRTZXQgPSBbXVxuICBsZXQgcmVjb3ZlcmVkU2V0ID0gW11cbiAgbGV0IGRlY2Vhc2VkU2V0ID0gW11cbiAgbGV0IGRhaWx5SW5jcmVhc2VTZXQgPSBbXVxuXG4gIGxldCBwcmV2Q29uZmlybWVkID0gLTFcbiAgc2hlZXRUcmVuZC5tYXAoZnVuY3Rpb24odHJlbmREYXRhKXtcbiAgICBsYWJlbFNldC5wdXNoKG5ldyBEYXRlKHRyZW5kRGF0YS5kYXRlKSlcbiAgICBjb25maXJtZWRTZXQucHVzaCh7XG4gICAgICB4OiBuZXcgRGF0ZSh0cmVuZERhdGEuZGF0ZSksXG4gICAgICB5OiBwYXJzZUludCh0cmVuZERhdGEuY29uZmlybWVkKVxuICAgIH0pXG4gICAgcmVjb3ZlcmVkU2V0LnB1c2goe1xuICAgICAgeDogbmV3IERhdGUodHJlbmREYXRhLmRhdGUpLFxuICAgICAgeTogcGFyc2VJbnQodHJlbmREYXRhLnJlY292ZXJlZClcbiAgICB9KVxuICAgIGRlY2Vhc2VkU2V0LnB1c2goe1xuICAgICAgeDogbmV3IERhdGUodHJlbmREYXRhLmRhdGUpLFxuICAgICAgeTogcGFyc2VJbnQodHJlbmREYXRhLmRlY2Vhc2VkKVxuICAgIH0pXG4gICAgZGFpbHlJbmNyZWFzZVNldC5wdXNoKHtcbiAgICAgIHg6IG5ldyBEYXRlKHRyZW5kRGF0YS5kYXRlKSxcbiAgICAgIHk6IHByZXZDb25maXJtZWQgPT09IC0xID8gMCA6IHBhcnNlSW50KHRyZW5kRGF0YS5jb25maXJtZWQpIC0gcHJldkNvbmZpcm1lZFxuICAgIH0pXG5cbiAgICBwcmV2Q29uZmlybWVkID0gcGFyc2VJbnQodHJlbmREYXRhLmNvbmZpcm1lZClcbiAgICBsYXN0VXBkYXRlZCA9IHRyZW5kRGF0YS5kYXRlXG4gIH0pXG5cbiAgdmFyIGN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0cmVuZC1jaGFydCcpLmdldENvbnRleHQoJzJkJylcbiAgQ2hhcnQuZGVmYXVsdHMuZ2xvYmFsLmRlZmF1bHRGb250RmFtaWx5ID0gXCInT3BlbiBTYW5zJywgaGVsdmV0aWNhLCBzYW5zLXNlcmlmXCJcbiAgQ2hhcnQuZGVmYXVsdHMuZ2xvYmFsLmRlZmF1bHRGb250U2l6ZSA9IDE2XG4gIENoYXJ0LmRlZmF1bHRzLmdsb2JhbC5kZWZhdWx0Rm9udENvbG9yID0gJ3JnYigwLDEwLDE4KSdcblxuICB2YXIgY2hhcnQgPSBuZXcgQ2hhcnQoY3R4LCB7XG4gICAgdHlwZTogJ2xpbmUnLFxuICAgIGRhdGE6IHtcbiAgICAgIGxhYmVsczogbGFiZWxTZXQsXG4gICAgICBkYXRhc2V0czogW1xuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdEZWNlYXNlZCcsXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IENPTE9SX0RFQ0VBU0VELFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ09MT1JfREVDRUFTRUQsXG4gICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgZGF0YTogZGVjZWFzZWRTZXRcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnUmVjb3ZlcmVkJyxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQ09MT1JfUkVDT1ZFUkVELFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ09MT1JfUkVDT1ZFUkVELFxuICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgIGRhdGE6IHJlY292ZXJlZFNldFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdDb25maXJtZWQnLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDT0xPUl9DT05GSVJNRUQsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDT0xPUl9DT05GSVJNRUQsXG4gICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgZGF0YTogY29uZmlybWVkU2V0XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0RhaWx5IEluY3JlYXNlJyxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQ09MT1JfSU5DUkVBU0UsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDT0xPUl9JTkNSRUFTRSxcbiAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICBkYXRhOiBkYWlseUluY3JlYXNlU2V0XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxuICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcbiAgICAgIGVsZW1lbnRzOiB7XG4gICAgICAgIGxpbmU6IHtcbiAgICAgICAgICB0ZW5zaW9uOiAwLjFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGxlZ2VuZDoge1xuICAgICAgICBkaXNwbGF5OiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBzY2FsZXM6IHtcbiAgICAgICAgeEF4ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ3RpbWUnLFxuICAgICAgICAgIHRpbWU6IHtcbiAgICAgICAgICAgIHBhcnNlcjogVElNRV9GT1JNQVQsXG4gICAgICAgICAgICByb3VuZDogJ2RheScsXG4gICAgICAgICAgICB0b29sdGlwRm9ybWF0OiAnbGwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzY2FsZUxhYmVsOiB7XG4gICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWxTdHJpbmc6ICdEYXRlJ1xuICAgICAgICAgIH1cbiAgICAgICAgfV0sXG4gICAgICAgIHlBeGVzOiBbe1xuICAgICAgICAgIHNjYWxlTGFiZWw6IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICBsYWJlbFN0cmluZzogJ0Nhc2VzJ1xuICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5cbmZ1bmN0aW9uIGRyYXdQcmVmZWN0dXJlVGFibGUocHJlZmVjdHVyZXMsIHRvdGFscykge1xuICAvLyBEcmF3IHRoZSBDYXNlcyBCeSBQcmVmZWN0dXJlIHRhYmxlXG5cbiAgbGV0IGRhdGFUYWJsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwcmVmZWN0dXJlcy10YWJsZSB0Ym9keScpXG4gIGxldCB1bnNwZWNpZmllZFJvdyA9ICcnXG5cbiAgLy8gUmVtb3ZlIHRoZSBsb2FkaW5nIGNlbGxcbiAgZGF0YVRhYmxlLmlubmVySFRNTCA9ICcnXG5cbiAgLy8gUGFyc2UgdmFsdWVzIHNvIHdlIGNhbiBzb3J0XG4gIF8ubWFwKHByZWZlY3R1cmVzLCBmdW5jdGlvbihwcmVmKXtcbiAgICAvLyBUT0RPIGNoYW5nZSB0byBjb25maXJtZWRcbiAgICBwcmVmLmNvbmZpcm1lZCA9IChwcmVmLmNhc2VzP3BhcnNlSW50KHByZWYuY2FzZXMpOjApXG4gICAgcHJlZi5yZWNvdmVyZWQgPSAocHJlZi5yZWNvdmVyZWQ/cGFyc2VJbnQocHJlZi5yZWNvdmVyZWQpOjApXG4gICAgLy8gVE9ETyBjaGFuZ2UgdG8gZGVjZWFzZWRcbiAgICBwcmVmLmRlY2Vhc2VkID0gKHByZWYuZGVhdGhzP3BhcnNlSW50KHByZWYuZGVhdGhzKTowKVxuICB9KVxuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCBhbmQgcmVuZGVyIHRhYmxlIHJvd3NcbiAgXy5vcmRlckJ5KHByZWZlY3R1cmVzLCAnY29uZmlybWVkJywgJ2Rlc2MnKS5tYXAoZnVuY3Rpb24ocHJlZil7XG4gICAgaWYoIXByZWYuY29uZmlybWVkICYmICFwcmVmLnJlY292ZXJlZCAmJiAhcHJlZi5kZWNlYXNlZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgXG4gICAgbGV0IHByZWZTdHJcbiAgICBpZihMQU5HID09ICdlbicpe1xuICAgICAgICBwcmVmU3RyID0gcHJlZi5wcmVmZWN0dXJlXG4gICAgfWVsc2V7XG4gICAgICBwcmVmU3RyID0gcHJlZi5wcmVmZWN0dXJlamFcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ETyBNYWtlIHRoaXMgcHJldHR5XG4gICAgXG4gICAgaWYocHJlZi5wcmVmZWN0dXJlID09ICdVbnNwZWNpZmllZCcpe1xuICAgICAgLy8gU2F2ZSB0aGUgXCJVbnNwZWNpZmllZFwiIHJvdyBmb3IgdGhlIGVuZCBvZiB0aGUgdGFibGVcbiAgICAgIHVuc3BlY2lmaWVkUm93ID0gXCI8dHI+PHRkPjxlbT5cIiArIHByZWZTdHIgKyBcIjwvZW0+PC90ZD48dGQ+XCIgKyBwcmVmLmNvbmZpcm1lZCArIFwiPC90ZD48dGQ+XCIgKyBwcmVmLnJlY292ZXJlZCArIFwiPC90ZD48dGQ+XCIgKyBwcmVmLmRlYXRocyArIFwiPC90ZD48L3RyPlwiXG4gICAgfWVsc2UgaWYgKHByZWYucHJlZmVjdHVyZSA9PSAnVG90YWwnKXtcbiAgICAgIC8vIFNraXBcbiAgICB9ZWxzZXtcbiAgICAgIGRhdGFUYWJsZS5pbm5lckhUTUwgPSBkYXRhVGFibGUuaW5uZXJIVE1MICsgXCI8dHI+PHRkPlwiICsgcHJlZlN0ciArIFwiPC90ZD48dGQ+XCIgKyBwcmVmLmNvbmZpcm1lZCArIFwiPC90ZD48dGQ+PC90ZD48dGQ+XCIgKyAocHJlZi5kZWNlYXNlZD9wcmVmLmRlY2Vhc2VkOicnKSArIFwiPC90ZD48L3RyPlwiXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH0pXG5cbiAgZGF0YVRhYmxlLmlubmVySFRNTCA9IGRhdGFUYWJsZS5pbm5lckhUTUwgKyB1bnNwZWNpZmllZFJvd1xuXG4gIGxldCB0b3RhbFN0ciA9ICdUb3RhbCdcbiAgaWYoTEFORyA9PSAnamEnKXtcbiAgICB0b3RhbFN0ciA9ICfoqIgnXG4gIH1cblxuICBkYXRhVGFibGUuaW5uZXJIVE1MID0gZGF0YVRhYmxlLmlubmVySFRNTCArIFwiPHRyIGNsYXNzPSd0b3RhbHMnPjx0ZD5cIiArIHRvdGFsU3RyICsgXCI8L3RkPjx0ZD5cIiArIHRvdGFscy5jb25maXJtZWQgKyBcIjwvdGQ+PHRkPlwiICsgdG90YWxzLnJlY292ZXJlZCArIFwiPC90ZD48dGQ+XCIgKyB0b3RhbHMuZGVjZWFzZWQgKyBcIjwvdGQ+PC90cj5cIlxufVxuXG5mdW5jdGlvbiBkcmF3RmV0Y2hFcnJvclN0YXRlKGVycm9yKSB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnZXJyb3InKTtcblxuICBsZXQgZXJyb3JNZXNzYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Vycm9yLW1lc3NhZ2UnKVxuICBpZiAoZXJyb3JNZXNzYWdlKSB7XG4gICAgZXJyb3JNZXNzYWdlLmlubmVySFRNTCA9ICdVbmFibGUgdG8gZ2V0IGRhdGEuJ1xuICB9XG5cbiAgbGV0IHJldHJ5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3JldHJ5LWJ1dHRvbicpXG4gIGlmIChyZXRyeSkge1xuICAgIHJldHJ5Lm9uY2xpY2sgPSBsb2FkRGF0YU9uUGFnZVxuICB9XG5cbiAgbGV0IGtwaSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNlcnJvci1yZXRyeScpXG4gIGlmIChrcGkpIHtcbiAgICBrcGkuY2xhc3NMaXN0LmFkZCgnZXJyb3InKVxuICB9XG59XG5cbmZ1bmN0aW9uIGhpZGVGZXRjaEVycm9yU3RhdGUoKSB7XG4gIGxldCBrcGkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZXJyb3ItcmV0cnknKVxuICBpZiAoa3BpKSB7XG4gICAga3BpLmNsYXNzTGlzdC5yZW1vdmUoJ2Vycm9yJylcbiAgfVxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2Vycm9yJyk7XG5cbn1cblxuZnVuY3Rpb24gZHJhd0twaXModG90YWxzLCB0b3RhbHNEaWZmKSB7XG4gIC8vIERyYXcgdGhlIEtQSSB2YWx1ZXNcblxuICBmdW5jdGlvbiBzZXRLcGkoa2V5LCB2YWx1ZSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNrcGktJyArIGtleSArICcgLnZhbHVlJykuaW5uZXJIVE1MID0gdmFsdWVcbiAgfVxuICBmdW5jdGlvbiBzZXRLcGlEaWZmKGtleSwgdmFsdWUpIHtcbiAgICBsZXQgZGlmZkRpciA9ICh2YWx1ZSA+PSAwPycrJzonJylcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcja3BpLScgKyBrZXkgKyAnIC5kaWZmJykuaW5uZXJIVE1MID0gJyggJyArIGRpZmZEaXIgKyB2YWx1ZSArICcgKSdcbiAgfVxuXG4gIHNldEtwaSgnY29uZmlybWVkJywgdG90YWxzLmNvbmZpcm1lZClcbiAgc2V0S3BpRGlmZignY29uZmlybWVkJywgdG90YWxzRGlmZi5jb25maXJtZWQpXG4gIHNldEtwaSgncmVjb3ZlcmVkJywgdG90YWxzLnJlY292ZXJlZClcbiAgc2V0S3BpRGlmZigncmVjb3ZlcmVkJywgdG90YWxzRGlmZi5yZWNvdmVyZWQpXG4gIHNldEtwaSgnZGVjZWFzZWQnLCB0b3RhbHMuZGVjZWFzZWQpXG4gIHNldEtwaURpZmYoJ2RlY2Vhc2VkJywgdG90YWxzRGlmZi5kZWNlYXNlZClcbiAgc2V0S3BpKCdjcml0aWNhbCcsIHRvdGFscy5jcml0aWNhbClcbiAgc2V0S3BpRGlmZignY3JpdGljYWwnLCB0b3RhbHNEaWZmLmNyaXRpY2FsKVxuICBzZXRLcGkoJ3Rlc3RlZCcsIHRvdGFscy50ZXN0ZWQpXG4gIHNldEtwaURpZmYoJ3Rlc3RlZCcsIHRvdGFsc0RpZmYudGVzdGVkKVxuICBzZXRLcGkoJ2FjdGl2ZScsICh0b3RhbHMuY29uZmlybWVkIC0gdG90YWxzLnJlY292ZXJlZCkgLSB0b3RhbHMuZGVjZWFzZWQpXG4gIHNldEtwaURpZmYoJ2FjdGl2ZScsICh0b3RhbHNEaWZmLmNvbmZpcm1lZCAtIHRvdGFsc0RpZmYucmVjb3ZlcmVkKSAtIHRvdGFsc0RpZmYuZGVjZWFzZWQpXG4gIFxufVxuXG5cbmZ1bmN0aW9uIGRyYXdMYXN0VXBkYXRlZChsYXN0VXBkYXRlZCkge1xuICAvLyBEcmF3IHRoZSBsYXN0IHVwZGF0ZWQgdGltZVxuXG4gIC8vIFRPRE8gd2Ugc2hvdWxkIGJlIHBhcnNpbmcgdGhlIGRhdGUsIGJ1dCBJXG4gIC8vIGRvbid0IHRydXN0IHRoZSB1c2VyIGlucHV0IG9uIHRoZSBzaGVldFxuICAvL2xldCBwcmV0dHlVcGRhdGVkVGltZSA9IG1vbWVudChsYXN0VXBkYXRlZCkuZm9ybWF0KCdNTU0gRCwgWVlZWScpICsgJyBKU1QnXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsYXN0LXVwZGF0ZWQnKS5pbm5lckhUTUwgPSBsYXN0VXBkYXRlZFxufVxuXG5cbmZ1bmN0aW9uIGRyYXdQYWdlVGl0bGVDb3VudChjb25maXJtZWQpIHtcbiAgLy8gVXBkYXRlIHRoZSBudW1iZXIgb2YgY29uZmlybWVkIGNhc2VzIGluIHRoZSB0aXRsZVxuXG4gIGRvY3VtZW50LnRpdGxlID0gXCIoXCIgKyBjb25maXJtZWQgKyBcIikgXCIgKyBQQUdFX1RJVExFXG59XG5cbi8qKlxuICogZHJhd01hcFByZWZlY3R1cmVzXG4gKiBAcGFyYW0geyp9IHBhZ2VEcmF3cyAtIG51bWJlciBvZiByZWRyYXdzIHRvIHNjcmVlblxuICovXG5mdW5jdGlvbiBkcmF3TWFwUHJlZmVjdHVyZXMocGFnZURyYXdzKSB7XG4gIC8vIEZpbmQgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBzeW1ib2wgbGF5ZXJcbiAgLy8gaW4gdGhlIG1hcCBzdHlsZSBzbyB3ZSBjYW4gZHJhdyB0aGVcbiAgLy8gcHJlZmVjdHVyZSBjb2xvcnMgYmVoaW5kIGl0XG4gIFxuICB2YXIgZmlyc3RTeW1ib2xJZFxuICB2YXIgbGF5ZXJzID0gbWFwLmdldFN0eWxlKCkubGF5ZXJzXG4gIGZvcih2YXIgaSA9IDA7IGkgPCBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZihsYXllcnNbaV0udHlwZSA9PT0gJ3N5bWJvbCcpIHtcbiAgICAgIGZpcnN0U3ltYm9sSWQgPSBsYXllcnNbaV0uaWRcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIFN0YXJ0IHRoZSBNYXBib3ggc2VhcmNoIGV4cHJlc3Npb25cbiAgbGV0IHByZWZlY3R1cmVQYWludCA9IFtcbiAgICAnbWF0Y2gnLFxuICAgIFsnZ2V0JywgJ05BTUVfMSddLFxuICBdXG5cbiAgLy8gR28gdGhyb3VnaCBhbGwgcHJlZmVjdHVyZXMgbG9va2luZyBmb3IgY2FzZXNcbiAgZGRiLnByZWZlY3R1cmVzLm1hcChmdW5jdGlvbihwcmVmZWN0dXJlKXtcbiAgICBcbiAgICBsZXQgY2FzZXMgPSBwYXJzZUludChwcmVmZWN0dXJlLmNhc2VzKVxuICAgIGlmKGNhc2VzID4gMCl7XG4gICAgICBwcmVmZWN0dXJlUGFpbnQucHVzaChwcmVmZWN0dXJlLnByZWZlY3R1cmUpXG4gICAgICBcbiAgICAgIGlmKGNhc2VzIDw9IDEwKXtcbiAgICAgICAgLy8gMS0xMCBjYXNlc1xuICAgICAgICBwcmVmZWN0dXJlUGFpbnQucHVzaCgncmdiKDI1MywyMzQsMjAzKScpXG4gICAgICB9ZWxzZSBpZihjYXNlcyA8PSAyNSl7XG4gICAgICAgIC8vIDExLTI1IGNhc2VzXG4gICAgICAgIHByZWZlY3R1cmVQYWludC5wdXNoKCdyZ2IoMjUxLDE1NSwxMjcpJylcbiAgICAgIH1lbHNlIGlmKGNhc2VzIDw9IDUwKXtcbiAgICAgICAgLy8gMjYtNTAgY2FzZXNcbiAgICAgICAgcHJlZmVjdHVyZVBhaW50LnB1c2goJ3JnYigyNDQsNjcsNTQpJylcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyA1MSsgY2FzZXNcbiAgICAgICAgcHJlZmVjdHVyZVBhaW50LnB1c2goJ3JnYigxODYsMCwxMyknKVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgfSlcblxuICAvLyBBZGQgYSBmaW5hbCB2YWx1ZSB0byB0aGUgbGlzdCBmb3IgdGhlIGRlZmF1bHQgY29sb3JcbiAgcHJlZmVjdHVyZVBhaW50LnB1c2goJ3JnYmEoMCwwLDAsMCknKVxuXG5cbiAgaWYgKHBhZ2VEcmF3cyA9PT0gMCkge1xuICAgIC8vIElmIGl0IGlzIHRoZSBmaXJzdCB0aW1lIGRyYXdpbmcgdGhlIG1hcFxuXG4gICAgbWFwLmFkZFNvdXJjZSgncHJlZmVjdHVyZXMnLCB7XG4gICAgICB0eXBlOiAnZ2VvanNvbicsXG4gICAgICBkYXRhOiBQUkVGRUNUVVJFX0pTT05fUEFUSCxcbiAgICB9KVxuXG4gICAgLy8gQWRkIHRoZSBwcmVmZWN0dXJlIGNvbG9yIGxheWVyIHRvIHRoZSBtYXBcbiAgICBtYXAuYWRkTGF5ZXIoe1xuICAgICAgJ2lkJzogJ3ByZWZlY3R1cmUtbGF5ZXInLFxuICAgICAgJ3R5cGUnOiAnZmlsbCcsXG4gICAgICAnc291cmNlJzogJ3ByZWZlY3R1cmVzJyxcbiAgICAgICdsYXlvdXQnOiB7fSxcbiAgICAgICdwYWludCc6IHtcbiAgICAgICAgJ2ZpbGwtY29sb3InOiBwcmVmZWN0dXJlUGFpbnQsXG4gICAgICAgICdmaWxsLW9wYWNpdHknOiAwLjhcbiAgICAgIH1cbiAgICB9LCBmaXJzdFN5bWJvbElkKVxuICAgIFxuICAgIC8vIEFkZCBhbm90aGVyIGxheWVyIHdpdGggdHlwZSBcImxpbmVcIlxuICAgIC8vIHRvIHByb3ZpZGUgYSBzdHlsZWQgcHJlZmVjdHVyZSBib3JkZXJcbiAgICBsZXQgcHJlZkJvcmRlckxheWVyID0gbWFwLmFkZExheWVyKHtcbiAgICAgICdpZCc6ICdwcmVmZWN0dXJlLW91dGxpbmUtbGF5ZXInLFxuICAgICAgJ3R5cGUnOiAnbGluZScsXG4gICAgICAnc291cmNlJzogJ3ByZWZlY3R1cmVzJyxcbiAgICAgICdsYXlvdXQnOiB7fSxcbiAgICAgICdwYWludCc6IHtcbiAgICAgICAgJ2xpbmUtd2lkdGgnOiAwLjUsXG4gICAgICAgICdsaW5lLWNvbG9yJzogJyNjMGMwYzAnLFxuICAgICAgICAnbGluZS1vcGFjaXR5JzogMC41XG4gICAgICB9XG4gICAgfSwgZmlyc3RTeW1ib2xJZClcbiAgICBcbiAgfSBlbHNlIHtcbiAgICAvLyBVcGRhdGUgcHJlZmVjdHVyZSBwYWludCBwcm9wZXJ0aWVzXG4gICAgXG4gICAgbWFwLnNldFBhaW50UHJvcGVydHkoJ3ByZWZlY3R1cmUtbGF5ZXInLCAnZmlsbC1jb2xvcicsIHByZWZlY3R1cmVQYWludClcbiAgICBcbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0RGF0YVRyYW5zbGF0ZSgpIHtcbiAgLy8gSGFuZGxlIGxhbmd1YWdlIHN3aXRjaGluZyB1c2luZyBkYXRhIHBhcmFtc1xuXG4gIGNvbnN0IHNlbGVjdG9yID0gJ1tkYXRhLWphXSdcbiAgY29uc3QgcGFyc2VOb2RlID0gZnVuY3Rpb24oY2IpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKS5mb3JFYWNoKGNiKVxuICB9XG5cbiAgLy8gRGVmYXVsdCB3ZWJzaXRlIGlzIGluIEVuZ2xpc2guIEV4dHJhY3QgaXQgYXMgdGhlIGF0dHIgZGF0YS1lbj1cIi4uLlwiXG4gIHBhcnNlTm9kZShmdW5jdGlvbihlbCkge1xuICAgIGVsLmRhdGFzZXRbJ2VuJ10gPSBlbC50ZXh0Q29udGVudFxuICB9KVxuXG4gIC8vIExhbmd1YWdlIHNlbGVjdG9yIGV2ZW50IGhhbmRsZXJcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtbGFuZy1waWNrZXJdJykuZm9yRWFjaChmdW5jdGlvbihwaWNrKSB7XG4gICAgcGljay5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBMQU5HID0gZS50YXJnZXQuZGF0YXNldC5sYW5nUGlja2VyXG4gICAgICBcbiAgICAgIC8vIFRvZ2dsZSB0aGUgaHRtbCBsYW5nIHRhZ3NcbiAgICAgIHBhcnNlTm9kZShmdW5jdGlvbihlbCkge1xuICAgICAgICBpZiAoIWVsLmRhdGFzZXRbTEFOR10pIHJldHVybjtcbiAgICAgICAgZWwudGV4dENvbnRlbnQgPSBlbC5kYXRhc2V0W0xBTkddXG4gICAgICB9KVxuICAgICAgXG4gICAgICAvLyBVcGRhdGUgdGhlIG1hcFxuICAgICAgbWFwLmdldFN0eWxlKCkubGF5ZXJzLmZvckVhY2goZnVuY3Rpb24odGhpc0xheWVyKXtcbiAgICAgICAgaWYodGhpc0xheWVyLnR5cGUgPT0gJ3N5bWJvbCcpe1xuICAgICAgICAgIG1hcC5zZXRMYXlvdXRQcm9wZXJ0eSh0aGlzTGF5ZXIuaWQsICd0ZXh0LWZpZWxkJywgWydnZXQnLCduYW1lXycgKyBMQU5HXSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgXG4gICAgICAvLyBSZWRyYXcgdGhlIHByZWZlY3R1cmVzIHRhYmxlXG4gICAgICBpZihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJlZmVjdHVyZXMtdGFibGUnKSl7XG4gICAgICAgIGRyYXdQcmVmZWN0dXJlVGFibGUoZGRiLnByZWZlY3R1cmVzLCBkZGIudG90YWxzKVxuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBUb2dnbGUgdGhlIGxhbmcgcGlja2VyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdhW2RhdGEtbGFuZy1waWNrZXJdJykuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lJ1xuICAgICAgfSlcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FbZGF0YS1sYW5nLXBpY2tlcj0nK0xBTkcrJ10nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICBcbiAgICB9KVxuICB9KVxufVxuXG5cbmZ1bmN0aW9uIGxvYWREYXRhT25QYWdlKCkge1xuICBsb2FkRGF0YShmdW5jdGlvbihkYXRhKSB7XG4gICAganNvbkRhdGEgPSBkYXRhXG5cbiAgICBkZGIucHJlZmVjdHVyZXMgPSBqc29uRGF0YS5wcmVmZWN0dXJlc1xuICAgIGxldCBuZXdUb3RhbHMgPSBjYWxjdWxhdGVUb3RhbHMoanNvbkRhdGEuZGFpbHkpXG4gICAgZGRiLnRvdGFscyA9IG5ld1RvdGFsc1swXVxuICAgIGRkYi50b3RhbHNEaWZmID0gbmV3VG90YWxzWzFdXG4gICAgZGRiLnRyZW5kID0ganNvbkRhdGEuZGFpbHlcbiAgICBkZGIubGFzdFVwZGF0ZWQgPSBqc29uRGF0YS51cGRhdGVkWzBdLmxhc3R1cGRhdGVkXG5cbiAgICBkcmF3S3BpcyhkZGIudG90YWxzLCBkZGIudG90YWxzRGlmZilcbiAgICBpZiAoIWRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCdlbWJlZC1tb2RlJykpIHtcbiAgICAgIGRyYXdMYXN0VXBkYXRlZChkZGIubGFzdFVwZGF0ZWQpXG4gICAgICBkcmF3UGFnZVRpdGxlQ291bnQoZGRiLnRvdGFscy5jb25maXJtZWQpXG4gICAgICBkcmF3UHJlZmVjdHVyZVRhYmxlKGRkYi5wcmVmZWN0dXJlcywgZGRiLnRvdGFscylcbiAgICAgIGRyYXdUcmVuZENoYXJ0KGRkYi50cmVuZClcbiAgICB9XG5cbiAgICB3aGVuTWFwQW5kRGF0YVJlYWR5KClcbiAgfSlcbn1cblxudmFyIHBhZ2VEcmF3cyA9IDBcbnZhciBzdHlsZUxvYWRlZCA9IGZhbHNlXG52YXIganNvbkRhdGEgPSB1bmRlZmluZWRcbmZ1bmN0aW9uIHdoZW5NYXBBbmREYXRhUmVhZHkoKXtcbiAgLy8gVGhpcyBydW5zIGRyYXdNYXBQcmVmIG9ubHkgd2hlblxuICAvLyBib3RoIHN0eWxlIGFuZCBqc29uIGRhdGEgYXJlIHJlYWR5XG5cbiAgaWYoIXN0eWxlTG9hZGVkIHx8ICFqc29uRGF0YSl7XG4gICAgcmV0dXJuXG4gIH1cblxuICBkcmF3TWFwUHJlZmVjdHVyZXMocGFnZURyYXdzKVxufVxuXG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICBcbiAgLy8gRW5hYmxlIHRvb2x0aXBzXG4gIHRpcHB5KCdbZGF0YS10aXBweS1jb250ZW50XScpXG5cbiAgaW5pdERhdGFUcmFuc2xhdGUoKVxuICBkcmF3TWFwKClcbiBcbiAgbWFwLm9uY2UoJ3N0eWxlLmxvYWQnLCBmdW5jdGlvbihlKSB7XG4gICAgc3R5bGVMb2FkZWQgPSB0cnVlXG4gICAgd2hlbk1hcEFuZERhdGFSZWFkeSgpXG4gIH0pXG5cblxuICBsb2FkRGF0YU9uUGFnZSgpXG5cbiAgLy8gUmVsb2FkIGRhdGEgZXZlcnkgSU5URVJWQUxcbiAgY29uc3QgRklWRV9NSU5VVEVTX0lOX01TID0gMzAwMDAwXG4gIHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgIHBhZ2VEcmF3cysrXG4gICAgbG9hZERhdGFPblBhZ2UoKVxuICB9LCBGSVZFX01JTlVURVNfSU5fTVMpXG59IiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luIl0sInNvdXJjZVJvb3QiOiIifQ==