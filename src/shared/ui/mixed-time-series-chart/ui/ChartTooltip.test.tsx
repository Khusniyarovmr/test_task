import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { MixedChartData, NormalizedChartRow } from '../model/types';
import { ChartTooltip } from './ChartTooltip';

const data: MixedChartData = {
  area: {
    label: 'Cost',
    axisGroup: 'money',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    points: [],
  },
  spline: {
    label: 'ROI confirmed',
    axisGroup: 'roi',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    points: [],
  },
  line: {
    label: 'Conversions',
    axisGroup: 'conversions',
    maximumFractionDigits: 0,
    points: [],
  },
  bar: {
    label: 'CPA',
    axisGroup: 'money',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    points: [],
  },
};

const row: NormalizedChartRow = {
  epoch: Date.UTC(2026, 5, 12),
  area: 44.36,
  spline: 161.47,
  line: 36,
  bar: 1.23,
};

describe('ChartTooltip', () => {
  it('renders the reference order and formatting', () => {
    render(
      <ChartTooltip
        active
        label={row.epoch}
        rows={[row]}
        data={data}
        locale="ru-RU"
      />,
    );

    expect(screen.getByRole('tooltip')).toHaveTextContent('12.06.2026');
    expect(
      [...document.querySelectorAll('[data-series-role]')].map((element) =>
        element.getAttribute('data-series-role'),
      ),
    ).toEqual(['area', 'bar', 'spline', 'line']);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Cost:44,36');
    expect(screen.getByRole('tooltip')).toHaveTextContent('CPA:1,23');
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'ROI confirmed:161,47',
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent('Conversions:36');
  });

  it('omits missing series and stays hidden without an active row', () => {
    const missingRow = { ...row, spline: null };
    const { rerender } = render(
      <ChartTooltip
        active
        label={row.epoch}
        rows={[missingRow]}
        data={data}
        locale="en-GB"
      />,
    );

    expect(
      document.querySelector('[data-series-role="spline"]'),
    ).not.toBeInTheDocument();

    rerender(
      <ChartTooltip
        active={false}
        label={row.epoch}
        rows={[row]}
        data={data}
        locale="en-GB"
      />,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
