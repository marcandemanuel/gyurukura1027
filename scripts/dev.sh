#!/bin/bash
# Development startup script for Unix/Linux/Mac

echo "Starting LOTR Marathon App Development Environment..."

# Start Flask backend in background
echo "Starting Flask backend on port 2020..."
python app.py &
FLASK_PID=$!

# Wait a moment for Flask to start
sleep 3

# Start Vite frontend
echo "Starting Vite frontend on port 2006..."
npm run dev

# Cleanup function
cleanup() {
    echo "Shutting down servers..."
    kill $FLASK_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM
