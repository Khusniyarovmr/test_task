import { MixedTimeSeriesChart } from '../../../shared/ui/mixed-time-series-chart';
import { sampleChartData } from '../model/sample-data';

import styles from './ChartDemoPage.module.scss';

export function ChartDemoPage() {
  return (
    <main className={styles.page} data-testid="chart-demo-page">
      <section className={styles.chartStage} aria-label="Chart example">
        <MixedTimeSeriesChart
          data={sampleChartData}
          locale="en-GB"
          height={320}
          ariaLabel="Campaign metrics by date"
        />
      </section>
    </main>
  );
}
