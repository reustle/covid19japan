export const drawMap = (mapboxgl, map) => {
  // Initialize Map

  map = new mapboxgl.Map({
    container: "map-container",
    style: "mapbox://styles/mapbox/light-v10",
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
  });

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
