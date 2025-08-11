# Task Manager API

A robust task management API with full CRUD operations, user authentication, and advanced organizational features.

## Description

The Task Manager API provides a complete backend solution for task management applications. It supports user authentication, task organization, collaboration features, and comprehensive filtering capabilities.

## Features

### Core Functionality

- Create, read, update, and delete tasks
- Task categorization with custom labels
- Priority levels (Low/Medium/High/Urgent)
- Due date tracking with reminders
- Task progress tracking (Not Started/In Progress/Completed)

### User Management

- JWT authentication system
- User profile customization
- Role-based access control

### Advanced Features

- Full-text search across tasks
- Filtering by status, priority, and due date
- Task sharing between users
- Activity history logging
- File attachments support

## Installation & Usage

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:

````bash
git clone https://github.com/yourusername/task-manager.git
cd task-manager

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/taskmanager.git
   cd taskmanager
````

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your_secure_jwt_secret_here
   JWT_EXPIRES_IN=30d
   EMAIL_HOST=smtp.example.com  # For notifications
   EMAIL_PORT=587
   EMAIL_USERNAME=your@email.com
   EMAIL_PASSWORD=your_email_password
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

## Technologies Used

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **Email notifications**: Nodemailer
- **Testing**: Jest, Socket.IO Client for testing

## Author

**Name**

- Name: Azeez Damilare Gbenga
