import * as c3 from "c3";
import * as d3 from "d3";
import i18next from "i18next";

import {
  COLOR_ACTIVE,
  COLOR_CONFIRMED,
  COLOR_RECOVERED,
  COLOR_DECEASED,
  CHART_TIME_PERIOD,
} from "../../data/constants";

const drawTrendChart = (sheetTrend, trendChart) => {
  const cols = {
    Date: ["Date"],
    Confirmed: ["Confirmed"],
    Active: ["Active"],
    Critical: ["Critical"],
    Deceased: ["Deceased"],
    Recovered: ["Recovered"],
    Tested: ["Tested"],
  };

  for (
    let i = sheetTrend.length - CHART_TIME_PERIOD;
    i < sheetTrend.length;
    i++
  ) {
    const row = sheetTrend[i];

    cols.Date.push(row.date);
    cols.Confirmed.push(parseFloat(Math.log2(row.confirmedCumulative)));
    cols.Critical.push(parseFloat(Math.log2(row.criticalCumulative)));
    cols.Deceased.push(parseFloat(Math.log2(row.deceasedCumulative)));
    cols.Recovered.push(parseFloat(Math.log2(row.recoveredCumulative <= 0 ? 1 : row.recoveredCumulative)));
    cols.Active.push(parseFloat(Math.log2(
      (row.confirmedCumulative - row.deceasedCumulative - row.recoveredCumulative) <= 0 ? 1 : row.confirmedCumulative - row.deceasedCumulative - row.recoveredCumulative))
    );
    cols.Tested.push(row.testedCumulative);
  }

  if (trendChart) {
    trendChart.destroy();
  }

  trendChart = c3.generate({
    bindto: "#trend-chart-log",
    data: {
      x: "Date",
      color: (color, d) => {
        if (d && d.index === cols.Date.length - 2) {
          const newColor = d3.color(color);
          newColor.opacity = 0.6;
          return newColor;
        } else {
          return color;
        }
      },
      columns: [
        cols.Date,
        cols.Confirmed,
        cols.Active,
        cols.Recovered,
        cols.Deceased,
        //cols.Tested
      ],
      regions: {
        [cols.Confirmed[0]]: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
        ],
        [cols.Active[0]]: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
        ],
        [cols.Recovered[0]]: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
        ],
        [cols.Deceased[0]]: [
          { start: cols.Date[cols.Date.length - 2], style: "dashed" },
        ],
        //[cols.Tested[0]]: [{'start': cols.Date[cols.Date.length-2], 'style':'dashed'}],
      },
    },
    color: {
      pattern: [COLOR_CONFIRMED, COLOR_ACTIVE, COLOR_RECOVERED, COLOR_DECEASED],
    },
    point: {
      r: 3,
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%b %d",
          count: 6,
        },
      },
      y: {
        padding: {
          bottom: 0,
        },
        tick: {
          values: [
            0,
            parseInt(Math.log2(1000)),
            parseInt(Math.log2(2000)),
            parseInt(Math.log2(3000)),
            parseInt(Math.log2(4000)),
            parseInt(Math.log2(5000)),
            parseInt(Math.log2(6000)),
            parseInt(Math.log2(7000)),
            parseInt(Math.log2(8000)),
            parseInt(Math.log2(9000)),
            parseInt(Math.log2(10000)),
          ],
        },
      },
    },
    tooltip: {
      format: {
        value: (value, ratio, id, index) => {
          if (index && cols[id][index]) {
            const diff = parseInt(value) - cols[id][index];
            return `${value} (${diff >= 0 ? "+" : ""}${diff}) ${
              index === cols.Date.length - 2 ? i18next.t("provisional") : ""
            }`;
          } else {
            return value;
          }
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
  return trendChart;
};

export default drawTrendChart;
