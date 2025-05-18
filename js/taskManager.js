// Task Management Class
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = { priority: 'all', status: 'all' };
        this.initializeEventListeners();
        this.renderTasks();
        this.updateProgress();
    }

    initializeEventListeners() {
        // Form submission
        const form = document.getElementById('add-task-form');
        form.addEventListener('submit', (e) => this.handleTaskSubmit(e));

        // Filters
        document.getElementById('filter-priority').addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-status').addEventListener('change', () => this.applyFilters());
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        const task = {
            id: Date.now(),
            title: form.querySelector('#task-input').value,
            description: form.querySelector('#task-description').value,
            priority: form.querySelector('#priority-select').value,
            status: form.querySelector('#task-status').value,
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        form.reset();
    }

    createTaskElement(task) {
        const template = document.getElementById('task-template');
        const taskElement = template.content.cloneNode(true);
        const taskCard = taskElement.querySelector('.task-card');

        // Set task card data attributes
        taskCard.dataset.taskId = task.id;
        taskCard.dataset.priority = task.priority;
        taskCard.dataset.status = task.status;

        // Fill in task content
        taskCard.querySelector('.task-title').textContent = task.title;
        taskCard.querySelector('.task-description').textContent = task.description;
        
        // Set priority badge
        const priorityBadge = taskCard.querySelector('.priority-badge');
        priorityBadge.textContent = `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority`;
        priorityBadge.classList.add(`priority-${task.priority}`);

        // Set status badge
        const statusBadge = taskCard.querySelector('.status-badge');
        statusBadge.textContent = task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        statusBadge.classList.add(`status-${task.status}`);

        // Set date
        const dateCreated = taskCard.querySelector('.date-created');
        dateCreated.textContent = new Date(task.dateCreated).toLocaleDateString();

        // Add event listeners to buttons
        const editBtn = taskCard.querySelector('.btn-edit');
        const deleteBtn = taskCard.querySelector('.btn-delete');
        const completeBtn = taskCard.querySelector('.btn-complete');

        editBtn.addEventListener('click', () => this.editTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        completeBtn.addEventListener('click', () => this.toggleTaskComplete(task.id));

        // Update complete button text based on status
        completeBtn.textContent = task.status === 'completed' ? 'Reopen' : 'Complete';

        return taskElement;
    }

    renderTasks() {
        const container = document.getElementById('tasks-container');
        container.innerHTML = '';

        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            container.innerHTML = '<p class="no-tasks">No tasks found</p>';
            return;
        }

        filteredTasks.forEach(task => {
            container.appendChild(this.createTaskElement(task));
        });

        this.updateProgress();
    }

    getFilteredTasks() {
        const priorityFilter = document.getElementById('filter-priority').value;
        const statusFilter = document.getElementById('filter-status').value;

        return this.tasks.filter(task => {
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            return matchesPriority && matchesStatus;
        });
    }

    updateProgress() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.status === 'completed').length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.getElementById('total-tasks').textContent = total;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('progress-text').textContent = `${percentage}%`;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Fill form with task data
        const form = document.getElementById('add-task-form');
        form.querySelector('#task-input').value = task.title;
        form.querySelector('#task-description').value = task.description;
        form.querySelector('#priority-select').value = task.priority;
        form.querySelector('#task-status').value = task.status;

        // Remove the old task
        this.deleteTask(taskId);

        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.status = task.status === 'completed' ? 'todo' : 'completed';
        task.dateModified = new Date().toISOString();
        
        this.saveTasks();
        this.renderTasks();
    }

    applyFilters() {
        this.renderTasks();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.updateProgress();
    }
}

// Initialize Task Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
}); 