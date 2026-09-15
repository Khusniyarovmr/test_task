# Смешанный time-series график

Адаптивный React-компонент, который одновременно отображает четыре независимые временные последовательности в виде `area`, `spline`, `line` и `bar`. Стили, активные точки и общий tooltip воспроизводят поведение из [CleanShot-референса](https://cleanshot.com/share/cBDRxJWM).

Приложение полностью клиентское: backend, база данных и переменные окружения для запуска не нужны.

Рабочая production-версия: [https://testchart.khumar.pro](https://testchart.khumar.pro).

## Быстрый запуск

Понадобятся:

- Node.js 22.22.2 или новее;
- npm 12 или совместимая версия.

После клонирования репозитория выполните:

```bash
npm ci
npm run dev
```

Откройте адрес, который напечатает Vite, обычно `http://localhost:5173`.

Для первого запуска браузерных тестов также установите Chromium:

```bash
npx playwright install chromium
```

## Основные команды

| Команда                 | Назначение                                             |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | Запустить приложение в режиме разработки               |
| `npm run build`         | Проверить TypeScript и собрать production-версию       |
| `npm run preview`       | Локально открыть собранную production-версию           |
| `npm run format:check`  | Проверить форматирование Prettier                      |
| `npm run lint`          | Запустить ESLint                                       |
| `npm run typecheck`     | Проверить типы TypeScript                              |
| `npm run test:coverage` | Запустить unit/component-тесты с покрытием             |
| `npm run test:e2e`      | Запустить функциональные и визуальные Playwright-тесты |

Production-сборка записывается в `dist/`. Её можно раздавать любым сервером статических файлов, например Nginx.

Готовый production-vhost находится в [`deploy/nginx/testchart.conf`](deploy/nginx/testchart.conf). Он включает HTTPS, fallback на `index.html` для клиентских маршрутов, отключённое кэширование HTML и годовое кэширование хешированных файлов из `assets/`.

## Как инициализировать график четырьмя последовательностями

Компонент принимает объект `MixedChartData` с четырьмя обязательными полями:

| Поле     | Отображение                   | Пример метрики |
| -------- | ----------------------------- | -------------- |
| `area`   | Область с заливкой            | Cost           |
| `spline` | Плавная линия                 | ROI confirmed  |
| `line`   | Ломаная с квадратными точками | Conversions    |
| `bar`    | Столбцы                       | CPA            |

Каждая последовательность является самостоятельным массивом `TimePoint[]`. Точки содержат дату и значение:

```ts
interface TimePoint {
  timestamp: string;
  value: number | null;
}
```

Допустимый `timestamp`:

- календарная дата `YYYY-MM-DD`;
- ISO datetime с явно указанным часовым поясом, например `2026-06-10T12:30:00Z`.

Четыре массива могут содержать разные даты. Компонент сам объединит timestamps, отсортирует их по возрастанию и оставит разрыв там, где у ряда нет значения.

### Полный пример

```tsx
import {
  MixedTimeSeriesChart,
  type MixedChartData,
  type TimePoint,
} from './shared/ui/mixed-time-series-chart';

const cost: TimePoint[] = [
  { timestamp: '2026-06-10', value: 2.04 },
  { timestamp: '2026-06-11', value: 25.85 },
  { timestamp: '2026-06-12', value: 44.36 },
  { timestamp: '2026-06-13', value: 55.65 },
  { timestamp: '2026-06-14', value: 63.75 },
];

const roi: TimePoint[] = [
  { timestamp: '2026-06-10', value: 610.78 },
  { timestamp: '2026-06-11', value: 180.5 },
  { timestamp: '2026-06-12', value: 161.47 },
  { timestamp: '2026-06-13', value: 56.33 },
  { timestamp: '2026-06-14', value: 357.25 },
];

const conversions: TimePoint[] = [
  { timestamp: '2026-06-10', value: 3 },
  { timestamp: '2026-06-11', value: 30 },
  { timestamp: '2026-06-12', value: 36 },
  { timestamp: '2026-06-13', value: 70 },
  { timestamp: '2026-06-14', value: 90 },
];

const cpa: TimePoint[] = [
  { timestamp: '2026-06-10', value: 0.68 },
  { timestamp: '2026-06-11', value: 0.86 },
  { timestamp: '2026-06-12', value: 1.23 },
  { timestamp: '2026-06-13', value: 0.79 },
  { timestamp: '2026-06-14', value: 0.71 },
];

const data: MixedChartData = {
  area: {
    label: 'Cost',
    axisGroup: 'money',
    points: cost,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  spline: {
    label: 'ROI confirmed',
    axisGroup: 'roi',
    points: roi,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  line: {
    label: 'Conversions',
    axisGroup: 'conversions',
    points: conversions,
    maximumFractionDigits: 0,
  },
  bar: {
    label: 'CPA',
    axisGroup: 'money',
    points: cpa,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
};

export function CampaignChart() {
  return (
    <MixedTimeSeriesChart
      data={data}
      locale="en-GB"
      height={320}
      ariaLabel="Метрики кампании по датам"
    />
  );
}
```

Готовый пример с этими значениями находится в [`sample-data.ts`](src/pages/chart-demo/model/sample-data.ts), а его подключение — в [`ChartDemoPage.tsx`](src/pages/chart-demo/ui/ChartDemoPage.tsx).

## Настройки последовательности

Каждый из четырёх рядов поддерживает следующие поля:

| Поле                    | Обязательное | Описание                                         |
| ----------------------- | ------------ | ------------------------------------------------ |
| `label`                 | Да           | Название метрики в tooltip                       |
| `points`                | Да           | Массив точек `{ timestamp, value }`              |
| `axisGroup`             | Да           | Имя скрытой Y-шкалы                              |
| `minimumFractionDigits` | Нет          | Минимальное количество знаков после разделителя  |
| `maximumFractionDigits` | Нет          | Максимальное количество знаков после разделителя |

Ряды с одинаковым `axisGroup` используют общую шкалу. В примере `area` и `bar` входят в группу `money`, поэтому Cost и CPA масштабируются относительно одной оси. ROI и Conversions имеют отдельные шкалы.

## Props компонента

| Prop           | Тип              | По умолчанию        | Назначение                                     |
| -------------- | ---------------- | ------------------- | ---------------------------------------------- |
| `data`         | `MixedChartData` | —                   | Четыре временные последовательности            |
| `locale`       | `string`         | `ru-RU`             | Форматирование чисел через `Intl.NumberFormat` |
| `height`       | `number`         | `320`               | Высота графика в пикселях                      |
| `ariaLabel`    | `string`         | `Time-series chart` | Доступное название графика                     |
| `emptyMessage` | `string`         | `No data`           | Текст при отсутствии значений                  |
| `className`    | `string`         | —                   | Дополнительный CSS-класс контейнера            |

Дата в tooltip всегда отображается как `DD.MM.YYYY`, независимо от `locale`, чтобы соответствовать референсу.

## Валидация и пропуски

- `value: null` создаёт разрыв в конкретном ряду;
- частично пустые ряды допустимы;
- если во всех рядах нет значений, отображается `emptyMessage`;
- отрицательные, бесконечные значения и `NaN` отклоняются;
- duplicate timestamps внутри одного ряда отклоняются;
- datetime без часового пояса отклоняется;
- ошибка конфигурации представлена типом `MixedChartDataError`.

## Где находится публичный API

Компонент и его типы экспортируются через [`src/shared/ui/mixed-time-series-chart/index.ts`](src/shared/ui/mixed-time-series-chart/index.ts). Импортировать внутренние файлы `lib`, `model` и `ui` напрямую не требуется.

Архитектурные решения описаны в [`Architecture.md`](Architecture.md), а выполненные этапы и проверки — в [`Implementation_plan.md`](Implementation_plan.md).
