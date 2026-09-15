import { usePlotArea } from 'recharts';

import styles from './MixedTimeSeriesChart.module.scss';

export function PlotFrame() {
  const plotArea = usePlotArea();

  if (!plotArea) {
    return null;
  }

  return (
    <rect
      className={styles.plotFrame}
      x={plotArea.x}
      y={plotArea.y}
      width={plotArea.width}
      height={plotArea.height}
      fill="none"
      aria-hidden="true"
    />
  );
}
