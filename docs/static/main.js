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

// Load prefecture data
map.once('style.load', function(e) {
  map.addSource('prefectures', {
    type: 'geojson',
    data: 'static/prefectures.json',
    buffer: 0,
    //maxzoom: 12
  })
})
