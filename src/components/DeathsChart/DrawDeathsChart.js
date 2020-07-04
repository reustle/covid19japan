import * as c3 from "c3";
import { color as d3_color } from "d3-color";
import i18next from "i18next";
import { format as dateFormat } from "date-fns";

import { LOCALES } from "../../i18n";
import { niceScale } from "../../data/scaling";

import {
  COLOR_ACTIVE,
  COLOR_CONFIRMED,
  COLOR_RECOVERED,
  COLOR_DECEASED,
  DEFAULT_CHART_TIME_PERIOD,
} from "../../data/constants";

const drawDeathsChart = (
  container,
  sheetTrend,
  existingChart,
  lang,
  timePeriod = DEFAULT_CHART_TIME_PERIOD
) => {
  const dateLocale = LOCALES[lang];

  const datasets = {
    Date: [],
    Deceased: [],
    Active: [],
  };

  const startIndex = timePeriod > 0 ? sheetTrend.length - timePeriod : 0;
  for (let i = startIndex; i < sheetTrend.length; i++) {
    const row = sheetTrend[i];

    datasets.Date.push(row.date);
    datasets.Deceased.push(row.deceasedAvg7d);
    datasets.Active.push(row.activeCumulative);
  }

  const activeScale = niceScale(datasets.Active, 5);
  const deceasedScale = niceScale(datasets.Deceased, 5);

  if (existingChart) {
    existingChart.destroy();
  }

  return c3.generate({
    bindto: container,
    data: {
      x: "Date",
      columns: [
        ["Date"].concat(datasets.Date),
        ["Deaths"].concat(datasets.Deceased),
        ["Active"].concat(datasets.Active),
      ],
      colors: {
        Active: (color, d) => {
          if (d && d.index === datasets.Date.length - 2) {
            const newColor = d3_color(COLOR_ACTIVE);
            newColor.opacity = 0.6;
            return newColor;
          } else {
            return COLOR_ACTIVE;
          }
        },
        Deaths: (color, d) => {
          return COLOR_DECEASED;
        },
      },
      type: "line",
      types: {
        Deaths: "spline",
        Active: "spline",
      },
      axes: {
        Deaths: "y",
        Active: "y2",
      },
      names: {
        Deaths: i18next.t("deaths-chart-deaths"),
        Active: i18next.t("deaths-chart-active"),
      },
      regions: {
        Active: [{ start: datasets.Date[0], style: "dashed" }],
        Deaths: [
          { start: datasets.Date[datasets.Date.length - 2], style: "dashed" },
        ],
      },
    },
    point: {
      r: 1,
    },
    bar: {
      width: {
        ratio: 0.8,
      },
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          culling: { max: 6 },
          format: (x) => {
            if (isNaN(x)) {
              return "";
            }
            const xDate = Date.parse(x);
            return dateFormat(xDate, "MMM d", {
              locale: dateLocale,
              addSuffix: true,
            });
          },
        },
      },
      y: {
        padding: 0,
        min: 0,
        max: deceasedScale.max,
        tick: {
          values: deceasedScale.ticks,
        },
      },
      y2: {
        show: true,
        padding: 0,
        min: 0,
        max: activeScale.max,
        tick: {
          values: activeScale.ticks,
        },
      },
    },
    tooltip: {
      format: {
        value: (value, ratio, id, index) => {
          return value;
        },
      },
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
      left: 40,
      right: 40,
      top: 0,
      bottom: 0,
    },
  });
};

export default drawDeathsChart;
