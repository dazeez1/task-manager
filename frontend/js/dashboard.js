// Task Manager Dashboard
class TaskManagerDashboard {
    constructor() {
        this.apiBaseUrl = this.getApiBaseUrl();
        this.currentUser = null;
        this.tasks = [];
        this.init();
    }

    // Initialize the dashboard
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        console.log('📊 Task Manager Dashboard initialized');
        console.log('🌐 API Base URL:', this.apiBaseUrl);
    }

    // Get API base URL based on environment
    getApiBaseUrl() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        } else if (hostname === 'task-manager-rho-virid.vercel.app') {
            // Production frontend - use production backend
            return 'https://task-manager-2ejf.onrender.com/api';
        } else {
            // Fallback to production
            return 'https://task-manager-2ejf.onrender.com/api';
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Add task form
        document.getElementById('addTaskForm').addEventListener('submit', (e) => this.handleAddTask(e));

        // Task filters
        document.getElementById('priorityFilter').addEventListener('change', () => this.filterTasks());
        document.getElementById('statusFilter').addEventListener('change', () => this.filterTasks());

        // Modal events
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('modalCancel').addEventListener('click', () => this.closeModal());
        document.getElementById('editTaskForm').addEventListener('submit', (e) => this.handleEditTask(e));

        // Toast close button
        document.querySelector('.toast-close').addEventListener('click', () => this.hideNotification());
    }

    // Check authentication status
    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok && data.success && data.isAuthenticated) {
                console.log('✅ User is authenticated:', data.user);
                this.currentUser = data.user;
                this.updateUserInfo();
                this.loadTasks();
                this.loadStats();
            } else {
                console.log('❌ User is not authenticated, redirecting to login');
                window.location.href = 'index.html';
            }
            
        } catch (error) {
            console.error('❌ Auth check error:', error);
            this.showNotification('Authentication error. Please log in again.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    // Update user information display
    updateUserInfo() {
        const userNameElement = document.getElementById('userName');
        if (this.currentUser) {
            userNameElement.textContent = `Welcome, ${this.currentUser.firstName} ${this.currentUser.lastName}!`;
        }
    }

    // Load user tasks
    async loadTasks() {
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBaseUrl}/tasks`, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                this.tasks = data.tasks || [];
                this.renderTasks();
                console.log(`✅ Loaded ${this.tasks.length} tasks`);
            } else {
                console.error('❌ Failed to load tasks:', data.message);
                this.showNotification(data.message || 'Failed to load tasks', 'error');
            }
            
        } catch (error) {
            console.error('❌ Load tasks error:', error);
            this.showNotification('Failed to load tasks. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Load task statistics
    async loadStats() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/tasks/stats`, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                this.updateStats(data.stats);
            }
            
        } catch (error) {
            console.error('❌ Load stats error:', error);
        }
    }

    // Update statistics display
    updateStats(stats) {
        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('pendingTasks').textContent = stats.pending;
        document.getElementById('completedTasks').textContent = stats.completed;
        document.getElementById('highPriorityTasks').textContent = stats.high;
    }

    // Render tasks
    renderTasks() {
        const container = document.getElementById('tasksContainer');
        
        if (this.tasks.length === 0) {
            container.innerHTML = `
                <div class="no-tasks">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks yet. Create your first task above!</p>
                </div>
            `;
            return;
        }

        const filteredTasks = this.getFilteredTasks();
        
        container.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
    }

    // Get filtered tasks based on current filters
    getFilteredTasks() {
        let filtered = [...this.tasks];
        
        const priorityFilter = document.getElementById('priorityFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        if (priorityFilter) {
            filtered = filtered.filter(task => task.priority === priorityFilter);
        }
        
        if (statusFilter) {
            filtered = filtered.filter(task => task.status === statusFilter);
        }
        
        return filtered;
    }

    // Create HTML for a single task
    createTaskHTML(task) {
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        const createdDate = new Date(task.createdAt).toLocaleDateString();
        
        return `
            <div class="task-card fade-in" data-task-id="${task.id}">
                <div class="task-header">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    <span class="task-priority ${task.priority.toLowerCase()}">${task.priority}</span>
                </div>
                
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                
                <div class="task-meta">
                    <div class="task-info">
                        <span><i class="fas fa-calendar"></i> Created: ${createdDate}</span>
                        ${task.dueDate ? `<span><i class="fas fa-clock"></i> Due: ${dueDate}</span>` : ''}
                        <span><i class="fas fa-info-circle"></i> Status: ${task.status}</span>
                    </div>
                    
                    <div class="task-actions">
                        <button class="btn btn-primary btn-sm" onclick="dashboard.editTask('${task.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="dashboard.deleteTask('${task.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Filter tasks
    filterTasks() {
        this.renderTasks();
    }

    // Handle add task form submission
    async handleAddTask(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate') || null
        };

        console.log('➕ Creating task:', taskData);
        
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBaseUrl}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ Task created successfully:', data.task);
                this.showNotification('Task created successfully!', 'success');
                
                // Reset form
                e.target.reset();
                
                // Reload tasks and stats
                await this.loadTasks();
                await this.loadStats();
                
            } else {
                console.error('❌ Failed to create task:', data.message);
                this.showNotification(data.message || 'Failed to create task', 'error');
            }
            
        } catch (error) {
            console.error('❌ Create task error:', error);
            this.showNotification('Failed to create task. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Edit task
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Populate modal
        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description || '';
        document.getElementById('editTaskPriority').value = task.priority;
        document.getElementById('editTaskStatus').value = task.status;
        document.getElementById('editTaskDueDate').value = task.dueDate ? task.dueDate.split('T')[0] : '';

        // Show modal
        document.getElementById('taskModal').classList.remove('hidden');
    }

    // Handle edit task form submission
    async handleEditTask(e) {
        e.preventDefault();
        
        const taskId = document.getElementById('editTaskId').value;
        const formData = new FormData(e.target);
        const updates = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            status: formData.get('status'),
            dueDate: formData.get('dueDate') || null
        };

        console.log('✏️ Updating task:', taskId, updates);
        
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBaseUrl}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ Task updated successfully:', data.task);
                this.showNotification('Task updated successfully!', 'success');
                
                // Close modal
                this.closeModal();
                
                // Reload tasks and stats
                await this.loadTasks();
                await this.loadStats();
                
            } else {
                console.error('❌ Failed to update task:', data.message);
                this.showNotification(data.message || 'Failed to update task', 'error');
            }
            
        } catch (error) {
            console.error('❌ Update task error:', error);
            this.showNotification('Failed to update task. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Delete task
    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        console.log('🗑️ Deleting task:', taskId);
        
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBaseUrl}/tasks/${taskId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ Task deleted successfully');
                this.showNotification('Task deleted successfully!', 'success');
                
                // Reload tasks and stats
                await this.loadTasks();
                await this.loadStats();
                
            } else {
                console.error('❌ Failed to delete task:', data.message);
                this.showNotification(data.message || 'Failed to delete task', 'error');
            }
            
        } catch (error) {
            console.error('❌ Delete task error:', error);
            this.showNotification('Failed to delete task. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Close modal
    closeModal() {
        document.getElementById('taskModal').classList.add('hidden');
        document.getElementById('editTaskForm').reset();
    }

    // Logout user
    async logout() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                console.log('✅ Logout successful');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('❌ Logout error:', error);
            // Redirect anyway
            window.location.href = 'index.html';
        }
    }

    // Show/hide loading overlay
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    // Show notification toast
    showNotification(message, type = 'info') {
        const toast = document.getElementById('notificationToast');
        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');
        
        // Set message and icon
        toastMessage.textContent = message;
        toastIcon.className = `toast-icon ${type}`;
        
        // Show toast
        toast.classList.remove('hidden');
        toast.classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideNotification();
        }, 5000);
    }

    // Hide notification toast
    hideNotification() {
        const toast = document.getElementById('notificationToast');
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new TaskManagerDashboard();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskManagerDashboard;
}
