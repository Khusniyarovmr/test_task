import type { SeriesRole } from '../model/types';

export const SERIES_COLORS: Readonly<Record<SeriesRole, string>> = {
  area: '#fff0a6',
  spline: '#078b0b',
  line: '#aa00f5',
  bar: '#2b72f6',
};

export const TOOLTIP_ROLES: readonly SeriesRole[] = [
  'area',
  'bar',
  'spline',
  'line',
];
