#!/usr/bin/env node

/**
 * OmniLearn Workflow Installer
 *
 * Installs OmniLearn commands into OpenCode's command directory
 * so they're available as global /omnilearn-* commands.
 *
 * GitHub: https://github.com/BlackPool25/OmniLearn
 *
 * Usage:
 *   npx omnilearn-workflow              Interactive install
 *   npx omnilearn-workflow --help       Show help
 *   npx omnilearn-workflow --yes        Auto-install with defaults
 *   npx omnilearn-workflow --version    Show version
 *   npx omnilearn-workflow --check      Verify install health
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import {
  intro,
  outro,
  text,
  select,
  confirm,
  spinner as createSpinner,
  isCancel,
  cancel,
  log,
} from '@clack/prompts';
import pc from 'picocolors';
import boxen from 'boxen';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PKG_DIR = path.resolve(__dirname, '..');
const COMMANDS_DIR = path.join(PKG_DIR, 'commands');
const OPENCODE_CONFIG_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.config',
  'opencode',
);
const OPENCODE_COMMAND_DIR = path.join(OPENCODE_CONFIG_DIR, 'command');
const OPENCODE_CONFIG_PATH = path.join(OPENCODE_CONFIG_DIR, 'opencode.json');
const OPENCODE_CONFIGC_PATH = path.join(OPENCODE_CONFIG_DIR, 'opencode.jsonc');
const OMNILEARN_CONFIG_PATH = path.join(OPENCODE_CONFIG_DIR, 'omnilearn.json');

const COMMANDS = [
  'omnilearn-init.md',
  'omnilearn-roadmap.md',
  'omnilearn-roadmap-edit.md',
  'omnilearn-start.md',
  'omnilearn-refine.md',
];

const PKG_VERSION = '1.0.15';

// ─── Utilities ───

function printVersion() {
  console.log(`omnilearn-workflow v${PKG_VERSION}`);
  process.exit(0);
}

function printHelp() {
  const help = boxen(
    [
      `${pc.bold('Usage:')}`,
      `  npx omnilearn-workflow           ${pc.dim('Interactive install')}`,
      `  npx omnilearn-workflow --yes     ${pc.dim('Auto-install with defaults')}`,
      `  npx omnilearn-workflow --help    ${pc.dim('Show this help')}`,
      `  npx omnilearn-workflow --version ${pc.dim('Show version')}`,
      `  npx omnilearn-workflow --check   ${pc.dim('Verify install health')}`,
      '',
      `${pc.bold('What this does:')}`,
      `  1. Checks OpenCode is installed (offers to install if missing)`,
      `  2. Copies 5 command files to ~/.config/opencode/command/`,
      `  3. Makes them available as ${pc.cyan('/omnilearn-*')} commands in OpenCode`,
      `  4. Configures Context7 MCP for documentation lookups`,
      `  5. Checks for oh-my-openagent (multi-agent orchestration)`,
      `  6. Optionally configures your learning directory right away`,
      '',
      `${pc.bold('After install:')}`,
      `  Open OpenCode and run:`,
      `    ${pc.cyan('/omnilearn-init')}    ${pc.dim('— Set up your learning directory')}`,
      `    ${pc.cyan('/omnilearn-roadmap')} ${pc.dim('— Create your first roadmap')}`,
    ].join('\n'),
    {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
    },
  );
  console.log(help);
  process.exit(0);
}

function isOpenCodeInstalled() {
  if (fs.existsSync(OPENCODE_COMMAND_DIR)) return true;
  try {
    execSync('which opencode 2>/dev/null', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function isBunAvailable() {
  try {
    execSync('which bun 2>/dev/null', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function readOpenCodeConfig() {
  const configPath = fs.existsSync(OPENCODE_CONFIG_PATH)
    ? OPENCODE_CONFIG_PATH
    : fs.existsSync(OPENCODE_CONFIGC_PATH)
      ? OPENCODE_CONFIGC_PATH
      : null;
  if (!configPath) return { path: null, data: null };
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return { path: configPath, data: JSON.parse(raw) };
  } catch {
    return { path: configPath, data: null };
  }
}

function writeOpenCodeConfig(configPath, data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2) + '\n');
}

function isContext7Configured(config) {
  if (!config?.mcp) return false;
  // Check all keys — Context7 could be named "context7", "ctx7", etc.
  return Object.keys(config.mcp).some(
    (key) =>
      key.toLowerCase().includes('context7') ||
      key.toLowerCase().includes('ctx7'),
  );
}

function isOhMyOpenAgentInstalled(config) {
  if (!config?.plugin) return false;
  return config.plugin.some(
    (p) =>
      p.toLowerCase().includes('oh-my-openagent') ||
      p.toLowerCase().includes('oh-my-opencode'),
  );
}

function isOmniLearnConfigured() {
  return fs.existsSync(OMNILEARN_CONFIG_PATH);
}

function readOmniLearnConfig() {
  try {
    const raw = fs.readFileSync(OMNILEARN_CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isBunInstalled() {
  try {
    execSync('which bun 2>/dev/null', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// ─── Steps ───

async function installOpenCode() {
  log.info('OpenCode is required. Installing now...');
  const s = createSpinner();
  s.start('Downloading OpenCode...');
  try {
    execSync('curl -fsSL https://opencode.ai/install | bash', {
      stdio: 'pipe',
      timeout: 120000,
    });
    s.stop('OpenCode installed successfully');
    return true;
  } catch (err) {
    s.stop('OpenCode install failed');
    log.error(`Could not install OpenCode automatically: ${err.message}`);
    log.info('Install manually:');
    log.info(`  ${pc.cyan('curl -fsSL https://opencode.ai/install | bash')}`);
    return false;
  }
}

async function copyCommandFiles(forceOverwrite) {
  const s = createSpinner();

  if (!fs.existsSync(OPENCODE_COMMAND_DIR)) {
    fs.mkdirSync(OPENCODE_COMMAND_DIR, { recursive: true });
  }

  let existing = [];
  try {
    existing = fs.readdirSync(OPENCODE_COMMAND_DIR)
      .filter((f) => f.startsWith('omnilearn-') && f.endsWith('.md'));
  } catch {
    existing = [];
  }

  if (existing.length > 0 && !forceOverwrite) {
    log.info(
      `Found ${existing.length} existing OmniLearn command(s): ${existing.join(', ')}`,
    );
    const shouldOverwrite = await confirm({
      message: 'Overwrite existing commands?',
      initialValue: true,
    });
    if (isCancel(shouldOverwrite)) {
      cancel('Installation cancelled');
      process.exit(0);
    }
    if (!shouldOverwrite) {
      log.info('Existing commands preserved. Skipping command install.');
      return 0;
    }
  }

  if (forceOverwrite) {
    // Remove existing before re-copy
    for (const cmd of COMMANDS) {
      const dest = path.join(OPENCODE_COMMAND_DIR, cmd);
      try { fs.unlinkSync(dest); } catch {}
    }
  }

  s.start('Installing command files...');

  let copied = 0;
  let failed = 0;

  for (const cmd of COMMANDS) {
    const src = path.join(COMMANDS_DIR, cmd);
    const dest = path.join(OPENCODE_COMMAND_DIR, cmd);

    if (!fs.existsSync(src)) {
      log.warn(`Source not found in package: ${cmd}`);
      failed++;
      continue;
    }

    try {
      fs.copyFileSync(src, dest);
      fs.chmodSync(dest, 0o644);
      copied++;
    } catch (err) {
      log.error(`Failed to install ${cmd}: ${err.message}`);
      failed++;
    }
  }

  s.stop(
    `Installed ${copied}/${COMMANDS.length} command(s)${failed > 0 ? ` (${failed} failed)` : ''}`,
  );

  // Verify after copy
  const afterCopy = COMMANDS.filter((cmd) =>
    fs.existsSync(path.join(OPENCODE_COMMAND_DIR, cmd)),
  ).length;
  if (afterCopy === COMMANDS.length) {
    log.success(`All ${COMMANDS.length} commands verified at ${pc.cyan(OPENCODE_COMMAND_DIR)}`);
  } else {
    log.warn(
      `Only ${afterCopy}/${COMMANDS.length} commands found after install. Try running with --yes to force reinstall.`,
    );
  }

  return copied;
}

async function setupContext7MCP(configInfo) {
  const { path: configPath, data: config } = configInfo;

  if (!configPath || !config) {
    log.warn('OpenCode config file not found — cannot auto-configure Context7 MCP.');
    log.info('You can set it up later by running:');
    log.info(`  ${pc.cyan('npx ctx7 setup --opencode')}`);
    return false;
  }

  if (isContext7Configured(config)) {
    // Find and show the context7 key name
    const ctxKey = Object.keys(config.mcp).find(
      (k) =>
        k.toLowerCase().includes('context7') || k.toLowerCase().includes('ctx7'),
    );
    log.success(`Context7 MCP already configured as "${pc.cyan(ctxKey)}"`);
    return true;
  }

  const shouldSetup = await confirm({
    message:
      'Context7 MCP not configured. OmniLearn uses it for documentation lookups. Set it up now?',
    initialValue: true,
  });
  if (isCancel(shouldSetup)) {
    cancel('Installation cancelled');
    process.exit(0);
  }
  if (!shouldSetup) {
    log.info('Skipping Context7 setup. You can configure it later by running:');
    log.info(`  ${pc.cyan('npx ctx7 setup --opencode')}`);
    return false;
  }

  // Try the official setup command first
  const s = createSpinner();
  s.start('Running Context7 setup...');
  try {
    execSync('npx ctx7 setup --opencode 2>/dev/null', {
      stdio: 'pipe',
      timeout: 30000,
    });
    s.stop('Context7 MCP configured via ctx7 CLI');
    log.success('Context7 documentation MCP is now enabled in OpenCode');
    return true;
  } catch {
    // Fall back to manual config
    s.stop('Automatic setup unavailable — configuring manually');
  }

  // Manual config: add context7 to opencode.json
  if (!config.mcp) config.mcp = {};

  config.mcp.context7 = {
    type: 'local',
    command: ['npx', '-y', '@upstash/context7-mcp@latest'],
    enabled: true,
  };

  const ws = createSpinner();
  ws.start('Writing Context7 configuration...');
  try {
    writeOpenCodeConfig(configPath, config);
    ws.stop('Context7 MCP added to OpenCode configuration');
    log.success(
      `Added to ${pc.cyan(path.basename(configPath))} — Context7 documentation MCP is now enabled`,
    );
    return true;
  } catch (err) {
    ws.stop('Failed to write config');
    log.error(`Could not update config: ${err.message}`);
    log.info('You can add it manually to opencode.json:');
    log.info(
      `  ${pc.dim('See: https://github.com/context7/context7-mcp#opencode')}`,
    );
    return false;
  }
}

async function ensureOhMyOpenAgent(configInfo) {
  const { path: configPath, data: config } = configInfo;

  if (isOhMyOpenAgentInstalled(config)) {
    log.success('oh-my-openagent plugin is registered in OpenCode');
    return true;
  }

  const shouldInstall = await confirm({
    message:
      'Oh-My-OpenAgent not found. It provides multi-agent orchestration (Sisyphus) required by OmniLearn. Install it now?',
    initialValue: true,
  });
  if (isCancel(shouldInstall)) {
    cancel('Installation cancelled');
    process.exit(0);
  }
  if (!shouldInstall) {
    log.warn('oh-my-openagent is strongly recommended for OmniLearn.');
    log.info('Install manually when ready:');
    if (isBunAvailable()) {
      log.info(`  ${pc.cyan('bunx oh-my-openagent install')}`);
    } else {
      log.info('  Install bun first:  curl -fsSL https://bun.sh/install | bash');
      log.info(`  Then: bunx oh-my-openagent install`);
    }
    return false;
  }

  // Check if Bun is available (required for oh-my-openagent install)
  if (!isBunAvailable()) {
    log.info('Installing Bun (required for oh-my-openagent)...');
    const bs = createSpinner();
    bs.start('Installing Bun...');
    try {
      execSync('curl -fsSL https://bun.sh/install | bash', {
        stdio: 'pipe',
        timeout: 60000,
      });
      bs.stop('Bun installed');
    } catch (err) {
      bs.stop('Bun install failed');
      log.error(`Could not install Bun: ${err.message}`);
      log.info('Install manually:');
      log.info(`  ${pc.cyan('curl -fsSL https://bun.sh/install | bash')}`);
      log.info(`  ${pc.cyan('bunx oh-my-openagent install')}`);
      return false;
    }
  }

  // Install oh-my-openagent
  const os = createSpinner();
  os.start('Running oh-my-openagent installer...');
  try {
    execSync('bunx oh-my-openagent install --yes 2>/dev/null || bunx oh-my-openagent install', {
      stdio: 'inherit',
      timeout: 120000,
    });
    os.stop('oh-my-openagent installed');

    // Refresh config after install
    const refreshed = readOpenCodeConfig();
    if (refreshed.data && !isOhMyOpenAgentInstalled(refreshed.data)) {
      // Plugin wasn't registered by installer, add it manually
      if (!refreshed.data.plugin) refreshed.data.plugin = [];
      if (!refreshed.data.plugin.includes('oh-my-openagent@latest')) {
        refreshed.data.plugin.push('oh-my-openagent@latest');
        writeOpenCodeConfig(refreshed.path, refreshed.data);
      }
    }
    log.success('oh-my-openagent is now installed and configured');
    return true;
  } catch (err) {
    os.stop('oh-my-openagent install interrupted or failed');
    log.warn('oh-my-openagent installer needs interactive input.');
    log.info('Run it manually in a terminal:');
    log.info(`  ${pc.cyan('bunx oh-my-openagent install')}`);
    log.info('Follow the prompts to configure your provider and models.');
    return false;
  }
}

async function configureLearningDir() {
  const shouldConfigure = await confirm({
    message:
      'Create your learning directory now? You can also do this later with /omnilearn-init in OpenCode',
    initialValue: true,
  });
  if (isCancel(shouldConfigure)) {
    cancel('Configuration cancelled');
    process.exit(0);
  }
  if (!shouldConfigure) return null;

  const defaultDir = path.join(
    process.env.HOME || process.env.USERPROFILE,
    'OmniLearn',
  );

  const dirInput = await text({
    message: 'Where should learning files go?',
    placeholder: defaultDir,
    initialValue: defaultDir,
    validate: (value) => {
      if (!value || value.trim().length === 0) return 'Path is required';
      return undefined;
    },
  });
  if (isCancel(dirInput)) {
    cancel('Configuration cancelled');
    process.exit(0);
  }

  const learningDir = dirInput.trim() || defaultDir;

  const config = {
    learningDirectory: learningDir,
    setupDate: new Date().toISOString().slice(0, 10),
    version: '1',
  };

  const s = createSpinner();
  s.start('Creating learning directory...');
  try {
    fs.mkdirSync(path.join(learningDir, '.omnilearn'), { recursive: true });
    fs.writeFileSync(OMNILEARN_CONFIG_PATH, JSON.stringify(config, null, 2));
    s.stop(`Learning directory configured at ${pc.cyan(learningDir)}`);
    return learningDir;
  } catch (err) {
    s.stop('Failed to create learning directory');
    log.error(`Could not create learning directory: ${err.message}`);
    log.info(`You can set it up later with /omnilearn-init in OpenCode`);
    return null;
  }
}

// ─── Health Check ───

async function runHealthCheck() {
  intro(pc.inverse(' OmniLearn Health Check '));

  const configInfo = readOpenCodeConfig();
  const checks = [];

  // 1. OpenCode
  if (isOpenCodeInstalled()) {
    checks.push(`${pc.green('✓')} OpenCode installed`);
  } else {
    checks.push(`${pc.red('✗')} OpenCode not installed`);
    checks.push(`  ${pc.dim('Run: npx omnilearn-workflow to install')}`);
  }

  // 2. Command files
  let installedCount = 0;
  const missing = [];
  for (const cmd of COMMANDS) {
    const dest = path.join(OPENCODE_COMMAND_DIR, cmd);
    if (fs.existsSync(dest)) {
      installedCount++;
    } else {
      missing.push(cmd);
    }
  }
  if (installedCount === COMMANDS.length) {
    checks.push(`${pc.green('✓')} All ${COMMANDS.length} command files installed at ${pc.cyan('~/.config/opencode/command/')}`);
  } else if (installedCount > 0) {
    checks.push(`${pc.yellow('⚠')} ${installedCount}/${COMMANDS.length} command files found`);
    checks.push(`  ${pc.dim('Missing: ' + missing.join(', '))}`);
    checks.push(`  ${pc.dim('Reinstall: npx omnilearn-workflow --yes')}`);
  } else {
    checks.push(`${pc.red('✗')} No command files found`);
    checks.push(`  ${pc.dim('Run: npx omnilearn-workflow')}`);
  }

  // 3. Context7 MCP
  if (configInfo.data && isContext7Configured(configInfo.data)) {
    const ctxKey = Object.keys(configInfo.data.mcp).find(
      (k) => k.toLowerCase().includes('context7') || k.toLowerCase().includes('ctx7'),
    );
    checks.push(`${pc.green('✓')} Context7 MCP configured (${pc.cyan(ctxKey)})`);
  } else {
    checks.push(`${pc.yellow('⚠')} Context7 MCP not configured`);
    checks.push(`  ${pc.dim('Run: npx omnilearn-workflow to set it up')}`);
  }

  // 4. oh-my-openagent
  if (configInfo.data && isOhMyOpenAgentInstalled(configInfo.data)) {
    checks.push(`${pc.green('✓')} oh-my-openagent plugin registered`);
  } else {
    checks.push(`${pc.yellow('⚠')} oh-my-openagent not registered`);
    checks.push(`  ${pc.dim('Run: bunx oh-my-openagent install')}`);
  }

  // 5. OmniLearn config
  if (isOmniLearnConfigured()) {
    const cfg = readOmniLearnConfig();
    const dir = cfg?.learningDirectory || 'unknown';
    const exists = dir !== 'unknown' && fs.existsSync(dir);
    if (exists) {
      checks.push(`${pc.green('✓')} Learning directory: ${pc.cyan(dir)}`);
    } else {
      checks.push(`${pc.yellow('⚠')} Learning directory configured but missing: ${pc.cyan(dir)}`);
      checks.push(`  ${pc.dim('Create it or run /omnilearn-init to reconfigure')}`);
    }
  } else {
    checks.push(`${pc.yellow('⚠')} Learning directory not configured`);
    checks.push(`  ${pc.dim('Run /omnilearn-init in OpenCode or re-run npx omnilearn-workflow')}`);
  }

  // 6. Bun (needed for oh-my-openagent)
  if (isBunAvailable()) {
    checks.push(`${pc.green('✓')} Bun available`);
  } else {
    checks.push(`${pc.yellow('⚠')} Bun not installed (needed for oh-my-openagent install)`);
    checks.push(`  ${pc.dim('Install: curl -fsSL https://bun.sh/install | bash')}`);
  }

  const report = checks.join('\n');
  console.log(
    boxen(report, {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      margin: { top: 0, bottom: 1 },
      borderStyle: 'round',
    }),
  );

  const failCount = checks.filter((c) => c.startsWith(pc.red('✗'))).length;
  if (failCount === 0) {
    const warnCount = checks.filter((c) => c.startsWith(pc.yellow('⚠'))).length;
    if (warnCount === 0) {
      outro(pc.green('Everything looks good! Open OpenCode and start learning.'));
    } else {
      outro(
        pc.yellow(
          `${warnCount} warning(s) found — check suggestions above, or re-run npx omnilearn-workflow to fix.`,
        ),
      );
    }
  } else {
    outro(
      pc.red(
        `${failCount} issue(s) found. Run npx omnilearn-workflow to fix them automatically.`,
      ),
    );
  }
  process.exit(0);
}

// ─── Main Install ───

async function install(autoYes = false) {
  intro(
    boxen(' OmniLearn Workflow ', {
      padding: { top: 1, bottom: 1, left: 0, right: 0 },
      margin: { top: 0, bottom: 1 },
      borderStyle: 'double',
      borderColor: 'cyan',
      textAlignment: 'center',
    }),
  );

  // ── Step 1: OpenCode ──
  log.step('1/5  Checking OpenCode');
  const opencodeFound = isOpenCodeInstalled();

  if (!opencodeFound) {
    log.warn('OpenCode is not installed on this system.');
    if (!autoYes) {
      const shouldInstall = await confirm({
        message: 'OpenCode is required. Install it now?',
        initialValue: true,
      });
      if (isCancel(shouldInstall)) {
        cancel('Installation cancelled');
        process.exit(0);
      }
      if (!shouldInstall) {
        log.error('OpenCode is required to use OmniLearn.');
        log.info('Install manually:');
        log.info(`  ${pc.cyan('curl -fsSL https://opencode.ai/install | bash')}`);
        process.exit(1);
      }
    }
    const installed = await installOpenCode();
    if (!installed) process.exit(1);
  } else {
    log.success(`OpenCode found at ${pc.cyan(OPENCODE_CONFIG_DIR)}`);
  }

  // ── Step 2: Context7 MCP ──
  log.step('2/5  Configuring Context7 MCP (documentation lookups)');
  const configInfo = readOpenCodeConfig();
  await setupContext7MCP(configInfo);

  // ── Step 3: oh-my-openagent ──
  log.step('3/5  Checking oh-my-openagent (multi-agent orchestration)');
  const refreshedConfig = readOpenCodeConfig();
  await ensureOhMyOpenAgent(refreshedConfig);

  // ── Step 4: Copy command files ──
  log.step('4/5  Installing OmniLearn commands');
  await copyCommandFiles(autoYes);

  // ── Step 5: Learning directory ──
  log.step('5/5  Learning directory');
  const configured = isOmniLearnConfigured();
  if (!configured && !autoYes) {
    await configureLearningDir();
  } else if (configured) {
    const cfg = readOmniLearnConfig();
    log.success(
      `Learning directory already configured: ${pc.cyan(cfg?.learningDirectory || 'unknown')}`,
    );
  }

  // ── Outro ──
  const summary = [
    `${pc.green('✓')} OmniLearn is ready to use!`,
    '',
    `${pc.bold('OpenCode commands installed:')}`,
    `${pc.cyan('/omnilearn-init')}        ${pc.dim('— (Re)configure learning directory')}`,
    `${pc.cyan('/omnilearn-roadmap')}     ${pc.dim('— Create a learning roadmap')}`,
    `${pc.cyan('/omnilearn-start')}       ${pc.dim('— Start learning a topic')}`,
    `${pc.cyan('/omnilearn-refine')}      ${pc.dim('— Ask a deep question')}`,
    '',
    `${pc.bold('Quick start:')}`,
    `  1. ${pc.cyan('opencode')}          ${pc.dim('— Open OpenCode in your terminal')}`,
    `  2. ${pc.cyan('/omnilearn-roadmap')} ${pc.dim('— Create your first learning roadmap')}`,
  ].join('\n');

  outro(
    boxen(summary, {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      margin: { top: 1, bottom: 0 },
      borderStyle: 'round',
      borderColor: 'green',
      title: 'Ready',
      titleAlignment: 'center',
    }),
  );
}

// ─── CLI ───

const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-v')) {
  printVersion();
}

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
}

if (args.includes('--check') || args.includes('-c')) {
  runHealthCheck().catch((err) => {
    log.error(`Health check failed: ${err.message}`);
    process.exit(1);
  });
} else {
  const autoYes = args.includes('--yes') || args.includes('-y');
  install(autoYes).catch((err) => {
    log.error(`Installation failed: ${err.message}`);
    process.exit(1);
  });
}
