import styles from './MixedTimeSeriesChart.module.scss';

interface ActiveMarkerProps {
  cx?: number;
  cy?: number;
  color: string;
  shape?: 'circle' | 'square';
}

export function ActiveMarker({
  cx,
  cy,
  color,
  shape = 'circle',
}: ActiveMarkerProps) {
  if (cx === undefined || cy === undefined) {
    return null;
  }

  return (
    <g className={styles.activeMarker} aria-hidden="true">
      <circle cx={cx} cy={cy} r={20} fill={color} opacity={0.2} />
      {shape === 'square' ? (
        <rect x={cx - 4.5} y={cy - 4.5} width={9} height={9} fill={color} />
      ) : (
        <circle cx={cx} cy={cy} r={3.5} fill={color} />
      )}
    </g>
  );
}
