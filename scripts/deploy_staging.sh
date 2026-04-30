#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Deploy to Staging Environment
# Usage: ./scripts/deploy_staging.sh
# ═══════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting Staging Deployment..."
echo "Project Root: $PROJECT_ROOT"

# ─── Step 1: Check Prerequisites ────────────────────────────────────
echo ""
echo "📋 Step 1: Checking Prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# ─── Step 2: Load Environment Variables ────────────────────────────
echo ""
echo "🔧 Step 2: Loading Environment Variables..."

if [ ! -f "$PROJECT_ROOT/.env.staging" ]; then
    echo "⚠️  .env.staging not found. Creating from template..."
    cp "$PROJECT_ROOT/.env.staging" "$PROJECT_ROOT/.env.staging.local"
    echo "📝 Edit .env.staging.local with your values"
fi

export $(cat "$PROJECT_ROOT/.env.staging" | grep -v '^#' | xargs)
echo "✅ Environment variables loaded"

# ─── Step 3: Stop Running Containers (if any) ───────────────────────
echo ""
echo "🛑 Step 3: Stopping existing containers..."

cd "$PROJECT_ROOT"
docker-compose -f docker-compose.staging.yml down --remove-orphans 2>/dev/null || true

echo "✅ Containers stopped"

# ─── Step 4: Build Docker Images ────────────────────────────────────
echo ""
echo "🏗️  Step 4: Building Docker Images..."

docker-compose -f docker-compose.staging.yml build --no-cache

echo "✅ Docker images built"

# ─── Step 5: Start Services ─────────────────────────────────────────
echo ""
echo "▶️  Step 5: Starting Services..."

docker-compose -f docker-compose.staging.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 15

# Check PostgreSQL
echo "Checking PostgreSQL..."
until docker-compose -f docker-compose.staging.yml exec -T postgres pg_isready -U matchoracle > /dev/null 2>&1; do
    echo "  Waiting for PostgreSQL..."
    sleep 5
done
echo "✅ PostgreSQL is ready"

# Check Redis
echo "Checking Redis..."
until docker-compose -f docker-compose.staging.yml exec -T redis redis-cli ping > /dev/null 2>&1; do
    echo "  Waiting for Redis..."
    sleep 5
done
echo "✅ Redis is ready"

# Check Backend
echo "Checking Backend API..."
until curl -f http://localhost:8000/api/v1/metrics/health-check > /dev/null 2>&1; do
    echo "  Waiting for Backend API..."
    sleep 5
done
echo "✅ Backend API is ready"

# ─── Step 6: Run Database Migrations ────────────────────────────────
echo ""
echo "🗄️  Step 6: Running Database Migrations..."

# Run Alembic migrations
docker-compose -f docker-compose.staging.yml exec -T backend \
    alembic upgrade head

echo "✅ Database migrations completed"

# ─── Step 7: Seed Database ──────────────────────────────────────────
echo ""
echo "🌱 Step 7: Seeding Database..."

docker-compose -f docker-compose.staging.yml exec -T backend \
    python scripts/seed_database.py --leagues bundesliga,bundesliga2 --env staging

echo "✅ Database seeded"

# ─── Step 8: Health Checks ──────────────────────────────────────────
echo ""
echo "🏥 Step 8: Running Health Checks..."

# Check API health
API_HEALTH=$(curl -s http://localhost:8000/api/v1/metrics/health-check)
echo "Backend Health: $API_HEALTH"

# Test Authentication Endpoint
echo "Testing /auth/register endpoint..."
REGISTER_TEST=$(curl -s -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staging-test@example.com",
    "password": "StagingTest123!",
    "username": "stagingtest"
  }' | jq -r '.email // .detail' 2>/dev/null)

if [ "$REGISTER_TEST" == "staging-test@example.com" ] || [ "$REGISTER_TEST" == "User already registered" ]; then
    echo "✅ Authentication endpoints working"
else
    echo "⚠️  Auth endpoint returned: $REGISTER_TEST"
fi

# Test Metrics Endpoint
echo "Testing /metrics/health-check endpoint..."
METRICS_TEST=$(curl -s http://localhost:8000/api/v1/metrics/health-check | jq -r '.status' 2>/dev/null)

if [ "$METRICS_TEST" == "healthy" ]; then
    echo "✅ Metrics endpoints working"
else
    echo "⚠️  Metrics endpoint returned: $METRICS_TEST"
fi

# ─── Step 9: Display Service Info ───────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ STAGING DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📍 Service URLs:"
echo "   API Backend:    http://localhost:8000"
echo "   API Docs:       http://localhost:8000/docs"
echo "   PostgreSQL:     localhost:5433"
echo "   Redis:          localhost:6380"
echo ""
echo "🔑 Database Credentials:"
echo "   User: matchoracle"
echo "   Password: (from .env.staging)"
echo "   Database: matchoracle_staging"
echo ""
echo "📊 Available Endpoints:"
echo "   GET  /api/v1/metrics/health-check"
echo "   GET  /api/v1/metrics/dashboard"
echo "   POST /api/v1/auth/register"
echo "   POST /api/v1/auth/login"
echo "   GET  /api/v1/weekend/next"
echo "   GET  /api/v1/alerts/feed"
echo ""
echo "🛠️  Useful Commands:"
echo "   View logs:       docker-compose -f docker-compose.staging.yml logs -f backend"
echo "   Stop services:   docker-compose -f docker-compose.staging.yml down"
echo "   Run tests:       docker-compose -f docker-compose.staging.yml exec backend pytest"
echo "   Shell access:    docker-compose -f docker-compose.staging.yml exec backend bash"
echo ""
echo "═══════════════════════════════════════════════════════════════"
