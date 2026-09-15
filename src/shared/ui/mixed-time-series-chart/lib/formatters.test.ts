import { describe, expect, it } from 'vitest';

import { formatChartDate } from './format-date';
import { formatChartValue } from './format-value';

describe('chart formatters', () => {
  it('formats date-only values without a timezone shift', () => {
    expect(formatChartDate(Date.UTC(2026, 5, 10), 'ru-RU')).toBe('10.06.2026');
    expect(formatChartDate(Date.UTC(2026, 5, 10), 'en-GB')).toBe('10.06.2026');
  });

  it('uses the precision configured for a series', () => {
    expect(
      formatChartValue(
        180.5,
        {
          label: 'ROI',
          axisGroup: 'roi',
          points: [],
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
        'en-GB',
      ),
    ).toBe('180.50');
  });
});
