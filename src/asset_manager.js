// BOTA - Asset Manager
// Centralized asset loading and management
// Handles images, sounds, and other game assets

const AssetManager = {
    // Asset storage
    assets: new Map(),
    
    // Loading state
    loading: false,
    loadedCount: 0,
    totalCount: 0,
    
    // Asset definitions
    assetDefinitions: {
        images: new Map(),
        sounds: new Map(),
        fonts: new Map(),
        data: new Map()
    },
    
    // Loading callbacks
    onProgress: null,
    onComplete: null,
    onError: null,
    
    // Asset cache
    cache: new Map(),
    
    // Asset paths
    basePath: 'assets/',
    
    /**
     * Initialize asset manager
     * @param {string} basePath - Base path for assets
     */
    init(basePath = 'assets/') {
        this.basePath = basePath;
        this.assets.clear();
        this.assetDefinitions.images.clear();
        this.assetDefinitions.sounds.clear();
        this.assetDefinitions.fonts.clear();
        this.assetDefinitions.data.clear();
        this.cache.clear();
        
        this.loading = false;
        this.loadedCount = 0;
        this.totalCount = 0;
        
        console.log('AssetManager initialized');
    },
    
    /**
     * Add image asset definition
     * @param {string} id - Asset ID
     * @param {string} path - Asset path
     * @param {Object} options - Asset options
     */
    addImage(id, path, options = {}) {
        this.assetDefinitions.images.set(id, {
            type: 'image',
            path: path,
            options: {
                preload: true,
                cache: true,
                ...options
            }
        });
    },
    
    /**
     * Add sound asset definition
     * @param {string} id - Asset ID
     * @param {string} path - Asset path
     * @param {Object} options - Asset options
     */
    addSound(id, path, options = {}) {
        this.assetDefinitions.sounds.set(id, {
            type: 'sound',
            path: path,
            options: {
                preload: true,
                cache: true,
                volume: 1.0,
                loop: false,
                ...options
            }
        });
    },
    
    /**
     * Add font asset definition
     * @param {string} id - Asset ID
     * @param {string} path - Asset path
     * @param {Object} options - Asset options
     */
    addFont(id, path, options = {}) {
        this.assetDefinitions.fonts.set(id, {
            type: 'font',
            path: path,
            options: {
                preload: true,
                cache: true,
                ...options
            }
        });
    },
    
    /**
     * Add data asset definition
     * @param {string} id - Asset ID
     * @param {string} path - Asset path
     * @param {Object} options - Asset options
     */
    addData(id, path, options = {}) {
        this.assetDefinitions.data.set(id, {
            type: 'data',
            path: path,
            options: {
                preload: true,
                cache: true,
                format: 'json',
                ...options
            }
        });
    },
    
    /**
     * Load all assets
     * @returns {Promise} Loading promise
     */
    async loadAll() {
        if (this.loading) {
            console.warn('Assets already loading');
            return;
        }
        
        this.loading = true;
        this.loadedCount = 0;
        this.totalCount = this.getTotalAssetCount();
        
        try {
            // Load images
            await this.loadImages();
            
            // Load sounds
            await this.loadSounds();
            
            // Load fonts
            await this.loadFonts();
            
            // Load data
            await this.loadData();
            
            this.loading = false;
            
            if (this.onComplete) {
                this.onComplete();
            }
            
            console.log('All assets loaded successfully');
            
        } catch (error) {
            this.loading = false;
            
            if (this.onError) {
                this.onError(error);
            }
            
            console.error('Asset loading failed:', error);
            throw error;
        }
    },
    
    /**
     * Load images
     * @returns {Promise} Loading promise
     */
    async loadImages() {
        const promises = [];
        
        for (const [id, definition] of this.assetDefinitions.images) {
            if (definition.options.preload) {
                promises.push(this.loadImage(id, definition));
            }
        }
        
        await Promise.all(promises);
    },
    
    /**
     * Load sounds
     * @returns {Promise} Loading promise
     */
    async loadSounds() {
        const promises = [];
        
        for (const [id, definition] of this.assetDefinitions.sounds) {
            if (definition.options.preload) {
                promises.push(this.loadSound(id, definition));
            }
        }
        
        await Promise.all(promises);
    },
    
    /**
     * Load fonts
     * @returns {Promise} Loading promise
     */
    async loadFonts() {
        const promises = [];
        
        for (const [id, definition] of this.assetDefinitions.fonts) {
            if (definition.options.preload) {
                promises.push(this.loadFont(id, definition));
            }
        }
        
        await Promise.all(promises);
    },
    
    /**
     * Load data
     * @returns {Promise} Loading promise
     */
    async loadData() {
        const promises = [];
        
        for (const [id, definition] of this.assetDefinitions.data) {
            if (definition.options.preload) {
                promises.push(this.loadDataFile(id, definition));
            }
        }
        
        await Promise.all(promises);
    },
    
    /**
     * Load single image
     * @param {string} id - Asset ID
     * @param {Object} definition - Asset definition
     * @returns {Promise} Loading promise
     */
    async loadImage(id, definition) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.set(id, img);
                this.loadedCount++;
                this.updateProgress();
                resolve(img);
            };
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${definition.path}`));
            };
            img.src = this.basePath + definition.path;
        });
    },
    
    /**
     * Load single sound
     * @param {string} id - Asset ID
     * @param {Object} definition - Asset definition
     * @returns {Promise} Loading promise
     */
    async loadSound(id, definition) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.volume = definition.options.volume || 1.0;
            audio.loop = definition.options.loop || false;
            
            audio.addEventListener('canplaythrough', () => {
                this.assets.set(id, audio);
                this.loadedCount++;
                this.updateProgress();
                resolve(audio);
            });
            
            audio.addEventListener('error', () => {
                reject(new Error(`Failed to load sound: ${definition.path}`));
            });
            
            audio.src = this.basePath + definition.path;
        });
    },
    
    /**
     * Load single font
     * @param {string} id - Asset ID
     * @param {Object} definition - Asset definition
     * @returns {Promise} Loading promise
     */
    async loadFont(id, definition) {
        return new Promise((resolve, reject) => {
            const font = new FontFace(id, `url(${this.basePath + definition.path})`);
            
            font.load().then(() => {
                document.fonts.add(font);
                this.assets.set(id, font);
                this.loadedCount++;
                this.updateProgress();
                resolve(font);
            }).catch((error) => {
                reject(new Error(`Failed to load font: ${definition.path}`));
            });
        });
    },
    
    /**
     * Load single data file
     * @param {string} id - Asset ID
     * @param {Object} definition - Asset definition
     * @returns {Promise} Loading promise
     */
    async loadDataFile(id, definition) {
        try {
            const response = await fetch(this.basePath + definition.path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            let data;
            switch (definition.options.format) {
                case 'json':
                    data = await response.json();
                    break;
                case 'text':
                    data = await response.text();
                    break;
                case 'blob':
                    data = await response.blob();
                    break;
                default:
                    data = await response.text();
            }
            
            this.assets.set(id, data);
            this.loadedCount++;
            this.updateProgress();
            return data;
            
        } catch (error) {
            throw new Error(`Failed to load data: ${definition.path}`);
        }
    },
    
    /**
     * Get asset by ID
     * @param {string} id - Asset ID
     * @returns {*} Asset or null if not found
     */
    get(id) {
        return this.assets.get(id) || null;
    },
    
    /**
     * Check if asset is loaded
     * @param {string} id - Asset ID
     * @returns {boolean} Whether asset is loaded
     */
    isLoaded(id) {
        return this.assets.has(id);
    },
    
    /**
     * Get loading progress
     * @returns {number} Progress (0-1)
     */
    getProgress() {
        return this.totalCount > 0 ? this.loadedCount / this.totalCount : 1;
    },
    
    /**
     * Get total asset count
     * @returns {number} Total asset count
     */
    getTotalAssetCount() {
        let count = 0;
        for (const definitionMap of Object.values(this.assetDefinitions)) {
            for (const definition of definitionMap.values()) {
                if (definition.options.preload) {
                    count++;
                }
            }
        }
        return count;
    },
    
    /**
     * Update progress and call callback
     */
    updateProgress() {
        if (this.onProgress) {
            this.onProgress(this.getProgress(), this.loadedCount, this.totalCount);
        }
    },
    
    /**
     * Set progress callback
     * @param {Function} callback - Progress callback
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    },
    
    /**
     * Set complete callback
     * @param {Function} callback - Complete callback
     */
    setCompleteCallback(callback) {
        this.onComplete = callback;
    },
    
    /**
     * Set error callback
     * @param {Function} callback - Error callback
     */
    setErrorCallback(callback) {
        this.onError = callback;
    },
    
    /**
     * Preload asset
     * @param {string} id - Asset ID
     * @returns {Promise} Loading promise
     */
    async preload(id) {
        // Check if already loaded
        if (this.assets.has(id)) {
            return this.assets.get(id);
        }
        
        // Check cache
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        
        // Find asset definition
        let definition = null;
        for (const definitionMap of Object.values(this.assetDefinitions)) {
            if (definitionMap.has(id)) {
                definition = definitionMap.get(id);
                break;
            }
        }
        
        if (!definition) {
            throw new Error(`Asset not found: ${id}`);
        }
        
        // Load asset based on type
        let asset;
        switch (definition.type) {
            case 'image':
                asset = await this.loadImage(id, definition);
                break;
            case 'sound':
                asset = await this.loadSound(id, definition);
                break;
            case 'font':
                asset = await this.loadFont(id, definition);
                break;
            case 'data':
                asset = await this.loadDataFile(id, definition);
                break;
            default:
                throw new Error(`Unknown asset type: ${definition.type}`);
        }
        
        // Cache if enabled
        if (definition.options.cache) {
            this.cache.set(id, asset);
        }
        
        return asset;
    },
    
    /**
     * Clear asset cache
     */
    clearCache() {
        this.cache.clear();
    },
    
    /**
     * Get asset statistics
     * @returns {Object} Asset statistics
     */
    getStats() {
        return {
            totalAssets: this.assets.size,
            loadedCount: this.loadedCount,
            totalCount: this.totalCount,
            progress: this.getProgress(),
            loading: this.loading,
            cacheSize: this.cache.size
        };
    },
    
    /**
     * Get all loaded asset IDs
     * @returns {Array} Asset IDs
     */
    getLoadedAssets() {
        return Array.from(this.assets.keys());
    },
    
    /**
     * Check if all assets are loaded
     * @returns {boolean} Whether all assets are loaded
     */
    isAllLoaded() {
        return this.loadedCount >= this.totalCount && !this.loading;
    },
    
    /**
     * Unload asset
     * @param {string} id - Asset ID
     */
    unload(id) {
        this.assets.delete(id);
        this.cache.delete(id);
    },
    
    /**
     * Unload all assets
     */
    unloadAll() {
        this.assets.clear();
        this.cache.clear();
        this.loadedCount = 0;
    }
};
