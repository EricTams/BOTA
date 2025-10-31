// BOTA - Game State Manager
// Centralized state management for the game
// Handles game state, player data, and state transitions

const GameState = {
    // Current game state
    state: 'main_menu', // 'main_menu', 'playing', 'paused', 'game_over'
    
    // Game running flag
    running: false,
    
    // Frame timing
    lastFrameTime: 0,
    deltaTime: 0,
    
    // Game data
    player: null,
    playerBoat: null,
    ports: [],
    aiBoats: [],
    
    // Camera state
    camera: {
        x: 0,
        y: 0,
        zoom: 1,
        targetX: 0,
        targetY: 0,
        targetZoom: 1,
        smoothing: 0.1
    },
    
    // Game time
    gameTime: {
        day: 1,
        hour: 0,
        minute: 0,
        speed: 1, // 1x, 2x, 4x, 0 (paused)
        paused: false
    },
    
    // Debug state
    debug: {
        enabled: false,
        showFPS: false,
        showCollisions: false,
        showPaths: false,
        showClickPositions: false
    },
    
    // UI state
    ui: {
        currentScreen: 'main_menu',
        isOverlayActive: false,
        activeModals: []
    },
    
    // Trading state
    trading: {
        currentTransactions: {},
        selectedPort: null
    },
    
    // Combat state
    combat: {
        active: false,
        currentEncounter: null,
        diceRolls: [],
        selectedAbilities: []
    },
    
    /**
     * Initialize game state
     */
    init() {
        this.reset();
        console.log('GameState initialized');
    },
    
    /**
     * Reset game state to initial values
     */
    reset() {
        this.state = 'main_menu';
        this.running = false;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        
        this.player = {
            name: 'Captain',
            gold: 1000,
            reputations: {},
            level: 1,
            experience: 0
        };
        
        this.playerBoat = null;
        this.ports = [];
        this.aiBoats = [];
        
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            targetX: 0,
            targetY: 0,
            targetZoom: 1,
            smoothing: 0.1
        };
        
        this.gameTime = {
            day: 1,
            hour: 0,
            minute: 0,
            speed: 1,
            paused: false
        };
        
        this.debug = {
            enabled: false,
            showFPS: false,
            showCollisions: false,
            showPaths: false,
            showClickPositions: false
        };
        
        this.ui = {
            currentScreen: 'main_menu',
            isOverlayActive: false,
            activeModals: []
        };
        
        this.trading = {
            currentTransactions: {},
            selectedPort: null
        };
        
        this.combat = {
            active: false,
            currentEncounter: null,
            diceRolls: [],
            selectedAbilities: []
        };
    },
    
    /**
     * Set game state
     * @param {string} newState - New game state
     */
    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        
        // Handle state transitions
        switch (newState) {
            case 'main_menu':
                this.running = false;
                this.ui.currentScreen = 'main_menu';
                this.ui.isOverlayActive = false;
                break;
                
            case 'playing':
                this.running = true;
                this.ui.currentScreen = 'game';
                this.ui.isOverlayActive = false;
                break;
                
            case 'paused':
                this.running = false;
                this.gameTime.paused = true;
                break;
                
            case 'game_over':
                this.running = false;
                this.ui.currentScreen = 'game_over';
                break;
        }
        
        console.log(`Game state changed: ${oldState} -> ${newState}`);
    },
    
    /**
     * Start the game
     */
    startGame() {
        this.setState('playing');
        this.gameTime.paused = false;
    },
    
    /**
     * Pause the game
     */
    pauseGame() {
        this.setState('paused');
    },
    
    /**
     * Resume the game
     */
    resumeGame() {
        this.setState('playing');
    },
    
    /**
     * End the game
     */
    endGame() {
        this.setState('game_over');
    },
    
    /**
     * Return to main menu
     */
    returnToMainMenu() {
        this.setState('main_menu');
        this.reset();
    },
    
    /**
     * Update game time
     * @param {number} deltaTime - Time since last frame
     */
    updateGameTime(deltaTime) {
        if (this.gameTime.paused) return;
        
        const timeMultiplier = this.gameTime.speed * deltaTime;
        this.gameTime.minute += timeMultiplier * 60; // 60 minutes per second at 1x speed
        
        if (this.gameTime.minute >= 60) {
            this.gameTime.hour += Math.floor(this.gameTime.minute / 60);
            this.gameTime.minute = this.gameTime.minute % 60;
        }
        
        if (this.gameTime.hour >= 24) {
            this.gameTime.day += Math.floor(this.gameTime.hour / 24);
            this.gameTime.hour = this.gameTime.hour % 24;
        }
    },
    
    /**
     * Set game time speed
     * @param {number} speed - Speed multiplier (0 = paused, 1 = normal, 2 = 2x, 4 = 4x)
     */
    setTimeSpeed(speed) {
        this.gameTime.speed = speed;
        this.gameTime.paused = speed === 0;
    },
    
    /**
     * Toggle game pause
     */
    togglePause() {
        if (this.gameTime.paused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    },
    
    /**
     * Update camera position
     * @param {number} deltaTime - Time since last frame
     */
    updateCamera(deltaTime) {
        const smoothing = this.camera.smoothing * deltaTime * 60; // Normalize to 60fps
        
        this.camera.x += (this.camera.targetX - this.camera.x) * smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * smoothing;
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * smoothing;
    },
    
    /**
     * Set camera target position
     * @param {number} x - Target X position
     * @param {number} y - Target Y position
     * @param {number} zoom - Target zoom level
     */
    setCameraTarget(x, y, zoom = null) {
        this.camera.targetX = x;
        this.camera.targetY = y;
        if (zoom !== null) {
            this.camera.targetZoom = zoom;
        }
    },
    
    /**
     * Set camera position immediately
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} zoom - Zoom level
     */
    setCameraPosition(x, y, zoom = null) {
        this.camera.x = x;
        this.camera.y = y;
        this.camera.targetX = x;
        this.camera.targetY = y;
        if (zoom !== null) {
            this.camera.zoom = zoom;
            this.camera.targetZoom = zoom;
        }
    },
    
    /**
     * Update player data
     * @param {Object} playerData - New player data
     */
    updatePlayer(playerData) {
        this.player = { ...this.player, ...playerData };
    },
    
    /**
     * Update player boat data
     * @param {Object} boatData - New boat data
     */
    updatePlayerBoat(boatData) {
        this.playerBoat = { ...this.playerBoat, ...boatData };
    },
    
    /**
     * Add or update port data
     * @param {Object} portData - Port data
     */
    updatePort(portData) {
        const index = this.ports.findIndex(p => p.id === portData.id);
        if (index >= 0) {
            this.ports[index] = { ...this.ports[index], ...portData };
        } else {
            this.ports.push(portData);
        }
    },
    
    /**
     * Get port by ID
     * @param {string} portId - Port ID
     * @returns {Object|null} Port data or null if not found
     */
    getPort(portId) {
        return this.ports.find(p => p.id === portId) || null;
    },
    
    /**
     * Add or update AI boat data
     * @param {Object} boatData - AI boat data
     */
    updateAIBoat(boatData) {
        const index = this.aiBoats.findIndex(b => b.id === boatData.id);
        if (index >= 0) {
            this.aiBoats[index] = { ...this.aiBoats[index], ...boatData };
        } else {
            this.aiBoats.push(boatData);
        }
    },
    
    /**
     * Remove AI boat
     * @param {string} boatId - Boat ID
     */
    removeAIBoat(boatId) {
        this.aiBoats = this.aiBoats.filter(b => b.id !== boatId);
    },
    
    /**
     * Set UI screen
     * @param {string} screen - Screen name
     */
    setUIScreen(screen) {
        this.ui.currentScreen = screen;
    },
    
    /**
     * Set overlay active state
     * @param {boolean} active - Whether overlay is active
     */
    setOverlayActive(active) {
        this.ui.isOverlayActive = active;
    },
    
    /**
     * Add active modal
     * @param {string} modalId - Modal ID
     */
    addActiveModal(modalId) {
        if (!this.ui.activeModals.includes(modalId)) {
            this.ui.activeModals.push(modalId);
        }
    },
    
    /**
     * Remove active modal
     * @param {string} modalId - Modal ID
     */
    removeActiveModal(modalId) {
        this.ui.activeModals = this.ui.activeModals.filter(id => id !== modalId);
    },
    
    /**
     * Set debug option
     * @param {string} option - Debug option name
     * @param {boolean} value - Debug option value
     */
    setDebugOption(option, value) {
        if (this.debug.hasOwnProperty(option)) {
            this.debug[option] = value;
        }
    },
    
    /**
     * Toggle debug option
     * @param {string} option - Debug option name
     */
    toggleDebugOption(option) {
        if (this.debug.hasOwnProperty(option)) {
            this.debug[option] = !this.debug[option];
        }
    },
    
    /**
     * Set trading transactions
     * @param {Object} transactions - Transaction object
     */
    setTradingTransactions(transactions) {
        this.trading.currentTransactions = { ...transactions };
    },
    
    /**
     * Set selected port for trading
     * @param {Object} port - Port data
     */
    setSelectedPort(port) {
        this.trading.selectedPort = port;
    },
    
    /**
     * Set combat state
     * @param {Object} combatData - Combat data
     */
    setCombatState(combatData) {
        this.combat = { ...this.combat, ...combatData };
    },
    
    /**
     * Get game state summary
     * @returns {Object} Game state summary
     */
    getStateSummary() {
        return {
            state: this.state,
            running: this.running,
            gameTime: { ...this.gameTime },
            player: { ...this.player },
            playerBoat: this.playerBoat ? { ...this.playerBoat } : null,
            ports: this.ports.length,
            aiBoats: this.aiBoats.length,
            camera: { ...this.camera },
            debug: { ...this.debug },
            ui: { ...this.ui }
        };
    },
    
    /**
     * Save game state to localStorage
     */
    saveGame() {
        try {
            const saveData = {
                player: this.player,
                playerBoat: this.playerBoat,
                ports: this.ports,
                gameTime: this.gameTime,
                camera: this.camera,
                timestamp: Date.now()
            };
            
            localStorage.setItem('bota_save', JSON.stringify(saveData));
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    },
    
    /**
     * Load game state from localStorage
     * @returns {boolean} Whether load was successful
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem('bota_save');
            if (!saveData) {
                console.log('No save data found');
                return false;
            }
            
            const data = JSON.parse(saveData);
            
            // Validate save data
            if (!data.player || !data.playerBoat) {
                console.error('Invalid save data');
                return false;
            }
            
            // Load data
            this.player = data.player;
            this.playerBoat = data.playerBoat;
            this.ports = data.ports || [];
            this.gameTime = data.gameTime || this.gameTime;
            this.camera = data.camera || this.camera;
            
            console.log('Game loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    },
    
    /**
     * Clear save data
     */
    clearSave() {
        localStorage.removeItem('bota_save');
        console.log('Save data cleared');
    }
};
