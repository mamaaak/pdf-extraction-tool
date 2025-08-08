#!/bin/bash

# This script runs both frontend and backend servers for the PDF Analysis application

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Starting PDF Analysis Tool =====${NC}"
echo

# Check if .env exists in backend, create if needed
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env file...${NC}"
    echo "GROQ_API_KEY=your_groq_api_key_here" > backend/.env
    echo "NODE_ENV=development" >> backend/.env
    echo "PORT=3001" >> backend/.env
    echo -e "${RED}Please edit backend/.env and add your GROQ API key!${NC}"
else
    echo -e "${GREEN}Backend .env file exists${NC}"
fi

# Check if .env.local exists in frontend, create if needed
if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}Creating frontend/.env.local file...${NC}"
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > frontend/.env.local
else
    echo -e "${GREEN}Frontend .env.local file exists${NC}"
fi

# Start both servers
echo -e "${GREEN}Starting servers...${NC}"
echo -e "${YELLOW}Backend will run on http://localhost:3001${NC}"
echo -e "${YELLOW}Frontend will run on http://localhost:3000${NC}"
echo

# Start backend server
cd backend
PORT=3001 npm run dev &
BACKEND_PID=$!
cd ..

# Start frontend server
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo
echo -e "${GREEN}Servers are running!${NC}"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001/api"
echo
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Function to cleanup on exit
cleanup() {
    echo
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID
    kill $FRONTEND_PID
    echo -e "${GREEN}Servers stopped.${NC}"
    exit 0
}

# Register the cleanup function for when script receives SIGINT
trap cleanup SIGINT

# Keep the script running
while true; do
    sleep 1
done