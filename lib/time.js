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
