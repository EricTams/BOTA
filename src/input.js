// BOTA - Input Module
// Handles keyboard and mouse input

const Input = {
    keys: {},
    mouse: { x: 0, y: 0, clicked: false, button: 0, justClicked: false, clickX: 0, clickY: 0 },
    wheelDelta: 0,
    
    // Drag tracking
    drag: {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0
    },

    init() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Mouse events
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // Update drag tracking (only if mouse is clicked)
            if (this.mouse.clicked) {
                this.drag.currentX = e.clientX;
                this.drag.currentY = e.clientY;
                
                // Activate drag if moved more than 3 pixels
                const dx = this.drag.currentX - this.drag.startX;
                const dy = this.drag.currentY - this.drag.startY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 3) {
                    this.drag.active = true;
                }
            }
        });

        window.addEventListener('mousedown', (e) => {
            // AIDEV-NOTE: Check if click is on UI overlay element or other UI elements
            // If so, don't register as game click (prevents UI clicks from passing through to map)
            const uiOverlay = document.getElementById('ui-overlay');
            const viewCargoBtn = document.getElementById('view-cargo-button');
            const viewRepBtn = document.getElementById('view-reputations-button');
            const cargoModal = document.getElementById('cargo-modal');
            const repModal = document.getElementById('reputation-modal');
            
            const clickedOnUI = (uiOverlay && uiOverlay.contains(e.target)) ||
                              (viewCargoBtn && viewCargoBtn.contains(e.target)) ||
                              (viewRepBtn && viewRepBtn.contains(e.target)) ||
                              (cargoModal && cargoModal.contains(e.target)) ||
                              (repModal && repModal.contains(e.target));
            
            this.mouse.clicked = true;
            this.mouse.button = e.button;
            this.mouse.justClicked = !clickedOnUI; // Only set if NOT clicking on UI
            this.mouse.clickX = e.clientX;
            this.mouse.clickY = e.clientY;
            
            // Start drag tracking
            if (!clickedOnUI && (e.button === 0 || e.button === 2)) {
                this.drag.startX = e.clientX;
                this.drag.startY = e.clientY;
                this.drag.currentX = e.clientX;
                this.drag.currentY = e.clientY;
                // Don't set active yet - wait for actual movement
            }
            
            // Prevent context menu on right click
            if (e.button === 2) {
                e.preventDefault();
            }
        });

        window.addEventListener('mouseup', (e) => {
            this.mouse.clicked = false;
            
            // End drag tracking
            this.drag.active = false;
        });

        // Mouse wheel events
        window.addEventListener('wheel', (e) => {
            // Only process zoom if no UI modal is open
            if (!UI.hasActiveOverlay()) {
                e.preventDefault();
                this.wheelDelta += e.deltaY;
            }
        }, { passive: false });

        console.log('Input initialized');
    },

    isKeyPressed(key) {
        return this.keys[key] === true;
    },

    consumeKeyPress(key) {
        if (this.keys[key]) {
            this.keys[key] = false;
            return true;
        }
        return false;
    },

    reset() {
        this.mouse.justClicked = false;
        this.wheelDelta = 0;
    },
    
    // AIDEV-NOTE: Drag helper methods
    isDragging() {
        return this.drag.active;
    },
    
    getDragDelta() {
        return {
            x: this.drag.currentX - this.drag.startX,
            y: this.drag.currentY - this.drag.startY
        };
    }
};

