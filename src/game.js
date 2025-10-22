// BOTA - Main Game Module
// Core game loop and state management

const Game = {
    // Game state
    state: 'main_menu', // loading, main_menu, playing, paused, dice_test
    running: false,
    lastFrameTime: 0,
    
    // Constants
    BOAT_ARRIVAL_DISTANCE: 5, // Distance at which boat "arrives" at target
    BOAT_SNAP_TO_DISTANCE: 15, // Distance at which X snaps to boat position
    TRAIL_DURATION: 5.0, // Seconds to keep trail history
    TRAIL_MIN_DISTANCE: 2, // Minimum distance between trail points
    
    // Camera state
    camera: {
        x: 0,
        y: 0,
        zoom: 1.0, // Will be set to fit-to-window on game start
        minZoom: 0.1, // Will be calculated to fit map in window
        maxZoom: 5.0, // 500% zoom
        panSpeed: 400, // pixels per second
        zoomSpeed: 0.001, // zoom change per wheel delta
        lastManualMoveTime: 0, // Time of last WASD input
        autoFollowDelay: 4.0, // Seconds before auto-follow kicks in
        autoFollowSpeed: 3.0 // Lerp speed for smooth camera follow
    },
    
    // Player boat
    playerBoat: null,
    
    // Target marker (green X)
    targetMarker: null,
    
    // Pathfinding variables
    waypointPath: null, // Array of waypoint IDs from A* (original path)
    waypointPathIndex: 0, // Current index in original waypoint path
    finalDestination: null, // Final destination after waypoint path
    lastPathSmoothTime: 0, // Time of last path smoothing check
    
    // Ports
    ports: [],
    currentPort: null, // Port player is currently docked at
    
    // Constants for port interaction
    PORT_PROXIMITY_DISTANCE: 30, // Distance for port interaction
    
    // Debug options
    debug: {
        showCoastlines: false,
        showIslandIds: false,
        showBounds: false,
        showDebugInfo: false,
        showClickPosition: false,
        portEditMode: false,
        showWaypoints: false,  // Show waypoint navigation graph (debug only)
        showActivePath: true   // Show active pathfinding route by default
    },
    
    // Port editing state
    draggedPort: null,
    draggedPortEntry: null, // Track if dragging entry position instead of port
    hoveredPort: null,
    
    // Click position history
    clickPositions: [],
    
    // Save data
    saveData: null,
    
    // Selected captain (from captain_data.js)
    selectedCaptain: null,
    
    // AIDEV-NOTE: Player stats
    player: {
        gold: 0,
        reputations: {} // faction name -> reputation value (0-100)
    },
    
    // AIDEV-NOTE: Game time system
    // Time advances based on player movement (not real-time simulation)
    // timeOfDay: 0.0 = midnight, 0.25 = 6am, 0.5 = noon, 0.75 = 6pm, 1.0 = midnight
    gameTime: {
        week: 1,
        day: 1,
        timeOfDay: 0.5, // Start at noon
        distancePerDay: 200, // Distance player must travel for one full day
        distanceTraveled: 0,
        lastWeek: 1,      // Track last tick's week for change detection
        lastDay: 1,       // Track last tick's day for change detection
        weekChanged: false,  // Flag for week rollover
        dayChanged: false    // Flag for day rollover
    },

    // Initialize game
    async init() {
        console.log('BOTA - Initializing...');

        // AIDEV-NOTE: Dice test mode - skip normal initialization
        if (this.state === 'dice_test') {
            console.log('DICE TEST MODE - Skipping normal game initialization');
            
            // Hide loading screen
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            
            Renderer.init('game-canvas');
            Input.init();
            DiceSystem.init();
            this.state = 'dice_test';
            this.running = true;
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }

        try {
            // Initialize loading screen
            LoadingScreen.init();
            
            // Count total assets to load
            // 1 collision data + images from renderer + sounds
            const totalAssets = 1 + this.countRendererAssets() + this.countSoundAssets();
            LoadingScreen.setTotalAssets(totalAssets);
            
            // Load collision data FIRST (required for boat spawning)
            await Collision.load();
            if (!Collision.loaded) {
                throw new Error('Collision data failed to load - required for game!');
            }
            LoadingScreen.assetLoaded();
            console.log('Collision system loaded successfully');
            
            // Initialize modules
            Renderer.init('game-canvas');
            Input.init();
            UI.init();
            Audio.init();

            // Load assets with progress tracking
            await this.loadAssetsWithProgress();
            
            // Initialize music manager with tracks and ambient sounds
            MusicManager.init(
                // Music tracks
                [
                    'steel_drums',
                    'acoustic_guitar',
                    'maracas',
                    'bamboo_flute',
                    'calypso_bass'
                ],
                // Continuous ambient sounds (loop forever)
                [
                    'gentle_waves',
                    'wind_breeze',
                    'hull_splash',
                    'rigging_creak',
                    'wood_groan',
                    'sail_flutter'
                ],
                // Occasional ambient sounds (trigger randomly)
                [
                    'seagulls',
                    'dolphins',
                    'distant_thunder',
                    'bell_buoy'
                ]
            );

            // Check for save game
            this.loadSaveData();

            // Hide loading screen
            LoadingScreen.hide();

            // Show main menu
            this.showMainMenu();

            // Start render loop
            this.running = true;
            this.lastFrameTime = performance.now();
            requestAnimationFrame((time) => this.gameLoop(time));

            console.log('BOTA - Ready!');
        } catch (error) {
            console.error('BOTA - Initialization failed:', error);
            alert('Failed to initialize game: ' + error.message);
        }
    },

    // Count assets to load from renderer
    countRendererAssets() {
        // Count all images that will be loaded
        // 4 UI images + 1 map + 10 ships + 9 captains + 33 goods + 25 ports + 14 port backgrounds
        return 4 + 1 + 10 + 9 + 33 + 25 + 14;
    },

    // Count sound assets to load
    countSoundAssets() {
        // 3 sound effects + 5 music tracks + 6 continuous ambient + 4 occasional ambient + 9 port ambient
        return 3 + 5 + 6 + 4 + 9;
    },

    // Load all assets with progress tracking
    async loadAssetsWithProgress() {
        // Load renderer images
        await this.loadRendererImages();
        
        // Load sounds
        await this.loadSoundAssets();
    },

    // Load all renderer images with progress tracking
    async loadRendererImages() {
        const assets = Renderer.assets;
        
        // Load logo
        assets.logo = await LoadingScreen.loadImage('assets/ui/bota_logo.png');
        
        // Load map
        assets.map = await LoadingScreen.loadImage('assets/map/world_map.png');
        
        // Load parchment background
        assets.parchmentBg = await LoadingScreen.loadImage('assets/ui/parchment_bg.png');
        
        // Load small boat sprite (legacy)
        assets.smallBoat = await LoadingScreen.loadImage('assets/ships/small_boat.png');
        
        // Load all starter ship sprites
        assets.ships = {};
        assets.ships.merchant_barge = await LoadingScreen.loadImage('assets/ships/merchant_barge.png');
        assets.ships.patrol_cutter = await LoadingScreen.loadImage('assets/ships/patrol_cutter.png');
        assets.ships.mystic_skiff = await LoadingScreen.loadImage('assets/ships/mystic_skiff.png');
        assets.ships.granite_trader = await LoadingScreen.loadImage('assets/ships/granite_trader.png');
        assets.ships.tide_runner = await LoadingScreen.loadImage('assets/ships/tide_runner.png');
        assets.ships.coral_skiff = await LoadingScreen.loadImage('assets/ships/coral_skiff.png');
        assets.ships.rogues_sloop = await LoadingScreen.loadImage('assets/ships/rogues_sloop.png');
        assets.ships.willowbark_trader = await LoadingScreen.loadImage('assets/ships/willowbark_trader.png');
        assets.ships.oglodi_longboat = await LoadingScreen.loadImage('assets/ships/oglodi_longboat.png');
        assets.ships.tinkers_barge = await LoadingScreen.loadImage('assets/ships/tinkers_barge.png');
        
        // Load green X marker
        assets.greenXMarker = await LoadingScreen.loadImage('assets/ui/green_x_marker.png');
        
        // Load sun/moon circle
        assets.sunMoonCircle = await LoadingScreen.loadImage('assets/ui/sun_moon_circle.png');
        
        // Load captain portraits
        assets.captains = {};
        assets.captains.captain_kunkka = await LoadingScreen.loadImage('assets/characters/captain_kunkka.png');
        assets.captains.captain_rubick = await LoadingScreen.loadImage('assets/characters/captain_rubick.png');
        assets.captains.captain_alchemist = await LoadingScreen.loadImage('assets/characters/captain_alchemist.png');
        assets.captains.captain_slardar = await LoadingScreen.loadImage('assets/characters/captain_slardar.png');
        assets.captains.captain_naga_siren = await LoadingScreen.loadImage('assets/characters/captain_naga_siren.png');
        assets.captains.captain_tidehunter = await LoadingScreen.loadImage('assets/characters/captain_tidehunter.png');
        assets.captains.captain_enchantress = await LoadingScreen.loadImage('assets/characters/captain_enchantress.png');
        assets.captains.captain_axe = await LoadingScreen.loadImage('assets/characters/captain_axe.png');
        assets.captains.captain_tinker = await LoadingScreen.loadImage('assets/characters/captain_tinker.png');
        
        // Load goods icons
        assets.goods = {};
        const goodsList = [
            'grain', 'corn', 'fish', 'wood', 'clay', 'salt', 'herbs',
            'cotton', 'sugar', 'meat', 'fruit', 'coal', 'iron_ore', 'mana_crystals',
            'beer', 'dye', 'pottery', 'flux', 'planks',
            'cloth', 'rum', 'wine', 'iron_ingots', 'coke',
            'weapons', 'armor', 'furniture', 'potions', 'fine_clothing',
            'magic_items', 'enchanted_armor', 'artifacts', 'elixirs'
        ];
        
        for (const good of goodsList) {
            assets.goods[good] = await LoadingScreen.loadImage(`assets/goods/${good}.png`);
        }
        
        // Port images by faction and tier
        assets.ports = {};
        
        // Claddish Navy
        assets.ports.claddish_navy_tier1 = await LoadingScreen.loadImage('assets/ports/claddish_navy_port_tier1.png');
        assets.ports.claddish_navy_tier2 = await LoadingScreen.loadImage('assets/ports/claddish_navy_port_tier2.png');
        assets.ports.claddish_navy_tier3 = await LoadingScreen.loadImage('assets/ports/claddish_navy_port_tier3.png');
        
        // Stonehall Merchants
        assets.ports.stonehall_merchants_tier1 = await LoadingScreen.loadImage('assets/ports/stonehall_merchants_port_tier1.png');
        assets.ports.stonehall_merchants_tier2 = await LoadingScreen.loadImage('assets/ports/stonehall_merchants_port_tier2.png');
        assets.ports.stonehall_merchants_tier3 = await LoadingScreen.loadImage('assets/ports/stonehall_merchants_port_tier3.png');
        
        // Keen Folk Engineers
        assets.ports.keen_folk_engineers_tier1 = await LoadingScreen.loadImage('assets/ports/keen_folk_engineers_port_tier1.png');
        assets.ports.keen_folk_engineers_tier2 = await LoadingScreen.loadImage('assets/ports/keen_folk_engineers_port_tier2.png');
        
        // Roseleaf Traders
        assets.ports.roseleaf_traders_tier1 = await LoadingScreen.loadImage('assets/ports/roseleaf_traders_port_tier1.png');
        assets.ports.roseleaf_traders_tier2 = await LoadingScreen.loadImage('assets/ports/roseleaf_traders_port_tier2.png');
        assets.ports.roseleaf_traders_tier3 = await LoadingScreen.loadImage('assets/ports/roseleaf_traders_port_tier3.png');
        
        // Artifact Traders
        assets.ports.artifact_traders_tier1 = await LoadingScreen.loadImage('assets/ports/artifact_traders_port_tier1.png');
        assets.ports.artifact_traders_tier2 = await LoadingScreen.loadImage('assets/ports/artifact_traders_port_tier2.png');
        assets.ports.artifact_traders_tier3 = await LoadingScreen.loadImage('assets/ports/artifact_traders_port_tier3.png');
        
        // Slithereen Guard
        assets.ports.slithereen_guard_tier1 = await LoadingScreen.loadImage('assets/ports/slithereen_guard_port_tier1.png');
        assets.ports.slithereen_guard_tier2 = await LoadingScreen.loadImage('assets/ports/slithereen_guard_port_tier2.png');
        assets.ports.slithereen_guard_tier3 = await LoadingScreen.loadImage('assets/ports/slithereen_guard_port_tier3.png');
        
        // Revtel
        assets.ports.revtel_tier1 = await LoadingScreen.loadImage('assets/ports/revtel_port_tier1.png');
        assets.ports.revtel_tier2 = await LoadingScreen.loadImage('assets/ports/revtel_port_tier2.png');
        assets.ports.revtel_tier3 = await LoadingScreen.loadImage('assets/ports/revtel_port_tier3.png');
        
        // Free Captains
        assets.ports.free_captains_tier1 = await LoadingScreen.loadImage('assets/ports/free_captains_port_tier1.png');
        assets.ports.free_captains_tier2 = await LoadingScreen.loadImage('assets/ports/free_captains_port_tier2.png');
        assets.ports.free_captains_tier3 = await LoadingScreen.loadImage('assets/ports/free_captains_port_tier3.png');
        
        // Oglodi Raiders
        assets.ports.oglodi_raiders_tier1 = await LoadingScreen.loadImage('assets/ports/oglodi_raiders_port_tier1.png');
        assets.ports.oglodi_raiders_tier2 = await LoadingScreen.loadImage('assets/ports/oglodi_raiders_port_tier2.png');
        assets.ports.oglodi_raiders_tier3 = await LoadingScreen.loadImage('assets/ports/oglodi_raiders_port_tier3.png');
        
        // Load faction settlement backgrounds (for port screens)
        Renderer.portBackgrounds = {};
        
        const factions = [
            'Artifact Traders',
            'Claddish Navy',
            'Free Captains',
            'Keen Folk Engineers',
            'Oglodi Raiders',
            'Revtel',
            'Roseleaf Traders',
            'Slithereen Guard',
            'Stonehall Merchants'
        ];
        
        for (const faction of factions) {
            const key = faction.toLowerCase().replace(/\s+/g, '_');
            Renderer.portBackgrounds[faction] = await LoadingScreen.loadImage(`assets/ports/backgrounds/${key}_settlement.png`);
        }
        
        // Load location backgrounds (for sub-screens)
        Renderer.locationBackgrounds = {};
        
        const locations = [
            'location_marketplace',
            'location_shipyard',
            'location_tavern',
            'location_town_square',
            'location_construction'
        ];
        
        for (const location of locations) {
            Renderer.locationBackgrounds[location] = await LoadingScreen.loadImage(`assets/ports/backgrounds/${location}.png`);
        }
    },

    // Load all sound assets with progress tracking
    async loadSoundAssets() {
        // Load sound effects
        Audio.sounds.boat_start = await LoadingScreen.loadAudio('assets/sounds/boat_start.mp3');
        Audio.sounds.anchor_raise = await LoadingScreen.loadAudio('assets/sounds/anchor_raise.mp3');
        Audio.sounds.money_click = await LoadingScreen.loadAudio('assets/sounds/money_click.mp3');
        
        // Load music tracks
        Audio.sounds.steel_drums = await LoadingScreen.loadAudio('assets/music/steel_drums.mp3');
        Audio.sounds.acoustic_guitar = await LoadingScreen.loadAudio('assets/music/acoustic_guitar.mp3');
        Audio.sounds.maracas = await LoadingScreen.loadAudio('assets/music/maracas.mp3');
        Audio.sounds.bamboo_flute = await LoadingScreen.loadAudio('assets/music/bamboo_flute.mp3');
        Audio.sounds.calypso_bass = await LoadingScreen.loadAudio('assets/music/calypso_bass.mp3');
        
        // Load continuous ambient sounds
        Audio.sounds.gentle_waves = await LoadingScreen.loadAudio('assets/sounds/ambient/gentle_waves.mp3');
        Audio.sounds.wind_breeze = await LoadingScreen.loadAudio('assets/sounds/ambient/wind_breeze.mp3');
        Audio.sounds.hull_splash = await LoadingScreen.loadAudio('assets/sounds/ambient/hull_splash.mp3');
        Audio.sounds.rigging_creak = await LoadingScreen.loadAudio('assets/sounds/ambient/rigging_creak.mp3');
        Audio.sounds.wood_groan = await LoadingScreen.loadAudio('assets/sounds/ambient/wood_groan.mp3');
        Audio.sounds.sail_flutter = await LoadingScreen.loadAudio('assets/sounds/ambient/sail_flutter.mp3');
        
        // Load occasional ambient sounds
        Audio.sounds.seagulls = await LoadingScreen.loadAudio('assets/sounds/ambient/seagulls.mp3');
        Audio.sounds.dolphins = await LoadingScreen.loadAudio('assets/sounds/ambient/dolphins.mp3');
        Audio.sounds.distant_thunder = await LoadingScreen.loadAudio('assets/sounds/ambient/distant_thunder.mp3');
        Audio.sounds.bell_buoy = await LoadingScreen.loadAudio('assets/sounds/ambient/bell_buoy.mp3');
        
        // Load port ambient sounds (by faction)
        Audio.sounds.artifact_traders = await LoadingScreen.loadAudio('assets/sounds/port_ambient/artifact_traders.mp3');
        Audio.sounds.claddish_navy = await LoadingScreen.loadAudio('assets/sounds/port_ambient/claddish_navy.mp3');
        Audio.sounds.free_captains = await LoadingScreen.loadAudio('assets/sounds/port_ambient/free_captains.mp3');
        Audio.sounds.keen_folk_engineers = await LoadingScreen.loadAudio('assets/sounds/port_ambient/keen_folk_engineers.mp3');
        Audio.sounds.oglodi_raiders = await LoadingScreen.loadAudio('assets/sounds/port_ambient/oglodi_raiders.mp3');
        Audio.sounds.revtel = await LoadingScreen.loadAudio('assets/sounds/port_ambient/revtel.mp3');
        Audio.sounds.roseleaf_traders = await LoadingScreen.loadAudio('assets/sounds/port_ambient/roseleaf_traders.mp3');
        Audio.sounds.slithereen_guard = await LoadingScreen.loadAudio('assets/sounds/port_ambient/slithereen_guard.mp3');
        Audio.sounds.stonehall_merchants = await LoadingScreen.loadAudio('assets/sounds/port_ambient/stonehall_merchants.mp3');
    },

    // Main game loop
    gameLoop(currentTime) {
        if (!this.running) return;

        // Calculate delta time
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        // Update
        this.update(deltaTime);

        // Render
        this.render();

        // Next frame
        requestAnimationFrame((time) => this.gameLoop(time));
    },

    update(deltaTime) {
        // Update based on current state
        switch (this.state) {
            case 'dice_test':
                // AIDEV-NOTE: Dice test mode
                DiceSystem.update(deltaTime);
                
                // Handle dice test input
                const mousePos = Input.getMousePosition();
                if (mousePos) {
                    // Mouse down - start dragging
                    if (Input.mouse.justClicked) {
                        DiceSystem.onMouseDown(mousePos, Renderer.canvas);
                    }
                    
                    // Mouse up - end dragging
                    if (!Input.mouse.clicked && DiceSystem.dragState && DiceSystem.dragState.active) {
                        DiceSystem.onMouseUp(mousePos, Renderer.canvas);
                    }
                    
                    // Mouse move - update drag or hover
                    DiceSystem.onMouseMove(mousePos, Renderer.canvas);
                }
                break;
            case 'main_menu':
                // Main menu handled by UI module
                break;
            case 'playing':
                this.updateCamera(deltaTime);
                
                // Update hovered port (for visual highlight)
                this.updateHoveredPort();
                
                // Handle port editing or normal gameplay
                if (this.debug.portEditMode) {
                    this.handlePortDragInput();
                } else {
                    this.handleClickInput();
                }
                
                // AIDEV-NOTE: Only update boat movement and time if no UI overlay is active
                // This pauses gameplay when viewing cargo, in ports, or other UI screens
                if (!UI.hasActiveOverlay()) {
                    // AIDEV-NOTE: Check if boat is on land every frame and push towards nearest waypoint
                    this.checkAndPushBoatToWater();
                    
                    this.updateBoatMovement(deltaTime);
                    this.updateBoatTrail();
                    // TODO: Update game world, simulation
                }
                break;
            case 'paused':
                // Paused, no updates
                break;
        }

        // Reset input for next frame
        Input.reset();
    },

    // Update camera based on input
    updateCamera(deltaTime) {
        const cam = this.camera;
        const moveAmount = cam.panSpeed * deltaTime;
        let manualMove = false;

        // WASD panning
        if (Input.isKeyPressed('w') || Input.isKeyPressed('W')) {
            cam.y -= moveAmount;
            manualMove = true;
        }
        if (Input.isKeyPressed('s') || Input.isKeyPressed('S')) {
            cam.y += moveAmount;
            manualMove = true;
        }
        if (Input.isKeyPressed('a') || Input.isKeyPressed('A')) {
            cam.x -= moveAmount;
            manualMove = true;
        }
        if (Input.isKeyPressed('d') || Input.isKeyPressed('D')) {
            cam.x += moveAmount;
            manualMove = true;
        }

        // Update last manual move time
        if (manualMove) {
            cam.lastManualMoveTime = performance.now() / 1000;
        }

        // Mouse wheel zooming
        if (Input.wheelDelta !== 0) {
            const zoomChange = -Input.wheelDelta * cam.zoomSpeed;
            cam.zoom = Math.max(cam.minZoom, Math.min(cam.maxZoom, cam.zoom + zoomChange));
        }

        // Auto-follow player boat if no manual input for 4 seconds
        // AIDEV-NOTE: Disable auto-follow when debug panel is open (not collapsed)
        const debugPanel = document.getElementById('debug-panel');
        const debugPanelOpen = debugPanel && !debugPanel.classList.contains('collapsed');
        
        if (this.playerBoat && !debugPanelOpen) {
            const currentTime = performance.now() / 1000;
            const timeSinceManualMove = currentTime - cam.lastManualMoveTime;
            
            if (timeSinceManualMove > cam.autoFollowDelay) {
                // Smoothly lerp camera to player boat position
                const lerpFactor = Math.min(1.0, cam.autoFollowSpeed * deltaTime);
                cam.x += (this.playerBoat.x - cam.x) * lerpFactor;
                cam.y += (this.playerBoat.y - cam.y) * lerpFactor;
            }
        }
    },

    render() {
        // Render based on current state
        switch (this.state) {
            case 'dice_test':
                // AIDEV-NOTE: Dice test mode
                DiceSystem.render(Renderer.ctx, Renderer.canvas);
                break;
            case 'main_menu':
                Renderer.renderMainMenu();
                break;
            case 'playing':
                // Check if Shift key is pressed for port info display
                const shiftPressed = Input.isKeyPressed('Shift');
                Renderer.renderGameWorld(this.camera.x, this.camera.y, this.camera.zoom, this.debug, this.playerBoat, this.targetMarker, this.ports, this.gameTime, this.hoveredPort, this.draggedPort, this.selectedCaptain, this.player, shiftPressed, this.waypointPath, this.waypointPathIndex, this.finalDestination);
                break;
            case 'paused':
                // TODO: Render game world + pause overlay
                const shiftPressedPaused = Input.isKeyPressed('Shift');
                Renderer.renderGameWorld(this.camera.x, this.camera.y, this.camera.zoom, this.debug, this.playerBoat, this.targetMarker, this.ports, this.gameTime, this.hoveredPort, this.draggedPort, this.selectedCaptain, this.player, shiftPressedPaused, this.waypointPath, this.waypointPathIndex, this.finalDestination);
                break;
        }
    },

    // Show main menu
    showMainMenu() {
        this.state = 'main_menu';
        const hasSave = this.saveData !== null;
        UI.showMainMenu(hasSave);
    },

    // Menu button handlers
    onContinueGame() {
        console.log('Continue game clicked');
        if (this.saveData) {
            // TODO: Load save and start game
            UI.showMessage(
                'Coming Soon',
                'Continue game feature will be implemented soon!',
                () => this.showMainMenu()
            );
        }
    },

    onNewGame() {
        console.log('New game clicked');
        
        // Check if save exists and confirm overwrite
        if (this.saveData) {
            if (!confirm('Starting a new game will overwrite your current save. Continue?')) {
                return;
            }
        }

        // Show faction selection screen
        UI.showFactionSelect();
    },

    // AIDEV-NOTE: Start game with selected faction
    startGameWithFaction(factionName) {
        console.log('Starting game with faction:', factionName);
        this.selectedFaction = factionName;
        
        // Get captain for this faction
        this.selectedCaptain = getCaptainByFaction(factionName);
        if (!this.selectedCaptain) {
            console.error('Captain not found for faction:', factionName);
        } else {
            console.log('Selected captain:', this.selectedCaptain.name, 'starting at:', this.selectedCaptain.startingPort);
        }
        
        this.startGame();
    },

    // Start the actual game
    startGame() {
        console.log('Starting game...');
        
        // Clear UI overlay
        UI.clear();
        
        // Initialize player stats
        this.initializePlayer();
        
        // Initialize player boat
        this.initializePlayerBoat();
        
        // Initialize ports
        this.initializePorts();
        
        // Calculate camera zoom to fit map in window
        this.initializeCamera();
        
        // Set state to playing
        this.state = 'playing';
        
        // Start background music and ambient sounds
        MusicManager.start();
        MusicManager.startAmbient();
        
        // Show debug panel, View Cargo button, and View Reputations button
        UI.showDebugPanel(this.debug);
        UI.showViewCargoButton();
        UI.showViewReputationsButton();
        
        console.log('Game started! Map and player boat visible.');
    },
    
    // AIDEV-NOTE: Initialize player stats (gold, reputations)
    initializePlayer() {
        // Starting gold
        this.player.gold = 500;
        
        // Initialize reputations with all factions at neutral (50)
        const factions = [
            'Artifact Traders',
            'Claddish Navy',
            'Free Captains',
            'Keen Folk Engineers',
            'Oglodi Raiders',
            'Revtel',
            'Roseleaf Traders',
            'Slithereen Guard',
            'Stonehall Merchants'
        ];
        
        this.player.reputations = {};
        factions.forEach(faction => {
            // Start at neutral (50) for all factions except player's starting faction
            if (faction === this.selectedFaction) {
                this.player.reputations[faction] = 75; // Friendly with starting faction
            } else {
                this.player.reputations[faction] = 50; // Neutral with others
            }
        });
        
        console.log('Player initialized with', this.player.gold, 'gold');
    },

    // AIDEV-NOTE: Handle click input for boat control
    // Uses pathfinding to navigate around islands using waypoint graph
    handleClickInput() {
        if (!Input.mouse.justClicked) return;
        if (!this.playerBoat) return;
        
        // Don't process clicks if UI overlay is active
        if (UI.hasActiveOverlay()) return;
        
        // Only handle left-clicks (button 0), ignore right-clicks
        if (Input.mouse.button !== 0) return;

        // Convert screen coordinates to world coordinates
        const worldPos = this.screenToWorld(Input.mouse.clickX, Input.mouse.clickY);
        
        // AIDEV-NOTE: Capture click position for debug window
        // When active, prevent gameplay clicks and only record positions
        if (this.debug.showClickPosition) {
            const posStr = `World: (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}) | Screen: (${Input.mouse.clickX}, ${Input.mouse.clickY})`;
            this.clickPositions.push(posStr);
            // Keep only last 20 positions
            if (this.clickPositions.length > 20) {
                this.clickPositions.shift();
            }
            UI.updateClickPositions();
            return; // Don't process gameplay clicks when debug mode is active
        }
        
        // Check if player clicked on a port
        const clickedPort = this.getPortAtPosition(worldPos.x, worldPos.y, 30);
        if (clickedPort) {
            // Use entry position if available, otherwise port position
            const targetX = clickedPort.entryX !== undefined ? clickedPort.entryX : clickedPort.x;
            const targetY = clickedPort.entryY !== undefined ? clickedPort.entryY : clickedPort.y;
            
            // Navigate to entry position (or nearest water near it)
            const waterPos = Collision.findNearestWater(targetX, targetY, 80);
            
            if (waterPos.found) {
                worldPos.x = waterPos.x;
                worldPos.y = waterPos.y;
                if (waterPos.distance > 0) {
                    console.log(`Navigating to port ${clickedPort.name} via water ${Math.round(waterPos.distance)}px away`);
                } else {
                    console.log('Navigating to port:', clickedPort.name);
                }
            } else {
                console.warn('Could not find water near port:', clickedPort.name);
                return;
            }
            
            // Continue with normal navigation logic below
        }
        
        // Check if click target is on land (don't navigate there)
        if (Collision.isOnLand(worldPos.x, worldPos.y) !== null) {
            console.log('Cannot navigate to land position:', worldPos.x, worldPos.y);
            return;
        }
        
        // Check distance from boat to target position
        const dx = worldPos.x - this.playerBoat.x;
        const dy = worldPos.y - this.playerBoat.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If X would appear close to boat, snap it to boat's exact position
        if (distance <= this.BOAT_SNAP_TO_DISTANCE) {
            this.targetMarker = { x: this.playerBoat.x, y: this.playerBoat.y };
            console.log('Target too close, marker snapped to boat position');
            return;
        }
        
        // Check if there's direct line of sight (no islands blocking)
        const hasLineOfSight = Pathfinding.hasLineOfSight(
            this.playerBoat.x, this.playerBoat.y,
            worldPos.x, worldPos.y,
            Collision
        );
        
        if (hasLineOfSight) {
            // Direct path available - no pathfinding needed
            console.log('Direct path to target:', worldPos.x, worldPos.y);
            this.targetMarker = { x: worldPos.x, y: worldPos.y };
            this.waypointPath = null; // Clear any existing waypoint path
            
            // Rotate boat to face target
            const angle = Math.atan2(dy, dx);
            this.playerBoat.rotation = angle + Math.PI / 2;
            
            Audio.play('boat_start');
        } else {
            // Island blocking - use pathfinding
            console.log('Island blocking, using pathfinding...');
            const path = Pathfinding.findPath(
                this.playerBoat.x, this.playerBoat.y,
                worldPos.x, worldPos.y,
                Collision
            );
            
            if (!path) {
                console.warn('No path found to target position');
                return;
            }
            
            console.log('Path found with', path.length, 'waypoints');
            
            // Store waypoint path and final destination
            this.waypointPath = path;
            this.waypointPathIndex = 0;
            this.finalDestination = { x: worldPos.x, y: worldPos.y };
            this.lastPathSmoothTime = performance.now() / 1000; // Initialize smooth timer
            
            // AIDEV-NOTE: Immediately do lookahead to find furthest visible point
            // Don't just go to first waypoint - check if we can skip ahead
            const furthest = this.findFurthestVisibleInPath();
            
            if (furthest) {
                if (furthest.type === 'final') {
                    // Can see destination directly (shouldn't happen since we just ran pathfinding, but handle it)
                    console.log('Initial lookahead: Can see destination directly');
                    this.waypointPath = null;
                    this.targetMarker = this.finalDestination;
                } else if (furthest.type === 'interpolated') {
                    // Can see a point between waypoints
                    const skipped = furthest.index - this.waypointPathIndex;
                    console.log(`Initial lookahead: Cutting corner to ${Math.round(furthest.t * 100)}% (skipping ${skipped} waypoint(s))`);
                    this.waypointPathIndex = furthest.index;
                    this.targetMarker = { x: furthest.position.x, y: furthest.position.y };
                } else {
                    // Going to a waypoint
                    if (furthest.index > 0) {
                        console.log(`Initial lookahead: Skipping ${furthest.index} waypoint(s), heading to waypoint #${furthest.index + 1}`);
                    }
                    this.waypointPathIndex = furthest.index;
                    this.targetMarker = { x: furthest.position.x, y: furthest.position.y };
                }
            } else {
                // Fallback to first waypoint if lookahead fails
                const firstWP = Collision.getWaypoint(path[0]);
                if (!firstWP) {
                    console.error('Failed to get first waypoint');
                    return;
                }
                this.targetMarker = { x: firstWP.x, y: firstWP.y };
            }
            
            // Rotate boat to face target
            const targetDx = this.targetMarker.x - this.playerBoat.x;
            const targetDy = this.targetMarker.y - this.playerBoat.y;
            const angle = Math.atan2(targetDy, targetDx);
            this.playerBoat.rotation = angle + Math.PI / 2;
            
            Audio.play('boat_start');
        }
    },

    // AIDEV-NOTE: Handle port drag input for port editor mode
    // Allows dragging ports around the map to reposition them
    // Shift+click to flip port horizontally
    handlePortDragInput() {
        // Update hovered port based on mouse position
        const worldPos = this.screenToWorld(Input.mouse.x, Input.mouse.y);
        this.hoveredPort = this.getPortAtPosition(worldPos.x, worldPos.y, 30);
        
        // Ctrl+C to copy port data
        if (Input.isKeyPressed('Control') && Input.consumeKeyPress('c')) {
            if (this.hoveredPort) {
                this.copyPortData(this.hoveredPort);
            }
        }
        
        // Start dragging a port/entry or flip it with shift+click
        if (Input.mouse.justClicked && Input.mouse.button === 0) {
            if (this.hoveredPort) {
                // Check for modifier keys
                const shiftPressed = Input.isKeyPressed('Shift') || Input.isKeyPressed('shift');
                const altPressed = Input.isKeyPressed('Alt') || Input.isKeyPressed('alt');
                
                if (shiftPressed) {
                    // Shift+click to flip port
                    this.hoveredPort.flipped = !this.hoveredPort.flipped;
                    console.log('Flipped port:', this.hoveredPort.name, '- flipped:', this.hoveredPort.flipped);
                } else if (altPressed) {
                    // Alt+click to drag entry position
                    this.draggedPort = this.hoveredPort;
                    this.draggedPortEntry = true;
                    console.log('Started dragging entry position for port:', this.draggedPort.name);
                } else {
                    // Normal click to start dragging port
                    this.draggedPort = this.hoveredPort;
                    this.draggedPortEntry = false;
                    console.log('Started dragging port:', this.draggedPort.name);
                }
            }
        }
        
        // Update dragged position (port or entry) (drag immediately while mouse is down)
        if (this.draggedPort && Input.mouse.clicked) {
            const newWorldPos = this.screenToWorld(Input.mouse.x, Input.mouse.y);
            
            if (this.draggedPortEntry) {
                // Dragging entry position
                this.draggedPort.entryX = Math.round(newWorldPos.x);
                this.draggedPort.entryY = Math.round(newWorldPos.y);
            } else {
                // Dragging port position
                this.draggedPort.x = Math.round(newWorldPos.x);
                this.draggedPort.y = Math.round(newWorldPos.y);
            }
        }
        
        // Stop dragging
        if (!Input.mouse.clicked && this.draggedPort) {
            if (this.draggedPortEntry) {
                console.log('Stopped dragging entry position for port:', this.draggedPort.name, 'at', this.draggedPort.entryX, this.draggedPort.entryY);
            } else {
                console.log('Stopped dragging port:', this.draggedPort.name, 'at', this.draggedPort.x, this.draggedPort.y);
            }
            this.draggedPort = null;
            this.draggedPortEntry = null;
        }
    },
    
    // AIDEV-NOTE: Copy port data to console for easy export
    copyPortData(port) {
        // Build port data string with all properties
        let portLine = `    { id: "${port.id}", name: "${port.name}", faction: "${port.faction}", x: ${port.x}, y: ${port.y}, tier: ${port.tier}, size: ${port.size}`;
        
        // Add flipped if present
        if (port.flipped) {
            portLine += ', flipped: true';
        }
        
        // Add entry positions (default to port position if not set)
        const entryX = port.entryX !== undefined ? port.entryX : port.x;
        const entryY = port.entryY !== undefined ? port.entryY : port.y;
        portLine += `, entryX: ${entryX}, entryY: ${entryY}`;
        
        portLine += ' },';
        
        console.log('=== Port Data Copied ===');
        console.log(portLine);
        console.log('========================');
    },

    // AIDEV-NOTE: Check if boat is on land and push towards nearest waypoint
    // Only runs when NOT actively pathfinding
    // If we're following a path, we trust the pathfinding to keep us in water
    checkAndPushBoatToWater() {
        if (!this.playerBoat || !Collision || !Collision.loaded) return;
        
        // Skip if we're actively following a path - trust the pathfinding
        if (this.waypointPath && this.waypointPathIndex < this.waypointPath.length) {
            return;
        }
        
        // Check if boat is on land
        const isOnLand = Collision.isOnLand(this.playerBoat.x, this.playerBoat.y) !== null;
        
        if (isOnLand) {
            // Find nearest waypoint
            const waypoints = Collision.getAllWaypoints();
            if (!waypoints || waypoints.length === 0) {
                console.error('Boat on land but no waypoints available');
                return;
            }
            
            let targetWP = null;
            let nearestDist = Infinity;
            for (const wp of waypoints) {
                const dist = Math.hypot(wp.x - this.playerBoat.x, wp.y - this.playerBoat.y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    targetWP = wp;
                }
            }
            
            if (targetWP) {
                // Push boat towards nearest waypoint
                const dx = targetWP.x - this.playerBoat.x;
                const dy = targetWP.y - this.playerBoat.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0) {
                    // Move 5 pixels towards waypoint
                    const pushDistance = 5;
                    this.playerBoat.x += (dx / dist) * pushDistance;
                    this.playerBoat.y += (dy / dist) * pushDistance;
                    
                    console.log(`Boat on land (no active path), pushing towards nearest waypoint #${targetWP.id}`);
                }
            }
        }
    },

    // AIDEV-NOTE: Find furthest visible point in the path
    // Checks visibility to waypoints AND interpolated points between waypoints
    // This allows cutting corners more aggressively by aiming for mid-segment points
    findFurthestVisibleInPath() {
        if (!this.waypointPath || this.waypointPathIndex >= this.waypointPath.length) {
            return null;
        }
        
        // AIDEV-NOTE: Build ordered list of all checkpoints from nearest to furthest
        // Then check each one in order, keeping track of the furthest visible
        const checkpoints = [];
        
        // Add all remaining waypoints and interpolated points between them
        for (let i = this.waypointPathIndex; i < this.waypointPath.length; i++) {
            const wp = Collision.getWaypoint(this.waypointPath[i]);
            if (!wp) continue;
            
            // If not the first waypoint, add interpolated points between previous and current
            if (i > this.waypointPathIndex) {
                const prevWP = Collision.getWaypoint(this.waypointPath[i - 1]);
                if (prevWP) {
                    // Add 10 interpolated points along segment (from previous toward current)
                    for (let step = 1; step <= 10; step++) {
                        const t = step / 10; // 0.1, 0.2, ..., 1.0
                        const interpX = prevWP.x + (wp.x - prevWP.x) * t;
                        const interpY = prevWP.y + (wp.y - prevWP.y) * t;
                        
                        if (t === 1.0) {
                            // This is the waypoint itself
                            checkpoints.push({
                                type: 'waypoint',
                                index: i,
                                x: wp.x,
                                y: wp.y
                            });
                        } else {
                            checkpoints.push({
                                type: 'interpolated',
                                index: i - 1,
                                x: interpX,
                                y: interpY,
                                t: t
                            });
                        }
                    }
                }
            } else {
                // First waypoint in remaining path
                checkpoints.push({
                    type: 'waypoint',
                    index: i,
                    x: wp.x,
                    y: wp.y
                });
            }
        }
        
        // Add final destination as last checkpoint
        if (this.finalDestination) {
            checkpoints.push({
                type: 'final',
                x: this.finalDestination.x,
                y: this.finalDestination.y
            });
        }
        
        // Check each checkpoint from nearest to furthest, keep track of furthest visible
        let furthestVisible = null;
        const enableDebug = this.debug.showActivePath;
        
        for (const checkpoint of checkpoints) {
            const canSee = Pathfinding.hasWideCorridor(
                this.playerBoat.x, this.playerBoat.y,
                checkpoint.x, checkpoint.y,
                Collision,
                2,  // 2px clearance on each side
                enableDebug
            );
            
            if (canSee) {
                // Can see this checkpoint - update furthest visible
                furthestVisible = {
                    type: checkpoint.type,
                    index: checkpoint.index,
                    position: { x: checkpoint.x, y: checkpoint.y },
                    t: checkpoint.t
                };
            } else {
                // Can't see this checkpoint - return the last one we could see
                return furthestVisible;
            }
        }
        
        // If we get here, we could see all checkpoints, return the furthest (last) one
        return furthestVisible;
    },

    // AIDEV-NOTE: Update boat movement towards target marker
    // Follows waypoint chains when pathfinding, or moves directly to target
    // Uses path smoothing to skip unnecessary waypoints
    // Also advances game time based on distance traveled
    updateBoatMovement(deltaTime) {
        if (!this.playerBoat || !this.targetMarker) return;

        // AIDEV-NOTE: Path smoothing - check every 1 second for furthest visible waypoint
        // Simple approach: look ahead in path and skip to furthest visible point
        if (this.waypointPath && this.waypointPathIndex < this.waypointPath.length) {
            const currentTime = performance.now() / 1000; // Convert to seconds
            const timeSinceLastCheck = currentTime - this.lastPathSmoothTime;
            
            if (timeSinceLastCheck >= 1.0) {
                this.lastPathSmoothTime = currentTime;
                
                // Find furthest visible point
                const furthest = this.findFurthestVisibleInPath();
                
                if (furthest) {
                    if (furthest.type === 'final') {
                        // Can see final destination - skip all waypoints
                        const skipped = this.waypointPath.length - this.waypointPathIndex;
                        console.log(`Path smoothing: Can see destination, skipping ${skipped} waypoint(s)`);
                        this.waypointPath = null;
                        this.targetMarker = this.finalDestination;
                        
                        // Rotate boat
                        const dx = this.finalDestination.x - this.playerBoat.x;
                        const dy = this.finalDestination.y - this.playerBoat.y;
                        this.playerBoat.rotation = Math.atan2(dy, dx) + Math.PI / 2;
                    } else if (furthest.type === 'interpolated') {
                        // Can see a point between waypoints - aim for that
                        const skipped = furthest.index - this.waypointPathIndex;
                        console.log(`Path smoothing: Cutting corner to ${Math.round(furthest.t * 100)}% between waypoints (skipping ${skipped})`);
                        this.waypointPathIndex = furthest.index;
                        this.targetMarker = { x: furthest.position.x, y: furthest.position.y };
                        
                        // Rotate boat
                        const dx = furthest.position.x - this.playerBoat.x;
                        const dy = furthest.position.y - this.playerBoat.y;
                        this.playerBoat.rotation = Math.atan2(dy, dx) + Math.PI / 2;
                    } else if (furthest.index > this.waypointPathIndex) {
                        // Can skip ahead to a further waypoint
                        const skipped = furthest.index - this.waypointPathIndex;
                        console.log(`Path smoothing: Skipping ${skipped} waypoint(s) to waypoint #${furthest.index + 1}`);
                        this.waypointPathIndex = furthest.index;
                        this.targetMarker = { x: furthest.position.x, y: furthest.position.y };
                        
                        // Rotate boat
                        const dx = furthest.position.x - this.playerBoat.x;
                        const dy = furthest.position.y - this.playerBoat.y;
                        this.playerBoat.rotation = Math.atan2(dy, dx) + Math.PI / 2;
                    }
                }
            }
        }

        // Calculate distance to current target
        const dx = this.targetMarker.x - this.playerBoat.x;
        const dy = this.targetMarker.y - this.playerBoat.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if arrived at current target
        if (distance <= this.BOAT_ARRIVAL_DISTANCE) {
            // If following waypoint path, advance to next waypoint
            if (this.waypointPath && this.waypointPathIndex < this.waypointPath.length) {
                // Advance to next waypoint in path
                this.waypointPathIndex++;
                
                // Check if finished all waypoints
                if (this.waypointPathIndex >= this.waypointPath.length) {
                    console.log('Path complete, heading to final destination');
                    this.targetMarker = this.finalDestination;
                    this.waypointPath = null;
                    return;
                }
                
                // Get next waypoint (smoothing will handle skipping on next frame)
                const nextWP = Collision.getWaypoint(this.waypointPath[this.waypointPathIndex]);
                if (nextWP) {
                    this.targetMarker = { x: nextWP.x, y: nextWP.y };
                }
                return;
            } else {
                // No waypoint path - arrived at final destination
                this.targetMarker = null;
                this.waypointPath = null;
                this.finalDestination = null;
                console.log('Boat arrived at destination');
                
                // Check if arrived at a port
                this.checkPortProximity();
                return;
            }
        }

        // Move boat towards current target
        const moveSpeed = this.playerBoat.speed * deltaTime;
        const moveAmount = Math.min(moveSpeed, distance); // Don't overshoot
        
        // Normalize direction and move
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        this.playerBoat.x += dirX * moveAmount;
        this.playerBoat.y += dirY * moveAmount;
        
        // AIDEV-NOTE: Update boat rotation every frame while moving to face travel direction
        // This ensures boat always points where it's going
        const angle = Math.atan2(dy, dx);
        this.playerBoat.rotation = angle + Math.PI / 2;
        
        // Advance game time based on distance traveled
        this.advanceTime(moveAmount);
    },

    // AIDEV-NOTE: Advance game time based on distance traveled
    // Time only advances when player is moving
    advanceTime(distanceMoved) {
        const time = this.gameTime;
        
        // Add distance to total
        time.distanceTraveled += distanceMoved;
        
        // Calculate time advancement (distance / distancePerDay = fraction of day)
        const timeAdvancement = distanceMoved / time.distancePerDay;
        time.timeOfDay += timeAdvancement;
        
        // Check if day rolled over
        while (time.timeOfDay >= 1.0) {
            time.timeOfDay -= 1.0;
            time.day += 1;
            
            // Check if week rolled over (7 days per week)
            if (time.day > 7) {
                time.day = 1;
                time.week += 1;
                console.log(`Week ${time.week} begins!`);
            }
        }
        
        // Detect time changes and trigger economy simulation
        time.weekChanged = (time.week !== time.lastWeek);
        time.dayChanged = (time.day !== time.lastDay);
        
        // Call economy simulation if time changed
        if (time.weekChanged || time.dayChanged) {
            Economy.simulationTick(this.ports, time);
            
            // Update last values for next tick
            time.lastWeek = time.week;
            time.lastDay = time.day;
        }
    },

    // AIDEV-NOTE: Update which port is currently hovered by mouse
    // Used for visual highlighting in renderer
    updateHoveredPort() {
        if (!this.playerBoat) return;
        
        // Don't update hover in port edit mode (uses its own hover logic)
        if (this.debug.portEditMode) return;
        
        // Convert mouse position to world coordinates
        const worldPos = this.screenToWorld(Input.mouse.x, Input.mouse.y);
        
        // Check if mouse is over any port
        this.hoveredPort = this.getPortAtPosition(worldPos.x, worldPos.y, 30);
    },

    // AIDEV-NOTE: Check if player boat is near any port entry position
    // Called when boat stops moving
    checkPortProximity() {
        if (!this.playerBoat) return;
        
        // Check distance to entry position of each port
        for (const port of this.ports) {
            // Use entry position if available, otherwise port position
            const entryX = port.entryX !== undefined ? port.entryX : port.x;
            const entryY = port.entryY !== undefined ? port.entryY : port.y;
            
            // Calculate distance to entry position
            const dx = this.playerBoat.x - entryX;
            const dy = this.playerBoat.y - entryY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If within proximity distance, enter the port
            if (distance <= this.PORT_PROXIMITY_DISTANCE) {
                this.enterPort(port);
                return;
            }
        }
    },

    // AIDEV-NOTE: Enter a port
    // Cancel movement and show port screen
    enterPort(port) {
        console.log('Entering port:', port.name);
        
        // Play port ambient sound based on faction
        const factionKey = port.faction.toLowerCase().replace(/\s+/g, '_');
        Audio.playPortAmbient(factionKey);
        
        // Cancel any movement
        this.targetMarker = null;
        
        // Store current port
        this.currentPort = port;
        
        // Hide UI buttons while in port
        UI.hideViewCargoButton();
        UI.hideViewReputationsButton();
        
        // Show port screen
        UI.showPortScreen(port);
    },

    // AIDEV-NOTE: Leave current port
    // Return to map view, push boat away from island center by exactly 10 units
    leavePort() {
        console.log('Leaving port:', this.currentPort?.name);
        
        // Play anchor raising sound
        Audio.play('anchor_raise');
        
        // Place boat at port entry position
        if (this.playerBoat && this.currentPort) {
            // Use entry position if available
            if (this.currentPort.entryX !== undefined && this.currentPort.entryY !== undefined) {
                this.playerBoat.x = this.currentPort.entryX;
                this.playerBoat.y = this.currentPort.entryY;
                console.log(`Placed boat at entry position (${this.currentPort.entryX}, ${this.currentPort.entryY})`);
            } else {
                // Fallback: push boat out from the closest island center by exactly 10 units
                const closestResult = Collision.getClosestIsland(this.playerBoat.x, this.playerBoat.y);
                
                if (closestResult && closestResult.island) {
                    const center = Collision.getIslandCenter(closestResult.island);
                    
                    // Calculate direction from island center to boat
                    let dx = this.playerBoat.x - center.x;
                    let dy = this.playerBoat.y - center.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    // Normalize and push out exactly 10 units
                    if (dist > 0) {
                        dx /= dist;
                        dy /= dist;
                        this.playerBoat.x += dx * 10;
                        this.playerBoat.y += dy * 10;
                        console.log(`Pushed boat 10 units away from island ${closestResult.island.id} center`);
                    }
                }
            }
        }
        
        this.currentPort = null;
        
        // Re-show debug panel and UI buttons if in playing state
        if (this.state === 'playing') {
            UI.showDebugPanel(this.debug);
            UI.showViewCargoButton();
            UI.showViewReputationsButton();
        }
    },

    // AIDEV-NOTE: Convert screen coordinates to world coordinates
    // Takes camera position and zoom into account
    screenToWorld(screenX, screenY) {
        const cam = this.camera;
        
        // Get screen center
        const centerX = Renderer.width / 2;
        const centerY = Renderer.height / 2;
        
        // Calculate offset from center in screen space
        const offsetX = screenX - centerX;
        const offsetY = screenY - centerY;
        
        // Convert to world space (account for zoom)
        const worldX = cam.x + offsetX / cam.zoom;
        const worldY = cam.y + offsetY / cam.zoom;
        
        return { x: worldX, y: worldY };
    },

    // AIDEV-NOTE: Cast ray from start to end, check for island collision
    // Returns collision point or null if no collision
    raycastToIsland(startX, startY, endX, endY) {
        if (!Collision.loaded) return null;
        
        // Calculate ray direction and length
        const dx = endX - startX;
        const dy = endY - startY;
        const rayLength = Math.sqrt(dx * dx + dy * dy);
        const dirX = dx / rayLength;
        const dirY = dy / rayLength;
        
        // Step along ray and check for collisions
        const stepSize = 10; // Check every 10 pixels
        const steps = Math.ceil(rayLength / stepSize);
        
        for (let i = 1; i <= steps; i++) {
            const t = (i * stepSize) / rayLength;
            if (t > 1.0) break;
            
            const checkX = startX + dx * t;
            const checkY = startY + dy * t;
            
            // Check if this point is on land (collision data is already in world space)
            if (Collision.isOnLand(checkX, checkY) !== null) {
                return { x: checkX, y: checkY };
            }
        }
        
        return null; // No collision
    },

    // AIDEV-NOTE: Update boat trail history
    // Adds current position to trail, removes old positions
    updateBoatTrail() {
        if (!this.playerBoat) return;
        
        const currentTime = performance.now() / 1000;
        const trail = this.playerBoat.trail;
        
        // Add current position if boat has moved enough
        if (trail.length === 0) {
            trail.push({ x: this.playerBoat.x, y: this.playerBoat.y, time: currentTime });
        } else {
            const lastPoint = trail[trail.length - 1];
            const dx = this.playerBoat.x - lastPoint.x;
            const dy = this.playerBoat.y - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance >= this.TRAIL_MIN_DISTANCE) {
                trail.push({ x: this.playerBoat.x, y: this.playerBoat.y, time: currentTime });
            }
        }
        
        // Remove points older than TRAIL_DURATION
        const cutoffTime = currentTime - this.TRAIL_DURATION;
        while (trail.length > 0 && trail[0].time < cutoffTime) {
            trail.shift();
        }
    },

    // AIDEV-NOTE: Initialize player boat at starting position
    // Boat starts slightly below map center
    initializePlayerBoat() {
        // Get ship data based on selected faction
        let shipData;
        if (this.selectedFaction) {
            shipData = ShipData.find(ship => ship.faction === this.selectedFaction);
            if (!shipData) {
                console.error('Ship not found for faction:', this.selectedFaction);
                shipData = ShipData.find(ship => ship.faction === null); // Fallback to neutral
            }
        } else {
            // Fallback to neutral ship if no faction selected
            shipData = ShipData.find(ship => ship.faction === null);
        }

        if (!shipData) {
            throw new Error('No ship data available!');
        }

        // Determine starting position from captain's starting port
        if (!this.selectedCaptain || !this.selectedCaptain.startingPort) {
            throw new Error('No captain selected or no starting port defined!');
        }

        const startPort = PortData.find(p => p.id === this.selectedCaptain.startingPort);
        if (!startPort) {
            throw new Error('Starting port not found: ' + this.selectedCaptain.startingPort);
        }

        // Start at entry position (or port position if no entry defined)
        const startX = startPort.entryX !== undefined ? startPort.entryX : startPort.x;
        const startY = startPort.entryY !== undefined ? startPort.entryY : startPort.y;
        const startRotation = 0; // Facing up/north by default (0 = north, sprites have bow pointing up)
        
        console.log('Starting at port:', startPort.name, 'at entry position:', startX, startY);

        // Create player boat from ship data
        // AIDEV-NOTE: Ship speed in data is pixels/sec, divide by 10 for game speed
        this.playerBoat = {
            x: startX,
            y: startY,
            rotation: startRotation,  // Facing up/north initially (radians, 0 = north, sprites have bow pointing up)
            speed: shipData.speed / 10,      // Pixels per second (divide by 10 for reasonable game speed)
            cargoCapacity: shipData.cargoCapacity,
            crewCapacity: shipData.cabins,
            durability: shipData.durability,
            maxDurability: shipData.durability,
            extraDice: shipData.extraDice,
            shipId: shipData.id,
            shipName: shipData.name,
            cargo: {}, // Empty cargo at start
            crew: [],
            trail: []       // Array of {x, y, time} for wake trail
        };
        console.log('Player boat initialized:', shipData.name, 'at:', this.playerBoat.x, this.playerBoat.y);
    },

    // AIDEV-NOTE: Initialize ports
    // Loads port data from port_data.js and initializes economy
    initializePorts() {
        // Ensure all ports have a flipped property (defaults to false)
        this.ports = PortData.map(port => ({
            ...port,
            flipped: port.flipped || false
        }));
        
        // Initialize economy system (buildings, stock, consumption, prices)
        Economy.initializeEconomy(this.ports);
        
        console.log(`Initialized ${this.ports.length} port(s) with economy`);
    },

    // AIDEV-NOTE: Get port at world position (searches Game.ports, not PortData)
    getPortAtPosition(worldX, worldY, maxDistance = 50) {
        for (const port of this.ports) {
            const dx = worldX - port.x;
            const dy = worldY - port.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= maxDistance) {
                return port;
            }
        }
        return null;
    },

    // Calculate initial camera settings based on window/map size
    initializeCamera() {
        if (!Renderer.assets.map || !Renderer.assets.map.complete) {
            console.warn('Map not loaded, using default camera settings');
            return;
        }

        const mapWidth = Renderer.assets.map.width;
        const mapHeight = Renderer.assets.map.height;
        const screenWidth = Renderer.width;
        const screenHeight = Renderer.height;

        // Calculate zoom to fit map in window (90% to add padding)
        const scaleX = screenWidth / mapWidth;
        const scaleY = screenHeight / mapHeight;
        const fitZoom = Math.min(scaleX, scaleY) * 0.9;

        // Set min zoom to fit entire map
        this.camera.minZoom = fitZoom;
        
        // Start at 400% zoom
        this.camera.zoom = 4.0;
        
        // Center camera on player boat (if exists)
        if (this.playerBoat) {
            this.camera.x = this.playerBoat.x;
            this.camera.y = this.playerBoat.y;
        } else {
            this.camera.x = 0;
            this.camera.y = 0;
        }

        // Initialize last manual move time to far in the past so camera starts following boat immediately
        this.camera.lastManualMoveTime = performance.now() / 1000 - this.camera.autoFollowDelay - 1;

        console.log(`Camera initialized: zoom=${fitZoom.toFixed(3)}, range=${fitZoom.toFixed(3)} to ${this.camera.maxZoom}`);
    },

    onOptions() {
        console.log('Options clicked');
        UI.showOptions(() => this.showMainMenu());
    },

    onCredits() {
        console.log('Credits clicked');
        UI.showMessage(
            'Credits',
            'BOTA - Boats of the Ancients\n\nA maritime trading simulation\nthemed by DOTA\n\nMade with HTML5 Canvas',
            () => this.showMainMenu()
        );
    },

    // AIDEV-NOTE: Export port data as JavaScript code
    // Generates formatted code ready to paste into port_data.js
    exportPortData() {
        let code = '// BOTA - Port Data\n';
        code += '// All port information for the game world\n\n';
        code += '// AIDEV-NOTE: Port data structure\n';
        code += '// Each port contains:\n';
        code += '// - id: Unique identifier\n';
        code += '// - name: Display name\n';
        code += '// - faction: Claddish Navy, Artifact Traders, Stonehall Merchants, Revtel, Free Captains, Slithereen Guard, etc.\n';
        code += '// - x, y: World coordinates (centered, where 0,0 is map center, range approximately -512 to +512)\n';
        code += '// - size: Visual size in pixels for rendering (based on tier: tier1=30, tier2=40, tier3=50)\n';
        code += '// - tier: Port tier (1, 2, or 3)\n';
        code += '// - entryX, entryY: Entry position for boats (for pathfinding to inland ports)\n\n';
        code += 'const PortData = [\n';
        
        // Group ports by faction
        const factions = {};
        for (const port of this.ports) {
            if (!factions[port.faction]) {
                factions[port.faction] = [];
            }
            factions[port.faction].push(port);
        }
        
        // Output each faction group
        const factionNames = Object.keys(factions).sort();
        for (let i = 0; i < factionNames.length; i++) {
            const faction = factionNames[i];
            const ports = factions[faction];
            
            code += `    // ${faction.toUpperCase()} (${ports.length} port${ports.length !== 1 ? 's' : ''})\n`;
            
            for (let j = 0; j < ports.length; j++) {
                const port = ports[j];
                code += `    { id: "${port.id}", name: "${port.name}", faction: "${port.faction}", x: ${port.x}, y: ${port.y}, tier: ${port.tier}, size: ${port.size}`;
                
                // Add flipped property if true
                if (port.flipped) {
                    code += `, flipped: true`;
                }
                
                // Add entry positions (default to port position if not set)
                const entryX = port.entryX !== undefined ? port.entryX : port.x;
                const entryY = port.entryY !== undefined ? port.entryY : port.y;
                code += `, entryX: ${entryX}, entryY: ${entryY}`;
                
                code += ` }`;
                
                // Add comma unless it's the last port overall
                const isLastFaction = i === factionNames.length - 1;
                const isLastPort = j === ports.length - 1;
                if (!(isLastFaction && isLastPort)) {
                    code += ',';
                }
                
                code += '\n';
            }
            
            // Add blank line between factions
            if (i < factionNames.length - 1) {
                code += '\n';
            }
        }
        
        code += '];\n\n';
        code += '// AIDEV-NOTE: Helper function to get port by ID\n';
        code += 'function getPortById(portId) {\n';
        code += '    return PortData.find(port => port.id === portId);\n';
        code += '}\n\n';
        code += '// AIDEV-NOTE: Helper function to get all ports by faction\n';
        code += 'function getPortsByFaction(faction) {\n';
        code += '    return PortData.filter(port => port.faction === faction);\n';
        code += '}\n\n';
        code += '// AIDEV-NOTE: Helper function to get port at world position (with radius check)\n';
        code += 'function getPortAtPosition(worldX, worldY, maxDistance = 50) {\n';
        code += '    for (const port of PortData) {\n';
        code += '        const dx = worldX - port.x;\n';
        code += '        const dy = worldY - port.y;\n';
        code += '        const distance = Math.sqrt(dx * dx + dy * dy);\n';
        code += '        \n';
        code += '        if (distance <= maxDistance) {\n';
        code += '            return port;\n';
        code += '        }\n';
        code += '    }\n';
        code += '    return null;\n';
        code += '}\n\n';
        
        return code;
    },

    // Save/Load system
    loadSaveData() {
        try {
            const saved = localStorage.getItem('bota_save');
            if (saved) {
                this.saveData = JSON.parse(saved);
                console.log('Save data loaded:', this.saveData);
            } else {
                console.log('No save data found');
            }
        } catch (error) {
            console.error('Failed to load save data:', error);
            this.saveData = null;
        }
    },

    saveSaveData(data) {
        try {
            this.saveData = data;
            localStorage.setItem('bota_save', JSON.stringify(data));
            console.log('Game saved successfully');
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    },

    clearSaveData() {
        this.saveData = null;
        localStorage.removeItem('bota_save');
        console.log('Save data cleared');
    }
};

// Start game when page loads
window.addEventListener('load', () => {
    Game.init();
});

