// BOTA - Game Loop Manager
// Centralized game loop management with separate render and simulation loops
// Handles timing, frame rate control, and loop coordination

const GameLoop = {
    // Loop state
    running: false,
    paused: false,
    
    // Timing
    lastFrameTime: 0,
    deltaTime: 0,
    frameCount: 0,
    fps: 0,
    fpsUpdateTime: 0,
    
    // Loop configuration
    targetFPS: 60,
    maxDeltaTime: 1/30, // Cap delta time to prevent large jumps
    simulationRate: 60, // Simulation updates per second
    
    // Loop callbacks
    renderCallback: null,
    updateCallback: null,
    inputCallback: null,
    
    // Performance monitoring
    performance: {
        frameTime: 0,
        renderTime: 0,
        updateTime: 0,
        inputTime: 0
    },
    
    // Animation frame ID
    animationFrameId: null,
    
    /**
     * Initialize game loop
     * @param {Function} renderCallback - Render function
     * @param {Function} updateCallback - Update function
     * @param {Function} inputCallback - Input function
     */
    init(renderCallback, updateCallback, inputCallback) {
        this.renderCallback = renderCallback;
        this.updateCallback = updateCallback;
        this.inputCallback = inputCallback;
        
        console.log('GameLoop initialized');
    },
    
    /**
     * Start the game loop
     */
    start() {
        if (this.running) return;
        
        this.running = true;
        this.paused = false;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateTime = 0;
        
        this.loop();
        console.log('Game loop started');
    },
    
    /**
     * Stop the game loop
     */
    stop() {
        this.running = false;
        this.paused = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        console.log('Game loop stopped');
    },
    
    /**
     * Pause the game loop
     */
    pause() {
        this.paused = true;
        console.log('Game loop paused');
    },
    
    /**
     * Resume the game loop
     */
    resume() {
        this.paused = false;
        console.log('Game loop resumed');
    },
    
    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.paused) {
            this.resume();
        } else {
            this.pause();
        }
    },
    
    /**
     * Main game loop
     */
    loop() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        this.deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, this.maxDeltaTime);
        this.lastFrameTime = currentTime;
        
        // Update performance monitoring
        this.updatePerformance(currentTime);
        
        // Handle input
        if (this.inputCallback && !this.paused) {
            const inputStart = performance.now();
            this.inputCallback(this.deltaTime);
            this.performance.inputTime = performance.now() - inputStart;
        }
        
        // Update game logic
        if (this.updateCallback && !this.paused) {
            const updateStart = performance.now();
            this.updateCallback(this.deltaTime);
            this.performance.updateTime = performance.now() - updateStart;
        }
        
        // Render frame
        if (this.renderCallback) {
            const renderStart = performance.now();
            this.renderCallback(this.deltaTime);
            this.performance.renderTime = performance.now() - renderStart;
        }
        
        // Continue loop
        this.animationFrameId = requestAnimationFrame(() => this.loop());
    },
    
    /**
     * Update performance monitoring
     * @param {number} currentTime - Current time
     */
    updatePerformance(currentTime) {
        this.frameCount++;
        this.performance.frameTime = this.deltaTime * 1000; // Convert to milliseconds
        
        // Update FPS every second
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
        }
    },
    
    /**
     * Set target FPS
     * @param {number} fps - Target FPS
     */
    setTargetFPS(fps) {
        this.targetFPS = Math.max(1, Math.min(120, fps));
    },
    
    /**
     * Set simulation rate
     * @param {number} rate - Simulation updates per second
     */
    setSimulationRate(rate) {
        this.simulationRate = Math.max(1, Math.min(120, rate));
    },
    
    /**
     * Set maximum delta time
     * @param {number} maxDelta - Maximum delta time in seconds
     */
    setMaxDeltaTime(maxDelta) {
        this.maxDeltaTime = Math.max(0.001, maxDelta);
    },
    
    /**
     * Get current FPS
     * @returns {number} Current FPS
     */
    getFPS() {
        return this.fps;
    },
    
    /**
     * Get current delta time
     * @returns {number} Current delta time in seconds
     */
    getDeltaTime() {
        return this.deltaTime;
    },
    
    /**
     * Get performance data
     * @returns {Object} Performance data
     */
    getPerformance() {
        return {
            fps: this.fps,
            frameTime: this.performance.frameTime,
            renderTime: this.performance.renderTime,
            updateTime: this.performance.updateTime,
            inputTime: this.performance.inputTime,
            running: this.running,
            paused: this.paused
        };
    },
    
    /**
     * Check if loop is running
     * @returns {boolean} Whether loop is running
     */
    isRunning() {
        return this.running;
    },
    
    /**
     * Check if loop is paused
     * @returns {boolean} Whether loop is paused
     */
    isPaused() {
        return this.paused;
    },
    
    /**
     * Force a single frame update
     */
    forceUpdate() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        this.deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, this.maxDeltaTime);
        this.lastFrameTime = currentTime;
        
        // Update game logic
        if (this.updateCallback) {
            this.updateCallback(this.deltaTime);
        }
        
        // Render frame
        if (this.renderCallback) {
            this.renderCallback(this.deltaTime);
        }
    },
    
    /**
     * Get frame count since start
     * @returns {number} Frame count
     */
    getFrameCount() {
        return this.frameCount;
    },
    
    /**
     * Reset performance counters
     */
    resetPerformance() {
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateTime = 0;
        this.performance.frameTime = 0;
        this.performance.renderTime = 0;
        this.performance.updateTime = 0;
        this.performance.inputTime = 0;
    },
    
    /**
     * Set render callback
     * @param {Function} callback - Render function
     */
    setRenderCallback(callback) {
        this.renderCallback = callback;
    },
    
    /**
     * Set update callback
     * @param {Function} callback - Update function
     */
    setUpdateCallback(callback) {
        this.updateCallback = callback;
    },
    
    /**
     * Set input callback
     * @param {Function} callback - Input function
     */
    setInputCallback(callback) {
        this.inputCallback = callback;
    },
    
    /**
     * Get loop configuration
     * @returns {Object} Loop configuration
     */
    getConfig() {
        return {
            targetFPS: this.targetFPS,
            maxDeltaTime: this.maxDeltaTime,
            simulationRate: this.simulationRate,
            running: this.running,
            paused: this.paused
        };
    },
    
    /**
     * Set loop configuration
     * @param {Object} config - Loop configuration
     */
    setConfig(config) {
        if (config.targetFPS !== undefined) {
            this.setTargetFPS(config.targetFPS);
        }
        if (config.maxDeltaTime !== undefined) {
            this.setMaxDeltaTime(config.maxDeltaTime);
        }
        if (config.simulationRate !== undefined) {
            this.setSimulationRate(config.simulationRate);
        }
    }
};
