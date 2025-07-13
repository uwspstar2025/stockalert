#!/bin/bash

# Google Cloud Deployment Script for Stock Tracker
# Run this script from the project root directory

echo "🚀 Starting Google Cloud deployment..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set variables
PROJECT_ID="stock-tracker-$(date +%s)"
REGION="us-central1"
BACKEND_SERVICE="stock-tracker-backend"

echo "📋 Project ID: $PROJECT_ID"

# Create and configure project
echo "🔧 Setting up Google Cloud project..."
gcloud projects create $PROJECT_ID --name="Stock Tracker App"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable appengine.googleapis.com

# Deploy backend to Cloud Run
echo "🚀 Deploying backend to Cloud Run..."
cd backend
gcloud run deploy $BACKEND_SERVICE \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --port 3000

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region=$REGION --format='value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

# Update frontend environment
cd ../frontend
echo "🔧 Updating frontend environment..."
cat > src/environments/environment.prod.ts << EOF
export const environment = {
  production: true,
  apiUrl: '$BACKEND_URL/api',
  wsUrl: '${BACKEND_URL/https/wss}'
};
EOF

# Deploy frontend to Firebase
echo "🚀 Deploying frontend to Firebase..."
npm install -g firebase-tools
firebase login --no-localhost
firebase init hosting --project $PROJECT_ID
npm run build
firebase deploy --project $PROJECT_ID

echo "✅ Deployment complete!"
echo "🌐 Frontend URL: https://$PROJECT_ID.web.app"
echo "🔗 Backend URL: $BACKEND_URL"
