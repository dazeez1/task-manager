# 🚀 Task Manager API - Render Deployment Guide

This guide will help you deploy **only the backend API** to Render, keeping your frontend separate.

## 🎯 **What We're Deploying**

- ✅ **Backend API Only** (Node.js + Express)
- ✅ **Authentication Endpoints** (`/api/auth/*`)
- ✅ **Task Management Endpoints** (`/api/tasks/*`)
- ✅ **Health Monitoring** (`/health`)
- ❌ **Frontend Files** (serve separately)

## 📋 **Prerequisites**

- ✅ GitHub repository with your Task Manager code
- ✅ Render account (free tier available)
- ✅ Frontend hosting solution (GitHub Pages, Netlify, Vercel, etc.)

## 🌐 **Deploy Backend to Render**

### Step 1: Deploy API to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Select your `task-manager` repository**
5. **Render will auto-detect `render.yaml`**
6. **Click "Create Web Service"**

### Step 2: Wait for Deployment

- **Build Time**: 2-5 minutes
- **Status**: Will show "Live" when ready
- **URL**: `https://your-service-name.onrender.com`

### Step 3: Test Your API

```bash
# Health check
curl https://your-service-name.onrender.com/health

# API info
curl https://your-service-name.onrender.com/

# Test authentication
curl -X POST https://your-service-name.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","emailAddress":"test@example.com","password":"password123"}'
```

## 🔧 **Configuration Details**

### render.yaml (Auto-configured)

```yaml
services:
  - type: web
    name: task-manager-api
    env: node
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: SESSION_SECRET
        generateValue: true
      - key: CORS_ORIGIN
        value: "*"
    healthCheckPath: /health
    autoDeploy: true
```

### Environment Variables (Auto-set)

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Render requirement |
| `SESSION_SECRET` | Auto-generated | Secure session key |
| `CORS_ORIGIN` | `*` | Allow all origins |

## 📱 **Frontend Configuration**

### Update Your Frontend

Since you're hosting the frontend separately, update your frontend to point to the Render API:

```javascript
// In your frontend script.js
const API_BASE_URL = 'https://your-service-name.onrender.com/api';

// Or use environment detection
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://your-service-name.onrender.com/api';
```

### Frontend Hosting Options

1. **GitHub Pages** (Free)
   - Push frontend files to `gh-pages` branch
   - URL: `https://username.github.io/repository-name`

2. **Netlify** (Free)
   - Drag & drop frontend folder
   - URL: `https://random-name.netlify.app`

3. **Vercel** (Free)
   - Connect GitHub repository
   - Auto-deploy frontend

4. **Local Development**
   - Use `live-server` or similar
   - Point to Render API

## 🧪 **Testing Your Deployment**

### 1. API Health Check
```bash
curl https://your-service-name.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-08-26T23:45:00.000Z",
  "environment": "production",
  "service": "Task Manager API",
  "version": "2.0.0"
}
```

### 2. API Information
```bash
curl https://your-service-name.onrender.com/
```

**Expected Response:**
```json
{
  "message": "Task Manager API",
  "version": "2.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "tasks": "/api/tasks",
    "health": "/health"
  },
  "documentation": "https://github.com/dazeez1/task-manager"
}
```

### 3. Test Authentication
```bash
# Signup
curl -X POST https://your-service-name.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","emailAddress":"test@example.com","password":"password123"}'

# Login
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailAddress":"test@example.com","password":"password123"}'
```

## 🔒 **Security Features**

### Production Security
- ✅ **Secure Cookies**: HTTPS-only in production
- ✅ **Session Security**: HttpOnly, secure flags
- ✅ **CORS**: Configurable origins
- ✅ **Environment Variables**: Secure configuration

### CORS Configuration
- **Development**: Restricted to localhost
- **Production**: Configurable via `CORS_ORIGIN`
- **Current Setting**: `*` (allow all origins)

## 📊 **Monitoring & Maintenance**

### Render Dashboard Features
- ✅ **Build Logs**: View deployment logs
- ✅ **Runtime Logs**: Monitor application logs
- ✅ **Metrics**: CPU, memory usage
- ✅ **Health Checks**: Automatic monitoring
- ✅ **Auto-scaling**: Available on paid plans

### Health Monitoring
- **`/health`**: Basic health check
- **`/api/auth/me`**: Authentication health check

## 🔄 **Continuous Deployment**

### Auto-Deploy Setup
1. **Push to GitHub**: Any push to `main` branch
2. **Render Detection**: Automatically detects changes
3. **Build Process**: Runs `npm install` and `npm start`
4. **Deployment**: New version goes live automatically

### Manual Deploy
- Go to Render Dashboard
- Click **"Manual Deploy"**
- Select branch/commit
- Click **"Deploy"**

## 💰 **Cost: FREE!**

- **Free Tier**: 750 hours/month
- **Auto-sleep**: After 15 minutes of inactivity
- **SSL Certificate**: Included
- **Custom Domains**: Available on paid plans

## 🚨 **Common Issues & Solutions**

### Issue 1: CORS Errors
**Problem**: Frontend can't connect to API
**Solution**: 
- Verify `CORS_ORIGIN` is set to `*` or your frontend domain
- Check browser console for specific CORS errors

### Issue 2: Session Not Persisting
**Problem**: Users logged out after page refresh
**Solution**: 
- Ensure `SESSION_SECRET` is set
- Check cookie settings in production
- Verify frontend and API are on compatible domains

### Issue 3: Build Fails
**Problem**: `npm install` fails during build
**Solution**: 
- Check Node.js version in `package.json` engines
- Ensure all dependencies are in `dependencies`

## 🎯 **Next Steps**

### After Successful API Deployment:

1. **Test All API Endpoints** using Postman or curl
2. **Deploy Frontend** to your chosen hosting service
3. **Update Frontend API URL** to point to Render
4. **Test Full Application** from frontend to backend
5. **Share Your App** with the world!

### Frontend Deployment Commands

```bash
# GitHub Pages (if using gh-pages branch)
git checkout gh-pages
git merge main
git push origin gh-pages

# Or use GitHub Actions for auto-deploy
# Create .github/workflows/deploy.yml
```

## 📞 **Support & Resources**

- **Render Documentation**: [docs.render.com](https://docs.render.com/)
- **Render Community**: [community.render.com](https://community.render.com/)
- **GitHub Repository**: [Your Repository](https://github.com/dazeez1/task-manager)
- **Postman Collection**: Use the included collection for testing

---

## 🎉 **Congratulations!**

Your Task Manager API is now live on Render and ready to serve your frontend!

**API URL**: `https://your-service-name.onrender.com`
**API Base**: `https://your-service-name.onrender.com/api`
**Health Check**: `https://your-service-name.onrender.com/health`

**Next**: Deploy your frontend and connect it to this API! 🚀
