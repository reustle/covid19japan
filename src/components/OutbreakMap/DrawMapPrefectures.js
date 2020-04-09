import {
  PREFECTURE_JSON_PATH,
  PREFECTURE_PAINT,
  COLOR_YELLOW,
  COLOR_ORANGE,
  COLOR_RED,
  COLOR_BURGUNDY,
  COLOR_BLACK,
} from "../../data/constants";
/**
 * drawMapPrefectures
 * @param {*} pageDraws - number of redraws to screen
 */
const drawMapPrefectures = (pageDraws, ddb, map) => {
  // Find the index of the first symbol layer
  // in the map style so we can draw the
  // prefecture colors behind it

  let firstSymbolId;
  const { layers = [] } = map.getStyle();
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol") {
      firstSymbolId = layers[i].id;
      break;
    }
  }

  // Start the Mapbox search expression
  const prefecturePaint = [...PREFECTURE_PAINT];
  // Go through all prefectures looking for cases
  ddb.prefectures.map((prefecture) => {
    let cases = parseInt(prefecture.confirmed);
    if (cases > 0) {
      prefecturePaint.push(prefecture.name);

      if (cases <= 50) {
        // 1-50 cases
        prefecturePaint.push(COLOR_YELLOW);
      } else if (cases <= 100) {
        // 51-100 cases
        prefecturePaint.push(COLOR_ORANGE);
      } else if (cases <= 200) {
        // 101-200 cases
        prefecturePaint.push(COLOR_RED);
      } else {
        // 201+ cases
        prefecturePaint.push(COLOR_BURGUNDY);
      }
    }
  });

  // Add a final value to the list for the default color
  prefecturePaint.push(COLOR_BLACK);

  if (pageDraws === 0) {
    // If it is the first time drawing the map

    map.addSource("prefectures", {
      type: "geojson",
      data: PREFECTURE_JSON_PATH,
    });

    // Add the prefecture color layer to the map
    map.addLayer(
      {
        id: "prefecture-layer",
        type: "fill",
        source: "prefectures",
        layout: {},
        paint: {
          "fill-color": prefecturePaint,
          "fill-opacity": 0.8,
        },
      },
      firstSymbolId
    );

    // Add another layer with type "line"
    // to provide a styled prefecture border
    let prefBorderLayer = map.addLayer(
      {
        id: "prefecture-outline-layer",
        type: "line",
        source: "prefectures",
        layout: {},
        paint: {
          "line-width": 0.5,
          "line-color": "#c0c0c0",
          "line-opacity": 0.5,
        },
      },
      firstSymbolId
    );
  } else {
    // Update prefecture paint properties
    map.setPaintProperty("prefecture-layer", "fill-color", prefecturePaint);
  }

  return { map, ddb };
};

export default drawMapPrefectures;
