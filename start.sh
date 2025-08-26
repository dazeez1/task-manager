#!/bin/bash

echo "🚀 Starting Task Manager Application..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Install backend dependencies if not already installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

echo ""

# Start the backend server
echo "🔧 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for the server to start
sleep 3

# Check if server started successfully
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Backend server started successfully on http://localhost:3000"
else
    echo "❌ Failed to start backend server"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Task Manager is now running!"
echo ""
echo "📱 Access the application:"
echo "   • Main Application: http://localhost:3000"
echo "   • Login Page: http://localhost:3000"
echo "   • Dashboard: http://localhost:3000/dashboard"
echo ""
echo "🔧 API Endpoints:"
echo "   • Authentication: http://localhost:3000/api/auth"
echo "   • Tasks: http://localhost:3000/api/tasks"
echo ""
echo "💡 To stop the server, press Ctrl+C"
echo ""

# Wait for user to stop the server
trap "echo ''; echo '🛑 Stopping server...'; kill $BACKEND_PID 2>/dev/null; echo '✅ Server stopped'; exit 0" INT

# Keep the script running
wait $BACKEND_PID
