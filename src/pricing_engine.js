// BOTA - Pricing Engine
// Centralized pricing calculations and market dynamics
// Handles supply/demand, faction modifiers, and price fluctuations

const PricingEngine = {
    /**
     * Calculate base price for a good
     * @param {string} goodId - ID of the good
     * @returns {number} Base price in gold
     */
    calculateBasePrice(goodId) {
        const goodData = GoodsData[goodId];
        if (!goodData) return 0;
        return goodData.basePrice;
    },

    /**
     * Apply supply and demand modifiers to price
     * @param {Object} port - Port data
     * @param {string} goodId - ID of the good
     * @param {number} basePrice - Base price of the good
     * @returns {number} Price after supply/demand modifiers
     */
    applySupplyDemand(port, goodId, basePrice) {
        const stock = port.stock?.[goodId] || 0;
        const demand = port.demand?.[goodId] || 0;
        
        // Supply modifier (more stock = lower price)
        // Stock of 100+ = 50% price, stock of 0 = 150% price
        const supplyModifier = Math.max(0.5, 1.5 - (stock / 100));
        
        // Demand modifier (more demand = higher price)
        // Demand of 100+ = 150% price, demand of 0 = 100% price
        const demandModifier = Math.max(1.0, 1 + (demand / 100));
        
        return Math.round(basePrice * supplyModifier * demandModifier);
    },

    /**
     * Apply faction modifiers to price
     * @param {Object} port - Port data
     * @param {string} goodId - ID of the good
     * @param {number} price - Current price
     * @returns {number} Price after faction modifiers
     */
    applyFactionModifiers(port, goodId, price) {
        const faction = port.faction;
        const factionPrefs = FactionPreferences[faction];
        if (!factionPrefs) return price;

        const goodData = GoodsData[goodId];
        if (!goodData) return price;

        const tier = goodData.tier;
        let modifier = 1.0;

        // Check if this good is preferred by the faction
        const tierKey = `tier${tier}`;
        if (factionPrefs[tierKey] && factionPrefs[tierKey].includes(goodId)) {
            // Preferred goods get 10% discount
            modifier = 0.9;
        } else {
            // Non-preferred goods get 5% markup
            modifier = 1.05;
        }

        return Math.round(price * modifier);
    },

    /**
     * Apply quantity-based modifiers (bulk discounts)
     * @param {string} goodId - ID of the good
     * @param {number} quantity - Quantity being traded
     * @param {number} price - Current price
     * @returns {number} Price after quantity modifiers
     */
    applyQuantityModifiers(goodId, quantity, price) {
        if (quantity <= 0) return price;

        let modifier = 1.0;

        // Bulk discounts
        if (quantity >= 50) {
            modifier = 0.85; // 15% discount for 50+ units
        } else if (quantity >= 20) {
            modifier = 0.9;  // 10% discount for 20+ units
        } else if (quantity >= 10) {
            modifier = 0.95; // 5% discount for 10+ units
        }

        return Math.round(price * modifier);
    },

    /**
     * Calculate final price for a good at a port
     * @param {Object} port - Port data
     * @param {string} goodId - ID of the good
     * @param {number} quantity - Quantity being traded
     * @returns {number} Final calculated price
     */
    calculatePrice(port, goodId, quantity) {
        // Start with base price
        let price = this.calculateBasePrice(goodId);
        if (price === 0) return 0;

        // Apply supply and demand
        price = this.applySupplyDemand(port, goodId, price);

        // Apply faction modifiers
        price = this.applyFactionModifiers(port, goodId, price);

        // Apply quantity modifiers
        price = this.applyQuantityModifiers(goodId, quantity, price);

        return Math.max(1, price); // Minimum price of 1 gold
    },

    /**
     * Get price range for a good at a port
     * @param {Object} port - Port data
     * @param {string} goodId - ID of the good
     * @returns {Object} Price range {min: number, max: number}
     */
    getPriceRange(port, goodId) {
        const basePrice = this.calculateBasePrice(goodId);
        if (basePrice === 0) return { min: 0, max: 0 };

        // Calculate min and max prices based on extreme supply/demand
        const minPrice = this.applyFactionModifiers(port, goodId, Math.round(basePrice * 0.3));
        const maxPrice = this.applyFactionModifiers(port, goodId, Math.round(basePrice * 2.0));

        return {
            min: Math.max(1, minPrice),
            max: Math.max(1, maxPrice)
        };
    },

    /**
     * Calculate price trend for a good
     * @param {Object} port - Port data
     * @param {string} goodId - ID of the good
     * @returns {string} Price trend ('rising', 'falling', 'stable')
     */
    calculatePriceTrend(port, goodId) {
        const stock = port.stock?.[goodId] || 0;
        const demand = port.demand?.[goodId] || 0;
        
        // Simple trend calculation based on supply/demand ratio
        const ratio = demand / Math.max(1, stock);
        
        if (ratio > 1.5) return 'rising';
        if (ratio < 0.5) return 'falling';
        return 'stable';
    },

    /**
     * Get market analysis for a good
     * @param {Object} port - Port data
     * @param {string} goodId - ID of the good
     * @returns {Object} Market analysis data
     */
    getMarketAnalysis(port, goodId) {
        const stock = port.stock?.[goodId] || 0;
        const demand = port.demand?.[goodId] || 0;
        const currentPrice = this.calculatePrice(port, goodId, 1);
        const basePrice = this.calculateBasePrice(goodId);
        const priceRange = this.getPriceRange(port, goodId);
        const trend = this.calculatePriceTrend(port, goodId);
        
        return {
            goodId: goodId,
            stock: stock,
            demand: demand,
            currentPrice: currentPrice,
            basePrice: basePrice,
            priceRange: priceRange,
            trend: trend,
            supplyRatio: stock / Math.max(1, demand),
            demandRatio: demand / Math.max(1, stock),
            isGoodBuy: currentPrice < basePrice,
            isGoodSell: currentPrice > basePrice
        };
    },

    /**
     * Calculate optimal buy/sell quantities for profit
     * @param {Object} port - Port data
     * @param {string} goodId - ID of the good
     * @param {Object} boat - Player boat data
     * @param {Object} player - Player data
     * @returns {Object} Optimal trading recommendations
     */
    calculateOptimalTrading(port, goodId, boat, player) {
        const analysis = this.getMarketAnalysis(port, goodId);
        const cargoSpace = this.getCargoSpaceAvailable(boat);
        const maxAffordable = Math.floor(player.gold / analysis.currentPrice);
        
        let recommendation = {
            action: 'hold',
            quantity: 0,
            reason: 'Market conditions not favorable'
        };

        if (analysis.isGoodBuy && analysis.trend === 'rising') {
            // Good time to buy
            const maxBuy = Math.min(analysis.stock, cargoSpace, maxAffordable);
            if (maxBuy > 0) {
                recommendation = {
                    action: 'buy',
                    quantity: maxBuy,
                    reason: 'Price below base, trend rising'
                };
            }
        } else if (analysis.isGoodSell && analysis.trend === 'falling') {
            // Good time to sell
            const cargoQuantity = this.getCargoQuantity(boat, goodId);
            if (cargoQuantity > 0) {
                recommendation = {
                    action: 'sell',
                    quantity: cargoQuantity,
                    reason: 'Price above base, trend falling'
                };
            }
        }

        return recommendation;
    },

    /**
     * Get cargo space available
     * @param {Object} boat - Boat data
     * @returns {number} Available cargo space
     */
    getCargoSpaceAvailable(boat) {
        if (!boat.cargo) return boat.cargoCapacity;
        
        let used = 0;
        for (const goodId in boat.cargo) {
            const quantity = typeof boat.cargo[goodId] === 'number' ? 
                boat.cargo[goodId] : boat.cargo[goodId].quantity;
            used += quantity;
        }
        return boat.cargoCapacity - used;
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
     * Calculate price volatility for a good
     * @param {Object} port - Port data
     * @param {string} goodId - ID of the good
     * @returns {number} Volatility score (0-1, higher = more volatile)
     */
    calculateVolatility(port, goodId) {
        const stock = port.stock?.[goodId] || 0;
        const demand = port.demand?.[goodId] || 0;
        
        // Volatility based on supply/demand imbalance
        const imbalance = Math.abs(stock - demand) / Math.max(1, stock + demand);
        
        // Higher tier goods are more volatile
        const goodData = GoodsData[goodId];
        const tierModifier = goodData ? (goodData.tier / 6) : 0.5;
        
        return Math.min(1, imbalance * (1 + tierModifier));
    },

    /**
     * Get market summary for a port
     * @param {Object} port - Port data
     * @returns {Object} Market summary
     */
    getMarketSummary(port) {
        const goods = Object.keys(port.stock || {});
        const summary = {
            totalGoods: goods.length,
            highDemand: [],
            lowStock: [],
            goodBuys: [],
            goodSells: [],
            volatileGoods: []
        };

        for (const goodId of goods) {
            const analysis = this.getMarketAnalysis(port, goodId);
            
            if (analysis.demand > 80) {
                summary.highDemand.push(goodId);
            }
            
            if (analysis.stock < 20) {
                summary.lowStock.push(goodId);
            }
            
            if (analysis.isGoodBuy) {
                summary.goodBuys.push(goodId);
            }
            
            if (analysis.isGoodSell) {
                summary.goodSells.push(goodId);
            }
            
            const volatility = this.calculateVolatility(port, goodId);
            if (volatility > 0.7) {
                summary.volatileGoods.push(goodId);
            }
        }

        return summary;
    }
};
