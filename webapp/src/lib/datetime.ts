const dateFormat = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

export function formatTime(t: number, withHours = false): string {
  if (!isFinite(t)) return "--:--";

  const hours = Math.floor(t / 3600);
  const rest = t - hours * 3600;
  const minutes = Math.floor(rest / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(rest % 60)
    .toString()
    .padStart(2, "0");

  if (hours > 0 || withHours) {
    return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;
  } else {
    return `${minutes}:${seconds}`;
  }
}
