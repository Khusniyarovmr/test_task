export const SERIES_ROLES = ['area', 'spline', 'line', 'bar'] as const;

export type SeriesRole = (typeof SERIES_ROLES)[number];

export interface TimePoint {
  /** An ISO 8601 date or a datetime with an explicit timezone. */
  timestamp: string;
  value: number | null;
}

export interface TimeSeries {
  label: string;
  points: readonly TimePoint[];
  /** Series with the same axisGroup share one hidden Y scale. */
  axisGroup: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface MixedChartData {
  area: TimeSeries;
  spline: TimeSeries;
  line: TimeSeries;
  bar: TimeSeries;
}

export interface MixedTimeSeriesChartProps {
  data: MixedChartData;
  locale?: string;
  height?: number;
  ariaLabel?: string;
  emptyMessage?: string;
  className?: string;
}

export interface NormalizedChartRow {
  epoch: number;
  area: number | null;
  spline: number | null;
  line: number | null;
  bar: number | null;
}

export interface AxisDefinition {
  id: string;
  domain: readonly [number, number];
}

export interface NormalizedChartData {
  rows: readonly NormalizedChartRow[];
  axes: readonly AxisDefinition[];
  hasValues: boolean;
}

export class MixedChartDataError extends Error {
  readonly role?: SeriesRole;
  readonly pointIndex?: number;

  constructor(message: string, role?: SeriesRole, pointIndex?: number) {
    const location = [
      role,
      pointIndex === undefined ? undefined : `point ${pointIndex}`,
    ]
      .filter(Boolean)
      .join(', ');

    super(location ? `${message} (${location})` : message);
    this.name = 'MixedChartDataError';
    this.role = role;
    this.pointIndex = pointIndex;
  }
}
