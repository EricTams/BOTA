// ui_combat.js - Combat UI rendering (no logic)
// Responsibilities:
// - Draw unit panels, portraits, HP/armor bars, status effects
// - Draw rolling box area and delegate die rendering to DiceSystem/Die
// - Draw combat log, action buttons, modals, overlays, tooltips
// Not responsible for: combat logic/mutations (CombatManager), dice animation (Die),
// or orchestration (DiceSystem). Interaction handlers can compute hit targets but should
// leave state changes to the orchestrator.

const CombatUI = {
    // Layout constants
    layout: {
        unwrappedY: 100,
        unwrappedFaceSize: 60,
        unwrappedSpacing: 10,
        rollingBoxY: 250,
        rollingBoxWidth: 800,
        rollingBoxHeight: 280,
        dieSize: 60,
        dieSpacing: 50,
        dicePerRow: 6, // Support up to 12 dice in 2 rows
        rerollTrayY: 550,
        rerollTrayWidth: 300,
        rerollTrayHeight: 100,
        buttonY: 520,
        buttonWidth: 160,
        buttonHeight: 50
    },
    // Character portraits cache
    portraits: {},
    
    // Initialize combat UI
    init() {
        this.portraits = {};
    },

        // Expand ability panel for a die
        expandAbility(dieIndex) {
            // Map dice-system die index -> rolledDice array index
            const rolledIndex = (CombatManager.state.rolledDice || []).findIndex(rd => rd.dieIndex === dieIndex && !rd.assigned);
            if (rolledIndex < 0) return;
            const rolledDie = CombatManager.state.rolledDice[rolledIndex];
            if (!rolledDie || rolledDie.assigned) return; // Can't expand assigned dice
            CombatManager.openExpandedAbility(CombatManager.state, rolledIndex);
            // Mirror to DiceSystem UI state so renderer shows the panel
            if (window.DiceSystem && CombatManager.state.expandedAbility) {
                window.DiceSystem.state.expandedAbility = CombatManager.state.expandedAbility;
            }
            console.log(`Expanded ability: ${rolledDie.ability.displayName}`);
        },
        
        // Toggle a die as a power-up for the expanded ability
        togglePowerUpDie(dieIndex) {
            const expanded = CombatManager.state.expandedAbility;
            if (!expanded) return;
            // Map to rolledDice index
            const rolledIndex = (CombatManager.state.rolledDice || []).findIndex(rd => rd.dieIndex === dieIndex && !rd.assigned);
            if (rolledIndex < 0) return;
            // Can't use the main die as a power-up for itself
            if (rolledIndex === expanded.dieIndex) return;
            const rolledDie = CombatManager.state.rolledDice[rolledIndex];
            if (!rolledDie || rolledDie.assigned) return;
            // Delegate to manager for pure state update
            const before = expanded.powerUpDice.slice();
            CombatManager.togglePowerUpDie(CombatManager.state, rolledIndex);
            const after = CombatManager.state.expandedAbility.powerUpDice;
            if (after.length > before.length) {
                console.log(`Added die ${rolledIndex} to power-ups`);
            } else if (after.length < before.length) {
                console.log(`Removed die ${rolledIndex} from power-ups`);
            }
        },
        
        // Cancel the expanded ability
        cancelExpandedAbility() {
            CombatManager.cancelExpandedAbility(CombatManager.state);
            if (window.DiceSystem) {
                window.DiceSystem.state.expandedAbility = null;
            }
            console.log('Cancelled expanded ability');
        },

        // Execute expanded ability via manager and clear UI state
        executeExpandedAbility() {
            const result = CombatManager.executeExpandedAbility(CombatManager.state, CombatManager.state.expandedAbility);
            if (window.DiceSystem) {
                window.DiceSystem.state.expandedAbility = null;
            }
            if (result && result.executed) {
                console.log('Executed expanded ability');
            }
        },
        
        // Open reroll modal
        openRerollModal() {
            this.ui.rerollModal = {
                selectedDice: [], // Array of die indices to reroll
                checkboxBounds: [],
                bounds: null,
                cancelButton: null,
                confirmButton: null
            };
        },
        
        // Toggle die selection in reroll modal
        toggleRerollSelection(dieIndex) {
            const modal = this.ui.rerollModal;
            if (!modal) return;
            
            const idx = modal.selectedDice.indexOf(dieIndex);
            if (idx >= 0) {
                // Deselect
                modal.selectedDice.splice(idx, 1);
            } else {
                // Select
                modal.selectedDice.push(dieIndex);
            }
        },
        
        // Confirm and execute reroll
        confirmReroll() {
            const modal = this.ui.rerollModal;
            if (!modal || modal.selectedDice.length === 0) return;
            
            console.log('Confirming reroll for dice:', modal.selectedDice);
            
            // Reroll selected dice
            for (const dieIndex of modal.selectedDice) {
                const die = this.ui.dice[dieIndex];
                const state = this.ui.diceStates[dieIndex];
                
                // Choose random face
                const targetFace = Math.floor(Math.random() * 6);
                console.log(`Rerolling die ${dieIndex} to face ${targetFace}`);
                
                // Choose random rotation axis
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                state.rollAxis = [
                    Math.sin(phi) * Math.cos(theta),
                    Math.sin(phi) * Math.sin(theta),
                    Math.cos(phi)
                ];
                
                // Calculate target rotation to show the chosen face
                Die.setTargetRotationForFace(state, targetFace);
                
                // Set up animation state
                state.rolling = true;
                state.targetFace = targetFace;
                state.animationTime = 0.0; // Start at 0.0 (will increment to 0.7s)
            }
            
            // Wait for animation to complete, then update rolled dice pool
            // The populateRolledDicePool function will be called automatically when animation finishes
            // We just need to mark which dice were rerolled so we know to update them
            CombatManager.state.rerollingDice = modal.selectedDice;
            CombatManager.state.rerollsRemaining--;
            this.ui.rerollModal = null;
            
            console.log('Reroll animation started');
        },

        // Check if clicking on expanded ability panel buttons
    checkExpandedAbilityClick(mousePos, canvas) {
        const expanded = CombatManager.state.expandedAbility;
        if (!expanded) return false;
        
        const panelWidth = 500;
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = 480;
        const centerX = panelX + panelWidth / 2;
        
        // Check if clicking on power-up slots to remove them
        const maxSlots = expanded.ability.powerUpSlots || 0;
        const slotSize = 40;
        const slotSpacing = 10;
        const totalSlotsWidth = maxSlots * (slotSize + slotSpacing) - slotSpacing;
        const slotsX = centerX - totalSlotsWidth / 2;
        const slotsY = panelY + 120;
        
        for (let i = 0; i < expanded.powerUpDice.length; i++) {
            const x = slotsX + i * (slotSize + slotSpacing);
            
            if (mousePos.x >= x && mousePos.x <= x + slotSize &&
                mousePos.y >= slotsY && mousePos.y <= slotsY + slotSize) {
                // Remove this power-up die
                expanded.powerUpDice.splice(i, 1);
                console.log(`Removed power-up die at slot ${i}`);
                return true;
            }
        }
        
        // Check buttons using stored bounds (more robust after refactors)
        const ds = window.DiceSystem;
        const btns = ds && ds.state ? ds.state._expandedButtons : null;
        const buttonY = panelY + 210;
        const buttonWidth = 100;
        const buttonHeight = 35;
        const buttonSpacing = 15;
        const cancelX = centerX - buttonWidth * 1.5 - buttonSpacing;
        const executeX = centerX - buttonWidth / 2;

        const hit = (bounds) => bounds && mousePos.x >= bounds.x && mousePos.x <= bounds.x + bounds.width &&
                                 mousePos.y >= bounds.y && mousePos.y <= bounds.y + bounds.height;
        if (hit(btns?.cancel) || (mousePos.x >= cancelX && mousePos.x <= cancelX + buttonWidth &&
            mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight)) {
            this.cancelExpandedAbility();
            return true;
        }
        if (hit(btns?.execute) || (mousePos.x >= executeX && mousePos.x <= executeX + buttonWidth &&
            mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight)) {
            this.executeExpandedAbility();
            return true;
        }
        
        return false;
    },

    // Toggle die selection (old system - keeping for compatibility) in the pool
    toggleDieSelection(poolIndex) {
        CombatManager.toggleDieSelection(CombatManager.state, poolIndex);
    },

    // Assign a die to an ability slot
    assignDieToAbility(poolIndex, abilityKey) {
        CombatManager.assignDieToAbility(CombatManager.state, poolIndex, abilityKey);
        console.log(`Assigned die ${poolIndex} to ability ${abilityKey}`);
    },

    // Unassign a die from an ability
    unassignDieFromAbility(poolIndex, abilityKey) {
        CombatManager.unassignDieFromAbility(CombatManager.state, poolIndex, abilityKey);
        console.log(`Unassigned die ${poolIndex} from ability ${abilityKey}`);
    },

    // Handle mouse move
    onMouseMove(mousePos, canvas) {
        // Check for status effect hover (for tooltip) - check this FIRST
        this.checkStatusEffectHover(mousePos);
        
        // Check for face hover (for tooltip) - only if not hovering a status effect
        const tooltipState = window.DiceSystem?.state?.tooltip;
        if (!tooltipState || !tooltipState.visible || tooltipState.source !== 'status_effect') {
            this.updateTooltip(mousePos, canvas);
        }
        
        if (window.DiceSystem && window.DiceSystem.state) {
            window.DiceSystem.state.hoveredButton = null;
        }

        // Check combat button hovers if in combat mode
        if ((window.DiceSystem?.state?.combatMode) && Combat.state.active) {
            CombatUI.checkButtonHover(mousePos, canvas);
            
            // Update hover state for all unit "View Dice" buttons
            const playerUnit = Combat.state.playerUnit;
            if (playerUnit && playerUnit._viewDiceButton) {
                const b = playerUnit._viewDiceButton;
                b.hovered = Button.hitTest(mousePos, b);
            }
            
            const playerCrew = Combat.state.playerCrew;
            if (playerCrew && playerCrew._viewDiceButton) {
                const b = playerCrew._viewDiceButton;
                b.hovered = Button.hitTest(mousePos, b);
            }
            
            const enemyUnit = Combat.state.enemyUnit;
            if (enemyUnit && enemyUnit._viewDiceButton) {
                const b = enemyUnit._viewDiceButton;
                b.hovered = Button.hitTest(mousePos, b);
            }
            
            const enemyCrew = Combat.state.enemyCrew;
            if (enemyCrew && enemyCrew._viewDiceButton) {
                const b = enemyCrew._viewDiceButton;
                b.hovered = Button.hitTest(mousePos, b);
            }
            
            return; // Skip normal button checks in combat mode
        }
        
        // Check normal button hovers
        const centerX = canvas.width / 2;
        const buttonY = CombatUI.layout.buttonY;
        
        const rollButtonX = centerX + 50;
        const rerollButtonX = centerX + 50 + CombatUI.layout.buttonWidth + 20;
        
        if (mousePos.y >= buttonY && mousePos.y <= buttonY + CombatUI.layout.buttonHeight) {
            if (mousePos.x >= rollButtonX && mousePos.x <= rollButtonX + CombatUI.layout.buttonWidth) {
                if (window.DiceSystem?.state) window.DiceSystem.state.hoveredButton = 'roll';
            } else if (mousePos.x >= rerollButtonX && mousePos.x <= rerollButtonX + CombatUI.layout.buttonWidth) {
                if (window.DiceSystem?.state) window.DiceSystem.state.hoveredButton = 'reroll';
            }
        }
    },

    // Check if mouse is over a die in the pool
    checkDicePoolHover(mousePos, canvas) {
        const poolX = canvas.width / 2 - 200;
        const poolY = canvas.height - 250;
        const dieSize = 50;
        const dieSpacing = 10;
        const startX = poolX + 20;
        const startY = poolY + 55;
        
        // UI-only hover; not tracked anymore
        
        for (let i = 0; i < (CombatManager.state.rolledDice || []).length; i++) {
            const x = startX + i * (dieSize + dieSpacing);
            const y = startY;
            
            if (mousePos.x >= x && mousePos.x <= x + dieSize &&
                mousePos.y >= y && mousePos.y <= y + dieSize) {
                // no-op; tooltip handles display
                break;
            }
        }
    },

    // Check if clicking on a die in the rolling box
    checkRollingBoxClick(mousePos, canvas) {
        if ((CombatManager.state.rolledDice || []).length === 0) return null;
        
        const layout = CombatUI.layout;
        const centerX = canvas.width / 2;
        const boxY = layout.rollingBoxY;
        const numDice = (window.DiceSystem?.state?.dice || []).length;
        const dicePerRow = layout.dicePerRow;
        const rows = Math.ceil(numDice / dicePerRow);
        const diceInFirstRow = Math.min(numDice, dicePerRow);
        const diceInSecondRow = Math.max(0, numDice - dicePerRow);
        
        for (let i = 0; i < numDice; i++) {
            const state = window.DiceSystem.state.diceStates[i];
            if (state.rolling) continue; // Can't select while rolling
            
            // Calculate position using same logic as rendering
            const row = Math.floor(i / dicePerRow);
            const col = i % dicePerRow;
            const diceInThisRow = (row === 0) ? diceInFirstRow : diceInSecondRow;
            
            const rowWidth = diceInThisRow * layout.dieSize + (diceInThisRow - 1) * layout.dieSpacing;
            const rowStartX = centerX - rowWidth / 2 + layout.dieSize / 2;
            
            const dieX = rowStartX + col * (layout.dieSize + layout.dieSpacing);
            const rowSpacing = 120;
            const firstRowY = (rows === 1) ? boxY + layout.rollingBoxHeight / 2 : boxY + 90;
            const diceY = firstRowY + row * rowSpacing;
            
            // Check if mouse is within die bounds (use larger hitbox)
            const hitboxSize = layout.dieSize * 1.5; // Generous click area
            if (Math.abs(mousePos.x - dieX) <= hitboxSize / 2 &&
                Math.abs(mousePos.y - diceY) <= hitboxSize / 2) {
                return i; // Return the die index
            }
        }
        
        return null;
    },

    // Check if a button was clicked
    checkButtonClick(mousePos, canvas) {
        // Handle reroll modal clicks
        if (window.DiceSystem && window.DiceSystem.state && window.DiceSystem.state.rerollModal) {
            const modal = window.DiceSystem.state.rerollModal;
            
            // Check cancel button
            if (modal.cancelButton && 
                mousePos.x >= modal.cancelButton.x && mousePos.x <= modal.cancelButton.x + modal.cancelButton.width &&
                mousePos.y >= modal.cancelButton.y && mousePos.y <= modal.cancelButton.y + modal.cancelButton.height) {
                window.DiceSystem.state.rerollModal = null;
                return;
            }
            
            // Check confirm button
            if (modal.confirmButton && modal.selectedDice.length > 0 &&
                mousePos.x >= modal.confirmButton.x && mousePos.x <= modal.confirmButton.x + modal.confirmButton.width &&
                mousePos.y >= modal.confirmButton.y && mousePos.y <= modal.confirmButton.y + modal.confirmButton.height) {
                window.DiceSystem.confirmReroll();
                return;
            }
            
            // Check dice selection checkboxes
            if (modal.checkboxBounds) {
                for (const checkbox of modal.checkboxBounds) {
                    if (mousePos.x >= checkbox.x && mousePos.x <= checkbox.x + checkbox.width &&
                        mousePos.y >= checkbox.y && mousePos.y <= checkbox.y + checkbox.height) {
                        const idx = modal.selectedDice.indexOf(checkbox.dieIndex);
                        if (idx >= 0) modal.selectedDice.splice(idx, 1); else modal.selectedDice.push(checkbox.dieIndex);
                        return;
                    }
                }
            }
            
            return; // Don't process other clicks while modal is open
        }
        
        // Handle expanded unit panel clicks
        if (window.DiceSystem && window.DiceSystem.state && window.DiceSystem.state.expandedUnitPanel) {
            const expanded = window.DiceSystem.state.expandedUnitPanel;
            
            // Check if clicking inside the panel (do nothing, stay open)
            if (expanded.bounds &&
                mousePos.x >= expanded.bounds.x && mousePos.x <= expanded.bounds.x + expanded.bounds.width &&
                mousePos.y >= expanded.bounds.y && mousePos.y <= expanded.bounds.y + expanded.bounds.height) {
                return; // Click inside panel, don't close
            }
            
            // Check if clicking on the other unit's "View Dice" button (switch panels)
            const otherUnitId = expanded.unitId === 'player' ? 'enemy' : 'player';
            const otherUnit = otherUnitId === 'player' ? Combat.state.playerUnit : Combat.state.enemyUnit;
            if (otherUnit && otherUnit._viewDiceButton) {
                const btn = otherUnit._viewDiceButton;
                if (mousePos.x >= btn.x && mousePos.x <= btn.x + btn.width &&
                    mousePos.y >= btn.y && mousePos.y <= btn.y + btn.height) {
                    // Switch to other unit's panel
                    window.DiceSystem.state.expandedUnitPanel = { unitId: otherUnitId, faceBounds: [] };
                    return;
                }
            }
            
            // Clicked outside panel and not on another view dice button - close
            window.DiceSystem.state.expandedUnitPanel = null;
            return;
        }
        
        // Check for "View Dice" button clicks on unit panels
        if ((window.DiceSystem?.state?.combatMode) && Combat.state.active) {
            // Check player captain button
            const playerUnit = Combat.state.playerUnit;
            if (playerUnit && playerUnit._viewDiceButton) {
                const btn = playerUnit._viewDiceButton;
                if (mousePos.x >= btn.x && mousePos.x <= btn.x + btn.width &&
                    mousePos.y >= btn.y && mousePos.y <= btn.y + btn.height) {
                    window.DiceSystem.state.expandedUnitPanel = { unitId: 'player_captain', faceBounds: [] };
                    return;
                }
            }
            
            // Check player crew button
            const playerCrew = Combat.state.playerCrew;
            if (playerCrew && playerCrew._viewDiceButton) {
                const btn = playerCrew._viewDiceButton;
                if (mousePos.x >= btn.x && mousePos.x <= btn.x + btn.width &&
                    mousePos.y >= btn.y && mousePos.y <= btn.y + btn.height) {
                    window.DiceSystem.state.expandedUnitPanel = { unitId: 'player_crew', faceBounds: [] };
                    return;
                }
            }
            
            // Check enemy captain button
            const enemyUnit = Combat.state.enemyUnit;
            if (enemyUnit && enemyUnit._viewDiceButton) {
                const btn = enemyUnit._viewDiceButton;
                if (mousePos.x >= btn.x && mousePos.x <= btn.x + btn.width &&
                    mousePos.y >= btn.y && mousePos.y <= btn.y + btn.height) {
                    window.DiceSystem.state.expandedUnitPanel = { unitId: 'enemy_captain', faceBounds: [] };
                    return;
                }
            }
            
            // Check enemy crew button
            const enemyCrew = Combat.state.enemyCrew;
            if (enemyCrew && enemyCrew._viewDiceButton) {
                const btn = enemyCrew._viewDiceButton;
                if (mousePos.x >= btn.x && mousePos.x <= btn.x + btn.width &&
                    mousePos.y >= btn.y && mousePos.y <= btn.y + btn.height) {
                    window.DiceSystem.state.expandedUnitPanel = { unitId: 'enemy_crew', faceBounds: [] };
                    return;
                }
            }
        }
        
        // Handle combat button clicks if in combat mode
        if ((window.DiceSystem?.state?.combatMode) && Combat.state.active) {
            // Check if clicking on expanded ability panel buttons
            if (CombatManager.state.expandedAbility) {
                const panelClick = this.checkExpandedAbilityClick(mousePos, canvas);
                if (panelClick) return;
            }
            
            // Check if clicking on a die in the rolling box
            const rollingBoxDie = this.checkRollingBoxClick(mousePos, canvas);
            if (rollingBoxDie !== null) {
                // If no expanded panel, expand this die
                if (!CombatManager.state.expandedAbility) {
                    this.expandAbility(rollingBoxDie);
                } else {
                    // If panel is open, this die is a power-up candidate
                    this.togglePowerUpDie(rollingBoxDie);
                }
                return;
            }
            
            // Check combat action buttons via CombatUI
            const buttonClicked = CombatUI.checkCombatActionClick(mousePos, canvas);
            if (buttonClicked) return;
            
            return; // Skip normal button checks in combat mode
        }

        // Normal button clicks
        const centerX = canvas.width / 2;
        const buttonY = CombatUI.layout.buttonY;
        
        const rollButtonX = centerX + 50;
        const rerollButtonX = centerX + 50 + CombatUI.layout.buttonWidth + 20;
        
        // Roll button
        if (mousePos.x >= rollButtonX && mousePos.x <= rollButtonX + CombatUI.layout.buttonWidth &&
            mousePos.y >= buttonY && mousePos.y <= buttonY + CombatUI.layout.buttonHeight) {
            this.rollAllDice();
            return;
        }
        
        // Reroll button
        if (mousePos.x >= rerollButtonX && mousePos.x <= rerollButtonX + CombatUI.layout.buttonWidth &&
            mousePos.y >= buttonY && mousePos.y <= buttonY + CombatUI.layout.buttonHeight) {
            this.rerollSelected();
            return;
        }
    },

    // Check if a die in the pool was clicked, return poolIndex or null
    checkDicePoolClick(mousePos, canvas) {
        const poolX = canvas.width / 2 - 200;
        const poolY = canvas.height - 250;
        const dieSize = 50;
        const dieSpacing = 10;
        const startX = poolX + 20;
        const startY = poolY + 55;
        
        for (let i = 0; i < (CombatManager.state.rolledDice || []).length; i++) {
            const x = startX + i * (dieSize + dieSpacing);
            const y = startY;
            
            if (mousePos.x >= x && mousePos.x <= x + dieSize &&
                mousePos.y >= y && mousePos.y <= y + dieSize) {
                return i;
            }
        }
        
        return null;
    },

    // Check if mouse is hovering over a status effect
    checkStatusEffectHover(mousePos) {
        if (!Combat.state.active) return;
        
        // Check player unit status effects using CharacterPanel component
        const playerUnit = Combat.state.playerUnit;
        if (playerUnit && playerUnit.statusEffects) {
            const hoveredEffect = CharacterPanel.checkStatusEffectHover(playerUnit.statusEffects, mousePos);
            if (hoveredEffect) {
                this.showStatusEffectTooltip(hoveredEffect, mousePos.x, mousePos.y);
                return;
            }
        }
        
        // Check player crew status effects
        const playerCrew = Combat.state.playerCrew;
        if (playerCrew && playerCrew.statusEffects) {
            const hoveredEffect = CharacterPanel.checkStatusEffectHover(playerCrew.statusEffects, mousePos);
            if (hoveredEffect) {
                this.showStatusEffectTooltip(hoveredEffect, mousePos.x, mousePos.y);
                return;
            }
        }
        
        // Check enemy unit status effects using CharacterPanel component
        const enemyUnit = Combat.state.enemyUnit;
        if (enemyUnit && enemyUnit.statusEffects) {
            const hoveredEffect = CharacterPanel.checkStatusEffectHover(enemyUnit.statusEffects, mousePos);
            if (hoveredEffect) {
                this.showStatusEffectTooltip(hoveredEffect, mousePos.x, mousePos.y);
                return;
            }
        }
        
        // Check enemy crew status effects
        const enemyCrew = Combat.state.enemyCrew;
        if (enemyCrew && enemyCrew.statusEffects) {
            const hoveredEffect = CharacterPanel.checkStatusEffectHover(enemyCrew.statusEffects, mousePos);
            if (hoveredEffect) {
                this.showStatusEffectTooltip(hoveredEffect, mousePos.x, mousePos.y);
                return;
            }
        }
        
        // No status effect hovered, clear tooltip if it was showing a status effect
        const __ds = window.DiceSystem;
        if (__ds && __ds.state && __ds.state.tooltip && __ds.state.tooltip.source === 'status_effect') {
            __ds.state.tooltip.visible = false;
            __ds.state.tooltip.source = null;
        }
    },
    
    // Show tooltip for a status effect
    showStatusEffectTooltip(effect, x, y) {
        const ds = window.DiceSystem;
        if (!ds || !ds.state || !ds.state.tooltip) return;
        // Get ability data if we have an icon
        const abilityIcon = effect.icon || effect.type;
        const ability = getAbilityData(abilityIcon);
        
        if (ability) {
            // Calculate filled slots based on the effect value
            const filledSlots = 0; // Status effects show their final value already
            
            const t = ds.state.tooltip;
            t.visible = true;
            t.x = x;
            t.y = y;
            t.source = 'status_effect';
            t.abilityIcon = abilityIcon;
            t.filledSlots = Array(ability.powerUpSlots || 0).fill(false);
            t.dieIndex = -1; // Indicate this is not from a die
            t.faceIndex = -1;
        } else {
            // Fallback for status effects without ability data
            const t = ds.state.tooltip;
            t.visible = true;
            t.x = x;
            t.y = y;
            t.source = 'status_effect';
            t.abilityIcon = effect.type;
            t.filledSlots = [];
            t.dieIndex = -1;
            t.faceIndex = -1;
        }
    },
    
    // Updates tooltip state based on mouse position
    updateTooltip(mousePos, canvas) {
        const ds = window.DiceSystem;
        if (!ds || !ds.state || !ds.state.tooltip) return;
        const tooltip = ds.state.tooltip;
        tooltip.visible = false;
        tooltip.dieIndex = null;
        tooltip.faceIndex = null;
        tooltip.source = null;
        
        // Check expanded unit panel faces first (if expanded)
        if (window.DiceSystem && window.DiceSystem.state && window.DiceSystem.state.expandedUnitPanel && window.DiceSystem.state.expandedUnitPanel.faceBounds) {
            for (const faceBound of window.DiceSystem.state.expandedUnitPanel.faceBounds) {
                if (mousePos.x >= faceBound.x && mousePos.x <= faceBound.x + faceBound.width &&
                    mousePos.y >= faceBound.y && mousePos.y <= faceBound.y + faceBound.height) {
                    
                    // Get the die and face data
                    const die = DiceData[faceBound.diceName];
                    if (!die) continue;
                    
                    const face = die.faces[faceBound.faceIndex];
                    if (!face || !face.icon) continue;
                    
                    // Get ability data
                    const ability = getAbilityData(face.icon);
                    if (!ability) continue;
                    
                    // Show tooltip
                    tooltip.visible = true;
                    tooltip.dieIndex = faceBound.dieIndex; // Use the index within the expanded panel
                    tooltip.faceIndex = faceBound.faceIndex;
                    tooltip.x = mousePos.x;
                    tooltip.y = mousePos.y;
                    tooltip.source = 'expanded_unit_panel';
                    tooltip.filledSlots = Array(ability.powerUpSlots || 0).fill(false);
                    return;
                }
            }
        }
        
        // Prefer precise hit via Die.diePositions populated during rendering
        const posIdx = Die.isMouseOverAnyDie(mousePos, window.DiceSystem.state.diePositions);
        if (posIdx !== null) {
            const state = window.DiceSystem.state.diceStates[posIdx];
            tooltip.visible = true;
            tooltip.dieIndex = posIdx;
            tooltip.faceIndex = state.targetFace;
            tooltip.x = mousePos.x + 15;
            tooltip.y = mousePos.y + 15;
            tooltip.filledSlots = [];
        }
    },

    renderExpandedAbility(ctx, canvas) {
        const expanded = CombatManager.state.expandedAbility;
        if (!expanded) return;
        
        const panelWidth = 500;
        const panelHeight = 260; // Increased height to fit everything
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = 480; // Position below rolling box, above reroll tray
        
        // Draw semi-transparent backdrop over everything except the rolling box
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        
        // Darken top area (above rolling box)
        ctx.fillRect(0, 0, canvas.width, CombatUI.layout.rollingBoxY);
        
        // Darken bottom area (below rolling box)
        const rollingBoxBottom = CombatUI.layout.rollingBoxY + CombatUI.layout.rollingBoxHeight;
        ctx.fillRect(0, rollingBoxBottom, canvas.width, canvas.height - rollingBoxBottom);
        
        // Draw panel background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Draw panel border with glow
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 20;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        ctx.shadowBlur = 0;
        
        const centerX = panelX + panelWidth / 2;
        
        // Draw the main die's face icon - larger and not darkened
        const mainDie = CombatManager.state.rolledDice[expanded.dieIndex];
        if (mainDie && mainDie.face && mainDie.face.icon) {
            const iconSize = 70; // Slightly smaller to fit better
            const iconX = panelX + 15;
            const iconY = panelY + 15;
            
            // Draw the die face at full brightness
            const texture = this.faceTextures[expanded.dieIndex][mainDie.faceIndex];
            if (texture) {
                ctx.save();
                ctx.drawImage(texture, iconX, iconY, iconSize, iconSize);
                ctx.restore();
                
                // Draw border around it
                ctx.strokeStyle = '#00FFFF';
                ctx.lineWidth = 3;
                ctx.strokeRect(iconX, iconY, iconSize, iconSize);
            }
        }
        
        // Draw ability name (shifted right to make room for icon)
        ctx.fillStyle = '#00FFFF';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        const textX = panelX + 100;
        ctx.fillText(expanded.ability.displayName, textX, panelY + 40);
        
        // Draw calculated result with formula below ability name
        const filledSlots = expanded.powerUpDice.length;
        const formattedAbility = formatAbilityDescription(expanded.ability, filledSlots);
        
        ctx.fillStyle = '#FFFF88';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(formattedAbility.description, textX, panelY + 65);
        
        // Draw power-up slots
        const maxSlots = expanded.ability.powerUpSlots || 0;
        const slotSize = 40;
        const slotSpacing = 10;
        const totalSlotsWidth = maxSlots * (slotSize + slotSpacing) - slotSpacing;
        const slotsX = centerX - totalSlotsWidth / 2;
        const slotsY = panelY + 120;
        
        if (maxSlots > 0) {
            ctx.font = '12px Arial';
            ctx.fillStyle = '#AAAAAA';
            ctx.textAlign = 'center';
            ctx.fillText('Power-Up Slots:', centerX, slotsY - 5);
        }
        
        for (let i = 0; i < maxSlots; i++) {
            const x = slotsX + i * (slotSize + slotSpacing);
            const filled = i < filledSlots;
            const color = expanded.ability.powerUpColors && expanded.ability.powerUpColors[i];
            
            // Draw slot background
            if (filled) {
                ctx.fillStyle = this.colors[color + 'Light'] || this.colors[color] || '#666666';
            } else {
                ctx.fillStyle = '#2a2a2a';
            }
            ctx.fillRect(x, slotsY, slotSize, slotSize);
            
            // Draw slot border
            ctx.strokeStyle = filled ? '#FFD700' : '#444444';
            ctx.lineWidth = filled ? 3 : 2;
            ctx.strokeRect(x, slotsY, slotSize, slotSize);
            
            // Draw die face icon if filled
            if (filled && expanded.powerUpDice[i] !== undefined) {
                const powerUpDieIdx = expanded.powerUpDice[i];
                const powerUpDie = CombatManager.state.rolledDice[powerUpDieIdx];
                
                if (powerUpDie && powerUpDie.face && powerUpDie.face.icon) {
                    // Draw the icon from the face texture
                    const texture = this.faceTextures[powerUpDieIdx][powerUpDie.faceIndex];
                    if (texture) {
                        ctx.save();
                        // Scale down the texture to fit in the slot
                        ctx.drawImage(texture, x, slotsY, slotSize, slotSize);
                        ctx.restore();
                    }
                }
            }
        }
        
        // Draw instructions
        ctx.font = '14px Arial';
        ctx.fillStyle = '#CCCCCC';
        ctx.textAlign = 'center';
        ctx.fillText('Click other dice to add power-ups', centerX, panelY + 185);
        
        // Draw buttons
        const buttonY = panelY + 210;
        const buttonWidth = 100;
        const buttonHeight = 35;
        const buttonSpacing = 15;
        
        const cancelX = centerX - buttonWidth * 1.5 - buttonSpacing;
        const executeX = centerX - buttonWidth / 2;
        
        // Cancel button
        ctx.fillStyle = '#AA4444';
        ctx.fillRect(cancelX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#FF6666';
        ctx.lineWidth = 2;
        ctx.strokeRect(cancelX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Cancel', cancelX + buttonWidth / 2, buttonY + 23);
        
        // Execute button
        ctx.fillStyle = '#44AA44';
        ctx.fillRect(executeX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#66FF66';
        ctx.lineWidth = 2;
        ctx.strokeRect(executeX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Execute', executeX + buttonWidth / 2, buttonY + 23);

        // Store clickable bounds for panel buttons to ensure clicks are detected
        const ds = window.DiceSystem;
        if (ds && ds.state) {
            if (!ds.state._expandedButtons) ds.state._expandedButtons = {};
            ds.state._expandedButtons.cancel = { x: cancelX, y: buttonY, width: buttonWidth, height: buttonHeight };
            ds.state._expandedButtons.execute = { x: executeX, y: buttonY, width: buttonWidth, height: buttonHeight };
        }
        
        ctx.restore();
        ctx.textAlign = 'left'; // Reset
    },

    // Update animations
    update(deltaTime) {
        // Track if any dice just finished rolling
        let anyJustFinished = false;
        
        // Update each die's animation (UI-only state)
        for (let i = 0; i < this.ui.diceStates.length; i++) {
            const state = this.ui.diceStates[i];
            
            if (state.rolling) {
                state.animationTime += deltaTime;
                const t = state.animationTime;

                const animationDuration = 0.7; // Total animation time (playing backwards from 0.7s to 0.0s)
                
                if (t < animationDuration) {
                    // Calculate backwards time: we start at t=0.7 and move towards t=0.0
                    const backwardsTime = animationDuration - t;
                    const progress = backwardsTime / animationDuration; // 1.0 -> 0.0 as animation plays
                    
                    // Pop up and down (sine wave) - starts high, ends at ground
                    state.yOffset = -40 * Math.sin(progress * Math.PI);
                    
                    // Rotate around the random axis - unwind from spinning to final orientation
                    const angle = progress * Math.PI * 4; // Starts at 2 full rotations, ends at 0
                    Die.applyAxisRotation(state, state.rollAxis, angle, state.targetRotationX, state.targetRotationY, state.targetRotationZ);
                    
                    // On the very last frame before completion, snap to exact target to avoid any visual drift
                    if (t >= animationDuration - 0.016) { // Within one frame (60fps = ~16ms)
                        state.rotationX = state.targetRotationX;
                        state.rotationY = state.targetRotationY;
                        state.rotationZ = state.targetRotationZ;
                        state.yOffset = 0;
                        state.axisRotation = null; // Clear axis rotation
                    }
                    
                } else {
                    // Animation complete - lock to target orientation
                    state.rolling = false;
                    state.animationTime = 0;
                    state.rotationX = state.targetRotationX;
                    state.rotationY = state.targetRotationY;
                    state.rotationZ = state.targetRotationZ;
                    state.yOffset = 0;
                    state.axisRotation = null; // Clear axis rotation
                    state.currentFace = state.targetFace;
                    console.log(`Die landed on face ${state.targetFace}`);
                    anyJustFinished = true;
                }
            }
        }
        
        // Populate rolled dice pool when all dice finish rolling
        if (anyJustFinished && !this.isAnyRolling()) {
            CombatManager.populateRolledDicePool(CombatManager.state, this.ui.dice, this.ui.diceStates, CombatManager.state.rerollingDice || null);
            CombatManager.state.rerollingDice = null;
        }
    },

    // Render dice test screen
    render(ctx, canvas) {
        // Non-combat test screen basic UI drawing moved to CombatUI
        // Draw background/title/unwrapped/tray/buttons in one place
        if (!this.ui.combatMode || !Combat.state.active) {
            CombatUI.renderTestScreen(ctx, canvas);
        }

        // Draw combat UI if in combat mode
        if (this.ui.combatMode && Combat.state.active) {
            CombatUI.render(ctx, canvas);
        }

        // Draw dragged die if any
        if (this.ui.draggedDieIndex !== null) {
            CombatUI.renderDraggedDie(ctx);
        }

        // Draw combat UI if in combat mode
        if (this.ui.combatMode && Combat.state.active) {
            CombatUI.render(ctx, canvas);
        } else {
            // Non-combat test mode - render reroll tray and buttons via CombatUI
            CombatUI.renderRerollTray(ctx, canvas);
            CombatUI.renderTestButtons(ctx, canvas);
        }
        
        // Draw darkening overlay if a unit panel is expanded (under other panels)
        if (this.ui.expandedUnitPanel) {
            CombatUI.renderExpandedUnitOverlay(ctx, canvas);
        }
        
        // Draw reroll modal if open
        if (this.ui.rerollModal) {
            CombatUI.renderRerollModal(ctx, canvas);
        }
        
        // Draw expanded ability panel (must be on top of combat UI)
        if (this.ui.expandedAbility) {
            CombatUI.renderExpandedAbility(ctx, canvas);
        }
        
        // Draw tooltip LAST to appear on top of everything (including combat UI and expanded panel)
        if (!this.ui.expandedAbility && !this.ui.rerollModal) {
            // Only show tooltips when no expanded panels
            CombatUI.renderTooltip(ctx, canvas);
        }
    },

    // Render unwrapped dice (delegates to Die)
    renderUnwrappedDice(ctx, canvas) {
        Die.renderUnwrappedDice(ctx, canvas, this.ui.dice, this.ui.diceStates, this.layout, this.colors);
    },

    // (moved to CombatUI) renderRerollTray, renderButtons

    // Draw a single die face (delegate)
    drawDieFace(ctx, face, x, y, size, isSmall) {
        Die.drawDieFace(ctx, face, x, y, size, isSmall, this.colors);
    },

    // Draw a die as a 3D cube (delegate)
    drawPerspectiveDie(ctx, die, x, y, size, state, dieIdx) {
        if (!this.ui.diePositions) this.ui.diePositions = [];
        Die.drawPerspectiveDie(ctx, die, x, y, size, state, dieIdx, {
            faceTextures: this.faceTextures,
            diceStates: this.ui.diceStates,
            diePositions: this.ui.diePositions
        });
    },

    // drawCube3D now handled in Die module

    // drawTexturedQuad now handled in Die module

    // drawTexturedTriangle now handled in Die module

    // Draw dragged die
    renderDraggedDie(ctx) {
        const dieIdx = this.ui.draggedDieIndex;
        const die = this.ui.dice[dieIdx];
        const state = this.ui.diceStates[dieIdx];
        const mousePos = Input.getMousePosition();
        
        if (mousePos) {
            const x = mousePos.x + this.ui.dragOffset.x;
            const y = mousePos.y + this.ui.dragOffset.y;
            
            ctx.save();
            ctx.globalAlpha = 0.7;
            this.drawPerspectiveDie(ctx, die, x, y, CombatUI.layout.dieSize, state, dieIdx);
            ctx.restore();
        }
    },

    // Draw an icon (vector art) - delegates to DiceIcons module
    drawIcon(ctx, iconName, x, y, size) {
        DiceIcons.drawIcon(ctx, iconName, x, y, size);
    },
    
    // Load a character portrait image
    loadPortrait(captainId, imagePath) {
        const img = new Image();
        img.onload = () => {
            this.portraits[captainId] = img;
            console.log('CombatUI - Loaded portrait for', captainId);
        };
        img.onerror = () => {
            console.warn('CombatUI - Failed to load portrait:', imagePath);
        };
        img.src = imagePath;
    },
    
    // Main render function for combat UI
    render(ctx, canvas) {
        if (!Combat.state.active) return;
        
        // DEBUG: Log crew state
        if (Combat.state.playerCrew) {
            console.log('CombatUI.render - Player crew exists:', Combat.state.playerCrew.name);
        } else {
            console.log('CombatUI.render - NO PLAYER CREW!');
        }
        if (Combat.state.enemyCrew) {
            console.log('CombatUI.render - Enemy crew exists:', Combat.state.enemyCrew.name);
        } else {
            console.log('CombatUI.render - NO ENEMY CREW!');
        }
        
        // Clear background to avoid ghosting from previous frame
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // If expanded unit panel is open, darken the background UNDER all panels/UI
        if (window.DiceSystem && window.DiceSystem.state.expandedUnitPanel) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
        
        // Render captain panels (top)
        this.renderUnitInfo(ctx, Combat.state.playerUnit, 20, 20, true);
        this.renderUnitInfo(ctx, Combat.state.enemyUnit, canvas.width - 260, 20, false);
        
        // Render crew panels (below captains)
        if (Combat.state.playerCrew) {
            console.log('CombatUI.render - Rendering player crew at 20, 180');
            this.renderUnitInfo(ctx, Combat.state.playerCrew, 20, 180, true);
        }
        if (Combat.state.enemyCrew) {
            console.log('CombatUI.render - Rendering enemy crew at', canvas.width - 260, ', 180');
            this.renderUnitInfo(ctx, Combat.state.enemyCrew, canvas.width - 260, 180, false);
        }
        
        this.renderTurnInfo(ctx, canvas);
        this.renderRollingBox(ctx, canvas);
        this.renderCombatLog(ctx, canvas);
        this.renderCombatButtons(ctx, canvas);
    },
    
    // Render the rolling box with 3D dice (delegates actual dice rendering to DiceSystem)
    renderRollingBox(ctx, canvas) {
        if (!window.DiceSystem) return;
        
        const layout = CombatUI.layout;
        const centerX = canvas.width / 2;
        const boxX = centerX - layout.rollingBoxWidth / 2;
        const boxY = layout.rollingBoxY;

        // Draw box background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(boxX, boxY, layout.rollingBoxWidth, layout.rollingBoxHeight);
        
        // Draw box border
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, layout.rollingBoxWidth, layout.rollingBoxHeight);

        // Draw label
        ctx.fillStyle = '#999999';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dice roll around a random axis through their center', centerX, boxY - 8);
        ctx.textAlign = 'left';

        // Draw dice in a grid (up to 2 rows) - delegate to DiceSystem for actual 3D rendering
        const testState = window.DiceSystem.state;
        const numDice = testState.dice.length;
        const dicePerRow = layout.dicePerRow;
        const rows = Math.ceil(numDice / dicePerRow);
        
        // Calculate grid dimensions
        const diceInFirstRow = Math.min(numDice, dicePerRow);
        const diceInSecondRow = Math.max(0, numDice - dicePerRow);
        
        for (let i = 0; i < numDice; i++) {
            const die = testState.dice[i];
            const state = testState.diceStates[i];
            
            // Determine which row and column
            const row = Math.floor(i / dicePerRow);
            const col = i % dicePerRow;
            const diceInThisRow = (row === 0) ? diceInFirstRow : diceInSecondRow;
            
            // Center each row independently
            const rowWidth = diceInThisRow * layout.dieSize + (diceInThisRow - 1) * layout.dieSpacing;
            const rowStartX = centerX - rowWidth / 2 + layout.dieSize / 2;
            
            // Calculate position
            const dieX = rowStartX + col * (layout.dieSize + layout.dieSpacing);
            const rowSpacing = 120; // Space between rows
            const firstRowY = (rows === 1) ? boxY + layout.rollingBoxHeight / 2 : boxY + 90;
            const diceY = firstRowY + row * rowSpacing;
            
            // Check if this die is part of the expanded ability
            const rolledDie = (window.CombatManager?.state?.rolledDice || []).find(rd => rd.dieIndex === i);
            const expanded = testState.expandedAbility;
            const isMainDie = expanded && i === expanded.dieIndex;
            const isPowerUpDie = expanded && expanded.powerUpDice.includes(i);
            const isAssigned = rolledDie && rolledDie.assigned;
            const notRolledYet = (window.CombatManager?.state?.rolledDice || []).length === 0; // No dice rolled this turn
            
            // Main die or power-up dice should have borders
            if (isMainDie) {
                ctx.save();
                const borderSize = layout.dieSize * 1.4;
                
                // Main die: bright cyan border with strong glow - VERY distinct
                ctx.strokeStyle = '#00FFFF';
                ctx.lineWidth = 6;
                ctx.shadowColor = '#00FFFF';
                ctx.shadowBlur = 20;
                
                ctx.strokeRect(dieX - borderSize / 2, diceY - borderSize / 2, borderSize, borderSize);
                
                // Add second inner border for extra emphasis
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 0;
                const innerBorder = layout.dieSize * 1.2;
                ctx.strokeRect(dieX - innerBorder / 2, diceY - innerBorder / 2, innerBorder, innerBorder);
                
                ctx.restore();
            } else if (isPowerUpDie) {
                ctx.save();
                const borderSize = layout.dieSize * 1.4;
                
                // Power-up die: gold border with strong glow (matching main die emphasis)
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 6;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 20;
                
                ctx.strokeRect(dieX - borderSize / 2, diceY - borderSize / 2, borderSize, borderSize);
                
                // Add second inner border for extra emphasis
                ctx.strokeStyle = '#FFFF00'; // Bright yellow inner
                ctx.lineWidth = 2;
                ctx.shadowBlur = 0;
                const innerBorder = layout.dieSize * 1.2;
                ctx.strokeRect(dieX - innerBorder / 2, diceY - innerBorder / 2, innerBorder, innerBorder);
                
                ctx.restore();
            } else if (isAssigned) {
                ctx.save();
                const borderSize = layout.dieSize * 1.3;
                
                // Assigned die: dark gray border
                ctx.strokeStyle = '#444444';
                ctx.lineWidth = 3;
                
                ctx.strokeRect(dieX - borderSize / 2, diceY - borderSize / 2, borderSize, borderSize);
                ctx.restore();
            }
            
            // Darken main die (currently being used), assigned dice, OR not rolled yet
            if ((isMainDie || isAssigned || notRolledYet) && !isPowerUpDie) {
                ctx.save();
                ctx.filter = 'brightness(0.4) saturate(0.3)';
            }
            
            // Delegate to DiceSystem for actual 3D die rendering
            window.DiceSystem.drawPerspectiveDie(ctx, die, dieX, diceY + state.yOffset, 
                                    layout.dieSize, state, i);
            
            if ((isMainDie || isAssigned || notRolledYet) && !isPowerUpDie) {
                ctx.restore();
            }
        }
    },
    
    // Render reroll tray (for non-combat dice test mode)
    renderRerollTray(ctx, canvas) {
        if (!window.DiceSystem) return;
        
        const layout = CombatUI.layout;
        const testState = window.DiceSystem.state;
        const centerX = canvas.width / 2;
        const trayX = centerX - layout.rollingBoxWidth / 2;
        const trayY = layout.rerollTrayY;

        // Draw tray background
        ctx.fillStyle = '#3a3a2a';
        ctx.fillRect(trayX, trayY, layout.rerollTrayWidth, layout.rerollTrayHeight);
        
        // Draw tray border
        ctx.strokeStyle = '#777755';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(trayX, trayY, layout.rerollTrayWidth, layout.rerollTrayHeight);
        ctx.setLineDash([]);

        // Draw label
        ctx.fillStyle = '#999977';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Reroll Tray', trayX + layout.rerollTrayWidth / 2, trayY - 8);
        ctx.textAlign = 'left';

        // Draw dice in tray (small) - delegate to DiceSystem for 3D rendering
        const trayDiceSize = 50;
        const trayDiceSpacing = 60;
        for (let i = 0; i < testState.rerollTray.length; i++) {
            const dieIdx = testState.rerollTray[i];
            const die = testState.dice[dieIdx];
            const state = testState.diceStates[dieIdx];
            const x = trayX + 30 + i * trayDiceSpacing;
            const y = trayY + layout.rerollTrayHeight / 2;
            
            window.DiceSystem.drawPerspectiveDie(ctx, die, x, y, trayDiceSize, state, dieIdx);
        }
    },
    
    // Render test mode buttons (non-combat)
    renderTestButtons(ctx, canvas) {
        if (!window.DiceSystem) return;
        
        const layout = CombatUI.layout;
        const testState = window.DiceSystem.state;
        const centerX = canvas.width / 2;
        const buttonY = layout.buttonY;

        // Roll button
        const rollButtonX = centerX + 50;
        const rollEnabled = !window.DiceSystem.isAnyRolling();
        const rollHovered = testState.hoveredButton === 'roll';
        
        Button.draw(ctx, rollButtonX, buttonY, layout.buttonWidth, 
                   layout.buttonHeight, 'Roll Dice', rollEnabled, rollHovered);

        // Reroll button
        const rerollButtonX = centerX + 50 + layout.buttonWidth + 20;
        const rerollEnabled = testState.rerollTray.length > 0 && 
                             testState.rollsAvailable > 0 && 
                             !window.DiceSystem.isAnyRolling();
        const rerollHovered = testState.hoveredButton === 'reroll';
        
        Button.draw(ctx, rerollButtonX, buttonY, layout.buttonWidth,
                   layout.buttonHeight, 'Reroll Selected', rerollEnabled, rerollHovered);
    },
    
    // Render darkening overlay and expanded unit panel with unwrapped dice
    renderExpandedUnitOverlay(ctx, canvas) {
        if (!window.DiceSystem) return;
        
        const testState = window.DiceSystem.state;
        const layout = CombatUI.layout;
        const expanded = testState.expandedUnitPanel;
        if (!expanded) return;
        
        // Map unitId to the correct unit
        let unit;
        let isPlayer;
        switch (expanded.unitId) {
            case 'player_captain':
                unit = Combat.state.playerUnit;
                isPlayer = true;
                break;
            case 'player_crew':
                unit = Combat.state.playerCrew;
                isPlayer = true;
                break;
            case 'enemy_captain':
                unit = Combat.state.enemyUnit;
                isPlayer = false;
                break;
            case 'enemy_crew':
                unit = Combat.state.enemyCrew;
                isPlayer = false;
                break;
            // Legacy support for old unitId format
            case 'player':
                unit = Combat.state.playerUnit;
                isPlayer = true;
                break;
            case 'enemy':
                unit = Combat.state.enemyUnit;
                isPlayer = false;
                break;
            default:
                console.warn('Unknown unitId:', expanded.unitId);
                return;
        }
        
        if (!unit) return;
        
        // Use dice stored in the unit (from Combat.createUnit)
        const diceNames = unit.dice;
        if (!diceNames || diceNames.length === 0) {
            console.warn('No dice found for unit:', unit.id);
            return;
        }
        
        // Full screen darkening overlay for modal effect
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        // Draw the expanded panel background
        const panelWidth = 700;
        const panelHeight = 400;
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = (canvas.height - panelHeight) / 2;
        
        // Store panel bounds for click detection
        expanded.bounds = { x: panelX, y: panelY, width: panelWidth, height: panelHeight };
        
        // Panel background
        ctx.fillStyle = 'rgba(20, 20, 20, 0.95)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Panel border with glow
        ctx.save();
        ctx.strokeStyle = isPlayer ? '#44CCFF' : '#FF8844';
        ctx.lineWidth = 3;
        ctx.shadowColor = isPlayer ? '#44CCFF' : '#FF8844';
        ctx.shadowBlur = 15;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        ctx.shadowBlur = 0;
        ctx.restore();
        
        // Panel title
        ctx.fillStyle = isPlayer ? '#44CCFF' : '#FF8844';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${unit.name}'s Dice`, panelX + panelWidth / 2, panelY + 35);
        ctx.textAlign = 'left';
        
        // Draw unwrapped dice
        const diceStartY = panelY + 60;
        const faceSize = 60;
        const faceSpacing = 10;
        
        diceNames.forEach((diceName, dieIdx) => {
            const die = DiceData[diceName];
            if (!die) {
                console.warn('Die not found in DiceData:', diceName);
                return;
            }
            
            const dieY = diceStartY + dieIdx * (faceSize + 50);
            
            // Die name
            ctx.fillStyle = '#CCCCCC';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(die.name, panelX + 20, dieY - 5);
            
            // Draw all 6 faces in a row
            const totalWidth = 6 * faceSize + 5 * faceSpacing;
            const facesStartX = panelX + (panelWidth - totalWidth) / 2;
            
            for (let faceIdx = 0; faceIdx < die.faces.length; faceIdx++) {
                const face = die.faces[faceIdx];
                const faceX = facesStartX + faceIdx * (faceSize + faceSpacing);
                
                // Store face bounds for hover detection
                if (!expanded.faceBounds) expanded.faceBounds = [];
                expanded.faceBounds.push({
                    x: faceX,
                    y: dieY,
                    width: faceSize,
                    height: faceSize,
                    dieIndex: dieIdx,
                    faceIndex: faceIdx,
                    diceName: diceName
                });
                
                // Delegate to DiceSystem for drawing the die face
                window.DiceSystem.drawDieFace(ctx, face, faceX, dieY, faceSize, false);
            }
        });
        
        // "Close" instruction
        ctx.fillStyle = '#999999';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click outside to close', panelX + panelWidth / 2, panelY + panelHeight - 15);
        ctx.textAlign = 'left';
    },

    // Render the entire test screen (non-combat): background, title, unwrapped, tray, buttons
    renderTestScreen(ctx, canvas) {
        if (!window.DiceSystem) return;
        const DS = window.DiceSystem;
        // Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dice Test - Axe', canvas.width / 2, 50);
        ctx.textAlign = 'left';
        // Unwrapped dice via Die
        Die.renderUnwrappedDice(ctx, canvas, DS.state.dice, DS.state.diceStates, DS.layout, DS.colors);
        // Reroll tray and test buttons
        this.renderRerollTray(ctx, canvas);
        this.renderTestButtons(ctx, canvas);
    },

    // Draw dragged die overlay (if any)
    renderDraggedDie(ctx) {
        if (!window.DiceSystem) return;
        const DS = window.DiceSystem;
        const dieIdx = DS.state.draggedDieIndex;
        if (dieIdx === null || dieIdx === undefined) return;
        const die = DS.state.dice[dieIdx];
        const state = DS.state.diceStates[dieIdx];
        const mousePos = Input.getMousePosition();
        if (!mousePos) return;
        const x = mousePos.x + DS.state.dragOffset.x;
        const y = mousePos.y + DS.state.dragOffset.y;
        ctx.save();
        ctx.globalAlpha = 0.7;
        DS.drawPerspectiveDie(ctx, die, x, y, DS.layout.dieSize, state, dieIdx);
        ctx.restore();
    },

    // Tooltip renderer (topmost)
    renderTooltip(ctx, canvas) {
        if (!window.DiceSystem) return;
        const DS = window.DiceSystem;
        const tooltip = DS.state.tooltip;
        if (!tooltip || !tooltip.visible) return;
        let ability;
        let face;
        if (tooltip.source === 'status_effect') {
            ability = getAbilityData(tooltip.abilityIcon);
            if (!ability) return;
        } else if (tooltip.source === 'expanded_unit_panel') {
            if (DS.state.expandedUnitPanel && DS.state.expandedUnitPanel.faceBounds) {
                const fb = DS.state.expandedUnitPanel.faceBounds.find(b => b.dieIndex === tooltip.dieIndex && b.faceIndex === tooltip.faceIndex);
                if (fb) {
                    const die = DiceData[fb.diceName];
                    if (die) {
                        face = die.faces[tooltip.faceIndex];
                        if (face && face.icon) ability = getAbilityData(face.icon);
                    }
                }
            }
            if (!ability) return;
        } else {
            if (tooltip.dieIndex === null || tooltip.dieIndex < 0) return;
            const die = DS.state.dice[tooltip.dieIndex];
            face = die.faces[tooltip.faceIndex];
            if (!face.icon) return;
            ability = getAbilityData(face.icon);
            if (!ability) return;
        }
        const filledCount = tooltip.filledSlots.filter(f => f).length;
        const formatted = formatAbilityDescription(ability, filledCount);
        const calc = formatted.calculation;
        ctx.font = 'bold 16px Arial';
        const titleWidth = ctx.measureText(ability.displayName).width;
        ctx.font = '14px Arial';
        const descWidth = ctx.measureText(formatted.description).width;
        const formulaText = calc.hasSlots ? `${calc.formula} = ${calc.result} ${calc.valueType}` : `${calc.result} ${calc.valueType}`;
        const formulaWidth = ctx.measureText(formulaText).width;
        const tooltipWidth = Math.max(titleWidth, descWidth, formulaWidth, 200) + 40;
        const slotRowHeight = ability.powerUpSlots > 0 ? 30 : 0;
        const tooltipHeight = 100 + slotRowHeight;
        let x = tooltip.x, y = tooltip.y;
        if (x + tooltipWidth > canvas.width) x = canvas.width - tooltipWidth - 10;
        if (y + tooltipHeight > canvas.height) y = canvas.height - tooltipHeight - 10;
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, tooltipWidth, tooltipHeight);
        ctx.strokeRect(x, y, tooltipWidth, tooltipHeight);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(ability.displayName, x + 20, y + 25);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.fillText(formatted.description, x + 20, y + 50);
        ctx.fillStyle = '#AAFFAA';
        ctx.fillText(formulaText, x + 20, y + 70);
        if (ability.powerUpSlots > 0) {
            ctx.fillStyle = '#CCCCCC';
            ctx.font = '12px Arial';
            ctx.fillText(`Power-up slots (X = ${filledCount}):`, x + 20, y + 90);
            const slotSize = 20, slotSpacing = 5;
            for (let i = 0; i < ability.powerUpSlots; i++) {
                const sx = x + 20 + i * (slotSize + slotSpacing);
                const sy = y + 95;
                const slotColor = ability.powerUpColors[i];
                const isFilled = tooltip.filledSlots[i] === true;
                ctx.strokeStyle = DS.colors[slotColor] || '#888888';
                ctx.lineWidth = 2;
                ctx.strokeRect(sx, sy, slotSize, slotSize);
                if (isFilled) {
                    ctx.fillStyle = DS.colors[slotColor] || '#888888';
                    ctx.fillRect(sx + 2, sy + 2, slotSize - 4, slotSize - 4);
                } else {
                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.fillRect(sx + 2, sy + 2, slotSize - 4, slotSize - 4);
                }
            }
        }
    },

    // Reroll modal
    renderRerollModal(ctx, canvas) {
        if (!window.DiceSystem) return;
        const DS = window.DiceSystem;
        const modal = DS.state.rerollModal;
        if (!modal) return;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const panelWidth = 600, panelHeight = 450;
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = (canvas.height - panelHeight) / 2;
        modal.bounds = { x: panelX, y: panelY, width: panelWidth, height: panelHeight };
        ctx.fillStyle = 'rgba(20,20,20,0.95)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        ctx.save();
        ctx.strokeStyle = '#FFAA66';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FFAA66';
        ctx.shadowBlur = 15;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        ctx.shadowBlur = 0;
        ctx.restore();
        ctx.fillStyle = '#FFAA66';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Select Dice to Reroll', panelX + panelWidth / 2, panelY + 40);
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '14px Arial';
        ctx.fillText('Click dice to select/deselect', panelX + panelWidth / 2, panelY + 70);
        ctx.textAlign = 'left';
        const availableDice = (window.CombatManager?.state?.rolledDice || []).filter(d => !d.assigned);
        const diceStartY = panelY + 100, diceSize = 80, diceSpacing = 20, dicePerRow = 4;
        modal.checkboxBounds = [];
        availableDice.forEach((rolledDie, idx) => {
            const row = Math.floor(idx / dicePerRow);
            const col = idx % dicePerRow;
            const dieX = panelX + 50 + col * (diceSize + diceSpacing);
            const dieY = diceStartY + row * (diceSize + diceSpacing + 30);
            const isSelected = modal.selectedDice.includes(rolledDie.dieIndex);
            modal.checkboxBounds.push({ x: dieX, y: dieY, width: diceSize, height: diceSize, dieIndex: rolledDie.dieIndex });
            const die = DS.state.dice[rolledDie.dieIndex];
            const face = die.faces[rolledDie.faceIndex];
            DS.drawDieFace(ctx, face, dieX, dieY, diceSize, false);
            if (isSelected) {
                ctx.save();
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 4;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                ctx.strokeRect(dieX, dieY, diceSize, diceSize);
                ctx.restore();
            }
            const checkboxSize = 24;
            const checkboxX = dieX + diceSize / 2 - checkboxSize / 2;
            const checkboxY = dieY + diceSize + 5;
            ctx.fillStyle = isSelected ? '#FFD700' : '#333333';
            ctx.fillRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
            if (isSelected) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(checkboxX + 5, checkboxY + 12);
                ctx.lineTo(checkboxX + 10, checkboxY + 18);
                ctx.lineTo(checkboxX + 19, checkboxY + 6);
                ctx.stroke();
            }
        });
        const buttonY = panelY + panelHeight - 60, buttonWidth = 120, buttonHeight = 40, buttonSpacing = 20;
        const cancelX = panelX + panelWidth / 2 - buttonWidth - buttonSpacing / 2;
        modal.cancelButton = { x: cancelX, y: buttonY, width: buttonWidth, height: buttonHeight };
        ctx.fillStyle = '#663333';
        ctx.fillRect(cancelX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#FF8888';
        ctx.lineWidth = 2;
        ctx.strokeRect(cancelX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Cancel', cancelX + buttonWidth / 2, buttonY + 25);
        const confirmX = panelX + panelWidth / 2 + buttonSpacing / 2;
        const canConfirm = modal.selectedDice.length > 0;
        modal.confirmButton = { x: confirmX, y: buttonY, width: buttonWidth, height: buttonHeight };
        ctx.fillStyle = canConfirm ? '#336633' : '#333333';
        ctx.fillRect(confirmX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = canConfirm ? '#88FF88' : '#555555';
        ctx.lineWidth = 2;
        ctx.strokeRect(confirmX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = canConfirm ? '#FFFFFF' : '#666666';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Confirm', confirmX + buttonWidth / 2, buttonY + 25);
        ctx.textAlign = 'left';
    },
    // Render expanded ability panel (main die + power-up slots, UI only)
    renderExpandedAbility(ctx, canvas) {
        if (!window.DiceSystem) return;
        const DS = window.DiceSystem;
        const expanded = DS.state.expandedAbility;
        if (!expanded) return;
        
        const layout = DS.layout;
        const colors = DS.colors;
        const panelWidth = 500;
        const panelHeight = 260;
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = 480;
        
        // Dim areas outside rolling box
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, layout.rollingBoxY);
        const rollingBoxBottom = layout.rollingBoxY + layout.rollingBoxHeight;
        ctx.fillRect(0, rollingBoxBottom, canvas.width, canvas.height - rollingBoxBottom);
        
        // Panel background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        // Ensure no inherited filters/alpha affect content
        ctx.globalAlpha = 1.0;
        if (typeof ctx.filter === 'string') ctx.filter = 'none';
        
        // Panel border with glow
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 20;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        ctx.shadowBlur = 0;
        
        const centerX = panelX + panelWidth / 2;
        
        // Main die face (full brightness) - use CombatManager's rolled dice state
        const mainDie = (window.CombatManager && window.CombatManager.state && window.CombatManager.state.rolledDice)
            ? window.CombatManager.state.rolledDice[expanded.dieIndex]
            : null;
        if (mainDie && mainDie.face && mainDie.face.icon) {
            const iconSize = 70;
            const iconX = panelX + 15;
            const iconY = panelY + 15;
            const texturesForDie = DS.faceTextures && DS.faceTextures[expanded.dieIndex];
            const texture = texturesForDie ? texturesForDie[mainDie.faceIndex] : null;
            if (texture) {
                ctx.save();
                ctx.drawImage(texture, iconX, iconY, iconSize, iconSize);
                ctx.restore();
                ctx.strokeStyle = '#00FFFF';
                ctx.lineWidth = 3;
                ctx.strokeRect(iconX, iconY, iconSize, iconSize);
            }
        }
        
        // Ability name and computed description
        ctx.fillStyle = '#00FFFF';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        const textX = panelX + 100;
        ctx.fillText(expanded.ability.displayName, textX, panelY + 40);
        const filledSlots = expanded.powerUpDice.length;
        const formattedAbility = expanded.ability ? formatAbilityDescription(expanded.ability, filledSlots) : { description: '' };
        ctx.fillStyle = '#FFFF88';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(formattedAbility.description, textX, panelY + 65);
        
        // Power-up slots row
        const maxSlots = expanded.ability.powerUpSlots || 0;
        const slotSize = 40;
        const slotSpacing = 10;
        const totalSlotsWidth = maxSlots * (slotSize + slotSpacing) - slotSpacing;
        const slotsX = centerX - totalSlotsWidth / 2;
        const slotsY = panelY + 120;
        if (maxSlots > 0) {
            ctx.font = '12px Arial';
            ctx.fillStyle = '#AAAAAA';
            ctx.textAlign = 'center';
            ctx.fillText('Power-Up Slots:', centerX, slotsY - 5);
        }
        for (let i = 0; i < maxSlots; i++) {
            const x = slotsX + i * (slotSize + slotSpacing);
            const filled = i < filledSlots;
            const color = expanded.ability.powerUpColors && expanded.ability.powerUpColors[i];
            ctx.fillStyle = filled ? (colors[color + 'Light'] || colors[color] || '#666666') : '#2a2a2a';
            ctx.fillRect(x, slotsY, slotSize, slotSize);
            ctx.strokeStyle = filled ? '#FFD700' : '#444444';
            ctx.lineWidth = filled ? 3 : 2;
            ctx.strokeRect(x, slotsY, slotSize, slotSize);
            if (filled && expanded.powerUpDice[i] !== undefined) {
                const powerUpDieIdx = expanded.powerUpDice[i];
                const powerUpDie = (window.CombatManager && window.CombatManager.state && window.CombatManager.state.rolledDice)
                    ? window.CombatManager.state.rolledDice[powerUpDieIdx]
                    : null;
                if (powerUpDie && powerUpDie.face && powerUpDie.face.icon) {
                    const pudTextures = DS.faceTextures && DS.faceTextures[powerUpDieIdx];
                    const texture = pudTextures ? pudTextures[powerUpDie.faceIndex] : null;
                    if (texture) {
                        ctx.save();
                        ctx.drawImage(texture, x, slotsY, slotSize, slotSize);
                        ctx.restore();
                    }
                }
            }
        }
        
        // Instructions
        ctx.font = '14px Arial';
        ctx.fillStyle = '#CCCCCC';
        ctx.textAlign = 'center';
        ctx.fillText('Click other dice to add power-ups', centerX, panelY + 185);
        
        // Buttons
        const buttonY = panelY + 210;
        const buttonWidth = 100;
        const buttonHeight = 35;
        const buttonSpacing = 15;
        const cancelX = centerX - buttonWidth * 1.5 - buttonSpacing;
        const executeX = centerX - buttonWidth / 2;
        ctx.fillStyle = '#AA4444';
        ctx.fillRect(cancelX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#FF6666';
        ctx.lineWidth = 2;
        ctx.strokeRect(cancelX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Cancel', cancelX + buttonWidth / 2, buttonY + 23);
        ctx.fillStyle = '#44AA44';
        ctx.fillRect(executeX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#66FF66';
        ctx.lineWidth = 2;
        ctx.strokeRect(executeX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Execute', executeX + buttonWidth / 2, buttonY + 23);
        
        ctx.restore();
        ctx.textAlign = 'left';
    },
    
    // Render unit info panel (HP, armor, status effects, portrait)
    renderUnitInfo(ctx, unit, x, y, isPlayer) {
        // Use CharacterPanel component to draw the unit info
        const buttonBounds = CharacterPanel.draw(ctx, unit, x, y, isPlayer, this.portraits);
        
        // Store button bounds for click detection (in DiceSystem for now)
        unit._viewDiceButton = {
            x: buttonBounds.buttonX,
            y: buttonBounds.buttonY,
            width: buttonBounds.buttonWidth,
            height: buttonBounds.buttonHeight,
            unitId: isPlayer ? 'player' : 'enemy'
        };
        
        // Draw "View Dice" button (always shows "View Dice", never changes)
        const expandedPanel = window.DiceSystem && window.DiceSystem.state.expandedUnitPanel;
        let isExpanded = false;
        if (expandedPanel) {
            // Check if this specific unit's panel is expanded
            if (isPlayer) {
                isExpanded = (expandedPanel.unitId === 'player_captain' && unit.id === Combat.state.playerUnit?.id) ||
                            (expandedPanel.unitId === 'player_crew' && unit.id === Combat.state.playerCrew?.id);
            } else {
                isExpanded = (expandedPanel.unitId === 'enemy_captain' && unit.id === Combat.state.enemyUnit?.id) ||
                            (expandedPanel.unitId === 'enemy_crew' && unit.id === Combat.state.enemyCrew?.id);
            }
        }
        
        const isHovered = !!unit._viewDiceButton.hovered;
        Button.draw(
            ctx,
            buttonBounds.buttonX,
            buttonBounds.buttonY,
            buttonBounds.buttonWidth,
            buttonBounds.buttonHeight,
            'View Dice', // Always shows "View Dice"
            true,
            isHovered,
            {
                bgEnabled: isExpanded ? '#666666' : '#333333',
                bgHovered: '#444444',
                borderEnabled: isPlayer ? '#44CCFF' : '#FF8844',
                textEnabled: isHovered ? '#FFFFEE' : '#FFFFFF',
                fontSize: '12px'
            }
        );
    },
    
    
    // Render turn information
    renderTurnInfo(ctx, canvas) {
        const centerX = canvas.width / 2;
        const y = 30;
        
        ctx.fillStyle = '#FFFF00';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Turn ${Combat.state.turnNumber} - ${Combat.state.currentTurn === 'player' ? "Player's" : "Enemy's"} Turn`, 
                    centerX, y);
        ctx.textAlign = 'left';
    },
    
    // Render combat log
    renderCombatLog(ctx, canvas) {
        const logX = 20;
        const logY = canvas.height - 180;
        const logWidth = 400;
        const logHeight = 90;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(logX, logY, logWidth, logHeight);
        
        // Border
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 2;
        ctx.strokeRect(logX, logY, logWidth, logHeight);
        
        // Title
        ctx.fillStyle = '#CCCCCC';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Combat Log:', logX + 10, logY + 15);
        
        // Log entries (last 5)
        const recentLogs = Combat.state.combatLog.slice(-5);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '11px Arial';
        
        for (let i = 0; i < recentLogs.length; i++) {
            const entry = recentLogs[i];
            const text = typeof entry === 'string' ? entry : (entry && entry.message ? entry.message : String(entry));
            ctx.fillText(text, logX + 10, logY + 35 + i * 14);
        }
        
        ctx.textAlign = 'left';
    },
    
    // Render combat action buttons
    renderCombatButtons(ctx, canvas) {
        const centerX = canvas.width / 2;
        const buttonY = canvas.height - 80;
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonSpacing = 14;
        const totalWidth = buttonWidth * 3 + buttonSpacing * 2;
        const startX = centerX - totalWidth / 2;

        // Roll Dice button (left)
        const rollX = startX;
        const rollHovered = window.DiceSystem && window.DiceSystem.state.hoveredButton === 'roll';
        Button.draw(
            ctx,
            rollX,
            buttonY,
            buttonWidth,
            buttonHeight,
            'Roll Dice',
            true,
            rollHovered,
            {
                bgEnabled: '#333366',
                bgHovered: '#4444AA',
                borderEnabled: '#8888FF',
                textEnabled: '#FFFFFF',
                fontSize: '14px'
            }
        );

        // Reroll button (middle) - disabled if no rerolls or no rolled dice or all dice assigned
        const rerollX = startX + buttonWidth + buttonSpacing;
        const rerollHovered = window.DiceSystem && window.DiceSystem.state.hoveredButton === 'reroll';
        const canReroll = (window.CombatManager && window.CombatManager.state &&
                         window.CombatManager.state.rerollsRemaining > 0 &&
                         (window.CombatManager.state.rolledDice || []).length > 0 &&
                         window.CombatManager.state.rolledDice.some(d => !d.assigned));
        
        Button.draw(
            ctx,
            rerollX,
            buttonY,
            buttonWidth,
            buttonHeight,
            'Reroll',
            canReroll,
            rerollHovered,
            {
                bgEnabled: '#664422',
                bgHovered: '#AA6644',
                bgDisabled: '#333333',
                borderEnabled: '#FFAA66',
                borderDisabled: '#555555',
                textEnabled: '#FFFFFF',
                textDisabled: '#666666',
                fontSize: '14px'
            }
        );
        
        // Show rerolls remaining
        if (window.CombatManager && window.CombatManager.state && window.CombatManager.state.rerollsRemaining > 0) {
            Button.drawBadge(ctx, rerollX, buttonY, buttonWidth, buttonHeight, `(${window.CombatManager.state.rerollsRemaining})`, { color: '#FFAA66', fontSize: '10px', offsetX: 0, offsetY: -5 });
        }

        // (Execute Ability button removed; execution happens in expanded panel)

        // End Turn button (right)
        const endTurnX = startX + (buttonWidth + buttonSpacing) * 2;
        const endTurnHovered = window.DiceSystem && window.DiceSystem.state.hoveredButton === 'end_turn';
        
        Button.draw(
            ctx,
            endTurnX,
            buttonY,
            buttonWidth,
            buttonHeight,
            'End Turn',
            true,
            endTurnHovered,
            {
                bgEnabled: '#663333',
                bgHovered: '#AA4444',
                borderEnabled: '#FF8888',
                textEnabled: '#FFFFFF',
                fontSize: '14px'
            }
        );
        
        ctx.textAlign = 'left';
    },
    
    // Check if mouse is hovering over combat buttons
    checkButtonHover(mousePos, canvas) {
        if (!window.DiceSystem) return;
        window.DiceSystem.state.hoveredButton = null;
        
        const centerX = canvas.width / 2;
        const buttonY = canvas.height - 80;
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonSpacing = 14;
        const totalWidth = buttonWidth * 3 + buttonSpacing * 2;
        const startX = centerX - totalWidth / 2;

        const rollX = startX;
        const rerollX = startX + buttonWidth + buttonSpacing;
        const executeX = startX + (buttonWidth + buttonSpacing) * 2; // no execute, placeholder for alignment
        const endTurnX = executeX;

        if (mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
            if (mousePos.x >= rollX && mousePos.x <= rollX + buttonWidth) {
                window.DiceSystem.state.hoveredButton = 'roll';
            } else if (mousePos.x >= rerollX && mousePos.x <= rerollX + buttonWidth) {
                window.DiceSystem.state.hoveredButton = 'reroll';
            } else if (mousePos.x >= endTurnX && mousePos.x <= endTurnX + buttonWidth) {
                window.DiceSystem.state.hoveredButton = 'end_turn';
            }
        }
    },
    
    // Check if a combat action button was clicked
    checkCombatActionClick(mousePos, canvas) {
        const centerX = canvas.width / 2;
        const buttonY = canvas.height - 80;
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonSpacing = 14;
        const totalWidth = buttonWidth * 3 + buttonSpacing * 2;
        const startX = centerX - totalWidth / 2;

        const rollX = startX;
        const rerollX = startX + buttonWidth + buttonSpacing;
        const executeX = startX + (buttonWidth + buttonSpacing) * 2; // no execute, placeholder for alignment
        const endTurnX = executeX;

        // Roll Dice button
        if (mousePos.x >= rollX && mousePos.x <= rollX + buttonWidth &&
            mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
            if (window.DiceSystem) {
                window.DiceSystem.rollAllDice();
            }
            return true;
        }

        // Reroll button
        const canReroll = (window.CombatManager && window.CombatManager.state &&
                         window.CombatManager.state.rerollsRemaining > 0 &&
                         (window.CombatManager.state.rolledDice || []).length > 0 &&
                         window.CombatManager.state.rolledDice.some(d => !d.assigned));
        if (canReroll &&
            mousePos.x >= rerollX && mousePos.x <= rerollX + buttonWidth &&
            mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
            if (window.DiceSystem) {
                window.DiceSystem.openRerollModal();
            }
            return true;
        }

        // (Execute Ability click removed; execution happens in expanded panel)

        // End Turn button
        if (mousePos.x >= endTurnX && mousePos.x <= endTurnX + buttonWidth &&
            mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
            Combat.endTurn();
            return true;
        }
        
        return false;
    }
};

