// BOTA - Dice System (bootstrap/orchestrator for standalone dice/combat test)
// Responsibilities:
// - Initialize combat manager with specific characters.
// - This has no other responsibilities.

const DiceTestSystem = {

    // Initialize dice test screen
    init() {
        console.log('DiceSystem - Initializing dice test screen...');
        
        // Get Axe's captain data
        const axeCaptain = getCaptainById('captain_axe');
        
        // Get Axe's starting ship (Oglodi Longboat)
        const axeShip = getShipById('ship_oglodi_longboat');
        
        // Build dice pool: captain's dice + ship equipment dice (manned by generic crew)
        const diceNames = [];
        
        // Add captain's personal and equipment dice
        diceNames.push('axe_personal');
        diceNames.push('axe_equipment');
        
        // Add ship equipment dice (manned by generic crew)
        if (axeShip.extraDice && axeShip.extraDice.length > 0) {
            console.log(`Loading ${axeShip.extraDice.length} ship equipment dice from ${axeShip.name}`);
            // Ship extraDice are stored in ship_data.js and converted to actual dice in DiceData
            // For the Oglodi Longboat, this is the "Ram" die
            diceNames.push('oglodi_ram'); // ID from dice_data.js
        }
        
        // Load all dice
        this.ui.dice = diceNames.map(dieName => getDieByName(dieName));

        // Initialize animation states with real 3D orientation
        this.ui.diceStates = this.ui.dice.map(() => Die.createInitialDieState());
        
        // Interactive die state (disabled - no longer used for dragging)
        this.interactiveDie = {
            baseX: 0,
            baseY: 0
        };

        // Pre-render face textures for all dice (via Die)
        this.faceTextures = this.ui.dice.map(die => Die.createFaceTextures(die, this.colors));

        // Ensure combat logic state exists
        CombatManager.ensureState();

        // Initialize combat UI
        CombatUI.init();
        CombatUI.loadPortrait('captain_axe', 'assets/characters/captain_axe.png');
        // Pre-load ship crew portrait (all ship crews use 'ship' ID)
        CombatUI.loadPortrait('ship', 'assets/characters/crew/generic_crew_portrait.png');

        // Initialize combat if in combat mode
        if (this.ui.combatMode) {
            // Get generic crew data
            const genericCrew = getCrewById('crew');
            
            // Create crew data with ship weapon dice
            const playerCrewData = {
                id: 'crew',
                name: 'Crew',
                health: genericCrew.health,
                dice: ['oglodi_ram'] // Ship weapon dice operated by crew
            };
            const enemyCrewData = {
                id: 'crew',
                name: 'Crew',
                health: genericCrew.health,
                dice: ['oglodi_ram'] // Ship weapon dice operated by crew
            };
            
            // Create mock captain objects for Axe vs Axe testing
            // Captains have only their personal dice (not ship weapons)
            const playerCaptain = {
                id: 'captain_axe',
                name: 'Player Axe',
                hp: 100,
                maxHp: 100,
                dice: ['axe_personal', 'axe_equipment'], // Only captain's dice
                portrait: 'assets/characters/captain_axe.png'
            };
            const enemyCaptain = {
                id: 'captain_axe',
                name: 'Enemy Axe',
                hp: 100,
                maxHp: 100,
                dice: ['axe_personal', 'axe_equipment'], // Only captain's dice
                portrait: 'assets/characters/captain_axe.png'
            };
            
            Combat.init(playerCaptain, enemyCaptain, playerCrewData, enemyCrewData);
            Combat.startTurn();
        }

        console.log('DiceSystem - Initialized with', this.ui.dice.length, 'dice (captain + ship weapons)');
    },    
};

// Expose DiceSystem globally so other modules can access it
window.DiceTestSystem = DiceTestSystem;
