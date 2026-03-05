# Краткий справочник

Полный справочник по конфигурации и возможностям `oh-my-opencode-slim`.

## Содержание

- [Пресеты](#пресеты)
- [Навыки](#навыки)
  - [Cartography](#cartography)
- [MCP-серверы](#mcp-серверы)
- [Инструменты и возможности](#инструменты-и-возможности)
- [Конфигурация](#конфигурация)

---

## Пресеты

Пресеты - это заранее настроенные маппинги моделей агентов для разных комбинаций провайдеров. Установщик генерирует их автоматически на основе доступных провайдеров, а вы можете переключаться между ними мгновенно.

### Обнаружение бесплатных моделей OpenCode

Установщик может найти актуальные бесплатные модели OpenCode, выполнив:

```bash
opencode models --refresh --verbose
```

Правила выбора:
- Учитываются только бесплатные модели `opencode/*`.
- Для задач оркестрации/стратегии выбирается основная coding-first модель.
- Для задач исследования/реализации выбирается вспомогательная модель.
- В режиме только OpenCode можно назначать разные модели OpenCode разным агентам.
- Гибридный режим позволяет сочетать OpenCode free с OpenAI/Kimi/Antigravity; `designer` остается на внешнем маппинге провайдера.

Полезные флаги:

```bash
--opencode-free=yes|no
--opencode-free-model=<id|auto>
```

### Переключение пресетов

**Способ 1: редактирование файла конфигурации**

Отредактируйте `~/.config/opencode/oh-my-opencode-slim.json` (или `.jsonc`) и измените поле `preset`:

```json
{
  "preset": "openai"
}
```

**Способ 2: переменная окружения**

Перед запуском OpenCode установите переменную окружения:

```bash
export OH_MY_OPENCODE_SLIM_PRESET=openai
opencode
```

Переменная окружения имеет приоритет над файлом конфигурации.

### Пресет OpenAI

Использует только модели OpenAI:

```json
{
  "preset": "openai",
  "presets": {
    "openai": {
      "orchestrator": { "model": "openai/gpt-5.2-codex", "skills": ["*"], "mcps": ["websearch"] },
      "oracle": { "model": "openai/gpt-5.2-codex", "variant": "high", "skills": [], "mcps": [] },
      "librarian": { "model": "openai/gpt-5.1-codex-mini", "variant": "low", "skills": [], "mcps": ["websearch", "context7", "grep_app"] },
      "explorer": { "model": "openai/gpt-5.1-codex-mini", "variant": "low", "skills": [], "mcps": [] },
      "designer": { "model": "openai/gpt-5.1-codex-mini", "variant": "medium", "skills": ["agent-browser"], "mcps": [] },
      "fixer": { "model": "openai/gpt-5.1-codex-mini", "variant": "low", "skills": [], "mcps": [] }
    }
  }
}
```

### Провайдер Google (Antigravity)

Доступ к моделям Claude 4.5 и Gemini 3 через инфраструктуру Antigravity от Google.

**Установка:**
```bash
bunx oh-my-opencode-slim install --antigravity=yes --opencode-free=yes --opencode-free-model=auto
```

**Маппинг агентов:**
- Orchestrator: Kimi (если доступен)
- Oracle: GPT (если доступен)
- Explorer/Librarian/Designer/Fixer: Gemini 3 Flash через Antigravity
- Если включен OpenCode free mode, Explorer/Librarian/Fixer могут использовать выбранную бесплатную вспомогательную модель `opencode/*`, а `designer` остается на внешнем маппинге

**Аутентификация:**
```bash
opencode auth login
# Выберите провайдера "google"
```

**Доступные модели:**
- `google/antigravity-gemini-3-flash`
- `google/antigravity-gemini-3.1-pro`
- `google/antigravity-claude-sonnet-4-5`
- `google/antigravity-claude-sonnet-4-5-thinking`
- `google/antigravity-claude-opus-4-5-thinking`
- `google/gemini-2.5-flash` (Gemini CLI)
- `google/gemini-2.5-pro` (Gemini CLI)
- `google/gemini-3-flash-preview` (Gemini CLI)
- `google/gemini-3.1-pro-preview` (Gemini CLI)

### Авторский пресет

Смешанная конфигурация с несколькими провайдерами:

```json
{
  "preset": "alvin",
  "presets": {
    "alvin": {
      "orchestrator": { "model": "google/claude-opus-4-5-thinking", "skills": ["*"], "mcps": ["*"] },
      "oracle": { "model": "openai/gpt-5.2-codex", "variant": "high", "skills": [], "mcps": [] },
      "librarian": { "model": "google/gemini-3-flash", "variant": "low", "skills": [], "mcps": ["websearch", "context7", "grep_app"] },
      "explorer": { "model": "cerebras/zai-glm-4.7", "variant": "low", "skills": [], "mcps": [] },
      "designer": { "model": "google/gemini-3-flash", "variant": "medium", "skills": ["agent-browser"], "mcps": [] },
      "fixer": { "model": "cerebras/zai-glm-4.7", "variant": "low", "skills": [], "mcps": [] }
    }
  }
}
```

> **Провайдер Antigravity:** полное руководство см. в [Antigravity Setup](antigravity.md)

---

## Навыки

Навыки - это специализированные возможности, предоставляемые внешними агентами и инструментами. В отличие от MCP (это серверы), навыки - это prompt-конфигурации инструментов, которые устанавливаются через `npx skills add` во время установки.

### Рекомендуемые навыки (через npx)

| Навык | Описание | Назначается |
|-------|----------|-------------|
| [`simplify`](#simplify) | Эксперт по упрощению кода в духе YAGNI | `orchestrator` |
| [`agent-browser`](#agent-browser) | Высокопроизводительная автоматизация браузера | `designer` |

### Кастомные навыки (в комплекте репозитория)

| Навык | Описание | Назначается |
|-------|----------|-------------|
| [`cartography`](#cartography) | Понимание репозитория и генерация иерархических codemap | `orchestrator` |

### Simplify

**Священная истина минималиста: каждая строка кода - это обязательство.**

`simplify` - специализированный навык для анализа сложности и соблюдения YAGNI. Он выявляет ненужные абстракции и предлагает минимальные реализации.

### Agent Browser

**Внешняя автоматизация браузера для визуальной верификации и тестирования.**

`agent-browser` дает полноценные возможности высокопроизводительной автоматизации браузера. Он позволяет агентам открывать веб-страницы, взаимодействовать с элементами и делать скриншоты для проверки визуального состояния.

### Cartography

**Автоматизированное картографирование репозитория через иерархические codemap.**

Отдельное руководство (со скриншотами): **[docs/cartography.md](cartography.md)**.

`cartography` помогает Orchestrator выстраивать и поддерживать глубокое архитектурное понимание любой кодовой базы. Вместо чтения тысяч строк кода каждый раз агенты обращаются к иерархическим `codemap.md`, где описано *почему* и *как* устроена каждая директория.

**Как использовать:**

Просто попросите **Orchestrator**: `run cartography`. Он автоматически определит, нужно ли инициализировать новую карту или обновить существующую.

**Чем полезно:**

- **Мгновенный онбординг:** помогает агентам (и людям) понять незнакомую кодовую базу за секунды.
- **Эффективный контекст:** агенты читают архитектурные выжимки, экономят токены и повышают точность.
- **Обнаружение изменений:** переанализируются только измененные папки, поэтому обновления быстрые и экономичные.
- **Долговечная документация:** фокус на высокоуровневых паттернах, которые не устаревают.

<details>
<summary><b>Технические детали и ручное управление</b></summary>

Навык использует фоновый Python-движок (`cartographer.py`) для управления состоянием и обнаружения изменений.

**Как это работает под капотом:**

1. **Initialize** - Orchestrator анализирует структуру репозитория и запускает `init`, чтобы создать `.slim/cartography.json` (хэши) и пустые шаблоны.
2. **Map** - Orchestrator запускает специализированных подагентов **Explorer**, которые заполняют codemap долговечными архитектурными деталями (Responsibility, Design, Flow, Integration).
3. **Update** - при последующих запусках движок находит измененные файлы и обновляет codemap только для затронутых папок.

**Ручные команды:**

```bash
# Инициализация маппинга вручную
python3 ~/.config/opencode/skills/cartography/scripts/cartographer.py init \
  --root . \
  --include "src/**/*.ts" \
  --exclude "**/*.test.ts"

# Проверка изменений с момента последней карты
python3 ~/.config/opencode/skills/cartography/scripts/cartographer.py changes --root .

# Синхронизация хэшей после ручного обновления карты
python3 ~/.config/opencode/skills/cartography/scripts/cartographer.py update --root .
```
</details>

### Назначение навыков

Вы можете настроить, какие навыки разрешены каждому агенту, в `~/.config/opencode/oh-my-opencode-slim.json` (или `.jsonc`).

**Синтаксис:**

| Синтаксис | Описание | Пример |
|-----------|----------|--------|
| `"*"` | Все установленные навыки | `["*"]` |
| `"!item"` | Исключить конкретный навык | `["*", "!agent-browser"]` |
| Явный список | Только перечисленные навыки | `["simplify"]` |
| `"!*"` | Запретить все навыки | `["!*"]` |

**Правила:**
- `*` разворачивается во все доступные навыки
- `!item` исключает конкретные навыки
- Конфликты (например `["a", "!a"]`) -> выигрывает запрет (принцип наименьших привилегий)
- Пустой список `[]` -> навыки запрещены

**Пример конфигурации:**

```json
{
  "presets": {
    "my-preset": {
      "orchestrator": {
        "skills": ["*", "!agent-browser"]
      },
      "designer": {
        "skills": ["agent-browser", "simplify"]
      }
    }
  }
}
```

---

## MCP-серверы

Встроенные серверы Model Context Protocol (включены по умолчанию):

| MCP | Назначение | URL |
|-----|------------|-----|
| `websearch` | Поиск в реальном времени через Exa AI | `https://mcp.exa.ai/mcp` |
| `context7` | Официальная документация библиотек | `https://mcp.context7.com/mcp` |
| `grep_app` | Поиск кода на GitHub через grep.app | `https://mcp.grep.app` |

### Права MCP

Управляйте доступом агентов к MCP через allowlist для каждого агента:

| Агент | MCP по умолчанию |
|-------|-------------------|
| `orchestrator` | `websearch` |
| `designer` | нет |
| `oracle` | нет |
| `librarian` | `websearch`, `context7`, `grep_app` |
| `explorer` | нет |
| `fixer` | нет |

### Конфигурация и синтаксис

Доступ к MCP настраивается в файле плагина: `~/.config/opencode/oh-my-opencode-slim.json` (или `.jsonc`).

**Права на уровне агента**

Контролируйте доступ через массив `mcps` в вашем пресете. Синтаксис такой же, как у навыков:

| Синтаксис | Описание | Пример |
|-----------|----------|--------|
| `"*"` | Все MCP | `["*"]` |
| `"!item"` | Исключить конкретный MCP | `["*", "!context7"]` |
| Явный список | Только перечисленные MCP | `["websearch", "context7"]` |
| `"!*"` | Запретить все MCP | `["!*"]` |

**Правила:**
- `*` разворачивается во все доступные MCP
- `!item` исключает конкретные MCP
- Конфликты (например `["a", "!a"]`) -> выигрывает запрет
- Пустой список `[]` -> MCP запрещены

**Пример конфигурации:**

```json
{
  "presets": {
    "my-preset": {
      "orchestrator": {
        "mcps": ["websearch"]
      },
      "librarian": {
        "mcps": ["websearch", "context7", "grep_app"]
      },
      "oracle": {
        "mcps": ["*", "!websearch"]
      }
    }
  }
}
```

**Глобальное отключение**

Вы можете глобально отключить отдельные MCP, добавив их в массив `disabled_mcps` в корне объекта конфигурации.

---

## Инструменты и возможности

### Интеграция с tmux

> **Временный обходной путь:** запускайте OpenCode с `--port`, чтобы работала интеграция tmux. Порт должен совпадать с переменной окружения `OPENCODE_PORT` (по умолчанию: 4096). Это требуется до исправления upstream-проблемы. [opencode#9099](https://github.com/anomalyco/opencode/issues/9099).

**Наблюдайте за работой агентов в реальном времени.** Когда Orchestrator запускает подагентов или фоновые задачи, автоматически создаются новые tmux-pane с живым прогрессом каждого агента.

#### Быстрая настройка

1. **Включите интеграцию tmux** в `oh-my-opencode-slim.json` (или `.jsonc`):

   ```json
   {
     "tmux": {
       "enabled": true,
       "layout": "main-vertical",
       "main_pane_size": 60
     }
   }
   ```

2. **Запустите OpenCode внутри tmux**:
    ```bash
    tmux
    opencode --port 4096
    ```

#### Варианты layout

| Layout | Описание |
|--------|----------|
| `main-vertical` | Ваша сессия слева (60%), агенты справа столбцом |
| `main-horizontal` | Ваша сессия сверху (60%), агенты ниже |
| `tiled` | Все pane одинакового размера в сетке |
| `even-horizontal` | Все pane рядом по горизонтали |
| `even-vertical` | Все pane столбцом по вертикали |

> **Подробное руководство:** полный гайд по tmux, troubleshooting и расширенному использованию: [Tmux Integration](tmux-integration.md)

### Фоновые задачи

Плагин предоставляет инструменты для асинхронной работы:

| Инструмент | Описание |
|------------|----------|
| `background_task` | Запускает агента в новой сессии (`sync=true` блокирует, `sync=false` работает в фоне) |
| `background_output` | Возвращает результат фоновой задачи по ID |
| `background_cancel` | Прерывает выполняющиеся задачи |

### LSP-инструменты

Интеграция Language Server Protocol для интеллектуальной работы с кодом:

| Инструмент | Описание |
|------------|----------|
| `lsp_goto_definition` | Переход к определению символа |
| `lsp_find_references` | Поиск всех использований символа в workspace |
| `lsp_diagnostics` | Получение ошибок/предупреждений от language server |
| `lsp_rename` | Переименование символа во всех файлах |

> **Встроенные LSP-серверы:** OpenCode включает предварительно настроенные LSP-серверы для 30+ языков (TypeScript, Python, Rust, Go и др.). Полный список и требования - в [официальной документации](https://opencode.ai/docs/lsp/#built-in).

### Инструменты поиска по коду

Быстрый поиск и рефакторинг:

| Инструмент | Описание |
|------------|----------|
| `grep` | Быстрый поиск содержимого через ripgrep |
| `ast_grep_search` | Поиск code-pattern на уровне AST (25 языков) |
| `ast_grep_replace` | AST-рефакторинг с поддержкой dry-run |

### Форматтеры

OpenCode автоматически форматирует файлы после записи/редактирования с помощью форматтеров для конкретного языка.

> **Встроенные форматтеры:** поддерживаются Prettier, Biome, gofmt, rustfmt, ruff и еще 20+ инструментов. Полный список - в [официальной документации](https://opencode.ai/docs/formatters/#built-in).

---

## Конфигурация

### Файлы, которые вы редактируете

| Файл | Назначение |
|------|------------|
| `~/.config/opencode/opencode.json` | Базовые настройки OpenCode |
| `~/.config/opencode/oh-my-opencode-slim.json` или `.jsonc` | Настройки плагина (агенты, tmux, MCP) |
| `.opencode/oh-my-opencode-slim.json` или `.jsonc` | Локальные переопределения плагина для проекта (опционально) |

> **Поддержка JSONC:** файлы конфигурации поддерживают формат JSONC (JSON с комментариями). Используйте расширение `.jsonc` для комментариев и trailing comma. Если существуют оба файла `.jsonc` и `.json`, приоритет у `.jsonc`.

### Переопределение промптов

Вы можете кастомизировать промпты агентов, создав markdown-файлы в `~/.config/opencode/oh-my-opencode-slim/`:

- Если пресет не задан, файлы промптов загружаются прямо из этой директории.
- Если `preset` задан (например `test`), плагин сначала проверяет `~/.config/opencode/oh-my-opencode-slim/{preset}/`, затем использует корневую директорию промптов как fallback.

| Файл | Назначение |
|------|------------|
| `{agent}.md` | Полностью заменяет дефолтный промпт |
| `{agent}_append.md` | Добавляет текст к дефолтному промпту |

**Пример:**

```
~/.config/opencode/oh-my-opencode-slim/
  test/
    orchestrator.md      # Переопределение для конкретного пресета (предпочтительно)
    explorer_append.md
  orchestrator.md        # Кастомный промпт orchestrator
  orchestrator_append.md # Добавление к дефолтному промпту orchestrator
  explorer.md
  explorer_append.md
  ...
```

**Использование:**

- Создайте `{agent}.md`, чтобы полностью заменить дефолтный промпт агента
- Создайте `{agent}_append.md`, чтобы добавить инструкции к дефолтному промпту
- Оба файла могут существовать одновременно - приоритет у полного переопределения
- Когда задан `preset`, сначала проверяются `{preset}/{agent}.md` и `{preset}/{agent}_append.md`
- Если ни один файл не найден, используется дефолтный промпт

Это позволяет тонко настраивать поведение агентов без изменения исходного кода.

### Формат JSONC (JSON с комментариями)

Плагин поддерживает формат **JSONC** для конфигурационных файлов, что позволяет:

- добавлять однострочные комментарии (`//`)
- добавлять многострочные комментарии (`/* */`)
- использовать trailing comma в массивах и объектах

**Приоритет файлов:**
1. `oh-my-opencode-slim.jsonc` (предпочтительно, если существует)
2. `oh-my-opencode-slim.json` (fallback)

**Пример конфигурации JSONC:**

```jsonc
{
  // Использовать пресет для разработки
  "preset": "dev",

  /* Описание пресетов - настройте модели агентов здесь */
  "presets": {
    "dev": {
      // Быстрые модели для коротких итераций
      "oracle": { "model": "google/gemini-3-flash" },
      "explorer": { "model": "google/gemini-3-flash" },
    },
  },

  "tmux": {
    "enabled": true,  // Включить для мониторинга
    "layout": "main-vertical",
  },
}
```

### Конфиг плагина (`oh-my-opencode-slim.json` или `oh-my-opencode-slim.jsonc`)

Установщик генерирует этот файл на основе ваших провайдеров. Вы можете вручную настроить его, комбинируя модели. Подробные опции смотрите в разделе [Пресеты](#пресеты).

#### Справочник опций

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| `preset` | string | - | Имя используемого пресета (например `"openai"`, `"antigravity"`) |
| `presets` | object | - | Именованные конфигурации пресетов с маппингом агентов |
| `presets.<name>.<agent>.model` | string | - | ID модели для агента (например `"google/claude-opus-4-5-thinking"`) |
| `presets.<name>.<agent>.temperature` | number | - | Значение температуры (0-2) для агента |
| `presets.<name>.<agent>.variant` | string | - | Вариант агента для усилия рассуждения (например `"low"`, `"medium"`, `"high"`) |
| `presets.<name>.<agent>.skills` | string[] | - | Массив имен навыков для агента (`"*"` - все, `"!item"` - исключить) |
| `presets.<name>.<agent>.mcps` | string[] | - | Массив имен MCP для агента (`"*"` - все, `"!item"` - исключить) |
| `tmux.enabled` | boolean | `false` | Включить создание tmux-pane для подагентов |
| `tmux.layout` | string | `"main-vertical"` | Layout-пресет: `main-vertical`, `main-horizontal`, `tiled`, `even-horizontal`, `even-vertical` |
| `tmux.main_pane_size` | number | `60` | Размер главной pane в процентах (20-80) |
| `disabled_mcps` | string[] | `[]` | ID MCP-серверов для глобального отключения (например `"websearch"`) |

> **Примечание:** конфигурацию агентов следует задавать внутри `presets`. Корневое поле `agents` устарело.
