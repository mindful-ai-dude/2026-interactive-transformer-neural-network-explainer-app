#!/usr/bin/env bash
# ============================================================================
#  stop.sh — Graceful Shutdown & Port Cleanup Script
# ============================================================================
#  Stops the running application, kills any orphaned processes on the port,
#  and cleans up runtime files.
#
#  Works on: macOS, Linux, Windows (WSL/Git Bash)
#
#  Usage:
#    chmod +x stop.sh    ← (first time only)
#    ./stop.sh            ← graceful shutdown
#    ./stop.sh --force    ← force kill everything on the port
#    ./stop.sh --port 3000 ← kill processes on a specific port
# ============================================================================

set -euo pipefail

# --- Colors & Formatting ---------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

info()    { echo -e "  ${CYAN}ℹ${NC}  $1"; }
success() { echo -e "  ${GREEN}✓${NC}  $1"; }
warn()    { echo -e "  ${YELLOW}⚠${NC}  $1"; }
fail()    { echo -e "  ${RED}✗${NC}  $1"; }

# --- Parse Arguments -------------------------------------------------------
FORCE_KILL=false
CUSTOM_PORT=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --force|-f)
            FORCE_KILL=true
            shift
            ;;
        --port|-p)
            CUSTOM_PORT="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: ./stop.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --force, -f         Force kill (SIGKILL) instead of graceful shutdown"
            echo "  --port, -p PORT     Kill processes on a specific port"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./stop.sh                  Graceful shutdown using .run.env config"
            echo "  ./stop.sh --force          Force kill all processes on the app port"
            echo "  ./stop.sh --port 3000      Kill everything on port 3000"
            echo "  ./stop.sh -f -p 8080       Force kill everything on port 8080"
            exit 0
            ;;
        *)
            echo "Unknown option: $1 (use --help for usage)"
            exit 1
            ;;
    esac
done

# --- Banner -----------------------------------------------------------------
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║${NC}  ${RED}${BOLD}Shutdown Script${NC}                                    ${BOLD}║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"

# --- Load runtime config ---------------------------------------------------
APP_PORT=""
APP_NAME="Application"

if [ -f ".run.env" ]; then
    # shellcheck disable=SC1091
    source .run.env 2>/dev/null || true
    info "Loaded config from .run.env"
    info "App: ${APP_NAME} | Port: ${APP_PORT}"
fi

# Override port if specified via CLI
if [ -n "$CUSTOM_PORT" ]; then
    APP_PORT="$CUSTOM_PORT"
    info "Using custom port: $APP_PORT"
fi

# If we still don't have a port, ask
if [ -z "$APP_PORT" ]; then
    warn "No port configured. Checking common development ports..."
    APP_PORT="8000"  # Default fallback
fi

# --- Detect OS for port-scanning commands -----------------------------------
OS="unknown"
case "$(uname -s)" in
    Linux*)  OS="linux" ;;
    Darwin*) OS="macos" ;;
    CYGWIN*|MINGW*|MSYS*) OS="windows-bash" ;;
esac

# --- Function: Find PIDs on a port -----------------------------------------
find_pids_on_port() {
    local port="$1"
    local pids=""

    case "$OS" in
        macos)
            pids=$(lsof -ti :"$port" 2>/dev/null || true)
            ;;
        linux)
            # Try lsof first, fall back to ss + awk
            pids=$(lsof -ti :"$port" 2>/dev/null || true)
            if [ -z "$pids" ]; then
                pids=$(ss -tlnp "sport = :$port" 2>/dev/null \
                    | grep -oP 'pid=\K[0-9]+' || true)
            fi
            ;;
        windows-bash)
            # Git Bash / MSYS2 — use netstat
            pids=$(netstat -ano 2>/dev/null \
                | grep ":${port}" \
                | grep "LISTENING" \
                | awk '{print $5}' \
                | sort -u || true)
            ;;
    esac

    echo "$pids"
}

# --- Function: Kill a process gracefully ------------------------------------
kill_process() {
    local pid="$1"
    local name=""

    # Try to get process name for display
    name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")

    if [ "$FORCE_KILL" = true ]; then
        info "Force killing PID $pid ($name)..."
        kill -9 "$pid" 2>/dev/null || true
    else
        info "Sending SIGTERM to PID $pid ($name)..."
        kill -15 "$pid" 2>/dev/null || true

        # Wait up to 5 seconds for graceful shutdown
        local countdown=5
        while [ $countdown -gt 0 ]; do
            if ! kill -0 "$pid" 2>/dev/null; then
                success "PID $pid stopped gracefully"
                return 0
            fi
            sleep 1
            countdown=$((countdown - 1))
        done

        # Still alive? Escalate to SIGKILL
        if kill -0 "$pid" 2>/dev/null; then
            warn "PID $pid did not stop gracefully. Sending SIGKILL..."
            kill -9 "$pid" 2>/dev/null || true
            sleep 1
            if ! kill -0 "$pid" 2>/dev/null; then
                success "PID $pid force killed"
            else
                fail "Could not kill PID $pid. Try: sudo ./stop.sh --force"
            fi
        fi
    fi
}

# --- Step 1: Kill processes on the app port ---------------------------------
echo ""
echo -e "${BLUE}${BOLD}[Step 1]${NC} ${BOLD}Stopping processes on port ${APP_PORT}${NC}"
echo -e "${DIM}$(printf '%.0s─' {1..60})${NC}"

PIDS=$(find_pids_on_port "$APP_PORT")

if [ -n "$PIDS" ]; then
    KILL_COUNT=0
    for pid in $PIDS; do
        # Don't kill ourselves
        if [ "$pid" != "$$" ]; then
            kill_process "$pid"
            KILL_COUNT=$((KILL_COUNT + 1))
        fi
    done
    success "Stopped $KILL_COUNT process(es) on port $APP_PORT"
else
    info "No processes found on port $APP_PORT"
fi

# --- Step 2: Check for common additional ports ------------------------------
echo ""
echo -e "${BLUE}${BOLD}[Step 2]${NC} ${BOLD}Checking for related processes${NC}"
echo -e "${DIM}$(printf '%.0s─' {1..60})${NC}"

# Common ports that may be running alongside (hot-reload, debug, etc.)
RELATED_PORTS=()

# Add common companion ports based on the main port
case "$APP_PORT" in
    8000) RELATED_PORTS=(8001 5555) ;;          # uvicorn + flower/celery
    3000) RELATED_PORTS=(3001 5555) ;;          # next.js HMR
    5000) RELATED_PORTS=(5001) ;;                # flask debug
    8080) RELATED_PORTS=(8081 9090) ;;          # proxy + metrics
esac

RELATED_FOUND=false
for port in "${RELATED_PORTS[@]}"; do
    RELATED_PIDS=$(find_pids_on_port "$port")
    if [ -n "$RELATED_PIDS" ]; then
        RELATED_FOUND=true
        warn "Found process(es) on related port $port"
        for pid in $RELATED_PIDS; do
            info "  PID $pid — $(ps -p "$pid" -o comm= 2>/dev/null || echo 'unknown')"
        done
    fi
done

if [ "$RELATED_FOUND" = true ]; then
    echo ""
    warn "Related processes still running (listed above)."
    warn "To kill them: ./stop.sh --port <PORT>"
else
    info "No related processes found"
fi

# --- Step 3: Deactivate virtual environment ---------------------------------
echo ""
echo -e "${BLUE}${BOLD}[Step 3]${NC} ${BOLD}Cleaning up${NC}"
echo -e "${DIM}$(printf '%.0s─' {1..60})${NC}"

# Deactivate venv if active
if [ -n "${VIRTUAL_ENV:-}" ]; then
    info "Deactivating virtual environment..."
    deactivate 2>/dev/null || true
    success "Virtual environment deactivated"
else
    info "No active virtual environment to deactivate"
fi

# Clean up runtime config
if [ -f ".run.env" ]; then
    rm -f .run.env
    success "Removed .run.env"
fi

# --- Step 4: Final port verification ---------------------------------------
echo ""
echo -e "${BLUE}${BOLD}[Step 4]${NC} ${BOLD}Verifying port ${APP_PORT} is free${NC}"
echo -e "${DIM}$(printf '%.0s─' {1..60})${NC}"

sleep 1
REMAINING=$(find_pids_on_port "$APP_PORT")

if [ -z "$REMAINING" ]; then
    success "Port $APP_PORT is free and clear"
else
    fail "Port $APP_PORT still has processes. Try: ./stop.sh --force"
fi

# --- Done -------------------------------------------------------------------
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║${NC}  ${GREEN}${BOLD}${APP_NAME} has been shut down.${NC}                      ${GREEN}${BOLD}║${NC}"
echo -e "${GREEN}${BOLD}║${NC}  ${DIM}Port ${APP_PORT} is free. Ready to restart: ./start.sh${NC}  ${GREEN}${BOLD}║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
