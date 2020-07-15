// Returns a nicely rounded scale based on the number of ticks.

// Polyfill for log10.
Math.log10 =
  Math.log10 ||
  function (x) {
    return Math.log(x) * Math.LOG10E;
  };

export const niceScale = (values, tickCount) => {
  let max = Math.max(...values);
  let ticks = [];

  let tickIncrement = max / tickCount;
  // Take the tickIncrement and find the nearest power of 10 smaller than tickIncrement.
  // e.g. 45 -> 10, 455 -> 100
  let magnitude10 = Math.pow(10, Math.ceil(Math.log10(tickIncrement)) - 1);
  // Round up tickIncrement to the nearest power of 10.
  // e.g. 45 -> 50, 455 -> 500
  tickIncrement = Math.ceil(tickIncrement / magnitude10) * magnitude10;

  max = tickIncrement * tickCount;
  for (let i = 1; i <= tickCount; i++) {
    ticks.push(i * tickIncrement);
  }

  return {
    max: max,
    ticks: ticks,
  };
};
