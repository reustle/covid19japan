import * as c3 from "c3";
import i18next from "i18next";
import { format } from "date-fns";
import { enUS, ja } from "date-fns/locale";

import {
  COLOR_TESTED,
  COLOR_TESTED_DAILY,
  CHART_TIME_PERIOD,
  COLOR_CONFIRMED,
} from "../../data/constants";

const drawDailyIncreaseChart = (sheetTrend, dailyIncreaseChart, lang) => {
  let dateLocale = enUS;
  if (lang == "ja") {
    dateLocale = ja;
  }

  const cols = {
    Date: ["Date"],
    Confirmed: ["Confirmed"],
    ConfirmedAvg: ["ConfirmedAvg"],
  };

  for (
    let i = sheetTrend.length - CHART_TIME_PERIOD;
    i < sheetTrend.length;
    i++
  ) {
    const row = sheetTrend[i];

    cols.Date.push(row.date);
    cols.Confirmed.push(row.confirmed);
    cols.ConfirmedAvg.push(row.confirmedAvg7d);
  }

  if (dailyIncreaseChart) {
    dailyIncreaseChart.destroy();
  }

  console.log([cols.Confirmed, cols.ConfirmedAvg]);

  dailyIncreaseChart = c3.generate({
    bindto: "#daily-increase-chart",
    data: {
      colors: {
        Confirmed: (color, d) => {
          if (d && d.index === cols.Date.length - 2) {
            return COLOR_TESTED_DAILY;
          } else {
            return COLOR_TESTED;
          }
        },
        ConfirmedAvg: (color, d) => {
          return COLOR_CONFIRMED;
        },
      },
      columns: [cols.Confirmed, cols.ConfirmedAvg],
      names: {
        Confirmed: i18next.t("daily"),
        ConfirmedAvg: i18next.t("7-day-average"),
      },
      type: "bar",
      types: {
        Confirmed: "bar",
        ConfirmedAvg: "spline",
      },
      regions: {
        Confirmed: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
        ],
      },
    },
    point: {
      r: 0,
    },
    bar: {
      width: {
        ratio: 0.8,
      },
    },
    axis: {
      x: {
        tick: {
          format: (x) => {
            // x+1 because the list is prefixed with the label
            const xDate = new Date(cols.Date[x + 1]);
            return format(xDate, "MMM d", {
              locale: dateLocale,
              addSuffix: true,
            });
          },
        },
      },
      y: {
        tick: {
          values: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
        },
      },
    },
    tooltip: {
      format: {
        value: (value, ratio, id, index) => {
          return `${value} ${
            index === cols.Date.length - 2 ? i18next.t("provisional") : ""
          }`;
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
      right: 24,
    },
  });
  return dailyIncreaseChart;
};

export default drawDailyIncreaseChart;
