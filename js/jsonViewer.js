class JSONViewer {
  constructor() {
    this.jsonInput = document.getElementById('json-input');
    this.jsonTree = document.getElementById('json-tree');
    this.errorDisplay = document.getElementById('json-error');
    this.loadFileBtn = document.getElementById('load-json-file');
    this.saveFileBtn = document.getElementById('save-json-file');
    this.formatBtn = document.getElementById('format-json');
    this.collapseAllBtn = document.getElementById('collapse-all');
    this.expandAllBtn = document.getElementById('expand-all');
    
    this.currentJson = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    // Add sample JSON if input is empty
    if (!this.jsonInput.value) {
      this.jsonInput.value = JSON.stringify({
        name: "Sample JSON",
        type: "object",
        properties: {
          number: 42,
          string: "Hello World",
          boolean: true,
          null: null,
          array: [1, 2, 3],
          nested: {
            a: 1,
            b: 2
          }
        }
      }, null, 2);
      this.parseAndRender();
    }
  }

  setupEventListeners() {
    this.jsonInput.addEventListener('input', () => this.parseAndRender());
    this.loadFileBtn.addEventListener('click', () => this.loadFile());
    this.saveFileBtn.addEventListener('click', () => this.saveFile());
    this.formatBtn.addEventListener('click', () => this.formatJSON());
    this.collapseAllBtn.addEventListener('click', () => this.collapseAll());
    this.expandAllBtn.addEventListener('click', () => this.expandAll());
  }

  parseAndRender() {
    try {
      const jsonString = this.jsonInput.value.trim();
      if (!jsonString) {
        this.jsonTree.innerHTML = '';
        this.errorDisplay.textContent = '';
        return;
      }
      
      this.currentJson = JSON.parse(jsonString);
      this.errorDisplay.textContent = '';
      this.renderJSON(this.currentJson);
    } catch (error) {
      this.errorDisplay.textContent = `Error: ${error.message}`;
      this.jsonTree.innerHTML = '';
    }
  }

  renderJSON(data, path = '') {
    this.jsonTree.innerHTML = this.createNode(data, path);
    this.setupNodeListeners();
  }

  createNode(data, path) {
    if (data === null) return this.createLeafNode('null', 'null', path);
    if (typeof data === 'boolean') return this.createLeafNode(data, 'boolean', path);
    if (typeof data === 'number') return this.createLeafNode(data, 'number', path);
    if (typeof data === 'string') return this.createLeafNode(`"${data}"`, 'string', path);

    if (Array.isArray(data)) {
      return this.createArrayNode(data, path);
    }

    if (typeof data === 'object') {
      return this.createObjectNode(data, path);
    }

    return '';
  }

  createLeafNode(value, type, path) {
    return `
      <div class="json-item" data-path="${path}">
        <span class="json-value ${type}">${value}</span>
      </div>
    `;
  }

  createArrayNode(data, path) {
    const items = data.map((item, index) => {
      const newPath = path ? `${path}[${index}]` : `[${index}]`;
      return this.createNode(item, newPath);
    }).join('');

    return `
      <div class="json-item" data-path="${path}">
        <span class="json-toggle">[</span>
        <div class="json-children">
          ${items}
        </div>
        <span class="json-bracket">]</span>
      </div>
    `;
  }

  createObjectNode(data, path) {
    const items = Object.entries(data).map(([key, value]) => {
      const newPath = path ? `${path}.${key}` : key;
      const valueNode = this.createNode(value, newPath);
      return `
        <div class="json-item" data-path="${newPath}">
          <span class="json-key">"${key}":</span>
          ${valueNode}
        </div>
      `;
    }).join('');

    return `
      <div class="json-item" data-path="${path}">
        <span class="json-toggle">{</span>
        <div class="json-children">
          ${items}
        </div>
        <span class="json-bracket">}</span>
      </div>
    `;
  }

  setupNodeListeners() {
    this.jsonTree.querySelectorAll('.json-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const item = e.target.closest('.json-item');
        this.toggleNode(item);
        e.stopPropagation();
      });
    });
  }

  toggleNode(item) {
    const children = item.querySelector('.json-children');
    const toggle = item.querySelector('.json-toggle');
    if (children) {
      children.classList.toggle('collapsed');
      toggle.classList.toggle('collapsed');
    }
  }

  collapseAll() {
    this.jsonTree.querySelectorAll('.json-children').forEach(child => {
      child.classList.add('collapsed');
    });
    this.jsonTree.querySelectorAll('.json-toggle').forEach(toggle => {
      toggle.classList.add('collapsed');
    });
  }

  expandAll() {
    this.jsonTree.querySelectorAll('.json-children').forEach(child => {
      child.classList.remove('collapsed');
    });
    this.jsonTree.querySelectorAll('.json-toggle').forEach(toggle => {
      toggle.classList.remove('collapsed');
    });
  }

  formatJSON() {
    try {
      const parsed = JSON.parse(this.jsonInput.value);
      this.jsonInput.value = JSON.stringify(parsed, null, 2);
      this.parseAndRender();
    } catch (error) {
      this.errorDisplay.textContent = `Error: ${error.message}`;
    }
  }

  async loadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          this.jsonInput.value = text;
          this.parseAndRender();
        } catch (error) {
          this.errorDisplay.textContent = `Error loading file: ${error.message}`;
        }
      }
    };
    
    input.click();
  }

  saveFile() {
    try {
      const jsonString = JSON.stringify(this.currentJson, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      this.errorDisplay.textContent = `Error saving file: ${error.message}`;
    }
  }
}

// Initialize viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JSONViewer();
}); 