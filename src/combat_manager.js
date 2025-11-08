// combat_manager.js - Pure combat logic manager (no rendering)
// Responsibilities:
// - Manage dice pool state, assignments, and execution decisions
// - Provide pure functions that accept state/data and return updated state/results
// - Defer effect application to Combat.executeAbility and all UI drawing to CombatUI
// Not responsible for: rendering, per-die animation (Die), or boot orchestration (DiceSystem)
// AIDEV-NOTE: Keep logic pure; pass in state and data; return updates

const CombatManager = {

    // UI-only state (logic in CombatManager.state)
    ui: {
        dice: [], // Array of die objects from dice_data.js
        diceStates: [], // Animation states for each die (UI only)
        rerollTray: [], // Indices of dice in reroll tray (test mode UI only)
        draggedDieIndex: null, // Currently dragged die (UI only)
        dragOffset: { x: 0, y: 0 }, // Offset for drag rendering (UI only)
        rollsAvailable: 1, // Number of rerolls remaining (test mode UI only)
        hoveredButton: null, // Which button is hovered (UI only)
        tooltip: { // Tooltip state (UI only)
            visible: false,
            dieIndex: null, // Which die is being hovered
            faceIndex: null, // Which face (0-5) is being hovered
            x: 0,
            y: 0,
            filledSlots: [], // Array of booleans for each power-up slot
            source: null, // 'die_face' or 'status_effect'
            abilityIcon: null // Icon name for the ability
        },
        expandedUnitPanel: null, // Expanded unit panel: { unitId: 'player' | 'enemy', bounds } (UI only)
        rerollModal: null, // Reroll modal: { selectedDice: [dieIndices], bounds } (UI only)
        // Logic state lives in CombatManager.state: rerollsRemaining, rerollingDice, rolledDice, savedDice, assignedDice, expandedAbility
        combatMode: true, // AIDEV-NOTE: Combat mode enabled for testing
        selectedDieForAbility: null, // Index of die face selected to execute as ability (UI only)
        activeAbility: null, // Currently selected ability to assign dice to (UI only)
        dragState: null // Drag state: { dieIndex, startX, startY } (UI only)
    },

    // Roll all dice
    rollAllDice() {
        if (this.isAnyRolling()) return;
        
        
        // Clear previous roll data (logic state)
        CombatManager.ensureState();
        CombatManager.state.rolledDice = [];
        CombatManager.state.savedDice = [];
        CombatManager.state.assignedDice = {};
        CombatManager.state.expandedAbility = null;
        this.ui.activeAbility = null;
        
        // Reset rerolls for new turn
        CombatManager.state.rerollsRemaining = 1;
        
        for (let i = 0; i < this.ui.diceStates.length; i++) {
            const state = this.ui.diceStates[i];
            
            // Generate a unique random axis for THIS die
            state.rollAxis = Die.getRandomAxis();
            
            // Step 1: Choose the final face randomly for THIS die
            state.targetFace = Math.floor(Math.random() * 6);
            
            // Step 2: Set target rotation for that face (where we'll be at t=0.0)
            Die.setTargetRotationForFace(state, state.targetFace);
            
            // Step 3: Start the backwards animation
            state.rolling = true;
            state.animationTime = 0;
        }
        
        // Populate rolled dice pool after animation completes
        // (will be done in update() when rolling finishes)
        
        // Clear reroll tray
        this.ui.rerollTray = [];
        this.ui.rollsAvailable = 1;
    },

    // Execute the expanded ability (delegate to CombatManager)
    executeExpandedAbility() {
        const result = CombatManager.executeExpandedAbility(CombatManager.state, CombatManager.state.expandedAbility);
        if (result.executed && CombatManager.state.expandedAbility?.ability) {
        }
    },

    // Calculate power-up bonus from burned dice
    calculatePowerUpBonus(abilityKey) {
        const assignedDice = CombatManager.state.assignedDice[abilityKey] || [];
        if (assignedDice.length === 0) return { primaryDie: null, burnedCount: 0 };
        
        // First die is the primary (executes the ability)
        const primaryPoolIndex = assignedDice[0];
        const primaryDie = CombatManager.state.rolledDice[primaryPoolIndex];
        
        // Count matching colored dice as burned (power-up)
        let burnedCount = 0;
        for (let i = 1; i < assignedDice.length; i++) {
            const poolIndex = assignedDice[i];
            const die = CombatManager.state.rolledDice[poolIndex];
            if (die && die.color === primaryDie.color) {
                burnedCount++;
            }
        }
        
        return {
            primaryDie: primaryDie,
            burnedCount: burnedCount
        };
    },

    // (moved to Die) setTargetRotationForFace

    // Reroll selected dice
    rerollSelected() {
        if (this.ui.rerollTray.length === 0) return;
        if (this.ui.rollsAvailable <= 0) return;
        if (this.isAnyRolling()) return;
        
        for (const dieIdx of this.ui.rerollTray) {
            const state = this.ui.diceStates[dieIdx];
            
            // Save current orientation as start position
            state.startRotationX = state.rotationX;
            state.startRotationY = state.rotationY;
            state.startRotationZ = state.rotationZ;
            
            state.rolling = true;
            state.animationTime = 0;
            state.targetFace = Math.floor(Math.random() * 6);
            
            // Set target rotation for new face
            Die.setTargetRotationForFace(state, state.targetFace);
        }
        
        this.ui.rollsAvailable--;
        this.ui.rerollTray = [];
    },

    // Check if any die is rolling
    isAnyRolling() {
        return this.ui.diceStates.some(state => state.rolling);
    },

    // Handle mouse down
    onMouseDown(mousePos, canvas) {
        // Only handle button clicks now - no drag controls
        this.checkButtonClick(mousePos, canvas);
    },

    // Handle mouse up
    onMouseUp(mousePos, canvas) {
        // No drag to end
    },

    // Execute ability from rolled dice
    executeCombatAbility() {
        if (!Combat.state.active) return;

        // Find first selected die that hasn't been assigned yet
        const selectedDie = (CombatManager.state.rolledDice || []).find(d => d.selected && !d.assigned);
        
        if (!selectedDie) {
            return;
        }

        // For now, simple execution: use the selected die
        // Count any other selected dice of matching color as power-ups
        const matchingColor = selectedDie.color;
        let burnedCount = 0;
        
        for (let rolledDie of (CombatManager.state.rolledDice || [])) {
            if (rolledDie !== selectedDie && 
                rolledDie.selected && 
                !rolledDie.assigned && 
                rolledDie.color === matchingColor) {
                burnedCount++;
                rolledDie.assigned = true; // Mark as burned
            }
        }
        
        // Mark primary die as assigned
        selectedDie.assigned = true;
        
        // Execute the ability with power-up bonus
        const caster = Combat.getCurrentUnit();
        const target = Combat.getOpponentUnit();
        
        Combat.executeAbility(selectedDie.ability, caster, target, burnedCount);
        
        console.log(`Executed ${selectedDie.ability.displayName} with ${burnedCount} burned dice`);
    },

    // Singleton combat state (logic-only). Initialized via ensureState.
    state: null,

    ensureState() {
        if (!this.state) this.state = this.init({});
        return this.state;
    },
    // Initialize per-encounter state if needed
    init(state) {
        if (!state.rolledDice) state.rolledDice = [];
        if (!state.savedDice) state.savedDice = [];
        if (!state.assignedDice) state.assignedDice = {};
        // AIDEV-NOTE: Combat-owned state (no UI rendering here)
        if (state.rerollsRemaining === undefined) state.rerollsRemaining = 0;
        if (state.rerollingDice === undefined) state.rerollingDice = null;
        if (state.expandedAbility === undefined) state.expandedAbility = null; // { dieIndex, faceIndex, ability, powerUpDice: [] }
        if (state.targetingMode === undefined) state.targetingMode = null; // { ability, caster, validTargets, hoveredTarget: null }
        return state;
    },

    // Roll random faces for a list of dice ids (pure, no UI deps)
    // getDieFn: (id) => die object from caller (explicit dependency)
    rollDiceFaces(diceIds, getDieFn) {
        const rolled = [];
        for (let i = 0; i < diceIds.length; i++) {
            const die = getDieFn(diceIds[i]);
            if (!die) throw new Error(`Die not found: ${diceIds[i]}`);
            const faceIndex = Math.floor(Math.random() * 6);
            const face = die.faces[faceIndex];
            if (!face || !face.icon) continue;
            const ability = getAbilityData(face.icon);
            rolled.push({ poolIndex: rolled.length, dieId: diceIds[i], dieIndex: i, faceIndex, face, ability, color: face.color, assigned: false, selected: false });
        }
        return rolled;
    },

    // Choose best single die to execute + how many power-up slots we can fill
    chooseBestRolledDie(rolled) {
        if (!rolled || rolled.length === 0) return null;
        let best = null;
        for (let i = 0; i < rolled.length; i++) {
            const main = rolled[i];
            const maxSlots = main.ability.powerUpSlots || 0;
            const needed = main.ability.powerUpColors || [];
            let available = 0;
            for (let j = 0; j < rolled.length; j++) if (j !== i && rolled[j].color === needed[Math.min(available, needed.length - 1)]) available++;
            const filled = Math.min(maxSlots, available);
            const score = calculateAbilityValue(main.ability, filled).result;
            if (!best || score > best.score) best = { index: i, filledSlots: filled, score };
        }
        return best;
    },

    // Play one auto turn for current unit (roll, choose, execute)
    playAutoTurn() {
        if (!Combat.state.active) return { executed: false };
        const caster = Combat.getCurrentUnit();
        const rolled = this.rollDiceFaces(caster.dice || [], getDieByName);
        if (rolled.length === 0) return { executed: false };
        const choice = this.chooseBestRolledDie(rolled);
        if (!choice) return { executed: false };
        const main = rolled[choice.index];
        
        // AIDEV-NOTE: Use getValidTargets to respect taunt mechanic
        // For melee attacks, this will filter to only taunted units if any exist
        const validTargets = this.getValidTargets(main.ability, caster);
        if (validTargets.length === 0) {
            // No valid targets (shouldn't happen, but handle gracefully)
            return { executed: false };
        }
        
        // Pick first valid target (or random if multiple)
        const targetInfo = validTargets.length === 1 
            ? validTargets[0] 
            : validTargets[Math.floor(Math.random() * validTargets.length)];
        const target = targetInfo.unit;
        
        Combat.executeAbility(main.ability, caster, target, choice.filledSlots);
        return { executed: true, main, filledSlots: choice.filledSlots };
    },

    // Toggle a die's selection for saving (pure state update)
    toggleDieSelection(state, poolIndex) {
        const rolledDie = state.rolledDice[poolIndex];
        if (!rolledDie || rolledDie.assigned) return state;
        rolledDie.selected = !rolledDie.selected;
        if (rolledDie.selected) {
            if (!state.savedDice.includes(poolIndex)) state.savedDice.push(poolIndex);
        } else {
            const idx = state.savedDice.indexOf(poolIndex);
            if (idx !== -1) state.savedDice.splice(idx, 1);
        }
        return state;
    },

    // Build or update rolled dice pool based on dice definitions and current target faces
    populateRolledDicePool(state, diceDefs, diceStates, rerollingDieIndices = null) {
        const isReroll = Array.isArray(rerollingDieIndices) && rerollingDieIndices.length > 0;

        if (isReroll) {
            // Update only specified dice
            for (const rolled of state.rolledDice) {
                if (rerollingDieIndices.includes(rolled.dieIndex)) {
                    const die = diceDefs[rolled.dieIndex];
                    const dieState = diceStates[rolled.dieIndex];
                    const face = die.faces[dieState.targetFace];
                    const ability = face.icon ? getAbilityData(face.icon) : null;
                    rolled.faceIndex = dieState.targetFace;
                    rolled.face = face;
                    rolled.ability = ability;
                    rolled.color = face.color;
                }
            }
        } else {
            // Initial population
            state.rolledDice = [];
            for (let i = 0; i < diceDefs.length; i++) {
                const die = diceDefs[i];
                const dieState = diceStates[i];
                const face = die.faces[dieState.targetFace];
                if (face) {
                    // Include ALL faces (blank and non-blank)
                    const ability = face.icon ? getAbilityData(face.icon) : null;
                    state.rolledDice.push({
                        poolIndex: state.rolledDice.length,
                        dieIndex: i,
                        faceIndex: dieState.targetFace,
                        face,
                        ability,
                        selected: false,
                        assigned: false,
                        color: face.color || null
                    });
                }
            }
        }
        return state;
    },

    // Manage expanded ability selection (pure state updates)
    openExpandedAbility(state, dieIndex) {
        const main = state.rolledDice[dieIndex];
        if (!main || main.assigned) return state;
        state.expandedAbility = {
            dieIndex,
            faceIndex: main.faceIndex,
            ability: main.ability,
            powerUpDice: []
        };
        return state;
    },

    togglePowerUpDie(state, dieIndex) {
        const expanded = state.expandedAbility;
        if (!expanded) return state;
        if (dieIndex === expanded.dieIndex) return state; // cannot power-up with itself
        const rolledDie = state.rolledDice[dieIndex];
        if (!rolledDie || rolledDie.assigned) return state;
        const powerUpColors = expanded.ability.powerUpColors || [];
        if (!powerUpColors.includes(rolledDie.color)) return state;
        const idx = expanded.powerUpDice.indexOf(dieIndex);
        if (idx >= 0) {
            expanded.powerUpDice.splice(idx, 1);
        } else {
            const maxSlots = expanded.ability.powerUpSlots || 0;
            if (expanded.powerUpDice.length < maxSlots) expanded.powerUpDice.push(dieIndex);
        }
        return state;
    },

    cancelExpandedAbility(state) {
        state.expandedAbility = null;
        return state;
    },

    // Assign a die to an ability bucket
    assignDieToAbility(state, poolIndex, abilityKey) {
        const rolledDie = state.rolledDice[poolIndex];
        if (!rolledDie) return state;
        rolledDie.assigned = true;
        rolledDie.selected = true;
        if (!state.assignedDice[abilityKey]) state.assignedDice[abilityKey] = [];
        state.assignedDice[abilityKey].push(poolIndex);
        const idx = state.savedDice.indexOf(poolIndex);
        if (idx !== -1) state.savedDice.splice(idx, 1);
        return state;
    },

    // Unassign a die from an ability bucket
    unassignDieFromAbility(state, poolIndex, abilityKey) {
        const rolledDie = state.rolledDice[poolIndex];
        if (!rolledDie) return state;
        rolledDie.assigned = false;
        rolledDie.selected = false;
        const list = state.assignedDice[abilityKey];
        if (list) {
            const idx = list.indexOf(poolIndex);
            if (idx !== -1) list.splice(idx, 1);
        }
        return state;
    },

    // Get all combat units (for targeting)
    getAllUnits() {
        const units = [];
        // Add all player units
        for (const unit of Combat.state.playerUnits) {
            units.push({
                unit: unit,
                id: unit.id,
                isPlayer: true,
                isCrew: !!unit.shipId || unit.id.includes('crew')
            });
        }
        // Add all enemy units
        for (const unit of Combat.state.enemyUnits) {
            units.push({
                unit: unit,
                id: unit.id,
                isPlayer: false,
                isCrew: !!unit.shipId || unit.id.includes('crew')
            });
        }
        return units;
    },

    // Determine valid targets for an ability
    getValidTargets(ability, caster) {
        const allUnits = this.getAllUnits();
        const casterInfo = allUnits.find(u => u.unit === caster);
        if (!casterInfo) return [];

        const targeting = ability.targeting || 'enemy';
        const validTargets = [];

        for (const unitInfo of allUnits) {
            let isValid = false;

            switch (targeting) {
                case 'self':
                    isValid = unitInfo.unit === caster;
                    break;
                case 'enemy':
                    isValid = unitInfo.isPlayer !== casterInfo.isPlayer;
                    break;
                case 'enemies':
                    isValid = unitInfo.isPlayer !== casterInfo.isPlayer;
                    break;
                case 'ally':
                    isValid = unitInfo.isPlayer === casterInfo.isPlayer && unitInfo.unit !== caster;
                    break;
                case 'allies':
                    isValid = unitInfo.isPlayer === casterInfo.isPlayer;
                    break;
            }

            // AIDEV-NOTE: Targeting restrictions (melee/ranged) not yet implemented
            // When back row units are implemented, melee will only target front row (captains)
            // For now, everyone is in melee range, so no filtering needed

            if (isValid) {
                validTargets.push(unitInfo);
            }
        }

        // AIDEV-NOTE: Taunt mechanic - melee attacks must target taunted units if any exist
        if (ability.targetingRestriction === 'melee' && targeting === 'enemy') {
            const tauntedUnits = window.StatusEffects && window.StatusEffects.getTauntedUnits 
                ? window.StatusEffects.getTauntedUnits(validTargets)
                : [];
            
            if (tauntedUnits.length > 0) {
                // Must attack taunted units only
                return tauntedUnits;
            }
        }

        return validTargets;
    },

    // Enter targeting mode for an ability
    enterTargetingMode(state, expanded) {
        if (!expanded) return state;
        const mainDie = state.rolledDice[expanded.dieIndex];
        if (!mainDie) return state;

        const caster = Combat.getCurrentUnit();
        const validTargets = this.getValidTargets(expanded.ability, caster);
        
        // If only one valid target, auto-execute (no targeting needed)
        if (validTargets.length === 1) {
            return this.executeExpandedAbilityWithTarget(state, expanded, validTargets[0].unit);
        }

        // Enter targeting mode
        state.targetingMode = {
            ability: expanded.ability,
            caster: caster,
            expanded: expanded,
            validTargets: validTargets,
            hoveredTarget: null
        };

        return state;
    },

    // Execute ability with selected target
    executeExpandedAbilityWithTarget(state, expanded, target) {
        if (!expanded) return { state, executed: false };
        const mainDie = state.rolledDice[expanded.dieIndex];
        if (!mainDie) return { state, executed: false };

        // Mark main die and power-ups as assigned
        mainDie.assigned = true;
        for (const p of expanded.powerUpDice) {
            const pu = state.rolledDice[p];
            if (pu) pu.assigned = true;
        }

        const caster = Combat.getCurrentUnit();
        const filledSlots = expanded.powerUpDice.length;
        Combat.executeAbility(expanded.ability, caster, target, filledSlots);

        // Clear expanded selection and targeting mode after execution
        state.expandedAbility = null;
        state.targetingMode = null;
        return { state, executed: true };
    },

    // Execute currently expanded ability (main + power-ups)
    // Now enters targeting mode if multiple valid targets exist
    executeExpandedAbility(state, expanded) {
        if (!expanded) return { state, executed: false };
        
        // Enter targeting mode (will auto-execute if only one target)
        const updatedState = this.enterTargetingMode(state, expanded);
        return { state: updatedState, executed: updatedState.targetingMode === null }; // executed if auto-executed
    }
};

// Expose globally
window.CombatManager = CombatManager;


