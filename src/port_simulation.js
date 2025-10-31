// BOTA - Port Simulation
// Handles port production, consumption, and economic simulation
// Separated from main economy system for better organization

const PortSimulation = {
    // Simulation state
    running: false,
    lastUpdateTime: 0,
    updateInterval: 1000, // 1 second
    
    // Port data
    ports: new Map(),
    
    // Production rates
    productionRates: new Map(),
    
    // Consumption rates
    consumptionRates: new Map(),
    
    // Price modifiers
    priceModifiers: new Map(),
    
    // Simulation settings
    settings: {
        enableProduction: true,
        enableConsumption: true,
        enablePriceFluctuation: true,
        productionMultiplier: 1.0,
        consumptionMultiplier: 1.0,
        priceVolatility: 0.1
    },
    
    /**
     * Initialize port simulation
     */
    init() {
        this.ports.clear();
        this.productionRates.clear();
        this.consumptionRates.clear();
        this.priceModifiers.clear();
        
        this.running = false;
        this.lastUpdateTime = 0;
        
        console.log('PortSimulation initialized');
    },
    
    /**
     * Start simulation
     */
    start() {
        this.running = true;
        this.lastUpdateTime = Date.now();
        console.log('Port simulation started');
    },
    
    /**
     * Stop simulation
     */
    stop() {
        this.running = false;
        console.log('Port simulation stopped');
    },
    
    /**
     * Add port to simulation
     * @param {Object} port - Port data
     */
    addPort(port) {
        this.ports.set(port.id, {
            ...port,
            stockpile: port.stockpile || {},
            production: port.production || {},
            consumption: port.consumption || {},
            demand: port.demand || {},
            lastUpdate: Date.now()
        });
        
        // Initialize production rates
        if (port.buildings) {
            for (const building of port.buildings) {
                this.setProductionRate(port.id, building.goodId, building.productionRate || 1);
            }
        }
        
        // Initialize consumption rates
        if (port.consumption) {
            for (const [goodId, rate] of Object.entries(port.consumption)) {
                this.setConsumptionRate(port.id, goodId, rate);
            }
        }
    },
    
    /**
     * Remove port from simulation
     * @param {string} portId - Port ID
     */
    removePort(portId) {
        this.ports.delete(portId);
        this.productionRates.delete(portId);
        this.consumptionRates.delete(portId);
        this.priceModifiers.delete(portId);
    },
    
    /**
     * Update simulation
     * @param {number} currentTime - Current time
     */
    update(currentTime) {
        if (!this.running) return;
        
        const deltaTime = currentTime - this.lastUpdateTime;
        if (deltaTime < this.updateInterval) return;
        
        this.lastUpdateTime = currentTime;
        
        // Update each port
        for (const [portId, port] of this.ports) {
            this.updatePort(portId, port, deltaTime);
        }
    },
    
    /**
     * Update individual port
     * @param {string} portId - Port ID
     * @param {Object} port - Port data
     * @param {number} deltaTime - Time since last update
     */
    updatePort(portId, port, deltaTime) {
        // Update production
        if (this.settings.enableProduction) {
            this.updateProduction(portId, port, deltaTime);
        }
        
        // Update consumption
        if (this.settings.enableConsumption) {
            this.updateConsumption(portId, port, deltaTime);
        }
        
        // Update demand
        this.updateDemand(portId, port, deltaTime);
        
        // Update price modifiers
        if (this.settings.enablePriceFluctuation) {
            this.updatePriceModifiers(portId, port, deltaTime);
        }
        
        port.lastUpdate = Date.now();
    },
    
    /**
     * Update port production
     * @param {string} portId - Port ID
     * @param {Object} port - Port data
     * @param {number} deltaTime - Time since last update
     */
    updateProduction(portId, port, deltaTime) {
        const productionRates = this.productionRates.get(portId) || {};
        
        for (const [goodId, rate] of Object.entries(productionRates)) {
            if (rate <= 0) continue;
            
            const productionAmount = rate * deltaTime / 1000 * this.settings.productionMultiplier;
            const currentStock = port.stockpile[goodId] || 0;
            
            // Add to stockpile
            port.stockpile[goodId] = currentStock + productionAmount;
            
            // Update production tracking
            if (!port.production) port.production = {};
            port.production[goodId] = (port.production[goodId] || 0) + productionAmount;
        }
    },
    
    /**
     * Update port consumption
     * @param {string} portId - Port ID
     * @param {Object} port - Port data
     * @param {number} deltaTime - Time since last update
     */
    updateConsumption(portId, port, deltaTime) {
        const consumptionRates = this.consumptionRates.get(portId) || {};
        
        for (const [goodId, rate] of Object.entries(consumptionRates)) {
            if (rate <= 0) continue;
            
            const consumptionAmount = rate * deltaTime / 1000 * this.settings.consumptionMultiplier;
            const currentStock = port.stockpile[goodId] || 0;
            
            // Consume from stockpile
            port.stockpile[goodId] = Math.max(0, currentStock - consumptionAmount);
            
            // Update consumption tracking
            if (!port.consumption) port.consumption = {};
            port.consumption[goodId] = (port.consumption[goodId] || 0) + consumptionAmount;
        }
    },
    
    /**
     * Update port demand
     * @param {string} portId - Port ID
     * @param {Object} port - Port data
     * @param {number} deltaTime - Time since last update
     */
    updateDemand(portId, port, deltaTime) {
        if (!port.demand) port.demand = {};
        
        // Calculate demand based on consumption and stock levels
        const consumptionRates = this.consumptionRates.get(portId) || {};
        
        for (const [goodId, rate] of Object.entries(consumptionRates)) {
            if (rate <= 0) continue;
            
            const currentStock = port.stockpile[goodId] || 0;
            const consumptionRate = rate * this.settings.consumptionMultiplier;
            
            // Demand increases when stock is low
            const stockRatio = Math.max(0, currentStock / (consumptionRate * 10)); // 10 seconds of consumption
            const demand = Math.max(0, (1 - stockRatio) * 100);
            
            port.demand[goodId] = demand;
        }
    },
    
    /**
     * Update price modifiers
     * @param {string} portId - Port ID
     * @param {Object} port - Port data
     * @param {number} deltaTime - Time since last update
     */
    updatePriceModifiers(portId, port, deltaTime) {
        if (!port.priceModifiers) port.priceModifiers = {};
        
        // Apply random price fluctuations
        for (const goodId in port.stockpile) {
            if (!port.priceModifiers[goodId]) {
                port.priceModifiers[goodId] = 1.0;
            }
            
            // Random walk for price modifier
            const volatility = this.settings.priceVolatility;
            const change = (Math.random() - 0.5) * volatility * deltaTime / 1000;
            port.priceModifiers[goodId] = Math.max(0.5, Math.min(2.0, port.priceModifiers[goodId] + change));
        }
    },
    
    /**
     * Set production rate for a good at a port
     * @param {string} portId - Port ID
     * @param {string} goodId - Good ID
     * @param {number} rate - Production rate per second
     */
    setProductionRate(portId, goodId, rate) {
        if (!this.productionRates.has(portId)) {
            this.productionRates.set(portId, {});
        }
        
        this.productionRates.get(portId)[goodId] = rate;
    },
    
    /**
     * Set consumption rate for a good at a port
     * @param {string} portId - Port ID
     * @param {string} goodId - Good ID
     * @param {number} rate - Consumption rate per second
     */
    setConsumptionRate(portId, goodId, rate) {
        if (!this.consumptionRates.has(portId)) {
            this.consumptionRates.set(portId, {});
        }
        
        this.consumptionRates.get(portId)[goodId] = rate;
    },
    
    /**
     * Get port data
     * @param {string} portId - Port ID
     * @returns {Object|null} Port data or null if not found
     */
    getPort(portId) {
        return this.ports.get(portId) || null;
    },
    
    /**
     * Get all ports
     * @returns {Array} Array of port data
     */
    getAllPorts() {
        return Array.from(this.ports.values());
    },
    
    /**
     * Get port stockpile
     * @param {string} portId - Port ID
     * @returns {Object} Port stockpile
     */
    getPortStockpile(portId) {
        const port = this.getPort(portId);
        return port ? port.stockpile : {};
    },
    
    /**
     * Get port production
     * @param {string} portId - Port ID
     * @returns {Object} Port production
     */
    getPortProduction(portId) {
        const port = this.getPort(portId);
        return port ? port.production : {};
    },
    
    /**
     * Get port consumption
     * @param {string} portId - Port ID
     * @returns {Object} Port consumption
     */
    getPortConsumption(portId) {
        const port = this.getPort(portId);
        return port ? port.consumption : {};
    },
    
    /**
     * Get port demand
     * @param {string} portId - Port ID
     * @returns {Object} Port demand
     */
    getPortDemand(portId) {
        const port = this.getPort(portId);
        return port ? port.demand : {};
    },
    
    /**
     * Get port price modifiers
     * @param {string} portId - Port ID
     * @returns {Object} Port price modifiers
     */
    getPortPriceModifiers(portId) {
        const port = this.getPort(portId);
        return port ? port.priceModifiers : {};
    },
    
    /**
     * Set port stockpile
     * @param {string} portId - Port ID
     * @param {string} goodId - Good ID
     * @param {number} amount - Amount to set
     */
    setPortStock(portId, goodId, amount) {
        const port = this.getPort(portId);
        if (port) {
            port.stockpile[goodId] = Math.max(0, amount);
        }
    },
    
    /**
     * Add to port stockpile
     * @param {string} portId - Port ID
     * @param {string} goodId - Good ID
     * @param {number} amount - Amount to add
     */
    addToPortStock(portId, goodId, amount) {
        const port = this.getPort(portId);
        if (port) {
            port.stockpile[goodId] = (port.stockpile[goodId] || 0) + amount;
        }
    },
    
    /**
     * Remove from port stockpile
     * @param {string} portId - Port ID
     * @param {string} goodId - Good ID
     * @param {number} amount - Amount to remove
     * @returns {number} Actual amount removed
     */
    removeFromPortStock(portId, goodId, amount) {
        const port = this.getPort(portId);
        if (!port) return 0;
        
        const currentStock = port.stockpile[goodId] || 0;
        const actualAmount = Math.min(amount, currentStock);
        
        port.stockpile[goodId] = currentStock - actualAmount;
        return actualAmount;
    },
    
    /**
     * Get simulation statistics
     * @returns {Object} Simulation statistics
     */
    getStats() {
        const stats = {
            running: this.running,
            portCount: this.ports.size,
            totalProduction: 0,
            totalConsumption: 0,
            totalStock: 0
        };
        
        for (const port of this.ports.values()) {
            // Count production
            if (port.production) {
                for (const amount of Object.values(port.production)) {
                    stats.totalProduction += amount;
                }
            }
            
            // Count consumption
            if (port.consumption) {
                for (const amount of Object.values(port.consumption)) {
                    stats.totalConsumption += amount;
                }
            }
            
            // Count stock
            if (port.stockpile) {
                for (const amount of Object.values(port.stockpile)) {
                    stats.totalStock += amount;
                }
            }
        }
        
        return stats;
    },
    
    /**
     * Set simulation settings
     * @param {Object} settings - New settings
     */
    setSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    },
    
    /**
     * Get simulation settings
     * @returns {Object} Current settings
     */
    getSettings() {
        return { ...this.settings };
    },
    
    /**
     * Reset simulation
     */
    reset() {
        this.stop();
        this.ports.clear();
        this.productionRates.clear();
        this.consumptionRates.clear();
        this.priceModifiers.clear();
        this.lastUpdateTime = 0;
    }
};
