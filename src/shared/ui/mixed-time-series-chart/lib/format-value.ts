import type { TimeSeries } from '../model/types';

export function formatChartValue(
  value: number,
  series: TimeSeries,
  locale = 'ru-RU',
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: series.minimumFractionDigits ?? 0,
    maximumFractionDigits: series.maximumFractionDigits ?? 2,
    useGrouping: false,
  }).format(value);
}
