# Tag Formatter for GitHub Pages

Минимальный статический сервис для форматирования тегов. Подходит для GitHub Pages: backend, bundler и runtime-зависимости не нужны.

## Что делает

- принимает сырой список тегов;
- понимает пробелы, запятые, `;`, `|`, переносы строк и уже существующие `#`;
- нормализует регистр и небезопасные символы;
- удаляет дубликаты;
- выводит результат в формате `#tag-one #tag-two`;
- копирует всё поле результата в буфер обмена.

## Структура

```text
.
├── index.html          # GitHub Pages entrypoint
├── src/
│   ├── main.ts         # TypeScript source
│   └── styles.css      # Material-like responsive CSS
├── assets/
│   └── main.js         # Browser-ready JavaScript for GitHub Pages
├── package.json        # Optional TypeScript check/build scripts
└── tsconfig.json
```

## Деплой на GitHub Pages

1. Создайте репозиторий.
2. Загрузите файлы из этой папки в корень репозитория.
3. В GitHub откройте **Settings → Pages**.
4. В **Build and deployment** выберите **Deploy from a branch**.
5. Выберите ветку `main` и папку `/root`.

## Локальная проверка

Откройте `index.html` напрямую в браузере или поднимите любой статический сервер:

```bash
python3 -m http.server 8080
```

Затем откройте `http://localhost:8080`.

## TypeScript

Сервис уже содержит скомпилированный `assets/main.js`. Если меняете `src/main.ts`, можно пересобрать:

```bash
npm install
npm run build
```

Единственная dev-зависимость — `typescript`. В production/runtime зависимостей нет.
