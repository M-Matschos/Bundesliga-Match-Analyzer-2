#!/bin/bash
# Pre-compaction state backup hook
# Runs before Claude Code context compression to preserve session state

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=".claude/backups"

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "[PreCompact] Backing up session state at $TIMESTAMP..."

# Backup current git status
git status > "$BACKUP_DIR/git_status_$TIMESTAMP.txt" 2>&1 || true

# Backup git log (last 20 commits)
git log --oneline -20 > "$BACKUP_DIR/git_log_$TIMESTAMP.txt" 2>&1 || true

# Backup modified files list
git diff --name-only > "$BACKUP_DIR/modified_files_$TIMESTAMP.txt" 2>&1 || true

# Backup current branch info
git branch -v > "$BACKUP_DIR/branch_info_$TIMESTAMP.txt" 2>&1 || true

echo "[PreCompact] Session state backed up to $BACKUP_DIR/"
echo "[PreCompact] Files: git_status_$TIMESTAMP.txt, git_log_$TIMESTAMP.txt, modified_files_$TIMESTAMP.txt, branch_info_$TIMESTAMP.txt"
