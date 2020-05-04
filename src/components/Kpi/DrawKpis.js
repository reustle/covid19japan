import i18next from "i18next";

const drawKpiConfirmedTrend = (chartName, element) => {
  let svgURL = `https://data.covid19japan.com/charts/${chartName}`;
  fetch(svgURL)
    .then((response) => {
      if (response.status == 200) {
        return response.text();
      }
      return "";
    })
    .then((text) => {
      element.innerHTML = text;
    });
};

const setKpiDiffWithSelector = (selector, value) => {
  const diffDir = value >= 0 ? "+" : "";
  document.querySelector(
    selector
  ).innerHTML = `(&nbsp;${diffDir}${value}&nbsp;)`;
};
const setKpiDiff = (key, value) =>
  setKpiDiffWithSelector(`#kpi-${key} .diff`, value);

const setKpiWithSelector = (selector, value) => {
  document.querySelector(selector).innerHTML = value;
};
const setKpi = (key, value) => setKpiWithSelector(`#kpi-${key} .value`, value);

const setKpiDescription = (key, value) => {
  if (!value) {
    return;
  }
  let descElement = document.querySelector(`#kpi-${key} .description`);
  if (descElement) {
    descElement.innerText = value;
  }
};

const drawKpis = (totals, totalsDiff) => {
  setKpi("confirmed", totals.confirmed);
  setKpiDiff("confirmed", totalsDiff.confirmed);
  drawKpiConfirmedTrend(
    "confirmed_daily_avg.svg",
    document.querySelector("#kpi-confirmed-chart")
  );

  let criticalPercentage = parseInt((totals.critical / totals.active) * 100);
  setKpi("active", totals.active);
  setKpiDiff("active", totalsDiff.active);
  setKpiDescription(
    "active",
    i18next.t("active-critical-percentage", { percent: criticalPercentage })
  );
  drawKpiConfirmedTrend(
    "active_daily_avg.svg",
    document.querySelector("#kpi-active-chart")
  );

  let recoveredPercent = parseInt((totals.recovered / totals.confirmed) * 100);
  setKpi("recovered", totals.recovered);
  setKpiDiff("recovered", totalsDiff.recovered);
  setKpiDescription(
    "recovered",
    i18next.t("recovered-percentage", { percent: recoveredPercent })
  );
  drawKpiConfirmedTrend(
    "recovered_daily_avg.svg",
    document.querySelector("#kpi-recovered-chart")
  );

  let deceasedPercent = parseInt((totals.deceased / totals.confirmed) * 100);
  setKpi("deceased", totals.deceased);
  setKpiDiff("deceased", totalsDiff.deceased);
  setKpiDescription(
    "deceased",
    i18next.t("deceased-percentage", { percent: deceasedPercent })
  );
  drawKpiConfirmedTrend(
    "deceased_daily_avg.svg",
    document.querySelector("#kpi-deceased-chart")
  );

  setKpi("critical", totals.critical);
  setKpiDiff("critical", totalsDiff.critical);
  drawKpiConfirmedTrend(
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
    i18next.t("tested-percentage", { percent: testedPercentage })
  );
  drawKpiConfirmedTrend(
    "tested_daily_avg.svg",
    document.querySelector("#kpi-tested-chart")
  );

  let kpi = document.querySelector("#kpi");
  if (kpi) {
    kpi.classList.remove("loading");
  }
};

export default drawKpis;
