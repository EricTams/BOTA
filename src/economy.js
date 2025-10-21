// BOTA - Economy Module
// Handles goods production, consumption, pricing, and trading

// AIDEV-NOTE: Resource definitions from RESOURCES_AND_ECONOMY.md
// All goods with base prices by tier and production recipes (consumes)
const GoodsData = {
    // Tier 1 - Basic Raw Materials (40g/unit) - No inputs required
    'Grain': { tier: 1, basePrice: 40, building: 'Farm', consumes: [] },
    'Corn': { tier: 1, basePrice: 40, building: 'Farm', consumes: [] },
    'Fish': { tier: 1, basePrice: 40, building: 'Fishery', consumes: [] },
    'Wood': { tier: 1, basePrice: 40, building: 'Lumber Mill', consumes: [] },
    'Clay': { tier: 1, basePrice: 40, building: 'Clay Pit', consumes: [] },
    'Salt': { tier: 1, basePrice: 40, building: 'Salt Works', consumes: [] },
    'Herbs': { tier: 1, basePrice: 40, building: 'Herb Garden', consumes: [] },
    
    // Tier 2 - Valuable Raw Materials (60g/unit) - No inputs required
    'Cotton': { tier: 2, basePrice: 60, building: 'Cotton Plantation', consumes: [] },
    'Sugar': { tier: 2, basePrice: 60, building: 'Sugar Plantation', consumes: [] },
    'Meat': { tier: 2, basePrice: 60, building: 'Ranch', consumes: [] },
    'Fruit': { tier: 2, basePrice: 60, building: 'Orchard', consumes: [] },
    'Coal': { tier: 2, basePrice: 60, building: 'Coal Mine', consumes: [] },
    'Iron Ore': { tier: 2, basePrice: 60, building: 'Iron Mine', consumes: [] },
    'Mana Crystals': { tier: 2, basePrice: 60, building: 'Crystal Mine', consumes: [] },
    
    // Tier 3 - Processed Tier 1 (90g/unit) - Single ingredient
    'Beer': { tier: 3, basePrice: 90, building: 'Brewery', consumes: ['Grain'] },
    'Dye': { tier: 3, basePrice: 90, building: 'Dye Works', consumes: ['Herbs'] },
    'Pottery': { tier: 3, basePrice: 90, building: 'Pottery Workshop', consumes: ['Clay'] },
    'Flux': { tier: 3, basePrice: 90, building: 'Alchemy Lab', consumes: ['Salt'] },
    'Planks': { tier: 3, basePrice: 90, building: 'Sawmill', consumes: ['Wood'] },
    
    // Tier 4 - Processed Tier 2 (135g/unit) - Single ingredient
    'Cloth': { tier: 4, basePrice: 135, building: 'Textile Mill', consumes: ['Cotton'] },
    'Rum': { tier: 4, basePrice: 135, building: 'Distillery', consumes: ['Sugar'] },
    'Wine': { tier: 4, basePrice: 135, building: 'Winery', consumes: ['Fruit'] },
    'Iron Ingots': { tier: 4, basePrice: 135, building: 'Foundry', consumes: ['Iron Ore'] },
    'Coke': { tier: 4, basePrice: 135, building: 'Coking Plant', consumes: ['Coal'] },
    
    // Tier 5 - Combined Goods (200g/unit) - Multiple ingredients
    'Weapons': { tier: 5, basePrice: 200, building: 'Weaponsmith', consumes: ['Iron Ingots', 'Coke'] },
    'Armor': { tier: 5, basePrice: 200, building: 'Armorsmith', consumes: ['Iron Ingots', 'Cloth'] },
    'Furniture': { tier: 5, basePrice: 200, building: 'Furniture Workshop', consumes: ['Planks', 'Iron Ingots'] },
    'Potions': { tier: 5, basePrice: 200, building: 'Apothecary', consumes: ['Wine', 'Herbs'] },
    'Fine Clothing': { tier: 5, basePrice: 200, building: 'Tailor', consumes: ['Dye', 'Cloth'] },
    
    // Tier 6 - Luxury Combinations (300g/unit) - High-tier combinations
    'Magic Items': { tier: 6, basePrice: 300, building: 'Enchanter', consumes: ['Weapons', 'Flux'] },
    'Enchanted Armor': { tier: 6, basePrice: 300, building: 'Magical Armory', consumes: ['Armor', 'Mana Crystals'] },
    'Artifacts': { tier: 6, basePrice: 300, building: 'Artificer', consumes: ['Fine Clothing', 'Mana Crystals'] },
    'Elixirs': { tier: 6, basePrice: 300, building: 'Master Alchemist', consumes: ['Potions', 'Flux'] }
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
    // AIDEV-NOTE: Generate production buildings for ALL ports
    // Uses deterministic "card dealing" approach to ensure balanced distribution
    generateAllPortBuildings(ports) {
        // Count total building slots by tier range
        let tier12Slots = 0;
        let tier34Slots = 0;
        let tier56Slots = 0;
        
        for (const port of ports) {
            if (port.tier === 1) {
                tier12Slots += 3;
                tier34Slots += 1;
                tier56Slots += 0;
            } else if (port.tier === 2) {
                tier12Slots += 4;
                tier34Slots += 2;
                tier56Slots += 1;
            } else { // tier 3
                tier12Slots += 5;
                tier34Slots += 3;
                tier56Slots += 2;
            }
        }
        
        console.log(`Building slots: Tier1-2=${tier12Slots}, Tier3-4=${tier34Slots}, Tier5-6=${tier56Slots}`);
        
        // Create "decks" of buildings for each tier range
        const tier12Deck = this.createBuildingDeck([1, 2], tier12Slots);
        const tier34Deck = this.createBuildingDeck([3, 4], tier34Slots);
        const tier56Deck = this.createBuildingDeck([5, 6], tier56Slots);
        
        // Shuffle decks
        this.shuffleArray(tier12Deck);
        this.shuffleArray(tier34Deck);
        this.shuffleArray(tier56Deck);
        
        // Deal buildings to ports
        let tier12Index = 0;
        let tier34Index = 0;
        let tier56Index = 0;
        
        for (const port of ports) {
            port.buildings = [];
            
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
            
            // Deal tier 1/2 buildings
            for (let i = 0; i < tier12Count; i++) {
                const goodId = tier12Deck[tier12Index++];
                const baseRate = 10;
                // Flat 1.0x rate for consistency with increased baseline buildings
                port.buildings.push({ goodId, productionRate: baseRate });
            }
            
            // Deal tier 3/4 buildings
            for (let i = 0; i < tier34Count; i++) {
                const goodId = tier34Deck[tier34Index++];
                const baseRate = 10;
                // Flat 1.0x rate for consistency with increased baseline buildings
                port.buildings.push({ goodId, productionRate: baseRate });
            }
            
            // Deal tier 5/6 buildings
            for (let i = 0; i < tier56Count; i++) {
                const goodId = tier56Deck[tier56Index++];
                const baseRate = 10;
                // Flat 1.0x rate for consistency with increased baseline buildings
                port.buildings.push({ goodId, productionRate: baseRate });
            }
        }
    },
    
    // AIDEV-NOTE: Create a "deck" of building types to distribute
    // Ensures balanced baseline, then adds random variation for exploitable trading
    createBuildingDeck(tiers, totalSlots) {
        const deck = [];
        
        // Get all goods in these tiers
        const availableGoods = Object.keys(GoodsData).filter(goodId => {
            return tiers.includes(GoodsData[goodId].tier);
        });
        
        if (availableGoods.length === 0) {
            throw new Error(`No goods found for tiers ${tiers.join(',')}`);
        }
        
        // Step 1: Guaranteed baseline (tier-dependent for realistic economics)
        // Target: ~67% fixed, ~33% random for exploitable but stable economy
        let baselinePerGood;
        if (tiers.includes(1) || tiers.includes(2)) {
            baselinePerGood = 7; // Tier 1-2: Raw materials very abundant (~70% fixed)
        } else if (tiers.includes(3) || tiers.includes(4)) {
            baselinePerGood = 4; // Tier 3-4: Processed goods moderate (~67% fixed)
        } else {
            baselinePerGood = 2; // Tier 5-6: Luxuries still somewhat scarce (~67% fixed)
        }
        
        const baselineSlots = availableGoods.length * baselinePerGood;
        
        if (baselineSlots > totalSlots) {
            // Not enough slots for baseline, just distribute evenly
            const perGood = Math.floor(totalSlots / availableGoods.length);
            for (const goodId of availableGoods) {
                for (let i = 0; i < perGood; i++) {
                    deck.push(goodId);
                }
            }
            // Fill remaining slots
            let index = 0;
            while (deck.length < totalSlots) {
                deck.push(availableGoods[index % availableGoods.length]);
                index++;
            }
            return deck;
        }
        
        // Add baseline buildings
        for (const goodId of availableGoods) {
            for (let i = 0; i < baselinePerGood; i++) {
                deck.push(goodId);
            }
        }
        
        // Step 2: Distribute remaining slots randomly to create exploitable patterns
        const remainingSlots = totalSlots - baselineSlots;
        
        // Random distribution for interesting patterns
        for (let i = 0; i < remainingSlots; i++) {
            // Pick a random good (weighted by tier for more interesting economics)
            const randomGood = availableGoods[Math.floor(Math.random() * availableGoods.length)];
            deck.push(randomGood);
        }
        
        console.log(`Tier ${tiers.join('-')}: ${baselineSlots} baseline + ${remainingSlots} random = ${deck.length} total`);
        
        return deck;
    },
    
    // AIDEV-NOTE: Fisher-Yates shuffle algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
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
    // Produces 12 weeks of goods for each building
    generateInitialStock(ports) {
        for (const port of ports) {
            if (!port.buildings) {
                throw new Error(`Port ${port.id} has no buildings!`);
            }
            
            port.stockpile = {};
            
            for (const building of port.buildings) {
                const quantity = building.productionRate * 12; // 12 weeks of production
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
        
        // Base consumption by tier (dramatically increased to create healthy scarcity)
        let totalConsumption;
        if (port.tier === 1) {
            totalConsumption = 50; // 50 units/week (small villages still need goods!)
        } else if (port.tier === 2) {
            totalConsumption = 120; // 120 units/week (prosperous towns consume a lot)
        } else {
            totalConsumption = 250; // 250 units/week (wealthy capitals are voracious)
        }
        
        // Every port consumes ALL goods up to their max tier
        // Tier 1 ports → consume tier 1-4 goods
        // Tier 2 ports → consume tier 1-5 goods
        // Tier 3 ports → consume tier 1-6 goods (everything!)
        const maxConsumptionTier = port.tier + 3; // Tier 1 → 4, Tier 2 → 5, Tier 3 → 6
        
        // Get all goods up to max tier
        const consumedGoods = Object.keys(GoodsData).filter(goodId => {
            return GoodsData[goodId].tier <= Math.min(maxConsumptionTier, 6);
        });
        
        // Identify which goods are NOT used as industrial inputs (final consumption goods)
        const industrialInputs = new Set();
        for (const goodId in GoodsData) {
            const goodData = GoodsData[goodId];
            if (goodData.consumes && goodData.consumes.length > 0) {
                for (const inputGood of goodData.consumes) {
                    industrialInputs.add(inputGood);
                }
            }
        }
        
        // Calculate weighted consumption with bonus for non-industrial goods
        // Lower tier goods consumed more (tier1: 11x, tier2: 10x, tier3: 4x, tier4: 3x, tier5: 1x, tier6: 0.667x)
        // Tier 1 reduced by 25% to balance citizen consumption
        const tierWeights = { 1: 11, 2: 10, 3: 4, 4: 3, 5: 1, 6: 0.667 };
        
        // Calculate total weight (with bonuses for specific goods and port tiers)
        let totalWeight = 0;
        for (const goodId of consumedGoods) {
            const tier = GoodsData[goodId].tier;
            let weight = tierWeights[tier];
            
            // Boost consumption for goods NOT used in industry (final consumption goods)
            const isIndustrialInput = industrialInputs.has(goodId);
            if (!isIndustrialInput && tier === 1) {
                weight *= 1.875; // 1.875x bonus for tier 1 food (Corn, Fish, Meat) - reduced 25%
            } else if (!isIndustrialInput && tier === 2) {
                weight *= 2.5; // 2.5x bonus for non-industrial tier 2 goods
            } else if (!isIndustrialInput && tier === 3) {
                weight *= 3.5; // 3.5x bonus for non-industrial tier 3 goods
            } else if (!isIndustrialInput && tier === 4) {
                weight *= 4.5; // 4.5x bonus for tier 4 (needs extra consumption to balance)
            }
            
            // Boost dead-end luxury goods (tier 5-6 not used in production)
            if (!isIndustrialInput && tier >= 5) {
                weight *= 3.0; // 3x bonus for dead-end luxury goods
            }
            
            // EXTRA boost for tier 6 specifically (ultimate luxury items)
            if (tier === 6) {
                weight *= 2.0; // 2x bonus for tier 6 goods (reduced from 3x to slow consumption)
            }
            
            // Boost luxury consumption for wealthy ports (tier 2-3 ports consume more tier 5-6 goods)
            if (tier >= 5) {
                if (port.tier === 3) {
                    weight *= 3.5; // Tier 3 ports LOVE luxuries (reduced from 5x)
                } else if (port.tier === 2) {
                    weight *= 2.5; // Tier 2 ports want luxuries (reduced from 3x)
                }
            }
            
            totalWeight += weight;
        }
        
        // Distribute consumption proportionally by weight
        for (const goodId of consumedGoods) {
            const tier = GoodsData[goodId].tier;
            let weight = tierWeights[tier];
            
            // Apply same bonus calculation
            const isIndustrialInput = industrialInputs.has(goodId);
            if (!isIndustrialInput && tier === 1) {
                weight *= 1.875; // Match first loop
            } else if (!isIndustrialInput && tier === 2) {
                weight *= 2.5; // Match first loop
            } else if (!isIndustrialInput && tier === 3) {
                weight *= 3.5; // Match first loop
            } else if (!isIndustrialInput && tier === 4) {
                weight *= 4.5; // Match first loop
            }
            
            // Apply dead-end luxury bonus
            if (!isIndustrialInput && tier >= 5) {
                weight *= 3.0;
            }
            
            // Apply tier 6 specific boost
            if (tier === 6) {
                weight *= 2.0; // Match first loop
            }
            
            // Apply luxury boost for wealthy ports
            if (tier >= 5) {
                if (port.tier === 3) {
                    weight *= 3.5; // Match first loop
                } else if (port.tier === 2) {
                    weight *= 2.5; // Match first loop
                }
            }
            
            consumption[goodId] = (weight / totalWeight) * totalConsumption;
        }
        
        // Add industrial consumption (inputs for production)
        const industrial = this.calculateIndustrialConsumption(port);
        for (const goodId in industrial) {
            if (!consumption[goodId]) {
                consumption[goodId] = 0;
            }
            consumption[goodId] += industrial[goodId];
        }
        
        return consumption;
    },
    
    // AIDEV-NOTE: Calculate industrial consumption for a port
    // Based on what buildings need as inputs for production
    calculateIndustrialConsumption(port) {
        const industrial = {};
        
        if (!port.buildings) return industrial;
        
        for (const building of port.buildings) {
            const goodData = GoodsData[building.goodId];
            if (!goodData || !goodData.consumes) continue;
            
            // Calculate consumption ratio based on number of inputs
            // 1 input: 1:1 ratio (e.g., Beer needs 1 Grain)
            // 2 inputs: 0.5:1 ratio each (e.g., Weapons needs 0.5 Iron Ingots + 0.5 Coke)
            const numInputs = goodData.consumes.length;
            const consumptionRatio = numInputs === 1 ? 1.0 : 0.5;
            
            // For each input this building needs
            for (const inputGoodId of goodData.consumes) {
                if (!industrial[inputGoodId]) {
                    industrial[inputGoodId] = 0;
                }
                industrial[inputGoodId] += building.productionRate * consumptionRatio;
            }
        }
        
        return industrial;
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
        const householdStock = port.householdSupply[goodId] || 0;
        const totalStock = marketStock + householdStock;
        const consumption = port.consumption[goodId] || 0;
        
        // Equilibrium = 2 months of consumption
        const equilibriumStock = consumption * 4 * 2; // 4 weeks/month * 2 months
        
        // Calculate months of supply
        let monthsOfSupply = 0;
        if (consumption > 0) {
            monthsOfSupply = totalStock / (consumption * 4);
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
        const householdStock = port.householdSupply[goodId] || 0;
        const totalStock = marketStock + householdStock;
        
        // Use asymptotic pricing formula
        const minMultiplier = 0.25;  // 25% floor
        const numerator = equilibrium + minMultiplier * totalStock;
        const denominator = minMultiplier * equilibrium + totalStock;
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
        
        // Generate buildings for all ports (deterministic distribution)
        this.generateAllPortBuildings(ports);
        
        // Calculate consumption and initialize prosperity
        for (const port of ports) {
            port.consumption = this.calculatePortConsumption(port);
            port.householdSupply = {};
            port.prosperity = 1.0;
        }
        
        // Generate initial stock (12 weeks of production)
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
            total += boat.cargo[goodId].quantity || boat.cargo[goodId];
        }
        return total;
    },
    
    addCargoToBoat(boat, goodId, quantity, avgPrice) {
        const used = this.getCargoUsed(boat);
        const available = boat.cargoCapacity - used;
        
        if (quantity > available) {
            return false; // Not enough space
        }
        
        // Initialize cargo entry if it doesn't exist
        if (!boat.cargo[goodId]) {
            boat.cargo[goodId] = { quantity: 0, avgPrice: 0 };
        }
        
        // Handle old format (just number) by converting to new format
        if (typeof boat.cargo[goodId] === 'number') {
            boat.cargo[goodId] = { quantity: boat.cargo[goodId], avgPrice: GoodsData[goodId]?.basePrice || 0 };
        }
        
        // Calculate new weighted average price
        const currentTotal = boat.cargo[goodId].quantity;
        const currentAvgPrice = boat.cargo[goodId].avgPrice || 0;
        const newTotal = currentTotal + quantity;
        const newAvgPrice = ((currentTotal * currentAvgPrice) + (quantity * avgPrice)) / newTotal;
        
        boat.cargo[goodId].quantity = newTotal;
        boat.cargo[goodId].avgPrice = Math.round(newAvgPrice);
        
        return true;
    },
    
    removeCargoFromBoat(boat, goodId, quantity) {
        // Handle old format (just number)
        if (typeof boat.cargo[goodId] === 'number') {
            boat.cargo[goodId] = { quantity: boat.cargo[goodId], avgPrice: GoodsData[goodId]?.basePrice || 0 };
        }
        
        const current = boat.cargo[goodId]?.quantity || 0;
        if (quantity > current) {
            return false; // Not enough cargo
        }
        
        boat.cargo[goodId].quantity -= quantity;
        if (boat.cargo[goodId].quantity === 0) {
            delete boat.cargo[goodId];
        }
        return true;
    },
    
    getCargoValue(cargo) {
        let total = 0;
        for (const goodId in cargo) {
            const goodData = GoodsData[goodId];
            if (goodData) {
                const quantity = cargo[goodId].quantity || cargo[goodId];
                total += quantity * goodData.basePrice;
            }
        }
        return total;
    },
    
    // AIDEV-NOTE: Execute trade transaction between port and boat
    // transactions: { goodId: amount } (positive = buy from port, negative = sell to port)
    executeTrade(port, boat, transactions, playerGold) {
        // AIDEV-NOTE: Execute trades exactly as requested by UI
        // All validation should happen in the UI before calling this
        // This function trusts the UI and executes unconditionally
        
        let goldSpent = 0;
        const changes = [];
        
        // Process all transactions - SELL FIRST, then BUY
        // This ensures we free up cargo space and earn gold before buying
        const sellTransactions = [];
        const buyTransactions = [];
        
        for (const goodId in transactions) {
            const amount = transactions[goodId];
            if (amount === 0) continue;
            
            if (amount < 0) {
                sellTransactions.push({ goodId, amount });
            } else {
                buyTransactions.push({ goodId, amount });
            }
        }
        
        // Execute sells first
        for (const { goodId, amount } of sellTransactions) {
            const sellAmount = -amount;
            const tradeGoldChange = this.calculateTotalCostForTrade(port, goodId, amount);
            goldSpent -= tradeGoldChange; // Invert convention
            
            // Sell to port
            this.removeCargoFromBoat(boat, goodId, sellAmount);
            if (!port.stockpile[goodId]) {
                port.stockpile[goodId] = 0;
            }
            port.stockpile[goodId] += sellAmount;
            
            changes.push({ goodId, amount });
        }
        
        // Execute buys second (after cargo space and gold freed up)
        for (const { goodId, amount } of buyTransactions) {
            const tradeGoldChange = this.calculateTotalCostForTrade(port, goodId, amount);
            goldSpent -= tradeGoldChange; // Invert convention
            
            // Calculate average price for tracking
            const avgPrice = Math.round(Math.abs(tradeGoldChange) / amount);
            
            // Buy from port
            port.stockpile[goodId] = (port.stockpile[goodId] || 0) - amount;
            this.addCargoToBoat(boat, goodId, amount, avgPrice);
            
            changes.push({ goodId, amount, avgPrice });
        }
        
        // Recalculate prices after trade
        for (const goodId in transactions) {
            port.prices[goodId] = this.calculatePrice(port, goodId);
        }
        
        return { success: true, goldChange: goldSpent };
    },
    
    // AIDEV-NOTE: Execute weekly production for a port
    // Buildings produce goods and add to market stockpile
    // For now, produce even without required inputs (shortage handling later)
    produceWeeklyGoods(port) {
        if (!port.buildings) return;
        
        for (const building of port.buildings) {
            const goodId = building.goodId;
            const amount = building.productionRate; // Weekly production
            
            if (!port.stockpile[goodId]) {
                port.stockpile[goodId] = 0;
            }
            port.stockpile[goodId] += amount;
        }
    },
    
    // AIDEV-NOTE: Economy simulation tick
    // Called from game loop based on time progression
    simulationTick(ports, gameTime) {
        // Check if week rolled over (trigger weekly production)
        if (gameTime.weekChanged) {
            for (const port of ports) {
                this.produceWeeklyGoods(port);
            }
        }
        
        // Daily consumption (every day)
        if (gameTime.dayChanged) {
            for (const port of ports) {
                this.simulateDailyConsumption(port);
                this.calculateProsperity(port);
            }
        }
        
        // Recalculate prices after any stock changes
        if (gameTime.weekChanged || gameTime.dayChanged) {
            for (const port of ports) {
                for (const goodId in GoodsData) {
                    port.prices[goodId] = this.calculatePrice(port, goodId);
                }
            }
        }
    }
};

// AIDEV-NOTE: Export GoodsData for use in other modules
// (In browser context, these are available globally)

