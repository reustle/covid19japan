import { MAP_CONFIG } from "../../data/constants";

const drawMap = (mapboxgl, map) => {
  // Initialize Map
  map = new mapboxgl.Map(MAP_CONFIG);
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
