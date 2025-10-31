// BOTA - Debug Window Component
// Reusable floating debug windows with title, content, and buttons
// Handles consistent styling for debug tools and development utilities

const DebugWindow = {
    /**
     * Create a floating debug window
     * @param {Object} options - Configuration object
     * @param {string} options.id - Unique ID for the window
     * @param {string} options.title - Window title
     * @param {HTMLElement} options.content - Main content element
     * @param {Array} options.buttons - Array of button configurations
     * @param {string} options.buttons[].text - Button text
     * @param {Function} options.buttons[].onClick - Click handler
     * @param {string} options.buttons[].className - CSS class (optional)
     * @param {Object} options.position - Window position
     * @param {number} options.position.top - Top position in pixels
     * @param {number} options.position.left - Left position in pixels
     * @param {string} options.className - CSS class for the window (default: 'debug-window')
     * @returns {HTMLElement} The debug window element
     */
    create({
        id,
        title,
        content,
        buttons = [],
        position = { top: 100, left: 20 },
        className = 'debug-window'
    }) {
        // Remove existing window with same ID if it exists
        if (id) {
            const existing = document.getElementById(id);
            if (existing) {
                existing.remove();
            }
        }

        // Create window container
        const window = document.createElement('div');
        if (id) window.id = id;
        window.className = className;
        window.style.cssText = `
            position: fixed;
            top: ${position.top}px;
            left: ${position.left}px;
            background: rgba(20, 30, 40, 0.95);
            border: 2px solid #8b7355;
            border-radius: 8px;
            padding: 15px;
            min-width: 300px;
            max-width: 500px;
            max-height: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
            z-index: 1000;
            display: flex;
            flex-direction: column;
        `;

        // Create title
        if (title) {
            const titleEl = document.createElement('div');
            titleEl.className = 'debug-window-title';
            titleEl.textContent = title;
            titleEl.style.cssText = `
                font-size: 16px;
                font-weight: bold;
                color: #f0e6d2;
                margin-bottom: 10px;
                text-align: center;
                border-bottom: 1px solid #8b7355;
                padding-bottom: 8px;
            `;
            window.appendChild(titleEl);
        }

        // Create content area
        if (content) {
            const contentArea = document.createElement('div');
            contentArea.className = 'debug-window-content';
            contentArea.style.cssText = `
                flex: 1;
                overflow-y: auto;
                margin-bottom: 10px;
                min-height: 100px;
                max-height: 300px;
                color: #aaa;
                font-size: 12px;
                padding: 8px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
            `;
            contentArea.appendChild(content);
            window.appendChild(contentArea);
        }

        // Create buttons
        if (buttons.length > 0) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'debug-window-buttons';
            buttonContainer.style.cssText = `
                display: flex;
                gap: 10px;
                justify-content: space-between;
            `;

            buttons.forEach(buttonConfig => {
                const button = document.createElement('button');
                button.textContent = buttonConfig.text;
                button.className = buttonConfig.className || 'debug-window-btn';
                button.style.cssText = `
                    padding: 6px 12px;
                    background: linear-gradient(145deg, #2c3e50, #34495e);
                    border: 2px solid #8b7355;
                    border-radius: 4px;
                    color: #fff;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex: 1;
                `;
                button.onclick = buttonConfig.onClick;
                button.onmouseover = () => {
                    button.style.background = 'linear-gradient(145deg, #34495e, #2c3e50)';
                    button.style.transform = 'translateY(-1px)';
                };
                button.onmouseout = () => {
                    button.style.background = 'linear-gradient(145deg, #2c3e50, #34495e)';
                    button.style.transform = 'translateY(0)';
                };
                buttonContainer.appendChild(button);
            });

            window.appendChild(buttonContainer);
        }

        return window;
    },

    /**
     * Create a click position window (specific debug tool)
     * @param {Function} onClear - Clear button handler
     * @param {Function} onCopy - Copy button handler
     * @returns {HTMLElement} The click position window
     */
    createClickPositionWindow(onClear, onCopy) {
        const content = document.createElement('div');
        content.id = 'click-position-list';
        content.className = 'click-position-list';
        content.textContent = 'Click on the map to record positions...';

        return this.create({
            id: 'click-position-window',
            title: 'Click Positions',
            content: content,
            buttons: [
                {
                    text: 'Clear',
                    onClick: onClear,
                    className: 'click-position-btn'
                },
                {
                    text: 'Copy',
                    onClick: onCopy,
                    className: 'click-position-btn'
                }
            ],
            position: { top: 100, left: 20 }
        });
    },

    /**
     * Create a port edit window (specific debug tool)
     * @param {Function} onCopy - Copy button handler
     * @returns {HTMLElement} The port edit window
     */
    createPortEditWindow(onCopy) {
        const instructions = document.createElement('div');
        instructions.className = 'port-edit-instructions';
        instructions.innerHTML = 'Drag ports to reposition them.<br>Shift+click to flip horizontally.<br>Click Copy to export updated data.';
        instructions.style.cssText = `
            color: #ccc;
            font-size: 12px;
            margin-bottom: 10px;
            text-align: center;
        `;

        const content = document.createElement('div');
        content.appendChild(instructions);

        return this.create({
            id: 'port-edit-window',
            title: 'Port Editor',
            content: content,
            buttons: [
                {
                    text: 'Copy Port Data',
                    onClick: onCopy,
                    className: 'port-edit-btn'
                }
            ],
            position: { top: 100, left: 20 }
        });
    },

    /**
     * Create a trade log window (specific debug tool)
     * @param {string} portName - Port name for title
     * @param {HTMLElement} logContent - Log content element
     * @param {Function} onClose - Close button handler
     * @returns {HTMLElement} The trade log window
     */
    createTradeLogWindow(portName, logContent, onClose) {
        return this.create({
            id: 'trade-log-window',
            title: `Trade Log: ${portName}`,
            content: logContent,
            buttons: [
                {
                    text: 'Close',
                    onClick: onClose,
                    className: 'cargo-close-btn'
                }
            ],
            position: { top: 100, left: 20 },
            className: 'cargo-modal'
        });
    },

    /**
     * Create a production/consumption analysis window (specific debug tool)
     * @param {HTMLElement} analysisContent - Analysis content element
     * @param {Function} onClose - Close button handler
     * @returns {HTMLElement} The analysis window
     */
    createAnalysisWindow(analysisContent, onClose) {
        return this.create({
            id: 'analysis-window',
            title: 'Production vs Consumption Analysis',
            content: analysisContent,
            buttons: [
                {
                    text: 'Close',
                    onClick: onClose,
                    className: 'cargo-close-btn'
                }
            ],
            position: { top: 100, left: 20 },
            className: 'cargo-modal'
        });
    },

    /**
     * Show a debug window by appending it to the UI overlay
     * @param {HTMLElement} window - Debug window element to show
     * @param {HTMLElement} container - Container to append to (defaults to ui-overlay)
     */
    show(window, container = null) {
        if (!container) {
            container = document.getElementById('ui-overlay');
        }
        if (container) {
            container.appendChild(window);
        }
    },

    /**
     * Hide a debug window by removing it from the DOM
     * @param {string|HTMLElement} window - Window ID or element to hide
     */
    hide(window) {
        let element;
        if (typeof window === 'string') {
            element = document.getElementById(window);
        } else {
            element = window;
        }
        
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },

    /**
     * Update click position list content
     * @param {string} windowId - Window ID
     * @param {Array} positions - Array of position strings
     */
    updateClickPositions(windowId, positions) {
        const list = document.getElementById('click-position-list');
        if (!list) return;

        if (positions.length === 0) {
            list.textContent = 'Click on the map to record positions...';
            list.className = 'click-position-list';
        } else {
            list.innerHTML = '';
            list.className = 'click-position-list with-content';
            positions.forEach((pos, index) => {
                const item = document.createElement('div');
                item.className = 'click-position-item';
                item.textContent = pos;
                item.style.cssText = `
                    padding: 4px 0;
                    border-bottom: 1px solid rgba(139, 115, 85, 0.2);
                `;
                list.appendChild(item);
            });
        }
    }
};
