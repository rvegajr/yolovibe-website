#!/bin/bash
# Test Production Environment Integrations

echo "🚀 Testing Production Environment Integrations"
echo "=============================================="
echo "⚠️  WARNING: This will test PRODUCTION credentials!"
echo ""
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Test cancelled."
    exit 0
fi

# Create temporary .env.prod file with production variables
cat > .env.prod << EOF
NODE_ENV=production
SQUARE_ENVIRONMENT=production
***REMOVED***=\${SQUARE_PRODUCTION_TOKEN}
SENDGRID_API_KEY=\${SENDGRID_API_KEY}
SENDGRID_FROM_EMAIL=contact@yolovibecodebootcamp.com
SENDGRID_FROM_NAME=YOLOVibeCode
EOF

# Add other environment variables if they exist in current .env
if [ -f .env ]; then
    grep -E "^(GOOGLE_|***REMOVED***|TURSO_|SQUARE_LOCATION_ID)" .env >> .env.prod 2>/dev/null || true
fi

# Run the test with production environment
ENV_FILE=.env.prod npx tsx scripts/test-all-integrations.ts

# Clean up
rm -f .env.prod

echo ""
echo "Production environment test complete!"