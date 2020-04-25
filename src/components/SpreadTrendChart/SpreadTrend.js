import * as c3 from "c3";
import * as d3 from "d3";
import i18next from "i18next";
import { format as dateFormat } from "date-fns";
import { enUS, ja } from "date-fns/locale";

import {
  COLOR_ACTIVE,
  COLOR_CONFIRMED,
  COLOR_RECOVERED,
  COLOR_DECEASED,
  CHART_TIME_PERIOD,
} from "../../data/constants";

const drawTrendChart = (sheetTrend, trendChart, lang) => {
  let dateLocale = enUS;
  if (lang == "ja") {
    dateLocale = ja;
  }

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
    cols.Confirmed.push(row.confirmedCumulative);
    cols.Critical.push(row.criticalCumulative);
    cols.Deceased.push(row.deceasedCumulative);
    cols.Recovered.push(row.recoveredCumulative);
    cols.Active.push(
      row.confirmedCumulative - row.deceasedCumulative - row.recoveredCumulative
    );
    cols.Tested.push(row.testedCumulative);
  }

  if (trendChart) {
    trendChart.destroy();
  }

  trendChart = c3.generate({
    bindto: "#trend-chart",
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
      names: {
        Confirmed: i18next.t("kpi-confirmed"),
        Active: i18next.t("kpi-active"),
        Recovered: i18next.t("kpi-recovered"),
        Deceased: i18next.t("kpi-deceased"),
      },
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
          count: 6,
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
        padding: {
          bottom: 0,
        },
        tick: {
          values: [
            0,
            2000,
            4000,
            6000,
            8000,
            10000,
            12000,
            14000,
            16000,
            18000,
            20000,
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
