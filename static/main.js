'use strict';

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
  }
}
let map = undefined
const prefectureCaseLookup = {}


function loadData(callback) {
  // Load the json data file

  fetch(JSON_PATH).then(function(res){
    return res.json()
  })
  .then(function(data){
    callback(data)
    })
}


function calculateTotals(prefectures) {
  // Calculate the totals

  const totals = {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
  }

  for (let i = 0; i < prefectures.length; i++) {
    const pref = prefectures[i];
    prefectureCaseLookup[pref.prefecture] = pref.cases && pref.cases > 0 ? pref.cases : 0;

    // TODO change to confirmed
    totals.confirmed += (pref.cases ? parseInt(pref.cases) : 0)
    totals.recovered += (pref.recovered ? parseInt(pref.recovered) : 0)
    // TODO changed to deceased
    totals.deceased += (pref.deaths ? parseInt(pref.deaths) : 0)
  }

  return totals
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


function drawKpis(totals) {
  // Draw the KPI values

  document.querySelector('#kpi-confirmed').innerHTML = totals.confirmed
  document.querySelector('#kpi-recovered').innerHTML = totals.recovered
  document.querySelector('#kpi-deceased').innerHTML = totals.deceased
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

  // Go through all prefectures looking for cases
  for (let i = 0; i < ddb.prefectures.length; i++) {
    const prefecture = ddb.prefectures[i]

    const cases = parseInt(prefecture.cases)
    if (cases > 0) {
      prefecturePaint.push(prefecture.prefecture)
      let color = '';

      const CASE_COLORS = {
        UNTIL_10: 'rgb(253,234,203)',
        UNTIL_25: 'rgb(251,155,127)',
        UNTIL_50: 'rgb(244,67,54)',
        PLUS_51: 'rgb(186,0,13)'
      }

      if (cases <= 10) {
        // 1-10 cases
        color = CASE_COLORS.UNTIL_10
      } else if (cases <= 25) {
        // 11-25 cases
        color = CASE_COLORS.UNTIL_25
      } else if (cases <= 50) {
        // 26-50 cases
        color = CASE_COLORS.UNTIL_50
      } else {
        // 51+ cases
        color = CASE_COLORS.PLUS_51
      }

      prefecturePaint.push(color)
    }
  }

  // Add a final value to the list for the default color
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

  // Create a popup
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('mouseenter', 'prefecture-layer', function (e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const hoveredPrefecture = e.features[0].properties.NAME_1

    // Some cities around Nagasaki are undefined
    const cases = prefectureCaseLookup[hoveredPrefecture] || "?";

    popup
      .setLngLat({ lat: e.lngLat.lat, lng: e.lngLat.lng })
      .setHTML(cases)
      .addTo(map);
  });

  map.on('mouseleave', 'prefecture-layer', function () {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });
}


function initDataTranslate() {
  // Handle language switching

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
