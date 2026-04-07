# ============================================================================
#  start.ps1 — Windows Project Startup Script (PowerShell)
# ============================================================================
#  Windows equivalent of start.sh for users without WSL or Git Bash.
#  Installs uv, sets up virtual environment, installs deps, starts the app.
#
#  Usage:
#    powershell -ExecutionPolicy ByPass -File start.ps1
#
#  Or if execution policy is already set:
#    .\start.ps1
# ============================================================================

$ErrorActionPreference = "Stop"

# ┌────────────────────────────────────────────────────────────────────────────┐
# │  CONFIGURATION — Edit these for your project                              │
# └────────────────────────────────────────────────────────────────────────────┘

$PYTHON_VERSION = "3.12"
$APP_START_CMD  = "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
$APP_PORT       = 8000
$APP_NAME       = "My Application"

# ┌────────────────────────────────────────────────────────────────────────────┐
# │  DO NOT EDIT BELOW THIS LINE                                              │
# └────────────────────────────────────────────────────────────────────────────┘

function Write-Step($num, $msg) {
    Write-Host ""
    Write-Host "[Step $num] $msg" -ForegroundColor Blue
    Write-Host ("─" * 60) -ForegroundColor DarkGray
}

function Write-Info($msg)    { Write-Host "  i  $msg" -ForegroundColor Cyan }
function Write-Ok($msg)      { Write-Host "  ✓  $msg" -ForegroundColor Green }
function Write-Warn($msg)    { Write-Host "  ⚠  $msg" -ForegroundColor Yellow }
function Write-Fail($msg)    { Write-Host "  ✗  $msg" -ForegroundColor Red; exit 1 }

# --- Banner -----------------------------------------------------------------
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor White
Write-Host "║  $APP_NAME — Startup Script (Windows)              ║" -ForegroundColor Cyan
Write-Host "║  Powered by Dependency Guard Protocol               ║" -ForegroundColor DarkGray
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor White

# --- Step 1: Detect project type -------------------------------------------
Write-Step 1 "Detecting project type"

$ProjectType = "unknown"
$HasPython = $false
$HasNode = $false

if (Test-Path "pyproject.toml") {
    $HasPython = $true; $ProjectType = "python-pyproject"
    Write-Info "Found: pyproject.toml → Python project (modern)"
} elseif (Test-Path "requirements.txt") {
    $HasPython = $true; $ProjectType = "python-requirements"
    Write-Info "Found: requirements.txt → Python project (pip-style)"
} elseif (Test-Path "setup.py") {
    $HasPython = $true; $ProjectType = "python-setup"
    Write-Info "Found: setup.py → Python project (legacy)"
}

if (Test-Path "package.json") {
    $HasNode = $true
    if ($HasPython) { $ProjectType = "fullstack" }
    else { $ProjectType = "node" }
    Write-Info "Found: package.json → Node.js detected"
}

Write-Ok "Project type: $ProjectType"

# --- Step 2: Install uv ---------------------------------------------------
if ($HasPython) {
    Write-Step 2 "Installing uv (fast Python package manager)"

    $uvPath = Get-Command uv -ErrorAction SilentlyContinue
    if ($uvPath) {
        $uvVer = & uv --version 2>$null
        Write-Ok "uv already installed: $uvVer"
    } else {
        Write-Info "Installing uv..."
        powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                     [System.Environment]::GetEnvironmentVariable("Path", "User")

        if (Get-Command uv -ErrorAction SilentlyContinue) {
            Write-Ok "uv installed successfully"
        } else {
            Write-Fail "uv installation failed. Install manually: https://docs.astral.sh/uv/"
        }
    }

    # --- Step 3: Ensure Python version --------------------------------------
    Write-Step 3 "Ensuring Python $PYTHON_VERSION is available"

    $pythonCheck = & uv python find $PYTHON_VERSION 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "Python $PYTHON_VERSION found"
    } else {
        Write-Info "Installing Python $PYTHON_VERSION via uv..."
        & uv python install $PYTHON_VERSION
        Write-Ok "Python $PYTHON_VERSION installed"
    }

    # --- Step 4: Virtual environment ----------------------------------------
    Write-Step 4 "Setting up virtual environment"

    $VenvDir = ".venv"
    if (Test-Path $VenvDir) {
        Write-Info "Virtual environment already exists"
    } else {
        Write-Info "Creating virtual environment..."
        & uv venv --python $PYTHON_VERSION $VenvDir
        Write-Ok "Virtual environment created"
    }

    # Activate
    $activateScript = Join-Path $VenvDir "Scripts\Activate.ps1"
    if (Test-Path $activateScript) {
        & $activateScript
        Write-Ok "Virtual environment activated"
    } else {
        Write-Fail "Cannot find activation script at $activateScript"
    }

    # --- Step 5: Install dependencies ---------------------------------------
    Write-Step 5 "Installing Python dependencies"

    switch ($ProjectType) {
        "python-pyproject" {
            & uv sync
            Write-Ok "Dependencies installed from pyproject.toml"
        }
        "python-requirements" {
            & uv pip install -r requirements.txt
            Write-Ok "Dependencies installed from requirements.txt"
        }
        "python-setup" {
            & uv pip install -e .
            Write-Ok "Dependencies installed from setup.py"
        }
        "fullstack" {
            if (Test-Path "uv.lock") { & uv sync }
            elseif (Test-Path "requirements.txt") { & uv pip install -r requirements.txt }
            Write-Ok "Python dependencies installed"
        }
    }
}

# --- Step 6: Node dependencies (if applicable) -----------------------------
if ($HasNode -and (Get-Command node -ErrorAction SilentlyContinue)) {
    $stepNum = if ($HasPython) { 6 } else { 2 }
    Write-Step $stepNum "Installing Node.js dependencies"

    # Ensure pnpm is installed (our default package manager)
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Info "Installing pnpm (fast, disk-efficient, secure package manager)..."
        if (Get-Command corepack -ErrorAction SilentlyContinue) {
            & corepack enable
            & corepack prepare pnpm@latest --activate 2>$null
        }
        if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
            & npm install -g pnpm
        }
        if (Get-Command pnpm -ErrorAction SilentlyContinue) {
            Write-Ok "pnpm installed: $(pnpm --version)"
        } else {
            Write-Warn "pnpm installation failed. Falling back to npm."
        }
    } else {
        Write-Ok "pnpm found: $(pnpm --version)"
    }

    # Install — respect existing lock files, default to pnpm
    if (Test-Path "pnpm-lock.yaml") {
        Write-Info "Lock file found: pnpm-lock.yaml"
        & pnpm install --frozen-lockfile 2>$null
        if ($LASTEXITCODE -ne 0) { & pnpm install }
    } elseif (Test-Path "yarn.lock") {
        Write-Info "Lock file found: yarn.lock (using yarn to respect existing lock)"
        & yarn install
    } elseif (Test-Path "package-lock.json") {
        Write-Info "Found package-lock.json. Migrating to pnpm..."
        if (Get-Command pnpm -ErrorAction SilentlyContinue) {
            & pnpm import 2>$null
            & pnpm install
            Write-Ok "Migrated to pnpm. You can now delete package-lock.json"
        } else {
            & npm ci
        }
    } else {
        Write-Info "No lock file found. Using pnpm (default)..."
        if (Get-Command pnpm -ErrorAction SilentlyContinue) {
            & pnpm install
            Write-Info "Generated pnpm-lock.yaml — commit this to version control"
        } else {
            Write-Warn "pnpm not available. Falling back to npm..."
            & npm install
        }
    }

    Write-Ok "Node.js dependencies installed"
}

# --- Save runtime config ---------------------------------------------------
@"
APP_PORT=$APP_PORT
APP_NAME=$APP_NAME
STARTED_AT=$(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
"@ | Set-Content ".run.env"

# --- Start the app ----------------------------------------------------------
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  $APP_NAME is starting...                          ║" -ForegroundColor Green
Write-Host "║  Port: $APP_PORT                                          ║" -ForegroundColor DarkGray
Write-Host "║  Stop: .\stop.ps1  or  Ctrl+C                      ║" -ForegroundColor DarkGray
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Split command and arguments for Invoke-Expression
Invoke-Expression $APP_START_CMD
