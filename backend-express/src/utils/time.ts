export function isSameDate(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();
}

export function minutesBefore(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60 * 1000);
}
