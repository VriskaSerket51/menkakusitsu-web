/** Calendar date used by the school API, independent of the browser's timezone. */
export const getServiceDate = (now = new Date()) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
}).format(now);
