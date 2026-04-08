#!/bin/bash
# stop.sh - Stop the Transformer Explainer background services
# Date: April 8, 2026

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

export VITE_PORT=5173
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the directory where the script is located (project root)
cd "$SCRIPT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Transformer Explainer - Stop Script   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

STOPPED=0

# Function to kill process and its children
kill_process_tree() {
    local pid=$1
    if [ -z "$pid" ]; then
        return 1
    fi
    
    # Get all child processes recursively
    local children=$(pgrep -P $pid 2>/dev/null)
    
    # Kill children first
    for child in $children; do
        kill_process_tree $child
    done
    
    # Kill the parent process
    kill $pid 2>/dev/null || true
}

# Function to force kill process and its children
force_kill_process_tree() {
    local pid=$1
    if [ -z "$pid" ]; then
        return 1
    fi
    
    # Get all child processes recursively
    local children=$(pgrep -P $pid 2>/dev/null)
    
    # Force kill children first
    for child in $children; do
        force_kill_process_tree $child
    done
    
    # Force kill the parent process
    kill -9 $pid 2>/dev/null || true
}

# Method 1: Try to stop using the PID from .run.env
echo -e "${BLUE}→ Method 1: Checking .run.env for process ID...${NC}"
if [ -f .run.env ]; then
    VITE_PID=$(grep VITE_PID .run.env 2>/dev/null | cut -d '=' -f 2 | tr -d '[:space:]')
    
    if [ -n "$VITE_PID" ] && [ "$VITE_PID" -eq "$VITE_PID" ] 2>/dev/null; then
        echo -e "${BLUE}  Found PID: $VITE_PID${NC}"
        
        # Check if process is actually running
        if kill -0 $VITE_PID 2>/dev/null; then
            echo -e "${YELLOW}  → Stopping Vite development server (PID: $VITE_PID)...${NC}"
            
            # Try graceful kill first
            kill_process_tree $VITE_PID
            
            # Wait for process to terminate
            echo -e "${BLUE}  → Waiting for process to terminate...${NC}"
            local count=0
            while kill -0 $VITE_PID 2>/dev/null && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
                echo -e "${BLUE}    Waiting... ($count/10)${NC}"
            done
            
            # Force kill if still running
            if kill -0 $VITE_PID 2>/dev/null; then
                echo -e "${YELLOW}  → Process still running, force stopping...${NC}"
                force_kill_process_tree $VITE_PID
                sleep 1
            fi
            
            # Verify process is stopped
            if ! kill -0 $VITE_PID 2>/dev/null; then
                echo -e "${GREEN}  ✓ Server stopped successfully${NC}"
                STOPPED=1
            else
                echo -e "${RED}  ✗ Failed to stop server process${NC}"
            fi
        else
            echo -e "${YELLOW}  ⚠ Process (PID: $VITE_PID) is not running${NC}"
        fi
    else
        echo -e "${YELLOW}  ⚠ No valid Process ID found in .run.env${NC}"
    fi
    
    # Clean up the run environment file
    echo -e "${BLUE}  → Cleaning up .run.env...${NC}"
    rm -f .run.env
else
    echo -e "${YELLOW}  ⚠ No .run.env file found${NC}"
fi

# Method 2: Find and kill processes by port
echo ""
echo -e "${BLUE}→ Method 2: Checking for processes on port $VITE_PORT...${NC}"

# Try different methods to find processes
PORT_PIDS=""

# Try lsof first (macOS/Linux)
if command -v lsof &> /dev/null; then
    PORT_PIDS=$(lsof -t -i:$VITE_PORT 2>/dev/null)
fi

# Try netstat (Linux)
if [ -z "$PORT_PIDS" ] && command -v netstat &> /dev/null; then
    PORT_PIDS=$(netstat -tlnp 2>/dev/null | grep ":$VITE_PORT " | awk '{print $7}' | cut -d'/' -f1 | grep -E '^[0-9]+$')
fi

# Try ss (Linux)
if [ -z "$PORT_PIDS" ] && command -v ss &> /dev/null; then
    PORT_PIDS=$(ss -tlnp 2>/dev/null | grep ":$VITE_PORT " | grep -oP 'pid=\K[0-9]+')
fi

# Try fuser (Linux)
if [ -z "$PORT_PIDS" ] && command -v fuser &> /dev/null; then
    PORT_PIDS=$(fuser $VITE_PORT/tcp 2>/dev/null)
fi

if [ -n "$PORT_PIDS" ]; then
    echo -e "${YELLOW}  → Found process(es) on port $VITE_PORT: $PORT_PIDS${NC}"
    
    for pid in $PORT_PIDS; do
        if kill -0 $pid 2>/dev/null; then
            echo -e "${YELLOW}    → Stopping PID: $pid${NC}"
            kill $pid 2>/dev/null || true
        fi
    done
    
    sleep 2
    
    # Force kill if still running
    for pid in $PORT_PIDS; do
        if kill -0 $pid 2>/dev/null; then
            echo -e "${YELLOW}    → Force killing PID: $pid${NC}"
            kill -9 $pid 2>/dev/null || true
        fi
    done
    
    # Verify
    sleep 1
    local still_running=""
    for pid in $PORT_PIDS; do
        if kill -0 $pid 2>/dev/null; then
            still_running="$still_running $pid"
        fi
    done
    
    if [ -z "$still_running" ]; then
        echo -e "${GREEN}  ✓ All processes on port $VITE_PORT stopped${NC}"
        STOPPED=1
    else
        echo -e "${RED}  ✗ Some processes could not be stopped: $still_running${NC}"
    fi
else
    echo -e "${GREEN}  ✓ No processes found on port $VITE_PORT${NC}"
fi

# Method 3: Find and kill node/vite processes related to this project
echo ""
echo -e "${BLUE}→ Method 3: Checking for related Node/Vite processes...${NC}"

# Find vite processes in the project directory
VITE_PIDS=$(ps aux | grep -E "(vite|pnpm dev)" | grep -v grep | grep "$SCRIPT_DIR" | awk '{print $2}')

if [ -n "$VITE_PIDS" ]; then
    echo -e "${YELLOW}  → Found related processes: $VITE_PIDS${NC}"
    
    for pid in $VITE_PIDS; do
        if kill -0 $pid 2>/dev/null; then
            echo -e "${YELLOW}    → Stopping PID: $pid${NC}"
            kill $pid 2>/dev/null || true
        fi
    done
    
    sleep 1
    
    # Force kill
    for pid in $VITE_PIDS; do
        if kill -0 $pid 2>/dev/null; then
            kill -9 $pid 2>/dev/null || true
        fi
    done
    
    echo -e "${GREEN}  ✓ Related processes stopped${NC}"
    STOPPED=1
else
    echo -e "${GREEN}  ✓ No related Node/Vite processes found${NC}"
fi

# Final verification
echo ""
echo -e "${BLUE}→ Final verification...${NC}"
sleep 1

# Check port again
if command -v lsof &> /dev/null && lsof -t -i:$VITE_PORT &> /dev/null; then
    echo -e "${RED}✗ Port $VITE_PORT is still in use${NC}"
    echo -e "${YELLOW}  You may need to manually kill the process:${NC}"
    echo -e "    lsof -t -i:$VITE_PORT | xargs kill -9"
    EXIT_CODE=1
else
    echo -e "${GREEN}✓ Port $VITE_PORT is now free${NC}"
    EXIT_CODE=0
fi

echo ""
echo -e "${GREEN}========================================${NC}"
if [ $STOPPED -eq 1 ] || [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}  ✓ Server stopped successfully!        ${NC}"
else
    echo -e "${YELLOW}  ⚠ Server may still be running         ${NC}"
fi
echo -e "${GREEN}========================================${NC}"
echo ""

exit $EXIT_CODE
