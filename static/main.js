'use strict';

mapboxgl.accessToken = 'pk.eyJ1IjoicmV1c3RsZSIsImEiOiJjazZtaHE4ZnkwMG9iM3BxYnFmaDgxbzQ0In0.nOiHGcSCRNa9MD9WxLIm7g'
const PREFECTURE_JSON_PATH = 'static/prefectures.geojson'
const SHEET_ID = '1jfB4muWkzKTR0daklmf8D5F0Uf_IYAgcx_-Ij9McClQ'
const SHEET_PREFECTURES_TAB = 1
const SHEET_DAILY_SUM_TAB = 3
const TIME_FORMAT = 'YYYY-MM-DD'
const COLOR_CONFIRMED = 'rgb(244,67,54)'
const COLOR_RECOVERED = 'rgb(25,118,210)'
const COLOR_DECEASED = 'rgb(55,71,79)'
const PAGE_TITLE = 'Coronavirus Disease (COVID-19) Japan Tracker'

// Global vars
let ddb = {
  prefectures: undefined,
  byDay: undefined,
}
let map = undefined


function loadPrefectureData(callback) {
  // Load the prefectures tab of the
  // spreadsheet using drive-db
  
  function validate(data) {
    // Make sure we've loaded the correct sheet

    if(data.length && data[0] && data[0].prefecture && data[0].prefecture.length > 0){
      return true
    }
    return false
  }
  
  drive({
    sheet: SHEET_ID,
    tab: SHEET_PREFECTURES_TAB,
  })
  .then((data) => {
    if(!validate(data)){
      console.error('Error validating prefectures sheet')
      return
    }
    
    ddb.prefectures = data
    if(callback){ callback() }
  })
  .catch((error) => {
    console.error('Error Loading Sheet: ', error);
  })
  
}


function loadTrendData(callback){
  
  function validate(data) {
    if(data.length && data[0] && data[0].date && data[0].confirmed){
      return true
    }
    return false
  }

  drive({
    sheet: SHEET_ID,
    tab: SHEET_DAILY_SUM_TAB,
  })
  .then((data) => {
    if(!validate(data)){
      console.error('Error validating daily sum sheet')
      return
    }

    ddb.trendData = data
    if(callback){ callback() }
  })
  .catch((error) => {
    console.error('Error Loading Sheet: ', error);
  })

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
    
    lastUpdated = trendData.date
  })
  
  drawLastUpdated(lastUpdated)
  
  var ctx = document.getElementById('trend-chart').getContext('2d')
  Chart.defaults.global.defaultFontFamily = "'Open Sans', helvetica, sans-serif"
  Chart.defaults.global.defaultFontSize = 16
  Chart.defaults.global.defaultFontColor = 'rgb(0,10,18)'
  
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
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
          }
        ]
    },

    // Configuration options go here
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


function drawPrefectureTable(prefectures) {
  // Draw the Cases By Prefecture table
  
  let totalCases = 0
  let totalRecovered = 0
  let totalDeaths = 0
  let dataTable = document.querySelector('#data-table tbody')
  let unspecifiedRow = ''
  
  // Remove the loading cell
  dataTable.removeChild(dataTable.querySelector('.loading'))

  
  prefectures.map(function(pref){
    pref.cases = parseInt(pref.cases)
  })
  _.orderBy(prefectures, 'cases', 'desc').map(function(prefecture){
    let cases = parseInt(prefecture.cases)
    let recovered = 0
    if(prefecture.recovered){
      recovered = parseInt(prefecture.recovered)
    }
    let deaths = 0
    if(prefecture.deaths){
      deaths = parseInt(prefecture.deaths)
    }
    if(!cases && !recovered && !deaths){
      return
    }
    
    totalCases += cases
    totalRecovered += recovered
    totalDeaths += deaths
    
    if(prefecture.prefecture == 'Unspecified'){
      // Save the "Unspecified" row for the end of the table
      
      unspecifiedRow = `<tr><td><em>${prefecture.prefecture}</em></td><td>${prefecture.cases}</td><td>${prefecture.recovered}</td><td>${prefecture.deaths}</td></tr>`
    }else{
      dataTable.innerHTML = `${dataTable.innerHTML}<tr><td>${prefecture.prefecture}</td><td>${prefecture.cases}</td><td></td><td>${(deaths?deaths:'')}</td></tr>`
    }
    return true
  })
  
  dataTable.innerHTML = dataTable.innerHTML + unspecifiedRow
  
  dataTable.innerHTML = `${dataTable.innerHTML}<tr class="totals"><td>Total</td><td>${totalCases}</td><td>${totalRecovered}</td><td>${totalDeaths}</td></tr>`
  
  drawKpis(totalCases, totalRecovered, totalDeaths)
  setPageTitleCount(totalCases)
}


function drawKpis(confirmed, recovered, deaths) {
  // Draw the KPI values

  document.querySelector('#kpi-confirmed').innerHTML = confirmed
  document.querySelector('#kpi-recovered').innerHTML = recovered
  document.querySelector('#kpi-deceased').innerHTML = deaths

}


function drawLastUpdated(lastUpdated) {
  // Draw the last updated time
  
  let prettyUpdatedTime = moment(lastUpdated).format('MMM D, YYYY') + ' JST'
  document.getElementById('last-updated').innerHTML = prettyUpdatedTime
}


function setPageTitleCount(confirmed) {
  // Update the number of confirmed cases in the title
  
  document.title = `(${confirmed}) ${PAGE_TITLE}`
}


function drawMapPrefectures() {
  // Find the index of the first symbol layer
  // in the map style so we can draw the
  // prefecture colors behind it
  var firstSymbolId;
  var layers = map.getStyle().layers;
  for(var i = 0; i < layers.length; i++) {
    if(layers[i].type === 'symbol') {
      firstSymbolId = layers[i].id;
      break;
    }
  }
  
  map.addSource('prefectures', {
    type: 'geojson',
    data: PREFECTURE_JSON_PATH,
  })

  // Start the Mapbox search expression
  let prefecturePaint = [
    'match',
    ['get', 'NAME_1'],
  ]
  
  // data = ddb.prefectures
  
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
  
  // Add the final value to use as the default color
  prefecturePaint.push('rgba(0,0,0,0)')
  
  // Add the prefecture color layer to the map
  map.addLayer({
    'id': 'prefecture-layer',
    'type': 'fill',
    'source': 'prefectures',
    'layout': {},
    'paint': {
      'fill-color': prefecturePaint,
      'fill-opacity': 0.8,
    }
  }, firstSymbolId)
  
}

function init() {
  drawMap()

  map.once('style.load', function(e) {
    loadPrefectureData(function(){
      drawMapPrefectures(ddb.prefectures)
      drawPrefectureTable(ddb.prefectures)
    })
  })

  loadTrendData(function() {
    drawTrendChart(ddb.trendData)
  })
}
init()
