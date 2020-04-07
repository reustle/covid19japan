export const calculateTotals = (daily) => {
  // Calculate the totals
  const totals = {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
    critical: 0,
    active: 0,
    tested: 0,
  };
  const totalsDiff = {
    confirmed: 1,
    recovered: 1,
    deceased: 1,
    critical: 1,
    active: 1,
    tested: 1,
  };

  // If there is an empty cell, fall back to the previous row
  const pullLatestSumAndDiff = (rowKey, totalKey) => {
    let latest = {};
    let dayBefore = {};
    let twoDaysBefore = {};
    if (daily.length > 2) {
      twoDaysBefore = daily[daily.length - 3];
    }
    if (daily.length > 1) {
      dayBefore = daily[daily.length - 2];
    }
    if (daily.length > 0) {
      latest = daily[daily.length - 1];
    }

    if (latest && dayBefore && latest[rowKey] && dayBefore[rowKey]) {
      totals[totalKey] = latest[rowKey];
      totalsDiff[totalKey] = latest[rowKey] - dayBefore[rowKey];
    }

    if (totalsDiff[totalKey] <= 0 && twoDaysBefore && twoDaysBefore[rowKey]) {
      totalsDiff[totalKey] = latest[rowKey] - twoDaysBefore[rowKey];
    }
  };

  pullLatestSumAndDiff("testedCumulative", "tested");
  pullLatestSumAndDiff("criticalCumulative", "critical");
  pullLatestSumAndDiff("confirmedCumulative", "confirmed");
  pullLatestSumAndDiff("recoveredCumulative", "recovered");
  pullLatestSumAndDiff("deceasedCumulative", "deceased");
  pullLatestSumAndDiff("activeCumulative", "active");

  return [totals, totalsDiff];
};
