import i18next from "i18next";
import { maybeIntlNumberFormat } from "../../i18n";
import {
  PREFECTURE_PAINT,
  COLOR_NONE,
  MAP_COLOR_BOUNDARIES,
  LEGEND_CLASSES,
} from "../../data/constants";

const PREFECTURE_JSON_PATH = "static/prefectures-smooth.geojson";
let pageDrawCount = 0;

/**
 * drawMapPrefectures
 * @param {*} pageDraws - number of redraws to screen
 */
const drawMapPrefectures = (ddb, map, lang) => {
  const formatNumber = maybeIntlNumberFormat(lang);

  // Find the index of the first symbol layer
  // in the map style so we can draw the
  // prefecture colors behind it

  let firstSymbolId;
  const { layers = [] } = map.getStyle();
  if (!layers) {
    return;
  }

  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol") {
      firstSymbolId = layers[i].id;
      break;
    }
  }

  const getLegendLabel = (boundary, previousBoundary) => {
    if (previousBoundary === 0) {
      return i18next.t("cases-none");
    }
    if (!isFinite(boundary)) {
      return i18next.t("cases-last", { from: formatNumber(previousBoundary) });
    }
    return i18next.t("cases-range", {
      from: formatNumber(previousBoundary),
      to: formatNumber(boundary - 1),
    });
  };
  const drawLegend = () => {
    var classIndex = 0;
    var previousBoundary = 0;
    var html = "";
    for (let boundary of Object.keys(MAP_COLOR_BOUNDARIES).sort(
      (a, b) => a - b
    )) {
      let label = getLegendLabel(boundary, previousBoundary);
      html += `<div><span class="${LEGEND_CLASSES[classIndex]}">▉</span> ${label}</div>`;

      classIndex = (classIndex + 1) % LEGEND_CLASSES.length;
      previousBoundary = boundary;
    }
    return html;
  };
  document.getElementById("map-legend").innerHTML = drawLegend();

  // Start the Mapbox search expression
  const prefecturePaint = [...PREFECTURE_PAINT];
  // Go through all prefectures looking for cases
  ddb.prefectures.map((prefecture) => {
    let cases = parseInt(prefecture.active);
    if (cases > 0) {
      prefecturePaint.push(prefecture.name);
      let matchingBoundary = Object.keys(MAP_COLOR_BOUNDARIES).find(
        (boundary) => cases < boundary
      );
      let color = MAP_COLOR_BOUNDARIES[matchingBoundary];
      prefecturePaint.push(color);
    }
  });

  // Add a final value to the list for the default color
  prefecturePaint.push(COLOR_NONE);

  if (pageDrawCount === 0) {
    pageDrawCount++;
    // If it is the first time drawing the map
    map.addSource("prefectures", {
      type: "geojson",
      data: PREFECTURE_JSON_PATH,
      generateId: true,
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

    // HIGHLIGHT PREFECTURE BOUNDARY
    map.addLayer({
      id: "prefecture-outline-layer",
      type: "line",
      source: "prefectures",
      layout: {},
      paint: {
        "line-width": [
          "interpolate",
          ["exponential", 2],
          ["zoom"],
          3,
          0.5,
          7.5,
          1.5,
        ],
        "line-dasharray": [2, 1],
        "line-color": "rgb(25,25,25)",
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          1,
          0.2,
        ],
      },
    });
  } else {
    // Update prefecture paint properties
    map.setPaintProperty("prefecture-layer", "fill-color", prefecturePaint);
  }

  // Map popup for prefectures
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 25,
    className: "popup-content",
  });

  map.on("mousemove", function (e) {
    const feature = map.queryRenderedFeatures(e.point, {
      layers: ["prefecture-layer"],
    })[0];
    if (feature) {
      const matchingPrefectures = ddb.prefectures.filter((p) => {
        return p.name === feature.properties.name;
      });

      if (!matchingPrefectures || matchingPrefectures.length < 1) {
        return;
      }

      const thisPrefecture = matchingPrefectures[0];
      if (typeof thisPrefecture === "undefined") {
        return; // This happens if prefecture doesn't have any stats (e.g. Iwate)
      }

      let increment = thisPrefecture.newlyConfirmed;
      let popupIncrementSpan = "";
      if (increment > 0) {
        popupIncrementSpan = `<span class='popup-increment'>(+${increment})</span>`;
      }

      const prefectureStringId = `prefectures.${thisPrefecture.name}`;
      const prefectureName = i18next.t(prefectureStringId);
      const confirmed = formatNumber(thisPrefecture.confirmed);
      const deaths = formatNumber(thisPrefecture.deaths);
      const recovered = formatNumber(thisPrefecture.recovered);
      const active = formatNumber(thisPrefecture.active);
      const deathsLabel = i18next.t("deaths");
      const recoveredLabel = i18next.t("recovered");
      const confirmedLabel = i18next.t("confirmed");
      const activeLabel = i18next.t("active");

      const html = `
        <div class="map-popup">
          <h3 data-i18n="${prefectureStringId}">${prefectureName}</h3>
          <div><span data-i18n="active">${activeLabel}</span>: ${active}</div>
          <div><span data-i18n="confirmed">${confirmedLabel}</span>: ${confirmed} ${popupIncrementSpan}</div>
          <div><span data-i18n="recovered">${recoveredLabel}</span>: ${recovered}</div>
          <div><span data-i18n="deaths">${deathsLabel}</span>: ${deaths}</div>
        </div>`;
      popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
    } else {
      popup.remove();
    }
  });

  var hoveredStateId = null;

  map.on("mousemove", "prefecture-layer", (e) => {
    map.setFeatureState(
      { source: "prefectures", id: hoveredStateId },
      { hover: false }
    );
    if (e.features.length > 0) {
      if (hoveredStateId) {
        map.setFeatureState(
          { source: "prefectures", id: hoveredStateId },
          { hover: false }
        );
      }
      hoveredStateId = e.features[0].id;
      map.setFeatureState(
        { source: "prefectures", id: hoveredStateId },
        { hover: true }
      );
    }
  });

  map.on("mouseleave", "prefecture-layer", (e) => {
    if (e) {
      map.setFeatureState(
        { source: "prefectures", id: hoveredStateId },
        { hover: false }
      );
    }
    hoveredStateId = null;
  });

  return { map, ddb };
};

export default drawMapPrefectures;
