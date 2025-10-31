// BOTA - Trade Validator
// Validates trade transactions and business rules
// Handles trade validation, constraints, and error reporting

const TradeValidator = {
    // Validation rules
    rules: {
        minTradeAmount: 1,
        maxTradeAmount: 1000,
        minGoldBalance: 0,
        maxCargoCapacity: 1000,
        maxPriceDeviation: 0.5, // 50% price deviation allowed
        minReputation: -100,
        maxReputation: 100
    },
    
    // Validation errors
    errors: {
        INSUFFICIENT_GOLD: 'Insufficient gold for transaction',
        INSUFFICIENT_CARGO_SPACE: 'Insufficient cargo space',
        INSUFFICIENT_STOCK: 'Insufficient stock at port',
        INSUFFICIENT_CARGO: 'Insufficient cargo on ship',
        INVALID_AMOUNT: 'Invalid trade amount',
        INVALID_GOOD: 'Invalid good type',
        INVALID_PORT: 'Invalid port',
        INVALID_SHIP: 'Invalid ship',
        REPUTATION_TOO_LOW: 'Reputation too low for trading',
        PRICE_TOO_HIGH: 'Price too high for current market',
        PRICE_TOO_LOW: 'Price too low for current market',
        TRADE_LIMIT_EXCEEDED: 'Trade limit exceeded',
        PORT_CLOSED: 'Port is closed for trading',
        SHIP_DAMAGED: 'Ship is too damaged to trade',
        NO_TRADE_AGREEMENT: 'No trade agreement with this port'
    },
    
    // Trade constraints
    constraints: {
        dailyTradeLimits: new Map(),
        portTradeLimits: new Map(),
        factionTradeLimits: new Map()
    },
    
    /**
     * Initialize trade validator
     */
    init() {
        this.constraints.dailyTradeLimits.clear();
        this.constraints.portTradeLimits.clear();
        this.constraints.factionTradeLimits.clear();
        console.log('TradeValidator initialized');
    },
    
    /**
     * Validate trade transaction
     * @param {Object} trade - Trade transaction
     * @param {Object} port - Port data
     * @param {Object} ship - Ship data
     * @param {Object} player - Player data
     * @returns {Object} Validation result
     */
    validateTrade(trade, port, ship, player) {
        const result = {
            valid: true,
            errors: [],
            warnings: [],
            constraints: []
        };
        
        // Validate basic trade structure
        if (!this.validateTradeStructure(trade, result)) {
            return result;
        }
        
        // Validate port availability
        if (!this.validatePortAvailability(port, result)) {
            return result;
        }
        
        // Validate ship condition
        if (!this.validateShipCondition(ship, result)) {
            return result;
        }
        
        // Validate player reputation
        if (!this.validatePlayerReputation(player, port, result)) {
            return result;
        }
        
        // Validate each trade item
        for (const [goodId, amount] of Object.entries(trade.items)) {
            if (!this.validateTradeItem(goodId, amount, port, ship, player, result)) {
                result.valid = false;
            }
        }
        
        // Validate overall constraints
        if (!this.validateOverallConstraints(trade, port, ship, player, result)) {
            result.valid = false;
        }
        
        // Validate trade limits
        if (!this.validateTradeLimits(trade, port, ship, player, result)) {
            result.valid = false;
        }
        
        return result;
    },
    
    /**
     * Validate trade structure
     * @param {Object} trade - Trade transaction
     * @param {Object} result - Validation result
     * @returns {boolean} Whether structure is valid
     */
    validateTradeStructure(trade, result) {
        if (!trade || typeof trade !== 'object') {
            result.errors.push(this.errors.INVALID_TRADE);
            return false;
        }
        
        if (!trade.items || typeof trade.items !== 'object') {
            result.errors.push(this.errors.INVALID_TRADE);
            return false;
        }
        
        if (Object.keys(trade.items).length === 0) {
            result.warnings.push('No items to trade');
            return false;
        }
        
        return true;
    },
    
    /**
     * Validate port availability
     * @param {Object} port - Port data
     * @param {Object} result - Validation result
     * @returns {boolean} Whether port is available
     */
    validatePortAvailability(port, result) {
        if (!port || typeof port !== 'object') {
            result.errors.push(this.errors.INVALID_PORT);
            return false;
        }
        
        if (port.closed) {
            result.errors.push(this.errors.PORT_CLOSED);
            return false;
        }
        
        if (port.destroyed) {
            result.errors.push('Port has been destroyed');
            return false;
        }
        
        return true;
    },
    
    /**
     * Validate ship condition
     * @param {Object} ship - Ship data
     * @param {Object} result - Validation result
     * @returns {boolean} Whether ship is in good condition
     */
    validateShipCondition(ship, result) {
        if (!ship || typeof ship !== 'object') {
            result.errors.push(this.errors.INVALID_SHIP);
            return false;
        }
        
        if (ship.health <= 0) {
            result.errors.push(this.errors.SHIP_DAMAGED);
            return false;
        }
        
        if (ship.health < 0.5) {
            result.warnings.push('Ship is heavily damaged');
        }
        
        return true;
    },
    
    /**
     * Validate player reputation
     * @param {Object} player - Player data
     * @param {Object} port - Port data
     * @param {Object} result - Validation result
     * @returns {boolean} Whether reputation is sufficient
     */
    validatePlayerReputation(player, port, result) {
        if (!player || typeof player !== 'object') {
            result.errors.push('Invalid player data');
            return false;
        }
        
        const reputation = player.reputations?.[port.faction] || 0;
        const minReputation = port.minReputation || this.rules.minReputation;
        
        if (reputation < minReputation) {
            result.errors.push(this.errors.REPUTATION_TOO_LOW);
            return false;
        }
        
        if (reputation < minReputation + 20) {
            result.warnings.push('Low reputation with this faction');
        }
        
        return true;
    },
    
    /**
     * Validate individual trade item
     * @param {string} goodId - Good ID
     * @param {number} amount - Trade amount
     * @param {Object} port - Port data
     * @param {Object} ship - Ship data
     * @param {Object} player - Player data
     * @param {Object} result - Validation result
     * @returns {boolean} Whether item is valid
     */
    validateTradeItem(goodId, amount, port, ship, player, result) {
        // Validate good ID
        if (!goodId || typeof goodId !== 'string') {
            result.errors.push(this.errors.INVALID_GOOD);
            return false;
        }
        
        // Validate amount
        if (typeof amount !== 'number' || amount === 0) {
            result.warnings.push(`Invalid amount for ${goodId}: ${amount}`);
            return true; // Not an error, just skip
        }
        
        if (Math.abs(amount) < this.rules.minTradeAmount) {
            result.warnings.push(`Amount too small for ${goodId}: ${amount}`);
            return true;
        }
        
        if (Math.abs(amount) > this.rules.maxTradeAmount) {
            result.errors.push(`Amount too large for ${goodId}: ${amount}`);
            return false;
        }
        
        // Validate buying
        if (amount > 0) {
            return this.validateBuying(goodId, amount, port, ship, player, result);
        }
        
        // Validate selling
        if (amount < 0) {
            return this.validateSelling(goodId, Math.abs(amount), port, ship, player, result);
        }
        
        return true;
    },
    
    /**
     * Validate buying transaction
     * @param {string} goodId - Good ID
     * @param {number} amount - Amount to buy
     * @param {Object} port - Port data
     * @param {Object} ship - Ship data
     * @param {Object} player - Player data
     * @param {Object} result - Validation result
     * @returns {boolean} Whether buying is valid
     */
    validateBuying(goodId, amount, port, ship, player, result) {
        // Check port stock
        const portStock = port.stockpile?.[goodId] || 0;
        if (portStock < amount) {
            result.errors.push(`${this.errors.INSUFFICIENT_STOCK}: ${goodId} (${portStock} available, ${amount} requested)`);
            return false;
        }
        
        // Check cargo space
        const currentCargo = this.getCurrentCargo(ship);
        const cargoSpace = ship.cargoCapacity - currentCargo;
        if (cargoSpace < amount) {
            result.errors.push(`${this.errors.INSUFFICIENT_CARGO_SPACE}: ${goodId} (${cargoSpace} space available, ${amount} needed)`);
            return false;
        }
        
        // Check gold balance
        const price = this.calculatePrice(goodId, port, amount);
        if (player.gold < price) {
            result.errors.push(`${this.errors.INSUFFICIENT_GOLD}: ${goodId} (need ${price}g, have ${player.gold}g)`);
            return false;
        }
        
        return true;
    },
    
    /**
     * Validate selling transaction
     * @param {string} goodId - Good ID
     * @param {number} amount - Amount to sell
     * @param {Object} port - Port data
     * @param {Object} ship - Ship data
     * @param {Object} player - Player data
     * @param {Object} result - Validation result
     * @returns {boolean} Whether selling is valid
     */
    validateSelling(goodId, amount, port, ship, player, result) {
        // Check ship cargo
        const shipCargo = this.getCargoQuantity(ship, goodId);
        if (shipCargo < amount) {
            result.errors.push(`${this.errors.INSUFFICIENT_CARGO}: ${goodId} (${shipCargo} available, ${amount} requested)`);
            return false;
        }
        
        // Check port capacity (if applicable)
        const portCapacity = port.maxStock?.[goodId] || Infinity;
        const currentStock = port.stockpile?.[goodId] || 0;
        if (currentStock + amount > portCapacity) {
            result.warnings.push(`Port storage nearly full for ${goodId}`);
        }
        
        return true;
    },
    
    /**
     * Validate overall constraints
     * @param {Object} trade - Trade transaction
     * @param {Object} port - Port data
     * @param {Object} ship - Ship data
     * @param {Object} player - Player data
     * @param {Object} result - Validation result
     * @returns {boolean} Whether constraints are valid
     */
    validateOverallConstraints(trade, port, ship, player, result) {
        // Calculate total cost
        let totalCost = 0;
        let totalCargoChange = 0;
        
        for (const [goodId, amount] of Object.entries(trade.items)) {
            if (amount > 0) {
                const price = this.calculatePrice(goodId, port, amount);
                totalCost += price;
                totalCargoChange += amount;
            } else {
                totalCargoChange += amount;
            }
        }
        
        // Check total gold cost
        if (totalCost > player.gold) {
            result.errors.push(`${this.errors.INSUFFICIENT_GOLD}: Total cost ${totalCost}g, have ${player.gold}g`);
            return false;
        }
        
        // Check total cargo change
        const currentCargo = this.getCurrentCargo(ship);
        if (currentCargo + totalCargoChange > ship.cargoCapacity) {
            result.errors.push(`${this.errors.INSUFFICIENT_CARGO_SPACE}: Total change ${totalCargoChange}, available space ${ship.cargoCapacity - currentCargo}`);
            return false;
        }
        
        return true;
    },
    
    /**
     * Validate trade limits
     * @param {Object} trade - Trade transaction
     * @param {Object} port - Port data
     * @param {Object} ship - Ship data
     * @param {Object} player - Player data
     * @param {Object} result - Validation result
     * @returns {boolean} Whether limits are valid
     */
    validateTradeLimits(trade, port, ship, player, result) {
        // Check daily trade limits
        const today = new Date().toDateString();
        const dailyKey = `${player.id}_${today}`;
        const dailyTrades = this.constraints.dailyTradeLimits.get(dailyKey) || 0;
        const dailyLimit = port.dailyTradeLimit || 1000;
        
        if (dailyTrades + this.getTradeValue(trade) > dailyLimit) {
            result.errors.push(`${this.errors.TRADE_LIMIT_EXCEEDED}: Daily limit ${dailyLimit}, used ${dailyTrades}`);
            return false;
        }
        
        // Check port-specific limits
        const portKey = `${port.id}_${today}`;
        const portTrades = this.constraints.portTradeLimits.get(portKey) || 0;
        const portLimit = port.tradeLimit || 500;
        
        if (portTrades + this.getTradeValue(trade) > portLimit) {
            result.errors.push(`${this.errors.TRADE_LIMIT_EXCEEDED}: Port limit ${portLimit}, used ${portTrades}`);
            return false;
        }
        
        return true;
    },
    
    /**
     * Calculate price for a good
     * @param {string} goodId - Good ID
     * @param {Object} port - Port data
     * @param {number} amount - Amount
     * @returns {number} Calculated price
     */
    calculatePrice(goodId, port, amount) {
        // This would use the PricingEngine
        const basePrice = GoodsData[goodId]?.basePrice || 0;
        const stock = port.stockpile?.[goodId] || 0;
        const demand = port.demand?.[goodId] || 0;
        
        // Simple price calculation
        const supplyModifier = Math.max(0.5, 1 - (stock / 100));
        const demandModifier = Math.max(0.5, 1 + (demand / 100));
        const price = basePrice * supplyModifier * demandModifier;
        
        return Math.round(price * amount);
    },
    
    /**
     * Get current cargo usage
     * @param {Object} ship - Ship data
     * @returns {number} Current cargo usage
     */
    getCurrentCargo(ship) {
        if (!ship.cargo) return 0;
        
        let used = 0;
        for (const goodId in ship.cargo) {
            const quantity = typeof ship.cargo[goodId] === 'number' ? 
                ship.cargo[goodId] : ship.cargo[goodId].quantity;
            used += quantity;
        }
        return used;
    },
    
    /**
     * Get cargo quantity for a good
     * @param {Object} ship - Ship data
     * @param {string} goodId - Good ID
     * @returns {number} Cargo quantity
     */
    getCargoQuantity(ship, goodId) {
        const cargo = ship.cargo?.[goodId];
        return typeof cargo === 'number' ? cargo : (cargo?.quantity || 0);
    },
    
    /**
     * Get trade value
     * @param {Object} trade - Trade transaction
     * @returns {number} Trade value
     */
    getTradeValue(trade) {
        let value = 0;
        for (const amount of Object.values(trade.items)) {
            value += Math.abs(amount);
        }
        return value;
    },
    
    /**
     * Set validation rule
     * @param {string} rule - Rule name
     * @param {*} value - Rule value
     */
    setRule(rule, value) {
        if (this.rules.hasOwnProperty(rule)) {
            this.rules[rule] = value;
        }
    },
    
    /**
     * Get validation rules
     * @returns {Object} Validation rules
     */
    getRules() {
        return { ...this.rules };
    },
    
    /**
     * Add trade constraint
     * @param {string} type - Constraint type
     * @param {string} key - Constraint key
     * @param {number} limit - Constraint limit
     */
    addConstraint(type, key, limit) {
        if (this.constraints[type]) {
            this.constraints[type].set(key, limit);
        }
    },
    
    /**
     * Remove trade constraint
     * @param {string} type - Constraint type
     * @param {string} key - Constraint key
     */
    removeConstraint(type, key) {
        if (this.constraints[type]) {
            this.constraints[type].delete(key);
        }
    },
    
    /**
     * Clear all constraints
     */
    clearConstraints() {
        this.constraints.dailyTradeLimits.clear();
        this.constraints.portTradeLimits.clear();
        this.constraints.factionTradeLimits.clear();
    },
    
    /**
     * Get validation statistics
     * @returns {Object} Validation statistics
     */
    getStats() {
        return {
            rules: this.rules,
            constraints: {
                daily: this.constraints.dailyTradeLimits.size,
                port: this.constraints.portTradeLimits.size,
                faction: this.constraints.factionTradeLimits.size
            }
        };
    }
};
