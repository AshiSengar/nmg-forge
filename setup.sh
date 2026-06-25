#!/usr/bin/env bash
# NMG Forge Kanban — Full Setup Script
# Installs all dependencies and seeds the database

set -e

echo ""
echo "⚡ NMG Forge Kanban — Setup"
echo "================================"

# Check prerequisites
command -v php >/dev/null 2>&1 || { echo "❌ PHP 8.2+ is required. Install it first."; exit 1; }
command -v composer >/dev/null 2>&1 || { echo "❌ Composer is required. Install it first."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js 18+ is required. Install it first."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required. Install it first."; exit 1; }

echo "✅ Prerequisites check passed"

# Backend setup
echo ""
echo "📦 Setting up Laravel backend..."
cd backend

if [ ! -f "vendor/autoload.php" ]; then
  composer install --no-interaction --prefer-dist
fi

if [ ! -f ".env" ]; then
  cp .env.example .env
  php artisan key:generate
fi

touch database/database.sqlite

php artisan migrate:fresh --seed --force

echo "✅ Backend ready"

# Frontend setup
echo ""
echo "📦 Setting up React frontend..."
cd ../frontend

npm install

echo "✅ Frontend ready"

cd ..
echo ""
echo "🚀 Setup complete!"
echo ""
echo "To start the app:"
echo "  Terminal 1: cd backend && php artisan serve --port=8000"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
