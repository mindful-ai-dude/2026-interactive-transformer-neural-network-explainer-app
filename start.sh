#!/bin/bash
# start.sh - Start the Transformer Explainer background services
export VITE_PORT=5173

# Change to the directory where the script is located (project root)
cd "$(dirname "$0")"

# Save the current PID context
echo "Starting Node/Vite development server..."

# Use nohup to run the dev server in the background, logging to .run.env
nohup pnpm dev --port $VITE_PORT > .run.env 2>&1 &

# Save the Process ID so we can stop it later
VITE_PID=$!
echo "VITE_PID=$VITE_PID" >> .run.env

echo "Transformer Explainer is running in the background."
echo "Access it at: http://localhost:$VITE_PORT"
echo "To stop the server, run: ./stop.sh"
