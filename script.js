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

        // Tool navigation
        const toolButtons = document.querySelectorAll('[data-tool]');
        toolButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTool(button.dataset.tool));
        });
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

    switchTool(toolId) {
        // Hide all tool sections
        document.querySelectorAll('.tool-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show selected tool section
        const selectedSection = document.getElementById(toolId);
        if (selectedSection) {
            selectedSection.classList.remove('hidden');
        }

        // Update active state of buttons
        document.querySelectorAll('[data-tool]').forEach(button => {
            button.classList.toggle('active', button.dataset.tool === toolId);
        });
    }
}

// Initialize Task Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const taskManager = new TaskManager();
});

// Tool Section Navigation
const toolButtons = document.querySelectorAll('[data-tool]');
const toolSections = document.querySelectorAll('.tool-section');

toolButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTool = button.getAttribute('data-tool');
        
        // Hide all sections
        toolSections.forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show target section
        document.getElementById(targetTool).classList.remove('hidden');
    });
});

// Sticky Notes Functionality
const addNoteBtn = document.getElementById('add-note');
const notesContainer = document.getElementById('notes-container');
const notesList = document.getElementById('notes-list');

// Note colors array
const noteColors = ['yellow', 'pink', 'blue', 'green'];

// Load notes from localStorage
let notes = JSON.parse(localStorage.getItem('sticky-notes')) || [];

// Save notes to localStorage
const saveNotes = () => {
    localStorage.setItem('sticky-notes', JSON.stringify(notes));
};

let selectedNoteId = null;

// Create note preview
const createNotePreview = (note) => {
    const preview = document.createElement('div');
    preview.className = 'note-preview';
    preview.setAttribute('data-id', note.id);
    if (note.id === selectedNoteId) {
        preview.classList.add('active');
    }

    preview.innerHTML = `
        <div class="note-preview-title">${note.title || 'Untitled'}</div>
        <div class="note-preview-content">${note.content || 'No content'}</div>
    `;

    preview.addEventListener('click', () => {
        selectNote(note.id);
    });

    return preview;
};

// Select a note
const selectNote = (noteId) => {
    selectedNoteId = noteId;
    
    // Update sidebar selection
    document.querySelectorAll('.note-preview').forEach(preview => {
        preview.classList.toggle('active', preview.getAttribute('data-id') === noteId.toString());
    });

    // Update main display
    notesContainer.innerHTML = '';
    const note = notes.find(n => n.id === noteId);
    if (note) {
        const noteElement = createNote(note.content, note.color, note.id, note.title);
        noteElement.classList.add('selected');
        notesContainer.appendChild(noteElement);
    }
};

// Update note preview
const updateNotePreview = (noteId) => {
    const note = notes.find(n => n.id === parseInt(noteId));
    if (note) {
        const existingPreview = notesList.querySelector(`[data-id="${noteId}"]`);
        if (existingPreview) {
            existingPreview.querySelector('.note-preview-title').textContent = note.title || 'Untitled';
            existingPreview.querySelector('.note-preview-content').textContent = note.content || 'No content';
        }
    }
};

// Modify createNote function to update preview
const createNote = (content = '', color = 'yellow', id = Date.now(), title = '') => {
    const note = document.createElement('div');
    note.className = 'note';
    note.setAttribute('data-color', color);
    note.setAttribute('data-id', id);
    
    note.innerHTML = `
        <input type="text" class="note-title" placeholder="Note Title..." value="${title}">
        <textarea class="note-content" placeholder="Write your note here...">${content}</textarea>
        <div class="note-actions">
            <button class="note-btn color-btn" title="Change Color">🎨</button>
            <button class="note-btn delete-btn" title="Delete Note">🗑️</button>
        </div>
    `;

    // Add event listeners
    const titleInput = note.querySelector('.note-title');
    const textarea = note.querySelector('.note-content');
    const colorBtn = note.querySelector('.color-btn');
    const deleteBtn = note.querySelector('.delete-btn');

    // Save note title on change
    titleInput.addEventListener('input', () => {
        const noteId = note.getAttribute('data-id');
        const noteIndex = notes.findIndex(n => n.id === parseInt(noteId));
        if (noteIndex !== -1) {
            notes[noteIndex].title = titleInput.value;
            saveNotes();
            updateNotePreview(noteId);
        }
    });

    // Save note content on change
    textarea.addEventListener('input', () => {
        const noteId = note.getAttribute('data-id');
        const noteIndex = notes.findIndex(n => n.id === parseInt(noteId));
        if (noteIndex !== -1) {
            notes[noteIndex].content = textarea.value;
            saveNotes();
            updateNotePreview(noteId);
        }
    });

    // Change note color
    colorBtn.addEventListener('click', () => {
        const currentColor = note.getAttribute('data-color');
        const currentIndex = noteColors.indexOf(currentColor);
        const nextIndex = (currentIndex + 1) % noteColors.length;
        const newColor = noteColors[nextIndex];
        
        note.setAttribute('data-color', newColor);
        
        const noteId = note.getAttribute('data-id');
        const noteIndex = notes.findIndex(n => n.id === parseInt(noteId));
        if (noteIndex !== -1) {
            notes[noteIndex].color = newColor;
            saveNotes();
        }
    });

    // Delete note
    deleteBtn.addEventListener('click', () => {
        const noteId = note.getAttribute('data-id');
        notes = notes.filter(n => n.id !== parseInt(noteId));
        saveNotes();
        note.remove();
        
        // Remove preview
        const preview = notesList.querySelector(`[data-id="${noteId}"]`);
        if (preview) {
            preview.remove();
        }
        
        // Clear main display if this was the selected note
        if (selectedNoteId === parseInt(noteId)) {
            selectedNoteId = null;
            notesContainer.innerHTML = '';
        }
    });

    return note;
};

// Modify add new note
addNoteBtn.addEventListener('click', () => {
    const newNote = {
        id: Date.now(),
        title: '',
        content: '',
        color: 'yellow'
    };
    
    notes.push(newNote);
    saveNotes();
    
    // Add preview to sidebar
    const preview = createNotePreview(newNote);
    notesList.appendChild(preview);
    
    // Select the new note
    selectNote(newNote.id);
});

// Load existing notes
window.addEventListener('load', () => {
    // Clear containers
    notesList.innerHTML = '';
    notesContainer.innerHTML = '';
    
    // Add previews to sidebar
    notes.forEach(note => {
        const preview = createNotePreview(note);
        notesList.appendChild(preview);
    });
    
    // Select the first note if exists
    if (notes.length > 0) {
        selectNote(notes[0].id);
    }
});

// Implement drag and drop functionality
let draggedNote = null;

notesContainer.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('note')) {
        draggedNote = e.target;
        e.target.style.opacity = '0.5';
    }
});

notesContainer.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('note')) {
        e.target.style.opacity = '1';
        draggedNote = null;
    }
});

notesContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
});

notesContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedNote) {
        const allNotes = [...notesContainer.querySelectorAll('.note')];
        const draggedIndex = allNotes.indexOf(draggedNote);
        const droppedIndex = allNotes.indexOf(e.target.closest('.note'));
        
        if (droppedIndex !== -1 && draggedIndex !== droppedIndex) {
            // Reorder in DOM
            if (droppedIndex < draggedIndex) {
                e.target.closest('.note').parentNode.insertBefore(draggedNote, e.target.closest('.note'));
            } else {
                e.target.closest('.note').parentNode.insertBefore(draggedNote, e.target.closest('.note').nextSibling);
            }
            
            // Update notes array
            const [movedNote] = notes.splice(draggedIndex, 1);
            notes.splice(droppedIndex, 0, movedNote);
            saveNotes();
        }
    }
});

