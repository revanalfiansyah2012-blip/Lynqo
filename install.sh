#!/usr/bin/env bash
set -e

echo "========================================"
echo "      LYNQO VULNERABILITY INSTALLER     "
echo "========================================"

# Detect OS
OS="$(uname -s)"
echo "[LYNQO] Detected OS: $OS"

# Check Python 3
if command -v python3 &>/dev/null; then
    echo "✓ Python 3 detected"
else
    echo "✗ Python 3 not found. Please install Python 3."
    exit 1
fi

# Check Node.js & npm
if command -v node &>/dev/null && command -v npm &>/dev/null; then
    echo "✓ Node.js and npm detected"
else
    echo "✗ Node.js or npm not found. Please install Node.js."
    exit 1
fi

# Setup Python venv
if [ ! -d ".venv" ]; then
    echo "[LYNQO] Creating Python virtual environment..."
    python3 -m venv .venv
fi
echo "✓ Python environment ready"

# Install Node dependencies
echo "[LYNQO] Installing root & subproject dependencies..."
npm install
cd client && npm install && cd ../server && npm install && cd ../test-target && npm install

# Make lynqo executable
chmod +x lynqo
mkdir -p logs

echo ""
echo "========================================"
echo "        INSTALLATION COMPLETE           "
echo "========================================"
echo ""
echo "Run:"
echo "  cd lynqo"
echo "  lynqo"
echo ""
