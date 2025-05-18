// Navigation Handler
class Navigation {
    constructor() {
        this.sections = document.querySelectorAll('.tool-section');
        this.buttons = document.querySelectorAll('.action-buttons button');
        this.currentSection = 'task-list'; // Default section
        this.initializeEventListeners();
        this.initializeFromURL();
    }

    initializeEventListeners() {
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const toolId = button.getAttribute('data-tool');
                this.navigateTo(toolId);
            });
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.showSection(e.state.section, false);
            }
        });
    }

    initializeFromURL() {
        // Check if there's a section in the URL hash
        const hash = window.location.hash.slice(1);
        if (hash && this.isSectionValid(hash)) {
            this.navigateTo(hash);
        } else {
            // Show default section
            this.showSection(this.currentSection);
        }
    }

    isSectionValid(sectionId) {
        return !!document.getElementById(sectionId);
    }

    navigateTo(toolId) {
        if (this.currentSection === toolId) return; // Don't navigate if already on the section
        
        // Update URL hash without triggering scroll
        window.history.pushState({ section: toolId }, '', `#${toolId}`);
        this.showSection(toolId);
    }

    showSection(toolId, animate = true) {
        if (!this.isSectionValid(toolId)) return;

        this.currentSection = toolId;

        // Hide all sections with fade out
        this.sections.forEach(section => {
            if (section.id === toolId) {
                if (animate) {
                    section.style.opacity = '0';
                    section.classList.remove('hidden');
                    // Trigger reflow
                    section.offsetHeight;
                    section.style.opacity = '1';
                } else {
                    section.classList.remove('hidden');
                }
            } else {
                section.classList.add('hidden');
            }
        });

        // Update active button state with animation
        this.buttons.forEach(button => {
            const isActive = button.getAttribute('data-tool') === toolId;
            button.classList.toggle('active', isActive);
            
            // Add ripple effect on active button
            if (isActive && animate) {
                this.addRippleEffect(button);
            }
        });

        // Dispatch custom event for section change
        window.dispatchEvent(new CustomEvent('sectionChanged', {
            detail: { section: toolId }
        }));
    }

    addRippleEffect(button) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        button.appendChild(ripple);

        // Get the largest dimension
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        ripple.style.width = ripple.style.height = `${diameter}px`;

        // Position the ripple
        const rect = button.getBoundingClientRect();
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.transform = 'translate(-50%, -50%) scale(1)';

        // Remove the ripple after animation
        setTimeout(() => ripple.remove(), 600);
    }
}

// Initialize Navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
}); 