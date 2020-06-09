import i18next from "i18next";
import {
  PREFECTURE_PAINT,
  COLOR_NONE,
  MAP_COLOR_BOUNDARIES,
  LEGEND_CLASSES,
} from "../../data/constants";

const PREFECTURE_JSON_PATH = "static/prefectures.geojson";
let pageDrawCount = 0;

/**
 * drawMapPrefectures
 * @param {*} pageDraws - number of redraws to screen
 */
const drawMapPrefectures = (ddb, map, lang) => {
  const formatNumber = new Intl.NumberFormat(lang).format;

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

  const drawLegend = () => {
    var classIndex = 0;
    var previousBoundary = 1;
    var html = "";
    for (let boundary of Object.keys(MAP_COLOR_BOUNDARIES).sort()) {
      let span = isFinite(boundary)
        ? i18next.t("cases-range", {
            from: formatNumber(previousBoundary),
            to: formatNumber(boundary - 1),
          })
        : i18next.t("cases-last", { from: formatNumber(previousBoundary) });
      html += `<div><span class="${LEGEND_CLASSES[classIndex]}">▉</span> ${span}</div>`;

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
    let cases = parseInt(prefecture.confirmed);
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
          )}</span>: ${formatNumber(confirmed)} ${popupIncrementSpan}<br />
          <span data-i18n="recovered">${i18next.t(
            "recovered"
          )}</span>: ${formatNumber(recovered)}<br />
          <span data-i18n="deaths">${i18next.t(
            "deaths"
          )}</span>: ${formatNumber(deaths)}<br />
          <span data-i18n="active">${i18next.t(
            "active"
          )}</span>: ${formatNumber(active)}
          </div>`;
      popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
    } else {
      popup.remove();
    }
  });

  return { map, ddb };
};

export default drawMapPrefectures;
