const MAPBOX_API_KEY =
  "pk.eyJ1IjoicmV1c3RsZSIsImEiOiJjazZtaHE4ZnkwMG9iM3BxYnFmaDgxbzQ0In0.nOiHGcSCRNa9MD9WxLIm7g";
const MAP_CONFIG = {
  container: "map-container",
  style: "mapbox://styles/mapbox/light-v10?optimize=true",
  zoom: 4,
  minZoom: 3.5,
  maxZoom: 7,
  center: {
    lng: 139.11792973051274,
    lat: 38.52245616545571,
  },
  maxBounds: [
    { lat: 12.118318014416644, lng: 100.01240618330542 }, // SW
    { lat: 59.34721256263214, lng: 175.3273570446982 }, // NE
  ],
  localIdeographFontFamily:
    "'Meiryo', 'Hiragino Kaku Gothic Pro', 'Noto Sans', 'Noto Sans CJK JP', sans-serif",
};

// Create and initializes the map.
const drawMap = () => {
  mapboxgl.accessToken = MAPBOX_API_KEY;
  let map = new mapboxgl.Map(MAP_CONFIG);
  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();
  map.scrollZoom.disable();
  map.addControl(
    new mapboxgl.NavigationControl({
      showCompass: false,
      showZoom: true,
    })
  );
  return map;
};

export default drawMap;
