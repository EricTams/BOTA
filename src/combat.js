// BOTA - Combat System
// Turn-based combat with status effects and ability execution

// AIDEV-NOTE: Combat State Manager
// Manages 1v1 captain duels with HP tracking, status effects, and turn management
// Integrated into dice test screen for testing

const Combat = {
    // Combat state
    state: {
        active: false,
        playerUnits: [], // Array of all player units (max 5)
        enemyUnits: [], // Array of all enemy units (max 5)
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
        
        this.state.active = false; // Set to false initially so addUnit skips rebuilds
        this.state.playerUnits = [];
        this.state.enemyUnits = [];
        this.state.currentTurn = 'player';
        this.state.turnNumber = 1;
        this.state.phase = 'roll';
        this.state.combatLog = [];
        
        // Initialize combat effects
        if (window.CombatEffects) {
            window.CombatEffects.init();
        }
        
        // Add captains using the unified addUnit method
        this.addUnit(playerCaptain, 'player', 'captain');
        this.addUnit(enemyCaptain, 'enemy', 'captain');
        
        // Add crew units if provided (using same method as edit mode)
        if (playerCrewData) {
            // Determine if it's a crew type or ship
            if (playerCrewData.shipId) {
                // It's a ship crew - find the ship data
                const shipData = getShipById(playerCrewData.shipId);
                if (shipData) {
                    this.addUnit(shipData, 'player', 'ship');
                }
            } else {
                // It's a crew type
                this.addUnit(playerCrewData, 'player', 'crew');
            }
        }
        if (enemyCrewData) {
            // Determine if it's a crew type or ship
            if (enemyCrewData.shipId) {
                // It's a ship crew - find the ship data
                const shipData = getShipById(enemyCrewData.shipId);
                if (shipData) {
                    this.addUnit(shipData, 'enemy', 'ship');
                }
            } else {
                // It's a crew type
                this.addUnit(enemyCrewData, 'enemy', 'crew');
            }
        }
        
        // Now mark combat as active (after all units are added)
        this.state.active = true;
        
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
        // AIDEV-NOTE: Make crew ID unique by including side and shipId (if present) to avoid conflicts
        // If shipId is present, include it to make each ship's crew unique
        let uniqueId = crewData.id;
        if (crewData.shipId) {
            uniqueId = `${crewData.id}_${crewData.shipId}`; // e.g., "crew_ship_oglodi_longboat"
        }
        return {
            id: `${side}_${uniqueId}`, // e.g., "player_crew" or "player_crew_ship_oglodi_longboat"
            name: crewData.name,
            side: side,
            hp: crewData.health || 50,
            maxHp: crewData.health || 50,
            armor: 0,
            statusEffects: [],
            dice: crewData.dice || [], // Ship equipment dice
            portrait: crewData.portrait || 'assets/characters/crew/generic_crew_portrait.png',
            shipId: crewData.shipId || null // Store ship reference if from ship
        };
    },

    // Add a unit to combat (unified method for all unit additions)
    addUnit(unitData, side, unitType) {
        // Don't rebuild dice pool during init (will be done after all units are added)
        const skipRebuild = !this.state.active;
        
        const units = side === 'player' ? this.state.playerUnits : this.state.enemyUnits;
        
        // Enforce maximum of 5 units per side
        if (units.length >= 5) {
            console.warn(`Cannot add unit: ${side} side already has 5 units`);
            return null;
        }
        
        let unit;
        if (unitType === 'captain') {
            // Get captain dice from dice_data.js
            const captainDice = getDiceForCaptain(unitData.id);
            const captainDiceIds = captainDice.map(d => d.id);
            const captainDataWithDice = {
                ...unitData,
                dice: captainDiceIds,
                hp: unitData.hp || 100,
                maxHp: unitData.maxHp || 100,
                portrait: unitData.image || unitData.portrait
            };
            unit = this.createUnit(captainDataWithDice, side);
            
            // Load portrait for this captain
            if (window.CombatUI && window.CombatUI.loadPortrait && captainDataWithDice.portrait) {
                window.CombatUI.loadPortrait(unit.id, captainDataWithDice.portrait);
            }
        } else if (unitType === 'crew') {
            // Get crew dice from dice_data.js
            const crewDice = getDiceForCrew(unitData.id);
            const crewDiceIds = crewDice.map(d => d.id);
            const crewDataWithDice = {
                id: unitData.id,
                name: unitData.name,
                health: unitData.health,
                dice: crewDiceIds,
                portrait: unitData.portrait || 'assets/characters/crew/generic_crew_portrait.png'
            };
            unit = this.createCrewUnit(crewDataWithDice, side);
            
            // Load portrait for crew unit (all crews use 'ship' ID and generic portrait)
            if (window.CombatUI && window.CombatUI.loadPortrait) {
                window.CombatUI.loadPortrait('ship', 'assets/characters/crew/generic_crew_portrait.png');
            }
        } else if (unitType === 'ship') {
            // Create crew unit from ship
            const genericCrew = getCrewById('crew');
            const shipDice = this.getShipDiceIds(unitData);
            const crewData = {
                id: 'crew',
                name: `Crew - ${unitData.name}`,
                health: genericCrew.health,
                dice: shipDice,
                shipId: unitData.id,
                portrait: 'assets/characters/crew/generic_crew_portrait.png'
            };
            unit = this.createCrewUnit(crewData, side);
            
            // Load portrait for ship crew (all ship crews use 'ship' ID and generic portrait)
            if (window.CombatUI && window.CombatUI.loadPortrait) {
                window.CombatUI.loadPortrait('ship', 'assets/characters/crew/generic_crew_portrait.png');
            }
        } else {
            console.error(`Unknown unit type: ${unitType}`);
            return null;
        }
        
        units.push(unit);
        
        // Rebuild dice pool (unless we're still initializing)
        if (!skipRebuild && window.DiceSystem && window.DiceSystem.rebuildDicePool) {
            window.DiceSystem.rebuildDicePool();
        }
        
        // Only log if combat is active (to avoid log spam during init)
        if (this.state.active) {
            this.addLog(`${unit.name} joined the ${side} side!`);
        }
        return unit;
    },

    // Remove a unit from combat
    removeUnit(unit) {
        if (!unit) return;
        
        const side = unit.side;
        const units = side === 'player' ? this.state.playerUnits : this.state.enemyUnits;
        
        // Find and remove unit
        const index = units.indexOf(unit);
        if (index >= 0) {
            units.splice(index, 1);
            
            // Clean up status effects
            if (unit.statusEffects) {
                unit.statusEffects = [];
            }
            
            // Rebuild dice pool
            if (window.DiceSystem && window.DiceSystem.rebuildDicePool) {
                window.DiceSystem.rebuildDicePool();
            }
            
            this.addLog(`${unit.name} left the battle!`);
        }
    },

    // Get dice IDs from ship's extraDice array
    getShipDiceIds(ship) {
        const diceIds = [];
        if (ship.extraDice && ship.extraDice.length > 0) {
            // Map ship ID to dice IDs (not per extraDice entry, but per ship)
            if (ship.id === 'ship_oglodi_longboat') {
                diceIds.push('oglodi_ram');
            } else if (ship.id === 'ship_artifact_skiff') {
                diceIds.push('arcane_staff');
                diceIds.push('crystal_array');
            } else {
                // Try to find dice by equipment name or create generic mapping
                // For other ships, we'll need to add their dice to dice_data.js
                console.warn(`No dice mapping found for ship: ${ship.id}`);
            }
        }
        return diceIds;
    },

    // Start a new turn
    startTurn() {
        const unit = this.getCurrentUnit();
        if (!unit) {
            console.error('Cannot start turn: no current unit found');
            return;
        }
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
        // Check if all player units are dead
        const playerAlive = this.state.playerUnits.some(u => u.hp > 0);
        const enemyAlive = this.state.enemyUnits.some(u => u.hp > 0);
        
        if (!playerAlive) {
            this.addLog(`Enemy wins!`);
            this.state.active = false;
            return true;
        }
        if (!enemyAlive) {
            this.addLog(`Player wins!`);
            this.state.active = false;
            return true;
        }
        return false;
    },

    // Get the unit whose turn it currently is
    getCurrentUnit() {
        const units = this.state.currentTurn === 'player' ? this.state.playerUnits : this.state.enemyUnits;
        return units.length > 0 ? units[0] : null;
    },

    // Get the opposing unit
    getOpponentUnit() {
        const units = this.state.currentTurn === 'player' ? this.state.enemyUnits : this.state.playerUnits;
        return units.length > 0 ? units[0] : null;
    },

    // Apply damage to a unit (accounting for armor)
    applyDamage(unit, amount, source = 'Attack', ability = null) {
        if (amount <= 0) return;
        
        // Check for defensive/reactive status effects BEFORE applying damage
        if (window.StatusEffects) {
            const triggers = window.StatusEffects.shouldTriggerDefensiveEffects(ability);
            
            // Check for evasion (dodge) - triggers on melee or ranged attacks
            if (triggers.shouldTriggerEvasion) {
                const evasionCheck = window.StatusEffects.checkEvasion(unit, ability);
                if (evasionCheck.dodged) {
                    this.addLog(`${unit.name} evaded the attack!`);
                    
                    // Trigger dodge effect
                    if (window.CombatEffects) {
                        const dodgeAbility = window.AbilityData && window.AbilityData.dodge;
                        window.CombatEffects.triggerDodge(unit, dodgeAbility);
                    }
                    
                    // Damage is completely avoided
                    return;
                }
            }
            
            // AIDEV-NOTE: Check for retribution - triggers on melee attacks only
            // Retribution abilities deal damage back when hit by melee attacks
            if (triggers.shouldTriggerCounter) {
                const retributionCheck = window.StatusEffects.checkRetribution(unit, ability);
                if (retributionCheck.hasRetribution && retributionCheck.damage > 0) {
                    const retributionAbility = retributionCheck.ability;
                    const retributionType = retributionCheck.retributionType;
                    const retributionDamage = retributionCheck.damage;
                    
                    // Determine targets based on retribution type
                    let targets = [];
                    
                    if (retributionType === 'aoe_melee') {
                        // AOE melee: hit all enemy melee units
                        if (unit.side === 'player') {
                            // Unit is player, so enemies are enemy units (captains are melee)
                            // AIDEV-NOTE: Crew are considered ranged, so they don't get hit by melee AOE
                            // For now, only captains are melee, so add first enemy unit (captain)
                            if (this.state.enemyUnits.length > 0) {
                                targets.push(this.state.enemyUnits[0]);
                            }
                        } else {
                            // Unit is enemy, so enemies are player units (captains are melee)
                            if (this.state.playerUnits.length > 0) {
                                targets.push(this.state.playerUnits[0]);
                            }
                        }
                        
                        if (targets.length > 0) {
                            this.addLog(`${unit.name}'s ${retributionAbility.displayName} strikes all enemy melee units!`);
                        }
                    } else if (retributionType === 'attacker') {
                        // Single target: hit only the attacker
                        const attacker = this.getOpponentOf(unit);
                        if (attacker) {
                            targets.push(attacker);
                            this.addLog(`${unit.name}'s ${retributionAbility.displayName} deals retribution damage to ${attacker.name}!`);
                        }
                    }
                    
                    // Apply retribution damage to all targets
                    for (const target of targets) {
                        let damage = retributionDamage;
                        
                        // Apply retribution damage directly (bypass defensive effects to avoid infinite loops)
                        // Retribution damage doesn't trigger other retributions or evasions
                        if (target.armor > 0) {
                            const absorbed = Math.min(target.armor, damage);
                            target.armor -= absorbed;
                            damage -= absorbed;
                        }
                        
                        if (damage > 0) {
                            target.hp = Math.max(0, target.hp - damage);
                            this.addLog(`${retributionAbility.displayName} dealt ${damage} damage to ${target.name}! (HP: ${target.hp}/${target.maxHp})`);
                            
                            // Trigger retribution effect
                            if (window.CombatEffects) {
                                window.CombatEffects.triggerDamage(target, damage, retributionAbility);
                            }
                        }
                    }
                }
            }
        }
        
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
            
            // Trigger damage effect
            if (window.CombatEffects) {
                window.CombatEffects.triggerDamage(unit, amount, ability);
            }
        }
    },
    
    // Get the opponent of a unit
    getOpponentOf(unit) {
        if (!unit) return null;
        
        if (unit.side === 'player') {
            // Return first enemy unit (captain)
            return this.state.enemyUnits.length > 0 ? this.state.enemyUnits[0] : null;
        } else {
            // Return first player unit (captain)
            return this.state.playerUnits.length > 0 ? this.state.playerUnits[0] : null;
        }
    },
    
    // Get all enemy units for a given unit
    getAllEnemyUnits(unit) {
        const enemies = [];
        if (!unit) return enemies;
        
        if (unit.side === 'player') {
            // Return all enemy units
            enemies.push(...this.state.enemyUnits);
        } else {
            // Return all player units
            enemies.push(...this.state.playerUnits);
        }
        
        return enemies;
    },
    
    // Apply chain damage - bounces between nearby enemy units (staged with visual effects)
    applyChainDamage(caster, initialTarget, damage, ability) {
        const chainAmount = ability.chainAmount || 1;
        const chainDelay = 350; // Delay between chain hops (milliseconds)
        
        // Verify initial target is an enemy
        if (!initialTarget || initialTarget.side === caster.side) {
            console.error(`Combat: Chain ability ${ability.displayName} - initial target is not an enemy! Caster: ${caster.name} (${caster.side}), Target: ${initialTarget ? initialTarget.name : 'null'} (${initialTarget ? initialTarget.side : 'null'})`);
            // Still apply damage to initial target if it exists
            if (initialTarget) {
                this.applyDamage(initialTarget, damage, ability.displayName, ability);
            }
            return;
        }
        
        const hitUnits = [initialTarget]; // Track which units have been hit
        
        // Hit the initial target immediately
        this.applyDamage(initialTarget, damage, ability.displayName, ability);
        
        // Get all enemy units (excluding caster's side)
        const allEnemies = this.getAllEnemyUnits(caster);
        
        // Verify all enemies are actually enemies
        const validEnemies = allEnemies.filter(enemy => enemy && enemy.side !== caster.side);
        if (validEnemies.length !== allEnemies.length) {
            console.warn(`Combat: Chain found ${allEnemies.length - validEnemies.length} invalid enemy units`);
        }
        
        // Chain to additional units with delays
        let delay = chainDelay;
        for (let i = 0; i < chainAmount && hitUnits.length < validEnemies.length; i++) {
            // Find enemies that haven't been hit yet
            const availableTargets = validEnemies.filter(enemy => !hitUnits.includes(enemy));
            
            if (availableTargets.length === 0) {
                // No more targets available
                break;
            }
            
            // Pick a random available target
            const nextTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];
            const previousTarget = hitUnits[hitUnits.length - 1];
            
            // Double-check next target is an enemy
            if (!nextTarget || nextTarget.side === caster.side) {
                console.error(`Combat: Chain selected invalid target! Caster: ${caster.name} (${caster.side}), NextTarget: ${nextTarget ? nextTarget.name : 'null'} (${nextTarget ? nextTarget.side : 'null'})`);
                break;
            }
            
            // Verify previous target is also an enemy (should always be true, but double-check)
            if (previousTarget && previousTarget.side === caster.side) {
                console.error(`Combat: Chain previous target is on caster's side! Caster: ${caster.name} (${caster.side}), PreviousTarget: ${previousTarget.name} (${previousTarget.side})`);
            }
            
            console.log(`Combat: Chain hop ${i + 1} - from ${previousTarget.name} (${previousTarget.side}, id: ${previousTarget.id}) to ${nextTarget.name} (${nextTarget.side}, id: ${nextTarget.id})`);
            
            hitUnits.push(nextTarget);
            
            // Schedule chain hop with delay
            setTimeout(() => {
                // Trigger chain visual effect (particles from previous to next)
                // AIDEV-NOTE: previousTarget and nextTarget should both be enemies
                if (window.CombatEffects) {
                    window.CombatEffects.triggerChain(previousTarget, nextTarget, ability);
                }
                
                // Apply damage to the chained target
                this.applyDamage(nextTarget, damage, `${ability.displayName} (chain)`, ability);
            }, delay);
            
            delay += chainDelay;
        }
        
        if (hitUnits.length > 1) {
            // Log after all chains complete
            setTimeout(() => {
                this.addLog(`${ability.displayName} chained to ${hitUnits.length} targets!`);
            }, delay);
        }
    },

    // Apply healing to a unit
    applyHealing(unit, amount, source = 'Heal', ability = null) {
        if (amount <= 0) return;
        
        const oldHp = unit.hp;
        unit.hp = Math.min(unit.maxHp, unit.hp + amount);
        const actualHealing = unit.hp - oldHp;
        
        if (actualHealing > 0) {
            this.addLog(`${source} restored ${actualHealing} HP to ${unit.name}! (HP: ${unit.hp}/${unit.maxHp})`);
            
            // Trigger heal effect
            if (window.CombatEffects) {
                window.CombatEffects.triggerHeal(unit, actualHealing, ability);
            }
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
                    // Check for chain AOE
                    if (ability.aoeType === 'chain' && ability.chainAmount > 0) {
                        this.applyChainDamage(caster, target, calc.result, ability);
                    } else {
                        this.applyDamage(target, calc.result, ability.displayName, ability);
                    }
                }
                break;

            case 'heal':
                if (calc.valueType === 'healing') {
                    this.applyHealing(target, calc.result, ability.displayName, ability);
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
                
                // AIDEV-NOTE: Berserker's Call applies both taunt and armor
                if (ability.icon === 'berserkers_call') {
                    // Apply taunt status effect
                    this.applyStatusEffect(caster, 'taunt', 0, buffDuration, false, ability.icon);
                    // Also add armor (using baseArmor and armorPerSlot)
                    if (calc.valueType === 'armor') {
                        this.addArmor(caster, calc.result, ability.displayName);
                    }
                }
                
                // Trigger effect for special buffs
                if (window.CombatEffects) {
                    window.CombatEffects.triggerEffect(caster, buffType, ability);
                }
                break;

            case 'debuff':
                // Apply debuff status effect
                const debuffDuration = ability.duration || 1;
                const debuffType = ability.icon || ability.displayName.toLowerCase().replace(/\s+/g, '_');
                this.applyStatusEffect(target, debuffType, 0, debuffDuration, false, ability.icon);
                
                // Trigger effect for special debuffs
                // AIDEV-NOTE: Ensure target is correct (should be enemy, not caster)
                if (window.CombatEffects) {
                    console.log(`Combat: Executing debuff ${ability.displayName} - caster: ${caster.name}, target: ${target.name}`);
                    window.CombatEffects.triggerEffect(target, debuffType, ability);
                }
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
        
        // Keep log size manageable
        if (this.state.combatLog.length > 50) {
            this.state.combatLog.shift();
        }
    },

    // Reset combat state
    reset() {
        this.state.active = false;
        this.state.playerUnits = [];
        this.state.enemyUnits = [];
        this.state.currentTurn = 'player';
        this.state.turnNumber = 0;
        this.state.phase = 'roll';
        this.state.combatLog = [];
        
        // Clear combat effects
        if (window.CombatEffects) {
            window.CombatEffects.clear();
        }
    }
};

