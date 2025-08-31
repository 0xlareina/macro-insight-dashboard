#!/bin/bash

# CryptoSense Dashboard - Development Start Script
set -e

echo "🚀 Starting CryptoSense Dashboard Development Environment"
echo "========================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ and try again.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

# Check backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your API keys before starting the servers${NC}"
    echo -e "${YELLOW}⚠️  Required: BINANCE_API_KEY, BINANCE_SECRET_KEY${NC}"
fi

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}📝 Creating backend .env file...${NC}"
    cp .env.example backend/.env
fi

# Function to start backend server
start_backend() {
    echo -e "${BLUE}🔧 Starting backend server...${NC}"
    cd backend
    npm run start:dev &
    BACKEND_PID=$!
    cd ..
    echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
}

# Function to start frontend server
start_frontend() {
    echo -e "${BLUE}🎨 Starting frontend development server...${NC}"
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend server started (PID: $FRONTEND_PID)${NC}"
}

# Function to cleanup processes
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up processes...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Backend server stopped${NC}"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Frontend server stopped${NC}"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start servers
echo -e "${BLUE}🚀 Starting development servers...${NC}"
start_backend
sleep 3
start_frontend

echo -e "\n${GREEN}🎉 CryptoSense Dashboard is starting up!${NC}"
echo -e "${GREEN}📊 Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}🔧 Backend API: http://localhost:3001/api/v1${NC}"
echo -e "${GREEN}📡 WebSocket: ws://localhost:3001${NC}"
echo -e "\n${YELLOW}📝 Note: Please ensure you have API keys configured in .env${NC}"
echo -e "${YELLOW}⚠️  For full functionality, you'll also need:${NC}"
echo -e "${YELLOW}   - PostgreSQL running on localhost:5432${NC}"
echo -e "${YELLOW}   - Redis running on localhost:6379${NC}"
echo -e "${YELLOW}   - InfluxDB running on localhost:8086${NC}"

echo -e "\n${BLUE}Press Ctrl+C to stop both servers${NC}"

# Wait for processes to finish
wait