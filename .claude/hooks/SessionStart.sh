#!/bin/bash
# Session initialization hook
# Runs at the beginning of each new Claude Code session

echo "[SessionStart] Loading project context..."

# Load environment variables from CLAUDE.local.md if they exist
if [ -f CLAUDE.local.md ]; then
  echo "[SessionStart] Local environment detected"
  export BACKEND_URL="http://localhost:8000"
  export DEBUG="true"
fi

# Check if node_modules exists, install if missing
if [ ! -d "mobile/node_modules" ]; then
  echo "[SessionStart] Installing mobile dependencies..."
  cd mobile && npm install || true
  cd ..
fi

# Check if Python venv exists, create if missing
if [ ! -d "backend/venv" ]; then
  echo "[SessionStart] Creating Python virtual environment..."
  cd backend && python -m venv venv || true
  cd ..
fi

echo "[SessionStart] Session initialization complete"
