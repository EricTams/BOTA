// BOTA - Render Pipeline
// Modular rendering pipeline that coordinates all rendering systems
// Handles render order, layer management, and rendering optimization

const RenderPipeline = {
    // Pipeline state
    initialized: false,
    enabled: true,
    
    // Render systems
    systems: new Map(),
    
    // Render order
    renderOrder: [
        'background',
        'terrain',
        'water',
        'ports',
        'boats',
        'particles',
        'ui',
        'debug'
    ],
    
    // Render layers
    layers: null,
    
    // Debug renderer
    debugRenderer: null,
    
    // Performance monitoring
    performance: {
        frameTime: 0,
        renderTime: 0,
        layerTimes: new Map()
    },
    
    // Render settings
    settings: {
        enableLayers: true,
        enableDebug: true,
        enablePerformanceMonitoring: true,
        cullOffscreen: true,
        enableBatching: true
    },
    
    /**
     * Initialize render pipeline
     * @param {Object} options - Pipeline options
     */
    init(options = {}) {
        this.settings = { ...this.settings, ...options };
        this.systems.clear();
        this.performance.layerTimes.clear();
        
        // Initialize render layers
        if (this.settings.enableLayers) {
            this.layers = RenderLayers;
            this.layers.init();
        }
        
        // Initialize debug renderer
        if (this.settings.enableDebug) {
            this.debugRenderer = DebugRenderer;
            this.debugRenderer.init();
        }
        
        this.initialized = true;
        console.log('RenderPipeline initialized');
    },
    
    /**
     * Register render system
     * @param {string} name - System name
     * @param {Object} system - Render system object
     * @param {number} priority - Render priority (higher = later)
     */
    registerSystem(name, system, priority = 0) {
        this.systems.set(name, {
            system: system,
            priority: priority,
            enabled: true
        });
        
        // Sort systems by priority
        const sortedSystems = Array.from(this.systems.entries())
            .sort((a, b) => a[1].priority - b[1].priority);
        
        this.systems.clear();
        for (const [name, data] of sortedSystems) {
            this.systems.set(name, data);
        }
    },
    
    /**
     * Unregister render system
     * @param {string} name - System name
     */
    unregisterSystem(name) {
        this.systems.delete(name);
    },
    
    /**
     * Enable/disable render system
     * @param {string} name - System name
     * @param {boolean} enabled - Whether system is enabled
     */
    setSystemEnabled(name, enabled) {
        if (this.systems.has(name)) {
            this.systems.get(name).enabled = enabled;
        }
    },
    
    /**
     * Render frame
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     * @param {Object} gameState - Game state
     */
    render(ctx, camera, gameState) {
        if (!this.initialized || !this.enabled) return;
        
        const startTime = performance.now();
        
        // Clear canvas
        this.clearCanvas(ctx, camera);
        
        // Render using layers if enabled
        if (this.settings.enableLayers && this.layers) {
            this.renderWithLayers(ctx, camera, gameState);
        } else {
            this.renderWithSystems(ctx, camera, gameState);
        }
        
        // Render debug information
        if (this.settings.enableDebug && this.debugRenderer) {
            this.renderDebug(ctx, camera, gameState);
        }
        
        // Update performance metrics
        if (this.settings.enablePerformanceMonitoring) {
            this.updatePerformanceMetrics(startTime);
        }
    },
    
    /**
     * Clear canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     */
    clearCanvas(ctx, camera) {
        ctx.fillStyle = '#0a0e1a';
        ctx.fillRect(0, 0, camera.screenWidth, camera.screenHeight);
    },
    
    /**
     * Render using layer system
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     * @param {Object} gameState - Game state
     */
    renderWithLayers(ctx, camera, gameState) {
        // Render each layer in order
        for (const layerName of this.renderOrder) {
            const layerStartTime = performance.now();
            
            if (this.layers.isLayerVisible(layerName)) {
                this.layers.renderLayer(ctx, camera, layerName);
            }
            
            // Update layer performance
            if (this.settings.enablePerformanceMonitoring) {
                const layerTime = performance.now() - layerStartTime;
                this.performance.layerTimes.set(layerName, layerTime);
            }
        }
    },
    
    /**
     * Render using system registry
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     * @param {Object} gameState - Game state
     */
    renderWithSystems(ctx, camera, gameState) {
        // Render each system in priority order
        for (const [name, systemData] of this.systems) {
            if (systemData.enabled && systemData.system.render) {
                const systemStartTime = performance.now();
                
                try {
                    systemData.system.render(ctx, camera, gameState);
                } catch (error) {
                    console.error(`Error rendering system ${name}:`, error);
                }
                
                // Update system performance
                if (this.settings.enablePerformanceMonitoring) {
                    const systemTime = performance.now() - systemStartTime;
                    this.performance.layerTimes.set(name, systemTime);
                }
            }
        }
    },
    
    /**
     * Render debug information
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     * @param {Object} gameState - Game state
     */
    renderDebug(ctx, camera, gameState) {
        // Update debug data
        this.updateDebugData(camera, gameState);
        
        // Render debug overlays
        this.debugRenderer.render(ctx, camera);
    },
    
    /**
     * Update debug data
     * @param {Object} camera - Camera data
     * @param {Object} gameState - Game state
     */
    updateDebugData(camera, gameState) {
        if (!this.debugRenderer) return;
        
        // Update camera data
        this.debugRenderer.updateDebugData({
            camera: {
                x: camera.x,
                y: camera.y,
                zoom: camera.zoom
            }
        });
        
        // Update performance data
        if (gameState.performance) {
            this.debugRenderer.updateDebugData({
                fps: gameState.performance.fps || 0,
                frameTime: gameState.performance.frameTime || 0,
                renderTime: this.performance.renderTime,
                updateTime: gameState.performance.updateTime || 0,
                inputTime: gameState.performance.inputTime || 0
            });
        }
    },
    
    /**
     * Update performance metrics
     * @param {number} startTime - Frame start time
     */
    updatePerformanceMetrics(startTime) {
        this.performance.renderTime = performance.now() - startTime;
    },
    
    /**
     * Add renderable to layer
     * @param {string} layerName - Layer name
     * @param {Object} renderable - Renderable object
     * @param {number} priority - Render priority
     * @returns {string} Object ID
     */
    addToLayer(layerName, renderable, priority = 0) {
        if (!this.layers) {
            console.warn('Layers not enabled');
            return null;
        }
        
        return this.layers.addToLayer(layerName, renderable, priority);
    },
    
    /**
     * Remove renderable from layer
     * @param {string} layerName - Layer name
     * @param {string} objectId - Object ID
     * @returns {boolean} Whether object was removed
     */
    removeFromLayer(layerName, objectId) {
        if (!this.layers) {
            console.warn('Layers not enabled');
            return false;
        }
        
        return this.layers.removeFromLayer(layerName, objectId);
    },
    
    /**
     * Set layer visibility
     * @param {string} layerName - Layer name
     * @param {boolean} visible - Whether layer is visible
     */
    setLayerVisibility(layerName, visible) {
        if (this.layers) {
            this.layers.setLayerVisibility(layerName, visible);
        }
    },
    
    /**
     * Set layer opacity
     * @param {string} layerName - Layer name
     * @param {number} opacity - Layer opacity (0-1)
     */
    setLayerOpacity(layerName, opacity) {
        if (this.layers) {
            this.layers.setLayerOpacity(layerName, opacity);
        }
    },
    
    /**
     * Enable/disable debug option
     * @param {string} option - Debug option name
     * @param {boolean} enabled - Whether option is enabled
     */
    setDebugOption(option, enabled) {
        if (this.debugRenderer) {
            this.debugRenderer.setOption(option, enabled);
        }
    },
    
    /**
     * Toggle debug option
     * @param {string} option - Debug option name
     */
    toggleDebugOption(option) {
        if (this.debugRenderer) {
            this.debugRenderer.toggleOption(option);
        }
    },
    
    /**
     * Enable/disable pipeline
     * @param {boolean} enabled - Whether pipeline is enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    },
    
    /**
     * Get pipeline statistics
     * @returns {Object} Pipeline statistics
     */
    getStats() {
        const stats = {
            enabled: this.enabled,
            systems: this.systems.size,
            renderTime: this.performance.renderTime,
            layerTimes: Object.fromEntries(this.performance.layerTimes)
        };
        
        if (this.layers) {
            stats.layers = this.layers.getStats();
        }
        
        if (this.debugRenderer) {
            stats.debug = this.debugRenderer.getState();
        }
        
        return stats;
    },
    
    /**
     * Get render order
     * @returns {Array} Render order
     */
    getRenderOrder() {
        return [...this.renderOrder];
    },
    
    /**
     * Set render order
     * @param {Array} order - New render order
     */
    setRenderOrder(order) {
        this.renderOrder = [...order];
    },
    
    /**
     * Get registered systems
     * @returns {Array} System names
     */
    getSystems() {
        return Array.from(this.systems.keys());
    },
    
    /**
     * Check if system is registered
     * @param {string} name - System name
     * @returns {boolean} Whether system is registered
     */
    hasSystem(name) {
        return this.systems.has(name);
    },
    
    /**
     * Get system data
     * @param {string} name - System name
     * @returns {Object|null} System data or null if not found
     */
    getSystem(name) {
        return this.systems.get(name) || null;
    },
    
    /**
     * Clear all renderables
     */
    clearAll() {
        if (this.layers) {
            this.layers.clearAllLayers();
        }
    },
    
    /**
     * Clear specific layer
     * @param {string} layerName - Layer name
     */
    clearLayer(layerName) {
        if (this.layers) {
            this.layers.clearLayer(layerName);
        }
    },
    
    /**
     * Reset pipeline
     */
    reset() {
        this.systems.clear();
        this.performance.layerTimes.clear();
        this.performance.renderTime = 0;
        
        if (this.layers) {
            this.layers.clearAllLayers();
        }
        
        if (this.debugRenderer) {
            this.debugRenderer.resetDebugData();
        }
    }
};
