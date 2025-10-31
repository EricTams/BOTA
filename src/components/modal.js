// BOTA - Modal Component
// Reusable modal/window component for consistent UI patterns
// Handles backdrop, centered content, close handlers, and common modal behaviors

const Modal = {
    /**
     * Create a simple modal with backdrop and centered content
     * @param {Object} options - Configuration object
     * @param {string} options.className - CSS class for the modal backdrop
     * @param {HTMLElement} options.content - Content element to display
     * @param {Function} options.onClose - Callback when modal is closed
     * @param {boolean} options.closeOnBackdrop - Whether clicking backdrop closes modal (default: true)
     * @param {string} options.id - Optional ID for the modal element
     * @returns {HTMLElement} The modal element
     */
    create({ className = 'modal', content, onClose, closeOnBackdrop = true, id = null }) {
        // Remove existing modal with same ID if it exists
        if (id) {
            const existing = document.getElementById(id);
            if (existing) {
                existing.remove();
            }
        }

        // Create modal backdrop
        const modal = document.createElement('div');
        if (id) modal.id = id;
        modal.className = className;
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        // Add content
        if (content) {
            modal.appendChild(content);
        }

        // Add close handler
        if (onClose) {
            modal.onclick = (e) => {
                if (closeOnBackdrop && e.target === modal) {
                    onClose();
                }
            };
        }

        return modal;
    },

    /**
     * Create a complex modal window with title, content, and footer
     * @param {Object} options - Configuration object
     * @param {string} options.title - Modal title
     * @param {HTMLElement} options.content - Main content element
     * @param {HTMLElement} options.footer - Footer element (optional)
     * @param {string} options.className - CSS class for the modal backdrop
     * @param {string} options.windowClassName - CSS class for the window container
     * @param {Function} options.onClose - Callback when modal is closed
     * @param {boolean} options.closeOnBackdrop - Whether clicking backdrop closes modal (default: true)
     * @param {string} options.id - Optional ID for the modal element
     * @returns {HTMLElement} The modal element
     */
    createWindow({ 
        title, 
        content, 
        footer = null, 
        className = 'modal', 
        windowClassName = 'modal-window',
        onClose, 
        closeOnBackdrop = true, 
        id = null 
    }) {
        // Create the window container
        const window = document.createElement('div');
        window.className = windowClassName;
        window.style.cssText = `
            background: linear-gradient(135deg, #2a1810 0%, #1a0f0a 100%);
            border: 3px solid #8b4513;
            border-radius: 10px;
            padding: 30px;
            max-width: 90vw;
            max-height: 90vh;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            overflow-y: auto;
        `;

        // Add title if provided
        if (title) {
            const titleEl = document.createElement('h2');
            titleEl.textContent = title;
            titleEl.style.cssText = `
                color: #d4af37;
                margin: 0 0 20px 0;
                font-size: 24px;
            `;
            window.appendChild(titleEl);
        }

        // Add content
        if (content) {
            window.appendChild(content);
        }

        // Add footer
        if (footer) {
            window.appendChild(footer);
        }

        // Create modal with the window
        return this.create({
            className,
            content: window,
            onClose,
            closeOnBackdrop,
            id
        });
    },

    /**
     * Create a cargo-style modal window (specific styling for cargo/reputation windows)
     * @param {Object} options - Configuration object
     * @param {string} options.title - Window title
     * @param {HTMLElement} options.content - Main content element
     * @param {HTMLElement} options.footer - Footer element (optional)
     * @param {Function} options.onClose - Callback when modal is closed
     * @param {string} options.id - Optional ID for the modal element
     * @returns {HTMLElement} The modal element
     */
    createCargoWindow({ title, content, footer = null, onClose, id = null }) {
        const window = document.createElement('div');
        window.className = 'cargo-window';
        window.style.cssText = `
            background: linear-gradient(135deg, #1a0f0a 0%, #0f0a05 100%);
            border: 2px solid #8b4513;
            border-radius: 8px;
            padding: 20px;
            max-width: 80vw;
            max-height: 80vh;
            min-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
            overflow-y: auto;
        `;

        // Add title
        if (title) {
            const titleEl = document.createElement('h2');
            titleEl.textContent = title;
            titleEl.style.cssText = `
                color: #d4af37;
                margin: 0 0 20px 0;
                font-size: 20px;
                text-align: center;
            `;
            window.appendChild(titleEl);
        }

        // Add content
        if (content) {
            window.appendChild(content);
        }

        // Add footer
        if (footer) {
            window.appendChild(footer);
        }

        return this.create({
            className: 'cargo-modal',
            content: window,
            onClose,
            closeOnBackdrop: true,
            id
        });
    },

    /**
     * Create a port-style modal window (specific styling for port screens)
     * @param {Object} options - Configuration object
     * @param {HTMLElement} options.content - Main content element
     * @param {Function} options.onClose - Callback when modal is closed
     * @param {string} options.id - Optional ID for the modal element
     * @returns {HTMLElement} The modal element
     */
    createPortWindow({ content, onClose, id = null }) {
        const window = document.createElement('div');
        window.className = 'port-modal';
        window.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        // Add content
        if (content) {
            window.appendChild(content);
        }

        // Add close handler
        if (onClose) {
            window.onclick = (e) => {
                if (e.target === window) {
                    onClose();
                }
            };
        }

        if (id) window.id = id;
        return window;
    },

    /**
     * Show a modal by appending it to the UI overlay
     * @param {HTMLElement} modal - Modal element to show
     * @param {HTMLElement} container - Container to append to (defaults to ui-overlay)
     */
    show(modal, container = null) {
        if (!container) {
            container = document.getElementById('ui-overlay');
        }
        if (container) {
            container.appendChild(modal);
        }
    },

    /**
     * Hide a modal by removing it from the DOM
     * @param {string|HTMLElement} modal - Modal ID or element to hide
     */
    hide(modal) {
        let element;
        if (typeof modal === 'string') {
            element = document.getElementById(modal);
        } else {
            element = modal;
        }
        
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },

    /**
     * Create a close button element
     * @param {Function} onClick - Click handler
     * @param {string} text - Button text (default: 'Close')
     * @param {string} className - CSS class (default: 'menu-button')
     * @returns {HTMLElement} Close button element
     */
    createCloseButton(onClick, text = 'Close', className = 'menu-button') {
        const button = document.createElement('button');
        button.className = className;
        button.textContent = text;
        button.onclick = onClick;
        return button;
    }
};
