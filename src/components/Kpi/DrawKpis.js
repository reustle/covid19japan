import i18next from "i18next";
import { maybeIntlNumberFormat } from "../../i18n";

const drawKpiTrend = (chartName, element) => {
  let svgURL = `https://data.covid19japan.com/charts/${chartName}`;
  fetch(svgURL)
    .then((response) => {
      if (response.status == 200) {
        return response.text();
      }
      return "";
    })
    .then((text) => {
      if (element) {
        element.innerHTML = text;
      }
    });
};

const drawKpis = (totals, totalsDiff, lang) => {
  const formatNumber = maybeIntlNumberFormat(lang);

  const setKpiDiffWithSelector = (selector, value) => {
    const diffDir = value >= 0 ? "+" : "";
    const valueString = formatNumber(value);
    let kpiDiffElement = document.querySelector(selector);
    if (kpiDiffElement) {
      kpiDiffElement.innerHTML = `(&nbsp;${diffDir}${valueString}&nbsp;)`;
    }
  };
  const setKpiDiff = (key, value) =>
    setKpiDiffWithSelector(`#kpi-${key} .diff`, value);

  const setKpiWithSelector = (selector, value) => {
    let kpiValueElement = document.querySelector(selector);
    if (kpiValueElement) {
      kpiValueElement.innerHTML = value;
    }
  };
  const setKpi = (key, value) =>
    setKpiWithSelector(`#kpi-${key} .value`, formatNumber(value));

  const setKpiDescription = (key, value) => {
    if (!value) {
      return;
    }
    let descElement = document.querySelector(`#kpi-${key} .description`);
    if (descElement) {
      descElement.innerHTML = value;
    }
  };

  setKpi("confirmed", totals.confirmed);
  setKpiDiff("confirmed", totalsDiff.confirmed);
  drawKpiTrend(
    "confirmed_daily_avg.svg",
    document.querySelector("#kpi-confirmed-chart")
  );

  setKpi("active", totals.active);
  setKpiDiff("active", totalsDiff.active);
  drawKpiTrend(
    "active_cumulative_avg.svg",
    document.querySelector("#kpi-active-chart")
  );
  if (totals.active > 0) {
    let criticalPercentage = parseInt((totals.critical / totals.active) * 100);
    if (criticalPercentage < 1) {
      criticalPercentage =
        parseInt((totals.critical / totals.active) * 1000) / 10;
    }
    setKpiDescription(
      "active",
      i18next.t("active-critical-percentage", {
        percent: formatNumber(criticalPercentage),
      })
    );
  }

  setKpi("recovered", totals.recovered);
  setKpiDiff("recovered", totalsDiff.recovered);
  drawKpiTrend(
    "recovered_daily_avg.svg",
    document.querySelector("#kpi-recovered-chart")
  );
  if (totals.confirmed > 0) {
    let recoveredPercent = parseInt(
      (totals.recovered / totals.confirmed) * 100
    );
    setKpiDescription(
      "recovered",
      i18next.t("recovered-percentage", {
        percent: formatNumber(recoveredPercent),
      })
    );
  }

  setKpi("deceased", totals.deceased);
  setKpiDiff("deceased", totalsDiff.deceased);
  drawKpiTrend(
    "deceased_daily_avg.svg",
    document.querySelector("#kpi-deceased-chart")
  );
  if (totals.confirmed > 0) {
    let deceasedPercent = parseInt((totals.deceased / totals.confirmed) * 100);
    if (deceasedPercent < 1) {
      deceasedPercent =
        parseInt((totals.deceased / totals.confirmed) * 1000) / 10;
    }
    setKpiDescription(
      "deceased",
      i18next.t("deceased-percentage", {
        percent: formatNumber(deceasedPercent),
      })
    );
  }

  setKpi("critical", totals.critical);
  setKpiDiff("critical", totalsDiff.critical);
  drawKpiTrend(
    "critical_daily_avg.svg",
    document.querySelector("#kpi-critical-chart")
  );

  setKpi("critical-short", totals.critical);
  setKpiDiff("critical-short", totalsDiff.critical);

  setKpi("tested", totals.tested);
  setKpiDiff("tested", totalsDiff.tested);
  drawKpiTrend(
    "tested_daily_avg.svg",
    document.querySelector("#kpi-tested-chart")
  );
  if (totals.tested > 0) {
    let testedPercentage = parseInt((totals.confirmed / totals.tested) * 100);
    if (testedPercentage < 1) {
      testedPercentage =
        parseInt((totals.confirmed / totals.tested) * 1000) / 10;
    }
    setKpiDescription(
      "tested",
      i18next.t("tested-percentage", {
        percent: formatNumber(testedPercentage),
      })
    );
  }

  let kpi = document.querySelector("#kpi");
  if (kpi) {
    kpi.classList.remove("loading");
  }
};

export default drawKpis;
