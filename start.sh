#!/bin/bash
# start.sh - Start the Transformer Explainer background services
# Date: April 8, 2026

set -e

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
echo -e "${BLUE}  Transformer Explainer - Start Script  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if already running
if [ -f .run.env ]; then
    echo -e "${YELLOW}⚠ Warning: .run.env file exists. Checking if server is already running...${NC}"
    VITE_PID=$(grep VITE_PID .run.env 2>/dev/null | cut -d '=' -f 2 | tr -d '[:space:]')
    if [ -n "$VITE_PID" ] && kill -0 $VITE_PID 2>/dev/null; then
        echo -e "${GREEN}✓ Server is already running (PID: $VITE_PID)${NC}"
        echo -e "${GREEN}  Access it at: http://localhost:$VITE_PORT${NC}"
        echo ""
        echo -e "To stop the server, run: ${YELLOW}./stop.sh${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠ Stale .run.env file found. Cleaning up...${NC}"
        rm -f .run.env
    fi
fi

# Check if port is already in use
echo -e "${BLUE}→ Checking if port $VITE_PORT is available...${NC}"
PORT_PID=$(lsof -t -i:$VITE_PORT 2>/dev/null || echo "")
if [ -n "$PORT_PID" ]; then
    echo -e "${RED}✗ Port $VITE_PORT is already in use by process(es): $PORT_PID${NC}"
    echo -e "${YELLOW}  Attempting to stop existing process(es)...${NC}"
    kill $PORT_PID 2>/dev/null || true
    sleep 2
    # Force kill if still running
    if kill -0 $PORT_PID 2>/dev/null; then
        kill -9 $PORT_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✓ Existing process(es) stopped${NC}"
fi

# Check for pnpm
echo -e "${BLUE}→ Checking for pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}✗ pnpm not found. Please install pnpm first:${NC}"
    echo -e "   npm install -g pnpm"
    exit 1
fi
echo -e "${GREEN}✓ pnpm found: $(which pnpm)${NC}"

# Check for node_modules
echo -e "${BLUE}→ Checking for node_modules...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules not found. Running pnpm install...${NC}"
    pnpm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ node_modules exists${NC}"
fi

echo ""
echo -e "${BLUE}→ Starting Vite development server...${NC}"
echo -e "${BLUE}  Port: $VITE_PORT${NC}"
echo -e "${BLUE}  Log file: .run.env${NC}"
echo ""

# Clear previous run data
> .run.env

# Get timestamp
START_TIME=$(date '+%Y-%m-%d %H:%M:%S')
echo "START_TIME=$START_TIME" >> .run.env

# Use nohup to run the dev server in the background, logging to .run.env
echo -e "${BLUE}→ Launching server process...${NC}"
nohup pnpm dev --port $VITE_PORT >> .run.env 2>&1 &

# Save the Process ID so we can stop it later
VITE_PID=$!
echo "VITE_PID=$VITE_PID" >> .run.env
echo "LOG_FILE=.run.env" >> .run.env

echo -e "${GREEN}✓ Server process started (PID: $VITE_PID)${NC}"

# Wait a moment and check if process is still running
echo -e "${BLUE}→ Waiting for server to initialize...${NC}"
sleep 3

if ! kill -0 $VITE_PID 2>/dev/null; then
    echo -e "${RED}✗ Server failed to start. Check .run.env for errors.${NC}"
    echo ""
    echo -e "${YELLOW}Last 20 lines of log:${NC}"
    tail -20 .run.env
    exit 1
fi

# Check if server is responding
echo -e "${BLUE}→ Testing server connectivity...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0
while ! curl -s http://localhost:$VITE_PORT > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}✗ Server did not respond after $MAX_RETRIES attempts${NC}"
        echo -e "${YELLOW}  The process may still be starting. Check .run.env for details.${NC}"
        break
    fi
    echo -e "${BLUE}  Waiting... attempt $RETRY_COUNT/$MAX_RETRIES${NC}"
    sleep 1
    if ! kill -0 $VITE_PID 2>/dev/null; then
        echo -e "${RED}✗ Server process died unexpectedly${NC}"
        echo -e "${YELLOW}Last 20 lines of log:${NC}"
        tail -20 .run.env
        exit 1
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Server is running successfully!     ${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Process ID: $VITE_PID${NC}"
echo -e "${GREEN}  URL: http://localhost:$VITE_PORT${NC}"
echo -e "${GREEN}  Log: .run.env${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "To stop the server, run: ${YELLOW}./stop.sh${NC}"
echo ""
