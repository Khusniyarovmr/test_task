import { describe, expect, it } from 'vitest';

import type { MixedChartData } from '../model/types';
import { MixedChartDataError } from '../model/types';
import { normalizeChartData } from './normalize-data';

function createData(): MixedChartData {
  return {
    area: {
      label: 'Cost',
      axisGroup: 'money',
      points: [
        { timestamp: '2026-06-12', value: 44.36 },
        { timestamp: '2026-06-10', value: 2.04 },
      ],
    },
    spline: {
      label: 'ROI confirmed',
      axisGroup: 'roi',
      points: [
        { timestamp: '2026-06-10', value: 610.78 },
        { timestamp: '2026-06-11', value: null },
      ],
    },
    line: {
      label: 'Conversions',
      axisGroup: 'conversions',
      points: [{ timestamp: '2026-06-11', value: 30 }],
    },
    bar: {
      label: 'CPA',
      axisGroup: 'money',
      points: [
        { timestamp: '2026-06-10', value: 0.68 },
        { timestamp: '2026-06-12', value: 1.23 },
      ],
    },
  };
}

describe('normalizeChartData', () => {
  it('merges independent series by timestamp and sorts rows chronologically', () => {
    const normalized = normalizeChartData(createData());

    expect(normalized.rows).toEqual([
      {
        epoch: Date.UTC(2026, 5, 10),
        area: 2.04,
        spline: 610.78,
        line: null,
        bar: 0.68,
      },
      {
        epoch: Date.UTC(2026, 5, 11),
        area: null,
        spline: null,
        line: 30,
        bar: null,
      },
      {
        epoch: Date.UTC(2026, 5, 12),
        area: 44.36,
        spline: null,
        line: null,
        bar: 1.23,
      },
    ]);
    expect(normalized.hasValues).toBe(true);
  });

  it('shares a domain for series in the same axis group', () => {
    const normalized = normalizeChartData(createData());

    expect(normalized.axes).toEqual([
      { id: 'money', domain: [0, 44.36 * 1.2] },
      { id: 'roi', domain: [0, 610.78 * 1.2] },
      { id: 'conversions', domain: [0, 30 * 1.2] },
    ]);
  });

  it('uses a safe domain and empty state signal when all values are absent', () => {
    const data = createData();

    for (const role of ['area', 'spline', 'line', 'bar'] as const) {
      data[role] = { ...data[role], points: [] };
    }

    expect(normalizeChartData(data)).toEqual({
      rows: [],
      axes: [
        { id: 'money', domain: [0, 1] },
        { id: 'roi', domain: [0, 1] },
        { id: 'conversions', domain: [0, 1] },
      ],
      hasValues: false,
    });
  });

  it('treats equivalent timestamp representations as duplicates', () => {
    const data = createData();
    data.area = {
      ...data.area,
      points: [
        { timestamp: '2026-06-10', value: 1 },
        { timestamp: '2026-06-10T00:00:00Z', value: 2 },
      ],
    };

    expect(() => normalizeChartData(data)).toThrowError(
      new MixedChartDataError(
        'timestamp must be unique within a series',
        'area',
        1,
      ),
    );
  });

  it.each([
    ['invalid calendar date', '2026-02-31', 1],
    ['datetime without timezone', '2026-06-10T12:30:00', 1],
    ['negative value', '2026-06-10', -1],
    ['non-finite value', '2026-06-10', Number.NaN],
  ])('rejects %s', (_caseName, timestamp, value) => {
    const data = createData();
    data.line = {
      ...data.line,
      points: [{ timestamp, value }],
    };

    expect(() => normalizeChartData(data)).toThrow(MixedChartDataError);
  });

  it('rejects empty metadata and invalid precision', () => {
    const emptyLabel = createData();
    emptyLabel.area = { ...emptyLabel.area, label: ' ' };
    expect(() => normalizeChartData(emptyLabel)).toThrow(
      /label cannot be empty/,
    );

    const invalidAxis = createData();
    invalidAxis.bar = { ...invalidAxis.bar, axisGroup: '' };
    expect(() => normalizeChartData(invalidAxis)).toThrow(
      /axisGroup cannot be empty/,
    );

    const invalidPrecision = createData();
    invalidPrecision.spline = {
      ...invalidPrecision.spline,
      minimumFractionDigits: 3,
      maximumFractionDigits: 2,
    };
    expect(() => normalizeChartData(invalidPrecision)).toThrow(
      /minimumFractionDigits cannot exceed maximumFractionDigits/,
    );
  });
});
