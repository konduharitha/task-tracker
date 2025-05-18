// Sticky Notes Functionality
class StickyNotes {
    constructor() {
        this.addNoteBtn = document.getElementById('add-note');
        this.notesContainer = document.getElementById('notes-container');
        this.notesList = document.getElementById('notes-list');
        this.notes = JSON.parse(localStorage.getItem('sticky-notes')) || [];
        this.selectedNoteId = null;
        this.noteColors = ['yellow', 'pink', 'blue', 'green'];
        this.draggedNote = null;
        
        this.initializeEventListeners();
        this.loadNotes();
    }

    initializeEventListeners() {
        this.addNoteBtn.addEventListener('click', () => this.createNewNote());
        this.initializeDragAndDrop();
    }

    createNewNote() {
        const newNote = {
            id: Date.now(),
            title: '',
            content: '',
            color: 'yellow'
        };
        
        this.notes.push(newNote);
        this.saveNotes();
        
        // Add preview to sidebar
        const preview = this.createNotePreview(newNote);
        this.notesList.appendChild(preview);
        
        // Select the new note
        this.selectNote(newNote.id);
    }

    createNotePreview(note) {
        const preview = document.createElement('div');
        preview.className = 'note-preview';
        preview.setAttribute('data-id', note.id);
        if (note.id === this.selectedNoteId) {
            preview.classList.add('active');
        }

        preview.innerHTML = `
            <div class="note-preview-title">${note.title || 'Untitled'}</div>
            <div class="note-preview-content">${note.content || 'No content'}</div>
        `;

        preview.addEventListener('click', () => {
            this.selectNote(note.id);
        });

        return preview;
    }

    selectNote(noteId) {
        this.selectedNoteId = noteId;
        
        // Update sidebar selection
        document.querySelectorAll('.note-preview').forEach(preview => {
            preview.classList.toggle('active', preview.getAttribute('data-id') === noteId.toString());
        });

        // Update main display
        this.notesContainer.innerHTML = '';
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            const noteElement = this.createNote(note.content, note.color, note.id, note.title);
            noteElement.classList.add('selected');
            this.notesContainer.appendChild(noteElement);
        }
    }

    createNote(content = '', color = 'yellow', id = Date.now(), title = '') {
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

        this.addNoteEventListeners(note);
        return note;
    }

    addNoteEventListeners(note) {
        const titleInput = note.querySelector('.note-title');
        const textarea = note.querySelector('.note-content');
        const colorBtn = note.querySelector('.color-btn');
        const deleteBtn = note.querySelector('.delete-btn');

        titleInput.addEventListener('input', () => this.updateNote(note, 'title', titleInput.value));
        textarea.addEventListener('input', () => this.updateNote(note, 'content', textarea.value));
        colorBtn.addEventListener('click', () => this.changeNoteColor(note));
        deleteBtn.addEventListener('click', () => this.deleteNote(note));
    }

    updateNote(note, field, value) {
        const noteId = parseInt(note.getAttribute('data-id'));
        const noteIndex = this.notes.findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
            this.notes[noteIndex][field] = value;
            this.saveNotes();
            this.updateNotePreview(noteId);
        }
    }

    changeNoteColor(note) {
        const currentColor = note.getAttribute('data-color');
        const currentIndex = this.noteColors.indexOf(currentColor);
        const nextIndex = (currentIndex + 1) % this.noteColors.length;
        const newColor = this.noteColors[nextIndex];
        
        note.setAttribute('data-color', newColor);
        
        const noteId = parseInt(note.getAttribute('data-id'));
        const noteIndex = this.notes.findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
            this.notes[noteIndex].color = newColor;
            this.saveNotes();
        }
    }

    deleteNote(note) {
        const noteId = parseInt(note.getAttribute('data-id'));
        this.notes = this.notes.filter(n => n.id !== noteId);
        this.saveNotes();
        note.remove();
        
        // Remove preview
        const preview = this.notesList.querySelector(`[data-id="${noteId}"]`);
        if (preview) {
            preview.remove();
        }
        
        // Clear main display if this was the selected note
        if (this.selectedNoteId === noteId) {
            this.selectedNoteId = null;
            this.notesContainer.innerHTML = '';
        }
    }

    updateNotePreview(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            const existingPreview = this.notesList.querySelector(`[data-id="${noteId}"]`);
            if (existingPreview) {
                existingPreview.querySelector('.note-preview-title').textContent = note.title || 'Untitled';
                existingPreview.querySelector('.note-preview-content').textContent = note.content || 'No content';
            }
        }
    }

    initializeDragAndDrop() {
        this.notesContainer.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('note')) {
                this.draggedNote = e.target;
                e.target.style.opacity = '0.5';
            }
        });

        this.notesContainer.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('note')) {
                e.target.style.opacity = '1';
                this.draggedNote = null;
            }
        });

        this.notesContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.notesContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedNote) {
                const allNotes = [...this.notesContainer.querySelectorAll('.note')];
                const draggedIndex = allNotes.indexOf(this.draggedNote);
                const droppedIndex = allNotes.indexOf(e.target.closest('.note'));
                
                if (droppedIndex !== -1 && draggedIndex !== droppedIndex) {
                    if (droppedIndex < draggedIndex) {
                        e.target.closest('.note').parentNode.insertBefore(this.draggedNote, e.target.closest('.note'));
                    } else {
                        e.target.closest('.note').parentNode.insertBefore(this.draggedNote, e.target.closest('.note').nextSibling);
                    }
                    
                    const [movedNote] = this.notes.splice(draggedIndex, 1);
                    this.notes.splice(droppedIndex, 0, movedNote);
                    this.saveNotes();
                }
            }
        });
    }

    saveNotes() {
        localStorage.setItem('sticky-notes', JSON.stringify(this.notes));
    }

    loadNotes() {
        // Clear containers
        this.notesList.innerHTML = '';
        this.notesContainer.innerHTML = '';
        
        // Add previews to sidebar
        this.notes.forEach(note => {
            const preview = this.createNotePreview(note);
            this.notesList.appendChild(preview);
        });
        
        // Select the first note if exists
        if (this.notes.length > 0) {
            this.selectNote(this.notes[0].id);
        }
    }
}

// Initialize Sticky Notes when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StickyNotes();
}); 