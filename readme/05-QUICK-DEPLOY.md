# 🚀 Quick Google Cloud Deployment Guide

## 📋 **Prerequisites (5 minutes)**

1. **Google Cloud Account** (free): [cloud.google.com](https://cloud.google.com)
2. **Install Google Cloud SDK**:
   ```bash
   # macOS
   brew install --cask google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

## 🚀 **Deploy in 3 Steps (10 minutes)**

### **Step 1: Setup**
```bash
# Login to Google Cloud
gcloud auth login

# Create project (replace RANDOM with 4-6 random characters)
gcloud projects create stockalert-app-RANDOM --name="Stock Alert App"
gcloud config set project stockalert-app-RANDOM

# Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
```

### **Step 2: Deploy**
```bash
# Navigate to your project
cd /Users/xingwang/Desktop/stockalert

# Run automated deployment
./deploy.sh
```

### **Step 3: Access Your App**
Your app will be live at the URLs shown after deployment!

## 💰 **Free Tier Limits**
- ✅ **2M requests/month** (plenty for personal use)
- ✅ **180K vCPU-seconds/month** 
- ✅ **1 GB network egress/month**
- ✅ **0.5 GB container storage**

## 🔄 **Update Your App**
```bash
# After making code changes
./deploy.sh
```

## 📊 **Monitor Usage**
Visit [Google Cloud Console](https://console.cloud.google.com) to:
- View logs and metrics
- Monitor costs (should be $0 within free tier)
- Manage services

---

**🎉 Your Stock Alert app will be live on Google Cloud in ~10 minutes!**

**Free hosting for up to 2M requests per month! 🆓**
