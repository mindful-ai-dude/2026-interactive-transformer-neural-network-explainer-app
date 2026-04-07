#!/bin/bash
# stop.sh - Stop the Transformer Explainer background services

cd "$(dirname "$0")"

if [ -f .run.env ]; then
  # Extract the VITE_PID from the .run.env file
  VITE_PID=$(grep VITE_PID .run.env | cut -d '=' -f 2)
  
  if [ -n "$VITE_PID" ]; then
    echo "Stopping Vite development server (PID: $VITE_PID)..."
    kill $VITE_PID 2>/dev/null
    echo "Server stopped."
  else
    echo "Could not find a valid Process ID in .run.env."
  fi
  
  # Clean up the run environment file
  rm .run.env
else
  echo "No .run.env file found. Is the server running?"
fi
