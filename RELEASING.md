# Руководство по выпуску @stark/eslint-config

Пакет устанавливается напрямую из GitHub и не публикуется в npm. Потребители
подключают конкретный Git-тег, поэтому изменения в `master` сами по себе не
попадают в приложения.

## Обычная разработка

Работай в репозитории:

```sh
cd /Users/stark/Documents/web/stark-eslint-config
```

Внеси изменение, добавь или обнови тесты и проверь рабочее дерево:

```sh
git status
```

Перед выпуском выполни полный набор проверок:

```sh
npm install
npm run check
```

`npm run check` запускает ESLint, TypeScript-проверку и тесты.

## Выпуск новой версии

1. Измени `version` в `package.json` по Semantic Versioning:

   - `0.1.1` — исправление;
   - `0.2.0` — новая совместимая функциональность;
   - `1.0.0` — стабильный публичный контракт.

2. Закоммить изменения:

```sh
git add .
git commit -m "fix: describe the change"
```

Используй префиксы `feat`, `fix`, `chore`, `docs` или `refactor` по смыслу
изменения.

3. Отправь коммит в `master`:

```sh
git push origin master
```

4. Создай аннотированный тег с той же версией:

```sh
git tag -a v0.1.1 -m "Release v0.1.1"
git push origin v0.1.1
```

После этого потребители могут подключить релиз:

```json
{
  "@stark/eslint-config": "git+ssh://git@github.com/StarkElessar/stark-eslint-config.git#v0.1.1"
}
```

## Обновление приложения-потребителя

В каждом потребителе обнови тег в `package.json`, затем пересоздай lockfile:

```sh
pnpm install
pnpm typecheck
pnpm build
```

Для приложения `i-finances` дополнительно проверь линтеры:

```sh
pnpm lint:js:fix
```

После успешной проверки закоммить `package.json` и `pnpm-lock.yaml` в
репозитории приложения.

## Важные правила

- Не передвигай уже опубликованный тег на другой коммит.
- Не используй повторно `v0.1.0`; для следующего состояния создай `v0.1.1`.
- Потребитель, закреплённый на `v0.1.0`, не получит изменения из `master`.
- Всегда отправляй сначала коммит в `master`, затем тег.
- Если нужен полностью неизменяемый pin без тега, можно использовать полный
  40-символьный SHA коммита.
- После изменения зависимости проверь, что lockfile содержит полный SHA и
  `integrity` для Git-архива.
- npm-публикация для текущего Git-процесса не требуется.

## Быстрый шаблон

```sh
npm run check
git add .
git commit -m "fix: describe the change"
git push origin master
git tag -a v0.1.1 -m "Release v0.1.1"
git push origin v0.1.1
```

