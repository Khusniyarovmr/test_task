# План разработки смешанного time-series графика


> Статус на 15.09.2026: реализация и все проверки завершены. Не выполнена только необязательная очистка существующего Python-скелета — он оставлен как пользовательское содержимое репозитория.

План опирается на решения из `Architecture.md`. Этапы выполняются последовательно; каждый этап заканчивается указанной проверкой и не считается завершённым при падающих релевантных тестах.

## 0. Подготовка репозитория

- [x] Проверить актуальный `git status` и не включать IDE/локальные файлы в продуктовые изменения.
- [x] Добавить `.gitignore` для Node.js, Vite, coverage, Playwright artifacts и локальных environment-файлов.
- [x] Создать Vite React + TypeScript приложение в корне без второго вложенного проекта.
- [x] Добавить `package.json`, lock-файл, `tsconfig*`, Vite, ESLint и Prettier config.
- [x] Установить React, Recharts, Sass, Vitest, React Testing Library и Playwright в совместимых стабильных версиях.
- [ ] Удалить пустой Python scaffold (`pyproject.toml`, `.venv`) из финального состава проекта, если он не используется никаким репозиторным инструментом; локальную `.venv` удалять с диска необязательно, но она должна быть ignored.
- [x] Добавить scripts: `dev`, `build`, `preview`, `format`, `format:check`, `lint`, `typecheck`, `test`, `test:coverage`, `test:e2e`.

Проверка этапа: чистая установка зависимостей, старт Vite, пустая production-сборка, `lint` и `typecheck`.

## 1. Каркас приложения и demo-page

- [x] Создать только необходимые слои `app`, `pages`, `shared` согласно архитектуре.
- [x] Настроить глобальный reset, системный Arial-compatible font и demo background, близкий к референсу.
- [x] Создать `ChartDemoPage` с адаптивным контейнером, без элементов окружающего конструктора из GIF.
- [x] Добавить sample data на 10–14.06.2026 со значениями из `Architecture.md`.
- [x] Подключить готовый компонент через его публичный `index.ts`.

Проверка этапа: приложение открывается без console errors на desktop и viewport 320 px.

## 2. Публичные типы и data pipeline

- [x] Описать `TimePoint`, `TimeSeries`, `MixedChartData`, props и типизированную ошибку конфигурации.
- [x] Реализовать проверку timestamp (date-only или datetime с timezone), значений, labels, axis groups и duplicates.
- [x] Реализовать объединение timestamp четырёх рядов, сортировку и преобразование в строки Recharts.
- [x] Сохранить пропуски как `null`; не соединять линию через отсутствующие точки.
- [x] Рассчитать список axis groups и домен `[0, max × 1.20]`, с fallback `[0, 1]`.
- [x] Мемоизировать нормализацию по ссылке на `data`, не переносить derived data в state.
- [x] Реализовать форматирование даты и чисел через `Intl`.

Тесты этапа:

- [x] четыре ряда с одинаковыми timestamp;
- [x] несовпадающие timestamp и `null`;
- [x] хронологическая сортировка;
- [x] общая `money` шкала для area/bar и отдельные шкалы для spline/line;
- [x] пустые данные и zero-only group;
- [x] invalid ISO date, duplicate, `NaN`, `Infinity`, negative value, пустой label/group;
- [x] locale, date-only без timezone shift и правила дробной части.

## 3. Базовый SVG-рендеринг

- [x] Собрать responsive `ComposedChart` с фиксированными margin и скрытыми X/Y axes.
- [x] Создавать одну скрытую Y-ось на уникальный `axisGroup`.
- [x] Отрисовать `Area` с `monotoneX`, жёлтой заливкой и без заметного контура.
- [x] Отрисовать `Bar` поверх area с общей `money` шкалой и responsive max width.
- [x] Отрисовать зелёный `spline` через `Line type="natural"` без обычных dots.
- [x] Отрисовать фиолетовый `line` через `Line type="linear"` с квадратными dots.
- [x] Реализовать `PlotFrame` по фактическим координатам plot area.
- [x] Зафиксировать z-order: area → bar → spline → line → active overlays.
- [x] Добавить empty state для полностью пустого набора.

Проверка этапа: component tests на primitives/axes/empty state и ручное сравнение базового кадра при viewport 800×529.

## 4. Tooltip и активные состояния

- [x] Реализовать HTML `ChartTooltip` вместо default tooltip.
- [x] Зафиксировать порядок строк `area`, `bar`, `spline`, `line`, независимо от SVG z-order.
- [x] Отобразить дату `DD.MM.YYYY`, цветные circles, labels и bold values.
- [x] Не отображать строку, если в активной дате значение ряда равно `null`.
- [x] Настроить axis-level hover ближайшей даты без crosshair.
- [x] Ограничить tooltip границами графика и проверить смену стороны у краёв.
- [x] Реализовать halo для area/spline/line и active style для bar; не ломать постоянный квадрат line.
- [x] Скрывать tooltip/halo после mouse leave.
- [x] Добавить доступное имя, keyboard focus и reduced-motion стили.

Проверка этапа: component tests порядка/форматирования плюс Playwright hover первой, средней, последней даты и keyboard smoke test.

## 5. Visual calibration

- [x] Создать стабильные Playwright fixtures без случайных данных и отключить анимацию в screenshot tests.
- [x] Снять baseline всего графика на desktop viewport 800×529.
- [x] Снять hover snapshots для 10.06, 12.06 и 14.06.
- [x] Сверить с GIF: геометрию plot area, headroom, spline curve, square markers, bar width, frame и tooltip.
- [x] Последовательно откалибровать CSS tokens, chart margins и domain ratio; не менять публичный API ради визуальной настройки.
- [x] Проверить, не даёт ли `natural` нежелательный overshoot; при необходимости заменить только внутреннюю интерполяцию на `monotoneX`.
- [x] Добавить mobile snapshot на 320 px и проверить отсутствие horizontal overflow/tooltip clipping.

Проверка этапа: стабильный повторный прогон visual tests минимум два раза подряд.

## 6. Документация использования

- [x] Написать README с назначением, требованиями к Node.js и командами `install/dev/test/build/preview`.
- [x] Показать четыре самостоятельных массива `cost`, `roi`, `conversions`, `cpa`.
- [x] Показать сборку `MixedChartData` и полный JSX-вызов компонента.
- [x] Объяснить `axisGroup`, особенно общую шкалу `money` для Cost/CPA.
- [x] Задокументировать ISO 8601, `null`, сортировку, duplicates, empty state и форматирование.
- [x] Добавить краткое описание структуры и ссылку на `Architecture.md`.
- [x] Указать production-команду и содержимое `dist/`, не требуя backend/env vars.

Проверка этапа: выполнить инструкции README с чистой установкой и убедиться, что пример компилируется без скрытых шагов.

## 7. Финальный quality gate

- [x] `npm run format:check` (или эквивалентный script).
- [x] `npm run lint`.
- [x] `npm run typecheck`.
- [x] `npm run test:coverage`.
- [x] `npm run build`.
- [x] `npm run test:e2e`.
- [x] Проверить browser console, network panel и отсутствие runtime warnings.
- [x] Проверить UTF-8, регистр путей и запуск на case-sensitive filesystem.
- [x] Проверить `git diff`/`git status`: generated GIF, coverage, `dist`, `.venv` и test artifacts игнорируются; ранее staged `.idea`/`pyproject.toml` зафиксированы как пользовательское содержимое и не изменялись.
- [x] Проверить, что README и реализация не расходятся с публичным контрактом из `Architecture.md`.

## Матрица критериев и проверок

| ID | Критерий приёмки | Основная проверка |
|---|---|---|
| AC-1 | API принимает ровно четыре роли: area/spline/line/bar | TypeScript contract + component test |
| AC-2 | Каждая роль имеет правильный primitive, цвет, interpolation и z-order | component test + base visual snapshot |
| AC-3 | Cost и CPA разделяют шкалу, ROI и Conversions независимы | unit test axis groups + visual snapshot |
| AC-4 | Hover показывает общую дату и четыре значения в эталонном порядке | Playwright first/middle/last hover |
| AC-5 | Tooltip и active markers визуально соответствуют GIF и не обрезаются | hover visual snapshots |
| AC-6 | График работает при 320 px и широком контейнере | responsive Playwright tests |
| AC-7 | `null`, пустые и невалидные данные обрабатываются по контракту | unit/component edge-case tests |
| AC-8 | Клавиатура и reduced motion не ломают основной сценарий | accessibility Playwright smoke tests |
| AC-9 | Новый пользователь запускает и инициализирует график по README | clean-install documentation check |
| AC-10 | Репозиторий собирается без lint/type/test/build ошибок | final quality gate |

## Порядок поставки

Минимальный вертикальный срез появляется после этапа 4: данные → четыре серии → tooltip. Этапы 5–7 превращают его в проверяемый результат, пригодный для GitHub-передачи. Публикация npm-пакета или отдельного backend не требуется.
