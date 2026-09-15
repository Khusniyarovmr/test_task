export function formatChartDate(epoch: number, locale = 'ru-RU'): string {
  const parts = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(epoch);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? '';

  return `${part('day')}.${part('month')}.${part('year')}`;
}
