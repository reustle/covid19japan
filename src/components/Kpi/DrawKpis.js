import i18next from "i18next";

const drawKpiTrend = (chartName, element) => {
  let svgURL = `http://localhost:3999/charts/${chartName}`;
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
  const formatNumber = new Intl.NumberFormat(lang).format;

  const setKpiDiffWithSelector = (selector, value) => {
    const diffDir = value >= 0 ? "+" : "";
    let kpiDiffElement = document.querySelector(selector);
    if (kpiDiffElement) {
      kpiDiffElement.innerHTML = `(&nbsp;${diffDir}${value}&nbsp;)`;
    }
  };
  const setKpiDiff = (key, value) =>
    setKpiDiffWithSelector(`#kpi-${key} .diff`, formatNumber(value));

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

  let criticalPercentage = parseInt((totals.critical / totals.active) * 100);
  setKpi("active", totals.active);
  setKpiDiff("active", totalsDiff.active);
  setKpiDescription(
    "active",
    i18next.t("active-critical-percentage", {
      percent: formatNumber(criticalPercentage),
    })
  );
  drawKpiTrend(
    "active_cumulative_avg.svg",
    document.querySelector("#kpi-active-chart")
  );

  let recoveredPercent = parseInt((totals.recovered / totals.confirmed) * 100);
  setKpi("recovered", totals.recovered);
  setKpiDiff("recovered", totalsDiff.recovered);
  setKpiDescription(
    "recovered",
    i18next.t("recovered-percentage", {
      percent: formatNumber(recoveredPercent),
    })
  );
  drawKpiTrend(
    "recovered_daily_avg.svg",
    document.querySelector("#kpi-recovered-chart")
  );

  let deceasedPercent = parseInt((totals.deceased / totals.confirmed) * 100);
  setKpi("deceased", totals.deceased);
  setKpiDiff("deceased", totalsDiff.deceased);
  setKpiDescription(
    "deceased",
    i18next.t("deceased-percentage", { percent: formatNumber(deceasedPercent) })
  );
  drawKpiTrend(
    "deceased_daily_avg.svg",
    document.querySelector("#kpi-deceased-chart")
  );

  setKpi("critical", totals.critical);
  setKpiDiff("critical", totalsDiff.critical);
  drawKpiTrend(
    "critical_daily_avg.svg",
    document.querySelector("#kpi-critical-chart")
  );

  setKpi("critical-short", totals.critical);
  setKpiDiff("critical-short", totalsDiff.critical);

  let testedPercentage = parseInt((totals.confirmed / totals.tested) * 100);
  setKpi("tested", totals.tested);
  setKpiDiff("tested", totalsDiff.tested);
  setKpiDescription(
    "tested",
    i18next.t("tested-percentage", { percent: formatNumber(testedPercentage) })
  );
  drawKpiTrend(
    "tested_daily_avg.svg",
    document.querySelector("#kpi-tested-chart")
  );

  let kpi = document.querySelector("#kpi");
  if (kpi) {
    kpi.classList.remove("loading");
  }
};

export default drawKpis;
