// BOTA - Transaction Manager
// Pure transaction logic separated from UI
// Handles trade validation, execution, and summary generation

const TransactionManager = {
    /**
     * Validate a transaction before execution
     * @param {Object} port - Port data
     * @param {Object} boat - Player boat data
     * @param {Object} player - Player data
     * @param {Object} transactions - Transaction object {goodId: quantity}
     * @returns {Object} Validation result {success: boolean, error: string}
     */
    validateTransaction(port, boat, player, transactions) {
        // Check if there are any transactions
        const hasTransactions = Object.values(transactions).some(v => v !== 0);
        if (!hasTransactions) {
            return { success: true, error: null };
        }

        // Validate each transaction
        for (const [goodId, quantity] of Object.entries(transactions)) {
            if (quantity === 0) continue;

            const validation = this.validateSingleTransaction(port, boat, player, goodId, quantity);
            if (!validation.success) {
                return validation;
            }
        }

        // Validate overall constraints
        const overallValidation = this.validateOverallConstraints(port, boat, player, transactions);
        if (!overallValidation.success) {
            return overallValidation;
        }

        return { success: true, error: null };
    },

    /**
     * Validate a single good transaction
     * @param {Object} port - Port data
     * @param {Object} boat - Player boat data
     * @param {Object} player - Player data
     * @param {string} goodId - ID of the good
     * @param {number} quantity - Quantity to trade
     * @returns {Object} Validation result
     */
    validateSingleTransaction(port, boat, player, goodId, quantity) {
        const goodData = GoodsData[goodId];
        if (!goodData) {
            return { success: false, error: `Unknown good: ${goodId}` };
        }

        // Check port stock for buying
        if (quantity > 0) {
            const stock = port.stock?.[goodId] || 0;
            if (quantity > stock) {
                return { success: false, error: `Not enough ${goodId} in stock (${stock} available)` };
            }
        }

        // Check player cargo for selling
        if (quantity < 0) {
            const cargoQuantity = this.getCargoQuantity(boat, goodId);
            if (Math.abs(quantity) > cargoQuantity) {
                return { success: false, error: `Not enough ${goodId} in cargo (${cargoQuantity} available)` };
            }
        }

        return { success: true, error: null };
    },

    /**
     * Validate overall transaction constraints
     * @param {Object} port - Port data
     * @param {Object} boat - Player boat data
     * @param {Object} player - Player data
     * @param {Object} transactions - Transaction object
     * @returns {Object} Validation result
     */
    validateOverallConstraints(port, boat, player, transactions) {
        // Calculate total cost
        const totalCost = this.calculateTotalCost(port, transactions);
        
        // Check if player has enough gold
        if (totalCost > player.gold) {
            return { success: false, error: `Not enough gold (need ${totalCost}g, have ${player.gold}g)` };
        }

        // Check cargo capacity
        const cargoChange = this.calculateCargoChange(transactions);
        const currentCargoUsed = this.getCargoUsed(boat);
        const newCargoUsed = currentCargoUsed + cargoChange;
        
        if (newCargoUsed > boat.cargoCapacity) {
            return { success: false, error: `Not enough cargo space (need ${newCargoUsed}, have ${boat.cargoCapacity})` };
        }

        return { success: true, error: null };
    },

    /**
     * Execute a validated transaction
     * @param {Object} port - Port data
     * @param {Object} boat - Player boat data
     * @param {Object} player - Player data
     * @param {Object} transactions - Transaction object
     * @returns {Object} Execution result {success: boolean, error: string, goldChange: number, cargoChanges: Object}
     */
    executeTransaction(port, boat, player, transactions) {
        // Validate transaction first
        const validation = this.validateTransaction(port, boat, player, transactions);
        if (!validation.success) {
            return validation;
        }

        const goldChange = this.calculateTotalCost(port, transactions);
        const cargoChanges = {};

        // Execute each transaction
        for (const [goodId, quantity] of Object.entries(transactions)) {
            if (quantity === 0) continue;

            const price = this.calculatePrice(port, goodId, quantity);
            const cost = price * quantity;

            // Update port stock
            if (quantity > 0) {
                // Buying - reduce port stock
                port.stock[goodId] = (port.stock[goodId] || 0) - quantity;
            } else {
                // Selling - increase port stock
                port.stock[goodId] = (port.stock[goodId] || 0) + Math.abs(quantity);
            }

            // Update player cargo
            this.updateCargo(boat, goodId, quantity, price);

            // Track changes
            cargoChanges[goodId] = {
                quantity: quantity,
                price: price,
                cost: cost
            };
        }

        // Update player gold
        player.gold -= goldChange;

        return {
            success: true,
            error: null,
            goldChange: goldChange,
            cargoChanges: cargoChanges
        };
    },

    /**
     * Calculate total cost of transactions
     * @param {Object} port - Port data
     * @param {Object} transactions - Transaction object
     * @returns {number} Total cost in gold
     */
    calculateTotalCost(port, transactions) {
        let totalCost = 0;
        
        for (const [goodId, quantity] of Object.entries(transactions)) {
            if (quantity === 0) continue;
            
            const price = this.calculatePrice(port, goodId, quantity);
            totalCost += price * quantity;
        }
        
        return totalCost;
    },

    /**
     * Calculate cargo space change from transactions
     * @param {Object} transactions - Transaction object
     * @returns {number} Net cargo change (positive = more cargo)
     */
    calculateCargoChange(transactions) {
        let cargoChange = 0;
        
        for (const quantity of Object.values(transactions)) {
            cargoChange += quantity;
        }
        
        return cargoChange;
    },

    /**
     * Calculate price for a good at a port
     * @param {Object} port - Port data
     * @param {string} goodId - ID of the good
     * @param {number} quantity - Quantity being traded
     * @returns {number} Calculated price
     */
    calculatePrice(port, goodId, quantity) {
        const goodData = GoodsData[goodId];
        if (!goodData) return 0;

        let basePrice = goodData.basePrice;
        
        // Apply supply/demand modifiers
        const stock = port.stock?.[goodId] || 0;
        const demand = port.demand?.[goodId] || 0;
        
        // Supply modifier (more stock = lower price)
        const supplyModifier = Math.max(0.5, 1 - (stock / 100));
        
        // Demand modifier (more demand = higher price)
        const demandModifier = Math.max(0.5, 1 + (demand / 100));
        
        // Quantity modifier (bulk discounts)
        const quantityModifier = quantity > 10 ? 0.9 : 1.0;
        
        return Math.round(basePrice * supplyModifier * demandModifier * quantityModifier);
    },

    /**
     * Update boat cargo with transaction
     * @param {Object} boat - Boat data
     * @param {string} goodId - ID of the good
     * @param {number} quantity - Quantity change
     * @param {number} price - Price per unit
     */
    updateCargo(boat, goodId, quantity, price) {
        if (!boat.cargo) {
            boat.cargo = {};
        }

        const currentCargo = boat.cargo[goodId];
        
        if (quantity > 0) {
            // Buying - add to cargo
            if (typeof currentCargo === 'number') {
                // Old format - convert to new format
                boat.cargo[goodId] = {
                    quantity: currentCargo + quantity,
                    avgPrice: price
                };
            } else if (currentCargo) {
                // New format - update existing
                const totalQuantity = currentCargo.quantity + quantity;
                const totalValue = (currentCargo.quantity * currentCargo.avgPrice) + (quantity * price);
                boat.cargo[goodId] = {
                    quantity: totalQuantity,
                    avgPrice: totalValue / totalQuantity
                };
            } else {
                // New good
                boat.cargo[goodId] = {
                    quantity: quantity,
                    avgPrice: price
                };
            }
        } else {
            // Selling - remove from cargo
            const sellQuantity = Math.abs(quantity);
            
            if (typeof currentCargo === 'number') {
                // Old format
                boat.cargo[goodId] = Math.max(0, currentCargo - sellQuantity);
            } else if (currentCargo) {
                // New format
                boat.cargo[goodId].quantity = Math.max(0, currentCargo.quantity - sellQuantity);
                if (boat.cargo[goodId].quantity === 0) {
                    delete boat.cargo[goodId];
                }
            }
        }
    },

    /**
     * Get transaction summary
     * @param {Object} transactions - Transaction object
     * @param {Object} port - Port data
     * @returns {Object} Summary with buy/sell totals
     */
    getTransactionSummary(transactions, port) {
        const summary = {
            totalCost: 0,
            totalRevenue: 0,
            netGoldChange: 0,
            buyItems: [],
            sellItems: [],
            cargoChange: 0
        };

        for (const [goodId, quantity] of Object.entries(transactions)) {
            if (quantity === 0) continue;

            const price = this.calculatePrice(port, goodId, quantity);
            const cost = price * quantity;

            if (quantity > 0) {
                // Buying
                summary.buyItems.push({
                    goodId: goodId,
                    quantity: quantity,
                    price: price,
                    cost: cost
                });
                summary.totalCost += cost;
                summary.cargoChange += quantity;
            } else {
                // Selling
                summary.sellItems.push({
                    goodId: goodId,
                    quantity: Math.abs(quantity),
                    price: price,
                    revenue: cost
                });
                summary.totalRevenue += cost;
                summary.cargoChange += quantity; // Negative for selling
            }
        }

        summary.netGoldChange = summary.totalRevenue - summary.totalCost;
        return summary;
    },

    /**
     * Get cargo quantity for a specific good
     * @param {Object} boat - Boat data
     * @param {string} goodId - ID of the good
     * @returns {number} Quantity of good in cargo
     */
    getCargoQuantity(boat, goodId) {
        const cargo = boat.cargo?.[goodId];
        return typeof cargo === 'number' ? cargo : (cargo?.quantity || 0);
    },

    /**
     * Get total cargo used
     * @param {Object} boat - Boat data
     * @returns {number} Total cargo used
     */
    getCargoUsed(boat) {
        if (!boat.cargo) return 0;
        
        let used = 0;
        for (const goodId in boat.cargo) {
            const quantity = typeof boat.cargo[goodId] === 'number' ? 
                boat.cargo[goodId] : boat.cargo[goodId].quantity;
            used += quantity;
        }
        return used;
    },

    /**
     * Get cargo space available
     * @param {Object} boat - Boat data
     * @returns {number} Available cargo space
     */
    getCargoSpaceAvailable(boat) {
        return boat.cargoCapacity - this.getCargoUsed(boat);
    },

    /**
     * Check if transaction is valid for a specific good
     * @param {Object} port - Port data
     * @param {Object} boat - Boat data
     * @param {string} goodId - ID of the good
     * @param {number} quantity - Quantity to trade
     * @returns {Object} Validation result
     */
    validateGoodTransaction(port, boat, goodId, quantity) {
        return this.validateSingleTransaction(port, boat, Game.player, goodId, quantity);
    },

    /**
     * Get maximum buyable quantity for a good
     * @param {Object} port - Port data
     * @param {Object} boat - Boat data
     * @param {Object} player - Player data
     * @param {string} goodId - ID of the good
     * @returns {number} Maximum buyable quantity
     */
    getMaxBuyable(port, boat, player, goodId) {
        const stock = port.stock?.[goodId] || 0;
        const cargoSpace = this.getCargoSpaceAvailable(boat);
        const maxAffordable = Math.floor(player.gold / this.calculatePrice(port, goodId, 1));
        
        return Math.min(stock, cargoSpace, maxAffordable);
    },

    /**
     * Get maximum sellable quantity for a good
     * @param {Object} boat - Boat data
     * @param {string} goodId - ID of the good
     * @returns {number} Maximum sellable quantity
     */
    getMaxSellable(boat, goodId) {
        return this.getCargoQuantity(boat, goodId);
    }
};
