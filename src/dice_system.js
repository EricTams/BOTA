// dice_system.js - Orchestrator for standalone dice/combat test (Axe vs Axe)
// Responsibilities:
// - Own UI-only dice state in `DiceSystem.state` (dice, diceStates, overlays)
// - Drive per-die animations and, when settled, populate CombatManager.rolledDice
// - Delegate all rendering to CombatUI and all face/cube drawing to Die
// - Provide small wrapper methods used by CombatUI (3D die, face draw, modal actions)
// - Wire input to UI handlers (hover/click) without mutating combat logic directly
// Not responsible for:
// - Combat rules/effects (Combat, CombatManager)
// - UI layout/art (CombatUI) or icon art (DiceIcons)
// - Defining dice/abilities (dice_data.js, dice_abilities.js)

const DiceSystem = {
    // Shared palette and layout
    colors: Die.colors,
    layout: CombatUI.layout,

    // UI state only (no combat logic here)
    state: {
        dice: [], // Currently active dice (for current turn's unit)
        diceStates: [],
        diePositions: [],
        playerDice: [], // Player's dice (captain + crew weapons)
        enemyDice: [], // Enemy's dice (captain + crew weapons)
        playerDiceStates: [], // Animation states for player dice
        enemyDiceStates: [], // Animation states for enemy dice
        hoveredButton: null,
        tooltip: { visible: false, dieIndex: null, faceIndex: null, x: 0, y: 0, filledSlots: [], source: null, abilityIcon: null },
        expandedUnitPanel: null,
        expandedAbility: null,
        rerollModal: null,
        rerollTray: [],
        rollsAvailable: 1,
        draggedDieIndex: null,
        dragOffset: { x: 0, y: 0 },
        combatMode: true
    },

    // Pre-rendered textures for faces
    faceTextures: [],
    playerFaceTextures: [], // Textures for player dice
    enemyFaceTextures: [], // Textures for enemy dice

    // Initialize test screen and combat
    init() {
        console.log('DiceSystem - Initializing dice test screen...');

        // Get captain data
        const axeCaptain = getCaptainById('captain_axe');
        const rubickCaptain = getCaptainById('captain_rubick');
        
        // Get starting ships
        const axeShip = getShipById('ship_oglodi_longboat'); // Oglodi Raiders
        const rubickShip = getShipById('ship_artifact_skiff'); // Artifact Traders - Mystic Skiff
        
        // Build dice pools for both sides
        const playerDiceNames = ['axe_personal', 'axe_equipment'];
        const enemyDiceNames = ['rubick_personal', 'rubick_equipment'];
        
        // Add ship equipment dice (manned by generic crew)
        if (axeShip.extraDice && axeShip.extraDice.length > 0) {
            console.log(`Player: Loading ${axeShip.extraDice.length} ship equipment dice from ${axeShip.name}`);
            playerDiceNames.push('oglodi_ram'); // Oglodi Longboat weapon
        }
        
        if (rubickShip.extraDice && rubickShip.extraDice.length > 0) {
            console.log(`Enemy: Loading ${rubickShip.extraDice.length} ship equipment dice from ${rubickShip.name}`);
            enemyDiceNames.push('arcane_staff'); // Mystic Skiff weapon 1
            enemyDiceNames.push('crystal_array'); // Mystic Skiff weapon 2
        }

        // Load dice for both sides
        this.state.playerDice = playerDiceNames.map(dieName => getDieByName(dieName));
        this.state.enemyDice = enemyDiceNames.map(dieName => getDieByName(dieName));
        
        // Initialize animation states for both sides
        this.state.playerDiceStates = this.state.playerDice.map(() => Die.createInitialDieState());
        this.state.enemyDiceStates = this.state.enemyDice.map(() => Die.createInitialDieState());

        // Pre-render textures for both sides
        this.playerFaceTextures = this.state.playerDice.map(die => Die.createFaceTextures(die, this.colors));
        this.enemyFaceTextures = this.state.enemyDice.map(die => Die.createFaceTextures(die, this.colors));

        // Start with player's dice active (since player goes first)
        this.state.dice = this.state.playerDice;
        this.state.diceStates = this.state.playerDiceStates;
        this.faceTextures = this.playerFaceTextures;

        // Ensure logic state exists
        CombatManager.ensureState();

        // Init UI (portraits etc.)
        CombatUI.init();
        CombatUI.loadPortrait('captain_axe', 'assets/characters/captain_axe.png');
        CombatUI.loadPortrait('captain_rubick', 'assets/characters/captain_rubick.png');
        CombatUI.loadPortrait('crew', 'assets/characters/crew/generic_crew_portrait.png');

        // Start a duel: Player Axe vs Enemy Rubick with crew
        if (this.state.combatMode) {
            // Get generic crew data
            const genericCrew = getCrewById('crew');
            
            // Create crew data with ship weapon dice
            const playerCrewData = {
                id: 'crew',
                name: 'Crew',
                health: genericCrew.health,
                dice: ['oglodi_ram'] // Oglodi Longboat Ram
            };
            const enemyCrewData = {
                id: 'crew',
                name: 'Crew',
                health: genericCrew.health,
                dice: ['arcane_staff', 'crystal_array'] // Mystic Skiff weapons
            };
            
            // Create captain objects - only their personal dice
            const playerCaptain = {
                id: 'captain_axe',
                name: 'Axe',
                hp: 100,
                maxHp: 100,
                dice: ['axe_personal', 'axe_equipment'], // Only captain's dice
                portrait: 'assets/characters/captain_axe.png'
            };
            const enemyCaptain = {
                id: 'captain_rubick',
                name: 'Rubick',
                hp: 100,
                maxHp: 100,
                dice: ['rubick_personal', 'rubick_equipment'], // Only captain's dice
                portrait: 'assets/characters/captain_rubick.png'
            };
            
            Combat.init(playerCaptain, enemyCaptain, playerCrewData, enemyCrewData);
            Combat.startTurn();
        }

        console.log('DiceSystem - Initialized with', this.state.dice.length, 'player dice and', this.state.enemyDice.length, 'enemy dice');
    },
    
    // Switch active dice when turn changes
    switchToPlayerTurn() {
        console.log('DiceSystem - Switching to player turn');
        this.state.dice = this.state.playerDice;
        this.state.diceStates = this.state.playerDiceStates;
        this.faceTextures = this.playerFaceTextures;
    },
    
    switchToEnemyTurn() {
        console.log('DiceSystem - Switching to enemy turn');
        this.state.dice = this.state.enemyDice;
        this.state.diceStates = this.state.enemyDiceStates;
        this.faceTextures = this.enemyFaceTextures;
    },

    // Advance dice animations; when all settle, populate logic rolled pool
    update(deltaTime) {
        let anyJustFinished = false;
        const states = this.state.diceStates;

        for (let i = 0; i < states.length; i++) {
            const state = states[i];
            if (!state.rolling) continue;

            state.animationTime += deltaTime;
            const t = state.animationTime;
            const animationDuration = 0.7;

            if (t < animationDuration) {
                const backwardsTime = animationDuration - t;
                const progress = backwardsTime / animationDuration; // 1 -> 0

                // Vertical pop
                state.yOffset = -40 * Math.sin(progress * Math.PI);

                // Unwind axis rotation
                const angle = progress * Math.PI * 4;
                Die.applyAxisRotation(state, state.rollAxis || Die.getRandomAxis(), angle, state.targetRotationX, state.targetRotationY, state.targetRotationZ);

                // Snap on last frame
                if (t >= animationDuration - 0.016) {
                    state.rotationX = state.targetRotationX;
                    state.rotationY = state.targetRotationY;
                    state.rotationZ = state.targetRotationZ;
                    state.yOffset = 0;
                    state.axisRotation = null;
                }
            } else {
                // Done
                state.rolling = false;
                state.animationTime = 0;
                state.rotationX = state.targetRotationX;
                state.rotationY = state.targetRotationY;
                state.rotationZ = state.targetRotationZ;
                state.yOffset = 0;
                state.axisRotation = null;
                state.currentFace = state.targetFace;
                anyJustFinished = true;
            }
        }

        // Populate rolled pool when all dice settle
        if (anyJustFinished && !this.isAnyRolling()) {
            CombatManager.populateRolledDicePool(
                CombatManager.state,
                this.state.dice,
                this.state.diceStates,
                CombatManager.state.rerollingDice || null
            );
            CombatManager.state.rerollingDice = null;
        }
    },

    // Orchestrate rendering via CombatUI
    render(ctx, canvas) {
        // Base screen
        if (this.state.combatMode && Combat.state.active) {
            CombatUI.render(ctx, canvas);
        } else {
            CombatUI.renderTestScreen(ctx, canvas);
        }

        // Dragged die overlay
        if (this.state.draggedDieIndex !== null && this.state.draggedDieIndex !== undefined) {
            CombatUI.renderDraggedDie(ctx);
        }

        // Non-combat extras
        if (!(this.state.combatMode && Combat.state.active)) {
            CombatUI.renderRerollTray(ctx, canvas);
            CombatUI.renderTestButtons(ctx, canvas);
        }

        // Expanded unit panel overlay (unwrapped dice)
        if (this.state.expandedUnitPanel) {
            CombatUI.renderExpandedUnitOverlay(ctx, canvas);
        }

        // Reroll modal
        if (this.state.rerollModal) {
            CombatUI.renderRerollModal(ctx, canvas);
        }

        // Expanded ability panel
        if (this.state.expandedAbility) {
            CombatUI.renderExpandedAbility(ctx, canvas);
        }

        // Tooltip (only when no modal/panel)
        if (!this.state.expandedAbility && !this.state.rerollModal) {
            CombatUI.renderTooltip(ctx, canvas);
        }
    },

    // Roll both dice with random axes and target faces
    rollAllDice() {
        if (this.isAnyRolling()) return;

        // Reset logic state for the turn
        CombatManager.ensureState();
        CombatManager.state.rolledDice = [];
        CombatManager.state.savedDice = [];
        CombatManager.state.assignedDice = {};
        CombatManager.state.expandedAbility = null;
        CombatManager.state.rerollsRemaining = 1;

        // Animate
        for (let i = 0; i < this.state.diceStates.length; i++) {
            const state = this.state.diceStates[i];
            state.rollAxis = Die.getRandomAxis();
            state.targetFace = Math.floor(Math.random() * 6);
            Die.setTargetRotationForFace(state, state.targetFace);
            state.rolling = true;
            state.animationTime = 0;
        }

        // Clear UI-only trays
        this.state.rerollTray = [];
        this.state.rollsAvailable = 1;
    },

    // True if any die is currently animating
    isAnyRolling() {
        return this.state.diceStates.some(s => s.rolling);
    },

    // Open reroll selection modal
    openRerollModal() {
        // Auto-select blank faces by default
        const autoSelectedDice = [];
        const rolledDice = CombatManager.state.rolledDice || [];
        for (const rolled of rolledDice) {
            if (!rolled.assigned && !rolled.face.icon) {
                // Blank face (no icon) - auto-select for reroll
                autoSelectedDice.push(rolled.dieIndex);
            }
        }
        
        this.state.rerollModal = {
            selectedDice: autoSelectedDice,
            checkboxBounds: [],
            bounds: null,
            cancelButton: null,
            confirmButton: null
        };
    },

    // Confirm reroll and start animations for selected dice
    confirmReroll() {
        const modal = this.state.rerollModal;
        if (!modal || modal.selectedDice.length === 0) return;

        for (const dieIndex of modal.selectedDice) {
            const state = this.state.diceStates[dieIndex];
            state.rollAxis = Die.getRandomAxis();
            state.targetFace = Math.floor(Math.random() * 6);
            Die.setTargetRotationForFace(state, state.targetFace);
            state.rolling = true;
            state.animationTime = 0;
        }

        CombatManager.state.rerollingDice = modal.selectedDice.slice();
        CombatManager.state.rerollsRemaining--;
        this.state.rerollModal = null;
    },

    // Execute ability for current selection (expanded panel preferred)
    executeCombatAbility() {
        if (CombatManager.state.expandedAbility) {
            const result = CombatManager.executeExpandedAbility(CombatManager.state, CombatManager.state.expandedAbility);
            return result && result.executed;
        }
        CombatManager.executeCombatAbility();
        return true;
    },

    // Wrappers used by CombatUI drawing
    drawPerspectiveDie(ctx, die, x, y, size, state, dieIdx) {
        Die.drawPerspectiveDie(ctx, die, x, y, size, state, dieIdx, {
            faceTextures: this.faceTextures,
            diceStates: this.state.diceStates,
            diePositions: this.state.diePositions
        });
    },

    drawDieFace(ctx, face, x, y, size, isSmall) {
        Die.drawDieFace(ctx, face, x, y, size, isSmall, this.colors);
    },

    // Input plumbing (delegate to CombatUI helpers)
    onMouseMove(mousePos, canvas) {
        CombatUI.onMouseMove(mousePos, canvas);
    },

    onMouseDown(mousePos, canvas) {
        CombatUI.checkButtonClick(mousePos, canvas);
    },

    onMouseUp(mousePos, canvas) {
        // no-op for now
    }
};

// Expose globally
window.DiceSystem = DiceSystem;


