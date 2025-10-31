// BOTA - Debug Renderer
// Specialized rendering for debug information
// Handles debug overlays, performance metrics, and diagnostic information

const DebugRenderer = {
    // Debug state
    enabled: false,
    showFPS: false,
    showCollisions: false,
    showPaths: false,
    showClickPositions: false,
    showPerformance: false,
    showCamera: false,
    showBounds: false,
    
    // Debug data
    debugData: {
        fps: 0,
        frameTime: 0,
        renderTime: 0,
        updateTime: 0,
        inputTime: 0,
        clickPositions: [],
        camera: { x: 0, y: 0, zoom: 1 },
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 }
    },
    
    // Debug colors
    colors: {
        fps: '#00ff00',
        collision: '#ff0000',
        path: '#ffff00',
        click: '#00ffff',
        camera: '#ff00ff',
        bounds: '#ffffff',
        performance: '#ff8800'
    },
    
    // Debug fonts
    font: '12px monospace',
    titleFont: '14px monospace',
    
    /**
     * Initialize debug renderer
     */
    init() {
        this.enabled = false;
        this.resetDebugData();
        console.log('DebugRenderer initialized');
    },
    
    /**
     * Reset debug data
     */
    resetDebugData() {
        this.debugData = {
            fps: 0,
            frameTime: 0,
            renderTime: 0,
            updateTime: 0,
            inputTime: 0,
            clickPositions: [],
            camera: { x: 0, y: 0, zoom: 1 },
            bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 }
        };
    },
    
    /**
     * Enable debug rendering
     */
    enable() {
        this.enabled = true;
    },
    
    /**
     * Disable debug rendering
     */
    disable() {
        this.enabled = false;
    },
    
    /**
     * Toggle debug rendering
     */
    toggle() {
        this.enabled = !this.enabled;
    },
    
    /**
     * Set debug option
     * @param {string} option - Debug option name
     * @param {boolean} value - Option value
     */
    setOption(option, value) {
        if (this.hasOwnProperty(option)) {
            this[option] = value;
        }
    },
    
    /**
     * Toggle debug option
     * @param {string} option - Debug option name
     */
    toggleOption(option) {
        if (this.hasOwnProperty(option)) {
            this[option] = !this[option];
        }
    },
    
    /**
     * Update debug data
     * @param {Object} data - Debug data
     */
    updateDebugData(data) {
        this.debugData = { ...this.debugData, ...data };
    },
    
    /**
     * Add click position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    addClickPosition(x, y) {
        this.debugData.clickPositions.push({
            x: x,
            y: y,
            timestamp: Date.now()
        });
        
        // Keep only last 10 click positions
        if (this.debugData.clickPositions.length > 10) {
            this.debugData.clickPositions.shift();
        }
    },
    
    /**
     * Clear click positions
     */
    clearClickPositions() {
        this.debugData.clickPositions = [];
    },
    
    /**
     * Render debug information
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     */
    render(ctx, camera) {
        if (!this.enabled) return;
        
        // Save context state
        ctx.save();
        
        // Set debug font
        ctx.font = this.font;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Render debug overlays
        if (this.showFPS) {
            this.renderFPS(ctx);
        }
        
        if (this.showPerformance) {
            this.renderPerformance(ctx);
        }
        
        if (this.showCollisions) {
            this.renderCollisions(ctx, camera);
        }
        
        if (this.showPaths) {
            this.renderPaths(ctx, camera);
        }
        
        if (this.showClickPositions) {
            this.renderClickPositions(ctx, camera);
        }
        
        if (this.showCamera) {
            this.renderCameraInfo(ctx);
        }
        
        if (this.showBounds) {
            this.renderBounds(ctx, camera);
        }
        
        // Restore context state
        ctx.restore();
    },
    
    /**
     * Render FPS counter
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderFPS(ctx) {
        const x = 10;
        const y = 10;
        
        ctx.fillStyle = this.colors.fps;
        ctx.fillText(`FPS: ${this.debugData.fps}`, x, y);
        ctx.fillText(`Frame: ${this.debugData.frameTime.toFixed(2)}ms`, x, y + 15);
    },
    
    /**
     * Render performance metrics
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderPerformance(ctx) {
        const x = 10;
        const y = 50;
        
        ctx.fillStyle = this.colors.performance;
        ctx.font = this.titleFont;
        ctx.fillText('Performance', x, y);
        
        ctx.font = this.font;
        ctx.fillText(`Render: ${this.debugData.renderTime.toFixed(2)}ms`, x, y + 20);
        ctx.fillText(`Update: ${this.debugData.updateTime.toFixed(2)}ms`, x, y + 35);
        ctx.fillText(`Input: ${this.debugData.inputTime.toFixed(2)}ms`, x, y + 50);
    },
    
    /**
     * Render collision information
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     */
    renderCollisions(ctx, camera) {
        // This would render collision boxes, but we need collision data
        // For now, just show a placeholder
        const x = 10;
        const y = 150;
        
        ctx.fillStyle = this.colors.collision;
        ctx.font = this.titleFont;
        ctx.fillText('Collisions', x, y);
        
        ctx.font = this.font;
        ctx.fillText('Collision data not available', x, y + 20);
    },
    
    /**
     * Render path information
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     */
    renderPaths(ctx, camera) {
        // This would render AI boat paths, but we need path data
        // For now, just show a placeholder
        const x = 10;
        const y = 200;
        
        ctx.fillStyle = this.colors.path;
        ctx.font = this.titleFont;
        ctx.fillText('Paths', x, y);
        
        ctx.font = this.font;
        ctx.fillText('Path data not available', x, y + 20);
    },
    
    /**
     * Render click positions
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     */
    renderClickPositions(ctx, camera) {
        if (this.debugData.clickPositions.length === 0) return;
        
        const x = 10;
        const y = 250;
        
        ctx.fillStyle = this.colors.click;
        ctx.font = this.titleFont;
        ctx.fillText('Click Positions', x, y);
        
        ctx.font = this.font;
        
        // Render click positions
        for (let i = 0; i < this.debugData.clickPositions.length; i++) {
            const pos = this.debugData.clickPositions[i];
            const age = Date.now() - pos.timestamp;
            const alpha = Math.max(0, 1 - (age / 5000)); // Fade over 5 seconds
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.colors.click;
            ctx.fillText(`${i + 1}: (${pos.x.toFixed(0)}, ${pos.y.toFixed(0)})`, x, y + 20 + i * 15);
        }
        
        ctx.globalAlpha = 1;
    },
    
    /**
     * Render camera information
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderCameraInfo(ctx) {
        const x = 10;
        const y = 400;
        
        ctx.fillStyle = this.colors.camera;
        ctx.font = this.titleFont;
        ctx.fillText('Camera', x, y);
        
        ctx.font = this.font;
        ctx.fillText(`X: ${this.debugData.camera.x.toFixed(2)}`, x, y + 20);
        ctx.fillText(`Y: ${this.debugData.camera.y.toFixed(2)}`, x, y + 35);
        ctx.fillText(`Zoom: ${this.debugData.camera.zoom.toFixed(2)}`, x, y + 50);
    },
    
    /**
     * Render bounds information
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     */
    renderBounds(ctx, camera) {
        const x = 10;
        const y = 500;
        
        ctx.fillStyle = this.colors.bounds;
        ctx.font = this.titleFont;
        ctx.fillText('Bounds', x, y);
        
        ctx.font = this.font;
        ctx.fillText(`Min: (${this.debugData.bounds.minX}, ${this.debugData.bounds.minY})`, x, y + 20);
        ctx.fillText(`Max: (${this.debugData.bounds.maxX}, ${this.debugData.bounds.maxY})`, x, y + 35);
        
        // Render bounds rectangle
        const bounds = this.debugData.bounds;
        const screenBounds = this.worldToScreen(bounds, camera);
        
        ctx.strokeStyle = this.colors.bounds;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(screenBounds.x, screenBounds.y, screenBounds.width, screenBounds.height);
        ctx.setLineDash([]);
    },
    
    /**
     * Convert world bounds to screen coordinates
     * @param {Object} bounds - World bounds
     * @param {Object} camera - Camera data
     * @returns {Object} Screen bounds
     */
    worldToScreen(bounds, camera) {
        const screenX = (bounds.minX - camera.x) * camera.zoom + camera.screenWidth / 2;
        const screenY = (bounds.minY - camera.y) * camera.zoom + camera.screenHeight / 2;
        const screenWidth = (bounds.maxX - bounds.minX) * camera.zoom;
        const screenHeight = (bounds.maxY - bounds.minY) * camera.zoom;
        
        return {
            x: screenX,
            y: screenY,
            width: screenWidth,
            height: screenHeight
        };
    },
    
    /**
     * Render debug grid
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     * @param {number} gridSize - Grid size in world units
     */
    renderGrid(ctx, camera, gridSize = 100) {
        if (!this.enabled) return;
        
        ctx.save();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        const startX = Math.floor((camera.x - camera.screenWidth / 2 / camera.zoom) / gridSize) * gridSize;
        const endX = Math.ceil((camera.x + camera.screenWidth / 2 / camera.zoom) / gridSize) * gridSize;
        const startY = Math.floor((camera.y - camera.screenHeight / 2 / camera.zoom) / gridSize) * gridSize;
        const endY = Math.ceil((camera.y + camera.screenHeight / 2 / camera.zoom) / gridSize) * gridSize;
        
        // Vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            const screenX = (x - camera.x) * camera.zoom + camera.screenWidth / 2;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, camera.screenHeight);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            const screenY = (y - camera.y) * camera.zoom + camera.screenHeight / 2;
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(camera.screenWidth, screenY);
            ctx.stroke();
        }
        
        ctx.restore();
    },
    
    /**
     * Render debug text at position
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to render
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Text color
     */
    renderText(ctx, text, x, y, color = '#ffffff') {
        if (!this.enabled) return;
        
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = this.font;
        ctx.fillText(text, x, y);
        ctx.restore();
    },
    
    /**
     * Render debug line
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x1 - Start X
     * @param {number} y1 - Start Y
     * @param {number} x2 - End X
     * @param {number} y2 - End Y
     * @param {string} color - Line color
     * @param {number} width - Line width
     */
    renderLine(ctx, x1, y1, x2, y2, color = '#ffffff', width = 1) {
        if (!this.enabled) return;
        
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    },
    
    /**
     * Render debug circle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Circle radius
     * @param {string} color - Circle color
     * @param {boolean} filled - Whether to fill the circle
     */
    renderCircle(ctx, x, y, radius, color = '#ffffff', filled = false) {
        if (!this.enabled) return;
        
        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (filled) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
        
        ctx.restore();
    },
    
    /**
     * Render debug rectangle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {string} color - Rectangle color
     * @param {boolean} filled - Whether to fill the rectangle
     */
    renderRect(ctx, x, y, width, height, color = '#ffffff', filled = false) {
        if (!this.enabled) return;
        
        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        
        if (filled) {
            ctx.fillRect(x, y, width, height);
        } else {
            ctx.strokeRect(x, y, width, height);
        }
        
        ctx.restore();
    },
    
    /**
     * Get debug state
     * @returns {Object} Debug state
     */
    getState() {
        return {
            enabled: this.enabled,
            showFPS: this.showFPS,
            showCollisions: this.showCollisions,
            showPaths: this.showPaths,
            showClickPositions: this.showClickPositions,
            showPerformance: this.showPerformance,
            showCamera: this.showCamera,
            showBounds: this.showBounds
        };
    },
    
    /**
     * Set debug state
     * @param {Object} state - Debug state
     */
    setState(state) {
        Object.assign(this, state);
    }
};
