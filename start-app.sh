#!/bin/bash

# Start script for the PDF Analysis application
# This script installs dependencies and starts both frontend and backend servers

echo "===== PDF Analysis Tool Setup ====="
echo

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists in backend, if not, create it
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env file...${NC}"
    echo "GROQ_API_KEY=your_groq_api_key_here" > backend/.env
    echo "NODE_ENV=development" >> backend/.env
    echo -e "${YELLOW}Please edit backend/.env and add your GROQ API key!${NC}"
fi

# Install backend dependencies
echo -e "${GREEN}Installing backend dependencies...${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install backend dependencies. Please check for errors.${NC}"
    exit 1
fi

# Install frontend dependencies
echo -e "${GREEN}Installing frontend dependencies...${NC}"
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install frontend dependencies. Please check for errors.${NC}"
    echo -e "${YELLOW}Attempting to fix by deleting node_modules and package-lock.json...${NC}"
    rm -rf node_modules package-lock.json
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Still unable to install frontend dependencies. Please check for errors.${NC}"
        exit 1
    fi
fi

# Create or update .env.local for frontend
if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}Creating frontend/.env.local file...${NC}"
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > frontend/.env.local
fi

# Start both servers
echo -e "${GREEN}Starting servers...${NC}"
echo -e "${YELLOW}Backend will run on http://localhost:3001${NC}"
echo -e "${YELLOW}Frontend will run on http://localhost:3000${NC}"
echo

# Open terminals and start servers
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd '$PWD'/backend && npm run dev"'
    osascript -e 'tell app "Terminal" to do script "cd '$PWD'/frontend && npm run dev"'
else
    # Linux/Windows
    echo "Please open two terminal windows and run:"
    echo -e "${GREEN}Terminal 1:${NC} cd $PWD/backend && npm run dev"
    echo -e "${GREEN}Terminal 2:${NC} cd $PWD/frontend && npm run dev"
fi

echo
echo -e "${GREEN}Setup complete!${NC}"
echo "Once both servers are running:"
echo "- Access the frontend at: http://localhost:3000"
echo "- Backend API is available at: http://localhost:3001/api"
echo
echo -e "${YELLOW}NOTE: Make sure you've added your GROQ API key to backend/.env${NC}"