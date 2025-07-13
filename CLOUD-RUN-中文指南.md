# Google Cloud Run 部署指南 (中文详解)

## 🎯 什么是 Cloud Run？

**Cloud Run** 是 Google 推出的"无服务器"容器平台，让你专注写代码，不用管服务器。

### 🔥 为什么新手应该选择 Cloud Run？

#### 1. 超级简单
```
传统部署方法:
购买服务器 → 安装操作系统 → 配置环境 → 安装数据库 → 配置防火墙 → 部署代码 → 监控维护
⏰ 需要几天时间学习

Cloud Run 部署:
写好代码 → 一条命令上传 → 完成！
⏰ 只需要5分钟
```

#### 2. 省钱到极致
- **免费额度**: 每月 200万次 请求免费
- **按需付费**: 没人访问 = 不花钱
- **自动休眠**: 无流量时自动关闭，费用为零

#### 3. 自动扩展
```
用户量少: 1个容器运行
用户量多: 自动启动更多容器
没用户: 自动关闭所有容器 (费用为零)
```

## 📊 费用对比 (个人项目)

| 部署方式 | 月费用 | 维护工作 | 适合人群 |
|---------|--------|----------|----------|
| 云服务器 | ¥50-200 | 需要维护 | 有经验开发者 |
| Cloud Run | ¥0-20 | 零维护 | **新手推荐** |
| 共享主机 | ¥30-100 | 限制很多 | 静态网站 |

## 🚀 部署你的 Stock Tracker 应用

### 第一步: 注册 Google Cloud (5分钟)

1. 访问 [cloud.google.com](https://cloud.google.com)
2. 点击"免费开始使用"
3. 用Gmail账号登录
4. 验证手机号码
5. 绑定信用卡 (不会扣费，只是验证身份)
6. **获得 $300 免费额度** (够用1-2年)

### 第二步: 安装工具 (3分钟)

#### macOS 用户:
```bash
# 安装 Google Cloud CLI
brew install google-cloud-sdk

# 安装 Firebase CLI
npm install -g firebase-tools
```

#### Windows 用户:
1. 下载 [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. 运行安装程序
3. 打开命令提示符，运行: `npm install -g firebase-tools`

### 第三步: 一键部署 (2分钟)

在你的项目目录运行:
```bash
# 自动部署脚本
./deploy-gcp.sh
```

**就这么简单！** 脚本会自动:
- 创建 Google Cloud 项目
- 部署后端到 Cloud Run
- 部署前端到 Firebase
- 配置域名和HTTPS

### 第四步: 查看结果

部署完成后，你会得到:
```
✅ 后端API: https://stock-tracker-backend-xxx-uc.a.run.app
✅ 前端网站: https://your-project.web.app
✅ 免费HTTPS证书
✅ 全球CDN加速
```

## 📱 手动部署详解 (如果自动脚本失败)

### 1. 初始化项目
```bash
# 登录Google Cloud
gcloud auth login

# 创建新项目 (项目名必须全球唯一)
gcloud projects create stock-tracker-20250713

# 设置当前项目
gcloud config set project stock-tracker-20250713
```

### 2. 启用需要的服务
```bash
# 启用 Cloud Run (运行后端)
gcloud services enable run.googleapis.com

# 启用 Cloud Build (自动构建)
gcloud services enable cloudbuild.googleapis.com
```

### 3. 部署后端
```bash
cd backend

# 一条命令部署到 Cloud Run
gcloud run deploy stock-tracker-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --max-instances 10
```

### 4. 部署前端
```bash
cd ../frontend

# 登录Firebase
firebase login

# 初始化Firebase项目
firebase init hosting

# 构建生产版本
npm run build

# 部署到Firebase
firebase deploy
```

## ⚡ Cloud Run 的神奇之处

### 自动缩放演示
```
访问量: 0人     → 容器数: 0个  → 费用: ¥0
访问量: 10人    → 容器数: 1个  → 费用: ¥0.01
访问量: 1000人  → 容器数: 10个 → 费用: ¥2
访问量: 0人     → 容器数: 0个  → 费用: ¥0 (自动回到零)
```

### 冷启动 vs 热启动
- **冷启动**: 第一次访问，需要1-3秒启动容器
- **热启动**: 后续访问，立即响应 (<100ms)

## 🛠️ 监控和管理

### 查看应用状态
```bash
# 查看 Cloud Run 服务
gcloud run services list

# 查看日志
gcloud logging read "resource.type=cloud_run_revision"

# 查看监控数据
# 访问: https://console.cloud.google.com/run
```

### 更新应用
```bash
# 更新后端
cd backend
gcloud run deploy stock-tracker-backend --source .

# 更新前端
cd frontend
npm run build
firebase deploy
```

## 💡 最佳实践

### 1. 成本优化
- 设置最大实例数: `--max-instances 10`
- 使用最小内存: `--memory 512Mi`
- 启用自动休眠 (默认开启)

### 2. 性能优化
- 使用 CDN (Firebase 自带)
- 启用 gzip 压缩
- 优化容器启动时间

### 3. 安全设置
- 启用 HTTPS (自动)
- 配置 CORS 策略
- 使用环境变量存储密钥

## ❓ 常见问题解答

### Q: 会不会很贵？
**A:** 个人项目基本免费。免费额度包括:
- 200万次请求/月
- 400,000 GB-秒计算时间
- 对于 Stock Tracker，一年费用 < ¥100

### Q: 如果应用崩溃了怎么办？
**A:** Cloud Run 自动重启。如果问题持续，会显示错误页面，你可以查看日志修复。

### Q: 可以自定义域名吗？
**A:** 可以！在 Firebase 控制台添加你的域名，Google 自动配置 HTTPS。

### Q: 数据存储在哪里？
**A:** 当前是内存存储，重启会丢失。可以升级到:
- Cloud SQL (关系数据库)
- Firestore (NoSQL 数据库)
- Cloud Storage (文件存储)

## 🎉 成功案例

使用 Cloud Run 的知名公司:
- **Spotify** - 音乐流媒体
- **WhatsApp** - 即时通讯
- **Airbnb** - 房屋租赁
- **Twitter** - 社交媒体

你的 Stock Tracker 应用将运行在与这些大公司相同的基础设施上！

## 🔗 有用链接

- [Google Cloud 免费注册](https://cloud.google.com/free)
- [Cloud Run 文档](https://cloud.google.com/run/docs)
- [Firebase 控制台](https://console.firebase.google.com)
- [成本计算器](https://cloud.google.com/products/calculator)

---

**总结: Cloud Run 让部署变得像发微信一样简单！** 🚀
