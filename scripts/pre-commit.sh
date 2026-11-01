#!/bin/sh
# Pre-commit entry point (called from .husky/pre-commit).
# Runs lint-staged from the current worktree's own node_modules. A fresh git
# worktree has none, and a node_modules symlinked from another checkout makes
# eslint resolve eslint-config-next from the wrong place, so in either case we
# install into the worktree itself instead of bypassing the hook.
set -e
cd "$(git rev-parse --show-toplevel)"

if [ -L node_modules ] || [ ! -x node_modules/.bin/lint-staged ] || [ ! -d node_modules/eslint-config-next ]; then
  echo "pre-commit: node_modules missing or shared; running npm ci (one-off)..." >&2
  if [ -L node_modules ]; then
    rm node_modules
  fi
  npm ci --ignore-scripts --prefer-offline --no-audit --no-fund
fi

exec node_modules/.bin/lint-staged
