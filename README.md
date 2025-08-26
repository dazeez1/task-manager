# Task Manager - Full Stack Application

A modern, full-stack task management application built with Node.js, Express, and vanilla JavaScript. Features session-based authentication, priority-based task management, and a beautiful responsive UI.

## 🚀 Features

### Authentication System

- **User Registration**: Create new accounts with email validation
- **User Login**: Secure session-based authentication
- **User Logout**: Proper session termination
- **Password Security**: Bcrypt hashing for password protection

### Task Management

- **Create Tasks**: Add new tasks with title, description, priority, and due date
- **Read Tasks**: View all user tasks with real-time statistics
- **Update Tasks**: Edit existing tasks or mark them as complete/incomplete
- **Delete Tasks**: Remove tasks from the system
- **Priority System**: Three priority levels (Low, Medium, High) with color coding
- **Task Status**: Mark tasks as completed or pending

### User Interface

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Priority Color Coding**:
  - 🟢 **Low Priority**: Green
  - 🟡 **Medium Priority**: Orange/Yellow
  - 🔴 **High Priority**: Red
- **Real-time Statistics**: Track total, completed, and pending tasks
- **Form Validation**: Client-side and server-side validation

## 🛠️ Technology Stack

### Backend

- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **express-session**: Session management
- **bcryptjs**: Password hashing
- **uuid**: Unique ID generation
- **CORS**: Cross-origin resource sharing

### Frontend

- **Vanilla JavaScript**: No frameworks, pure JS
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and animations
- **Fetch API**: HTTP requests

### Data Storage

- **JSON Files**: Simple file-based storage
  - `users.json`: User account data
  - `tasks.json`: Task data

## 📁 Project Structure

```
task-manager/
├── backend/
│   ├── routes/
│   │   ├── authRoutes.js      # Authentication routes
│   │   └── taskRoutes.js      # Task management routes
│   ├── middleware/
│   │   └── authMiddleware.js  # Authentication middleware
│   ├── utils/
│   │   └── dataManager.js     # JSON file operations
│   ├── users.json             # User data storage
│   ├── tasks.json             # Task data storage
│   ├── package.json           # Backend dependencies
│   └── server.js              # Express server
├── frontend/
│   ├── index.html             # Login/Signup page
│   ├── dashboard.html         # Task management dashboard
│   └── script.js              # Frontend JavaScript
└── README.md                  # Project documentation
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd task-manager
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Start the Backend Server

```bash
npm start
# or for development with auto-restart
npm run dev
```

The backend server will start on `http://localhost:3000`

### Step 4: Start the Frontend (Optional)

If you want to serve the frontend separately:

```bash
# Install live-server globally (if not already installed)
npm install -g live-server

# Start frontend server
cd frontend
live-server --port=5500
```

The frontend will be available at `http://localhost:5500`

### Step 5: Access the Application

- **Main Application**: `http://localhost:3000`
- **Login Page**: `http://localhost:3000`
- **Dashboard**: `http://localhost:3000/dashboard`

## 📖 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`

Register a new user account.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "emailAddress": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "userId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "emailAddress": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/login`

Authenticate user and start session.

**Request Body:**

```json
{
  "emailAddress": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/logout`

End user session.

#### GET `/api/auth/me`

Get current user information.

### Task Management Endpoints

#### GET `/api/tasks`

Get all tasks for the authenticated user.

#### POST `/api/tasks`

Create a new task.

**Request Body:**

```json
{
  "taskTitle": "Complete Project",
  "taskDescription": "Finish the task manager application",
  "priorityLevel": "High",
  "dueDate": "2024-01-15T10:00:00.000Z"
}
```

#### PUT `/api/tasks/:taskId`

Update an existing task.

#### DELETE `/api/tasks/:taskId`

Delete a task.

#### PATCH `/api/tasks/:taskId/toggle`

Toggle task completion status.

## 🎨 UI Features

### Priority Color Coding

- **Low Priority**: Green background (`#d4edda`) with dark green text (`#155724`)
- **Medium Priority**: Yellow background (`#fff3cd`) with dark yellow text (`#856404`)
- **High Priority**: Red background (`#f8d7da`) with dark red text (`#721c24`)

### Responsive Design

- Mobile-first approach
- Flexible grid layouts
- Touch-friendly buttons
- Optimized for all screen sizes

### User Experience

- Smooth animations and transitions
- Loading states for better feedback
- Error and success message handling
- Form validation with helpful error messages

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **Session Management**: Secure session handling
- **Input Validation**: Both client and server-side validation
- **XSS Protection**: HTML escaping for user input
- **CSRF Protection**: Session-based authentication

## 🧪 Testing the Application

1. **Start the backend server**:

   ```bash
   cd backend
   npm start
   ```

2. **Open your browser** and navigate to `http://localhost:3000`

3. **Create a new account** or login with existing credentials

4. **Test the features**:
   - Create tasks with different priorities
   - Edit task details
   - Mark tasks as complete/incomplete
   - Delete tasks
   - Check the statistics dashboard

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:

   ```bash
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **CORS errors**:

   - Ensure the frontend is served from the correct origin
   - Check the CORS configuration in `server.js`

3. **Session not persisting**:
   - Check browser cookie settings
   - Ensure `credentials: 'include'` is set in fetch requests

## 📝 Development Notes

### Code Quality

- **Human-like naming**: Descriptive variable and function names
- **Best practices**: Proper error handling, validation, and security
- **Clean code**: Well-structured, readable, and maintainable
- **Modular design**: Separated concerns and reusable components

### Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- JWT authentication
- Real-time updates with WebSocket
- File attachments for tasks
- Task categories and tags
- Advanced filtering and search
- Email notifications
- Mobile app development

## 👨‍💻 Author

**Azeez Damilare Gbenga**

## 📄 License

This project is licensed under the ISC License.

---

**Happy Task Managing! 🎉**
