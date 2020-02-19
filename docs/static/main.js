'use strict';
mapboxgl.accessToken = 'pk.eyJ1IjoicmV1c3RsZSIsImEiOiJjazZtaHE4ZnkwMG9iM3BxYnFmaDgxbzQ0In0.nOiHGcSCRNa9MD9WxLIm7g'

// Init Map
var map = new mapboxgl.Map({
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

// Disable map rotation using right click + drag
map.dragRotate.disable()

// Disable map rotation using touch rotation gesture
map.touchZoomRotate.disableRotation()

// Disable scroll zooming
map.scrollZoom.disable()

// Load prefecture data
map.once('style.load', function(e) {
  
  var layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  var firstSymbolId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol') {
      firstSymbolId = layers[i].id;
      break;
    }
  }
  
  map.addControl(new mapboxgl.NavigationControl({
    showCompass: false,
    showZoom: true
  }))
  
  map.addSource('prefectures', {
    type: 'geojson',
    data: 'static/prefectures.geojson',
  })

  // Start the Mapbox search expression
  let prefecturePaint = [
    'match',
    ['get', 'NAME_1'],
  ]
  
  // Load the google spreadsheet
  async function loadSheet() {
    
    // Init the load with drive-db
    // Patient Data Sheet
    const db = await drive({
      sheet: '1jfB4muWkzKTR0daklmf8D5F0Uf_IYAgcx_-Ij9McClQ',
      tab: '1', // Patient Data Sheet
      cache: 3600,
      onload: data => data
    })
    
    // Go through all prefectures looking for cases
    db.forEach(function(prefecture){
      
      let cases = parseInt(prefecture.cases)
      if(cases > 0){
        prefecturePaint.push(prefecture.prefecture)
        
        if(cases <= 10){
          // 1-10 cases
          prefecturePaint.push('#fdeacb')
        }else if(cases <= 25){
          // 11-25 cases
          prefecturePaint.push('#fb9b7f')
        }else if(cases <= 50){
          // 26-50 cases
          prefecturePaint.push('#f44336')
        }else{
          // 51+ cases
          prefecturePaint.push('#ba000d')
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
        //'fill-outline-color': '#cbcccb',
      }
    }, firstSymbolId)
    
    // Map is finished, now draw the data table
    drawDataTable(db)
  }
  loadSheet()
  
})

function drawDataTable(prefectures){
  
  let totalCases = 0
  let totalRecovered = 0
  let totalDeaths = 0
  let dataTable = document.querySelector('#data-table tbody')
  let unspecifiedRow = ''
  
  // Remove the loading cell
  dataTable.removeChild(dataTable.querySelector('.loading'))

  prefectures.forEach(function(prefecture){
    let cases = parseInt(prefecture.cases)
    let recovered = 0
    if(prefecture.recovered){
      recovered = parseInt(prefecture.recovered)
    }
    let deaths = 0
    if(prefecture.deaths){
      deaths = parseInt(prefecture.deaths)
    }
    if(cases == 0){
      return
    }
    
    totalCases += cases
    totalRecovered += recovered
    totalDeaths += deaths
    
    if(prefecture.prefecture == '*Unspecified'){
      // Save the "*Unspecified" row for the end of the table
      unspecifiedRow = '<tr><td><em>'+prefecture.prefecture+'</em></td><td>'+prefecture.cases+'</td><td></td><td>'+(deaths?deaths:'')+'</td></tr>'
    }else{
      dataTable.innerHTML = dataTable.innerHTML + '<tr><td>'+prefecture.prefecture+'</td><td>'+prefecture.cases+'</td><td></td><td>'+(deaths?deaths:'')+'</td></tr>'
    }
  })
  
  dataTable.innerHTML = dataTable.innerHTML + unspecifiedRow
  
  dataTable.innerHTML = dataTable.innerHTML + '<tr class="totals"><td>Total</td><td>'+totalCases+'</td><td>'+totalRecovered+'</td><td>'+totalDeaths+'</td></tr>'
  
  // Also update the KPI table
  document.querySelector('#kpi-confirmed').innerHTML = totalCases
  document.querySelector('#kpi-recovered').innerHTML = totalRecovered
  document.querySelector('#kpi-deceased').innerHTML = totalDeaths
}

function drawTrendChart(sheetTrend) {
  
  let timeFormat = 'YYYY-MM-DD'
  let lastUpdated = ''
  
  let labelSet = []
  let confirmedSet = []
  let recoveredSet = []
  let deceasedSet = []
  sheetTrend.forEach(function(trendData){
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
  
  document.getElementById('last-updated').innerHTML = lastUpdated
  
  var ctx = document.getElementById('trend-chart').getContext('2d')
  Chart.defaults.global.defaultFontFamily = "'Open Sans', helvetica, sans-serif"
  Chart.defaults.global.defaultFontSize = 16
  Chart.defaults.global.defaultFontColor = '#000a12'
  
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: labelSet,
        datasets: [
          {
            label: 'Deceased',
            borderColor: 'rgb(55,71,79)',
            backgroundColor: 'rgb(55,71,79)',
            fill: false,
            data: deceasedSet
          },
          {
            label: 'Recovered',
            borderColor: 'rgb(25,118,210)',
            backgroundColor: 'rgb(25,118,210)',
            fill: false,
            data: recoveredSet
          },
          {
            label: 'Confirmed',
            borderColor: 'rgb(244,67,54)',
            backgroundColor: 'rgb(244,67,54)',
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
            parser: timeFormat,
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
async function loadTrendData(){
  const sheetTrend = await drive({
    sheet: '1jfB4muWkzKTR0daklmf8D5F0Uf_IYAgcx_-Ij9McClQ',
    tab: '6', // Sum By Day
    cache: 3600,
    onload: data => data
  })

  drawTrendChart(sheetTrend)
}
loadTrendData()
