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
    callback(data)
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

window.onload = function(){
  
  // Enable tooltips
  tippy('[data-tippy-content]')

  initDataTranslate()
  drawMap()

  var pageDraws = 0
  var styleLoaded = false
  var jsonData = undefined
  const FIVE_MINUTES_IN_MS = 300000

  function whenMapAndDataReady(){
    // This runs drawMapPref only when
    // both style and json data are ready

    if(!styleLoaded || !jsonData){
      return
    }

    drawMapPrefectures(pageDraws)
  }

  map.once('style.load', function(e) {
    styleLoaded = true
    whenMapAndDataReady()
  })

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

  loadDataOnPage()

  // Reload data every INTERVAL
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9pbmRleC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsaUJBQWlCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBOzs7O0FBSUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLE9BQU8saURBQWlEO0FBQ3hELE9BQU8sK0NBQStDO0FBQ3REO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVcsRUFBRTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdCQUFnQixtQkFBbUI7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSDtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUEsS0FBSztBQUNMLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxDOzs7Ozs7Ozs7OztBQ3RoQkEsdUMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9cIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuIiwibWFwYm94Z2wuYWNjZXNzVG9rZW4gPSAncGsuZXlKMUlqb2ljbVYxYzNSc1pTSXNJbUVpT2lKamF6WnRhSEU0Wm5rd01HOWlNM0J4WW5GbWFEZ3hielEwSW4wLm5PaUhHY1NDUk5hOU1EOVd4TEltN2cnXG5jb25zdCBQUkVGRUNUVVJFX0pTT05fUEFUSCA9ICdzdGF0aWMvcHJlZmVjdHVyZXMuZ2VvanNvbidcbmNvbnN0IEpTT05fUEFUSCA9ICdodHRwczovL2NvdmlkMTlqYXBhbi5zMy5hcC1ub3J0aGVhc3QtMS5hbWF6b25hd3MuY29tL2RhdGEuanNvbidcbmNvbnN0IFRJTUVfRk9STUFUID0gJ1lZWVktTU0tREQnXG5jb25zdCBDT0xPUl9DT05GSVJNRUQgPSAncmdiKDI0NCw2Nyw1NCknXG5jb25zdCBDT0xPUl9SRUNPVkVSRUQgPSAncmdiKDI1LDExOCwyMTApJ1xuY29uc3QgQ09MT1JfREVDRUFTRUQgPSAncmdiKDU1LDcxLDc5KSdcbmNvbnN0IENPTE9SX0lOQ1JFQVNFID0gJ3JnYigxNjMsMTcyLDE5MSknXG5jb25zdCBQQUdFX1RJVExFID0gJ0Nvcm9uYXZpcnVzIERpc2Vhc2UgKENPVklELTE5KSBKYXBhbiBUcmFja2VyJ1xubGV0IExBTkcgPSAnZW4nXG5cbi8vIEdsb2JhbCB2YXJzXG5sZXQgZGRiID0ge1xuICBwcmVmZWN0dXJlczogdW5kZWZpbmVkLFxuICB0cmVuZDogdW5kZWZpbmVkLFxuICB0b3RhbHM6IHtcbiAgICBjb25maXJtZWQ6IDAsXG4gICAgcmVjb3ZlcmVkOiAwLFxuICAgIGRlY2Vhc2VkOiAwLFxuICAgIHRlc3RlZDogMCxcbiAgICBjcml0aWNhbDogMFxuICB9LFxuICB0b3RhbHNEaWZmOiB7XG4gICAgY29uZmlybWVkOiAwLFxuICAgIHJlY292ZXJlZDogMCxcbiAgICBkZWNlYXNlZDogMCxcbiAgICB0ZXN0ZWQ6IDAsXG4gICAgY3JpdGljYWw6IDBcbiAgfVxufVxubGV0IG1hcCA9IHVuZGVmaW5lZFxuXG5cbi8vIElFMTEgZm9yRWFjaCBQb2x5ZmlsbFxuaWYgKCdOb2RlTGlzdCcgaW4gd2luZG93ICYmICFOb2RlTGlzdC5wcm90b3R5cGUuZm9yRWFjaCkge1xuICBjb25zb2xlLmluZm8oJ3BvbHlmaWxsIGZvciBJRTExJyk7XG4gIE5vZGVMaXN0LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgdGhpc0FyZyA9IHRoaXNBcmcgfHwgd2luZG93O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB0aGlzW2ldLCBpLCB0aGlzKTtcbiAgICB9XG4gIH07XG59XG5cblxuXG5mdW5jdGlvbiBsb2FkRGF0YShjYWxsYmFjaykge1xuICAvLyBMb2FkIHRoZSBqc29uIGRhdGEgZmlsZVxuICBcbiAgZmV0Y2goSlNPTl9QQVRIKVxuICAudGhlbihmdW5jdGlvbihyZXMpe1xuICAgIHJldHVybiByZXMuanNvbigpXG4gIH0pXG4gIC50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgIGNhbGxiYWNrKGRhdGEpXG4gIH0pXG59XG5cblxuZnVuY3Rpb24gY2FsY3VsYXRlVG90YWxzKGRhaWx5KSB7XG4gIC8vIENhbGN1bGF0ZSB0aGUgdG90YWxzXG5cbiAgbGV0IHRvdGFscyA9IHtcbiAgICBjb25maXJtZWQ6IDAsXG4gICAgcmVjb3ZlcmVkOiAwLFxuICAgIGRlY2Vhc2VkOiAwLFxuICAgIGNyaXRpY2FsOiAwLFxuICAgIHRlc3RlZDogMFxuICB9XG4gIGxldCB0b3RhbHNEaWZmID0ge1xuICAgIGNvbmZpcm1lZDogMSxcbiAgICByZWNvdmVyZWQ6IDEsXG4gICAgZGVjZWFzZWQ6IDEsXG4gICAgY3JpdGljYWw6IDEsXG4gICAgdGVzdGVkOiAxXG4gIH1cblxuICAvLyBJZiB0aGVyZSBpcyBhbiBlbXB0eSBjZWxsLCBmYWxsIGJhY2sgdG8gdGhlIHByZXZpb3VzIHJvd1xuICBmdW5jdGlvbiBwdWxsTGF0ZXN0U3VtQW5kRGlmZihrZXkpIHtcbiAgICBpZihkYWlseVtkYWlseS5sZW5ndGgtMV1ba2V5XS5sZW5ndGgpe1xuICAgICAgdG90YWxzW2tleV0gPSBwYXJzZUludChkYWlseVtkYWlseS5sZW5ndGgtMV1ba2V5XSlcbiAgICAgIHRvdGFsc0RpZmZba2V5XSA9IHRvdGFsc1trZXldIC0gcGFyc2VJbnQoZGFpbHlbZGFpbHkubGVuZ3RoLTJdW2tleV0pXG4gICAgfWVsc2V7XG4gICAgICB0b3RhbHNba2V5XSA9IHBhcnNlSW50KGRhaWx5W2RhaWx5Lmxlbmd0aC0yXVtrZXldKVxuICAgICAgdG90YWxzRGlmZltrZXldID0gdG90YWxzW2tleV0gLSBwYXJzZUludChkYWlseVtkYWlseS5sZW5ndGgtM11ba2V5XSlcbiAgICB9XG4gIH1cblxuICBwdWxsTGF0ZXN0U3VtQW5kRGlmZigndGVzdGVkJylcbiAgcHVsbExhdGVzdFN1bUFuZERpZmYoJ2NyaXRpY2FsJylcbiAgcHVsbExhdGVzdFN1bUFuZERpZmYoJ2NvbmZpcm1lZCcpXG4gIHB1bGxMYXRlc3RTdW1BbmREaWZmKCdyZWNvdmVyZWQnKVxuICBwdWxsTGF0ZXN0U3VtQW5kRGlmZignZGVjZWFzZWQnKVxuXG4gIHJldHVybiBbdG90YWxzLCB0b3RhbHNEaWZmXVxufVxuXG5cbmZ1bmN0aW9uIGRyYXdNYXAoKSB7XG4gIC8vIEluaXRpYWxpemUgTWFwXG5cbiAgbWFwID0gbmV3IG1hcGJveGdsLk1hcCh7XG4gICAgY29udGFpbmVyOiAnbWFwLWNvbnRhaW5lcicsXG4gICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2xpZ2h0LXYxMCcsXG4gICAgem9vbTogNCxcbiAgICBtaW5ab29tOiAzLjUsXG4gICAgbWF4Wm9vbTogNyxcbiAgICBjZW50ZXI6IHtcbiAgICAgIGxuZzogMTM5LjExNzkyOTczMDUxMjc0LFxuICAgICAgbGF0OiAzOC41MjI0NTYxNjU0NTU3MVxuICAgIH0sXG4gICAgbWF4Qm91bmRzOiBbXG4gICAgICB7bGF0OiAxMi4xMTgzMTgwMTQ0MTY2NDQsIGxuZzogMTAwLjAxMjQwNjE4MzMwNTQyfSwgLy8gU1dcbiAgICAgIHtsYXQ6IDU5LjM0NzIxMjU2MjYzMjE0LCBsbmc6IDE3NS4zMjczNTcwNDQ2OTgyfSAvLyBORVxuICAgIF1cbiAgfSlcblxuICBtYXAuZHJhZ1JvdGF0ZS5kaXNhYmxlKClcbiAgbWFwLnRvdWNoWm9vbVJvdGF0ZS5kaXNhYmxlUm90YXRpb24oKVxuICBtYXAuc2Nyb2xsWm9vbS5kaXNhYmxlKClcbiAgbWFwLmFkZENvbnRyb2wobmV3IG1hcGJveGdsLk5hdmlnYXRpb25Db250cm9sKHtcbiAgICBzaG93Q29tcGFzczogZmFsc2UsXG4gICAgc2hvd1pvb206IHRydWVcbiAgfSkpXG59XG5cblxuZnVuY3Rpb24gZHJhd1RyZW5kQ2hhcnQoc2hlZXRUcmVuZCkge1xuXG4gIGxldCBsYXN0VXBkYXRlZCA9ICcnXG4gIGxldCBsYWJlbFNldCA9IFtdXG4gIGxldCBjb25maXJtZWRTZXQgPSBbXVxuICBsZXQgcmVjb3ZlcmVkU2V0ID0gW11cbiAgbGV0IGRlY2Vhc2VkU2V0ID0gW11cbiAgbGV0IGRhaWx5SW5jcmVhc2VTZXQgPSBbXVxuXG4gIGxldCBwcmV2Q29uZmlybWVkID0gLTFcbiAgc2hlZXRUcmVuZC5tYXAoZnVuY3Rpb24odHJlbmREYXRhKXtcbiAgICBsYWJlbFNldC5wdXNoKG5ldyBEYXRlKHRyZW5kRGF0YS5kYXRlKSlcbiAgICBjb25maXJtZWRTZXQucHVzaCh7XG4gICAgICB4OiBuZXcgRGF0ZSh0cmVuZERhdGEuZGF0ZSksXG4gICAgICB5OiBwYXJzZUludCh0cmVuZERhdGEuY29uZmlybWVkKVxuICAgIH0pXG4gICAgcmVjb3ZlcmVkU2V0LnB1c2goe1xuICAgICAgeDogbmV3IERhdGUodHJlbmREYXRhLmRhdGUpLFxuICAgICAgeTogcGFyc2VJbnQodHJlbmREYXRhLnJlY292ZXJlZClcbiAgICB9KVxuICAgIGRlY2Vhc2VkU2V0LnB1c2goe1xuICAgICAgeDogbmV3IERhdGUodHJlbmREYXRhLmRhdGUpLFxuICAgICAgeTogcGFyc2VJbnQodHJlbmREYXRhLmRlY2Vhc2VkKVxuICAgIH0pXG4gICAgZGFpbHlJbmNyZWFzZVNldC5wdXNoKHtcbiAgICAgIHg6IG5ldyBEYXRlKHRyZW5kRGF0YS5kYXRlKSxcbiAgICAgIHk6IHByZXZDb25maXJtZWQgPT09IC0xID8gMCA6IHBhcnNlSW50KHRyZW5kRGF0YS5jb25maXJtZWQpIC0gcHJldkNvbmZpcm1lZFxuICAgIH0pXG5cbiAgICBwcmV2Q29uZmlybWVkID0gcGFyc2VJbnQodHJlbmREYXRhLmNvbmZpcm1lZClcbiAgICBsYXN0VXBkYXRlZCA9IHRyZW5kRGF0YS5kYXRlXG4gIH0pXG5cbiAgdmFyIGN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0cmVuZC1jaGFydCcpLmdldENvbnRleHQoJzJkJylcbiAgQ2hhcnQuZGVmYXVsdHMuZ2xvYmFsLmRlZmF1bHRGb250RmFtaWx5ID0gXCInT3BlbiBTYW5zJywgaGVsdmV0aWNhLCBzYW5zLXNlcmlmXCJcbiAgQ2hhcnQuZGVmYXVsdHMuZ2xvYmFsLmRlZmF1bHRGb250U2l6ZSA9IDE2XG4gIENoYXJ0LmRlZmF1bHRzLmdsb2JhbC5kZWZhdWx0Rm9udENvbG9yID0gJ3JnYigwLDEwLDE4KSdcblxuICB2YXIgY2hhcnQgPSBuZXcgQ2hhcnQoY3R4LCB7XG4gICAgdHlwZTogJ2xpbmUnLFxuICAgIGRhdGE6IHtcbiAgICAgIGxhYmVsczogbGFiZWxTZXQsXG4gICAgICBkYXRhc2V0czogW1xuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdEZWNlYXNlZCcsXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IENPTE9SX0RFQ0VBU0VELFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ09MT1JfREVDRUFTRUQsXG4gICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgZGF0YTogZGVjZWFzZWRTZXRcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnUmVjb3ZlcmVkJyxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQ09MT1JfUkVDT1ZFUkVELFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ09MT1JfUkVDT1ZFUkVELFxuICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgIGRhdGE6IHJlY292ZXJlZFNldFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdDb25maXJtZWQnLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDT0xPUl9DT05GSVJNRUQsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDT0xPUl9DT05GSVJNRUQsXG4gICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgZGF0YTogY29uZmlybWVkU2V0XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0RhaWx5IEluY3JlYXNlJyxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQ09MT1JfSU5DUkVBU0UsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDT0xPUl9JTkNSRUFTRSxcbiAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICBkYXRhOiBkYWlseUluY3JlYXNlU2V0XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLFxuICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcbiAgICAgIGVsZW1lbnRzOiB7XG4gICAgICAgIGxpbmU6IHtcbiAgICAgICAgICB0ZW5zaW9uOiAwLjFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGxlZ2VuZDoge1xuICAgICAgICBkaXNwbGF5OiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBzY2FsZXM6IHtcbiAgICAgICAgeEF4ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ3RpbWUnLFxuICAgICAgICAgIHRpbWU6IHtcbiAgICAgICAgICAgIHBhcnNlcjogVElNRV9GT1JNQVQsXG4gICAgICAgICAgICByb3VuZDogJ2RheScsXG4gICAgICAgICAgICB0b29sdGlwRm9ybWF0OiAnbGwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzY2FsZUxhYmVsOiB7XG4gICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWxTdHJpbmc6ICdEYXRlJ1xuICAgICAgICAgIH1cbiAgICAgICAgfV0sXG4gICAgICAgIHlBeGVzOiBbe1xuICAgICAgICAgIHNjYWxlTGFiZWw6IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICBsYWJlbFN0cmluZzogJ0Nhc2VzJ1xuICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5cbmZ1bmN0aW9uIGRyYXdQcmVmZWN0dXJlVGFibGUocHJlZmVjdHVyZXMsIHRvdGFscykge1xuICAvLyBEcmF3IHRoZSBDYXNlcyBCeSBQcmVmZWN0dXJlIHRhYmxlXG5cbiAgbGV0IGRhdGFUYWJsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwcmVmZWN0dXJlcy10YWJsZSB0Ym9keScpXG4gIGxldCB1bnNwZWNpZmllZFJvdyA9ICcnXG5cbiAgLy8gUmVtb3ZlIHRoZSBsb2FkaW5nIGNlbGxcbiAgZGF0YVRhYmxlLmlubmVySFRNTCA9ICcnXG5cbiAgLy8gUGFyc2UgdmFsdWVzIHNvIHdlIGNhbiBzb3J0XG4gIF8ubWFwKHByZWZlY3R1cmVzLCBmdW5jdGlvbihwcmVmKXtcbiAgICAvLyBUT0RPIGNoYW5nZSB0byBjb25maXJtZWRcbiAgICBwcmVmLmNvbmZpcm1lZCA9IChwcmVmLmNhc2VzP3BhcnNlSW50KHByZWYuY2FzZXMpOjApXG4gICAgcHJlZi5yZWNvdmVyZWQgPSAocHJlZi5yZWNvdmVyZWQ/cGFyc2VJbnQocHJlZi5yZWNvdmVyZWQpOjApXG4gICAgLy8gVE9ETyBjaGFuZ2UgdG8gZGVjZWFzZWRcbiAgICBwcmVmLmRlY2Vhc2VkID0gKHByZWYuZGVhdGhzP3BhcnNlSW50KHByZWYuZGVhdGhzKTowKVxuICB9KVxuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCBhbmQgcmVuZGVyIHRhYmxlIHJvd3NcbiAgXy5vcmRlckJ5KHByZWZlY3R1cmVzLCAnY29uZmlybWVkJywgJ2Rlc2MnKS5tYXAoZnVuY3Rpb24ocHJlZil7XG4gICAgaWYoIXByZWYuY29uZmlybWVkICYmICFwcmVmLnJlY292ZXJlZCAmJiAhcHJlZi5kZWNlYXNlZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgXG4gICAgbGV0IHByZWZTdHJcbiAgICBpZihMQU5HID09ICdlbicpe1xuICAgICAgICBwcmVmU3RyID0gcHJlZi5wcmVmZWN0dXJlXG4gICAgfWVsc2V7XG4gICAgICBwcmVmU3RyID0gcHJlZi5wcmVmZWN0dXJlamFcbiAgICB9XG4gICAgXG4gICAgLy8gVE9ETyBNYWtlIHRoaXMgcHJldHR5XG4gICAgXG4gICAgaWYocHJlZi5wcmVmZWN0dXJlID09ICdVbnNwZWNpZmllZCcpe1xuICAgICAgLy8gU2F2ZSB0aGUgXCJVbnNwZWNpZmllZFwiIHJvdyBmb3IgdGhlIGVuZCBvZiB0aGUgdGFibGVcbiAgICAgIHVuc3BlY2lmaWVkUm93ID0gXCI8dHI+PHRkPjxlbT5cIiArIHByZWZTdHIgKyBcIjwvZW0+PC90ZD48dGQ+XCIgKyBwcmVmLmNvbmZpcm1lZCArIFwiPC90ZD48dGQ+XCIgKyBwcmVmLnJlY292ZXJlZCArIFwiPC90ZD48dGQ+XCIgKyBwcmVmLmRlYXRocyArIFwiPC90ZD48L3RyPlwiXG4gICAgfWVsc2UgaWYgKHByZWYucHJlZmVjdHVyZSA9PSAnVG90YWwnKXtcbiAgICAgIC8vIFNraXBcbiAgICB9ZWxzZXtcbiAgICAgIGRhdGFUYWJsZS5pbm5lckhUTUwgPSBkYXRhVGFibGUuaW5uZXJIVE1MICsgXCI8dHI+PHRkPlwiICsgcHJlZlN0ciArIFwiPC90ZD48dGQ+XCIgKyBwcmVmLmNvbmZpcm1lZCArIFwiPC90ZD48dGQ+PC90ZD48dGQ+XCIgKyAocHJlZi5kZWNlYXNlZD9wcmVmLmRlY2Vhc2VkOicnKSArIFwiPC90ZD48L3RyPlwiXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH0pXG5cbiAgZGF0YVRhYmxlLmlubmVySFRNTCA9IGRhdGFUYWJsZS5pbm5lckhUTUwgKyB1bnNwZWNpZmllZFJvd1xuXG4gIGxldCB0b3RhbFN0ciA9ICdUb3RhbCdcbiAgaWYoTEFORyA9PSAnamEnKXtcbiAgICB0b3RhbFN0ciA9ICfoqIgnXG4gIH1cblxuICBkYXRhVGFibGUuaW5uZXJIVE1MID0gZGF0YVRhYmxlLmlubmVySFRNTCArIFwiPHRyIGNsYXNzPSd0b3RhbHMnPjx0ZD5cIiArIHRvdGFsU3RyICsgXCI8L3RkPjx0ZD5cIiArIHRvdGFscy5jb25maXJtZWQgKyBcIjwvdGQ+PHRkPlwiICsgdG90YWxzLnJlY292ZXJlZCArIFwiPC90ZD48dGQ+XCIgKyB0b3RhbHMuZGVjZWFzZWQgKyBcIjwvdGQ+PC90cj5cIlxufVxuXG5cbmZ1bmN0aW9uIGRyYXdLcGlzKHRvdGFscywgdG90YWxzRGlmZikge1xuICAvLyBEcmF3IHRoZSBLUEkgdmFsdWVzXG5cbiAgZnVuY3Rpb24gc2V0S3BpKGtleSwgdmFsdWUpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcja3BpLScgKyBrZXkgKyAnIC52YWx1ZScpLmlubmVySFRNTCA9IHZhbHVlXG4gIH1cbiAgZnVuY3Rpb24gc2V0S3BpRGlmZihrZXksIHZhbHVlKSB7XG4gICAgbGV0IGRpZmZEaXIgPSAodmFsdWUgPj0gMD8nKyc6JycpXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2twaS0nICsga2V5ICsgJyAuZGlmZicpLmlubmVySFRNTCA9ICcoICcgKyBkaWZmRGlyICsgdmFsdWUgKyAnICknXG4gIH1cblxuICBzZXRLcGkoJ2NvbmZpcm1lZCcsIHRvdGFscy5jb25maXJtZWQpXG4gIHNldEtwaURpZmYoJ2NvbmZpcm1lZCcsIHRvdGFsc0RpZmYuY29uZmlybWVkKVxuICBzZXRLcGkoJ3JlY292ZXJlZCcsIHRvdGFscy5yZWNvdmVyZWQpXG4gIHNldEtwaURpZmYoJ3JlY292ZXJlZCcsIHRvdGFsc0RpZmYucmVjb3ZlcmVkKVxuICBzZXRLcGkoJ2RlY2Vhc2VkJywgdG90YWxzLmRlY2Vhc2VkKVxuICBzZXRLcGlEaWZmKCdkZWNlYXNlZCcsIHRvdGFsc0RpZmYuZGVjZWFzZWQpXG4gIHNldEtwaSgnY3JpdGljYWwnLCB0b3RhbHMuY3JpdGljYWwpXG4gIHNldEtwaURpZmYoJ2NyaXRpY2FsJywgdG90YWxzRGlmZi5jcml0aWNhbClcbiAgc2V0S3BpKCd0ZXN0ZWQnLCB0b3RhbHMudGVzdGVkKVxuICBzZXRLcGlEaWZmKCd0ZXN0ZWQnLCB0b3RhbHNEaWZmLnRlc3RlZClcbiAgc2V0S3BpKCdhY3RpdmUnLCAodG90YWxzLmNvbmZpcm1lZCAtIHRvdGFscy5yZWNvdmVyZWQpIC0gdG90YWxzLmRlY2Vhc2VkKVxuICBzZXRLcGlEaWZmKCdhY3RpdmUnLCAodG90YWxzRGlmZi5jb25maXJtZWQgLSB0b3RhbHNEaWZmLnJlY292ZXJlZCkgLSB0b3RhbHNEaWZmLmRlY2Vhc2VkKVxuICBcbn1cblxuXG5mdW5jdGlvbiBkcmF3TGFzdFVwZGF0ZWQobGFzdFVwZGF0ZWQpIHtcbiAgLy8gRHJhdyB0aGUgbGFzdCB1cGRhdGVkIHRpbWVcblxuICAvLyBUT0RPIHdlIHNob3VsZCBiZSBwYXJzaW5nIHRoZSBkYXRlLCBidXQgSVxuICAvLyBkb24ndCB0cnVzdCB0aGUgdXNlciBpbnB1dCBvbiB0aGUgc2hlZXRcbiAgLy9sZXQgcHJldHR5VXBkYXRlZFRpbWUgPSBtb21lbnQobGFzdFVwZGF0ZWQpLmZvcm1hdCgnTU1NIEQsIFlZWVknKSArICcgSlNUJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGFzdC11cGRhdGVkJykuaW5uZXJIVE1MID0gbGFzdFVwZGF0ZWRcbn1cblxuXG5mdW5jdGlvbiBkcmF3UGFnZVRpdGxlQ291bnQoY29uZmlybWVkKSB7XG4gIC8vIFVwZGF0ZSB0aGUgbnVtYmVyIG9mIGNvbmZpcm1lZCBjYXNlcyBpbiB0aGUgdGl0bGVcblxuICBkb2N1bWVudC50aXRsZSA9IFwiKFwiICsgY29uZmlybWVkICsgXCIpIFwiICsgUEFHRV9USVRMRVxufVxuXG4vKipcbiAqIGRyYXdNYXBQcmVmZWN0dXJlc1xuICogQHBhcmFtIHsqfSBwYWdlRHJhd3MgLSBudW1iZXIgb2YgcmVkcmF3cyB0byBzY3JlZW5cbiAqL1xuZnVuY3Rpb24gZHJhd01hcFByZWZlY3R1cmVzKHBhZ2VEcmF3cykge1xuICAvLyBGaW5kIHRoZSBpbmRleCBvZiB0aGUgZmlyc3Qgc3ltYm9sIGxheWVyXG4gIC8vIGluIHRoZSBtYXAgc3R5bGUgc28gd2UgY2FuIGRyYXcgdGhlXG4gIC8vIHByZWZlY3R1cmUgY29sb3JzIGJlaGluZCBpdFxuICBcbiAgdmFyIGZpcnN0U3ltYm9sSWRcbiAgdmFyIGxheWVycyA9IG1hcC5nZXRTdHlsZSgpLmxheWVyc1xuICBmb3IodmFyIGkgPSAwOyBpIDwgbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYobGF5ZXJzW2ldLnR5cGUgPT09ICdzeW1ib2wnKSB7XG4gICAgICBmaXJzdFN5bWJvbElkID0gbGF5ZXJzW2ldLmlkXG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBTdGFydCB0aGUgTWFwYm94IHNlYXJjaCBleHByZXNzaW9uXG4gIGxldCBwcmVmZWN0dXJlUGFpbnQgPSBbXG4gICAgJ21hdGNoJyxcbiAgICBbJ2dldCcsICdOQU1FXzEnXSxcbiAgXVxuXG4gIC8vIEdvIHRocm91Z2ggYWxsIHByZWZlY3R1cmVzIGxvb2tpbmcgZm9yIGNhc2VzXG4gIGRkYi5wcmVmZWN0dXJlcy5tYXAoZnVuY3Rpb24ocHJlZmVjdHVyZSl7XG4gICAgXG4gICAgbGV0IGNhc2VzID0gcGFyc2VJbnQocHJlZmVjdHVyZS5jYXNlcylcbiAgICBpZihjYXNlcyA+IDApe1xuICAgICAgcHJlZmVjdHVyZVBhaW50LnB1c2gocHJlZmVjdHVyZS5wcmVmZWN0dXJlKVxuICAgICAgXG4gICAgICBpZihjYXNlcyA8PSAxMCl7XG4gICAgICAgIC8vIDEtMTAgY2FzZXNcbiAgICAgICAgcHJlZmVjdHVyZVBhaW50LnB1c2goJ3JnYigyNTMsMjM0LDIwMyknKVxuICAgICAgfWVsc2UgaWYoY2FzZXMgPD0gMjUpe1xuICAgICAgICAvLyAxMS0yNSBjYXNlc1xuICAgICAgICBwcmVmZWN0dXJlUGFpbnQucHVzaCgncmdiKDI1MSwxNTUsMTI3KScpXG4gICAgICB9ZWxzZSBpZihjYXNlcyA8PSA1MCl7XG4gICAgICAgIC8vIDI2LTUwIGNhc2VzXG4gICAgICAgIHByZWZlY3R1cmVQYWludC5wdXNoKCdyZ2IoMjQ0LDY3LDU0KScpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8gNTErIGNhc2VzXG4gICAgICAgIHByZWZlY3R1cmVQYWludC5wdXNoKCdyZ2IoMTg2LDAsMTMpJylcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gIH0pXG5cbiAgLy8gQWRkIGEgZmluYWwgdmFsdWUgdG8gdGhlIGxpc3QgZm9yIHRoZSBkZWZhdWx0IGNvbG9yXG4gIHByZWZlY3R1cmVQYWludC5wdXNoKCdyZ2JhKDAsMCwwLDApJylcblxuXG4gIGlmIChwYWdlRHJhd3MgPT09IDApIHtcbiAgICAvLyBJZiBpdCBpcyB0aGUgZmlyc3QgdGltZSBkcmF3aW5nIHRoZSBtYXBcblxuICAgIG1hcC5hZGRTb3VyY2UoJ3ByZWZlY3R1cmVzJywge1xuICAgICAgdHlwZTogJ2dlb2pzb24nLFxuICAgICAgZGF0YTogUFJFRkVDVFVSRV9KU09OX1BBVEgsXG4gICAgfSlcblxuICAgIC8vIEFkZCB0aGUgcHJlZmVjdHVyZSBjb2xvciBsYXllciB0byB0aGUgbWFwXG4gICAgbWFwLmFkZExheWVyKHtcbiAgICAgICdpZCc6ICdwcmVmZWN0dXJlLWxheWVyJyxcbiAgICAgICd0eXBlJzogJ2ZpbGwnLFxuICAgICAgJ3NvdXJjZSc6ICdwcmVmZWN0dXJlcycsXG4gICAgICAnbGF5b3V0Jzoge30sXG4gICAgICAncGFpbnQnOiB7XG4gICAgICAgICdmaWxsLWNvbG9yJzogcHJlZmVjdHVyZVBhaW50LFxuICAgICAgICAnZmlsbC1vcGFjaXR5JzogMC44XG4gICAgICB9XG4gICAgfSwgZmlyc3RTeW1ib2xJZClcbiAgICBcbiAgICAvLyBBZGQgYW5vdGhlciBsYXllciB3aXRoIHR5cGUgXCJsaW5lXCJcbiAgICAvLyB0byBwcm92aWRlIGEgc3R5bGVkIHByZWZlY3R1cmUgYm9yZGVyXG4gICAgbGV0IHByZWZCb3JkZXJMYXllciA9IG1hcC5hZGRMYXllcih7XG4gICAgICAnaWQnOiAncHJlZmVjdHVyZS1vdXRsaW5lLWxheWVyJyxcbiAgICAgICd0eXBlJzogJ2xpbmUnLFxuICAgICAgJ3NvdXJjZSc6ICdwcmVmZWN0dXJlcycsXG4gICAgICAnbGF5b3V0Jzoge30sXG4gICAgICAncGFpbnQnOiB7XG4gICAgICAgICdsaW5lLXdpZHRoJzogMC41LFxuICAgICAgICAnbGluZS1jb2xvcic6ICcjYzBjMGMwJyxcbiAgICAgICAgJ2xpbmUtb3BhY2l0eSc6IDAuNVxuICAgICAgfVxuICAgIH0sIGZpcnN0U3ltYm9sSWQpXG4gICAgXG4gIH0gZWxzZSB7XG4gICAgLy8gVXBkYXRlIHByZWZlY3R1cmUgcGFpbnQgcHJvcGVydGllc1xuICAgIFxuICAgIG1hcC5zZXRQYWludFByb3BlcnR5KCdwcmVmZWN0dXJlLWxheWVyJywgJ2ZpbGwtY29sb3InLCBwcmVmZWN0dXJlUGFpbnQpXG4gICAgXG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdERhdGFUcmFuc2xhdGUoKSB7XG4gIC8vIEhhbmRsZSBsYW5ndWFnZSBzd2l0Y2hpbmcgdXNpbmcgZGF0YSBwYXJhbXNcblxuICBjb25zdCBzZWxlY3RvciA9ICdbZGF0YS1qYV0nXG4gIGNvbnN0IHBhcnNlTm9kZSA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikuZm9yRWFjaChjYilcbiAgfVxuXG4gIC8vIERlZmF1bHQgd2Vic2l0ZSBpcyBpbiBFbmdsaXNoLiBFeHRyYWN0IGl0IGFzIHRoZSBhdHRyIGRhdGEtZW49XCIuLi5cIlxuICBwYXJzZU5vZGUoZnVuY3Rpb24oZWwpIHtcbiAgICBlbC5kYXRhc2V0WydlbiddID0gZWwudGV4dENvbnRlbnRcbiAgfSlcblxuICAvLyBMYW5ndWFnZSBzZWxlY3RvciBldmVudCBoYW5kbGVyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWxhbmctcGlja2VyXScpLmZvckVhY2goZnVuY3Rpb24ocGljaykge1xuICAgIHBpY2suYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgTEFORyA9IGUudGFyZ2V0LmRhdGFzZXQubGFuZ1BpY2tlclxuICAgICAgXG4gICAgICAvLyBUb2dnbGUgdGhlIGh0bWwgbGFuZyB0YWdzXG4gICAgICBwYXJzZU5vZGUoZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgaWYgKCFlbC5kYXRhc2V0W0xBTkddKSByZXR1cm47XG4gICAgICAgIGVsLnRleHRDb250ZW50ID0gZWwuZGF0YXNldFtMQU5HXVxuICAgICAgfSlcbiAgICAgIFxuICAgICAgLy8gVXBkYXRlIHRoZSBtYXBcbiAgICAgIG1hcC5nZXRTdHlsZSgpLmxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHRoaXNMYXllcil7XG4gICAgICAgIGlmKHRoaXNMYXllci50eXBlID09ICdzeW1ib2wnKXtcbiAgICAgICAgICBtYXAuc2V0TGF5b3V0UHJvcGVydHkodGhpc0xheWVyLmlkLCAndGV4dC1maWVsZCcsIFsnZ2V0JywnbmFtZV8nICsgTEFOR10pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gIFxuICAgICAgLy8gUmVkcmF3IHRoZSBwcmVmZWN0dXJlcyB0YWJsZVxuICAgICAgaWYoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ByZWZlY3R1cmVzLXRhYmxlJykpe1xuICAgICAgICBkcmF3UHJlZmVjdHVyZVRhYmxlKGRkYi5wcmVmZWN0dXJlcywgZGRiLnRvdGFscylcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gVG9nZ2xlIHRoZSBsYW5nIHBpY2tlclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYVtkYXRhLWxhbmctcGlja2VyXScpLmZvckVhY2goZnVuY3Rpb24oZWwpe1xuICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSdcbiAgICAgIH0pXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhW2RhdGEtbGFuZy1waWNrZXI9JytMQU5HKyddJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgICAgXG4gICAgfSlcbiAgfSlcbn1cblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG4gIFxuICAvLyBFbmFibGUgdG9vbHRpcHNcbiAgdGlwcHkoJ1tkYXRhLXRpcHB5LWNvbnRlbnRdJylcblxuICBpbml0RGF0YVRyYW5zbGF0ZSgpXG4gIGRyYXdNYXAoKVxuXG4gIHZhciBwYWdlRHJhd3MgPSAwXG4gIHZhciBzdHlsZUxvYWRlZCA9IGZhbHNlXG4gIHZhciBqc29uRGF0YSA9IHVuZGVmaW5lZFxuICBjb25zdCBGSVZFX01JTlVURVNfSU5fTVMgPSAzMDAwMDBcblxuICBmdW5jdGlvbiB3aGVuTWFwQW5kRGF0YVJlYWR5KCl7XG4gICAgLy8gVGhpcyBydW5zIGRyYXdNYXBQcmVmIG9ubHkgd2hlblxuICAgIC8vIGJvdGggc3R5bGUgYW5kIGpzb24gZGF0YSBhcmUgcmVhZHlcblxuICAgIGlmKCFzdHlsZUxvYWRlZCB8fCAhanNvbkRhdGEpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgZHJhd01hcFByZWZlY3R1cmVzKHBhZ2VEcmF3cylcbiAgfVxuXG4gIG1hcC5vbmNlKCdzdHlsZS5sb2FkJywgZnVuY3Rpb24oZSkge1xuICAgIHN0eWxlTG9hZGVkID0gdHJ1ZVxuICAgIHdoZW5NYXBBbmREYXRhUmVhZHkoKVxuICB9KVxuXG4gIGZ1bmN0aW9uIGxvYWREYXRhT25QYWdlKCkge1xuICAgIGxvYWREYXRhKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGpzb25EYXRhID0gZGF0YVxuXG4gICAgICBkZGIucHJlZmVjdHVyZXMgPSBqc29uRGF0YS5wcmVmZWN0dXJlc1xuICAgICAgbGV0IG5ld1RvdGFscyA9IGNhbGN1bGF0ZVRvdGFscyhqc29uRGF0YS5kYWlseSlcbiAgICAgIGRkYi50b3RhbHMgPSBuZXdUb3RhbHNbMF1cbiAgICAgIGRkYi50b3RhbHNEaWZmID0gbmV3VG90YWxzWzFdXG4gICAgICBkZGIudHJlbmQgPSBqc29uRGF0YS5kYWlseVxuICAgICAgZGRiLmxhc3RVcGRhdGVkID0ganNvbkRhdGEudXBkYXRlZFswXS5sYXN0dXBkYXRlZFxuXG4gICAgICBkcmF3S3BpcyhkZGIudG90YWxzLCBkZGIudG90YWxzRGlmZilcbiAgICAgIGlmICghZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ2VtYmVkLW1vZGUnKSkge1xuICAgICAgICBkcmF3TGFzdFVwZGF0ZWQoZGRiLmxhc3RVcGRhdGVkKVxuICAgICAgICBkcmF3UGFnZVRpdGxlQ291bnQoZGRiLnRvdGFscy5jb25maXJtZWQpXG4gICAgICAgIGRyYXdQcmVmZWN0dXJlVGFibGUoZGRiLnByZWZlY3R1cmVzLCBkZGIudG90YWxzKVxuICAgICAgICBkcmF3VHJlbmRDaGFydChkZGIudHJlbmQpXG4gICAgICB9XG5cbiAgICAgIHdoZW5NYXBBbmREYXRhUmVhZHkoKVxuICAgIH0pXG4gIH1cblxuICBsb2FkRGF0YU9uUGFnZSgpXG5cbiAgLy8gUmVsb2FkIGRhdGEgZXZlcnkgSU5URVJWQUxcbiAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgcGFnZURyYXdzKytcbiAgICBsb2FkRGF0YU9uUGFnZSgpXG4gIH0sIEZJVkVfTUlOVVRFU19JTl9NUylcbn0iLCIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW4iXSwic291cmNlUm9vdCI6IiJ9