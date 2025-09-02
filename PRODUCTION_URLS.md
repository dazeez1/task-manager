# 🌐 Task Manager - Production URLs

## 🚀 **Live Application URLs**

### **Frontend (Vercel)**
- **Main Application**: [https://task-manager-rho-virid.vercel.app/](https://task-manager-rho-virid.vercel.app/)
- **Dashboard**: [https://task-manager-rho-virid.vercel.app/dashboard](https://task-manager-rho-virid.vercel.app/dashboard)

### **Backend API (Render)**
- **API Base**: [https://task-manager-2ejf.onrender.com](https://task-manager-2ejf.onrender.com)
- **API Documentation**: [https://task-manager-2ejf.onrender.com/](https://task-manager-2ejf.onrender.com/)
- **Health Check**: [https://task-manager-2ejf.onrender.com/health](https://task-manager-2ejf.onrender.com/health)

## 🔗 **API Endpoints**

### **Authentication**
- **Signup**: `POST https://task-manager-2ejf.onrender.com/api/auth/signup`
- **Login**: `POST https://task-manager-2ejf.onrender.com/api/auth/login`
- **Logout**: `POST https://task-manager-2ejf.onrender.com/api/auth/logout`
- **Get User**: `GET https://task-manager-2ejf.onrender.com/api/auth/me`

### **Task Management**
- **Get All Tasks**: `GET https://task-manager-2ejf.onrender.com/api/tasks`
- **Create Task**: `POST https://task-manager-2ejf.onrender.com/api/tasks`
- **Get Task**: `GET https://task-manager-2ejf.onrender.com/api/tasks/:taskId`
- **Update Task**: `PUT https://task-manager-2ejf.onrender.com/api/tasks/:taskId`
- **Toggle Task**: `PATCH https://task-manager-2ejf.onrender.com/api/tasks/:taskId/toggle`
- **Delete Task**: `DELETE https://task-manager-2ejf.onrender.com/api/tasks/:taskId`

## 🧪 **Testing Commands**

### **Health Check**
```bash
curl https://task-manager-2ejf.onrender.com/health
```

### **API Info**
```bash
curl https://task-manager-2ejf.onrender.com/
```

### **Test Signup**
```bash
curl -X POST https://task-manager-2ejf.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","emailAddress":"test@example.com","password":"password123"}'
```

### **Test Login**
```bash
curl -X POST https://task-manager-2ejf.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailAddress":"test@example.com","password":"password123"}'
```

## 📱 **Frontend Integration**

### **API Base URL in Frontend**
```javascript
const API_BASE_URL = 'https://task-manager-2ejf.onrender.com/api';
```

### **Environment Detection**
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://task-manager-2ejf.onrender.com/api';
```

## 🔒 **Security Configuration**

### **CORS Settings**
- **Development**: `localhost:3000`, `localhost:5500`, etc.
- **Production**: `https://task-manager-rho-virid.vercel.app`

### **Session Configuration**
- **Secure Cookies**: Enabled in production
- **HTTPS Only**: Required for production
- **SameSite**: `none` for cross-origin requests

## 📊 **Monitoring**

### **Health Endpoints**
- **API Health**: [https://task-manager-2ejf.onrender.com/health](https://task-manager-2ejf.onrender.com/health)
- **Frontend Health**: [https://task-manager-rho-virid.vercel.app/](https://task-manager-rho-virid.vercel.app/)

### **Render Dashboard**
- **Backend Service**: [Render Dashboard](https://dashboard.render.com/)
- **Service Name**: `task-manager-api`

### **Vercel Dashboard**
- **Frontend Service**: [Vercel Dashboard](https://vercel.com/dashboard)
- **Project**: `task-manager-rho-virid`

## 🎯 **Quick Links**

| Purpose | URL |
|---------|-----|
| **Use the App** | [https://task-manager-rho-virid.vercel.app/](https://task-manager-rho-virid.vercel.app/) |
| **API Documentation** | [https://task-manager-2ejf.onrender.com/](https://task-manager-2ejf.onrender.com/) |
| **Health Check** | [https://task-manager-2ejf.onrender.com/health](https://task-manager-2ejf.onrender.com/health) |
| **GitHub Repository** | [https://github.com/dazeez1/task-manager](https://github.com/dazeez1/task-manager) |

---

**🎉 Your Task Manager is live and accessible worldwide!**

**Frontend**: [https://task-manager-rho-virid.vercel.app](https://task-manager-rho-virid.vercel.app)
**API**: [https://task-manager-2ejf.onrender.com](https://task-manager-2ejf.onrender.com)

**Share your app with the world!** 🌍✨
