# Task Manager API - Postman Testing Guide

This guide will help you test the Task Manager API using Postman collections.

## 📁 Files Included

1. **`Task_Manager_API.postman_collection.json`** - Complete API collection
2. **`Task_Manager_Environment.postman_environment.json`** - Environment variables
3. **`POSTMAN_TESTING_GUIDE.md`** - This guide

## 🚀 Quick Setup

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Select **`Task_Manager_API.postman_collection.json`**
4. Click **Import**

### Step 2: Import Environment
1. Click **Import** button again
2. Select **`Task_Manager_Environment.postman_environment.json`**
3. Click **Import**
4. Select the **"Task Manager Environment"** from the environment dropdown

### Step 3: Start the Server
```bash
# In your project directory
./start.sh
# or
cd backend && npm start
```

## 🧪 Testing Workflow

### 1. Authentication Testing

#### Register a New User
1. Go to **Authentication** → **User Registration**
2. Update the request body with your test data:
```json
{
  "firstName": "Test",
  "lastName": "User",
  "emailAddress": "test@example.com",
  "password": "password123"
}
```
3. Click **Send**
4. **Expected Response**: 201 Created with user data

#### Login with User
1. Go to **Authentication** → **User Login**
2. Update the request body:
```json
{
  "emailAddress": "test@example.com",
  "password": "password123"
}
```
3. Click **Send**
4. **Expected Response**: 200 OK with user data and session cookie

#### Get Current User
1. Go to **Authentication** → **Get Current User**
2. Click **Send**
3. **Expected Response**: 200 OK with user data (if authenticated)

### 2. Task Management Testing

#### Create a New Task
1. Go to **Task Management** → **Create New Task**
2. Update the request body:
```json
{
  "taskTitle": "Test Task",
  "taskDescription": "This is a test task",
  "priorityLevel": "High",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```
3. Click **Send**
4. **Expected Response**: 201 Created with task data
5. **Copy the taskId** from the response for later use

#### Get All Tasks
1. Go to **Task Management** → **Get All Tasks**
2. Click **Send**
3. **Expected Response**: 200 OK with array of tasks

#### Get Specific Task
1. Go to **Task Management** → **Get Specific Task**
2. Update the URL parameter `{{taskId}}` with the task ID from step 1
3. Click **Send**
4. **Expected Response**: 200 OK with task data

#### Update Task
1. Go to **Task Management** → **Update Task**
2. Update the URL parameter `{{taskId}}` with the task ID
3. Update the request body:
```json
{
  "taskTitle": "Updated Task Title",
  "priorityLevel": "Medium",
  "isCompleted": false
}
```
4. Click **Send**
5. **Expected Response**: 200 OK with updated task data

#### Toggle Task Completion
1. Go to **Task Management** → **Toggle Task Completion**
2. Update the URL parameter `{{taskId}}` with the task ID
3. Click **Send**
4. **Expected Response**: 200 OK with toggled task data

#### Delete Task
1. Go to **Task Management** → **Delete Task**
2. Update the URL parameter `{{taskId}}` with the task ID
3. Click **Send**
4. **Expected Response**: 200 OK with success message

### 3. Frontend Testing

#### Access Login Page
1. Go to **Frontend Pages** → **Login Page**
2. Click **Send**
3. **Expected Response**: 200 OK with HTML content

#### Access Dashboard Page
1. Go to **Frontend Pages** → **Dashboard Page**
2. Click **Send**
3. **Expected Response**: 200 OK with HTML content (if authenticated)

## 🔧 Environment Variables

The collection uses these variables:

- **`{{baseUrl}}`**: API base URL (default: `http://localhost:3000`)
- **`{{taskId}}`**: Task ID for specific task operations
- **`{{userId}}`**: User ID (auto-populated)
- **`{{authToken}}`**: Authentication token (auto-populated)

## 📋 Test Scenarios

### Scenario 1: Complete User Workflow
1. Register new user
2. Login with user credentials
3. Create multiple tasks with different priorities
4. Update task details
5. Toggle task completion
6. Delete a task
7. Logout

### Scenario 2: Error Handling
1. Try to login with wrong credentials
2. Try to access tasks without authentication
3. Try to update non-existent task
4. Try to register with existing email

### Scenario 3: Priority Testing
1. Create tasks with all priority levels:
   - Low (Green)
   - Medium (Yellow/Orange)
   - High (Red)
2. Verify priority validation

## 🎯 Expected Status Codes

- **200**: Success
- **201**: Created (new user/task)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (not authenticated)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (user already exists)
- **500**: Internal Server Error

## 🔍 Tips for Testing

1. **Session Management**: The API uses session cookies. Make sure to:
   - Login first before testing protected endpoints
   - Keep the same Postman tab open for session persistence

2. **Task IDs**: After creating a task, copy the `taskId` from the response and use it for:
   - Getting specific task
   - Updating task
   - Toggling completion
   - Deleting task

3. **Priority Levels**: Valid values are:
   - `"Low"`
   - `"Medium"`
   - `"High"`

4. **Date Format**: Use ISO 8601 format for dates:
   - `"2024-12-31T23:59:59.000Z"`

## 🚨 Common Issues

1. **CORS Errors**: Make sure the server is running on `localhost:3000`
2. **Session Expired**: Re-login if you get 401 errors
3. **Task Not Found**: Verify the taskId is correct and belongs to your user
4. **Validation Errors**: Check required fields and data formats

## 📊 Performance Testing

For load testing, you can:
1. Create multiple users
2. Create many tasks per user
3. Test concurrent requests
4. Monitor response times

## 🔐 Security Testing

1. Try accessing other users' tasks
2. Test SQL injection attempts
3. Test XSS payloads
4. Verify password hashing
5. Test session hijacking

---

**Happy Testing! 🎉**

For more information, check the main README.md file.
