import { useMemo } from 'react';
import {
  Area,
  Bar,
  ComposedChart,
  Customized,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { SERIES_COLORS } from '../lib/chart-config';
import { normalizeChartData } from '../lib/normalize-data';
import { usePrefersReducedMotion } from '../lib/use-prefers-reduced-motion';
import {
  MixedChartDataError,
  type MixedTimeSeriesChartProps,
} from '../model/types';
import { ActiveMarker } from './ActiveMarker';
import { ChartTooltip } from './ChartTooltip';
import { PlotFrame } from './PlotFrame';
import { SquareDot } from './SquareDot';

import styles from './MixedTimeSeriesChart.module.scss';

const DEFAULT_HEIGHT = 320;
const DEFAULT_LOCALE = 'ru-RU';
const DEFAULT_ARIA_LABEL = 'Time-series chart';
const DEFAULT_EMPTY_MESSAGE = 'No data';
const HALF_DAY_IN_MS = 12 * 60 * 60 * 1000;

export function MixedTimeSeriesChart({
  data,
  locale = DEFAULT_LOCALE,
  height = DEFAULT_HEIGHT,
  ariaLabel = DEFAULT_ARIA_LABEL,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  className,
}: MixedTimeSeriesChartProps) {
  const normalized = useMemo(() => normalizeChartData(data), [data]);
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!Number.isFinite(height) || height <= 0) {
    throw new MixedChartDataError('height must be a positive finite number');
  }

  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  if (!normalized.hasValues) {
    return (
      <div
        className={`${rootClassName} ${styles.empty}`}
        style={{ height }}
        role="status"
        aria-label={ariaLabel}
        data-testid="mixed-time-series-chart-empty"
      >
        {emptyMessage}
      </div>
    );
  }

  const firstEpoch = normalized.rows[0]?.epoch ?? 0;
  const xDomain: readonly [number | 'dataMin', number | 'dataMax'] =
    normalized.rows.length === 1
      ? [firstEpoch - HALF_DAY_IN_MS, firstEpoch + HALF_DAY_IN_MS]
      : ['dataMin', 'dataMax'];
  const animate = !prefersReducedMotion;

  return (
    <figure
      className={rootClassName}
      style={{ height }}
      role="group"
      aria-label={ariaLabel}
      data-testid="mixed-time-series-chart"
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <ComposedChart
          data={normalized.rows}
          margin={{ top: 38, right: 34, bottom: 20, left: 34 }}
          accessibilityLayer
        >
          <XAxis
            dataKey="epoch"
            type="number"
            domain={xDomain}
            padding={{ left: 14, right: 14 }}
            hide
            allowDataOverflow={false}
          />

          {normalized.axes.map((axis) => (
            <YAxis
              key={axis.id}
              yAxisId={axis.id}
              domain={axis.domain}
              hide
              allowDataOverflow={false}
            />
          ))}

          <Customized component={PlotFrame} />

          <Area
            dataKey="area"
            name={data.area.label}
            yAxisId={data.area.axisGroup.trim()}
            type="monotoneX"
            baseValue={0}
            fill={SERIES_COLORS.area}
            fillOpacity={0.78}
            stroke="#fff8d5"
            strokeWidth={1}
            dot={false}
            activeDot={<ActiveMarker color={SERIES_COLORS.area} />}
            connectNulls={false}
            isAnimationActive={animate}
            animationDuration={450}
          />

          <Bar
            dataKey="bar"
            name={data.bar.label}
            yAxisId={data.bar.axisGroup.trim()}
            fill={SERIES_COLORS.bar}
            barSize={36}
            maxBarSize={36}
            activeBar={{ fill: SERIES_COLORS.bar, fillOpacity: 0.82 }}
            isAnimationActive={animate}
            animationDuration={450}
          />

          <Line
            dataKey="spline"
            name={data.spline.label}
            yAxisId={data.spline.axisGroup.trim()}
            type="natural"
            stroke={SERIES_COLORS.spline}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            activeDot={<ActiveMarker color={SERIES_COLORS.spline} />}
            connectNulls={false}
            isAnimationActive={animate}
            animationDuration={450}
          />

          <Line
            dataKey="line"
            name={data.line.label}
            yAxisId={data.line.axisGroup.trim()}
            type="linear"
            stroke={SERIES_COLORS.line}
            strokeWidth={2}
            dot={<SquareDot fill={SERIES_COLORS.line} />}
            activeDot={
              <ActiveMarker color={SERIES_COLORS.line} shape="square" />
            }
            connectNulls={false}
            isAnimationActive={animate}
            animationDuration={450}
          />

          <Tooltip
            shared
            cursor={false}
            filterNull
            isAnimationActive={false}
            offset={12}
            allowEscapeViewBox={{ x: false, y: false }}
            wrapperStyle={{
              outline: 'none',
              pointerEvents: 'none',
              zIndex: 10,
            }}
            content={({ active, label }) => (
              <ChartTooltip
                active={active}
                label={label}
                rows={normalized.rows}
                data={data}
                locale={locale}
              />
            )}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </figure>
  );
}
