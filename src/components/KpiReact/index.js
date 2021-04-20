import React, { useMemo, useCallback, memo } from "react";
import { object, string } from "prop-types";
import { useTranslation } from "react-i18next";

import Kpi from "./Kpi";

import { maybeIntlNumberFormat } from "../../i18n";

const KpiContainer = ({ data, type }) => {
  const { t, i18n } = useTranslation();
  const { language } = i18n;

  const { totals, totalsDiff } = data;

  const formatNumber = maybeIntlNumberFormat(language);

  const getPercentage = useCallback(
    (type, chart) => {
      switch (type) {
        case "confirmed":
          break;
        case "recovered":
          if (totals.confirmed > 0) {
            let recoveredPercent = parseInt(
              (totals.recovered / totals.confirmed) * 100
            );
            chart.percentage = t("recovered-percentage", {
              percent: formatNumber(recoveredPercent),
            });
          }
          break;
        case "active":
          if (totals.active > 0) {
            let criticalPercentage = parseInt(
              (totals.critical / totals.active) * 100
            );
            if (criticalPercentage < 1) {
              criticalPercentage =
                parseInt((totals.critical / totals.active) * 1000) / 10;
            }
            chart.percentage = t("active-critical-percentage", {
              percent: formatNumber(criticalPercentage),
            });
          }
          break;
        case "deceased":
          if (totals.confirmed > 0) {
            let deceasedPercent = parseInt(
              (totals.deceased / totals.confirmed) * 100
            );
            if (deceasedPercent < 1) {
              deceasedPercent =
                parseInt((totals.deceased / totals.confirmed) * 1000) / 10;
            }
            chart.percentage = t("deceased-percentage", {
              percent: formatNumber(deceasedPercent),
            });
          }
          break;
        case "tested":
          if (totals.tested > 0) {
            let testedPercentage = parseInt(
              (totals.confirmed / totals.tested) * 100
            );
            if (testedPercentage < 1) {
              testedPercentage =
                parseInt((totals.confirmed / totals.tested) * 1000) / 10;
            }
            chart.percentage = t("tested-percentage", {
              percent: formatNumber(testedPercentage),
            });
          }
          break;
        default:
          return;
      }
    },
    [formatNumber, t, totals]
  );

  const chart = useMemo(() => {
    const chartData = {
      id: type,
      label: t(`kpi-${type}`),
      value: formatNumber(totals[type]),
      diff:
        totalsDiff[type] >= 0
          ? `+${formatNumber(totalsDiff[type])}`
          : formatNumber(totalsDiff[type]),
      chartName:
        type === "active"
          ? "active_cumulative_avg.svg"
          : `${type}_daily_avg.svg`,
      caption: t(`${type}-chart-caption`),
    };

    getPercentage(type, chartData);
    return chartData;
  }, [formatNumber, getPercentage, t, totals, totalsDiff, type]);

  return (
    <Kpi
      key={chart.id}
      id={chart.id}
      label={chart.label}
      value={chart.value}
      diff={chart.diff}
      chartName={chart.chartName}
      percent={chart.percentage}
      caption={chart.caption}
      isActive={type === "active"}
    />
  );
};

KpiContainer.propTypes = {
  data: object,
  type: string,
};

KpiContainer.defaultProps = {
  data: {},
  type: "",
};

export default memo(KpiContainer);
