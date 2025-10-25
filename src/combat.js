// BOTA - Combat System
// Turn-based combat with status effects and ability execution

// AIDEV-NOTE: Combat State Manager
// Manages 1v1 captain duels with HP tracking, status effects, and turn management
// Integrated into dice test screen for testing

const Combat = {
    // Combat state
    state: {
        active: false,
        playerUnit: null,
        enemyUnit: null,
        playerCrew: null, // Crew member manning ship weapons
        enemyCrew: null, // Crew member manning ship weapons
        currentTurn: 'player', // 'player' or 'enemy'
        turnNumber: 0,
        phase: 'roll', // 'roll', 'execute', 'end_turn'
        combatLog: [] // Array of combat events for display
    },

    // Initialize by captain ids (no UI/bootstrap dependency)
    initByIds(playerCaptainId, enemyCaptainId) {
        const playerCaptain = getCaptainById(playerCaptainId);
        const enemyCaptain = getCaptainById(enemyCaptainId);
        const playerDice = getDiceForCaptain(playerCaptainId).map(d => d.id);
        const enemyDice = getDiceForCaptain(enemyCaptainId).map(d => d.id);
        const player = { id: playerCaptain.id, name: playerCaptain.name, hp: 100, maxHp: 100, portrait: `assets/characters/${playerCaptain.id}.png`, dice: playerDice };
        const enemy = { id: enemyCaptain.id, name: enemyCaptain.name, hp: 100, maxHp: 100, portrait: `assets/characters/${enemyCaptain.id}.png`, dice: enemyDice };
        this.init(player, enemy);
        this.startTurn();
    },

    // Initialize combat between two captains
    init(playerCaptain, enemyCaptain, playerCrewData = null, enemyCrewData = null) {
        console.log('Combat - Initializing 1v1 duel:', playerCaptain.name, 'vs', enemyCaptain.name);
        console.log('Combat - Player crew data:', playerCrewData);
        console.log('Combat - Enemy crew data:', enemyCrewData);
        
        this.state.active = true;
        this.state.playerUnit = this.createUnit(playerCaptain, 'player');
        this.state.enemyUnit = this.createUnit(enemyCaptain, 'enemy');
        
        // Create crew units if provided
        if (playerCrewData) {
            this.state.playerCrew = this.createCrewUnit(playerCrewData, 'player');
            console.log('Combat - Created player crew:', this.state.playerCrew);
        }
        if (enemyCrewData) {
            this.state.enemyCrew = this.createCrewUnit(enemyCrewData, 'enemy');
            console.log('Combat - Created enemy crew:', this.state.enemyCrew);
        }
        
        this.state.currentTurn = 'player';
        this.state.turnNumber = 1;
        this.state.phase = 'roll';
        this.state.combatLog = [];
        
        this.addLog(`Combat started: ${playerCaptain.name} vs ${enemyCaptain.name}!`);
    },

    // Create a combat unit from a captain
    createUnit(captain, side) {
        return {
            id: captain.id,
            name: captain.name,
            side: side, // 'player' or 'enemy'
            hp: captain.hp || 100,
            maxHp: captain.maxHp || 100,
            armor: 0, // Temporary armor that absorbs damage
            statusEffects: [], // Array of active status effects
            dice: captain.dice || [], // Array of die IDs this captain uses
            portrait: captain.portrait // Path to portrait image
        };
    },

    // Create a crew combat unit
    createCrewUnit(crewData, side) {
        return {
            id: crewData.id,
            name: crewData.name,
            side: side,
            hp: crewData.health || 50,
            maxHp: crewData.health || 50,
            armor: 0,
            statusEffects: [],
            dice: crewData.dice || [], // Ship equipment dice
            portrait: 'assets/characters/crew/generic_crew_portrait.png'
        };
    },

    // Start a new turn
    startTurn() {
        const unit = this.getCurrentUnit();
        this.addLog(`--- ${unit.name}'s Turn ${this.state.turnNumber} ---`);
        this.state.phase = 'roll';
        
        // Process start-of-turn effects
        this.processStartOfTurnEffects(unit);
    },

    // Process status effects at start of turn
    processStartOfTurnEffects(unit) {
        if (!unit.statusEffects || unit.statusEffects.length === 0) {
            return;
        }

        // Process each status effect
        for (let i = unit.statusEffects.length - 1; i >= 0; i--) {
            const effect = unit.statusEffects[i];
            
            switch (effect.type) {
                case 'bleed':
                    this.applyDamage(unit, effect.value, `Bleed`);
                    break;
                case 'poison':
                    const poisonDamage = effect.value * effect.stacks;
                    this.applyDamage(unit, poisonDamage, `Poison (${effect.stacks} stacks)`);
                    break;
                case 'regen':
                    this.applyHealing(unit, effect.value, `Regeneration`);
                    break;
            }
            
            // Reduce duration
            effect.duration--;
            if (effect.duration <= 0) {
                this.addLog(`${unit.name}'s ${effect.type} effect faded.`);
                unit.statusEffects.splice(i, 1);
            }
        }
    },

    // End current turn and switch to next player
    endTurn() {
        this.state.phase = 'end_turn';
        
        // Switch turns
        if (this.state.currentTurn === 'player') {
            this.state.currentTurn = 'enemy';
            // Switch DiceSystem to enemy's dice
            if (window.DiceSystem && window.DiceSystem.switchToEnemyTurn) {
                window.DiceSystem.switchToEnemyTurn();
            }
        } else {
            this.state.currentTurn = 'player';
            this.state.turnNumber++;
            // Switch DiceSystem to player's dice
            if (window.DiceSystem && window.DiceSystem.switchToPlayerTurn) {
                window.DiceSystem.switchToPlayerTurn();
            }
        }
        
        // Check for combat end
        if (this.checkCombatEnd()) {
            return;
        }
        
        // Start next turn
        this.startTurn();
    },

    // Check if combat has ended
    checkCombatEnd() {
        if (this.state.playerUnit.hp <= 0) {
            this.addLog(`${this.state.enemyUnit.name} wins!`);
            this.state.active = false;
            return true;
        }
        if (this.state.enemyUnit.hp <= 0) {
            this.addLog(`${this.state.playerUnit.name} wins!`);
            this.state.active = false;
            return true;
        }
        return false;
    },

    // Get the unit whose turn it currently is
    getCurrentUnit() {
        return this.state.currentTurn === 'player' ? this.state.playerUnit : this.state.enemyUnit;
    },

    // Get the opposing unit
    getOpponentUnit() {
        return this.state.currentTurn === 'player' ? this.state.enemyUnit : this.state.playerUnit;
    },

    // Apply damage to a unit (accounting for armor)
    applyDamage(unit, amount, source = 'Attack') {
        if (amount <= 0) return;
        
        // Armor absorbs damage first
        if (unit.armor > 0) {
            const absorbed = Math.min(unit.armor, amount);
            unit.armor -= absorbed;
            amount -= absorbed;
            
            if (absorbed > 0) {
                this.addLog(`${unit.name}'s armor absorbed ${absorbed} damage.`);
            }
        }
        
        // Apply remaining damage to HP
        if (amount > 0) {
            unit.hp = Math.max(0, unit.hp - amount);
            this.addLog(`${source} dealt ${amount} damage to ${unit.name}! (HP: ${unit.hp}/${unit.maxHp})`);
        }
    },

    // Apply healing to a unit
    applyHealing(unit, amount, source = 'Heal') {
        if (amount <= 0) return;
        
        const oldHp = unit.hp;
        unit.hp = Math.min(unit.maxHp, unit.hp + amount);
        const actualHealing = unit.hp - oldHp;
        
        if (actualHealing > 0) {
            this.addLog(`${source} restored ${actualHealing} HP to ${unit.name}! (HP: ${unit.hp}/${unit.maxHp})`);
        }
    },

    // Add armor (shield) to a unit
    addArmor(unit, amount, source = 'Shield') {
        if (amount <= 0) return;
        
        unit.armor += amount;
        this.addLog(`${source} granted ${amount} armor to ${unit.name}! (Armor: ${unit.armor})`);
    },

    // Apply a status effect to a unit
    applyStatusEffect(unit, effectType, value, duration, stacks = 1, icon = null) {
        // Check if effect already exists (for stackable effects like poison)
        const existingEffect = unit.statusEffects.find(e => e.type === effectType);
        
        if (existingEffect && effectType === 'poison') {
            // Stack poison
            existingEffect.stacks += stacks;
            existingEffect.duration = Math.max(existingEffect.duration, duration);
            this.addLog(`${unit.name}'s poison increased to ${existingEffect.stacks} stacks!`);
        } else if (existingEffect) {
            // Refresh duration for non-stackable effects
            existingEffect.duration = Math.max(existingEffect.duration, duration);
            existingEffect.value = Math.max(existingEffect.value, value);
            this.addLog(`${unit.name}'s ${effectType} effect refreshed!`);
        } else {
            // Add new effect
            unit.statusEffects.push({
                type: effectType,
                value: value,
                duration: duration,
                stacks: stacks,
                icon: icon // Store the ability icon name
            });
            this.addLog(`${unit.name} is afflicted with ${effectType}!`);
        }
    },

    // Execute an ability from a die face
    executeAbility(ability, caster, target, filledSlots = 0) {
        if (!ability) {
            console.error('Combat - No ability provided to executeAbility');
            return;
        }

        this.addLog(`${caster.name} uses ${ability.displayName}!`);

        // Calculate ability values
        const calc = calculateAbilityValue(ability, filledSlots);

        // Execute based on effect type
        switch (ability.effectType) {
            case 'damage':
            case 'instant':
                if (calc.valueType === 'damage') {
                    this.applyDamage(target, calc.result, ability.displayName);
                }
                break;

            case 'heal':
                if (calc.valueType === 'healing') {
                    this.applyHealing(caster, calc.result, ability.displayName);
                }
                break;

            case 'shield':
                if (calc.valueType === 'armor') {
                    this.addArmor(caster, calc.result, ability.displayName);
                }
                break;

            case 'dot':
                // Damage over time (bleed or poison)
                const dotDuration = ability.duration || 3;
                if (ability.stackable) {
                    this.applyStatusEffect(target, 'poison', calc.base, dotDuration, 1);
                } else {
                    this.applyStatusEffect(target, 'bleed', calc.result, dotDuration);
                }
                break;

            case 'hot':
                // Heal over time (regen)
                const hotDuration = ability.duration || 3;
                this.applyStatusEffect(caster, 'regen', calc.result, hotDuration);
                break;

            case 'buff':
                // Apply buff status effect (like dodge or counter helix)
                const buffDuration = ability.duration || 2;
                const buffValue = calc.result;
                const buffType = ability.icon || ability.displayName.toLowerCase().replace(/\s+/g, '_');
                this.applyStatusEffect(caster, buffType, buffValue, buffDuration, false, ability.icon);
                break;

            default:
                console.warn('Combat - Unknown effect type:', ability.effectType);
        }
    },

    // Add an entry to the combat log
    addLog(message) {
        this.state.combatLog.push({
            turn: this.state.turnNumber,
            message: message,
            timestamp: Date.now()
        });
        console.log(`[Combat Log] ${message}`);
        
        // Keep log size manageable
        if (this.state.combatLog.length > 50) {
            this.state.combatLog.shift();
        }
    },

    // Reset combat state
    reset() {
        this.state.active = false;
        this.state.playerUnit = null;
        this.state.enemyUnit = null;
        this.state.currentTurn = 'player';
        this.state.turnNumber = 0;
        this.state.phase = 'roll';
        this.state.combatLog = [];
    }
};

