// BOTA - Economy Module
// Handles goods production, consumption, pricing, and trading

// AIDEV-NOTE: Resource definitions from RESOURCES_AND_ECONOMY.md
// All goods with base prices by tier
const GoodsData = {
    // Tier 1 - Basic Raw Materials (40g/unit)
    'Grain': { tier: 1, basePrice: 40, building: 'Farm' },
    'Corn': { tier: 1, basePrice: 40, building: 'Farm' },
    'Fish': { tier: 1, basePrice: 40, building: 'Fishery' },
    'Wood': { tier: 1, basePrice: 40, building: 'Lumber Mill' },
    'Clay': { tier: 1, basePrice: 40, building: 'Clay Pit' },
    'Salt': { tier: 1, basePrice: 40, building: 'Salt Works' },
    'Herbs': { tier: 1, basePrice: 40, building: 'Herb Garden' },
    
    // Tier 2 - Valuable Raw Materials (60g/unit)
    'Cotton': { tier: 2, basePrice: 60, building: 'Cotton Plantation' },
    'Sugar': { tier: 2, basePrice: 60, building: 'Sugar Plantation' },
    'Meat': { tier: 2, basePrice: 60, building: 'Ranch' },
    'Fruit': { tier: 2, basePrice: 60, building: 'Orchard' },
    'Coal': { tier: 2, basePrice: 60, building: 'Coal Mine' },
    'Iron Ore': { tier: 2, basePrice: 60, building: 'Iron Mine' },
    'Mana Crystals': { tier: 2, basePrice: 60, building: 'Crystal Mine' },
    
    // Tier 3 - Processed Tier 1 (90g/unit)
    'Beer': { tier: 3, basePrice: 90, building: 'Brewery' },
    'Dye': { tier: 3, basePrice: 90, building: 'Dye Works' },
    'Pottery': { tier: 3, basePrice: 90, building: 'Pottery Workshop' },
    'Flux': { tier: 3, basePrice: 90, building: 'Alchemy Lab' },
    'Planks': { tier: 3, basePrice: 90, building: 'Sawmill' },
    
    // Tier 4 - Processed Tier 2 (135g/unit)
    'Cloth': { tier: 4, basePrice: 135, building: 'Textile Mill' },
    'Rum': { tier: 4, basePrice: 135, building: 'Distillery' },
    'Wine': { tier: 4, basePrice: 135, building: 'Winery' },
    'Iron Ingots': { tier: 4, basePrice: 135, building: 'Foundry' },
    'Coke': { tier: 4, basePrice: 135, building: 'Coking Plant' },
    
    // Tier 5 - Combined Goods (200g/unit)
    'Weapons': { tier: 5, basePrice: 200, building: 'Weaponsmith' },
    'Armor': { tier: 5, basePrice: 200, building: 'Armorsmith' },
    'Furniture': { tier: 5, basePrice: 200, building: 'Furniture Workshop' },
    'Potions': { tier: 5, basePrice: 200, building: 'Apothecary' },
    'Fine Clothing': { tier: 5, basePrice: 200, building: 'Tailor' },
    
    // Tier 6 - Luxury Combinations (300g/unit)
    'Magic Items': { tier: 6, basePrice: 300, building: 'Enchanter' },
    'Enchanted Armor': { tier: 6, basePrice: 300, building: 'Magical Armory' },
    'Artifacts': { tier: 6, basePrice: 300, building: 'Artificer' },
    'Elixirs': { tier: 6, basePrice: 300, building: 'Master Alchemist' }
};

// AIDEV-NOTE: Faction preferences for goods
// Defines which factions prefer producing/consuming which goods
// Stronger influence for higher tier goods
const FactionPreferences = {
    'Claddish Navy': {
        tier1: ['Fish', 'Salt'],
        tier2: ['Iron Ore', 'Coal'],
        tier3: ['Planks'],
        tier4: ['Iron Ingots'],
        tier5: ['Weapons', 'Armor'],
        tier6: ['Enchanted Armor']
    },
    'Artifact Traders': {
        tier1: ['Herbs'],
        tier2: ['Mana Crystals'],
        tier3: ['Flux'],
        tier4: [],
        tier5: ['Potions'],
        tier6: ['Magic Items', 'Artifacts', 'Elixirs']
    },
    'Stonehall Merchants': {
        tier1: ['Clay', 'Wood'],
        tier2: ['Iron Ore', 'Coal'],
        tier3: ['Pottery', 'Planks'],
        tier4: ['Iron Ingots', 'Coke'],
        tier5: ['Weapons', 'Armor', 'Furniture'],
        tier6: []
    },
    'Revtel': {
        tier1: ['Fish', 'Herbs'],
        tier2: ['Sugar', 'Fruit'],
        tier3: ['Dye'],
        tier4: ['Wine'],
        tier5: ['Potions', 'Fine Clothing'],
        tier6: ['Artifacts']
    },
    'Free Captains': {
        tier1: ['Fish', 'Salt'],
        tier2: ['Meat', 'Sugar'],
        tier3: ['Beer'],
        tier4: ['Rum'],
        tier5: ['Weapons'],
        tier6: []
    },
    'Slithereen Guard': {
        tier1: ['Fish', 'Salt'],
        tier2: ['Mana Crystals'],
        tier3: ['Flux'],
        tier4: ['Wine'],
        tier5: ['Potions', 'Armor'],
        tier6: ['Enchanted Armor', 'Elixirs']
    },
    'Roseleaf Traders': {
        tier1: ['Grain', 'Corn', 'Wood', 'Herbs'],
        tier2: ['Cotton', 'Fruit'],
        tier3: ['Beer', 'Dye', 'Planks'],
        tier4: ['Cloth', 'Wine'],
        tier5: ['Fine Clothing', 'Furniture'],
        tier6: []
    },
    'Oglodi Raiders': {
        tier1: ['Grain', 'Salt'],
        tier2: ['Meat', 'Iron Ore'],
        tier3: ['Beer'],
        tier4: ['Iron Ingots'],
        tier5: ['Weapons', 'Armor'],
        tier6: []
    },
    'Keen Folk Engineers': {
        tier1: ['Wood', 'Clay'],
        tier2: ['Coal', 'Iron Ore'],
        tier3: ['Planks', 'Pottery'],
        tier4: ['Iron Ingots', 'Coke'],
        tier5: ['Weapons', 'Furniture'],
        tier6: ['Magic Items']
    }
};

const Economy = {
    // AIDEV-NOTE: Generate production buildings for a port
    // Based on port tier and faction preferences
    generatePortBuildings(port) {
        if (!port || !port.tier) {
            throw new Error('Port must have a tier!');
        }
        
        const buildings = [];
        
        // Determine building counts by tier
        let tier12Count, tier34Count, tier56Count;
        if (port.tier === 1) {
            tier12Count = 3;
            tier34Count = 1;
            tier56Count = 0;
        } else if (port.tier === 2) {
            tier12Count = 4;
            tier34Count = 2;
            tier56Count = 1;
        } else { // tier 3
            tier12Count = 5;
            tier34Count = 3;
            tier56Count = 2;
        }
        
        // Get faction preferences
        const factionPrefs = FactionPreferences[port.faction] || {};
        
        // Generate tier 1/2 buildings
        for (let i = 0; i < tier12Count; i++) {
            const goodId = this.pickGoodForPort(port, [1, 2], factionPrefs, 0.3);
            buildings.push({ goodId, productionRate: 10 });
        }
        
        // Generate tier 3/4 buildings
        for (let i = 0; i < tier34Count; i++) {
            const goodId = this.pickGoodForPort(port, [3, 4], factionPrefs, 0.5);
            buildings.push({ goodId, productionRate: 10 });
        }
        
        // Generate tier 5/6 buildings
        for (let i = 0; i < tier56Count; i++) {
            const goodId = this.pickGoodForPort(port, [5, 6], factionPrefs, 0.7);
            buildings.push({ goodId, productionRate: 10 });
        }
        
        return buildings;
    },
    
    // AIDEV-NOTE: Pick a random good for a port based on tiers and faction
    // factionInfluence: 0.0 = no influence, 1.0 = only faction goods
    pickGoodForPort(port, allowedTiers, factionPrefs, factionInfluence) {
        // Get all goods in allowed tiers
        const allGoods = Object.keys(GoodsData).filter(goodId => {
            return allowedTiers.includes(GoodsData[goodId].tier);
        });
        
        // Get faction-preferred goods in allowed tiers
        const preferredGoods = [];
        for (const tier of allowedTiers) {
            const tierKey = `tier${tier}`;
            if (factionPrefs[tierKey]) {
                preferredGoods.push(...factionPrefs[tierKey]);
            }
        }
        
        // Use faction influence to decide whether to pick preferred or random
        if (preferredGoods.length > 0 && Math.random() < factionInfluence) {
            return preferredGoods[Math.floor(Math.random() * preferredGoods.length)];
        }
        
        return allGoods[Math.floor(Math.random() * allGoods.length)];
    },
    
    // AIDEV-NOTE: Generate initial stock for all ports
    // Produces 8 weeks of goods for each building
    generateInitialStock(ports) {
        for (const port of ports) {
            if (!port.buildings) {
                throw new Error(`Port ${port.id} has no buildings!`);
            }
            
            port.stockpile = {};
            
            for (const building of port.buildings) {
                const quantity = building.productionRate * 8; // 8 weeks of production
                if (!port.stockpile[building.goodId]) {
                    port.stockpile[building.goodId] = 0;
                }
                port.stockpile[building.goodId] += quantity;
            }
        }
        
        console.log('Generated initial stock for all ports');
    },
    
    // AIDEV-NOTE: Simulate initial trading between ports
    // Creates realistic initial distribution through random trades
    simulateInitialTrading(ports) {
        let tradeCount = 0;
        const portList = [...ports]; // Copy array
        
        // Initialize trade log
        this.tradeLog = {};
        for (const port of ports) {
            this.tradeLog[port.id] = {};
        }
        
        // Shuffle using Fisher-Yates algorithm
        for (let i = portList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [portList[i], portList[j]] = [portList[j], portList[i]];
        }
        
        // Each port trades with all remaining ports
        while (portList.length > 1) {
            const port1 = portList[0];
            
            for (let i = 1; i < portList.length; i++) {
                const port2 = portList[i];
                tradeCount += this.simulateTradesBetweenPorts(port1, port2);
            }
            
            // Remove first port and continue
            portList.shift();
        }
        
        console.log(`Simulated ${tradeCount} initial trades between ports`);
    },
    
    // AIDEV-NOTE: Simulate trades between two specific ports
    // Returns number of trades executed
    simulateTradesBetweenPorts(port1, port2) {
        // Calculate distance
        const dx = port2.x - port1.x;
        const dy = port2.y - port1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate number of trades based on port sizes, distance, and randomness
        const sizeScore = port1.tier + port2.tier;
        const distanceFactor = 1 / (distance / 100 + 1);
        const randomness = 0.5 + Math.random();
        const baseTrades = 10; // Base trades for initial distribution
        
        const numTrades = Math.floor(baseTrades * sizeScore * distanceFactor * randomness);
        
        // Initialize trade tracking for this port pair
        if (!this.tradeLog[port1.id][port2.id]) {
            this.tradeLog[port1.id][port2.id] = {};
        }
        if (!this.tradeLog[port2.id][port1.id]) {
            this.tradeLog[port2.id][port1.id] = {};
        }
        
        // Execute trades (bidirectional exchanges)
        for (let i = 0; i < numTrades; i++) {
            // Port1 picks a good to give (weighted by stock quantity)
            const good1 = this.pickWeightedGood(port1);
            if (!good1) continue;
            
            // Port2 picks a good to give back (weighted by stock quantity)
            const good2 = this.pickWeightedGood(port2);
            if (!good2) continue;
            
            // Exchange: port1 gives good1, receives good2
            port1.stockpile[good1]--;
            if (!port1.stockpile[good2]) {
                port1.stockpile[good2] = 0;
            }
            port1.stockpile[good2]++;
            
            // Exchange: port2 gives good2, receives good1
            port2.stockpile[good2]--;
            if (!port2.stockpile[good1]) {
                port2.stockpile[good1] = 0;
            }
            port2.stockpile[good1]++;
            
            // Log the trade from port1's perspective
            if (!this.tradeLog[port1.id][port2.id][good1]) {
                this.tradeLog[port1.id][port2.id][good1] = 0;
            }
            this.tradeLog[port1.id][port2.id][good1]--;
            
            if (!this.tradeLog[port1.id][port2.id][good2]) {
                this.tradeLog[port1.id][port2.id][good2] = 0;
            }
            this.tradeLog[port1.id][port2.id][good2]++;
            
            // Log the trade from port2's perspective
            if (!this.tradeLog[port2.id][port1.id][good2]) {
                this.tradeLog[port2.id][port1.id][good2] = 0;
            }
            this.tradeLog[port2.id][port1.id][good2]--;
            
            if (!this.tradeLog[port2.id][port1.id][good1]) {
                this.tradeLog[port2.id][port1.id][good1] = 0;
            }
            this.tradeLog[port2.id][port1.id][good1]++;
        }
        
        return numTrades;
    },
    
    // AIDEV-NOTE: Pick a random good from port's stockpile, weighted by quantity
    // If port has 90 Corn and 10 Metal, Corn has 90% chance to be picked
    pickWeightedGood(port) {
        // Get all goods with positive stock
        const goodsWithStock = Object.keys(port.stockpile).filter(id => port.stockpile[id] > 0);
        if (goodsWithStock.length === 0) return null;
        
        // Calculate total stock
        let totalStock = 0;
        for (const goodId of goodsWithStock) {
            totalStock += port.stockpile[goodId];
        }
        
        // Pick a random value between 0 and totalStock
        const randomValue = Math.random() * totalStock;
        
        // Find which good this value falls into
        let cumulative = 0;
        for (const goodId of goodsWithStock) {
            cumulative += port.stockpile[goodId];
            if (randomValue < cumulative) {
                return goodId;
            }
        }
        
        // Fallback (shouldn't reach here)
        return goodsWithStock[goodsWithStock.length - 1];
    },
    
    // AIDEV-NOTE: Get trade log for a specific port
    getTradeLogForPort(portId) {
        if (!this.tradeLog || !this.tradeLog[portId]) {
            return null;
        }
        return this.tradeLog[portId];
    },
    
    // AIDEV-NOTE: Get production vs consumption analysis for a port
    getProductionConsumptionAnalysis(port) {
        const analysis = {
            portName: port.name,
            portId: port.id,
            tier: port.tier,
            goods: {},
            totalProduction: 0,
            totalConsumption: 0
        };
        
        // Gather production data
        if (port.buildings) {
            for (const building of port.buildings) {
                if (!analysis.goods[building.goodId]) {
                    analysis.goods[building.goodId] = {
                        production: 0,
                        consumption: 0,
                        net: 0
                    };
                }
                analysis.goods[building.goodId].production += building.productionRate;
                analysis.totalProduction += building.productionRate;
            }
        }
        
        // Gather consumption data
        if (port.consumption) {
            for (const goodId in port.consumption) {
                if (!analysis.goods[goodId]) {
                    analysis.goods[goodId] = {
                        production: 0,
                        consumption: 0,
                        net: 0
                    };
                }
                analysis.goods[goodId].consumption += port.consumption[goodId];
                analysis.totalConsumption += port.consumption[goodId];
            }
        }
        
        // Calculate net for each good
        for (const goodId in analysis.goods) {
            const good = analysis.goods[goodId];
            good.net = good.production - good.consumption;
        }
        
        return analysis;
    },
    
    // AIDEV-NOTE: Calculate consumption rates for a port
    // Based on port tier and faction preferences
    calculatePortConsumption(port) {
        const factionPrefs = FactionPreferences[port.faction] || {};
        const consumption = {};
        
        // Base consumption by tier
        let totalConsumption;
        if (port.tier === 1) {
            totalConsumption = 5; // 5 units/week total
        } else if (port.tier === 2) {
            totalConsumption = 10;
        } else {
            totalConsumption = 15;
        }
        
        // Distribute consumption across multiple goods
        // Lower tier goods consumed more, faction preferences apply
        const consumedGoods = [];
        
        // Always consume some tier 1 goods (food)
        const tier1Foods = ['Grain', 'Corn', 'Fish'];
        consumedGoods.push(...tier1Foods);
        
        // Add faction preferences
        for (let tier = 1; tier <= Math.min(port.tier + 1, 4); tier++) {
            const tierKey = `tier${tier}`;
            if (factionPrefs[tierKey] && factionPrefs[tierKey].length > 0) {
                const preferred = factionPrefs[tierKey][Math.floor(Math.random() * factionPrefs[tierKey].length)];
                if (!consumedGoods.includes(preferred)) {
                    consumedGoods.push(preferred);
                }
            }
        }
        
        // Add some random goods based on tier
        const maxTier = port.tier + 1;
        const allGoods = Object.keys(GoodsData).filter(id => GoodsData[id].tier <= maxTier);
        while (consumedGoods.length < 3 + port.tier) {
            const randomGood = allGoods[Math.floor(Math.random() * allGoods.length)];
            if (!consumedGoods.includes(randomGood)) {
                consumedGoods.push(randomGood);
            }
        }
        
        // Distribute total consumption among goods
        const perGood = totalConsumption / consumedGoods.length;
        for (const goodId of consumedGoods) {
            consumption[goodId] = perGood;
        }
        
        return consumption;
    },
    
    // AIDEV-NOTE: Calculate household supply target for a port
    // Target = 1 month of consumption per good
    calculateHouseholdSupplyTarget(port) {
        const target = {};
        
        if (!port.consumption) return target;
        
        for (const goodId in port.consumption) {
            target[goodId] = port.consumption[goodId] * 4; // 4 weeks = 1 month
        }
        
        return target;
    },
    
    // AIDEV-NOTE: Initialize household supply for all ports
    // Called after initial trading simulation
    initializeHouseholdSupply(ports) {
        for (const port of ports) {
            port.householdSupply = {};
            const target = this.calculateHouseholdSupplyTarget(port);
            
            // Try to fill household supply from market stockpile
            for (const goodId in target) {
                const needed = target[goodId];
                const available = port.stockpile[goodId] || 0;
                const transfer = Math.min(needed, available);
                
                port.householdSupply[goodId] = transfer;
                port.stockpile[goodId] = (port.stockpile[goodId] || 0) - transfer;
            }
        }
        
        console.log('Initialized household supply for all ports');
    },
    
    // AIDEV-NOTE: Simulate daily consumption for a port
    // Citizens buy from market, then consume from household supply
    simulateDailyConsumption(port) {
        if (!port.consumption || !port.householdSupply) return;
        
        const target = this.calculateHouseholdSupplyTarget(port);
        
        // Try to buy from market to fill household supply
        for (const goodId in port.consumption) {
            const currentHousehold = port.householdSupply[goodId] || 0;
            const targetAmount = target[goodId];
            const needed = targetAmount - currentHousehold;
            
            if (needed > 0) {
                const available = port.stockpile[goodId] || 0;
                const transfer = Math.min(needed, available);
                
                if (transfer > 0) {
                    port.householdSupply[goodId] = (port.householdSupply[goodId] || 0) + transfer;
                    port.stockpile[goodId] -= transfer;
                }
            }
        }
        
        // Citizens consume from household supply (daily rate = weekly rate / 7)
        for (const goodId in port.consumption) {
            const dailyConsumption = port.consumption[goodId] / 7;
            port.householdSupply[goodId] = Math.max(0, (port.householdSupply[goodId] || 0) - dailyConsumption);
        }
    },
    
    // AIDEV-NOTE: Calculate supply status for a good at a port
    // Returns months of supply and equilibrium stock
    calculateSupplyStatus(port, goodId) {
        const marketStock = port.stockpile[goodId] || 0;
        const consumption = port.consumption[goodId] || 0;
        
        // Equilibrium = 2 months of consumption
        const equilibriumStock = consumption * 4 * 2; // 4 weeks/month * 2 months
        
        // Calculate months of supply
        let monthsOfSupply = 0;
        if (consumption > 0) {
            monthsOfSupply = marketStock / (consumption * 4);
        }
        
        return { monthsOfSupply, equilibriumStock };
    },
    
    // AIDEV-NOTE: Calculate current price for a good at a port
    // Uses asymptotic function for realistic supply/demand
    calculatePrice(port, goodId) {
        const goodData = GoodsData[goodId];
        if (!goodData) {
            throw new Error(`Unknown good: ${goodId}`);
        }
        
        const basePrice = goodData.basePrice;
        const status = this.calculateSupplyStatus(port, goodId);
        const equilibrium = status.equilibriumStock;
        
        if (equilibrium === 0) {
            // No consumption, use base price
            return basePrice;
        }
        
        const marketStock = port.stockpile[goodId] || 0;
        
        // Use asymptotic pricing formula
        const minMultiplier = 0.25;  // 25% floor
        const numerator = equilibrium + minMultiplier * marketStock;
        const denominator = minMultiplier * equilibrium + marketStock;
        const multiplier = numerator / denominator;
        
        return Math.round(basePrice * multiplier);
    },
    
    // AIDEV-NOTE: Convert stock level to price multiplier
    // Uses same asymptotic formula
    getPriceMultiplierFromStock(stockLevel, equilibrium) {
        if (equilibrium === 0) return 1.0;
        
        const minMultiplier = 0.25;
        const numerator = equilibrium + minMultiplier * stockLevel;
        const denominator = minMultiplier * equilibrium + stockLevel;
        return numerator / denominator;
    },
    
    // AIDEV-NOTE: Convert price multiplier back to stock level
    // Inverse function for slider positioning
    // From: mult = (eq + 0.25*stock) / (0.25*eq + stock)
    // Solve for stock: stock = eq * (1 - 0.25*mult) / (mult - 0.25)
    getStockFromPriceMultiplier(priceMultiplier, equilibrium) {
        const minMultiplier = 0.25;
        const maxMultiplier = 4.0;
        
        // Clamp to valid range
        const mult = Math.max(minMultiplier, Math.min(maxMultiplier, priceMultiplier));
        
        // Inverse formula
        const numerator = equilibrium * (1 - minMultiplier * mult);
        const denominator = mult - minMultiplier;
        const stock = numerator / denominator;
        
        return Math.max(0, stock);
    },
    
    // AIDEV-NOTE: Calculate price for a specific stock level
    // Helper function for dynamic pricing with asymptotic bounds
    calculatePriceAtStockLevel(goodId, stockLevel, equilibrium) {
        const goodData = GoodsData[goodId];
        if (!goodData) {
            throw new Error(`Unknown good: ${goodId}`);
        }
        
        const basePrice = goodData.basePrice;
        
        if (equilibrium === 0) {
            return basePrice;
        }
        
        // Asymptotic pricing formula with correct bounds
        // minMultiplier at infinite supply, maxMultiplier at zero supply
        const minMultiplier = 0.25;  // 25% of base price (floor)
        const maxMultiplier = 4.0;   // 400% of base price (ceiling)
        
        // Correct asymptotic formula that ensures:
        // - stock = 0 → multiplier = 4.0
        // - stock = equilibrium → multiplier = 1.0
        // - stock = infinity → multiplier = 0.25
        // Formula: multiplier = (equilibrium + 0.25*stock) / (0.25*equilibrium + stock)
        const numerator = equilibrium + minMultiplier * stockLevel;
        const denominator = minMultiplier * equilibrium + stockLevel;
        const multiplier = numerator / denominator;
        
        // Round to integer - we only trade in whole gold pieces
        return Math.round(basePrice * multiplier);
    },
    
    // AIDEV-NOTE: Calculate average price for a trade
    // Accounts for dynamic pricing as each unit changes the supply level
    // tradeAmount: positive = buying from port (reduces port stock), negative = selling to port (increases port stock)
    calculateAveragePriceForTrade(port, goodId, tradeAmount) {
        if (tradeAmount === 0) {
            return this.calculatePrice(port, goodId);
        }
        
        const totalCost = this.calculateTotalCostForTrade(port, goodId, tradeAmount);
        return totalCost / Math.abs(tradeAmount);
    },
    
    // AIDEV-NOTE: Calculate total cost/revenue for a trade
    // Simulates buying/selling one unit at a time at current market price
    // Returns positive for gold earned (selling), negative for gold spent (buying)
    calculateTotalCostForTrade(port, goodId, tradeAmount) {
        if (tradeAmount === 0) {
            return 0;
        }
        
        const status = this.calculateSupplyStatus(port, goodId);
        const equilibrium = status.equilibriumStock > 0 ? status.equilibriumStock : 200;
        const currentStock = port.stockpile[goodId] || 0;
        
        let totalCost = 0;
        const absAmount = Math.abs(tradeAmount);
        
        if (tradeAmount > 0) {
            // Buying from port (reduces port stock, costs gold)
            for (let i = 0; i < absAmount; i++) {
                const stockLevel = currentStock - i;
                const unitPrice = this.calculatePriceAtStockLevel(goodId, stockLevel, equilibrium);
                totalCost += unitPrice;
            }
            return -totalCost; // Negative because we're spending gold
        } else {
            // Selling to port (increases port stock, earns gold)
            for (let i = 0; i < absAmount; i++) {
                const stockLevel = currentStock + i;
                const unitPrice = this.calculatePriceAtStockLevel(goodId, stockLevel, equilibrium);
                totalCost += unitPrice;
            }
            return totalCost; // Positive because we're earning gold
        }
    },
    
    // AIDEV-NOTE: Calculate prosperity for a port
    // Based on how well household supply is filled
    calculateProsperity(port) {
        if (!port.consumption || !port.householdSupply) {
            return 1.0; // Full prosperity if no consumption tracking
        }
        
        const target = this.calculateHouseholdSupplyTarget(port);
        const goods = Object.keys(target);
        
        if (goods.length === 0) {
            return 1.0;
        }
        
        let totalFillRatio = 0;
        for (const goodId of goods) {
            const current = port.householdSupply[goodId] || 0;
            const targetAmount = target[goodId];
            const fillRatio = targetAmount > 0 ? current / targetAmount : 1.0;
            totalFillRatio += Math.min(1.0, fillRatio);
        }
        
        const currentProsperity = totalFillRatio / goods.length;
        
        // Update moving average (0.1 new, 0.9 old)
        if (port.prosperity === undefined) {
            port.prosperity = currentProsperity;
        } else {
            port.prosperity = port.prosperity * 0.9 + currentProsperity * 0.1;
        }
        
        return port.prosperity;
    },
    
    // AIDEV-NOTE: Initialize economy for all ports
    // Called at game start
    initializeEconomy(ports) {
        console.log('Initializing economy...');
        
        // Generate buildings for each port
        for (const port of ports) {
            port.buildings = this.generatePortBuildings(port);
            port.consumption = this.calculatePortConsumption(port);
            port.householdSupply = {};
            port.prosperity = 1.0;
        }
        
        // Generate initial stock (8 weeks of production)
        this.generateInitialStock(ports);
        
        // Simulate initial trading to distribute goods
        this.simulateInitialTrading(ports);
        
        // Initialize household supply
        this.initializeHouseholdSupply(ports);
        
        // Calculate initial prices for all ports
        for (const port of ports) {
            port.prices = {};
            for (const goodId in GoodsData) {
                port.prices[goodId] = this.calculatePrice(port, goodId);
            }
        }
        
        console.log('Economy initialized');
    },
    
    // AIDEV-NOTE: Player cargo management functions
    
    getCargoUsed(boat) {
        let total = 0;
        for (const goodId in boat.cargo) {
            total += boat.cargo[goodId];
        }
        return total;
    },
    
    addCargoToBoat(boat, goodId, quantity) {
        const used = this.getCargoUsed(boat);
        const available = boat.cargoCapacity - used;
        
        if (quantity > available) {
            return false; // Not enough space
        }
        
        if (!boat.cargo[goodId]) {
            boat.cargo[goodId] = 0;
        }
        boat.cargo[goodId] += quantity;
        return true;
    },
    
    removeCargoFromBoat(boat, goodId, quantity) {
        const current = boat.cargo[goodId] || 0;
        if (quantity > current) {
            return false; // Not enough cargo
        }
        
        boat.cargo[goodId] -= quantity;
        if (boat.cargo[goodId] === 0) {
            delete boat.cargo[goodId];
        }
        return true;
    },
    
    getCargoValue(cargo) {
        let total = 0;
        for (const goodId in cargo) {
            const goodData = GoodsData[goodId];
            if (goodData) {
                total += cargo[goodId] * goodData.basePrice;
            }
        }
        return total;
    },
    
    // AIDEV-NOTE: Execute trade transaction between port and boat
    // transactions: { goodId: amount } (positive = buy from port, negative = sell to port)
    executeTrade(port, boat, transactions, playerGold) {
        let goldSpent = 0;
        let cargoChange = 0;
        const changes = [];
        
        // Calculate net gold and cargo changes, validate all transactions
        for (const goodId in transactions) {
            const amount = transactions[goodId];
            if (amount === 0) continue;
            
            if (amount > 0) {
                // Buying from port
                const available = port.stockpile[goodId] || 0;
                if (amount > available) {
                    return { success: false, error: `Not enough ${goodId} at port` };
                }
                
                cargoChange += amount;
            } else {
                // Selling to port
                const sellAmount = -amount;
                const current = boat.cargo[goodId] || 0;
                if (sellAmount > current) {
                    return { success: false, error: `Not enough ${goodId} in cargo` };
                }
                
                cargoChange += amount; // amount is negative, so this reduces cargo
            }
            
            // Use dynamic pricing calculation (same as UI preview)
            const price = port.prices[goodId] || GoodsData[goodId].basePrice;
            const tradeGoldChange = this.calculateTotalCostForTrade(port, goodId, amount);
            // calculateTotalCostForTrade returns negative for buying, positive for selling
            goldSpent -= tradeGoldChange; // Invert so goldSpent is positive for spending
            
            changes.push({ goodId, amount, price });
        }
        
        // Check if player has enough gold for the net transaction
        if (goldSpent > playerGold) {
            return { success: false, error: 'Not enough gold' };
        }
        
        // Check if player has enough cargo space for the net transaction
        const currentCargoUsed = this.getCargoUsed(boat);
        const availableCargoSpace = boat.cargoCapacity - currentCargoUsed;
        if (cargoChange > availableCargoSpace) {
            return { success: false, error: 'Not enough cargo space' };
        }
        
        // Execute all transactions
        for (const change of changes) {
            if (change.amount > 0) {
                // Buy from port
                port.stockpile[change.goodId] -= change.amount;
                this.addCargoToBoat(boat, change.goodId, change.amount);
            } else {
                // Sell to port
                const sellAmount = -change.amount;
                this.removeCargoFromBoat(boat, change.goodId, sellAmount);
                if (!port.stockpile[change.goodId]) {
                    port.stockpile[change.goodId] = 0;
                }
                port.stockpile[change.goodId] += sellAmount;
            }
        }
        
        // Recalculate prices after trade
        for (const goodId in transactions) {
            port.prices[goodId] = this.calculatePrice(port, goodId);
        }
        
        return { success: true, goldChange: goldSpent };
    }
};

// AIDEV-NOTE: Export GoodsData for use in other modules
// (In browser context, these are available globally)

