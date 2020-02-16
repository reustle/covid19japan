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
    const db = await drive({
      sheet: '1jfB4muWkzKTR0daklmf8D5F0Uf_IYAgcx_-Ij9McClQ',
      tab: '2',
      cache: 3600,
      onload: data => data
    })
    
    // Go through all prefectures looking for cases
    db.forEach(function(prefecture){
      
      let cases = parseInt(prefecture.cases)
      if(cases > 0){
        prefecturePaint.push(prefecture.prefecture)
        
        if(cases == 1){
          // 1 case
          prefecturePaint.push('#fceacf')
        }else if(cases <= 5){
          // 2-5 cases
          prefecturePaint.push('#f89a85')
        }else if(cases <= 10){
          // 6-10 cases
          prefecturePaint.push('#e55c4e')
        }else{
          // 11+ cases
          prefecturePaint.push('#cb2c38')
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

  prefectures.forEach(function(prefecture){
    console.log(prefecture)
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

    dataTable.innerHTML = dataTable.innerHTML + '<tr><td>'+prefecture.prefecture+'</td><td>'+prefecture.cases+'</td><td></td><td>'+(deaths?deaths:'')+'</td></tr>'
  })
  
  dataTable.innerHTML = dataTable.innerHTML + '<tr class="totals"><td>Total</td><td>'+totalCases+'</td><td>'+totalRecovered+'</td><td>'+totalDeaths+'</td></tr>'
}
