#!/bin/bash

# 🚀 YOLOVibe Development Quick Start Script

echo "🎯 YOLOVibe Development Environment Setup"
echo "========================================"
echo ""

# Check if we're on develop branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "⚠️  You're on branch: $CURRENT_BRANCH"
    echo "📝 Switching to develop branch..."
    git checkout develop
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin develop

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found!"
    if [ -f ".env.example" ]; then
        echo "📝 Copying .env.example to .env..."
        cp .env.example .env
        echo "✅ Created .env file - please update with your values"
    else
        echo "❌ No .env.example found - creating basic .env..."
        cat > .env << EOF
DATABASE_URL=./local.db
NODE_ENV=development
EOF
        echo "✅ Created basic .env file"
    fi
fi

# Create local database if it doesn't exist
if [ ! -f "local.db" ]; then
    echo "🗄️  Creating local database..."
    touch local.db
fi

echo ""
echo "✅ Development environment ready!"
echo ""
echo "🚀 Starting development server..."
echo "   Local URL: http://localhost:6688"
echo "   Network: Use --host to expose"
echo ""
echo "📝 Quick Commands:"
echo "   - Create feature: git checkout -b feature/your-feature"
echo "   - Run tests: npm run test:interfaces"
echo "   - Build: npm run build"
echo ""

# Start the development server
npm run dev