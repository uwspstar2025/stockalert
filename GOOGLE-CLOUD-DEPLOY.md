# Google Cloud Deployment Guide

## Quick Start (One Command)

```bash
./deploy-gcp.sh
```

## Manual Step-by-Step

### 1. Install Google Cloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash

# Windows
# Download from https://cloud.google.com/sdk/docs/install
```

### 2. Setup Project

```bash
# Login and create project
gcloud auth login
gcloud projects create stock-tracker-$(date +%s)
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

### 3. Deploy Backend (Cloud Run)

```bash
cd backend
gcloud run deploy stock-tracker-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 4. Deploy Frontend (Firebase)

```bash
cd frontend
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### 5. Alternative: App Engine

```bash
# Backend
cd backend
gcloud app deploy

# Frontend  
cd frontend
npm run build
gcloud app deploy
```

## Cost Estimates (Free Tier)

- **Cloud Run**: Free up to 2M requests/month
- **Firebase Hosting**: Free up to 10GB storage
- **App Engine**: Free up to 28 hours/day

## Troubleshooting

- **Authentication**: Run `gcloud auth login`
- **Permissions**: Enable billing (required for some APIs)
- **Regions**: Use `us-central1` for free tier
- **Build Issues**: Check `cloudbuild.yaml` syntax
