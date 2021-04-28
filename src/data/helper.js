import {
  COLOR_NONE,
  MAP_COLOR_BOUNDARIES,
  PREFECTURE_PAINT,
} from "./constants";

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

  let latest = daily[daily.length - 1];
  totals.tested = latest.testedCumulative;
  totals.critical = latest.criticalCumulative;
  totals.confirmed = latest.confirmedCumulative;
  totals.recovered = latest.recoveredCumulative;
  totals.deceased = latest.deceasedCumulative;
  totals.active = latest.activeCumulative;

  totalsDiff.tested = latest.tested;
  totalsDiff.critical = latest.critical;
  totalsDiff.confirmed = latest.confirmed;
  totalsDiff.recovered = latest.recovered;
  totalsDiff.deceased = latest.deceased;
  totalsDiff.active = latest.active;

  return [totals, totalsDiff];
};

export const getPrefecturePaint = (ddb) => {
  const prefecturePaint = [...PREFECTURE_PAINT];
  ddb.prefectures.map((prefecture) => {
    let cases = parseInt(prefecture.active);
    if (cases > 0) {
      prefecturePaint.push(prefecture.name);
      let matchingBoundary = Object.keys(MAP_COLOR_BOUNDARIES).find(
        (boundary) => cases < boundary
      );
      let color = MAP_COLOR_BOUNDARIES[matchingBoundary];
      prefecturePaint.push(color);
    }
  });

  // Add a final value to the list for the default color
  prefecturePaint.push(COLOR_NONE);
  return prefecturePaint;
};
