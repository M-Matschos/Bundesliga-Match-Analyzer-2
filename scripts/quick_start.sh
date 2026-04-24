#!/bin/bash
# Quick Start Script for Match Oracle

set -e

echo "🚀 Match Oracle Quick Start"
echo "=============================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites satisfied${NC}"

# Start Docker services
echo -e "\n${BLUE}🐳 Starting Docker services...${NC}"
if [ -f "docker-compose.yml" ]; then
    docker-compose up -d
    echo -e "${GREEN}✅ PostgreSQL and Redis started${NC}"
    sleep 3
else
    echo "❌ docker-compose.yml not found"
    exit 1
fi

# Setup Backend
echo -e "\n${BLUE}🐍 Setting up Backend...${NC}"

if [ ! -d "backend" ]; then
    echo "❌ backend/ directory not found"
    exit 1
fi

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip > /dev/null
pip install -r requirements.txt > /dev/null

# Run migrations
echo "Running database migrations..."
alembic upgrade head > /dev/null

# Seed database
echo "Seeding database..."
python ../scripts/seed_database.py --leagues bundesliga,bundesliga2 > /dev/null

echo -e "${GREEN}✅ Backend setup complete${NC}"

cd ..

# Setup Mobile
echo -e "\n${BLUE}📱 Setting up Mobile...${NC}"

if [ ! -d "mobile" ]; then
    echo "❌ mobile/ directory not found"
    exit 1
fi

cd mobile

# Install dependencies
echo "Installing npm dependencies..."
npm install > /dev/null 2>&1

echo -e "${GREEN}✅ Mobile setup complete${NC}"

cd ..

# Print next steps
echo -e "\n${YELLOW}🎉 Setup complete!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the API server:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload"
echo ""
echo "2. In a new terminal, start the mobile app:"
echo "   cd mobile"
echo "   npx expo start"
echo ""
echo "3. Open browser:"
echo "   API Docs: http://localhost:8000/docs"
echo "   Mobile: Press 'i' for iOS or 'a' for Android in Expo"
echo ""
echo "4. Run tests:"
echo "   cd backend"
echo "   pytest tests/ -v"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
