import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { sampleChartData } from '../../../../pages/chart-demo/model/sample-data';
import { MixedTimeSeriesChart } from './MixedTimeSeriesChart';

describe('MixedTimeSeriesChart', () => {
  it('renders the four reference primitives and an accessible container', async () => {
    const { container } = render(
      <MixedTimeSeriesChart
        data={sampleChartData}
        ariaLabel="Campaign chart"
        height={320}
      />,
    );

    expect(
      screen.getByRole('group', { name: 'Campaign chart' }),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(container.querySelector('.recharts-surface')).toBeInTheDocument(),
    );
    expect(container.querySelector('.recharts-area')).toBeInTheDocument();
    expect(container.querySelector('.recharts-bar')).toBeInTheDocument();
    expect(container.querySelectorAll('.recharts-line')).toHaveLength(2);
    expect(container.querySelectorAll('.recharts-line-dots rect')).toHaveLength(
      5,
    );
  });

  it('renders a customizable empty state', () => {
    const emptyData = structuredClone(sampleChartData);

    for (const role of ['area', 'spline', 'line', 'bar'] as const) {
      emptyData[role].points = [];
    }

    render(
      <MixedTimeSeriesChart
        data={emptyData}
        ariaLabel="Empty campaign chart"
        emptyMessage="Nothing to show"
      />,
    );

    expect(
      screen.getByRole('status', { name: 'Empty campaign chart' }),
    ).toHaveTextContent('Nothing to show');
  });

  it('fails fast for an invalid height', () => {
    expect(() =>
      render(<MixedTimeSeriesChart data={sampleChartData} height={0} />),
    ).toThrow(/height must be a positive finite number/);
  });
});
