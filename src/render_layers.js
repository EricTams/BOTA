// BOTA - Render Layers
// Layered rendering system for organized drawing
// Separates different rendering concerns into distinct layers

const RenderLayers = {
    // Layer definitions
    layers: {
        BACKGROUND: 0,
        TERRAIN: 1,
        WATER: 2,
        PORTS: 3,
        BOATS: 4,
        PARTICLES: 5,
        UI: 6,
        DEBUG: 7
    },
    
    // Layer data
    layerData: new Map(),
    
    // Render order
    renderOrder: [
        'BACKGROUND',
        'TERRAIN', 
        'WATER',
        'PORTS',
        'BOATS',
        'PARTICLES',
        'UI',
        'DEBUG'
    ],
    
    // Layer visibility
    layerVisibility: new Map(),
    
    // Layer opacity
    layerOpacity: new Map(),
    
    // Layer filters
    layerFilters: new Map(),
    
    /**
     * Initialize render layers
     */
    init() {
        // Initialize layer data
        for (const layerName of this.renderOrder) {
            this.layerData.set(layerName, []);
            this.layerVisibility.set(layerName, true);
            this.layerOpacity.set(layerName, 1.0);
            this.layerFilters.set(layerName, null);
        }
        
        console.log('RenderLayers initialized');
    },
    
    /**
     * Add renderable object to layer
     * @param {string} layerName - Layer name
     * @param {Object} renderable - Renderable object with render method
     * @param {number} priority - Render priority (higher = later)
     * @returns {string} Object ID
     */
    addToLayer(layerName, renderable, priority = 0) {
        if (!this.layerData.has(layerName)) {
            console.warn(`Unknown layer: ${layerName}`);
            return null;
        }
        
        const objectId = Math.random().toString(36).substr(2, 9);
        const layerObjects = this.layerData.get(layerName);
        
        layerObjects.push({
            id: objectId,
            renderable: renderable,
            priority: priority,
            visible: true
        });
        
        // Sort by priority
        layerObjects.sort((a, b) => a.priority - b.priority);
        
        return objectId;
    },
    
    /**
     * Remove renderable object from layer
     * @param {string} layerName - Layer name
     * @param {string} objectId - Object ID
     * @returns {boolean} Whether object was removed
     */
    removeFromLayer(layerName, objectId) {
        if (!this.layerData.has(layerName)) return false;
        
        const layerObjects = this.layerData.get(layerName);
        const index = layerObjects.findIndex(obj => obj.id === objectId);
        
        if (index >= 0) {
            layerObjects.splice(index, 1);
            return true;
        }
        
        return false;
    },
    
    /**
     * Clear layer
     * @param {string} layerName - Layer name
     */
    clearLayer(layerName) {
        if (this.layerData.has(layerName)) {
            this.layerData.get(layerName).length = 0;
        }
    },
    
    /**
     * Clear all layers
     */
    clearAllLayers() {
        for (const layerName of this.renderOrder) {
            this.clearLayer(layerName);
        }
    },
    
    /**
     * Set layer visibility
     * @param {string} layerName - Layer name
     * @param {boolean} visible - Whether layer is visible
     */
    setLayerVisibility(layerName, visible) {
        if (this.layerVisibility.has(layerName)) {
            this.layerVisibility.set(layerName, visible);
        }
    },
    
    /**
     * Toggle layer visibility
     * @param {string} layerName - Layer name
     */
    toggleLayerVisibility(layerName) {
        if (this.layerVisibility.has(layerName)) {
            const current = this.layerVisibility.get(layerName);
            this.layerVisibility.set(layerName, !current);
        }
    },
    
    /**
     * Set layer opacity
     * @param {string} layerName - Layer name
     * @param {number} opacity - Opacity (0-1)
     */
    setLayerOpacity(layerName, opacity) {
        if (this.layerOpacity.has(layerName)) {
            this.layerOpacity.set(layerName, Math.max(0, Math.min(1, opacity)));
        }
    },
    
    /**
     * Set layer filter
     * @param {string} layerName - Layer name
     * @param {string} filter - CSS filter string
     */
    setLayerFilter(layerName, filter) {
        if (this.layerFilters.has(layerName)) {
            this.layerFilters.set(layerName, filter);
        }
    },
    
    /**
     * Render all layers
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     */
    renderAll(ctx, camera) {
        for (const layerName of this.renderOrder) {
            this.renderLayer(ctx, camera, layerName);
        }
    },
    
    /**
     * Render specific layer
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     * @param {string} layerName - Layer name
     */
    renderLayer(ctx, camera, layerName) {
        if (!this.layerVisibility.get(layerName)) return;
        
        const layerObjects = this.layerData.get(layerName);
        if (!layerObjects || layerObjects.length === 0) return;
        
        // Save context state
        ctx.save();
        
        // Apply layer opacity
        const opacity = this.layerOpacity.get(layerName);
        if (opacity < 1) {
            ctx.globalAlpha = opacity;
        }
        
        // Apply layer filter
        const filter = this.layerFilters.get(layerName);
        if (filter) {
            ctx.filter = filter;
        }
        
        // Render objects in layer
        for (const obj of layerObjects) {
            if (obj.visible && obj.renderable && typeof obj.renderable.render === 'function') {
                try {
                    obj.renderable.render(ctx, camera);
                } catch (error) {
                    console.error(`Error rendering object ${obj.id} in layer ${layerName}:`, error);
                }
            }
        }
        
        // Restore context state
        ctx.restore();
    },
    
    /**
     * Get layer objects
     * @param {string} layerName - Layer name
     * @returns {Array} Layer objects
     */
    getLayerObjects(layerName) {
        return this.layerData.get(layerName) || [];
    },
    
    /**
     * Get object by ID
     * @param {string} objectId - Object ID
     * @returns {Object|null} Object data or null if not found
     */
    getObject(objectId) {
        for (const layerName of this.renderOrder) {
            const layerObjects = this.layerData.get(layerName);
            const obj = layerObjects.find(o => o.id === objectId);
            if (obj) return { ...obj, layer: layerName };
        }
        return null;
    },
    
    /**
     * Set object visibility
     * @param {string} objectId - Object ID
     * @param {boolean} visible - Whether object is visible
     */
    setObjectVisibility(objectId, visible) {
        const obj = this.getObject(objectId);
        if (obj) {
            obj.visible = visible;
        }
    },
    
    /**
     * Set object priority
     * @param {string} objectId - Object ID
     * @param {number} priority - New priority
     */
    setObjectPriority(objectId, priority) {
        const obj = this.getObject(objectId);
        if (obj) {
            obj.priority = priority;
            // Re-sort layer
            const layerObjects = this.layerData.get(obj.layer);
            layerObjects.sort((a, b) => a.priority - b.priority);
        }
    },
    
    /**
     * Get layer statistics
     * @returns {Object} Layer statistics
     */
    getStats() {
        const stats = {};
        
        for (const layerName of this.renderOrder) {
            const layerObjects = this.layerData.get(layerName);
            stats[layerName] = {
                objectCount: layerObjects.length,
                visible: this.layerVisibility.get(layerName),
                opacity: this.layerOpacity.get(layerName),
                filter: this.layerFilters.get(layerName)
            };
        }
        
        return stats;
    },
    
    /**
     * Get all layer names
     * @returns {Array} Layer names
     */
    getLayerNames() {
        return [...this.renderOrder];
    },
    
    /**
     * Check if layer exists
     * @param {string} layerName - Layer name
     * @returns {boolean} Whether layer exists
     */
    hasLayer(layerName) {
        return this.layerData.has(layerName);
    },
    
    /**
     * Get layer count
     * @returns {number} Number of layers
     */
    getLayerCount() {
        return this.renderOrder.length;
    },
    
    /**
     * Create layer group
     * @param {string} groupName - Group name
     * @param {Array} layerNames - Layer names in group
     * @returns {Object} Layer group object
     */
    createLayerGroup(groupName, layerNames) {
        return {
            name: groupName,
            layers: layerNames,
            
            setVisibility: (visible) => {
                layerNames.forEach(layerName => {
                    this.setLayerVisibility(layerName, visible);
                });
            },
            
            setOpacity: (opacity) => {
                layerNames.forEach(layerName => {
                    this.setLayerOpacity(layerName, opacity);
                });
            },
            
            setFilter: (filter) => {
                layerNames.forEach(layerName => {
                    this.setLayerFilter(layerName, filter);
                });
            },
            
            clear: () => {
                layerNames.forEach(layerName => {
                    this.clearLayer(layerName);
                });
            },
            
            getStats: () => {
                const stats = {};
                layerNames.forEach(layerName => {
                    stats[layerName] = this.getLayerObjects(layerName).length;
                });
                return stats;
            }
        };
    },
    
    /**
     * Render layers in custom order
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     * @param {Array} layerOrder - Custom layer order
     */
    renderCustomOrder(ctx, camera, layerOrder) {
        for (const layerName of layerOrder) {
            if (this.hasLayer(layerName)) {
                this.renderLayer(ctx, camera, layerName);
            }
        }
    },
    
    /**
     * Render only visible layers
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera data
     */
    renderVisibleOnly(ctx, camera) {
        for (const layerName of this.renderOrder) {
            if (this.layerVisibility.get(layerName)) {
                this.renderLayer(ctx, camera, layerName);
            }
        }
    },
    
    /**
     * Get layer visibility state
     * @param {string} layerName - Layer name
     * @returns {boolean} Whether layer is visible
     */
    isLayerVisible(layerName) {
        return this.layerVisibility.get(layerName) || false;
    },
    
    /**
     * Get layer opacity
     * @param {string} layerName - Layer name
     * @returns {number} Layer opacity
     */
    getLayerOpacity(layerName) {
        return this.layerOpacity.get(layerName) || 1.0;
    },
    
    /**
     * Get layer filter
     * @param {string} layerName - Layer name
     * @returns {string|null} Layer filter
     */
    getLayerFilter(layerName) {
        return this.layerFilters.get(layerName) || null;
    }
};
