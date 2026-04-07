#!/usr/bin/env bash
# ============================================================================
#  start.sh — Cross-Platform Project Startup Script
# ============================================================================
#  Detects your OS, installs uv (if needed), sets up a virtual environment,
#  installs dependencies, and starts your application.
#
#  Works on: macOS, Linux (Ubuntu/Debian/Fedora/Arch), Windows (WSL/Git Bash)
#
#  Usage:
#    chmod +x start.sh    ← (first time only)
#    ./start.sh            ← run it
#
#  For Windows without WSL or Git Bash, see start.ps1
# ============================================================================

set -euo pipefail

# ┌────────────────────────────────────────────────────────────────────────────┐
# │  CONFIGURATION — Edit these for your project                              │
# └────────────────────────────────────────────────────────────────────────────┘

# Python version to use (uv will install it automatically if missing)
PYTHON_VERSION="3.12"

# Application start command (what runs your app)
# Examples:
#   APP_START_CMD="uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
#   APP_START_CMD="python manage.py runserver"
#   APP_START_CMD="streamlit run app.py"
#   APP_START_CMD="flask run --port 5000"
#   APP_START_CMD="npm run dev"
APP_START_CMD="uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

# Port your app runs on (used by stop.sh to clean up)
APP_PORT=8000

# Name shown in terminal output
APP_NAME="My Application"

# ┌────────────────────────────────────────────────────────────────────────────┐
# │  DO NOT EDIT BELOW THIS LINE (unless you know what you're doing)          │
# └────────────────────────────────────────────────────────────────────────────┘

# --- Colors & Formatting ---------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

step_num=0
step() {
    step_num=$((step_num + 1))
    echo ""
    echo -e "${BLUE}${BOLD}[Step ${step_num}]${NC} ${BOLD}$1${NC}"
    echo -e "${DIM}$(printf '%.0s─' {1..60})${NC}"
}

info()    { echo -e "  ${CYAN}ℹ${NC}  $1"; }
success() { echo -e "  ${GREEN}✓${NC}  $1"; }
warn()    { echo -e "  ${YELLOW}⚠${NC}  $1"; }
fail()    { echo -e "  ${RED}✗${NC}  $1"; exit 1; }

# --- Banner -----------------------------------------------------------------
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║${NC}  ${CYAN}${BOLD}${APP_NAME}${NC} — Startup Script                       ${BOLD}║${NC}"
echo -e "${BOLD}║${NC}  ${DIM}Powered by Dependency Guard Protocol${NC}               ${BOLD}║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"

# --- Step 1: Detect OS -----------------------------------------------------
step "Detecting operating system"

OS="unknown"
ARCH="$(uname -m)"

case "$(uname -s)" in
    Linux*)
        if grep -qi microsoft /proc/version 2>/dev/null; then
            OS="wsl"
            info "Detected: Windows Subsystem for Linux (WSL)"
        else
            OS="linux"
            # Detect distro
            if [ -f /etc/os-release ]; then
                . /etc/os-release
                info "Detected: Linux ($NAME $VERSION_ID) — $ARCH"
            else
                info "Detected: Linux — $ARCH"
            fi
        fi
        ;;
    Darwin*)
        OS="macos"
        info "Detected: macOS — $ARCH"
        ;;
    CYGWIN*|MINGW*|MSYS*)
        OS="windows-bash"
        info "Detected: Windows (Git Bash/MSYS2) — $ARCH"
        ;;
    *)
        fail "Unsupported operating system: $(uname -s). Use WSL on Windows."
        ;;
esac

success "OS detection complete"

# --- Step 2: Detect Project Type --------------------------------------------
step "Detecting project type"

PROJECT_TYPE="unknown"
HAS_PYTHON=false
HAS_NODE=false
NEEDS_VENV=false

# Python project detection
# Criteria: any of these files exist → it's a Python project → needs a venv
if [ -f "pyproject.toml" ]; then
    HAS_PYTHON=true
    NEEDS_VENV=true
    PROJECT_TYPE="python-pyproject"
    info "Found: pyproject.toml → Python project (modern)"
elif [ -f "requirements.txt" ]; then
    HAS_PYTHON=true
    NEEDS_VENV=true
    PROJECT_TYPE="python-requirements"
    info "Found: requirements.txt → Python project (pip-style)"
elif [ -f "setup.py" ] || [ -f "setup.cfg" ]; then
    HAS_PYTHON=true
    NEEDS_VENV=true
    PROJECT_TYPE="python-setup"
    info "Found: setup.py/setup.cfg → Python project (legacy)"
elif [ -f "Pipfile" ]; then
    HAS_PYTHON=true
    NEEDS_VENV=true
    PROJECT_TYPE="python-pipenv"
    info "Found: Pipfile → Python project (pipenv — will migrate to uv)"
fi

# Node project detection
if [ -f "package.json" ]; then
    HAS_NODE=true
    if [ "$HAS_PYTHON" = true ]; then
        PROJECT_TYPE="fullstack"
        info "Found: package.json → Full-stack project (Python + Node)"
    else
        PROJECT_TYPE="node"
        info "Found: package.json → Node.js project"
        NEEDS_VENV=false
    fi
fi

# Unknown project
if [ "$HAS_PYTHON" = false ] && [ "$HAS_NODE" = false ]; then
    warn "No dependency files found (pyproject.toml, requirements.txt, package.json)"
    warn "Skipping dependency installation. Only starting the app command."
fi

# Virtual environment decision explanation
if [ "$NEEDS_VENV" = true ]; then
    info "Virtual environment: ${GREEN}REQUIRED${NC}"
    info "  → Python projects always need isolated environments to avoid"
    info "    polluting your system Python with project-specific packages."
    info "  → Using uv (10-100x faster than pip/venv, written in Rust)"
else
    info "Virtual environment: ${DIM}not needed${NC} (Node projects use node_modules/)"
fi

success "Project type: $PROJECT_TYPE"

# --- Step 3: Install uv (if Python project) --------------------------------
if [ "$HAS_PYTHON" = true ]; then
    step "Installing uv (fast Python package manager)"

    if command -v uv &>/dev/null; then
        UV_VERSION=$(uv --version 2>/dev/null | head -1)
        success "uv is already installed: $UV_VERSION"

        # Auto-update uv
        info "Checking for updates..."
        if uv self update 2>/dev/null; then
            success "uv is up to date"
        else
            info "Self-update not available (installed via system package manager)"
        fi
    else
        info "uv not found. Installing..."

        case "$OS" in
            macos|linux|wsl)
                curl -LsSf https://astral.sh/uv/install.sh | sh
                ;;
            windows-bash)
                # Git Bash / MSYS2 on Windows
                powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex" 2>/dev/null \
                    || curl -LsSf https://astral.sh/uv/install.sh | sh
                ;;
            *)
                fail "Cannot auto-install uv on this OS. Install manually: https://docs.astral.sh/uv/"
                ;;
        esac

        # Add uv to PATH for this session
        export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"

        if command -v uv &>/dev/null; then
            success "uv installed successfully: $(uv --version)"
        else
            fail "uv installation failed. Install manually: https://docs.astral.sh/uv/"
        fi
    fi

    # --- Step 4: Install Python version (if needed) -------------------------
    step "Ensuring Python $PYTHON_VERSION is available"

    if uv python find "$PYTHON_VERSION" &>/dev/null; then
        PYTHON_PATH=$(uv python find "$PYTHON_VERSION")
        success "Python $PYTHON_VERSION found: $PYTHON_PATH"
    else
        info "Python $PYTHON_VERSION not found. Installing via uv..."
        uv python install "$PYTHON_VERSION"
        success "Python $PYTHON_VERSION installed"
    fi

    # --- Step 5: Create/activate virtual environment ------------------------
    step "Setting up virtual environment"

    VENV_DIR=".venv"

    if [ -d "$VENV_DIR" ]; then
        info "Virtual environment already exists at ./$VENV_DIR"
        info "Reusing existing environment (delete .venv/ to start fresh)"
    else
        info "Creating virtual environment with uv..."
        uv venv --python "$PYTHON_VERSION" "$VENV_DIR"
        success "Virtual environment created at ./$VENV_DIR"
    fi

    # Activate the virtual environment
    if [ -f "$VENV_DIR/bin/activate" ]; then
        # shellcheck disable=SC1091
        source "$VENV_DIR/bin/activate"
        success "Virtual environment activated"
    elif [ -f "$VENV_DIR/Scripts/activate" ]; then
        # Windows Git Bash path
        # shellcheck disable=SC1091
        source "$VENV_DIR/Scripts/activate"
        success "Virtual environment activated (Windows path)"
    else
        fail "Cannot find activation script in $VENV_DIR"
    fi

    # Verify we're in the venv
    ACTIVE_PYTHON=$(which python)
    info "Active Python: $ACTIVE_PYTHON"

    # --- Step 6: Install dependencies ---------------------------------------
    step "Installing Python dependencies"

    case "$PROJECT_TYPE" in
        python-pyproject)
            if [ -f "uv.lock" ]; then
                info "Lock file found. Installing from uv.lock (deterministic)..."
                uv sync
                success "Dependencies installed from lock file"
            else
                info "No lock file found. Resolving and installing from pyproject.toml..."
                uv sync
                info "Lock file generated at uv.lock"
                success "Dependencies installed"
                warn "Commit uv.lock to version control for reproducible builds"
            fi
            ;;
        python-requirements)
            info "Installing from requirements.txt..."
            uv pip install -r requirements.txt
            success "Dependencies installed"
            ;;
        python-setup)
            info "Installing from setup.py/setup.cfg..."
            uv pip install -e ".[dev]" 2>/dev/null || uv pip install -e .
            success "Dependencies installed"
            ;;
        python-pipenv)
            warn "Pipfile detected. Using uv instead of pipenv for speed."
            if [ -f "requirements.txt" ]; then
                uv pip install -r requirements.txt
            else
                info "Converting Pipfile to requirements.txt..."
                # Basic conversion — complex Pipfiles may need manual adjustment
                python -c "
import json
with open('Pipfile.lock') as f:
    lock = json.load(f)
with open('requirements.txt', 'w') as out:
    for pkg, info in lock['default'].items():
        ver = info.get('version', '')
        out.write(f'{pkg}{ver}\n')
print('Converted Pipfile.lock → requirements.txt')
" 2>/dev/null && uv pip install -r requirements.txt \
                    || warn "Auto-conversion failed. Please create a requirements.txt manually."
            fi
            success "Dependencies installed"
            ;;
        fullstack)
            info "Full-stack project: installing Python dependencies..."
            if [ -f "uv.lock" ]; then
                uv sync
            elif [ -f "requirements.txt" ]; then
                uv pip install -r requirements.txt
            fi
            success "Python dependencies installed"
            ;;
    esac
fi

# --- Step 7: Install Node dependencies (if applicable) ---------------------
if [ "$HAS_NODE" = true ]; then
    step "Installing Node.js dependencies"

    if command -v node &>/dev/null; then
        info "Node.js found: $(node --version)"
    else
        warn "Node.js not found. Please install Node.js: https://nodejs.org/"
        warn "Skipping Node dependency installation."
    fi

    if command -v node &>/dev/null; then

        # Ensure pnpm is installed (it's our default package manager)
        if ! command -v pnpm &>/dev/null; then
            info "Installing pnpm (fast, disk-efficient, secure package manager)..."
            # Use corepack if available (ships with Node 16.9+), otherwise npm
            if command -v corepack &>/dev/null; then
                corepack enable
                corepack prepare pnpm@latest --activate 2>/dev/null \
                    || npm install -g pnpm
            else
                npm install -g pnpm
            fi

            if command -v pnpm &>/dev/null; then
                success "pnpm installed: $(pnpm --version)"
            else
                warn "pnpm installation failed. Falling back to npm."
            fi
        else
            success "pnpm found: $(pnpm --version)"
        fi

        # Install dependencies — respect existing lock files, default to pnpm
        if [ -f "pnpm-lock.yaml" ]; then
            info "Lock file found: pnpm-lock.yaml"
            pnpm install --frozen-lockfile 2>/dev/null || pnpm install
        elif [ -f "yarn.lock" ]; then
            info "Lock file found: yarn.lock (using yarn to respect existing lock)"
            command -v yarn &>/dev/null || npm install -g yarn
            yarn install
        elif [ -f "bun.lockb" ] || [ -f "bun.lock" ]; then
            info "Lock file found: bun.lock (using bun to respect existing lock)"
            command -v bun &>/dev/null || curl -fsSL https://bun.sh/install | bash
            bun install
        elif [ -f "package-lock.json" ]; then
            # Existing npm project — migrate to pnpm
            info "Found package-lock.json. Migrating to pnpm..."
            if command -v pnpm &>/dev/null; then
                pnpm import 2>/dev/null || true  # Import npm lock file
                pnpm install
                success "Migrated to pnpm. You can now delete package-lock.json"
                info "  → pnpm-lock.yaml has been generated"
            else
                info "Falling back to npm..."
                npm ci
            fi
        else
            # No lock file — fresh project, default to pnpm
            info "No lock file found. Using pnpm (default)..."
            if command -v pnpm &>/dev/null; then
                pnpm install
                info "Generated pnpm-lock.yaml — commit this to version control"
            else
                warn "pnpm not available. Falling back to npm..."
                npm install
            fi
        fi
        success "Node.js dependencies installed"
    fi
fi

# --- Step 8: Save runtime config for stop.sh -------------------------------
step "Saving runtime configuration"

# Write a .run.env file that stop.sh can read
cat > .run.env << EOF
# Auto-generated by start.sh — do not edit manually
APP_PORT=${APP_PORT}
APP_NAME="${APP_NAME}"
APP_PID=$$
STARTED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
VENV_DIR=${VENV_DIR:-none}
PROJECT_TYPE=${PROJECT_TYPE}
EOF

success "Runtime config saved to .run.env"
info "Add .run.env to your .gitignore"

# --- Step 9: Start the application -----------------------------------------
step "Starting ${APP_NAME}"

echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║${NC}  ${GREEN}${BOLD}${APP_NAME} is starting...${NC}                          ${GREEN}${BOLD}║${NC}"
echo -e "${GREEN}${BOLD}║${NC}  ${DIM}Command: ${APP_START_CMD}${NC}"
echo -e "${GREEN}${BOLD}║${NC}  ${DIM}Port:    ${APP_PORT}${NC}"
echo -e "${GREEN}${BOLD}║${NC}  ${DIM}Stop:    ./stop.sh${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Run the app (exec replaces the shell so signals pass through cleanly)
exec $APP_START_CMD
