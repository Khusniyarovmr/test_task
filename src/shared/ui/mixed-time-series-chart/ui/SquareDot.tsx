import styles from './MixedTimeSeriesChart.module.scss';

interface SquareDotProps {
  cx?: number;
  cy?: number;
  fill?: string;
}

export function SquareDot({ cx, cy, fill = '#aa00f5' }: SquareDotProps) {
  if (cx === undefined || cy === undefined) {
    return null;
  }

  return (
    <rect
      className={styles.squareDot}
      x={cx - 6}
      y={cy - 6}
      width={12}
      height={12}
      fill={fill}
      aria-hidden="true"
    />
  );
}
