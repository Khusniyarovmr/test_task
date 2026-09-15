import { expect, test, type Locator, type Page } from '@playwright/test';

async function hoverPoint(
  page: Page,
  chart: Locator,
  pointIndex: number,
): Promise<void> {
  const dots = chart.locator('.recharts-line-dots rect');
  const dot = dots.nth(pointIndex);
  const box = await dot.boundingBox();

  if (!box) {
    throw new Error(`Line point ${pointIndex} is not visible`);
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
});

test('shows a shared tooltip for the first, middle and last timestamp', async ({
  page,
}) => {
  const chart = page.getByTestId('mixed-time-series-chart');
  const tooltip = page.getByRole('tooltip');

  await expect(chart).toBeVisible();

  for (const expectation of [
    { index: 0, date: '10.06.2026', values: ['2.04', '0.68', '610.78', '3'] },
    { index: 2, date: '12.06.2026', values: ['44.36', '1.23', '161.47', '36'] },
    { index: 4, date: '14.06.2026', values: ['63.75', '0.71', '357.25', '90'] },
  ]) {
    await hoverPoint(page, chart, expectation.index);
    await expect(tooltip).toContainText(expectation.date);
    await expect(tooltip.locator('[data-series-role]')).toHaveCount(4);

    for (const value of expectation.values) {
      await expect(tooltip).toContainText(value);
    }
  }
});

test('keeps edge tooltips inside the viewport and hides them on mouse leave', async ({
  page,
}) => {
  const chart = page.getByTestId('mixed-time-series-chart');
  const tooltip = page.getByRole('tooltip');

  await hoverPoint(page, chart, 0);
  await expect(tooltip).toBeVisible();

  const tooltipBox = await tooltip.boundingBox();
  const viewport = page.viewportSize();
  expect(tooltipBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(tooltipBox?.x).toBeGreaterThanOrEqual(0);
  expect((tooltipBox?.x ?? 0) + (tooltipBox?.width ?? 0)).toBeLessThanOrEqual(
    viewport?.width ?? 0,
  );

  await page.mouse.move(1, 1);
  await expect(tooltip).toBeHidden();
});

test('fits a narrow viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 520 });
  await page.reload();

  await expect(page.getByTestId('mixed-time-series-chart')).toBeVisible();
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  expect(scrollWidth).toBe(320);
});

test('supports keyboard navigation through chart points', async ({ page }) => {
  const chart = page.getByTestId('mixed-time-series-chart');
  const surface = chart.locator('svg.recharts-surface');

  await surface.focus();
  await expect(surface).toBeFocused();
  await page.keyboard.press('ArrowRight');

  await expect(page.getByRole('tooltip')).toBeVisible();
  await expect(page.getByRole('tooltip')).toContainText('11.06.2026');

  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tooltip')).toContainText('12.06.2026');
});

test('loads without console errors or failed requests', async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('requestfailed', (request) => failedRequests.push(request.url()));

  await page.reload();
  await expect(page.getByTestId('mixed-time-series-chart')).toBeVisible();

  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
