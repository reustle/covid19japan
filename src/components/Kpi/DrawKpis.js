const setKpiDiff = (key, value) => {
  const diffDir = value >= 0 ? "+" : "";
  document.querySelector(
    `#kpi-${key} .diff`
  ).innerHTML = `( ${diffDir}${value} )`;
};

const setKpi = (key, value) =>
  (document.querySelector(`#kpi-${key} .value`).innerHTML = value);

const drawKpis = (totals, totalsDiff) => {
  setKpi("confirmed", totals.confirmed);
  setKpiDiff("confirmed", totalsDiff.confirmed);
  setKpi("recovered", totals.recovered);
  setKpiDiff("recovered", totalsDiff.recovered);
  setKpi("deceased", totals.deceased);
  setKpiDiff("deceased", totalsDiff.deceased);
  setKpi("critical", totals.critical);
  setKpiDiff("critical", totalsDiff.critical);
  setKpi("tested", totals.tested);
  setKpiDiff("tested", totalsDiff.tested);
  setKpi("active", totals.confirmed - totals.recovered - totals.deceased);
  setKpiDiff(
    "active",
    totalsDiff.confirmed - totalsDiff.recovered - totalsDiff.deceased
  );
};

export default drawKpis;
