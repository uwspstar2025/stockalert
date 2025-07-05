# Google Cloud Free Tier Deployment Guide

## 🌟 **Free Tier Resources Used**
- **Cloud Run**: 2M requests/month, 180K vCPU-seconds/month
- **Cloud Build**: 120 build minutes/day
- **Container Registry**: 0.5 GB storage
- **Egress**: 1 GB/month to North America

## 📋 **Prerequisites**

### 1. **Google Cloud Account**
- Sign up at [cloud.google.com](https://cloud.google.com)
- New users get $300 credit for 90 days
- Free tier continues after credits expire

### 2. **Install Google Cloud SDK**
```bash
# macOS (using Homebrew)
brew install --cask google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# Download installer from: https://cloud.google.com/sdk/docs/install
```

### 3. **Create Google Cloud Project**
```bash
# Login to Google Cloud
gcloud auth login

# Create new project
gcloud projects create stockalert-app-[RANDOM] --name="Stock Alert App"

# Set as default project
gcloud config set project stockalert-app-[RANDOM]

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
```

## 🚀 **Deployment Steps**

### **Option 1: Automated Deployment (Recommended)**
```bash
# Navigate to your project directory
cd /Users/xingwang/Desktop/stockalert

# Run the deployment script
./deploy.sh
```

### **Option 2: Manual Deployment**

#### **Step 1: Enable APIs**
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

#### **Step 2: Build Images**
```bash
# Build backend
gcloud builds submit --tag gcr.io/[PROJECT_ID]/stockalert-backend ./backend

# Build frontend
gcloud builds submit --tag gcr.io/[PROJECT_ID]/stockalert-frontend ./frontend
```

#### **Step 3: Deploy to Cloud Run**
```bash
# Deploy backend
gcloud run deploy stockalert-backend \
  --image gcr.io/[PROJECT_ID]/stockalert-backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars NODE_ENV=production,PORT=8080

# Deploy frontend
gcloud run deploy stockalert-frontend \
  --image gcr.io/[PROJECT_ID]/stockalert-frontend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi
```

## 🔧 **Configuration**

### **Environment Variables**
The application is configured to work in production with:
- Backend port: 8080 (Cloud Run requirement)
- Frontend: Nginx serving static files
- WebSocket: Will work over HTTPS in production

### **Custom Domain (Optional)**
```bash
# Map custom domain
gcloud run domain-mappings create \
  --service stockalert-frontend \
  --domain your-domain.com \
  --region us-central1
```

## 💰 **Cost Estimation (Free Tier)**

### **Within Free Limits:**
- **Cloud Run**: Up to 2M requests/month
- **Storage**: Up to 0.5 GB for images
- **Build Time**: Up to 120 minutes/day
- **Network**: 1 GB egress/month

### **Typical Usage:**
- Small app: ~$0-5/month (usually free)
- Medium usage: ~$5-20/month
- High traffic: ~$20-50/month

## 🔍 **Monitoring & Management**

### **View Logs**
```bash
# Backend logs
gcloud run logs tail stockalert-backend --region us-central1

# Frontend logs
gcloud run logs tail stockalert-frontend --region us-central1
```

### **Check Status**
```bash
# List services
gcloud run services list

# Get service details
gcloud run services describe stockalert-backend --region us-central1
```

### **Update Deployment**
```bash
# Redeploy after changes
gcloud builds submit --config=cloudbuild.yaml .
```

## 🛡️ **Security & Best Practices**

### **Production Checklist:**
- ✅ HTTPS enabled (automatic with Cloud Run)
- ✅ Environment variables for secrets
- ✅ Resource limits configured
- ✅ Health checks enabled
- ✅ Minimal container images

### **Additional Security:**
```bash
# Restrict access to specific users
gcloud run services add-iam-policy-binding stockalert-frontend \
  --member="user:youremail@gmail.com" \
  --role="roles/run.invoker"
```

## 📊 **Scaling Configuration**

### **Auto-scaling Settings:**
- **Min instances**: 0 (cost-effective)
- **Max instances**: 10 (backend), 5 (frontend)
- **CPU**: 1 vCPU per instance
- **Memory**: 512Mi (backend), 256Mi (frontend)
- **Timeout**: 300 seconds

## 🔄 **CI/CD Pipeline**

### **GitHub Actions Integration:**
1. Store `GOOGLE_APPLICATION_CREDENTIALS` in GitHub Secrets
2. Use the provided `cloudbuild.yaml` for automatic deployment
3. Deploy on every push to main branch

## 🆘 **Troubleshooting**

### **Common Issues:**
1. **Build fails**: Check Dockerfile syntax
2. **Service not accessible**: Verify `--allow-unauthenticated` flag
3. **High costs**: Monitor usage in Cloud Console
4. **Timeout errors**: Increase timeout or optimize code

### **Useful Commands:**
```bash
# Reset deployment
gcloud run services delete stockalert-backend --region us-central1
gcloud run services delete stockalert-frontend --region us-central1

# Check quotas
gcloud compute project-info describe --project [PROJECT_ID]
```

## 🎯 **Next Steps**

1. **Custom Domain**: Configure your own domain
2. **Database**: Add Cloud Firestore for persistent data
3. **CDN**: Use Cloud CDN for better performance
4. **Monitoring**: Set up Cloud Monitoring alerts
5. **Backup**: Implement automated backups

---

**🎉 Your Stock Alert app will be live on Google Cloud for free!**
