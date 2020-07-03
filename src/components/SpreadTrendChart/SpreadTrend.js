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

const drawTrendChart = (
  sheetTrend,
  trendChart,
  lang,
  timePeriod = DEFAULT_CHART_TIME_PERIOD
) => {
  const dateLocale = LOCALES[lang];

  const cols = {
    Date: ["Date"],
    Confirmed: ["Confirmed"],
    Active: ["Active"],
    Critical: ["Critical"],
    Deceased: ["Deceased"],
    Recovered: ["Recovered"],
    Tested: ["Tested"],
  };

  const startIndex = timePeriod > 0 ? sheetTrend.length - timePeriod : 0;
  for (let i = startIndex; i < sheetTrend.length; i++) {
    const row = sheetTrend[i];

    cols.Date.push(row.date);
    cols.Confirmed.push(row.confirmedCumulative);
    cols.Critical.push(row.criticalCumulative);
    cols.Deceased.push(row.deceasedCumulative);
    cols.Recovered.push(row.recovered);
    cols.Active.push(
      row.confirmedCumulative - row.deceasedCumulative - row.recoveredCumulative
    );
    cols.Tested.push(row.testedCumulative);
  }

  const activeScale = niceScale(cols.Active.slice(1), 5);
  const recoveredScale = niceScale(cols.Recovered.slice(1), 5);

  if (trendChart) {
    trendChart.destroy();
  }

  trendChart = c3.generate({
    bindto: "#trend-chart",
    data: {
      x: "Date",
      columns: [cols.Date, cols.Active, cols.Recovered],
      colors: {
        Active: (color, d) => {
          if (d && d.index === cols.Date.length - 2) {
            const newColor = d3_color(COLOR_ACTIVE);
            newColor.opacity = 0.6;
            return newColor;
          } else {
            return COLOR_ACTIVE;
          }
        },
        Recovered: (color, d) => {
          const newColor = d3_color(COLOR_RECOVERED);
          newColor.opacity = 0.6;
          return newColor;
        },
      },
      type: "line",
      types: {
        Active: "spline",
        Recovered: "bar",
      },
      axes: {
        Active: "y",
        Recovered: "y2",
      },
      names: {
        Active: i18next.t("active-trend-total-active"),
        Recovered: i18next.t("active-trend-daily-recovery"),
      },
      regions: {
        Active: [{ start: cols.Date[cols.Date.length - 2], style: "dashed" }],
        Recovered: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
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
        max: activeScale.max,
        tick: {
          values: activeScale.ticks,
        },
      },
      y2: {
        show: true,
        padding: 0,
        min: 0,
        max: recoveredScale.max,
        tick: {
          values: recoveredScale.ticks,
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
      right: 10,
      top: 0,
      bottom: 0,
    },
  });
  return trendChart;
};

export default drawTrendChart;
