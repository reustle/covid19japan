import * as c3 from "c3";
import * as d3 from "d3";
import i18next from "i18next";

import { maybeIntlNumberFormat } from "../../i18n";

// Inject IE11 polyfill (not used in index.js).
import "core-js/es/object/values";

const drawTrajectoryChart = (
  areas,
  trajectoryChart,
  lang,
  bindElement,
  type
) => {
  const formatNumber = maybeIntlNumberFormat(lang);
  const minimumConfirmed = 500;
  const filteredAreas = areas.filter((area) => {
    return area.confirmed >= minimumConfirmed;
  });
  const trajectories = filteredAreas.reduce((t, area) => {
    const cumulativeConfirmed = area.dailyConfirmedCount.reduce(
      (result, value) => {
        if (result.length > 0) {
          const sum = result[result.length - 1] + value;
          result.push(sum);
          return result;
        } else {
          return [value];
        }
      },
      []
    );
    const cumulativeConfirmedFromMinimum = cumulativeConfirmed.filter(
      (value) => value >= minimumConfirmed
    );
    const translatedName =
      i18next.getResource(lang, "translation", `${type}.${area.name}`) ||
      area.name;
    t[translatedName] = {
      name: translatedName,
      confirmed: area.confirmed,
      cumulativeConfirmed: cumulativeConfirmedFromMinimum,
      lastIndex: cumulativeConfirmedFromMinimum.length - 1,
    };
    return t;
  }, {});

  const trajectoryValues = Object.values(trajectories);
  const columns = trajectoryValues.map((area) =>
    [area.name].concat(area.cumulativeConfirmed)
  );

  const regions = trajectoryValues.map((area) => {
    const value = area.lastIndex;
    if (value > 0) {
      return [{ start: value - 1, end: value, style: "dashed" }];
    } else {
      return [];
    }
  });

  const maxDays = trajectoryValues.reduce(
    (a, b) => Math.max(a, b.lastIndex),
    0
  );

  if (trajectoryChart) {
    trajectoryChart.destroy();
  }

  trajectoryChart = c3.generate({
    bindto: bindElement,
    size: {
      height: 500,
    },
    color: {
      pattern: d3.schemeTableau10,
    },
    axis: {
      y: {
        min: minimumConfirmed,
        padding: {
          bottom: 0,
        },
        tick: {
          format: formatNumber,
        },
      },
      x: {
        // Set max x value to be 2 greater to avoid label cutoff
        max: maxDays + 2,
        label: i18next.t("trajectory-description", {
          minimumConfirmed: formatNumber(minimumConfirmed),
        }),
        tick: {
          format: formatNumber,
        },
      },
    },
    data: {
      columns: columns,
      labels: {
        format: (v, id, i) => {
          if (id) {
            const lastIndex = trajectories[id].lastIndex;
            if (lastIndex === 0 || i === lastIndex - 1) {
              return id;
            }
          }
        },
      },
      color: (originalColor, d) => {
        let color = d3.hsl(originalColor);
        if (!d || !d.id) {
          return color;
        }
        const lastIndex = trajectories[d.id].lastIndex;
        // Grey out when less than 1 week over minimumConfirmed
        if (lastIndex < 7) {
          color.l = 0.8;
          color.s = 0.1;
        }

        if (d.index === lastIndex) {
          color.opacity = 0.4;
        } else {
          color.opacity = 1;
        }
        return color;
      },
      regions: regions,
    },
    grid: {
      x: {
        show: true,
      },
      y: {
        show: true,
      },
    },
    padding: {
      right: 24,
    },
    tooltip: {
      format: {
        value: (value, ratio, id, index) => {
          const area = trajectories[id];
          if (index && area.cumulativeConfirmed[index - 1]) {
            const diff = parseInt(value) - area.cumulativeConfirmed[index - 1];
            const annotation =
              index === area.lastIndex ? i18next.t("provisional") : "";
            const sign = diff >= 0 ? "+" : "";
            const diffText = `${sign}${formatNumber(diff)}`;
            return `${formatNumber(value)} (${diffText}) ${annotation}`;
          } else {
            return formatNumber(value);
          }
        },
      },
    },
  });
  return trajectoryChart;
};

export const drawRegionTrajectoryChart = (
  regions,
  regionTrajectoryChart,
  lang
) => {
  return drawTrajectoryChart(
    regions,
    regionTrajectoryChart,
    lang,
    "#regional-trajectory",
    "regions"
  );
};
