import * as c3 from "c3";
import i18next from "i18next";
import last from "lodash/last";
import sum from "lodash/sum";

import {
  COLOR_TESTED,
  COLOR_TESTED_DAILY,
  TIME_PERIOD,
} from "../../data/constants";

const drawTestingTrendChart = (sheetTrend, testingTrendChart) => {
  const cols = {
    Date: ["Date"],
    TestedDaily: ["Tested Daily"],
    TestedTotal: ["Tested Total"],
  };

  for (let i = sheetTrend.length - TIME_PERIOD; i < sheetTrend.length; i++) {
    const row = sheetTrend[i];

    if (i === 0) {
      // Skip early feb data point
      continue;
    }

    cols.Date.push(row.date);

    if (cols.TestedTotal.length > 1) {
      // Skip the frist value

      let prevTotal = last(cols.TestedTotal);
      let thisDailyVal = row.testedCumulative - prevTotal;

      if (cols.TestedTotal.length < 8) {
        // Actual daily value
        if (thisDailyVal < 0) {
          thisDailyVal = 0;
        }
        cols.TestedDaily.push(thisDailyVal);
      } else {
        // 7-day rolling average
        let len = cols.TestedDaily.length;
        let last7 = [
          cols.TestedDaily[len - 1],
          cols.TestedDaily[len - 2],
          cols.TestedDaily[len - 3],
          cols.TestedDaily[len - 4],
          cols.TestedDaily[len - 5],
          cols.TestedDaily[len - 6],
          thisDailyVal,
        ];
        cols.TestedDaily.push(parseInt(sum(last7) / 7));
      }
    } else {
      cols.TestedDaily.push(0);
    }

    cols.TestedTotal.push(row.testedCumulative);
  }

  if (testingTrendChart) {
    testingTrendChart.destroy();
  }

  testingTrendChart = c3.generate({
    bindto: "#testing-trend-chart",
    data: {
      color: (color, d) => {
        if (d && d.index === cols.Date.length - 2) {
          return COLOR_TESTED_DAILY;
        } else {
          return COLOR_TESTED;
        }
      },
      columns: [cols.TestedDaily, cols.TestedTotal],
      type: "bar",
      types: {
        "Tested Total": "line",
      },
      regions: {
        [cols.TestedDaily[0]]: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
        ],
      },
      axes: {
        "Tested Daily": "y",
        "Tested Total": "y2",
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
        /*
        tick: {
          values: [
            100,
            200,
            300,
            400,
            500,
            600,
            700,
            800,
            900,
            1000
          ],
        },
        */
      },
      y2: {
        show: true,
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
  return testingTrendChart;
};

export default drawTestingTrendChart;
