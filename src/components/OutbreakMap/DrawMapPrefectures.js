import i18next from "i18next";
import {
  PREFECTURE_JSON_PATH,
  PREFECTURE_PAINT,
  PREFECTURE_POPULATIONS,
  PREFECTURE_CENTERS,
  COLOR_YELLOW,
  COLOR_ORANGE,
  COLOR_RED,
  COLOR_DARK_RED,
  COLOR_BURGUNDY,
  COLOR_DARK_BURGUNDY,
  COLOR_BLACK,
  COLOR_NONE,
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

  // Start building the GeoJSON source for extrusions
  const prefectureCenters = {
    type: "FeatureCollection",
    features: [],
  };

  // Go through all prefectures looking for cases
  ddb.prefectures.map((prefecture) => {
    let cases = parseInt(prefecture.confirmed);
    if (cases > 0) {
      const prefectureCenter = PREFECTURE_CENTERS[prefecture.name];
      if (prefectureCenter) {
        // Doesn't exist for Diamond Princess, etc.
        // Make a rough-and-ready circle approximation for the base of the extrusion
        const delta = 0.15;
        const deltaCorner = delta / Math.sqrt(2);
        prefectureCenters.features.push({
          type: "Feature",
          properties: { confirmed: cases }, // TODO: Does this need to be updated dynamically?
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [prefectureCenter.long + delta, prefectureCenter.lat],
                [
                  prefectureCenter.long + deltaCorner,
                  prefectureCenter.lat + deltaCorner,
                ],
                [prefectureCenter.long, prefectureCenter.lat + delta],
                [
                  prefectureCenter.long - deltaCorner,
                  prefectureCenter.lat + deltaCorner,
                ],
                [prefectureCenter.long - delta, prefectureCenter.lat],
                [
                  prefectureCenter.long - deltaCorner,
                  prefectureCenter.lat - deltaCorner,
                ],
                [prefectureCenter.long, prefectureCenter.lat - delta],
                [
                  prefectureCenter.long + deltaCorner,
                  prefectureCenter.lat - deltaCorner,
                ],
                [prefectureCenter.long + delta, prefectureCenter.lat],
              ],
            ],
          },
        });
      }
      prefecturePaint.push(prefecture.name);

      let caseRate =
        cases / (PREFECTURE_POPULATIONS[prefecture.name] / 1000000);

      if (caseRate <= 49) {
        // 1-49 cases/million
        prefecturePaint.push(COLOR_YELLOW);
      } else if (caseRate <= 99) {
        // 50-99 cases/million
        prefecturePaint.push(COLOR_ORANGE);
      } else if (caseRate <= 149) {
        // 100-149 cases/million
        prefecturePaint.push(COLOR_RED);
      } else if (caseRate <= 199) {
        // 150-199 cases/million
        prefecturePaint.push(COLOR_DARK_RED);
      } else {
        // 200+ cases/million
        prefecturePaint.push(COLOR_DARK_BURGUNDY);
      }
    }
  });

  // Add a final value to the list for the default color
  prefecturePaint.push(COLOR_NONE);

  if (pageDraws === 0) {
    // If it is the first time drawing the map

    map.addSource("prefectures", {
      type: "geojson",
      data: PREFECTURE_JSON_PATH,
    });

    map.addSource("prefecture-centers", {
      type: "geojson",
      data: prefectureCenters,
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

    map.addLayer(
      {
        id: "prefecture-extrusion-layer",
        type: "fill-extrusion",
        source: "prefecture-centers",
        paint: {
          "fill-extrusion-color": "black",
          "fill-extrusion-height": ["*", ["get", "confirmed"], 200],
          "fill-extrusion-opacity": 0.7,
        },
      },
      firstSymbolId
    );
  } else {
    // Update prefecture paint properties
    map.setPaintProperty("prefecture-layer", "fill-color", prefecturePaint);
  }

  // Map popup for prefectures
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  map.on("mousemove", function (e) {
    const feature = map.queryRenderedFeatures(e.point, {
      layers: ["prefecture-layer"],
    })[0];
    if (feature) {
      const matchingPrefectures = ddb.prefectures.filter((p) => {
        return p.name === feature.properties.NAME_1;
      });

      if (!matchingPrefectures || matchingPrefectures.length < 1) {
        return;
      }

      const thisPrefecture = matchingPrefectures[0];
      if (typeof thisPrefecture === "undefined") {
        return; // This happens if prefecture doesn't have any stats (e.g. Iwate)
      }

      let increment = thisPrefecture.newlyConfirmed;
      if (increment > 0) {
        var popupIncrementSpan = `<span class='popup-increment'>(+${increment})</span>`;
      } else {
        var popupIncrementSpan = "";
      }

      const name = thisPrefecture.name;
      const confirmed = thisPrefecture.confirmed;
      const casesPerMillion = Math.floor(
        confirmed / (PREFECTURE_POPULATIONS[name] / 1000000)
      );
      const deaths = thisPrefecture.deaths;
      const recovered = thisPrefecture.recovered;
      const active =
        thisPrefecture.confirmed -
        ((thisPrefecture.recovered || 0) + (thisPrefecture.deaths || 0));
      const html = `<div class="map-popup">
      <h3 data-i18n="prefectures.${name}">${i18next.t(
        "prefectures." + name
      )}</h3>
          <span data-i18n="confirmed">${i18next.t(
            "confirmed"
          )}</span>: ${confirmed} ${popupIncrementSpan}<br />
          <span data-i18n="Cases per million">${i18next.t(
            "Cases per million"
          )}</span>: ${casesPerMillion} ${popupIncrementSpan}<br />
          <span data-i18n="recovered">${i18next.t(
            "recovered"
          )}</span>: ${recovered}<br />
          <span data-i18n="deaths">${i18next.t(
            "deaths"
          )}</span>: ${deaths}<br />
          <span data-i18n="active">${i18next.t("active")}</span>: ${active}
          </div>`;
      popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
    } else {
      popup.remove();
    }
  });

  return { map, ddb };
};

export default drawMapPrefectures;
