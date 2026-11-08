// Every meeting's Europe/Berlin wall-clock time, plus how much earlier the round for
// newcomers starts. Shared by the calendar feed, the Event JSON-LD, the homepage dates and
// the FAQ text (via the `meetingTimes` global data in .eleventy.js).
export const MEETING_START = "19:00";
export const MEETING_END = "23:00";
export const NEWCOMER_LEAD_MINUTES = 30;

// "HH:MM" moved by the given number of minutes (negative = earlier), same day.
export function shiftTime(timeStr, minutes) {
  const [hours, mins] = timeStr.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// "HH:MM" as a clock time in the page's language: "19:00" (de) or "7:00 PM" (en).
export function formatTime(timeStr, lang) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "de-DE", {
    hour: lang === "en" ? "numeric" : "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(1970, 0, 1, hours, minutes)));
}

// Europe/Berlin's UTC offset ("+02:00"/"+01:00") for a given "YYYY-MM-DD" date, DST-aware.
// Probing at noon UTC avoids the date ever landing on the "wrong side" of midnight in Berlin.
export function berlinUtcOffsetForDate(dateStr) {
  const noonUtc = new Date(`${dateStr}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    timeZoneName: "shortOffset",
  }).formatToParts(noonUtc);
  const tzName = parts.find((p) => p.type === "timeZoneName").value;
  const hours = parseInt(tzName.replace("GMT", ""), 10) || 0;
  return `${hours >= 0 ? "+" : "-"}${String(Math.abs(hours)).padStart(2, "0")}:00`;
}

// "YYYY-MM-DD" + "HH:MM" wall-clock time in Europe/Berlin, as a proper ISO 8601 string
// with an explicit UTC offset — safe to hand to any date library regardless of the
// machine's own local timezone (unlike a bare "...Z" suffix, which would mislabel Berlin
// local time as UTC).
export function berlinIsoDateTime(dateStr, timeStr) {
  return `${dateStr}T${timeStr}:00${berlinUtcOffsetForDate(dateStr)}`;
}
