#!/bin/bash

# 🎯 Square Development Setup Script 🎯
# This script helps you configure Square for local development

echo "🎯 Square Development Configuration Setup"
echo "========================================"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ Found existing .env file"
    echo "📝 Current Square configuration:"
    grep -E "SQUARE_|DATABASE_URL|NODE_ENV" .env 2>/dev/null || echo "   No Square variables found"
else
    echo "📝 Creating new .env file..."
    cat > .env << 'EOF'
# YOLOVibe Local Development Environment
DATABASE_URL="file:local.db"
NODE_ENV="development"
APP_URL="http://localhost:4321"
JWT_SECRET="local-development-secret-key-change-in-production"
ADMIN_EMAIL="admin@localhost"

# Square Sandbox Configuration (REPLACE WITH YOUR VALUES)
SQUARE_APPLICATION_ID="sandbox-sq0idb-REPLACE-WITH-YOUR-APP-ID"
SQUARE_ACCESS_TOKEN="sandbox-sq0atb-REPLACE-WITH-YOUR-ACCESS-TOKEN"
SQUARE_ENVIRONMENT="sandbox"

# Optional: Email service (for testing)
# SENDGRID_API_KEY="your-sendgrid-api-key"
# SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
# SENDGRID_FROM_NAME="YOLOVibe Team"
EOF
    echo "✅ Created .env file with template values"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Go to: https://developer.squareup.com/"
echo "2. Sign up/login and create an application"
echo "3. Get your Sandbox credentials:"
echo "   - Application ID (starts with 'sandbox-sq0idb-')"
echo "   - Access Token (starts with 'sandbox-sq0atb-')"
echo "4. Edit the .env file and replace the placeholder values"
echo "5. Restart your dev server: npm run dev"
echo ""
echo "🧪 Test with: npm run safety-check"
echo ""

# Make the script executable
chmod +x setup-square-dev.sh