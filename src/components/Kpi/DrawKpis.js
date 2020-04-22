const setKpiDiff = (key, value) => {
  const diffDir = value >= 0 ? "+" : "";
  document.querySelector(
    `#kpi-${key} .diff`
  ).innerHTML = `( ${diffDir}${value} )`;
};

const setKpiPerc = (key, value) => {
  document.querySelector(`#kpi-${key} .perc`).innerHTML = `( ${value}% )`;
};

const setKpi = (key, value) =>
  (document.querySelector(`#kpi-${key} .value`).innerHTML = value);

const drawKpis = (totals, totalsDiff) => {
  setKpi("confirmed", totals.confirmed);
  setKpiDiff("confirmed", totalsDiff.confirmed);
  setKpiPerc(
    "confirmed",
    ((totals.confirmed * 100) / totals.tested).toFixed(2)
  );
  setKpi("recovered", totals.recovered);
  setKpiDiff("recovered", totalsDiff.recovered);
  setKpiPerc(
    "recovered",
    ((totals.recovered * 100) / totals.confirmed).toFixed(2)
  );
  setKpi("deceased", totals.deceased);
  setKpiDiff("deceased", totalsDiff.deceased);
  setKpiPerc(
    "deceased",
    ((totals.deceased * 100) / totals.confirmed).toFixed(2)
  );
  setKpi("critical", totals.critical);
  setKpiDiff("critical", totalsDiff.critical);
  setKpiPerc(
    "critical",
    ((totals.critical * 100) / totals.confirmed).toFixed(2)
  );
  setKpi("tested", totals.tested);
  setKpiDiff("tested", totalsDiff.tested);
  setKpiPerc("tested", 100);
  setKpi("active", totals.confirmed - totals.recovered - totals.deceased);
  setKpiDiff(
    "active",
    totalsDiff.confirmed - totalsDiff.recovered - totalsDiff.deceased
  );
  setKpiPerc(
    "active",
    (
      ((totals.confirmed - totals.recovered - totals.deceased) * 100) /
      totals.confirmed
    ).toFixed(2)
  );
};

const drawKpis2 = (totals, totalsDiff) => {
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
