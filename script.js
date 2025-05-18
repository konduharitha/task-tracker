// Common initialization and utilities
document.addEventListener('DOMContentLoaded', () => {
    // Initialize URL hash handling
    const hash = window.location.hash.slice(1);
    if (hash) {
        document.querySelectorAll('[data-tool]').forEach(button => {
            button.classList.toggle('active', button.dataset.tool === hash);
        });
    }
});

