#!/bin/bash

# Quick deployment verification script

echo "🔍 Checking deployment status..."

PROJECT_ID=$(gcloud config get-value project)
echo "Project: $PROJECT_ID"

echo ""
echo "📊 Backend Service Status:"
gcloud run services describe stockalert-backend --region=us-central1 --format="table(metadata.name,status.url,status.conditions[0].type)"

echo ""
echo "📱 Frontend Service Status:"
gcloud run services describe stockalert-frontend --region=us-central1 --format="table(metadata.name,status.url,status.conditions[0].type)"

echo ""
echo "🌐 Service URLs:"
echo "Backend: $(gcloud run services describe stockalert-backend --region=us-central1 --format='value(status.url)')"
echo "Frontend: $(gcloud run services describe stockalert-frontend --region=us-central1 --format='value(status.url)')"
