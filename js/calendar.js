class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.tasks = [];
    this.draggedTask = null;
    this.pendingDrop = null;
    this.init();
  }

  init() {
    this.weekDisplay = document.getElementById('week-display');
    this.calendarSlots = document.querySelector('.calendar-slots');
    this.unscheduledContainer = document.getElementById('unscheduled-tasks-container');
    this.timeModal = document.getElementById('time-modal');
    this.timeInput = document.getElementById('task-time-input');
    
    this.setupTimeModal();
    this.setupNavigation();
    this.loadTasks();
    this.renderCalendar();

    // Listen for task updates
    document.addEventListener('taskUpdated', () => {
      this.loadTasks();
      this.renderCalendar();
    });
  }

  setupTimeModal() {
    document.getElementById('confirm-time').addEventListener('click', () => {
      if (this.pendingDrop && this.timeInput.value) {
        const [hours, minutes] = this.timeInput.value.split(':');
        const { task, date } = this.pendingDrop;
        
        const newDate = new Date(date);
        newDate.setHours(parseInt(hours), parseInt(minutes));

        this.scheduleTask(task, newDate);
        this.closeTimeModal();
      }
    });

    document.getElementById('cancel-time').addEventListener('click', () => {
      this.closeTimeModal();
    });

    // Set default time to current time
    const now = new Date();
    this.timeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  showTimeModal() {
    this.timeModal.classList.add('show');
  }

  closeTimeModal() {
    this.timeModal.classList.remove('show');
    this.pendingDrop = null;
  }

  setupNavigation() {
    document.getElementById('prev-week').addEventListener('click', () => {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
      this.renderCalendar();
    });

    document.getElementById('next-week').addEventListener('click', () => {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
      this.renderCalendar();
    });
  }

  loadTasks() {
    // Load tasks from taskManager's storage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    this.tasks = tasks;
  }

  renderCalendar() {
    this.updateWeekDisplay();
    this.renderDayHeaders();
    this.renderTimeGrid();
    this.renderTasks();
  }

  updateWeekDisplay() {
    const startOfWeek = this.getStartOfWeek();
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };

    this.weekDisplay.textContent = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  }

  renderDayHeaders() {
    const daysContainer = document.querySelector('.calendar-days');
    daysContainer.innerHTML = '<div class="day-header"></div>'; // Empty header for time column

    const startOfWeek = this.getStartOfWeek();

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);

      const dayHeader = document.createElement('div');
      dayHeader.className = 'day-header';
      dayHeader.innerHTML = `
        <span class="day-name">${date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
        <span class="day-date">${date.getDate()}</span>
      `;
      daysContainer.appendChild(dayHeader);
    }
  }

  renderTimeGrid() {
    const timeLabels = document.querySelector('.time-labels');
    const slotsContainer = document.querySelector('.calendar-slots');
    
    timeLabels.innerHTML = '';
    slotsContainer.innerHTML = '';

    // Create 24 hour slots
    for (let hour = 0; hour < 24; hour++) {
      // Create time label
      const timeLabel = document.createElement('div');
      timeLabel.className = 'time-label';
      timeLabel.textContent = this.formatHour(hour);
      timeLabels.appendChild(timeLabel);

      // Create slots for each day
      for (let day = 0; day < 7; day++) {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.dataset.hour = hour;
        slot.dataset.day = day;
        
        slot.addEventListener('dragover', (e) => this.handleDragOver(e));
        slot.addEventListener('drop', (e) => this.handleDrop(e, day, hour));
        
        slotsContainer.appendChild(slot);
      }
    }
  }

  formatHour(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
  }

  renderTasks() {
    // Clear existing tasks
    document.querySelectorAll('.calendar-task, .unscheduled-task').forEach(el => el.remove());

    const startOfWeek = this.getStartOfWeek();
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Separate tasks into scheduled and unscheduled
    this.tasks.forEach(task => {
      if (task.date) {
        const taskDate = new Date(task.date);
        if (taskDate >= startOfWeek && taskDate < endOfWeek) {
          this.createScheduledTaskElement(task);
        }
      } else {
        this.createUnscheduledTaskElement(task);
      }
    });
  }

  createScheduledTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = `calendar-task ${task.priority || 'low'}`;
    taskEl.draggable = true;
    taskEl.dataset.taskId = task.id;

    const taskDate = new Date(task.date);
    taskEl.innerHTML = `
      <span class="task-title">${task.title}</span>
      <span class="task-time">${taskDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit'
      })}</span>
    `;

    // Calculate the correct slot based on the day of week relative to start of week
    const startOfWeek = this.getStartOfWeek();
    const dayDiff = Math.floor((taskDate - startOfWeek) / (1000 * 60 * 60 * 24));
    const hour = taskDate.getHours();
    const slotIndex = dayDiff + (hour * 7);
    
    if (slotIndex >= 0 && slotIndex < this.calendarSlots.children.length) {
      const slot = this.calendarSlots.children[slotIndex];
      if (slot) {
        slot.appendChild(taskEl);
      }
    }

    this.setupTaskDragListeners(taskEl, task);
  }

  createUnscheduledTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = `unscheduled-task ${task.priority || 'low'}`;
    taskEl.draggable = true;
    taskEl.dataset.taskId = task.id;
    
    taskEl.innerHTML = `
      <span class="task-title">${task.title}</span>
    `;

    this.unscheduledContainer.appendChild(taskEl);
    this.setupTaskDragListeners(taskEl, task);
  }

  setupTaskDragListeners(element, task) {
    element.addEventListener('dragstart', (e) => {
      this.draggedTask = task;
      element.classList.add('dragging');
      e.dataTransfer.setData('text/plain', task.id);
      e.dataTransfer.effectAllowed = 'move';
    });

    element.addEventListener('dragend', () => {
      element.classList.remove('dragging');
      this.draggedTask = null;
    });
  }

  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  }

  handleDrop(e, day, hour) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (!this.draggedTask) return;

    const startOfWeek = this.getStartOfWeek();
    const dropDate = new Date(startOfWeek);
    dropDate.setDate(dropDate.getDate() + day);
    dropDate.setHours(hour, 0, 0, 0);

    this.pendingDrop = {
      task: this.draggedTask,
      date: dropDate
    };

    // Show time modal with current time as default
    const now = new Date();
    this.timeInput.value = `${String(hour).padStart(2, '0')}:00`;
    this.showTimeModal();
  }

  scheduleTask(task, date) {
    // Update task in localStorage
    const tasks = this.tasks.map(t => {
      if (t.id === task.id) {
        return { ...t, date: date.toISOString() };
      }
      return t;
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
    this.loadTasks();
    this.renderCalendar();
  }

  getStartOfWeek() {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Calendar();
}); 