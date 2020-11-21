import * as c3 from "c3";
import i18next from "i18next";
import format from "date-fns/format";

import { LOCALES, maybeIntlNumberFormat } from "../../i18n";
import { niceScale } from "../../data/scaling";

const drawDailyIncreaseChart = (
  trends,
  chart,
  lang,
  dailyValueKey,
  dailyAverageKey,
  dailyValueColor,
  dailyAverageColor,
  elementSelector,
  timePeriod
) => {
  const dateLocale = LOCALES[lang];
  const formatNumber = maybeIntlNumberFormat(lang);

  const cols = {
    Date: ["Date"],
    Daily: ["Daily"],
    DailyAvg: ["DailyAvg"],
  };

  const startIndex = timePeriod > 0 ? trends.length - timePeriod : 0;
  for (let i = startIndex; i < trends.length; i++) {
    const row = trends[i];

    cols.Date.push(row.date);
    cols.Daily.push(row[dailyValueKey]);
    if (i < trends.length - 1) {
      // Omit the last data point since it's provisional
      // and will always point downwards for the average.
      cols.DailyAvg.push(row[dailyAverageKey]);
    }
  }

  const scale = niceScale(
    cols.Daily.slice(1).concat(cols.DailyAvg.slice(1)),
    5
  );

  if (chart) {
    chart.destroy();
  }
  console.log(dailyValueKey);
  console.log(cols);

  chart = c3.generate({
    bindto: elementSelector,
    data: {
      x: "Date",
      colors: {
        Daily: (color, d) => {
          return dailyValueColor;
        },
        DailyAvg: (color, d) => {
          return dailyAverageColor;
        },
      },
      columns: [cols.Date, cols.Daily, cols.DailyAvg],
      names: {
        Daily: i18next.t("daily"),
        DailyAvg: i18next.t("7-day-average"),
      },
      type: "bar",
      types: {
        Daily: "bar",
        DailyAvg: "spline",
      },
      regions: {
        Daily: [{ start: cols.Date[cols.Date.length - 2], style: "dashed" }],
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
        type: "timeseries",
        tick: {
          culling: { max: 6 },
          format: (x) => {
            if (isNaN(x)) {
              return "";
            }
            const xDate = Date.parse(x);
            return format(xDate, "MMM d", {
              locale: dateLocale,
              addSuffix: true,
            });
          },
        },
      },
      y: {
        padding: 0,
        max: scale.max,
        tick: {
          values: scale.ticks,
          format: formatNumber,
        },
      },
    },
    tooltip: {
      format: {
        value: (value, ratio, id, index) => {
          return `${formatNumber(value)} ${
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
      left: 40,
      right: 10,
      top: 0,
      bottom: 0,
    },
  });
  return chart;
};

export default drawDailyIncreaseChart;
