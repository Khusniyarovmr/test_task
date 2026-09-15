import {
  MixedChartDataError,
  SERIES_ROLES,
  type AxisDefinition,
  type MixedChartData,
  type NormalizedChartData,
  type NormalizedChartRow,
  type SeriesRole,
  type TimeSeries,
} from '../model/types';

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME_WITH_ZONE_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})$/i;
const DOMAIN_HEADROOM = 1.2;

function parseTimestamp(
  timestamp: string,
  role: SeriesRole,
  pointIndex: number,
): number {
  const dateOnlyMatch = DATE_ONLY_PATTERN.exec(timestamp);

  if (dateOnlyMatch) {
    const [, yearText, monthText, dayText] = dateOnlyMatch;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const epoch = Date.UTC(year, month - 1, day);
    const parsed = new Date(epoch);

    if (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    ) {
      return epoch;
    }
  }

  if (DATE_TIME_WITH_ZONE_PATTERN.test(timestamp)) {
    const epoch = Date.parse(timestamp);

    if (Number.isFinite(epoch)) {
      return epoch;
    }
  }

  throw new MixedChartDataError(
    'timestamp must be YYYY-MM-DD or an ISO datetime with a timezone',
    role,
    pointIndex,
  );
}

function validateFractionDigits(series: TimeSeries, role: SeriesRole): void {
  const { minimumFractionDigits, maximumFractionDigits } = series;

  for (const [name, value] of [
    ['minimumFractionDigits', minimumFractionDigits],
    ['maximumFractionDigits', maximumFractionDigits],
  ] as const) {
    if (
      value !== undefined &&
      (!Number.isInteger(value) || value < 0 || value > 20)
    ) {
      throw new MixedChartDataError(
        `${name} must be an integer from 0 to 20`,
        role,
      );
    }
  }

  if (
    minimumFractionDigits !== undefined &&
    maximumFractionDigits !== undefined &&
    minimumFractionDigits > maximumFractionDigits
  ) {
    throw new MixedChartDataError(
      'minimumFractionDigits cannot exceed maximumFractionDigits',
      role,
    );
  }
}

function validateSeries(
  series: TimeSeries | undefined,
  role: SeriesRole,
): TimeSeries {
  if (!series || typeof series !== 'object') {
    throw new MixedChartDataError('series is required', role);
  }

  if (!series.label.trim()) {
    throw new MixedChartDataError('label cannot be empty', role);
  }

  if (!series.axisGroup.trim()) {
    throw new MixedChartDataError('axisGroup cannot be empty', role);
  }

  if (!Array.isArray(series.points)) {
    throw new MixedChartDataError('points must be an array', role);
  }

  validateFractionDigits(series, role);
  return series;
}

function createEmptyRow(epoch: number): NormalizedChartRow {
  return { epoch, area: null, spline: null, line: null, bar: null };
}

export function normalizeChartData(data: MixedChartData): NormalizedChartData {
  if (!data || typeof data !== 'object') {
    throw new MixedChartDataError('data must be an object');
  }

  const rowsByEpoch = new Map<number, NormalizedChartRow>();
  const maximumByAxis = new Map<string, number>();
  let hasValues = false;

  for (const role of SERIES_ROLES) {
    const series = validateSeries(data[role], role);
    const axisGroup = series.axisGroup.trim();
    const timestamps = new Set<number>();

    maximumByAxis.set(axisGroup, maximumByAxis.get(axisGroup) ?? 0);

    series.points.forEach((point, pointIndex) => {
      if (!point || typeof point !== 'object') {
        throw new MixedChartDataError(
          'point must be an object',
          role,
          pointIndex,
        );
      }

      const epoch = parseTimestamp(point.timestamp, role, pointIndex);

      if (timestamps.has(epoch)) {
        throw new MixedChartDataError(
          'timestamp must be unique within a series',
          role,
          pointIndex,
        );
      }
      timestamps.add(epoch);

      if (
        point.value !== null &&
        (!Number.isFinite(point.value) || point.value < 0)
      ) {
        throw new MixedChartDataError(
          'value must be a finite non-negative number or null',
          role,
          pointIndex,
        );
      }

      const row = rowsByEpoch.get(epoch) ?? createEmptyRow(epoch);
      row[role] = point.value;
      rowsByEpoch.set(epoch, row);

      if (point.value !== null) {
        hasValues = true;
        maximumByAxis.set(
          axisGroup,
          Math.max(maximumByAxis.get(axisGroup) ?? 0, point.value),
        );
      }
    });
  }

  const rows = [...rowsByEpoch.values()].sort(
    (left, right) => left.epoch - right.epoch,
  );
  const axes: AxisDefinition[] = [...maximumByAxis.entries()].map(
    ([id, maximum]) => ({
      id,
      domain: [0, maximum === 0 ? 1 : maximum * DOMAIN_HEADROOM],
    }),
  );

  return { rows, axes, hasValues };
}
