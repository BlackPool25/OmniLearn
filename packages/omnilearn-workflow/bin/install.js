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
 *   npx omnilearn-workflow              # Interactive install
 *   npx omnilearn-workflow --help       # Show help
 *   npx omnilearn-workflow --yes        # Auto-install with defaults
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PKG_DIR = path.resolve(__dirname, '..');
const COMMANDS_DIR = path.join(PKG_DIR, 'commands');
const OPENCODE_COMMAND_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.config',
  'opencode',
  'command'
);

const COMMANDS = [
  'omnilearn-init.md',
  'omnilearn-roadmap.md',
  'omnilearn-roadmap-edit.md',
  'omnilearn-start.md',
  'omnilearn-refine.md',
];

function printBanner() {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║             OmniLearn Workflow Installer         ║
  ║  AI-powered adaptive learning for OpenCode       ║
  ╚══════════════════════════════════════════════════╝
  `);
}

function printHelp() {
  console.log(`
  Usage:
    npx omnilearn-workflow           Interactive install
    npx omnilearn-workflow --yes     Auto-install with defaults
    npx omnilearn-workflow --help    Show this help

  What this installer does:
    1. Copies 5 command files to ~/.config/opencode/command/
    2. Makes them available as /omnilearn-* commands in OpenCode

  After install, open OpenCode and run:
    /omnilearn-init    — Set up your learning directory
    /omnilearn-roadmap — Create your first roadmap
  `);
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function install(autoYes = false) {
  printBanner();

  // Check if OpenCode command directory exists
  if (!fs.existsSync(OPENCODE_COMMAND_DIR)) {
    console.log(`  [✗] OpenCode command directory not found at:`);
    console.log(`      ${OPENCODE_COMMAND_DIR}`);
    console.log(``);
    console.log(`  Make sure OpenCode is installed first:`);
    console.log(`  https://opencode.ai`);
    console.log(``);
    process.exit(1);
  }

  console.log(`  OpenCode command directory: ${OPENCODE_COMMAND_DIR}`);
  console.log(``);

  // List existing omnilearn commands
  const existing = fs.readdirSync(OPENCODE_COMMAND_DIR)
    .filter(f => f.startsWith('omnilearn-') && f.endsWith('.md'));

  if (existing.length > 0 && !autoYes) {
    console.log(`  Found ${existing.length} existing OmniLearn command(s):`);
    existing.forEach(f => console.log(`    • ${f}`));
    console.log(``);
    const answer = await ask('  Overwrite existing commands? [y/N] ');
    if (answer.toLowerCase() !== 'y') {
      console.log('  Skipping installation of command files.');
      console.log('  Existing commands preserved.');
      console.log('');
      return await postInstall(autoYes);
    }
  }

  // Copy command files
  let copied = 0;
  for (const cmd of COMMANDS) {
    const src = path.join(COMMANDS_DIR, cmd);
    const dest = path.join(OPENCODE_COMMAND_DIR, cmd);

    if (!fs.existsSync(src)) {
      console.log(`  [✗] Source not found: ${cmd}`);
      continue;
    }

    try {
      fs.copyFileSync(src, dest);
      fs.chmodSync(dest, 0o644);
      console.log(`  [✓] Installed: ${cmd}`);
      copied++;
    } catch (err) {
      console.log(`  [✗] Failed to install ${cmd}: ${err.message}`);
    }
  }

  console.log(``);
  console.log(`  Installed ${copied}/${COMMANDS.length} command(s).`);
  console.log(``);

  return await postInstall(autoYes);
}

async function postInstall(autoYes) {
  console.log(`  ┌──────────────────────────────────────────────────────────┐`);
  console.log(`  │  ✅ OmniLearn commands installed!                        │`);
  console.log(`  │                                                          │`);
  console.log(`  │  Next steps:                                             │`);
  console.log(`  │                                                          │`);
  console.log(`  │  1. Open OpenCode in your learning project               │`);
  console.log(`  │  2. Run:  /omnilearn-init                                │`);
  console.log(`  │     (This sets up your learning directory)               │`);
  console.log(`  │                                                          │`);
  console.log(`  │  3. Run:  /omnilearn-roadmap I want to learn <skill>     │`);
  console.log(`  │     (Creates your first learning roadmap)                │`);
  console.log(`  │                                                          │`);
  console.log(`  │  Available commands:                                     │`);
  console.log(`  │  /omnilearn-init        — Configure learning directory   │`);
  console.log(`  │  /omnilearn-roadmap     — Create a learning roadmap      │`);
  console.log(`  │  /omnilearn-roadmap-edit— Edit an existing roadmap       │`);
  console.log(`  │  /omnilearn-start       — Start learning a topic         │`);
  console.log(`  │  /omnilearn-refine      — Refine a subtopic or ask Qs    │`);
  console.log(`  └──────────────────────────────────────────────────────────┘`);
  console.log(``);
}

// ─── CLI ───

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const autoYes = args.includes('--yes') || args.includes('-y');

install(autoYes).catch((err) => {
  console.error('Installation failed:', err.message);
  process.exit(1);
});
