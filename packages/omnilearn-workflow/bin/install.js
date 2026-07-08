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
const OMNILEARN_CONFIG_PATH = path.join(OPENCODE_CONFIG_DIR, 'omnilearn.json');

const COMMANDS = [
  'omnilearn-init.md',
  'omnilearn-roadmap.md',
  'omnilearn-roadmap-edit.md',
  'omnilearn-start.md',
  'omnilearn-refine.md',
];

const PKG_VERSION = '1.0.14';

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
      `  4. Optionally configures your learning directory right away`,
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
  // Check by config directory existence
  if (fs.existsSync(OPENCODE_COMMAND_DIR)) return true;
  // Also check PATH
  try {
    execSync('which opencode 2>/dev/null', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
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

async function detectMissingDeps() {
  // Check for oh-my-openagent (optional but recommended)
  const omoConfigPaths = [
    path.join(OPENCODE_CONFIG_DIR, 'oh-my-openagent.jsonc'),
    path.join(OPENCODE_CONFIG_DIR, 'oh-my-openagent.json'),
  ];
  const omoInstalled = omoConfigPaths.some((p) => fs.existsSync(p));

  const deps = [];
  if (!omoInstalled) {
    deps.push({
      name: 'oh-my-openagent',
      desc: 'Multi-agent orchestration (enhances OpenCode)',
      installCmd: 'bunx oh-my-openagent install',
    });
  }
  return deps;
}

async function installOpenCode() {
  log.info('OpenCode not found. Installing now...');
  const s = createSpinner();
  s.start('Downloading OpenCode...');
  try {
    execSync('curl -fsSL https://opencode.ai/install | bash', {
      stdio: 'pipe',
      timeout: 60000,
    });
    s.stop('OpenCode installed successfully');
    return true;
  } catch (err) {
    s.stop('OpenCode install failed');
    log.error(
      `Could not install OpenCode automatically: ${err.message}`,
    );
    log.info('Install manually: curl -fsSL https://opencode.ai/install | bash');
    return false;
  }
}

async function copyCommandFiles(autoYes) {
  const s = createSpinner();

  // Ensure command directory exists
  if (!fs.existsSync(OPENCODE_COMMAND_DIR)) {
    fs.mkdirSync(OPENCODE_COMMAND_DIR, { recursive: true });
  }

  // Check for existing commands
  let existing;
  try {
    existing = fs.readdirSync(OPENCODE_COMMAND_DIR)
      .filter((f) => f.startsWith('omnilearn-') && f.endsWith('.md'));
  } catch {
    existing = [];
  }

  if (existing.length > 0 && !autoYes) {
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
      log.info('Existing commands preserved. Skipping install.');
      return 0;
    }
  }

  s.start('Installing command files...');

  let copied = 0;
  let failed = 0;

  for (const cmd of COMMANDS) {
    const src = path.join(COMMANDS_DIR, cmd);
    const dest = path.join(OPENCODE_COMMAND_DIR, cmd);

    if (!fs.existsSync(src)) {
      log.warn(`Source not found: ${cmd}`);
      failed++;
      continue;
    }

    try {
      fs.copyFileSync(src, dest);
      // Ensure readable by owner/group
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
  return copied;
}

async function configureLearningDir() {
  const shouldConfigure = await confirm({
    message: 'Create your learning directory now? You can also do this later with /omnilearn-init',
    initialValue: true,
  });
  if (isCancel(shouldConfigure)) {
    cancel('Configuration cancelled');
    process.exit(0);
  }
  if (!shouldConfigure) return null;

  let learningDir;
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

  learningDir = dirInput.trim() || defaultDir;

  // Create the config
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
    s.stop(`Learning directory configured at ${learningDir}`);
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

  const checks = [];

  // Check 1: OpenCode
  if (isOpenCodeInstalled()) {
    checks.push(`${pc.green('✓')} OpenCode is installed`);
  } else {
    checks.push(`${pc.red('✗')} OpenCode is not installed`);
    checks.push(`  ${pc.dim('Install: curl -fsSL https://opencode.ai/install | bash')}`);
  }

  // Check 2: Command files
  let installedCount = 0;
  for (const cmd of COMMANDS) {
    const dest = path.join(OPENCODE_COMMAND_DIR, cmd);
    if (fs.existsSync(dest)) {
      installedCount++;
    }
  }
  if (installedCount === COMMANDS.length) {
    checks.push(`${pc.green('✓')} All ${COMMANDS.length} command files installed`);
  } else if (installedCount > 0) {
    checks.push(
      `${pc.yellow('⚠')} ${installedCount}/${COMMANDS.length} command files found (reinstall with npx omnilearn-workflow)`,
    );
  } else {
    checks.push(
      `${pc.red('✗')} No command files found (run: npx omnilearn-workflow)`,
    );
  }

  // Check 3: OmniLearn config
  if (isOmniLearnConfigured()) {
    const config = readOmniLearnConfig();
    const dir = config?.learningDirectory || 'unknown';
    const exists = dir !== 'unknown' && fs.existsSync(dir);
    if (exists) {
      checks.push(`${pc.green('✓')} Learning directory configured: ${pc.cyan(dir)}`);
    } else {
      checks.push(`${pc.yellow('⚠')} Learning directory configured but not found: ${pc.cyan(dir)}`);
      checks.push(`  ${pc.dim('Create it or reconfigure with /omnilearn-init')}`);
    }
  } else {
    checks.push(`${pc.yellow('⚠')} Learning directory not configured`);
    checks.push(`  ${pc.dim('Run /omnilearn-init in OpenCode to set it up')}`);
  }

  // Check 4: Missing deps
  const deps = await detectMissingDeps();
  if (deps.length === 0) {
    checks.push(`${pc.green('✓')} oh-my-openagent is installed`);
  } else {
    for (const dep of deps) {
      checks.push(`${pc.yellow('⚠')} ${dep.name} not found — ${dep.desc}`);
      checks.push(`  ${pc.dim('Install: ' + dep.installCmd)}`);
    }
  }

  // Print results
  const report = checks.join('\n');
  console.log(
    boxen(report, {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      margin: { top: 0, bottom: 1 },
      borderStyle: 'round',
    }),
  );

  const allGood = checks.every((c) => c.startsWith(pc.green('✓')));
  if (allGood) {
    outro(pc.green('Everything looks good! Open OpenCode and start learning.'));
  } else {
    outro(pc.yellow('Some issues found. Follow the suggestions above to resolve them.'));
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

  // Step 1: Check OpenCode
  const opencodeFound = isOpenCodeInstalled();

  if (!opencodeFound) {
    log.warn('OpenCode is not installed on this system.');
    const shouldInstall = await confirm({
      message: 'OpenCode is required. Install it now?',
      initialValue: true,
    });
    if (isCancel(shouldInstall)) {
      cancel('Installation cancelled');
      process.exit(0);
    }
    if (!shouldInstall) {
      log.error(
        'OpenCode is required to use OmniLearn. Install it first:',
      );
      log.info('  curl -fsSL https://opencode.ai/install | bash');
      process.exit(1);
    }
    const installed = await installOpenCode();
    if (!installed) process.exit(1);
  } else {
    log.success(`OpenCode found at ${pc.cyan(OPENCODE_CONFIG_DIR)}`);
  }

  // Step 2: Detect missing optional deps
  const missingDeps = await detectMissingDeps();
  if (missingDeps.length > 0) {
    for (const dep of missingDeps) {
      log.warn(
        `${dep.name} is not installed — ${dep.desc}`,
      );
      log.info(`  Install: ${pc.cyan(dep.installCmd)}`);
    }
  }

  // Step 3: Copy command files
  const copied = await copyCommandFiles(autoYes);

  if (copied === 0 && !autoYes) {
    // If nothing was copied and not in auto mode, maybe nothing to do
    const reinstall = await confirm({
      message: 'Reinstall all command files?',
      initialValue: false,
    });
    if (isCancel(reinstall)) {
      cancel('Installation cancelled');
      process.exit(0);
    }
    if (reinstall) {
      // Force overwrite: remove existing first
      for (const cmd of COMMANDS) {
        const dest = path.join(OPENCODE_COMMAND_DIR, cmd);
        try { fs.unlinkSync(dest); } catch {}
      }
      await copyCommandFiles(true);
    }
  }

  // Step 4: Check if learning dir is configured
  const configured = isOmniLearnConfigured();
  if (!configured && !autoYes) {
    await configureLearningDir();
  } else if (configured) {
    const config = readOmniLearnConfig();
    log.success(
      `Learning directory already configured: ${pc.cyan(config?.learningDirectory || 'unknown')}`,
    );
  }

  // ─── Outro ───
  const summary = [
    `${pc.green('✓')} OmniLearn commands installed`,
    `${pc.cyan('/omnilearn-init')}        ${pc.dim('— Configure learning directory')}`,
    `${pc.cyan('/omnilearn-roadmap')}     ${pc.dim('— Create a learning roadmap')}`,
    `${pc.cyan('/omnilearn-start')}       ${pc.dim('— Start learning a topic')}`,
    `${pc.cyan('/omnilearn-refine')}      ${pc.dim('— Ask a deep question')}`,
  ].join('\n');

  outro(
    boxen(summary, {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      margin: { top: 1, bottom: 0 },
      borderStyle: 'round',
      borderColor: 'green',
      title: 'Ready to learn',
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
  // run health check
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
