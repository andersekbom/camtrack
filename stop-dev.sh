#!/bin/bash

# Camera Collection Manager - Stop Development Servers Script

echo "🛑 Stopping Camera Collection Manager Development Servers..."
echo "============================================================"

# Stop backend server
echo "📡 Stopping backend server..."
pkill -f "node index.js" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend server stopped"
else
    echo "ℹ️  No backend server was running"
fi

# Stop frontend server
echo "🖥️  Stopping frontend server..."
pkill -f "vite" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend server stopped"
else
    echo "ℹ️  No frontend server was running"
fi

echo ""
echo "✅ All development servers stopped"
echo "============================================================"