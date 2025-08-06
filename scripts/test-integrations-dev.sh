#!/bin/bash
# Test Development Environment Integrations

echo "🧪 Testing Development Environment Integrations"
echo "=============================================="

# Create temporary .env.dev file with development variables
cat > .env.dev << EOF
NODE_ENV=development
SQUARE_ENVIRONMENT=sandbox
SQUARE_ACCESS_TOKEN=\${SQUARE_SANDBOX_TOKEN}
SENDGRID_API_KEY=\${SENDGRID_API_KEY}
SENDGRID_FROM_EMAIL=contact@yolovibecodebootcamp.com
SENDGRID_FROM_NAME=YOLOVibeCode
EOF

# Add other environment variables if they exist in current .env
if [ -f .env ]; then
    grep -E "^(GOOGLE_|DATABASE_URL|TURSO_|SQUARE_LOCATION_ID)" .env >> .env.dev 2>/dev/null || true
fi

# Run the test with development environment
ENV_FILE=.env.dev npx tsx scripts/test-all-integrations.ts

# Clean up
rm -f .env.dev

echo ""
echo "Development environment test complete!"