import { expect, test, type Locator, type Page } from '@playwright/test';

async function hoverDot(
  page: Page,
  chart: Locator,
  pointIndex: number,
): Promise<void> {
  const dot = chart.locator('.recharts-line-dots rect').nth(pointIndex);
  const box = await dot.boundingBox();

  if (!box) {
    throw new Error(`Line point ${pointIndex} is not visible`);
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 800, height: 529 });
  await page.goto('/');
});

test('matches the base chart appearance', async ({ page }) => {
  const chart = page.getByTestId('mixed-time-series-chart');
  await expect(chart).toBeVisible();
  await expect(chart).toHaveScreenshot('mixed-chart-base.png', {
    animations: 'disabled',
  });
});

test('matches the shared tooltip appearance at the first point', async ({
  page,
}) => {
  const chart = page.getByTestId('mixed-time-series-chart');
  await hoverDot(page, chart, 0);
  await expect(page.getByRole('tooltip')).toBeVisible();
  await expect(chart).toHaveScreenshot('mixed-chart-tooltip-first.png', {
    animations: 'disabled',
  });
});

test('matches the shared tooltip appearance at the middle point', async ({
  page,
}) => {
  const chart = page.getByTestId('mixed-time-series-chart');
  await hoverDot(page, chart, 2);
  await expect(page.getByRole('tooltip')).toBeVisible();
  await expect(chart).toHaveScreenshot('mixed-chart-tooltip.png', {
    animations: 'disabled',
  });
});

test('matches the shared tooltip appearance at the last point', async ({
  page,
}) => {
  const chart = page.getByTestId('mixed-time-series-chart');
  await hoverDot(page, chart, 4);
  await expect(page.getByRole('tooltip')).toBeVisible();
  await expect(chart).toHaveScreenshot('mixed-chart-tooltip-last.png', {
    animations: 'disabled',
  });
});

test('matches the narrow chart appearance', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 520 });
  await page.reload();

  const chart = page.getByTestId('mixed-time-series-chart');
  await expect(chart).toBeVisible();
  await expect(chart).toHaveScreenshot('mixed-chart-mobile.png', {
    animations: 'disabled',
  });
});
