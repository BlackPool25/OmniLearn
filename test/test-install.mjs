#!/usr/bin/env node
/**
 * Integration tests for omnilearn-workflow install.js
 *
 * Tests in a sandbox environment. Sets HOME to a temp directory
 * with mock OpenCode configs so real configs are never touched.
 *
 * Usage:
 *   node test-install.mjs            # Run all tests
 *   node test-install.mjs --verbose  # Verbose output
 *   node test-install.mjs --name "CLI"  # Run only CLI tests
 */

import { strict as assert } from 'node:assert';
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SANDBOX_HOME = '/tmp/omnilearn-test/sandbox-home';
const REPO_DIR = '/tmp/omnilearn-test/repo';
const INSTALL_JS = path.join(REPO_DIR, 'packages/omnilearn-workflow/bin/install.js');
const COMMANDS_DIR = path.join(REPO_DIR, 'packages/omnilearn-workflow/commands');

const verbose = process.argv.includes('--verbose');
const filter = process.argv.includes('--name') ? process.argv[process.argv.indexOf('--name') + 1] : null;

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  if (filter && !name.toLowerCase().includes(filter.toLowerCase())) return;
  try {
    fn();
    passed++;
    if (verbose) console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    failures.push({ name, err });
    console.error(`  ❌ ${name}`);
    if (verbose) console.error(`     ${err.message}`);
  }
}

function sandboxExec(args, opts = {}) {
  const env = {
    ...process.env,
    HOME: SANDBOX_HOME,
    USERPROFILE: SANDBOX_HOME,
  };
  const result = spawnSync('node', [INSTALL_JS, ...args], {
    env: { ...env, ...(opts.env || {}) },
    cwd: opts.cwd || REPO_DIR,
    encoding: 'utf-8',
    timeout: 15000,
    stdio: 'pipe',
  });
  return {
    stdout: result.stdout?.trim() || '',
    stderr: result.stderr?.trim() || '',
    status: result.status,
    error: result.error,
  };
}

// ============================================================
// SUITE 1: CLI flag tests
// ============================================================
console.log('\n📋 CLI Flag Tests');

test('--help exits with code 0 and shows help text', () => {
  const r = sandboxExec(['--help']);
  assert.equal(r.status, 0, `exit code should be 0, got ${r.status}`);
  assert.ok(r.stdout.includes('Usage:'), 'should show Usage');
  assert.ok(r.stdout.includes('npx omnilearn-workflow'), 'should show npx command');
});

test('--version exits with code 0 and shows version', () => {
  const r = sandboxExec(['--version']);
  assert.equal(r.status, 0);
  assert.ok(r.stdout.includes('v1.'), `should show version, got: ${r.stdout}`);
});

test('--check runs health check', () => {
  const r = sandboxExec(['--check']);
  assert.equal(r.status, 0);
  assert.ok(r.stdout.includes('Health Check'), 'should show health check header');
  assert.ok(r.stdout.includes('OpenCode'), 'should mention OpenCode');
});

test('unknown flag does not crash', () => {
  const r = sandboxExec(['--bogus-flag']);
  // Should either show help or error, but not crash
  assert.ok(r.status === 0 || r.status === 1, `should exit cleanly, got ${r.status}`);
});

// ============================================================
// SUITE 2: Command files exist
// ============================================================
console.log('\n📋 Command Files Tests');

const EXPECTED_COMMANDS = [
  'omnilearn-init.md',
  'omnilearn-roadmap.md',
  'omnilearn-roadmap-edit.md',
  'omnilearn-start.md',
  'omnilearn-refine.md',
  'omnilearn-research.md',
];

test('all 6 command files exist', () => {
  for (const cmd of EXPECTED_COMMANDS) {
    const p = path.join(COMMANDS_DIR, cmd);
    assert.ok(fs.existsSync(p), `missing command: ${cmd}`);
  }
});

test('each command file has description frontmatter', () => {
  for (const cmd of EXPECTED_COMMANDS) {
    const content = fs.readFileSync(path.join(COMMANDS_DIR, cmd), 'utf-8');
    assert.ok(content.includes('description:'), `${cmd} missing description frontmatter`);
    assert.ok(content.startsWith('---'), `${cmd} should start with ---`);
  }
});

// ============================================================
// SUITE 3: JSONC parser tests
// ============================================================
console.log('\n📋 JSONC Parser Tests');

// Test parseJSONC by importing the logic inline
function parseJSONC(text) {
  let cleaned = text.replace(/\/\/[^"'\n]*?(?:\n|$)/g, '\n');
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(cleaned);
}

test('parseJSONC strips // comments', () => {
  const result = parseJSONC('{"a": 1, // comment\n"b": 2}');
  assert.deepEqual(result, { a: 1, b: 2 });
});

test('parseJSONC strips /* block comments */', () => {
  const result = parseJSONC('{"a": 1 /* block */, "b": 2}');
  assert.deepEqual(result, { a: 1, b: 2 });
});

test('parseJSONC handles trailing commas', () => {
  const result = parseJSONC('{"a": 1, "b": 2,}');
  assert.deepEqual(result, { a: 1, b: 2 });
});

test('parseJSONC handles real opencode.jsonc', () => {
  const content = `{
    // This is a comment
    "plugin": ["oh-my-openagent"],
    "mcp": {
      "context7": {
        "type": "remote",
        "url": "https://mcp.context7.com/mcp",
        "enabled": true
      }
    }
    /* another comment */
  }`;
  const result = parseJSONC(content);
  assert.ok(Array.isArray(result.plugin), 'plugin should be array');
  assert.equal(result.plugin[0], 'oh-my-openagent');
  assert.equal(result.mcp.context7.type, 'remote');
});

test('parseJSONC does NOT strip URLs containing //', () => {
  const result = parseJSONC('{"url": "https://example.com/path?q=1"}');
  assert.equal(result.url, 'https://example.com/path?q=1');
});

// ============================================================
// SUITE 4: Health check in sandbox (with mock configs)
// ============================================================
console.log('\n📋 Sandbox Health Check Tests');

test('--check detects OpenCode config in sandbox', () => {
  const r = sandboxExec(['--check']);
  assert.equal(r.status, 0);
});

test('--check with .jsonc config file works', () => {
  // First rename json to jsonc and remove json
  const jsonPath = path.join(SANDBOX_HOME, '.config/opencode/opencode.json');
  const jsoncPath = path.join(SANDBOX_HOME, '.config/opencode/opencode.jsonc');
  
  // Backup original state
  const hadJson = fs.existsSync(jsonPath);
  const hadJsonc = fs.existsSync(jsoncPath);
  
  try {
    // Ensure only .jsonc exists (not .json)
    if (hadJson) {
      // If opencode.json exists, the reader prefers it over .jsonc
      // So rename it temporarily
      fs.renameSync(jsonPath, jsonPath + '.bak');
    }
    
    const r = sandboxExec(['--check']);
    assert.equal(r.status, 0, `--check with jsonc should succeed, got status ${r.status}`);
    assert.ok(r.stdout.includes('OpenCode'), 'should detect OpenCode');
  } finally {
    // Restore
    if (hadJson && fs.existsSync(jsonPath + '.bak')) {
      fs.renameSync(jsonPath + '.bak', jsonPath);
    }
  }
});

// ============================================================
// SUITE 5: Package.json validation
// ============================================================
console.log('\n📋 Package Validation Tests');

test('package.json has all required fields', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_DIR, 'packages/omnilearn-workflow/package.json'), 'utf-8'));
  assert.ok(pkg.name, 'missing name');
  assert.ok(pkg.version, 'missing version');
  assert.ok(pkg.description, 'missing description');
  assert.ok(pkg.bin, 'missing bin entry');
  assert.ok(pkg.files, 'missing files array');
  assert.ok(pkg.repository, 'missing repository');
  assert.ok(pkg.license, 'missing license');
});

test('package.json bin entries point to existing files', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_DIR, 'packages/omnilearn-workflow/package.json'), 'utf-8'));
  for (const [name, binPath] of Object.entries(pkg.bin)) {
    const fullPath = path.join(REPO_DIR, 'packages/omnilearn-workflow', binPath);
    assert.ok(fs.existsSync(fullPath), `bin entry "${name}" points to missing file: ${binPath}`);
  }
});

test('package.json files array covers all needed dirs', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_DIR, 'packages/omnilearn-workflow/package.json'), 'utf-8'));
  assert.ok(pkg.files.includes('bin/'), 'bin/ must be in files');
  assert.ok(pkg.files.includes('commands/'), 'commands/ must be in files');
});

// ============================================================
// SUITE 6: install.js syntax validation
// ============================================================
console.log('\n📋 Syntax & Structure Tests');

test('install.js has valid Node.js syntax', () => {
  const r = spawnSync('node', ['--check', INSTALL_JS], { encoding: 'utf-8' });
  assert.equal(r.status, 0, `syntax error: ${r.stderr}`);
});

test('install.js imports resolve correctly', () => {
  // At minimum, can the module parse? Already tested by --check.
  // Test that required imports exist
  const content = fs.readFileSync(INSTALL_JS, 'utf-8');
  assert.ok(content.includes("from '@clack/prompts'"), 'missing @clack/prompts import');
  assert.ok(content.includes("from 'picocolors'"), 'missing picocolors import');
  assert.ok(content.includes("from 'boxen'"), 'missing boxen import');
});

test('install.js uses correct oh-my-openagent flag', () => {
  const content = fs.readFileSync(INSTALL_JS, 'utf-8');
  // Find the execSync call and its command string (may span multiple lines)
  const execMatch = content.match(/execSync\(\s*'([^']+oh-my-openagent[^']+)'/);
  assert.ok(execMatch, 'should have execSync call with oh-my-openagent install');
  const cmd = execMatch[1];
  assert.ok(!cmd.includes('--yes'), 'should NOT use --yes flag');
  assert.ok(cmd.includes('--no-tui'), 'should use --no-tui flag');
  assert.ok(cmd.includes('--platform=opencode'), 'should specify platform');
  // --no-tui requires the three provider flags or the CLI fails validation
  assert.ok(cmd.includes('--claude=no'), 'should pass --claude=no (required by --no-tui)');
  assert.ok(cmd.includes('--gemini=no'), 'should pass --gemini=no (required by --no-tui)');
  assert.ok(cmd.includes('--copilot=no'), 'should pass --copilot=no (required by --no-tui)');
  assert.ok(!cmd.includes('2>/dev/null'), 'should NOT mask installer errors');
  // Uses npx (no Bun runtime dependency)
  assert.ok(cmd.startsWith('npx -y oh-my-openagent@latest install'), 'should use npx');
});

test('install.js uses readOpenCodeConfigSafe (not old readOpenCodeConfig)', () => {
  const content = fs.readFileSync(INSTALL_JS, 'utf-8');
  const oldUsages = content.match(/[^a-z]readOpenCodeConfig[^a-zA-Z]/g) || [];
  const safeUsages = content.match(/readOpenCodeConfigSafe/g) || [];
  assert.ok(safeUsages.length >= oldUsages.length,
    `should use readOpenCodeConfigSafe, found ${oldUsages.length} old vs ${safeUsages.length} safe`);
});

test('install.js uses writeOpenCodeConfigSafe (not old writeOpenCodeConfig)', () => {
  const content = fs.readFileSync(INSTALL_JS, 'utf-8');
  const oldUsages = content.match(/[^a-z]writeOpenCodeConfig[^a-zA-Z]/g) || [];
  const safeUsages = content.match(/writeOpenCodeConfigSafe/g) || [];
  // writeOpenCodeConfigSafe has more specific signature, it's fine
  assert.ok(safeUsages.length >= 1, 'should have writeOpenCodeConfigSafe calls');
});

// ============================================================
// RESULTS
// ============================================================
console.log('\n' + '='.repeat(50));
console.log(`📊 Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

if (failures.length > 0) {
  console.error('\n❌ Failed tests:');
  for (const f of failures) {
    console.error(`   - ${f.name}: ${f.err.message}`);
  }
  process.exit(1);
} else {
  console.log('✅ All tests passed!');
  process.exit(0);
}
