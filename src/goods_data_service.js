// BOTA - Goods Data Service
// Centralized goods data management and validation
// Handles goods definitions, tier information, and data consistency

const GoodsDataService = {
    // Goods data storage
    goods: new Map(),
    
    // Tier definitions
    tiers: {
        1: { name: 'Basic', color: '#8B4513', description: 'Essential goods for basic needs' },
        2: { name: 'Common', color: '#228B22', description: 'Common trade goods' },
        3: { name: 'Uncommon', color: '#4169E1', description: 'Uncommon specialty goods' },
        4: { name: 'Rare', color: '#9370DB', description: 'Rare luxury goods' },
        5: { name: 'Epic', color: '#FF8C00', description: 'Epic masterwork goods' },
        6: { name: 'Legendary', color: '#FFD700', description: 'Legendary artifacts' }
    },
    
    // Category definitions
    categories: {
        'food': { name: 'Food', icon: '🍎', description: 'Edible goods and provisions' },
        'materials': { name: 'Materials', icon: '🔨', description: 'Raw materials and resources' },
        'luxury': { name: 'Luxury', icon: '💎', description: 'Luxury goods and ornaments' },
        'tools': { name: 'Tools', icon: '⚒️', description: 'Tools and equipment' },
        'magic': { name: 'Magic', icon: '✨', description: 'Magical items and components' },
        'artifacts': { name: 'Artifacts', icon: '🏺', description: 'Ancient artifacts and relics' }
    },
    
    // Faction preferences
    factionPreferences: new Map(),
    
    // Data validation
    validation: {
        requiredFields: ['id', 'name', 'tier', 'basePrice', 'category'],
        priceRange: { min: 1, max: 10000 },
        tierRange: { min: 1, max: 6 }
    },
    
    /**
     * Initialize goods data service
     */
    init() {
        this.goods.clear();
        this.factionPreferences.clear();
        this.loadDefaultGoods();
        this.loadFactionPreferences();
        console.log('GoodsDataService initialized');
    },
    
    /**
     * Load default goods data
     */
    loadDefaultGoods() {
        // This would typically load from a data file
        // For now, we'll define some basic goods
        const defaultGoods = [
            {
                id: 'wheat',
                name: 'Wheat',
                tier: 1,
                basePrice: 5,
                category: 'food',
                description: 'Basic grain for bread and porridge',
                weight: 1,
                stackSize: 100
            },
            {
                id: 'iron_ore',
                name: 'Iron Ore',
                tier: 2,
                basePrice: 15,
                category: 'materials',
                description: 'Raw iron ore for smelting',
                weight: 2,
                stackSize: 50
            },
            {
                id: 'silk',
                name: 'Silk',
                tier: 4,
                basePrice: 200,
                category: 'luxury',
                description: 'Fine silk fabric',
                weight: 1,
                stackSize: 20
            },
            {
                id: 'magic_crystal',
                name: 'Magic Crystal',
                tier: 5,
                basePrice: 500,
                category: 'magic',
                description: 'Crystal imbued with magical energy',
                weight: 1,
                stackSize: 10
            }
        ];
        
        for (const good of defaultGoods) {
            this.addGood(good);
        }
    },
    
    /**
     * Load faction preferences
     */
    loadFactionPreferences() {
        // This would typically load from a data file
        // For now, we'll define some basic preferences
        this.factionPreferences.set('humans', {
            name: 'Humans',
            preferences: {
                tier1: ['wheat', 'bread'],
                tier2: ['iron_ore', 'tools'],
                tier3: ['cloth', 'leather'],
                tier4: ['silk', 'jewelry'],
                tier5: ['magic_crystal', 'enchanted_weapons'],
                tier6: ['ancient_artifacts', 'legendary_items']
            }
        });
        
        this.factionPreferences.set('elves', {
            name: 'Elves',
            preferences: {
                tier1: ['berries', 'herbs'],
                tier2: ['wood', 'leather'],
                tier3: ['cloth', 'potions'],
                tier4: ['silk', 'magic_items'],
                tier5: ['magic_crystal', 'enchanted_armor'],
                tier6: ['ancient_artifacts', 'legendary_items']
            }
        });
    },
    
    /**
     * Add good to data service
     * @param {Object} goodData - Good data
     * @returns {boolean} Whether good was added successfully
     */
    addGood(goodData) {
        // Validate good data
        if (!this.validateGoodData(goodData)) {
            console.error('Invalid good data:', goodData);
            return false;
        }
        
        // Add to goods map
        this.goods.set(goodData.id, {
            ...goodData,
            createdAt: Date.now(),
            lastModified: Date.now()
        });
        
        return true;
    },
    
    /**
     * Update good data
     * @param {string} goodId - Good ID
     * @param {Object} updates - Updates to apply
     * @returns {boolean} Whether good was updated successfully
     */
    updateGood(goodId, updates) {
        if (!this.goods.has(goodId)) {
            console.error('Good not found:', goodId);
            return false;
        }
        
        const good = this.goods.get(goodId);
        const updatedGood = { ...good, ...updates, lastModified: Date.now() };
        
        if (!this.validateGoodData(updatedGood)) {
            console.error('Invalid updated good data:', updatedGood);
            return false;
        }
        
        this.goods.set(goodId, updatedGood);
        return true;
    },
    
    /**
     * Remove good from data service
     * @param {string} goodId - Good ID
     * @returns {boolean} Whether good was removed successfully
     */
    removeGood(goodId) {
        if (!this.goods.has(goodId)) {
            console.error('Good not found:', goodId);
            return false;
        }
        
        this.goods.delete(goodId);
        return true;
    },
    
    /**
     * Get good by ID
     * @param {string} goodId - Good ID
     * @returns {Object|null} Good data or null if not found
     */
    getGood(goodId) {
        return this.goods.get(goodId) || null;
    },
    
    /**
     * Get all goods
     * @returns {Array} Array of good data
     */
    getAllGoods() {
        return Array.from(this.goods.values());
    },
    
    /**
     * Get goods by tier
     * @param {number} tier - Tier number
     * @returns {Array} Array of good data
     */
    getGoodsByTier(tier) {
        return Array.from(this.goods.values()).filter(good => good.tier === tier);
    },
    
    /**
     * Get goods by category
     * @param {string} category - Category name
     * @returns {Array} Array of good data
     */
    getGoodsByCategory(category) {
        return Array.from(this.goods.values()).filter(good => good.category === category);
    },
    
    /**
     * Search goods by name
     * @param {string} query - Search query
     * @returns {Array} Array of matching good data
     */
    searchGoods(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.goods.values()).filter(good => 
            good.name.toLowerCase().includes(lowerQuery) ||
            good.description.toLowerCase().includes(lowerQuery)
        );
    },
    
    /**
     * Get tier information
     * @param {number} tier - Tier number
     * @returns {Object|null} Tier data or null if not found
     */
    getTierInfo(tier) {
        return this.tiers[tier] || null;
    },
    
    /**
     * Get all tiers
     * @returns {Object} All tier data
     */
    getAllTiers() {
        return { ...this.tiers };
    },
    
    /**
     * Get category information
     * @param {string} category - Category name
     * @returns {Object|null} Category data or null if not found
     */
    getCategoryInfo(category) {
        return this.categories[category] || null;
    },
    
    /**
     * Get all categories
     * @returns {Object} All category data
     */
    getAllCategories() {
        return { ...this.categories };
    },
    
    /**
     * Get faction preferences
     * @param {string} factionId - Faction ID
     * @returns {Object|null} Faction preferences or null if not found
     */
    getFactionPreferences(factionId) {
        return this.factionPreferences.get(factionId) || null;
    },
    
    /**
     * Get all faction preferences
     * @returns {Object} All faction preferences
     */
    getAllFactionPreferences() {
        return Object.fromEntries(this.factionPreferences);
    },
    
    /**
     * Check if good is preferred by faction
     * @param {string} goodId - Good ID
     * @param {string} factionId - Faction ID
     * @returns {boolean} Whether good is preferred
     */
    isGoodPreferredByFaction(goodId, factionId) {
        const preferences = this.getFactionPreferences(factionId);
        if (!preferences) return false;
        
        const good = this.getGood(goodId);
        if (!good) return false;
        
        const tierKey = `tier${good.tier}`;
        return preferences.preferences[tierKey]?.includes(goodId) || false;
    },
    
    /**
     * Get goods preferred by faction
     * @param {string} factionId - Faction ID
     * @returns {Array} Array of preferred good data
     */
    getGoodsPreferredByFaction(factionId) {
        const preferences = this.getFactionPreferences(factionId);
        if (!preferences) return [];
        
        const preferredGoods = [];
        for (const tierKey in preferences.preferences) {
            const tier = parseInt(tierKey.replace('tier', ''));
            const goodIds = preferences.preferences[tierKey];
            
            for (const goodId of goodIds) {
                const good = this.getGood(goodId);
                if (good) {
                    preferredGoods.push(good);
                }
            }
        }
        
        return preferredGoods;
    },
    
    /**
     * Validate good data
     * @param {Object} goodData - Good data to validate
     * @returns {boolean} Whether data is valid
     */
    validateGoodData(goodData) {
        // Check required fields
        for (const field of this.validation.requiredFields) {
            if (!(field in goodData)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        
        // Validate price range
        if (goodData.basePrice < this.validation.priceRange.min || 
            goodData.basePrice > this.validation.priceRange.max) {
            console.error(`Price out of range: ${goodData.basePrice}`);
            return false;
        }
        
        // Validate tier range
        if (goodData.tier < this.validation.tierRange.min || 
            goodData.tier > this.validation.tierRange.max) {
            console.error(`Tier out of range: ${goodData.tier}`);
            return false;
        }
        
        // Validate category exists
        if (!this.categories[goodData.category]) {
            console.error(`Unknown category: ${goodData.category}`);
            return false;
        }
        
        return true;
    },
    
    /**
     * Get goods statistics
     * @returns {Object} Goods statistics
     */
    getStats() {
        const stats = {
            totalGoods: this.goods.size,
            goodsByTier: {},
            goodsByCategory: {},
            averagePrice: 0,
            priceRange: { min: Infinity, max: -Infinity }
        };
        
        let totalPrice = 0;
        
        for (const good of this.goods.values()) {
            // Count by tier
            stats.goodsByTier[good.tier] = (stats.goodsByTier[good.tier] || 0) + 1;
            
            // Count by category
            stats.goodsByCategory[good.category] = (stats.goodsByCategory[good.category] || 0) + 1;
            
            // Price statistics
            totalPrice += good.basePrice;
            stats.priceRange.min = Math.min(stats.priceRange.min, good.basePrice);
            stats.priceRange.max = Math.max(stats.priceRange.max, good.basePrice);
        }
        
        stats.averagePrice = this.goods.size > 0 ? totalPrice / this.goods.size : 0;
        
        return stats;
    },
    
    /**
     * Export goods data
     * @returns {Object} Exported goods data
     */
    exportData() {
        return {
            goods: Object.fromEntries(this.goods),
            tiers: this.tiers,
            categories: this.categories,
            factionPreferences: Object.fromEntries(this.factionPreferences),
            exportedAt: Date.now()
        };
    },
    
    /**
     * Import goods data
     * @param {Object} data - Imported goods data
     * @returns {boolean} Whether import was successful
     */
    importData(data) {
        try {
            if (data.goods) {
                this.goods.clear();
                for (const [id, good] of Object.entries(data.goods)) {
                    this.goods.set(id, good);
                }
            }
            
            if (data.tiers) {
                this.tiers = { ...this.tiers, ...data.tiers };
            }
            
            if (data.categories) {
                this.categories = { ...this.categories, ...data.categories };
            }
            
            if (data.factionPreferences) {
                this.factionPreferences.clear();
                for (const [id, prefs] of Object.entries(data.factionPreferences)) {
                    this.factionPreferences.set(id, prefs);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import goods data:', error);
            return false;
        }
    },
    
    /**
     * Clear all goods data
     */
    clear() {
        this.goods.clear();
        this.factionPreferences.clear();
    }
};
