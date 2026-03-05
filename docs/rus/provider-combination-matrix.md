# Матрица тестирования комбинаций провайдеров (от 2 до 6 активных)

Эта матрица покрывает 5 комбинаций среди 8 переключателей провайдеров в проекте:

- `openai`
- `anthropic`
- `github-copilot`
- `zai-coding-plan`
- `kimi-for-coding`
- `google` (Antigravity/Gemini)
- `chutes`
- бесплатный `opencode` (`useOpenCodeFreeModels`)

## Как это определено

Результаты сгенерированы напрямую из `generateLiteConfig` в `src/cli/providers.ts` с фиксированными детерминированными входными данными:

- `selectedOpenCodePrimaryModel = opencode/glm-4.7-free`
- `selectedOpenCodeSecondaryModel = opencode/gpt-5-nano`
- `selectedChutesPrimaryModel = chutes/kimi-k2.5`
- `selectedChutesSecondaryModel = chutes/minimax-m2.1`

Это соответствует форме выходного конфига, который записывает установщик, когда выбранные модели доступны.

## Сценарий S1 - 2 провайдера

Активные провайдеры: OpenAI + OpenCode Free

- Preset: `openai`
- Агенты:
  - `orchestrator`: `openai/gpt-5.3-codex`
  - `oracle`: `openai/gpt-5.3-codex` (`high`)
  - `designer`: `openai/gpt-5.1-codex-mini` (`medium`)
  - `explorer`: `opencode/gpt-5-nano`
  - `librarian`: `opencode/gpt-5-nano`
  - `fixer`: `opencode/gpt-5-nano`
- Цепочки fallback:
  - `orchestrator`: `openai/gpt-5.3-codex -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `oracle`: `openai/gpt-5.3-codex -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `designer`: `openai/gpt-5.1-codex-mini -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `explorer`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> opencode/big-pickle`
  - `librarian`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> opencode/big-pickle`
  - `fixer`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> opencode/big-pickle`

## Сценарий S2 - 3 провайдера

Активные провайдеры: OpenAI + Chutes + OpenCode Free

- Preset: `openai`
- Агенты:
  - `orchestrator`: `openai/gpt-5.3-codex`
  - `oracle`: `openai/gpt-5.3-codex` (`high`)
  - `designer`: `openai/gpt-5.1-codex-mini` (`medium`)
  - `explorer`: `opencode/gpt-5-nano`
  - `librarian`: `opencode/gpt-5-nano`
  - `fixer`: `opencode/gpt-5-nano`
- Цепочки fallback:
  - `orchestrator`: `openai/gpt-5.3-codex -> chutes/kimi-k2.5 -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `oracle`: `openai/gpt-5.3-codex -> chutes/kimi-k2.5 -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `designer`: `openai/gpt-5.1-codex-mini -> chutes/kimi-k2.5 -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `explorer`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> chutes/minimax-m2.1 -> opencode/big-pickle`
  - `librarian`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> chutes/minimax-m2.1 -> opencode/big-pickle`
  - `fixer`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> chutes/minimax-m2.1 -> opencode/big-pickle`

## Сценарий S3 - 4 провайдера

Активные провайдеры: OpenAI + Copilot + ZAI Plan + OpenCode Free

- Preset: `openai`
- Агенты:
  - `orchestrator`: `openai/gpt-5.3-codex`
  - `oracle`: `openai/gpt-5.3-codex` (`high`)
  - `designer`: `openai/gpt-5.1-codex-mini` (`medium`)
  - `explorer`: `opencode/gpt-5-nano`
  - `librarian`: `opencode/gpt-5-nano`
  - `fixer`: `opencode/gpt-5-nano`
- Цепочки fallback:
  - `orchestrator`: `openai/gpt-5.3-codex -> github-copilot/grok-code-fast-1 -> zai-coding-plan/glm-4.7 -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `oracle`: `openai/gpt-5.3-codex -> github-copilot/grok-code-fast-1 -> zai-coding-plan/glm-4.7 -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `designer`: `openai/gpt-5.1-codex-mini -> github-copilot/grok-code-fast-1 -> zai-coding-plan/glm-4.7 -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `explorer`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> github-copilot/grok-code-fast-1 -> zai-coding-plan/glm-4.7 -> opencode/big-pickle`
  - `librarian`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> github-copilot/grok-code-fast-1 -> zai-coding-plan/glm-4.7 -> opencode/big-pickle`
  - `fixer`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> github-copilot/grok-code-fast-1 -> zai-coding-plan/glm-4.7 -> opencode/big-pickle`

## Сценарий S4 - 5 провайдеров

Активные провайдеры: OpenAI + Gemini + Chutes + Copilot + OpenCode Free

- Preset: `antigravity-mixed-openai`
- Агенты:
  - `orchestrator`: `chutes/kimi-k2.5`
  - `oracle`: `google/antigravity-gemini-3.1-pro` (`high`)
  - `designer`: `chutes/kimi-k2.5` (`medium`)
  - `explorer`: `opencode/gpt-5-nano`
  - `librarian`: `opencode/gpt-5-nano`
  - `fixer`: `opencode/gpt-5-nano`
- Цепочки fallback:
  - `orchestrator`: `chutes/kimi-k2.5 -> openai/gpt-5.3-codex -> github-copilot/grok-code-fast-1 -> google/antigravity-gemini-3-flash -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `oracle`: `google/antigravity-gemini-3.1-pro -> openai/gpt-5.3-codex -> github-copilot/grok-code-fast-1 -> chutes/kimi-k2.5 -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `designer`: `chutes/kimi-k2.5 -> openai/gpt-5.1-codex-mini -> github-copilot/grok-code-fast-1 -> google/antigravity-gemini-3-flash -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `explorer`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> github-copilot/grok-code-fast-1 -> google/antigravity-gemini-3-flash -> chutes/minimax-m2.1 -> opencode/big-pickle`
  - `librarian`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> github-copilot/grok-code-fast-1 -> google/antigravity-gemini-3-flash -> chutes/minimax-m2.1 -> opencode/big-pickle`
  - `fixer`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> github-copilot/grok-code-fast-1 -> google/antigravity-gemini-3-flash -> chutes/minimax-m2.1 -> opencode/big-pickle`

## Сценарий S5 - 6 провайдеров

Активные провайдеры: OpenAI + Anthropic + Copilot + ZAI Plan + Chutes + OpenCode Free

- Preset: `openai`
- Агенты:
  - `orchestrator`: `openai/gpt-5.3-codex`
  - `oracle`: `openai/gpt-5.3-codex` (`high`)
  - `designer`: `openai/gpt-5.1-codex-mini` (`medium`)
  - `explorer`: `opencode/gpt-5-nano`
  - `librarian`: `opencode/gpt-5-nano`
  - `fixer`: `opencode/gpt-5-nano`
- Цепочки fallback:
  - `orchestrator`: `openai/gpt-5.3-codex -> anthropic/claude-opus-4-6 -> github-copilot/grok-code-fast-1 -> zai-coding-plan/glm-4.7 -> chutes/kimi-k2.5 -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `oracle`: `openai/gpt-5.3-codex -> anthropic/claude-opus-4-6 -> github-copilot/grok-code-fast-1 -> zai-coding-plan/glm-4.7 -> chutes/kimi-k2.5 -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `designer`: `openai/gpt-5.1-codex-mini -> anthropic/claude-sonnet-4-5 -> github-copilot/grok-code-fast-1 -> zai-coding-plan/glm-4.7 -> chutes/kimi-k2.5 -> opencode/glm-4.7-free -> opencode/big-pickle`
  - `explorer`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> anthropic/claude-haiku-4-5 -> github-copilot/grok-code-fast-1 -> zai-coding-plan/glm-4.7 -> chutes/minimax-m2.1 -> opencode/big-pickle`
  - `librarian`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> anthropic/claude-sonnet-4-5 -> github-copilot/grok-code-fast-1 -> zai-coding-plan/glm-4.7 -> chutes/minimax-m2.1 -> opencode/big-pickle`
  - `fixer`: `opencode/gpt-5-nano -> openai/gpt-5.1-codex-mini -> anthropic/claude-sonnet-4-5 -> github-copilot/grok-code-fast-1 -> zai-coding-plan/glm-4.7 -> chutes/minimax-m2.1 -> opencode/big-pickle`

## Повторный прогон динамического скоринга (новые композиции + 3 случайные)

Этот прогон валидирует `buildDynamicModelPlan` с `scoringEngineVersion` в трех режимах:

- `v1`
- `v2-shadow` (применяются результаты V1, сравнивается V2)
- `v2`

Точные утверждения зафиксированы в `src/cli/dynamic-model-selection-matrix.test.ts`.

### C1 (подобранный)

Активные провайдеры: OpenAI + Anthropic + Chutes + OpenCode Free

- V1 агенты: `oracle=openai/gpt-5.3-codex`, `orchestrator=openai/gpt-5.3-codex`, `fixer=openai/gpt-5.1-codex-mini`, `designer=chutes/kimi-k2.5`, `librarian=anthropic/claude-opus-4-6`, `explorer=anthropic/claude-haiku-4-5`
- V2 агенты: `oracle=openai/gpt-5.3-codex`, `orchestrator=openai/gpt-5.3-codex`, `fixer=openai/gpt-5.1-codex-mini`, `designer=anthropic/claude-opus-4-6`, `librarian=chutes/kimi-k2.5`, `explorer=anthropic/claude-haiku-4-5`

### C2 (подобранный)

Активные провайдеры: OpenAI + Copilot + ZAI Plan + Gemini + OpenCode Free

- V1 агенты: `oracle=google/antigravity-gemini-3.1-pro`, `orchestrator=openai/gpt-5.3-codex`, `fixer=openai/gpt-5.1-codex-mini`, `designer=google/antigravity-gemini-3.1-pro`, `librarian=zai-coding-plan/glm-4.7`, `explorer=github-copilot/grok-code-fast-1`
- V2 агенты: такие же, как V1 для этой композиции

### C3 (подобранный)

Активные провайдеры: Kimi + Gemini + Chutes + OpenCode Free

- V1 агенты: `oracle=google/antigravity-gemini-3.1-pro`, `orchestrator=google/antigravity-gemini-3.1-pro`, `fixer=chutes/minimax-m2.1`, `designer=kimi-for-coding/k2p5`, `librarian=google/antigravity-gemini-3.1-pro`, `explorer=google/antigravity-gemini-3-flash`
- V2 агенты: те же, кроме `fixer=chutes/kimi-k2.5`

### R1 (случайный)

Активные провайдеры: Anthropic + Copilot + OpenCode Free

- V1 агенты: `oracle=anthropic/claude-opus-4-6`, `orchestrator=github-copilot/grok-code-fast-1`, `fixer=github-copilot/grok-code-fast-1`, `designer=anthropic/claude-opus-4-6`, `librarian=github-copilot/grok-code-fast-1`, `explorer=anthropic/claude-haiku-4-5`
- V2 агенты: такие же, как V1 для этой композиции

### R2 (случайный)

Активные провайдеры: OpenAI + Kimi + ZAI Plan + Chutes + OpenCode Free

- V1 агенты: `oracle=openai/gpt-5.3-codex`, `orchestrator=openai/gpt-5.3-codex`, `fixer=chutes/minimax-m2.1`, `designer=zai-coding-plan/glm-4.7`, `librarian=kimi-for-coding/k2p5`, `explorer=chutes/minimax-m2.1`
- V2 агенты: `oracle=openai/gpt-5.3-codex`, `orchestrator=openai/gpt-5.3-codex`, `fixer=chutes/kimi-k2.5`, `designer=kimi-for-coding/k2p5`, `librarian=zai-coding-plan/glm-4.7`, `explorer=chutes/minimax-m2.1`

### R3 (случайный)

Активные провайдеры: Gemini + Anthropic + Chutes + OpenCode Free

- V1 агенты: `oracle=google/antigravity-gemini-3.1-pro`, `orchestrator=google/antigravity-gemini-3.1-pro`, `fixer=chutes/minimax-m2.1`, `designer=anthropic/claude-opus-4-6`, `librarian=google/antigravity-gemini-3.1-pro`, `explorer=google/antigravity-gemini-3-flash`
- V2 агенты: `oracle=google/antigravity-gemini-3.1-pro`, `orchestrator=google/antigravity-gemini-3.1-pro`, `fixer=anthropic/claude-opus-4-6`, `designer=chutes/kimi-k2.5`, `librarian=google/antigravity-gemini-3.1-pro`, `explorer=google/antigravity-gemini-3-flash`

## Примечания

- Эта матрица показывает детерминированный результат `generateLiteConfig` для выбранных комбинаций.
- Если при полной установке используется динамический планировщик (live-каталог моделей), сгенерированный пресет `dynamic` может отличаться в зависимости от найденных моделей и их возможностей.
