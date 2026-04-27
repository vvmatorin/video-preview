#!/usr/bin/env bash
set -euo pipefail

# ── Install & run video-preview on macOS ─────────────────────────────────────

die() { echo "ERROR: $*" >&2; exit 1; }
info() { echo "→ $*"; }

[[ "$(uname)" == "Darwin" ]] || die "This script is for macOS only."

# Homebrew
if ! command -v brew &>/dev/null; then
    info "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv)"
fi

# Node.js (needed for frontend build)
if ! command -v node &>/dev/null; then
    info "Installing Node.js..."
    brew install node
else
    info "Node.js already installed."
fi

# uv (Python project manager)
if ! command -v uv &>/dev/null; then
    info "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
fi

# Project root
cd "$(dirname "$0")"

# Python dependencies
info "Syncing Python dependencies..."
uv sync --frozen

# Frontend build
info "Building frontend..."
cd frontend
npm install --no-fund --no-audit
npm run build
cd ..

# Run
info "Launching video-preview at http://localhost:8000 ..."
exec uv run python main.py "$@"
