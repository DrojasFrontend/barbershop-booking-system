#!/bin/bash

echo "🚀 Starting Railway deployment setup..."

# Push database schema
echo "📊 Pushing database schema..."
npx prisma db push

# Run setup script
echo "⚙️ Running setup script..."
node scripts/railway-setup.js

echo "✅ Deployment setup completed!"