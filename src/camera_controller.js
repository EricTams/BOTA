// BOTA - Camera Controller
// Handles camera movement, zooming, and following
// Separated from game logic for better organization

const CameraController = {
    // Camera state
    camera: {
        x: 0,
        y: 0,
        zoom: 1,
        targetX: 0,
        targetY: 0,
        targetZoom: 1,
        smoothing: 0.1,
        minZoom: 0.5,
        maxZoom: 3.0,
        bounds: {
            minX: -4096,
            maxX: 4096,
            minY: -4096,
            maxY: 4096
        }
    },
    
    // Following target
    followTarget: null,
    followOffset: { x: 0, y: 0 },
    
    // Shake effect
    shake: {
        intensity: 0,
        duration: 0,
        currentTime: 0,
        offsetX: 0,
        offsetY: 0
    },
    
    // Screen dimensions
    screenWidth: 0,
    screenHeight: 0,
    
    /**
     * Initialize camera controller
     * @param {number} screenWidth - Screen width
     * @param {number} screenHeight - Screen height
     */
    init(screenWidth, screenHeight) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.reset();
        console.log('CameraController initialized');
    },
    
    /**
     * Reset camera to default state
     */
    reset() {
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.zoom = 1;
        this.camera.targetX = 0;
        this.camera.targetY = 0;
        this.camera.targetZoom = 1;
        
        this.followTarget = null;
        this.followOffset = { x: 0, y: 0 };
        
        this.shake.intensity = 0;
        this.shake.duration = 0;
        this.shake.currentTime = 0;
        this.shake.offsetX = 0;
        this.shake.offsetY = 0;
    },
    
    /**
     * Update camera position
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Update shake effect
        this.updateShake(deltaTime);
        
        // Update camera smoothing
        this.updateSmoothing(deltaTime);
        
        // Update following target
        this.updateFollowing(deltaTime);
        
        // Apply bounds
        this.applyBounds();
    },
    
    /**
     * Update camera smoothing
     * @param {number} deltaTime - Time since last frame
     */
    updateSmoothing(deltaTime) {
        const smoothing = this.camera.smoothing * deltaTime * 60; // Normalize to 60fps
        
        this.camera.x += (this.camera.targetX - this.camera.x) * smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * smoothing;
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * smoothing;
    },
    
    /**
     * Update following target
     * @param {number} deltaTime - Time since last frame
     */
    updateFollowing(deltaTime) {
        if (!this.followTarget) return;
        
        // Calculate target position
        const targetX = this.followTarget.x + this.followOffset.x;
        const targetY = this.followTarget.y + this.followOffset.y;
        
        // Set camera target
        this.setTarget(targetX, targetY);
    },
    
    /**
     * Update shake effect
     * @param {number} deltaTime - Time since last frame
     */
    updateShake(deltaTime) {
        if (this.shake.duration <= 0) {
            this.shake.offsetX = 0;
            this.shake.offsetY = 0;
            return;
        }
        
        this.shake.currentTime += deltaTime;
        this.shake.duration -= deltaTime;
        
        if (this.shake.duration <= 0) {
            this.shake.offsetX = 0;
            this.shake.offsetY = 0;
            return;
        }
        
        // Calculate shake intensity (fade out over time)
        const intensity = this.shake.intensity * (this.shake.duration / this.shake.currentTime);
        
        // Generate random shake offset
        this.shake.offsetX = (Math.random() - 0.5) * intensity * 2;
        this.shake.offsetY = (Math.random() - 0.5) * intensity * 2;
    },
    
    /**
     * Apply camera bounds
     */
    applyBounds() {
        const bounds = this.camera.bounds;
        
        this.camera.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.camera.x));
        this.camera.y = Math.max(bounds.minY, Math.min(bounds.maxY, this.camera.y));
        this.camera.zoom = Math.max(this.camera.minZoom, Math.min(this.camera.maxZoom, this.camera.zoom));
    },
    
    /**
     * Set camera target position
     * @param {number} x - Target X position
     * @param {number} y - Target Y position
     * @param {number} zoom - Target zoom level (optional)
     */
    setTarget(x, y, zoom = null) {
        this.camera.targetX = x;
        this.camera.targetY = y;
        if (zoom !== null) {
            this.camera.targetZoom = zoom;
        }
    },
    
    /**
     * Set camera position immediately
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} zoom - Zoom level (optional)
     */
    setPosition(x, y, zoom = null) {
        this.camera.x = x;
        this.camera.y = y;
        this.camera.targetX = x;
        this.camera.targetY = y;
        if (zoom !== null) {
            this.camera.zoom = zoom;
            this.camera.targetZoom = zoom;
        }
    },
    
    /**
     * Move camera by offset
     * @param {number} deltaX - X offset
     * @param {number} deltaY - Y offset
     */
    move(deltaX, deltaY) {
        this.camera.targetX += deltaX;
        this.camera.targetY += deltaY;
    },
    
    /**
     * Zoom camera
     * @param {number} deltaZoom - Zoom change
     * @param {number} centerX - Zoom center X (screen coordinates)
     * @param {number} centerY - Zoom center Y (screen coordinates)
     */
    zoom(deltaZoom, centerX = null, centerY = null) {
        const newZoom = Math.max(this.camera.minZoom, Math.min(this.camera.maxZoom, this.camera.targetZoom + deltaZoom));
        
        if (centerX !== null && centerY !== null) {
            // Zoom towards specific point
            const worldX = this.screenToWorld(centerX, centerY).x;
            const worldY = this.screenToWorld(centerX, centerY).y;
            
            this.camera.targetZoom = newZoom;
            
            // Adjust camera position to keep world point under cursor
            const newWorldX = this.screenToWorld(centerX, centerY).x;
            const newWorldY = this.screenToWorld(centerX, centerY).y;
            
            this.camera.targetX += worldX - newWorldX;
            this.camera.targetY += worldY - newWorldY;
        } else {
            this.camera.targetZoom = newZoom;
        }
    },
    
    /**
     * Set zoom level
     * @param {number} zoom - Zoom level
     * @param {number} centerX - Zoom center X (screen coordinates)
     * @param {number} centerY - Zoom center Y (screen coordinates)
     */
    setZoom(zoom, centerX = null, centerY = null) {
        const newZoom = Math.max(this.camera.minZoom, Math.min(this.camera.maxZoom, zoom));
        
        if (centerX !== null && centerY !== null) {
            // Zoom towards specific point
            const worldX = this.screenToWorld(centerX, centerY).x;
            const worldY = this.screenToWorld(centerX, centerY).y;
            
            this.camera.targetZoom = newZoom;
            
            // Adjust camera position to keep world point under cursor
            const newWorldX = this.screenToWorld(centerX, centerY).x;
            const newWorldY = this.screenToWorld(centerX, centerY).y;
            
            this.camera.targetX += worldX - newWorldX;
            this.camera.targetY += worldY - newWorldY;
        } else {
            this.camera.targetZoom = newZoom;
        }
    },
    
    /**
     * Start following a target
     * @param {Object} target - Target object with x, y properties
     * @param {number} offsetX - X offset from target
     * @param {number} offsetY - Y offset from target
     */
    startFollowing(target, offsetX = 0, offsetY = 0) {
        this.followTarget = target;
        this.followOffset = { x: offsetX, y: offsetY };
    },
    
    /**
     * Stop following target
     */
    stopFollowing() {
        this.followTarget = null;
        this.followOffset = { x: 0, y: 0 };
    },
    
    /**
     * Start camera shake
     * @param {number} intensity - Shake intensity
     * @param {number} duration - Shake duration in seconds
     */
    startShake(intensity, duration) {
        this.shake.intensity = intensity;
        this.shake.duration = duration;
        this.shake.currentTime = 0;
    },
    
    /**
     * Stop camera shake
     */
    stopShake() {
        this.shake.duration = 0;
        this.shake.offsetX = 0;
        this.shake.offsetY = 0;
    },
    
    /**
     * Convert screen coordinates to world coordinates
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @returns {Object} World coordinates {x, y}
     */
    screenToWorld(screenX, screenY) {
        const worldX = (screenX - this.screenWidth / 2) / this.camera.zoom + this.camera.x;
        const worldY = (screenY - this.screenHeight / 2) / this.camera.zoom + this.camera.y;
        return { x: worldX, y: worldY };
    },
    
    /**
     * Convert world coordinates to screen coordinates
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @returns {Object} Screen coordinates {x, y}
     */
    worldToScreen(worldX, worldY) {
        const screenX = (worldX - this.camera.x) * this.camera.zoom + this.screenWidth / 2;
        const screenY = (worldY - this.camera.y) * this.camera.zoom + this.screenHeight / 2;
        return { x: screenX, y: screenY };
    },
    
    /**
     * Check if a world point is visible on screen
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @param {number} margin - Margin around screen (optional)
     * @returns {boolean} Whether point is visible
     */
    isVisible(worldX, worldY, margin = 0) {
        const screen = this.worldToScreen(worldX, worldY);
        return screen.x >= -margin && screen.x <= this.screenWidth + margin &&
               screen.y >= -margin && screen.y <= this.screenHeight + margin;
    },
    
    /**
     * Get visible world bounds
     * @returns {Object} Visible bounds {minX, maxX, minY, maxY}
     */
    getVisibleBounds() {
        const halfWidth = this.screenWidth / 2 / this.camera.zoom;
        const halfHeight = this.screenHeight / 2 / this.camera.zoom;
        
        return {
            minX: this.camera.x - halfWidth,
            maxX: this.camera.x + halfWidth,
            minY: this.camera.y - halfHeight,
            maxY: this.camera.y + halfHeight
        };
    },
    
    /**
     * Center camera on a world point
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @param {number} zoom - Zoom level (optional)
     */
    centerOn(worldX, worldY, zoom = null) {
        this.setTarget(worldX, worldY, zoom);
    },
    
    /**
     * Fit camera to show a rectangular area
     * @param {number} minX - Minimum X coordinate
     * @param {number} minY - Minimum Y coordinate
     * @param {number} maxX - Maximum X coordinate
     * @param {number} maxY - Maximum Y coordinate
     * @param {number} padding - Padding around area (optional)
     */
    fitToArea(minX, minY, maxX, maxY, padding = 50) {
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const width = maxX - minX + padding * 2;
        const height = maxY - minY + padding * 2;
        
        // Calculate zoom to fit area
        const zoomX = this.screenWidth / width;
        const zoomY = this.screenHeight / height;
        const zoom = Math.min(zoomX, zoomY, this.camera.maxZoom);
        
        this.setTarget(centerX, centerY, zoom);
    },
    
    /**
     * Set camera bounds
     * @param {number} minX - Minimum X coordinate
     * @param {number} minY - Minimum Y coordinate
     * @param {number} maxX - Maximum X coordinate
     * @param {number} maxY - Maximum Y coordinate
     */
    setBounds(minX, minY, maxX, maxY) {
        this.camera.bounds = { minX, minY, maxX, maxY };
    },
    
    /**
     * Set zoom limits
     * @param {number} minZoom - Minimum zoom level
     * @param {number} maxZoom - Maximum zoom level
     */
    setZoomLimits(minZoom, maxZoom) {
        this.camera.minZoom = minZoom;
        this.camera.maxZoom = maxZoom;
    },
    
    /**
     * Set camera smoothing
     * @param {number} smoothing - Smoothing factor (0-1)
     */
    setSmoothing(smoothing) {
        this.camera.smoothing = Math.max(0, Math.min(1, smoothing));
    },
    
    /**
     * Get camera state
     * @returns {Object} Camera state
     */
    getState() {
        return {
            x: this.camera.x + this.shake.offsetX,
            y: this.camera.y + this.shake.offsetY,
            zoom: this.camera.zoom,
            targetX: this.camera.targetX,
            targetY: this.camera.targetY,
            targetZoom: this.camera.targetZoom
        };
    },
    
    /**
     * Get camera data for rendering
     * @returns {Object} Camera data for renderer
     */
    getCameraData() {
        return {
            x: this.camera.x + this.shake.offsetX,
            y: this.camera.y + this.shake.offsetY,
            zoom: this.camera.zoom,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight
        };
    }
};
