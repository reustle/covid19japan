const SHORT_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC"
];

/**
 * @param {string} dateString - MMM DD YYYY, HH:mm JST (e.g. Mar 29 2020, 15:53 JST)
 * @return {Date}
 */
export function parseDate(dateString) {
  // Parse date string and convert to Date object

  const [date, timeTZ] = dateString.split(", ");
  const [MMM, DD, YYYY] = date.split(" ");
  const [time] = timeTZ.split(" ");
  const [HH, mm] = time.split(":");

  return new Date(
    Date.UTC(
      Number.parseInt(YYYY, 10),
      SHORT_MONTHS.indexOf(MMM.toUpperCase()),
      Number.parseInt(DD, 10),
      Number.parseInt(HH, 10) - 9, // JST offset
      Number.parseInt(mm, 10)
    )
  );
}

const RELATIVE_TIME_LOCALES = {
  en: {
    past: s => `${s} ago`,
    seconds: d => (d < 15 ? "a few seconds" : `${d} seconds`),
    minutes: d => (d === 1 ? "a minute" : `${d} minutes`),
    hours: d => (d === 1 ? "an hour" : `${d} hours`),
    days: d => (d === 1 ? "a day" : `${d} days`),
    months: d => (d === 1 ? "a month" : `${d} months`),
    years: d => (d === 1 ? "a year" : `${d} years`)
  },
  ja: {
    past: s => `${s}前`,
    seconds: d => (d < 15 ? "数秒" : `${d}秒`),
    minutes: d => `${d}分`,
    hours: d => `${d}時間`,
    days: d => `${d}日`,
    months: d => `${d}ヶ月`,
    years: d => `${d}年`
  }
};

/**
 * @param {Date} date
 * @return {Object} { ['en']: string, ['ja']: string }
 */
export function toRelativeTime(date) {
  // Convert date to relative time from now

  const now = new Date();
  const diffSeconds = Math.round((now - date) / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffMonths =
    now.getFullYear() * 12 +
    now.getMonth() -
    (date.getFullYear() * 12 + date.getMonth());
  const diffYears = Math.round(diffDays / 365);

  return ["en", "ja"].reduce((relativeTime, locale) => {
    const relative = RELATIVE_TIME_LOCALES[locale];
    let result;
    if (diffSeconds < 60) {
      result = relative.past(relative.seconds(diffSeconds));
    } else if (diffMinutes < 60) {
      result = relative.past(relative.minutes(diffMinutes));
    } else if (diffHours < 24) {
      result = relative.past(relative.hours(diffHours));
    } else if (diffDays < 31) {
      result = relative.past(relative.days(diffDays));
    } else if (diffMonths < 12) {
      result = relative.past(relative.months(diffMonths));
    } else {
      result = relative.past(relative.years(diffYears));
    }
    return { ...relativeTime, [locale]: result };
  }, {});
}
