#!/bin/bash
# Auto-commit hook after file edits with NM-XXX format
# Fires automatically after each tool execution that modifies files

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
COMMIT_MSG="chore: auto-commit NM-$(date +%s | tail -c 4)"

git add -A
if ! git diff-index --quiet HEAD --; then
  git commit -m "$COMMIT_MSG" || true
  echo "[PostTooUse] Auto-committed changes at $TIMESTAMP"
else
  echo "[PostTooUse] No changes to commit at $TIMESTAMP"
fi
