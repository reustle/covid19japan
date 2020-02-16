'use strict';
mapboxgl.accessToken = 'pk.eyJ1IjoicmV1c3RsZSIsImEiOiJjazZtaHE4ZnkwMG9iM3BxYnFmaDgxbzQ0In0.nOiHGcSCRNa9MD9WxLIm7g';

// Init Map
var map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/light-v10',
    zoom: 4,
    center: {
        lng: 139.11792973051274,
        lat: 38.52245616545571
    }
})

// Disable map rotation using right click + drag
map.dragRotate.disable()

// Disable map rotation using touch rotation gesture
map.touchZoomRotate.disableRotation()

// Disable scroll zooming
map.scrollZoom.disable()

// Load prefecture data
map.once('style.load', function(e) {
  
  map.addControl(new mapboxgl.NavigationControl({
    showCompass: false,
    showZoom: true
  }))
  
  map.addSource('prefectures', {
    type: 'geojson',
    data: 'static/prefectures.geojson',
    buffer: 0,
    //maxzoom: 12
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
    prefecturePaint.push('#d0d0d0')
    console.log(prefecturePaint)
    
    map.addLayer({
      'id': 'prefecture-layer',
      'type': 'fill',
      'source': 'prefectures',
      'layout': {},
      'paint': {
        'fill-color': prefecturePaint,
        'fill-opacity': 0.75,
        'fill-outline-color': '#fff',
      }
    })
  }
  loadSheet()
  
})
