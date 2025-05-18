// Import the marked library for Markdown parsing
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

class MarkdownEditor {
  constructor() {
    // Wait for elements to be available
    this.waitForElements().then(() => {
      this.initializeMarked();
      this.initializeEventListeners();
      this.loadSavedContent();
    }).catch(error => {
      console.error('Failed to initialize Markdown Editor:', error);
    });
  }

  async waitForElements() {
    // Try to get elements for up to 2 seconds
    const maxAttempts = 20;
    const delayMs = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (this.initializeElements()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    throw new Error('Could not find required elements');
  }

  initializeElements() {
    this.editor = document.getElementById('markdown-editor');
    this.preview = document.getElementById('markdown-preview');
    this.wordCount = document.getElementById('word-count');
    this.charCount = document.getElementById('char-count');
    this.filenameInput = document.getElementById('filename-input');
    this.saveButton = document.getElementById('save-markdown');
    this.loadButton = document.getElementById('load-markdown-btn');
    this.loadInput = document.getElementById('load-markdown');

    return !!(this.editor && this.preview && this.wordCount && 
             this.charCount && this.filenameInput && this.saveButton && 
             this.loadButton && this.loadInput);
  }

  initializeMarked() {
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      sanitize: false
    });
  }

  initializeEventListeners() {
    // Editor input events with debounce
    let debounceTimer;
    this.editor.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.updatePreview();
        this.updateStats();
        this.saveContent();
      }, 100);
    });

    // Save button click
    this.saveButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.saveToFile();
    });

    // Load button click
    this.loadButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadInput.click();
    });

    // File input change
    this.loadInput.addEventListener('change', (e) => {
      this.loadFromFile(e);
    });
  }

  loadSavedContent() {
    try {
      const savedContent = localStorage.getItem('markdown-content');
      if (savedContent) {
        this.editor.value = savedContent;
        this.updatePreview();
        this.updateStats();
      }
    } catch (error) {
      console.error('Error loading saved content:', error);
    }
  }

  updatePreview() {
    try {
      const markdown = this.editor.value || '';
      const html = marked(markdown);
      this.preview.innerHTML = html;
    } catch (error) {
      console.error('Error updating preview:', error);
    }
  }

  updateStats() {
    try {
      const text = this.editor.value || '';
      
      // Count words more accurately
      const wordCount = text.trim()
        ? text.trim()
            .split(/[\s\n\r]+/)
            .filter(word => word.length > 0)
            .length
        : 0;

      // Count all characters including whitespace
      const charCount = text.length;

      // Update display with animation
      this.animateCounterUpdate(this.wordCount, wordCount);
      this.animateCounterUpdate(this.charCount, charCount);
      
      // Log for debugging
      console.log('Stats updated:', { words: wordCount, chars: charCount });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  animateCounterUpdate(element, newValue) {
    const currentValue = parseInt(element.textContent) || 0;
    element.textContent = newValue;
  }

  saveContent() {
    try {
      const content = this.editor.value || '';
      localStorage.setItem('markdown-content', content);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  saveToFile() {
    try {
      const content = this.editor.value || '';
      const filename = this.filenameInput.value.trim() || 'notes.md';
      
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file. Please try again.');
    }
  }

  loadFromFile(event) {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result || '';
          this.editor.value = content;
          this.filenameInput.value = file.name;
          
          this.updatePreview();
          this.updateStats();
          this.saveContent();
        } catch (error) {
          console.error('Error processing file:', error);
          alert('Failed to process file. Please try again.');
        }
      };

      reader.onerror = () => {
        console.error('Error reading file');
        alert('Failed to read file. Please try again.');
      };

      reader.readAsText(file);
      this.loadInput.value = '';
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Failed to load file. Please try again.');
    }
  }
}

// Initialize the Markdown editor when the markdown section becomes visible
document.addEventListener('DOMContentLoaded', () => {
  const markdownBtn = document.querySelector('[data-tool="markdown"]');
  const markdownSection = document.getElementById('markdown');

  if (markdownBtn && markdownSection) {
    let editor = null;

    const initializeEditor = () => {
      if (!editor) {
        editor = new MarkdownEditor();
      }
    };

    // Initialize when the markdown button is clicked
    markdownBtn.addEventListener('click', initializeEditor);

    // Also initialize if the markdown section is already visible
    if (window.getComputedStyle(markdownSection).display !== 'none') {
      initializeEditor();
    }
  }
}); 