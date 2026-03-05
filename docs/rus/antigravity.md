# Руководство по настройке Antigravity

## Быстрый старт

1. Установите с поддержкой Antigravity:
   ```bash
   bunx oh-my-opencode-slim install --antigravity=yes
   ```

2. Пройдите аутентификацию:
   ```bash
   opencode auth login
   # Выберите провайдера "google"
   ```

3. Начните использовать:
   ```bash
   opencode
   ```

## Как это работает

Установщик автоматически:
- Добавляет плагин `opencode-antigravity-auth@latest`
- Настраивает провайдера Google со всеми моделями Antigravity и Gemini CLI
- Применяет пресеты маппинга агентов, ориентированные на Antigravity

## Доступные модели

### Модели Antigravity (через инфраструктуру Google)

1. **antigravity-gemini-3.1-pro**
   - Имя: Gemini 3.1 Pro (Antigravity)
   - Контекст: 1M токенов, вывод: 65K токенов
   - Варианты: уровни рассуждения low, high
   - Лучше всего подходит для: сложных рассуждений, высококачественных ответов

2. **antigravity-gemini-3-flash**
   - Имя: Gemini 3 Flash (Antigravity)
   - Контекст: 1M токенов, вывод: 65K токенов
   - Варианты: уровни рассуждения minimal, low, medium, high
   - Лучше всего подходит для: быстрых ответов, эффективных задач агентов

3. **antigravity-claude-sonnet-4-5**
   - Имя: Claude Sonnet 4.5 (Antigravity)
   - Контекст: 200K токенов, вывод: 64K токенов
   - Лучше всего подходит для: сбалансированной производительности

4. **antigravity-claude-sonnet-4-5-thinking**
   - Имя: Claude Sonnet 4.5 Thinking (Antigravity)
   - Контекст: 200K токенов, вывод: 64K токенов
   - Варианты: low (бюджет 8K), max (бюджет 32K)
   - Лучше всего подходит для: задач с глубокими рассуждениями

5. **antigravity-claude-opus-4-5-thinking**
   - Имя: Claude Opus 4.5 Thinking (Antigravity)
   - Контекст: 200K токенов, вывод: 64K токенов
   - Варианты: low (бюджет 8K), max (бюджет 32K)
   - Лучше всего подходит для: самых сложных задач рассуждения

### Модели Gemini CLI (резервный вариант)

6. **gemini-2.5-flash**
   - Имя: Gemini 2.5 Flash (Gemini CLI)
   - Контекст: 1M токенов, вывод: 65K токенов
   - Требуется: аутентификация Gemini CLI

7. **gemini-2.5-pro**
   - Имя: Gemini 2.5 Pro (Gemini CLI)
   - Контекст: 1M токенов, вывод: 65K токенов
   - Требуется: аутентификация Gemini CLI

8. **gemini-3-flash-preview**
   - Имя: Gemini 3 Flash Preview (Gemini CLI)
   - Контекст: 1M токенов, вывод: 65K токенов
   - Требуется: аутентификация Gemini CLI

9. **gemini-3.1-pro-preview**
   - Имя: Gemini 3.1 Pro Preview (Gemini CLI)
   - Контекст: 1M токенов, вывод: 65K токенов
   - Требуется: аутентификация Gemini CLI

## Конфигурация агентов

При установке с `--antigravity=yes` выбираемый пресет зависит от остальных провайдеров:

### antigravity-mixed-both (Kimi + OpenAI + Antigravity)
- **Orchestrator**: Kimi k2p5
- **Oracle**: модель OpenAI
- **Explorer/Librarian/Designer/Fixer**: Gemini 3 Flash (Antigravity)

### antigravity-mixed-kimi (Kimi + Antigravity)
- **Orchestrator**: Kimi k2p5
- **Oracle**: Gemini 3.1 Pro (Antigravity)
- **Explorer/Librarian/Designer/Fixer**: Gemini 3 Flash (Antigravity)

### antigravity-mixed-openai (OpenAI + Antigravity)
- **Orchestrator**: Gemini 3 Flash (Antigravity)
- **Oracle**: модель OpenAI
- **Explorer/Librarian/Designer/Fixer**: Gemini 3 Flash (Antigravity)

### antigravity (только Antigravity)
- **Orchestrator**: Gemini 3 Flash (Antigravity)
- **Oracle**: Gemini 3.1 Pro (Antigravity)
- **Explorer/Librarian/Designer/Fixer**: Gemini 3 Flash (Antigravity)

## Ручная конфигурация

Если предпочитаете настроить всё вручную, отредактируйте `~/.config/opencode/oh-my-opencode-slim.json` (или `.jsonc`) и добавьте пресет только с Antigravity:

```json
{
  "preset": "antigravity",
  "presets": {
    "antigravity": {
      "orchestrator": {
        "model": "google/antigravity-gemini-3-flash",
        "skills": ["*"],
        "mcps": ["websearch"]
      },
      "oracle": {
        "model": "google/antigravity-gemini-3.1-pro",
        "skills": [],
        "mcps": []
      },
      "explorer": {
        "model": "google/antigravity-gemini-3-flash",
        "variant": "low",
        "skills": [],
        "mcps": []
      },
      "librarian": {
        "model": "google/antigravity-gemini-3-flash",
        "variant": "low",
        "skills": [],
        "mcps": ["websearch", "context7", "grep_app"]
      },
      "designer": {
        "model": "google/antigravity-gemini-3-flash",
        "variant": "medium",
        "skills": ["agent-browser"],
        "mcps": []
      },
      "fixer": {
        "model": "google/antigravity-gemini-3-flash",
        "variant": "low",
        "skills": [],
        "mcps": []
      }
    }
  }
}
```

## Устранение неполадок

### Ошибка аутентификации
```bash
# Убедитесь, что сервис Antigravity запущен
# Проверьте статус сервиса
curl http://127.0.0.1:8317/health

# Пройдите аутентификацию заново
opencode auth login
```

### Модели недоступны
```bash
# Проверьте, что плагин установлен
cat ~/.config/opencode/opencode.json | grep antigravity

# Переустановите плагин
bunx oh-my-opencode-slim install --antigravity=yes --no-tui --kimi=no --openai=no --tmux=no --skills=no
```

### Выбрана неправильная модель
```bash
# Проверьте текущий пресет
echo $OH_MY_OPENCODE_SLIM_PRESET

# Смените пресет
export OH_MY_OPENCODE_SLIM_PRESET=antigravity
opencode
```

### Проблемы с подключением к сервису
```bash
# Проверьте, что сервис Antigravity запущен на правильном порту
lsof -i :8317

# Перезапустите сервис
# (Следуйте вашей процедуре перезапуска Antigravity/LLM-Mux)
# Или отредактируйте ~/.config/opencode/oh-my-opencode-slim.json (или .jsonc)
# Измените поле "preset" и перезапустите OpenCode
```

## Примечания

- **Условия использования**: использование Antigravity может нарушать ToS Google. Используйте на свой риск.
- **Производительность**: модели Antigravity обычно дают меньшую задержку, чем прямые API-вызовы
- **Резервный путь**: модели Gemini CLI требуют отдельной аутентификации, но работают как fallback
- **Кастомизация**: вы можете комбинировать любые модели между агентами, редактируя конфиг
