#!/bin/bash

# Google Cloud Deployment Script for Stock Alert App
# This script deploys the application to Google Cloud using the free tier

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Google Cloud Deployment${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK not found. Please install it first.${NC}"
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  Please login to Google Cloud first${NC}"
    gcloud auth login
fi

# Set project (user will be prompted to select)
echo -e "${YELLOW}📋 Please select your Google Cloud project:${NC}"
gcloud config set project $(gcloud projects list --format="value(projectId)" | head -1)

PROJECT_ID=$(gcloud config get-value project)
echo -e "${GREEN}✅ Using project: ${PROJECT_ID}${NC}"

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and deploy using Cloud Build
echo -e "${YELLOW}🏗️  Building and deploying application...${NC}"
gcloud builds submit --config=cloudbuild.yaml .

# Get service URLs
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo -e "${GREEN}📱 Frontend URL:${NC}"
gcloud run services describe stockalert-frontend --region=us-central1 --format="value(status.url)"
echo ""
echo -e "${GREEN}🔧 Backend URL:${NC}"
gcloud run services describe stockalert-backend --region=us-central1 --format="value(status.url)"
echo ""
echo -e "${YELLOW}💡 Note: It may take a few minutes for the services to be fully available.${NC}"
