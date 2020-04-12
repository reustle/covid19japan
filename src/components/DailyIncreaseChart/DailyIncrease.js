import * as c3 from "c3";
import i18next from "i18next";

import {
  COLOR_TESTED,
  COLOR_TESTED_DAILY,
  CHART_TIME_PERIOD,
} from "../../data/constants";

const drawDailyIncreaseChart = (sheetTrend, dailyIncreaseChart) => {
  const cols = {
    Date: ["Date"],
    Confirmed: ["New Cases"],
  };

  for (
    let i = sheetTrend.length - CHART_TIME_PERIOD;
    i < sheetTrend.length;
    i++
  ) {
    const row = sheetTrend[i];

    if (i === 0) {
      // Skip early feb data point
      continue;
    }

    cols.Date.push(row.date);
    cols.Confirmed.push(row.confirmed);
  }

  if (dailyIncreaseChart) {
    dailyIncreaseChart.destroy();
  }

  dailyIncreaseChart = c3.generate({
    bindto: "#daily-increase-chart",
    data: {
      color: (color, d) => {
        if (d && d.index === cols.Date.length - 2) {
          return COLOR_TESTED_DAILY;
        } else {
          return COLOR_TESTED;
        }
      },
      columns: [cols.Confirmed],
      type: "bar",
      regions: {
        [cols.Confirmed[0]]: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
        ],
      },
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
            const months = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];

            // x+1 because the list is prefixed with the label
            const xDate = new Date(cols.Date[x + 1]);
            return `${months[xDate.getMonth()]} ${xDate.getDate()}`;
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
    legend: {
      hide: true,
    },
    padding: {
      right: 24,
    },
  });
  return dailyIncreaseChart;
};

export default drawDailyIncreaseChart;
