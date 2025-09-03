# 🎯 Task Manager App

A full-stack task management application built with modern best practices, featuring secure authentication, session management, and priority-based task organization.

## ✨ Features

- **🔐 Secure Authentication**: User signup/login with session management
- **📋 Task Management**: Full CRUD operations for tasks
- **🎨 Priority System**: Color-coded priorities (Low=Green, Medium=Orange, High=Red)
- **📱 Responsive Design**: Modern UI that works on all devices
- **🔒 Security**: Helmet, rate limiting, CORS protection
- **🌐 Production Ready**: Redis session storage with memory fallback

## 🏗️ Architecture

```
task-manager/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, security, CORS
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Data and session management
│   │   └── server.js       # Main server file
│   ├── config/             # Environment configuration
│   ├── data/               # File-based storage
│   └── package.json        # Dependencies
├── frontend/               # HTML/CSS/JavaScript
│   ├── css/                # Styling
│   ├── js/                 # Frontend logic
│   └── index.html          # Login/signup page
└── README.md               # This file
```

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your configuration
npm start
```

### Frontend Setup
```bash
cd frontend
# Open index.html in your browser
# Or serve with a local server
python -m http.server 8000
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

## 🎨 Priority System

- **🟢 Low Priority**: Green background, easy to spot
- **🟡 Medium Priority**: Orange background, moderate attention
- **🔴 High Priority**: Red background, immediate attention needed

## 🔒 Security Features

- **Session Management**: Secure cookie-based sessions
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **Password Hashing**: Bcrypt with configurable rounds

## 🌍 Environment Configuration

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-super-secret-key
FRONTEND_URL=http://localhost:3000
PRODUCTION_FRONTEND_URL=https://your-frontend-domain.com
```

## 📦 Dependencies

### Backend
- Express.js - Web framework
- express-session - Session management
- bcryptjs - Password hashing
- helmet - Security headers
- express-rate-limit - Rate limiting
- cors - Cross-origin resource sharing

### Frontend
- Vanilla JavaScript (ES6+)
- Modern CSS with Flexbox/Grid
- Font Awesome icons
- Google Fonts (Inter)

## 🚀 Deployment

### Backend (Render/Heroku)
1. Push to GitHub
2. Connect to Render/Heroku
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push to GitHub
2. Connect to Vercel/Netlify
3. Deploy automatically

## 🧪 Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:3000/

# User signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","emailAddress":"john@example.com","password":"password123"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

If you encounter any issues:
1. Check the console logs
2. Verify environment variables
3. Ensure all dependencies are installed
4. Check CORS configuration for production

---

**Built with ❤️ using modern web technologies**
