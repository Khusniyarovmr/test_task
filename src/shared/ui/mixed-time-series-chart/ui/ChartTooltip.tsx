import { SERIES_COLORS, TOOLTIP_ROLES } from '../lib/chart-config';
import { formatChartDate } from '../lib/format-date';
import { formatChartValue } from '../lib/format-value';
import type { MixedChartData, NormalizedChartRow } from '../model/types';

import styles from './MixedTimeSeriesChart.module.scss';

interface ChartTooltipProps {
  active?: boolean;
  label?: number | string;
  rows: readonly NormalizedChartRow[];
  data: MixedChartData;
  locale: string;
}

export function ChartTooltip({
  active,
  label,
  rows,
  data,
  locale,
}: ChartTooltipProps) {
  const epoch = typeof label === 'number' ? label : Number(label);
  const row = Number.isFinite(epoch)
    ? rows.find((candidate) => candidate.epoch === epoch)
    : undefined;

  if (!active || !row) {
    return null;
  }

  return (
    <div className={styles.tooltip} role="tooltip" data-testid="chart-tooltip">
      <div className={styles.tooltipDate}>
        {formatChartDate(row.epoch, locale)}
      </div>
      <div className={styles.tooltipRows}>
        {TOOLTIP_ROLES.map((role) => {
          const value = row[role];

          if (value === null) {
            return null;
          }

          return (
            <div
              className={styles.tooltipRow}
              data-series-role={role}
              key={role}
            >
              <span
                className={styles.tooltipMarker}
                style={{ backgroundColor: SERIES_COLORS[role] }}
                aria-hidden="true"
              />
              <span>{data[role].label}:</span>
              <strong>{formatChartValue(value, data[role], locale)}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
