#!/bin/bash

# Camera Collection Manager - Development Server Script
# This script starts both backend and frontend servers for development

echo "🚀 Starting Camera Collection Manager Development Servers..."
echo "========================================================"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    pkill -f "node index.js" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up trap to cleanup on Ctrl+C
trap cleanup SIGINT SIGTERM

# Start backend server in background
echo "📡 Starting backend server (Node.js/Express)..."
cd server
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started on http://localhost:3000"
else
    echo "❌ Failed to start backend server"
    exit 1
fi

# Start frontend server in background
echo "🖥️  Starting frontend server (Vite/React)..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend server started (check terminal for URL)"
else
    echo "❌ Failed to start frontend server"
    cleanup
fi

echo ""
echo "🎉 Both servers are running!"
echo "📡 Backend API: http://localhost:3000/api"
echo "🖥️  Frontend: Check above for Vite URL (usually http://localhost:5173)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "========================================================"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID