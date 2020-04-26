import * as c3 from "c3";
import * as d3 from "d3";
import map from "lodash/map";
import reduce from "lodash/reduce";
import filter from "lodash/filter";
import mapValues from "lodash/mapValues";
import values from "lodash/values";
import i18next from "i18next";

const drawPrefectureTrajectoryChart = (
  prefectures,
  prefectureTrajectoryChart,
  lang
) => {
  const minimumConfirmed = 100;
  const filteredPrefectures = filter(prefectures, (prefecture) => {
    return (
      prefecture.confirmed >= minimumConfirmed && !prefecture.pseudoPrefecture
    );
  });
  const trajectories = reduce(
    filteredPrefectures,
    (t, prefecture) => {
      const cumulativeConfirmed = reduce(
        prefecture.dailyConfirmedCount,
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
      const cumulativeConfirmedFromMinimum = filter(
        cumulativeConfirmed,
        (value) => value >= minimumConfirmed
      );
      t[prefecture.name] = {
        name: prefecture.name,
        name_ja: prefecture.name_ja,
        confirmed: prefecture.confirmed,
        cumulativeConfirmed: cumulativeConfirmedFromMinimum,
        lastIndex: cumulativeConfirmedFromMinimum.length - 1,
      };
      return t;
    },
    {}
  );

  const columns = map(Object.values(trajectories), (prefecture) =>
    [prefecture.name].concat(prefecture.cumulativeConfirmed)
  );

  const regions = mapValues(trajectories, (prefecture) => {
    const value = prefecture.lastIndex;
    if (value > 0) {
      return [{ start: value - 1, end: value, style: "dashed" }];
    } else {
      return [];
    }
  });

  const maxDays = reduce(
    values(trajectories),
    (a, b) => Math.max(a, b.lastIndex),
    0
  );

  const nameMap = reduce(
    trajectories,
    (result, value) => {
      if (lang === "en") {
        result[value.name] = value.name;
      } else {
        result[value.name] = value.name_ja;
      }
      return result;
    },
    {}
  );

  if (prefectureTrajectoryChart) {
    prefectureTrajectoryChart.destroy();
  }

  prefectureTrajectoryChart = c3.generate({
    bindto: "#prefecture-trajectory",
    color: {
      pattern: d3.schemeTableau10,
    },
    axis: {
      y: {
        min: minimumConfirmed,
        padding: {
          bottom: 0,
        },
      },
      x: {
        // Set max x value to be 2 greater to avoid label cutoff
        max: maxDays + 2,
        label: `Number of Days since ${minimumConfirmed}th case`,
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
      names: nameMap,
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
          const prefecture = trajectories[id];
          if (index && prefecture.cumulativeConfirmed[index - 1]) {
            const diff =
              parseInt(value) - prefecture.cumulativeConfirmed[index - 1];
            const annotation =
              index === prefecture.lastIndex ? i18next.t("provisional") : "";
            const diffText = diff >= 0 ? `+${diff}` : diff;
            return `${value} (${diffText}) ${annotation}`;
          } else {
            return value;
          }
        },
      },
    },
  });
  return prefectureTrajectoryChart;
};

export default drawPrefectureTrajectoryChart;
