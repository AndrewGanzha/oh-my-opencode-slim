import * as readline from 'node:readline/promises';
import {
  addPluginToOpenCodeConfig,
  buildDynamicModelPlan,
  detectCurrentConfig,
  disableDefaultAgents,
  discoverModelCatalog,
  fetchExternalModelSignals,
  generateLiteConfig,
  getOpenCodePath,
  getOpenCodeVersion,
  isOpenCodeInstalled,
  writeLiteConfig,
} from './config-manager';
import { CUSTOM_SKILLS, installCustomSkill } from './custom-skills';
import { installSkill, RECOMMENDED_SKILLS } from './skills';
import type {
  BooleanArg,
  ConfigMergeResult,
  DetectedConfig,
  InstallArgs,
  InstallConfig,
  ManualAgentConfig,
} from './types';

// Colors
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const SYMBOLS = {
  check: `${GREEN}✓${RESET}`,
  cross: `${RED}✗${RESET}`,
  arrow: `${BLUE}→${RESET}`,
  bullet: `${DIM}•${RESET}`,
  info: `${BLUE}ℹ${RESET}`,
  warn: `${YELLOW}⚠${RESET}`,
  star: `${YELLOW}★${RESET}`,
};

function printHeader(isUpdate: boolean): void {
  console.log();
  console.log(
    `${BOLD}oh-my-opencode-slim ${isUpdate ? 'Update' : 'Install'}${RESET}`,
  );
  console.log('='.repeat(30));
  console.log();
}

function printStep(step: number, total: number, message: string): void {
  console.log(`${DIM}[${step}/${total}]${RESET} ${message}`);
}

function printSuccess(message: string): void {
  console.log(`${SYMBOLS.check} ${message}`);
}

function printError(message: string): void {
  console.log(`${SYMBOLS.cross} ${RED}${message}${RESET}`);
}

function printInfo(message: string): void {
  console.log(`${SYMBOLS.info} ${message}`);
}

function printWarning(message: string): void {
  console.log(`${SYMBOLS.warn} ${YELLOW}${message}${RESET}`);
}

function isSupportedProviderModel(modelId: string): boolean {
  return (
    modelId.startsWith('openai/') || modelId.startsWith('zai-coding-plan/')
  );
}

function normalizeInstallConfig(config: InstallConfig): {
  config: InstallConfig;
  hadUnsupported: boolean;
} {
  const hadUnsupported =
    config.hasKimi ||
    config.hasAnthropic === true ||
    config.hasCopilot === true ||
    config.hasAntigravity ||
    config.hasChutes === true ||
    config.useOpenCodeFreeModels === true;

  const normalizedManualConfigs = config.manualAgentConfigs
    ? Object.fromEntries(
        Object.entries(config.manualAgentConfigs).map(([agent, assignment]) => {
          const fallbackModel = config.hasOpenAI
            ? 'openai/gpt-5.1-codex-mini'
            : 'zai-coding-plan/glm-4.7';
          const safe = (candidate: string) =>
            isSupportedProviderModel(candidate) ? candidate : fallbackModel;

          return [
            agent,
            {
              primary: safe(assignment.primary),
              fallback1: safe(assignment.fallback1),
              fallback2: safe(assignment.fallback2),
              fallback3: safe(assignment.fallback3),
            },
          ];
        }),
      ) as InstallConfig['manualAgentConfigs']
    : undefined;

  return {
    hadUnsupported,
    config: {
      ...config,
      hasKimi: false,
      hasAnthropic: false,
      hasCopilot: false,
      hasAntigravity: false,
      hasChutes: false,
      hasOpencodeZen: false,
      useOpenCodeFreeModels: false,
      preferredOpenCodeModel: undefined,
      selectedOpenCodePrimaryModel: undefined,
      selectedOpenCodeSecondaryModel: undefined,
      availableOpenCodeFreeModels: undefined,
      selectedChutesPrimaryModel: undefined,
      selectedChutesSecondaryModel: undefined,
      availableChutesModels: undefined,
      manualAgentConfigs: normalizedManualConfigs,
    },
  };
}

async function checkOpenCodeInstalled(): Promise<{
  ok: boolean;
  version?: string;
  path?: string;
}> {
  const installed = await isOpenCodeInstalled();
  if (!installed) {
    printError('OpenCode is not installed on this system.');
    printInfo('Install it with:');
    console.log(
      `     ${BLUE}curl -fsSL https://opencode.ai/install | bash${RESET}`,
    );
    console.log();
    printInfo('Or if already installed, add it to your PATH:');
    console.log(`     ${BLUE}export PATH="$HOME/.local/bin:$PATH"${RESET}`);
    console.log(`     ${BLUE}export PATH="$HOME/.opencode/bin:$PATH"${RESET}`);
    return { ok: false };
  }
  const version = await getOpenCodeVersion();
  const path = getOpenCodePath();
  printSuccess(
    `OpenCode ${version ?? ''} detected${path ? ` (${DIM}${path}${RESET})` : ''}`,
  );
  return { ok: true, version: version ?? undefined, path: path ?? undefined };
}

function handleStepResult(
  result: ConfigMergeResult,
  successMsg: string,
): boolean {
  if (!result.success) {
    printError(`Failed: ${result.error}`);
    return false;
  }
  printSuccess(
    `${successMsg} ${SYMBOLS.arrow} ${DIM}${result.configPath}${RESET}`,
  );
  return true;
}

function formatConfigSummary(config: InstallConfig): string {
  const liteConfig = generateLiteConfig(config);
  const preset = (liteConfig.preset as string) || 'unknown';

  const lines: string[] = [];
  lines.push(`${BOLD}Configuration Summary${RESET}`);
  lines.push('');
  lines.push(`  ${BOLD}Preset:${RESET} ${BLUE}${preset}${RESET}`);
  lines.push(
    `  ${config.hasOpenAI ? SYMBOLS.check : `${DIM}○${RESET}`} OpenAI`,
  );
  lines.push(
    `  ${config.hasZaiPlan ? SYMBOLS.check : `${DIM}○${RESET}`} ZAI Coding Plan`,
  );
  lines.push(
    `  ${config.balanceProviderUsage ? SYMBOLS.check : `${DIM}○${RESET}`} Balanced provider spend`,
  );
  lines.push(
    `  ${config.hasTmux ? SYMBOLS.check : `${DIM}○${RESET}`} Tmux Integration`,
  );
  return lines.join('\n');
}

function printAgentModels(config: InstallConfig): void {
  const liteConfig = generateLiteConfig(config);
  const presetName = (liteConfig.preset as string) || 'unknown';
  const presets = liteConfig.presets as Record<string, unknown>;
  const agents = presets?.[presetName] as Record<
    string,
    { model: string; skills: string[] }
  >;

  if (!agents || Object.keys(agents).length === 0) return;

  console.log(
    `${BOLD}Agent Configuration (Preset: ${BLUE}${presetName}${RESET}):${RESET}`,
  );
  console.log();

  const maxAgentLen = Math.max(...Object.keys(agents).map((a) => a.length));

  for (const [agent, info] of Object.entries(agents)) {
    const padding = ' '.repeat(maxAgentLen - agent.length);
    const skillsStr =
      info.skills.length > 0
        ? ` ${DIM}[${info.skills.join(', ')}]${RESET}`
        : '';
    console.log(
      `  ${DIM}${agent}${RESET}${padding} ${SYMBOLS.arrow} ${BLUE}${info.model}${RESET}${skillsStr}`,
    );
  }
  console.log();
}

function argsToConfig(args: InstallArgs): InstallConfig {
  return {
    hasKimi: false,
    hasOpenAI: args.openai === 'yes',
    hasAnthropic: false,
    hasCopilot: false,
    hasZaiPlan: args.zaiPlan === 'yes',
    hasAntigravity: false,
    hasChutes: false,
    hasOpencodeZen: false,
    useOpenCodeFreeModels: false,
    preferredOpenCodeModel: undefined,
    artificialAnalysisApiKey: args.aaKey,
    openRouterApiKey: args.openrouterKey,
    balanceProviderUsage: args.balancedSpend === 'yes',
    hasTmux: args.tmux === 'yes',
    installSkills: args.skills === 'yes',
    installCustomSkills: args.skills === 'yes', // Install custom skills when skills=yes
    setupMode: 'quick', // Non-interactive mode defaults to quick setup
    dryRun: args.dryRun,
    modelsOnly: args.modelsOnly,
  };
}

import { getEnv } from '../utils';

async function askYesNo(
  rl: readline.Interface,
  prompt: string,
  defaultValue: BooleanArg = 'no',
): Promise<BooleanArg> {
  const hint = defaultValue === 'yes' ? '[Y/n]' : '[y/N]';
  const answer = (await rl.question(`${BLUE}${prompt}${RESET} ${hint}: `))
    .trim()
    .toLowerCase();

  if (answer === '') return defaultValue;
  if (answer === 'y' || answer === 'yes') return 'yes';
  if (answer === 'n' || answer === 'no') return 'no';
  return defaultValue;
}

async function askOptionalApiKey(
  rl: readline.Interface,
  prompt: string,
  fromEnv?: string,
): Promise<string | undefined> {
  const hint = fromEnv ? '[optional, Enter keeps env value]' : '[optional]';
  const answer = (
    await rl.question(`${BLUE}${prompt}${RESET} ${DIM}${hint}${RESET}: `)
  ).trim();

  if (!answer) return fromEnv;
  return answer;
}

async function askSetupMode(
  rl: readline.Interface,
): Promise<'quick' | 'manual'> {
  console.log(`${BOLD}Choose setup mode:${RESET}`);
  console.log(
    `  ${DIM}1.${RESET} Quick setup - you choose providers, we auto-pick models`,
  );
  console.log(
    `  ${DIM}2.${RESET} Manual setup - you choose providers and models per agent`,
  );
  console.log();

  const answer = (
    await rl.question(`${BLUE}Selection${RESET} ${DIM}[default: 1]${RESET}: `)
  )
    .trim()
    .toLowerCase();

  if (answer === '2' || answer === 'manual') return 'manual';
  return 'quick';
}

async function askModelByNumber(
  rl: readline.Interface,
  models: Array<{ model: string; name?: string }>,
  prompt: string,
  allowEmpty = false,
): Promise<string | undefined> {
  let showAll = false;

  while (true) {
    console.log(`${BOLD}${prompt}${RESET}`);
    console.log(`${DIM}Available models:${RESET}`);

    const modelsToShow = showAll ? models : models.slice(0, 5);
    const remainingCount = models.length - modelsToShow.length;

    for (const [index, model] of modelsToShow.entries()) {
      const displayIndex = showAll ? index + 1 : index + 1;
      const name = model.name ? ` ${DIM}(${model.name})${RESET}` : '';
      console.log(
        `  ${DIM}${displayIndex}.${RESET} ${BLUE}${model.model}${RESET}${name}`,
      );
    }

    if (!showAll && remainingCount > 0) {
      console.log(`${DIM}  ... and ${remainingCount} more${RESET}`);
      console.log(`${DIM}  (type "all" to show the full list)${RESET}`);
    }
    console.log(`${DIM}  (or type any model ID directly)${RESET}`);
    console.log();

    const answer = (await rl.question(`${BLUE}Selection${RESET}: `))
      .trim()
      .toLowerCase();

    if (!answer) {
      if (allowEmpty) return undefined;
      return models[0]?.model;
    }

    if (answer === 'all') {
      showAll = true;
      console.log();
      continue;
    }

    const asNumber = Number.parseInt(answer, 10);
    if (
      Number.isFinite(asNumber) &&
      asNumber >= 1 &&
      asNumber <= models.length
    ) {
      return models[asNumber - 1]?.model;
    }

    const byId = models.find((m) => m.model.toLowerCase() === answer);
    if (byId) return byId.model;

    printWarning(
      `Invalid selection: "${answer}". Using first available model.`,
    );
    return models[0]?.model;
  }
}

async function configureAgentManually(
  rl: readline.Interface,
  agentName: string,
  allModels: Array<{ model: string; name?: string }>,
): Promise<ManualAgentConfig> {
  console.log();
  console.log(`${BOLD}Configure ${agentName}:${RESET}`);
  console.log();

  // Keep track of selected models to exclude them from subsequent choices
  const selectedModels = new Set<string>();

  // Primary model selection - show all models
  const primary =
    (await askModelByNumber(rl, allModels, 'Primary model')) ??
    allModels[0]?.model ??
    'openai/gpt-5.1-codex-mini';
  selectedModels.add(primary);

  // Filter out selected models for subsequent choices
  const availableForFallback1 = allModels.filter(
    (m) => !selectedModels.has(m.model),
  );

  const fallback1 =
    availableForFallback1.length > 0
      ? ((await askModelByNumber(
          rl,
          availableForFallback1,
          'Fallback 1 (optional, press Enter to skip)',
          true,
        )) ?? primary)
      : primary;
  if (fallback1 !== primary) selectedModels.add(fallback1);

  // Filter again for fallback 2
  const availableForFallback2 = allModels.filter(
    (m) => !selectedModels.has(m.model),
  );

  const fallback2 =
    availableForFallback2.length > 0
      ? ((await askModelByNumber(
          rl,
          availableForFallback2,
          'Fallback 2 (optional, press Enter to skip)',
          true,
        )) ?? fallback1)
      : fallback1;
  if (fallback2 !== fallback1) selectedModels.add(fallback2);

  // Filter again for fallback 3
  const availableForFallback3 = allModels.filter(
    (m) => !selectedModels.has(m.model),
  );

  const fallback3 =
    availableForFallback3.length > 0
      ? ((await askModelByNumber(
          rl,
          availableForFallback3,
          'Fallback 3 (optional, press Enter to skip)',
          true,
        )) ?? fallback2)
      : fallback2;

  return {
    primary,
    fallback1,
    fallback2,
    fallback3,
  };
}

async function runManualSetupMode(
  rl: readline.Interface,
  detected: DetectedConfig,
  modelsOnly = false,
): Promise<InstallConfig> {
  console.log();
  console.log(`${BOLD}Manual Setup Mode${RESET}`);
  console.log('='.repeat(20));
  console.log();

  const existingAaKey = getEnv('ARTIFICIAL_ANALYSIS_API_KEY');
  const existingOpenRouterKey = getEnv('OPENROUTER_API_KEY');

  const artificialAnalysisApiKey = await askOptionalApiKey(
    rl,
    'Artificial Analysis API key for better ranking signals',
    existingAaKey,
  );
  if (existingAaKey && !artificialAnalysisApiKey) {
    printInfo('Using existing ARTIFICIAL_ANALYSIS_API_KEY from environment.');
  }
  console.log();

  const openRouterApiKey = await askOptionalApiKey(
    rl,
    'OpenRouter API key for pricing/metadata signals',
    existingOpenRouterKey,
  );
  if (existingOpenRouterKey && !openRouterApiKey) {
    printInfo('Using existing OPENROUTER_API_KEY from environment.');
  }
  console.log();

  let openai: BooleanArg = 'no';
  let zaiPlan: BooleanArg = 'no';

  while (openai === 'no' && zaiPlan === 'no') {
    openai = await askYesNo(
      rl,
      'Enable OpenAI (ChatGPT) provider?',
      detected.hasOpenAI ? 'yes' : 'no',
    );
    console.log();

    zaiPlan = await askYesNo(
      rl,
      'Enable ZAI Coding Plan provider?',
      detected.hasZaiPlan ? 'yes' : 'no',
    );
    console.log();

    if (openai === 'no' && zaiPlan === 'no') {
      printWarning('Enable at least one provider: OpenAI or ZAI Coding Plan.');
      console.log();
    }
  }

  const availableModels: Array<{ model: string; name?: string }> = [];

  if (openai === 'yes') {
    availableModels.push({
      model: 'openai/gpt-5.3-codex',
      name: 'GPT-5.3 Codex',
    });
    availableModels.push({
      model: 'openai/gpt-5.1-codex-mini',
      name: 'GPT-5.1 Codex Mini',
    });
  }

  if (zaiPlan === 'yes') {
    availableModels.push({ model: 'zai-coding-plan/glm-4.7', name: 'GLM 4.7' });
  }

  // Configure each agent manually
  const manualAgentConfigs: Record<string, ManualAgentConfig> = {};
  const agentNames = [
    'orchestrator',
    'oracle',
    'designer',
    'explorer',
    'librarian',
    'fixer',
  ];

  for (const agentName of agentNames) {
    manualAgentConfigs[agentName] = await configureAgentManually(
      rl,
      agentName,
      availableModels,
    );
  }

  // Ask for remaining options
  const balancedSpend = await askYesNo(
    rl,
    'Do you have subscriptions or pay per API? If yes, we will distribute assignments evenly across selected providers so your subscriptions last longer.',
    'no',
  );
  console.log();

  let skills: BooleanArg = 'no';
  let customSkills: BooleanArg = 'no';
  if (!modelsOnly) {
    // Skills prompt
    console.log(`${BOLD}Recommended Skills:${RESET}`);
    for (const skill of RECOMMENDED_SKILLS) {
      console.log(
        `  ${SYMBOLS.bullet} ${BOLD}${skill.name}${RESET}: ${skill.description}`,
      );
    }
    console.log();
    skills = await askYesNo(rl, 'Install recommended skills?', 'yes');
    console.log();

    // Custom skills prompt
    console.log(`${BOLD}Custom Skills:${RESET}`);
    for (const skill of CUSTOM_SKILLS) {
      console.log(
        `  ${SYMBOLS.bullet} ${BOLD}${skill.name}${RESET}: ${skill.description}`,
      );
    }
    console.log();
    customSkills = await askYesNo(rl, 'Install custom skills?', 'yes');
    console.log();
  } else {
    printInfo(
      'Models-only mode: skipping plugin/auth setup and skills prompts.',
    );
    console.log();
  }

  return {
    hasKimi: false,
    hasOpenAI: openai === 'yes',
    hasAnthropic: false,
    hasCopilot: false,
    hasZaiPlan: zaiPlan === 'yes',
    hasAntigravity: false,
    hasChutes: false,
    hasOpencodeZen: false,
    useOpenCodeFreeModels: false,
    artificialAnalysisApiKey,
    openRouterApiKey,
    balanceProviderUsage: balancedSpend === 'yes',
    hasTmux: false,
    installSkills: skills === 'yes',
    installCustomSkills: customSkills === 'yes',
    setupMode: 'manual',
    manualAgentConfigs,
    modelsOnly,
  };
}

async function runInteractiveMode(
  detected: DetectedConfig,
  modelsOnly = false,
): Promise<InstallConfig> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Ask for setup mode first
    console.log();
    console.log(`${BOLD}oh-my-opencode-slim Setup${RESET}`);
    console.log('='.repeat(25));
    console.log();

    const setupMode = await askSetupMode(rl);

    if (setupMode === 'manual') {
      const config = await runManualSetupMode(rl, detected, modelsOnly);
      rl.close();
      return config;
    }

    // Continue with quick setup mode
    // TODO: tmux has a bug, disabled for now
    // const tmuxInstalled = await isTmuxInstalled()
    // const totalQuestions = tmuxInstalled ? 3 : 2
    const totalQuestions = 5;

    const existingAaKey = getEnv('ARTIFICIAL_ANALYSIS_API_KEY');
    const existingOpenRouterKey = getEnv('OPENROUTER_API_KEY');

    console.log(`${BOLD}Question 1/${totalQuestions}:${RESET}`);
    const artificialAnalysisApiKey = await askOptionalApiKey(
      rl,
      'Artificial Analysis API key for better ranking signals',
      existingAaKey,
    );
    if (existingAaKey && !artificialAnalysisApiKey) {
      printInfo('Using existing ARTIFICIAL_ANALYSIS_API_KEY from environment.');
    }
    console.log();

    console.log(`${BOLD}Question 2/${totalQuestions}:${RESET}`);
    const openRouterApiKey = await askOptionalApiKey(
      rl,
      'OpenRouter API key for pricing/metadata signals',
      existingOpenRouterKey,
    );
    if (existingOpenRouterKey && !openRouterApiKey) {
      printInfo('Using existing OPENROUTER_API_KEY from environment.');
    }
    console.log();

    console.log(`${BOLD}Question 3/${totalQuestions}:${RESET}`);
    const openai = await askYesNo(
      rl,
      'Enable OpenAI (ChatGPT) provider?',
      detected.hasOpenAI ? 'yes' : 'no',
    );
    console.log();

    console.log(`${BOLD}Question 4/${totalQuestions}:${RESET}`);
    const zaiPlan = await askYesNo(
      rl,
      'Enable ZAI Coding Plan provider?',
      detected.hasZaiPlan ? 'yes' : 'no',
    );
    console.log();

    if (openai === 'no' && zaiPlan === 'no') {
      printWarning('No provider selected. Enabling ZAI Coding Plan by default.');
      console.log();
    }

    console.log(`${BOLD}Question 5/${totalQuestions}:${RESET}`);
    const balancedSpend = await askYesNo(
      rl,
      'Do you have subscriptions or pay per API? If yes, we will distribute assignments evenly across selected providers so your subscriptions last longer.',
      'no',
    );
    console.log();

    // TODO: tmux has a bug, disabled for now
    // let tmux: BooleanArg = "no"
    // if (tmuxInstalled) {
    //   console.log(`${BOLD}Question 3/3:${RESET}`)
    //   printInfo(`${BOLD}Tmux detected!${RESET} We can enable tmux integration for you.`)
    //   printInfo("This will spawn new panes for sub-agents, letting you watch them work in real-time.")
    //   tmux = await askYesNo(rl, "Enable tmux integration?", detected.hasTmux ? "yes" : "no")
    //   console.log()
    // }

    let skills: BooleanArg = 'no';
    let customSkills: BooleanArg = 'no';
    if (!modelsOnly) {
      // Skills prompt
      console.log(`${BOLD}Recommended Skills:${RESET}`);
      for (const skill of RECOMMENDED_SKILLS) {
        console.log(
          `  ${SYMBOLS.bullet} ${BOLD}${skill.name}${RESET}: ${skill.description}`,
        );
      }
      console.log();
      skills = await askYesNo(rl, 'Install recommended skills?', 'yes');
      console.log();

      // Custom skills prompt
      console.log(`${BOLD}Custom Skills:${RESET}`);
      for (const skill of CUSTOM_SKILLS) {
        console.log(
          `  ${SYMBOLS.bullet} ${BOLD}${skill.name}${RESET}: ${skill.description}`,
        );
      }
      console.log();
      customSkills = await askYesNo(rl, 'Install custom skills?', 'yes');
      console.log();
    } else {
      printInfo(
        'Models-only mode: skipping plugin/auth setup and skills prompts.',
      );
      console.log();
    }

    return {
      hasKimi: false,
      hasOpenAI: openai === 'yes',
      hasAnthropic: false,
      hasCopilot: false,
      hasZaiPlan: zaiPlan === 'yes' || openai === 'no',
      hasAntigravity: false,
      hasChutes: false,
      hasOpencodeZen: false,
      useOpenCodeFreeModels: false,
      artificialAnalysisApiKey,
      openRouterApiKey,
      balanceProviderUsage: balancedSpend === 'yes',
      hasTmux: false,
      installSkills: skills === 'yes',
      installCustomSkills: customSkills === 'yes',
      setupMode: 'quick',
      modelsOnly,
    };
  } finally {
    rl.close();
  }
}

async function runInstall(config: InstallConfig): Promise<number> {
  const { config: normalizedConfig, hadUnsupported } =
    normalizeInstallConfig(config);
  const resolvedConfig: InstallConfig = {
    ...normalizedConfig,
  };

  const detected = detectCurrentConfig();
  const isUpdate = detected.isInstalled;

  printHeader(isUpdate);

  if (hadUnsupported) {
    printWarning(
      'Only OpenAI (ChatGPT) and ZAI Coding Plan integrations are supported. Other providers were ignored.',
    );
    console.log();
  }

  if (!resolvedConfig.hasOpenAI && !resolvedConfig.hasZaiPlan) {
    printError('Enable at least one provider: OpenAI or ZAI Coding Plan.');
    return 1;
  }

  const hasAnyEnabledProvider =
    resolvedConfig.hasOpenAI || resolvedConfig.hasZaiPlan;

  const modelsOnly = resolvedConfig.modelsOnly === true;

  // Calculate total steps dynamically
  let totalSteps = modelsOnly ? 2 : 4; // Models-only: check + write
  if (hasAnyEnabledProvider) totalSteps += 1; // dynamic model resolution
  if (!modelsOnly && resolvedConfig.installSkills) totalSteps += 1; // skills installation
  if (!modelsOnly && resolvedConfig.installCustomSkills) totalSteps += 1; // custom skills installation

  let step = 1;

  if (modelsOnly) {
    printInfo(
      'Models-only mode: updating model assignments without reinstalling plugins/skills.',
    );
  }

  printStep(step++, totalSteps, 'Checking OpenCode installation...');
  if (resolvedConfig.dryRun) {
    printInfo('Dry run mode - skipping OpenCode check');
  } else {
    const { ok } = await checkOpenCodeInstalled();
    if (!ok) return 1;
  }

  if (!modelsOnly) {
    printStep(step++, totalSteps, 'Adding oh-my-opencode-slim plugin...');
    if (resolvedConfig.dryRun) {
      printInfo('Dry run mode - skipping plugin installation');
    } else {
      const pluginResult = await addPluginToOpenCodeConfig();
      if (!handleStepResult(pluginResult, 'Plugin added')) return 1;
    }
  }

  if (hasAnyEnabledProvider) {
    printStep(step++, totalSteps, 'Resolving dynamic model assignments...');
    const catalogDiscovery = await discoverModelCatalog();
    if (catalogDiscovery.models.length === 0) {
      printWarning(
        catalogDiscovery.error ??
          'Unable to discover model catalog. Falling back to static mappings.',
      );
    } else {
      const { signals, warnings } = await fetchExternalModelSignals({
        artificialAnalysisApiKey: resolvedConfig.artificialAnalysisApiKey,
        openRouterApiKey: resolvedConfig.openRouterApiKey,
      });
      for (const warning of warnings) {
        printInfo(warning);
      }

      const dynamicPlan = buildDynamicModelPlan(
        catalogDiscovery.models,
        resolvedConfig,
        signals,
      );
      if (!dynamicPlan) {
        printWarning(
          'Dynamic planner found no suitable models. Using static mappings.',
        );
      } else {
        resolvedConfig.dynamicModelPlan = dynamicPlan;
        printSuccess(
          `Dynamic assignments ready (${Object.keys(dynamicPlan.agents).length} agents)`,
        );
      }
    }
  }

  if (!modelsOnly) {
    printStep(step++, totalSteps, 'Disabling OpenCode default agents...');
    if (resolvedConfig.dryRun) {
      printInfo('Dry run mode - skipping agent disabling');
    } else {
      const agentResult = disableDefaultAgents();
      if (!handleStepResult(agentResult, 'Default agents disabled')) return 1;
    }
  }

  printStep(step++, totalSteps, 'Writing oh-my-opencode-slim configuration...');
  if (resolvedConfig.dryRun) {
    const liteConfig = generateLiteConfig(resolvedConfig);
    printInfo('Dry run mode - configuration that would be written:');
    console.log(`\n${JSON.stringify(liteConfig, null, 2)}\n`);
  } else {
    const liteResult = writeLiteConfig(resolvedConfig);
    if (!handleStepResult(liteResult, 'Config written')) return 1;
  }

  // Install skills if requested
  if (!modelsOnly && resolvedConfig.installSkills) {
    printStep(step++, totalSteps, 'Installing recommended skills...');
    if (resolvedConfig.dryRun) {
      printInfo('Dry run mode - would install skills:');
      for (const skill of RECOMMENDED_SKILLS) {
        printInfo(`  - ${skill.name}`);
      }
    } else {
      let skillsInstalled = 0;
      for (const skill of RECOMMENDED_SKILLS) {
        printInfo(`Installing ${skill.name}...`);
        if (installSkill(skill)) {
          printSuccess(`Installed: ${skill.name}`);
          skillsInstalled++;
        } else {
          printWarning(`Failed to install: ${skill.name}`);
        }
      }
      printSuccess(
        `${skillsInstalled}/${RECOMMENDED_SKILLS.length} skills installed`,
      );
    }
  }

  // Install custom skills if requested
  if (!modelsOnly && resolvedConfig.installCustomSkills) {
    printStep(step++, totalSteps, 'Installing custom skills...');
    if (resolvedConfig.dryRun) {
      printInfo('Dry run mode - would install custom skills:');
      for (const skill of CUSTOM_SKILLS) {
        printInfo(`  - ${skill.name}`);
      }
    } else {
      let customSkillsInstalled = 0;
      for (const skill of CUSTOM_SKILLS) {
        printInfo(`Installing ${skill.name}...`);
        if (installCustomSkill(skill)) {
          printSuccess(`Installed: ${skill.name}`);
          customSkillsInstalled++;
        } else {
          printWarning(`Failed to install: ${skill.name}`);
        }
      }
      printSuccess(
        `${customSkillsInstalled}/${CUSTOM_SKILLS.length} custom skills installed`,
      );
    }
  }

  // Summary
  console.log();
  console.log(formatConfigSummary(resolvedConfig));
  console.log();

  printAgentModels(resolvedConfig);

  console.log(
    `${SYMBOLS.star} ${BOLD}${GREEN}${isUpdate ? 'Configuration updated!' : 'Installation complete!'}${RESET}`,
  );
  console.log();
  console.log(`${BOLD}Next steps:${RESET}`);
  console.log();

  let nextStep = 1;

  if (resolvedConfig.hasOpenAI || resolvedConfig.hasZaiPlan) {
    console.log(`  ${nextStep++}. Authenticate with your providers:`);
    console.log(`     ${BLUE}$ opencode auth login${RESET}`);
    if (resolvedConfig.hasOpenAI) {
      console.log();
      console.log(`     Then select ${BOLD}openai${RESET} provider.`);
    }
    if (resolvedConfig.hasZaiPlan) {
      console.log();
      console.log(`     Then select ${BOLD}zai-coding-plan${RESET} provider.`);
    }
    console.log();
  }

  // TODO: tmux has a bug, disabled for now
  // if (config.hasTmux) {
  //   console.log(`  ${nextStep++}. Run OpenCode inside tmux:`)
  //   console.log(`     ${BLUE}$ tmux${RESET}`)
  //   console.log(`     ${BLUE}$ opencode${RESET}`)
  // } else {
  console.log(`  ${nextStep++}. Start OpenCode:`);
  console.log(`     ${BLUE}$ opencode${RESET}`);
  // }
  console.log();

  return 0;
}

export async function install(args: InstallArgs): Promise<number> {
  // Non-interactive mode: all args must be provided
  if (!args.tui) {
    const requiredArgs = ['openai', 'zaiPlan', 'tmux'] as const;
    const errors = requiredArgs.filter((key) => {
      const value = args[key];
      return value === undefined || !['yes', 'no'].includes(value);
    });

    if (errors.length > 0) {
      printHeader(false);
      printError('Missing or invalid arguments:');
      for (const key of errors) {
        const flagName = key === 'zaiPlan' ? 'zai-plan' : key;
        console.log(`  ${SYMBOLS.bullet} --${flagName}=<yes|no>`);
      }
      console.log();
      printInfo(
        'Usage: bunx oh-my-opencode-slim install --no-tui --openai=<yes|no> --zai-plan=<yes|no> --balanced-spend=<yes|no> --tmux=<yes|no>',
      );
      console.log();
      return 1;
    }

    const nonInteractiveConfig = argsToConfig(args);
    return runInstall(nonInteractiveConfig);
  }

  // Interactive mode
  const detected = detectCurrentConfig();

  printHeader(detected.isInstalled);

  printStep(1, 1, 'Checking OpenCode installation...');
  if (args.dryRun) {
    printInfo('Dry run mode - skipping OpenCode check');
  } else {
    const { ok } = await checkOpenCodeInstalled();
    if (!ok) return 1;
  }
  console.log();

  const config = await runInteractiveMode(detected, args.modelsOnly === true);
  // Pass dryRun through to the config
  config.dryRun = args.dryRun;
  config.modelsOnly = args.modelsOnly;
  return runInstall(config);
}
