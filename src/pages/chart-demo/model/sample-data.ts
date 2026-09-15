import type { MixedChartData } from '../../../shared/ui/mixed-time-series-chart';

export const sampleChartData: MixedChartData = {
  area: {
    label: 'Cost',
    axisGroup: 'money',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    points: [
      { timestamp: '2026-06-10', value: 2.04 },
      { timestamp: '2026-06-11', value: 25.85 },
      { timestamp: '2026-06-12', value: 44.36 },
      { timestamp: '2026-06-13', value: 55.65 },
      { timestamp: '2026-06-14', value: 63.75 },
    ],
  },
  spline: {
    label: 'ROI confirmed',
    axisGroup: 'roi',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    points: [
      { timestamp: '2026-06-10', value: 610.78 },
      { timestamp: '2026-06-11', value: 180.5 },
      { timestamp: '2026-06-12', value: 161.47 },
      { timestamp: '2026-06-13', value: 56.33 },
      { timestamp: '2026-06-14', value: 357.25 },
    ],
  },
  line: {
    label: 'Conversions',
    axisGroup: 'conversions',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    points: [
      { timestamp: '2026-06-10', value: 3 },
      { timestamp: '2026-06-11', value: 30 },
      { timestamp: '2026-06-12', value: 36 },
      { timestamp: '2026-06-13', value: 70 },
      { timestamp: '2026-06-14', value: 90 },
    ],
  },
  bar: {
    label: 'CPA',
    axisGroup: 'money',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    points: [
      { timestamp: '2026-06-10', value: 0.68 },
      { timestamp: '2026-06-11', value: 0.86 },
      { timestamp: '2026-06-12', value: 1.23 },
      { timestamp: '2026-06-13', value: 0.79 },
      { timestamp: '2026-06-14', value: 0.71 },
    ],
  },
};
