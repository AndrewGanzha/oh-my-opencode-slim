# Руководство по установке

Полные инструкции по установке `oh-my-opencode-slim`.

## Содержание

- [Для людей](#для-людей)
- [Для LLM-агентов](#для-llm-агентов)
- [Устранение неполадок](#устранение-неполадок)
- [Удаление](#удаление)

---

## Для людей

### Быстрая установка

Запустите интерактивный установщик:

```bash
bunx oh-my-opencode-slim@latest install
```

Или используйте неинтерактивный режим:

```bash
bunx oh-my-opencode-slim@latest install --no-tui --kimi=yes --openai=yes --antigravity=yes --chutes=yes --opencode-free=yes --opencode-free-model=auto --tmux=no --skills=yes
```

### Опции провайдеров

Установщик поддерживает несколько провайдеров:
- **OpenCode Free Models**: бесплатно доступные модели `opencode/*` с live-обновлением
- **Kimi For Coding**: высокопроизводительные модели для программирования
- **OpenAI**: модели GPT-4 и GPT-3.5
- **Antigravity (Google)**: модели Claude 4.5 и Gemini 3 через инфраструктуру Google
- **Chutes**: модели `chutes/*` с live-обновлением через поток аутентификации OpenCode

Когда включен режим OpenCode free, установщик выполняет:

```bash
opencode models --refresh --verbose
```

Далее он фильтрует только бесплатные модели `opencode/*`, выбирает основную coding-first модель и вспомогательную модель для агентов поиска/реализации.

Включение при установке:
```bash
bunx oh-my-opencode-slim install --kimi=yes --openai=yes --antigravity=yes --chutes=yes --opencode-free=yes --opencode-free-model=auto
```

### После установки

Пройдите аутентификацию у ваших провайдеров:

```bash
opencode auth login
# Выберите провайдера -> завершите OAuth flow
# Повторите для каждого включенного провайдера
```

После аутентификации запустите `opencode` и выполните `ping all agents`, чтобы убедиться, что отвечают все агенты.

> **Совет: модели полностью настраиваются.** Установщик задает разумные значения по умолчанию, но вы можете назначить *любую* модель *любому* агенту. Отредактируйте `~/.config/opencode/oh-my-opencode-slim.json` (или `.jsonc`, если нужны комментарии), чтобы переопределить модели, изменить усилие рассуждения или полностью отключить агентов. Подробности в разделе [Configuration](quick-reference.md#configuration).

### Альтернатива: попросить любой coding-агент

Вставьте это в Claude Code, AmpCode, Cursor или любой coding-агент:

```
Install and configure by following the instructions here:
https://raw.githubusercontent.com/alvinunreal/oh-my-opencode-slim/refs/heads/master/README.md
```

---

## Для LLM-агентов

Если вы LLM-агент, который помогает с настройкой `oh-my-opencode-slim`, действуйте по шагам ниже.

### Шаг 1: Проверьте установку OpenCode

```bash
opencode --version
```

Если OpenCode не установлен, сначала направьте пользователя на https://opencode.ai/docs.

### Шаг 2: Уточните доступ к провайдерам

Задавайте вопросы **по одному**, ожидая ответ после каждого:

1. "У вас есть доступ к **Kimi For Coding**?" *(дает модели Kimi k1.5)*
2. "У вас есть доступ к API **OpenAI**?" *(включает модели `openai/`)*
3. "У вас есть доступ к **Antigravity (Google)**?" *(включает модели `google/` через Antigravity)*
4. "Вы хотите использовать **Chutes**?" *(включает модели `chutes/` с учетом дневных лимитов)*
5. "Вы хотите использовать **OpenCode free models**?" *(обновляет и выбирает из бесплатных `opencode/*`)*

Помогите пользователю понять компромиссы:
- Режим OpenCode free находит последние бесплатные `opencode/*` через `opencode models --refresh --verbose`.
- В режиме только OpenCode можно назначать более одной OpenCode-модели между агентами.
- Гибридный режим может совмещать OpenCode free с OpenAI, Kimi и/или Antigravity.
- В гибридном режиме `designer` остается на внешнем маппинге провайдера.
- Для Chutes приоритет отдается более мощным моделям для orchestrator/oracle и моделям с большим лимитом для вспомогательных агентов.
- Kimi For Coding дает сильные модели для программирования.
- OpenAI включает модели `openai/`.
- Antigravity (Google) дает модели Claude и Gemini через инфраструктуру Google.
- Chutes использует аутентификацию OpenCode-провайдера (`opencode auth login` -> выбрать `chutes`).
- Необязательные внешние сигналы ранжирования:
  - `ARTIFICIAL_ANALYSIS_API_KEY` (качество/кодинг/задержка/цена)
  - `OPENROUTER_API_KEY` (метаданные по цене моделей)
  Если заданы, динамическое планирование установщика использует их для улучшения ранжирования моделей.

### Шаг 3: Запустите установщик

На основе ответов выполните:

```bash
bunx oh-my-opencode-slim@latest install --no-tui --kimi=<yes|no> --openai=<yes|no> --antigravity=<yes|no> --chutes=<yes|no> --opencode-free=<yes|no> --opencode-free-model=<id|auto> --tmux=<yes|no> --skills=<yes|no>
```

**Примеры:**
```bash
# Kimi + OpenAI + Antigravity
bunx oh-my-opencode-slim@latest install --no-tui --kimi=yes --openai=yes --antigravity=yes --chutes=yes --opencode-free=yes --opencode-free-model=auto --tmux=no --skills=yes

# Только OpenAI
bunx oh-my-opencode-slim@latest install --no-tui --kimi=no --openai=yes --antigravity=no --chutes=no --opencode-free=no --tmux=no --skills=yes

# Только бесплатные модели OpenCode (автовыбор)
bunx oh-my-opencode-slim@latest install --no-tui --kimi=no --openai=no --antigravity=no --chutes=no --opencode-free=yes --opencode-free-model=auto --tmux=no --skills=yes

# Бесплатные модели OpenCode + OpenAI (ручной выбор основной модели)
bunx oh-my-opencode-slim@latest install --no-tui --kimi=no --openai=yes --antigravity=no --chutes=no --opencode-free=yes --opencode-free-model=opencode/gpt-5-nano --tmux=no --skills=yes
```

Установщик автоматически:
- Добавляет плагин в `~/.config/opencode/opencode.json`
- Генерирует маппинг моделей агентов в `~/.config/opencode/oh-my-opencode-slim.json` (или `.jsonc`)

**Критически важные рекомендации для пользователя:**
- Он может легко назначать **разные модели разным агентам**, редактируя `~/.config/opencode/oh-my-opencode-slim.json` (или `.jsonc`).
- Если позже добавится новый провайдер, достаточно обновить этот файл.
- Прочитайте сгенерированный файл `~/.config/opencode/oh-my-opencode-slim.json` (или `.jsonc`) и сообщите конфигурацию моделей.

### Шаг 4: Аутентификация у провайдеров

**Для Kimi (если включен):**
Попросите пользователя выполнить следующую команду.
Не запускайте ее сами, она требует взаимодействия с пользователем.
```bash
opencode auth login
# Выберите провайдера "Kimi For Coding" и завершите OAuth flow
```

**Для OpenAI (если включен):**
Попросите пользователя выполнить следующую команду.
Не запускайте ее сами, она требует взаимодействия с пользователем.
```bash
opencode auth login
# Выберите нужного провайдера и завершите OAuth flow
```

**Для Antigravity (если включен):**
Попросите пользователя выполнить следующую команду.
Не запускайте ее сами, она требует взаимодействия с пользователем.
```bash
opencode auth login
# Выберите провайдера "Antigravity (Google)" и завершите OAuth flow
```

---

## Устранение неполадок

### Установщик завершается с ошибкой

Проверьте ожидаемый формат конфигурации:
```bash
bunx oh-my-opencode-slim@latest install --help
```

Затем вручную создайте конфигурационные файлы:
- `~/.config/opencode/oh-my-opencode-slim.json` (или `.jsonc`)

### Агенты не отвечают

1. Проверьте аутентификацию:
   ```bash
   opencode auth status
   ```

2. Убедитесь, что конфиг существует и валиден:
   ```bash
   cat ~/.config/opencode/oh-my-opencode-slim.json
   ```

3. Проверьте, что провайдер настроен в `~/.config/opencode/opencode.json`

### Проблемы с аутентификацией

Если провайдеры не работают:

1. Проверьте статус аутентификации:
   ```bash
   opencode auth status
   ```

2. При необходимости выполните вход заново:
   ```bash
   opencode auth login
   ```

3. Убедитесь, что в конфиге указаны корректные настройки провайдера:
   ```bash
   cat ~/.config/opencode/oh-my-opencode-slim.json
   ```

### Не работает интеграция с tmux

Убедитесь, что запускаете OpenCode с флагом `--port`, и порт совпадает со значением переменной окружения `OPENCODE_PORT`:

```bash
tmux
export OPENCODE_PORT=4096
opencode --port 4096
```

Подробности в [Quick Reference](quick-reference.md#tmux-integration).

---

## Удаление

1. **Удалите плагин из конфигурации OpenCode**:

   Отредактируйте `~/.config/opencode/opencode.json` и удалите `"oh-my-opencode-slim"` из массива `plugin`.

2. **Удалите конфигурационные файлы (опционально)**:
   ```bash
   rm -f ~/.config/opencode/oh-my-opencode-slim.json
   rm -f .opencode/oh-my-opencode-slim.json
   ```

3. **Удалите навыки (опционально)**:
   ```bash
   npx skills remove simplify
   npx skills remove agent-browser
   ```
