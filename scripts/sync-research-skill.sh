#!/bin/bash
set -e
# SSoT sync for omnilearn-research skill
# Canonical: packages/omnilearn-workflow/commands/omnilearn-research.md
# Installed: ~/.config/opencode/skills/omnilearn/references/omnilearn-research.md

SRC="packages/omnilearn-workflow/commands/omnilearn-research.md"
DST="$HOME/.config/opencode/skills/omnilearn/references/omnilearn-research.md"
PKG_VER=$(grep '^version:' "$SRC" | head -1 | sed 's/version: //')

if [ ! -f "$SRC" ]; then echo "ERR: $SRC not found"; exit 1; fi
mkdir -p "$(dirname "$DST")"
cp "$SRC" "$DST"
echo "Synced $SRC → $DST ($(wc -l < "$SRC") lines, version $PKG_VER)"

# Also sync all command files to opencode command dir via installer
echo "Syncing commands via installer..."
node packages/omnilearn-workflow/bin/install.js --yes 2>&1 | tail -5 || echo "Installer fallback: manual cp"
# Manual fallback if installer doesn't sync references
if ! diff -q "$SRC" "$DST" >/dev/null 2>&1; then
  echo "SSoT: diff non-zero — drift!"
  diff -u "$SRC" "$DST" | head -40
  exit 1
else
  echo "SSoT: diff 0 — in sync ✓"
fi
