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
    // Character portraits cache (by unit ID)
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
            
            // Don't expand blank faces (no icon/ability)
            if (!rolledDie.face || !rolledDie.face.icon || !rolledDie.ability) {
                return;
            }
            
            CombatManager.openExpandedAbility(CombatManager.state, rolledIndex);
            // Mirror to DiceSystem UI state so renderer shows the panel
            if (window.DiceSystem && CombatManager.state.expandedAbility) {
                window.DiceSystem.state.expandedAbility = CombatManager.state.expandedAbility;
            }
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
            
            // Don't allow blank faces as power-ups
            if (!rolledDie.face || !rolledDie.face.icon || !rolledDie.ability) {
                return;
            }
            
            // Delegate to manager for pure state update
            const before = expanded.powerUpDice.slice();
            CombatManager.togglePowerUpDie(CombatManager.state, rolledIndex);
            const after = CombatManager.state.expandedAbility.powerUpDice;
        },
        
        // Cancel the expanded ability
        cancelExpandedAbility() {
            CombatManager.cancelExpandedAbility(CombatManager.state);
            if (window.DiceSystem) {
                window.DiceSystem.state.expandedAbility = null;
            }
        },

        // Execute expanded ability via manager and clear UI state
        executeExpandedAbility() {
            const result = CombatManager.executeExpandedAbility(CombatManager.state, CombatManager.state.expandedAbility);
            if (window.DiceSystem) {
                window.DiceSystem.state.expandedAbility = null;
            }
            if (result && result.executed) {
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
            
            
            // Reroll selected dice
            for (const dieIndex of modal.selectedDice) {
                const state = this.ui.diceStates[dieIndex];
                Die.setupReroll(state);
            }
            
            // Wait for animation to complete, then update rolled dice pool
            // The populateRolledDicePool function will be called automatically when animation finishes
            // We just need to mark which dice were rerolled so we know to update them
            CombatManager.state.rerollingDice = modal.selectedDice;
            CombatManager.state.rerollsRemaining--;
            this.ui.rerollModal = null;
            
        },

        // Check if clicking on expanded ability panel buttons
    checkExpandedAbilityClick(mousePos, canvas) {
        // Delegate to ExpandedAbilityPanel component
        return ExpandedAbilityPanel.handleClick(
            mousePos, 
            canvas,
            () => this.cancelExpandedAbility(),
            () => this.executeExpandedAbility()
        );
    },

    // Toggle die selection (old system - keeping for compatibility) in the pool
    toggleDieSelection(poolIndex) {
        CombatManager.toggleDieSelection(CombatManager.state, poolIndex);
    },

    // Assign a die to an ability slot
    assignDieToAbility(poolIndex, abilityKey) {
        CombatManager.assignDieToAbility(CombatManager.state, poolIndex, abilityKey);
    },

    // Unassign a die from an ability
    unassignDieFromAbility(poolIndex, abilityKey) {
        CombatManager.unassignDieFromAbility(CombatManager.state, poolIndex, abilityKey);
    },

    // Handle mouse move
    onMouseMove(mousePos, canvas) {
        // Handle scrollbar dragging for unit selection dialog
        if (window.DiceSystem && window.DiceSystem.state.unitSelectionDialog) {
            const dialog = window.DiceSystem.state.unitSelectionDialog;
            if (dialog.scrolling && dialog.scrollbarBounds) {
                const scrollbar = dialog.scrollbarBounds;
                const contentHeight = dialog.totalHeight;
                const visibleHeight = 380;
                const maxScroll = Math.max(0, contentHeight - visibleHeight);
                
                // Calculate scroll position from mouse Y
                const relativeY = mousePos.y - scrollbar.y;
                const scrollPercent = Math.max(0, Math.min(1, relativeY / scrollbar.height));
                dialog.scrollY = scrollPercent * maxScroll;
                return; // Don't process other mouse move events while dragging
            }
        }
        
        // Check for targeting mode hover first
        if (CombatManager.state.targetingMode) {
            this.updateTargetingHover(mousePos);
        }
        
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
            // Check all player units
            for (const unit of Combat.state.playerUnits) {
                if (unit && unit._viewDiceButton) {
                    unit._viewDiceButton.hovered = Button.hitTest(mousePos, unit._viewDiceButton);
                }
            }
            
            // Check all enemy units
            for (const unit of Combat.state.enemyUnits) {
                if (unit && unit._viewDiceButton) {
                    unit._viewDiceButton.hovered = Button.hitTest(mousePos, unit._viewDiceButton);
                }
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

    // Update hover state for targeting mode
    updateTargetingHover(mousePos) {
        CombatManager.ensureState();
        const targetingMode = CombatManager.state.targetingMode;
        if (!targetingMode) return;
        
        // Check if hovering over any valid target panel
        let hoveredTarget = null;
        for (const targetInfo of targetingMode.validTargets) {
            const unit = targetInfo.unit;
            if (unit._panelBounds) {
                const bounds = unit._panelBounds;
                if (mousePos.x >= bounds.x && mousePos.x <= bounds.x + bounds.width &&
                    mousePos.y >= bounds.y && mousePos.y <= bounds.y + bounds.height) {
                    hoveredTarget = unit;
                    break;
                }
            }
        }
        
        targetingMode.hoveredTarget = hoveredTarget;
    },

    // Check if a button was clicked
    checkButtonClick(mousePos, canvas) {
        CombatManager.ensureState();
        
        // Check edit mode toggle button first (should work even when dialog is open)
        const editCenterX = canvas.width / 2;
        const editButtonYPos = canvas.height - 80;
        const editButtonHeight = 40;
        const editButtonY = editButtonYPos + editButtonHeight + 15;
        const editButtonWidth = 140;
        const editButtonHeight2 = 35;
        const editButtonX = editCenterX - editButtonWidth / 2;
        if (mousePos.x >= editButtonX && mousePos.x <= editButtonX + editButtonWidth &&
            mousePos.y >= editButtonY && mousePos.y <= editButtonY + editButtonHeight2) {
            if (window.DiceSystem) {
                window.DiceSystem.state.editMode = !window.DiceSystem.state.editMode;
                // Close unit selection dialog when toggling edit mode off
                if (!window.DiceSystem.state.editMode) {
                    window.DiceSystem.state.unitSelectionDialog = null;
                }
            }
            return true;
        }
        
        // Check for unit selection dialog clicks
        if (window.DiceSystem && window.DiceSystem.state.unitSelectionDialog) {
            const dialog = window.DiceSystem.state.unitSelectionDialog;
            
            // Check if clicking on scrollbar track or thumb
            if (dialog.scrollbarBounds) {
                const scrollbar = dialog.scrollbarBounds;
                if (mousePos.x >= scrollbar.x && mousePos.x <= scrollbar.x + scrollbar.width &&
                    mousePos.y >= scrollbar.y && mousePos.y <= scrollbar.y + scrollbar.height) {
                    // Check if clicking on thumb (start drag) or track (jump)
                    if (mousePos.y >= scrollbar.thumbY && mousePos.y <= scrollbar.thumbY + scrollbar.thumbHeight) {
                        // Start dragging scrollbar
                        dialog.scrolling = true;
                        dialog.scrollStartY = mousePos.y;
                        dialog.scrollStartScrollY = dialog.scrollY || 0;
                    } else {
                        // Jump to position
                        const contentHeight = dialog.totalHeight;
                        const visibleHeight = 380;
                        const maxScroll = Math.max(0, contentHeight - visibleHeight);
                        const relativeY = mousePos.y - scrollbar.y;
                        const scrollPercent = Math.max(0, Math.min(1, relativeY / scrollbar.height));
                        dialog.scrollY = scrollPercent * maxScroll;
                    }
                    return;
                }
            }
            
            // Check close button
            if (dialog.closeButton &&
                mousePos.x >= dialog.closeButton.x && mousePos.x <= dialog.closeButton.x + dialog.closeButton.width &&
                mousePos.y >= dialog.closeButton.y && mousePos.y <= dialog.closeButton.y + dialog.closeButton.height) {
                window.DiceSystem.state.unitSelectionDialog = null;
                return;
            }
            
            // Check item clicks (only if not clicking scrollbar)
            if (dialog.itemBounds && (!dialog.scrollbarBounds || 
                mousePos.x < dialog.scrollbarBounds.x || mousePos.x > dialog.scrollbarBounds.x + dialog.scrollbarBounds.width)) {
                for (const itemBound of dialog.itemBounds) {
                    if (mousePos.x >= itemBound.x && mousePos.x <= itemBound.x + itemBound.width &&
                        mousePos.y >= itemBound.y && mousePos.y <= itemBound.y + itemBound.height) {
                        // Add unit
                        const side = dialog.side;
                        const unit = Combat.addUnit(itemBound.item, side, itemBound.type);
                        if (unit) {
                            // Load portrait if needed
                            if (itemBound.type === 'captain' && itemBound.item.image) {
                                CombatUI.loadPortrait(unit.id, itemBound.item.image);
                            }
                            window.DiceSystem.state.unitSelectionDialog = null;
                        }
                        return;
                    }
                }
            }
            
            // Clicked outside dialog - close it
            if (dialog.bounds &&
                (mousePos.x < dialog.bounds.x || mousePos.x > dialog.bounds.x + dialog.bounds.width ||
                 mousePos.y < dialog.bounds.y || mousePos.y > dialog.bounds.y + dialog.bounds.height)) {
                window.DiceSystem.state.unitSelectionDialog = null;
                return;
            }
            
            return; // Don't process other clicks while dialog is open
        }
        
        // Check for edit mode clicks (X and + buttons)
        if (window.DiceSystem && window.DiceSystem.state.editMode) {
            // Check X buttons on units
            for (const unit of [...Combat.state.playerUnits, ...Combat.state.enemyUnits]) {
                if (unit._removeButton &&
                    mousePos.x >= unit._removeButton.x && mousePos.x <= unit._removeButton.x + unit._removeButton.width &&
                    mousePos.y >= unit._removeButton.y && mousePos.y <= unit._removeButton.y + unit._removeButton.height) {
                    Combat.removeUnit(unit);
                    return;
                }
            }
            
            // Check + buttons
            if (window.DiceSystem.state._addButtonBounds) {
                const playerBounds = window.DiceSystem.state._addButtonBounds.player;
                if (playerBounds &&
                    mousePos.x >= playerBounds.x && mousePos.x <= playerBounds.x + playerBounds.width &&
                    mousePos.y >= playerBounds.y && mousePos.y <= playerBounds.y + playerBounds.height) {
                    if (Combat.state.playerUnits.length < 5) {
                        window.DiceSystem.state.unitSelectionDialog = { side: 'player', scrollY: 0 };
                    }
                    return;
                }
                
                const enemyBounds = window.DiceSystem.state._addButtonBounds.enemy;
                if (enemyBounds &&
                    mousePos.x >= enemyBounds.x && mousePos.x <= enemyBounds.x + enemyBounds.width &&
                    mousePos.y >= enemyBounds.y && mousePos.y <= enemyBounds.y + enemyBounds.height) {
                    if (Combat.state.enemyUnits.length < 5) {
                        window.DiceSystem.state.unitSelectionDialog = { side: 'enemy', scrollY: 0 };
                    }
                    return;
                }
            }
        }
        
        // Check for target selection click if in targeting mode
        if (CombatManager.state.targetingMode) {
            const targetingMode = CombatManager.state.targetingMode;
            for (const targetInfo of targetingMode.validTargets) {
                const unit = targetInfo.unit;
                if (unit._panelBounds) {
                    const bounds = unit._panelBounds;
                    if (mousePos.x >= bounds.x && mousePos.x <= bounds.x + bounds.width &&
                        mousePos.y >= bounds.y && mousePos.y <= bounds.y + bounds.height) {
                        // Select this target and execute
                        CombatManager.executeExpandedAbilityWithTarget(
                            CombatManager.state,
                            targetingMode.expanded,
                            unit
                        );
                        return true; // Handled
                    }
                }
            }
            // Clicked outside valid targets - cancel targeting
            CombatManager.state.targetingMode = null;
            return true; // Handled (canceled targeting)
        }
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
            
            // Check if clicking on another unit's "View Dice" button (switch panels)
            const currentUnitId = expanded.unitId;
            
            // Check all player units
            for (const unit of Combat.state.playerUnits) {
                if (unit && unit.id !== currentUnitId && unit._viewDiceButton) {
                    const btn = unit._viewDiceButton;
                    if (mousePos.x >= btn.x && mousePos.x <= btn.x + btn.width &&
                        mousePos.y >= btn.y && mousePos.y <= btn.y + btn.height) {
                        // Switch to this unit's panel
                        window.DiceSystem.state.expandedUnitPanel = { unitId: unit.id, faceBounds: [] };
                        return;
                    }
                }
            }
            
            // Check all enemy units
            for (const unit of Combat.state.enemyUnits) {
                if (unit && unit.id !== currentUnitId && unit._viewDiceButton) {
                    const btn = unit._viewDiceButton;
                    if (mousePos.x >= btn.x && mousePos.x <= btn.x + btn.width &&
                        mousePos.y >= btn.y && mousePos.y <= btn.y + btn.height) {
                        // Switch to this unit's panel
                        window.DiceSystem.state.expandedUnitPanel = { unitId: unit.id, faceBounds: [] };
                        return;
                    }
                }
            }
            
            // Clicked outside panel and not on another view dice button - close
            window.DiceSystem.state.expandedUnitPanel = null;
            return;
        }
        
        // Check for "View Dice" button clicks on unit panels
        if ((window.DiceSystem?.state?.combatMode) && Combat.state.active) {
            // Check all player units
            for (const unit of Combat.state.playerUnits) {
                if (unit && unit._viewDiceButton) {
                    const btn = unit._viewDiceButton;
                    if (mousePos.x >= btn.x && mousePos.x <= btn.x + btn.width &&
                        mousePos.y >= btn.y && mousePos.y <= btn.y + btn.height) {
                        window.DiceSystem.state.expandedUnitPanel = { unitId: unit.id, faceBounds: [] };
                        return;
                    }
                }
            }
            
            // Check all enemy units
            for (const unit of Combat.state.enemyUnits) {
                if (unit && unit._viewDiceButton) {
                    const btn = unit._viewDiceButton;
                    if (mousePos.x >= btn.x && mousePos.x <= btn.x + btn.width &&
                        mousePos.y >= btn.y && mousePos.y <= btn.y + btn.height) {
                        window.DiceSystem.state.expandedUnitPanel = { unitId: unit.id, faceBounds: [] };
                        return;
                    }
                }
            }
        }
        
        // Handle combat button clicks if in combat mode (but not in edit mode)
        const inEditMode = window.DiceSystem && window.DiceSystem.state.editMode;
        if ((window.DiceSystem?.state?.combatMode) && Combat.state.active && !inEditMode) {
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
        const normalCenterX = canvas.width / 2;
        const normalButtonY = CombatUI.layout.buttonY;
        
        const rollButtonX = normalCenterX + 50;
        const rerollButtonX = normalCenterX + 50 + CombatUI.layout.buttonWidth + 20;
        
        // Roll button
        if (mousePos.x >= rollButtonX && mousePos.x <= rollButtonX + CombatUI.layout.buttonWidth &&
            mousePos.y >= normalButtonY && mousePos.y <= normalButtonY + CombatUI.layout.buttonHeight) {
            this.rollAllDice();
            return;
        }
        
        // Reroll button
        if (mousePos.x >= rerollButtonX && mousePos.x <= rerollButtonX + CombatUI.layout.buttonWidth &&
            mousePos.y >= normalButtonY && mousePos.y <= normalButtonY + CombatUI.layout.buttonHeight) {
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
        
        // Check status effects for all units
        for (const unit of [...Combat.state.playerUnits, ...Combat.state.enemyUnits]) {
            if (unit && unit.statusEffects) {
                const hoveredEffect = CharacterPanel.checkStatusEffectHover(unit.statusEffects, mousePos);
                if (hoveredEffect) {
                    this.showStatusEffectTooltip(hoveredEffect, mousePos.x, mousePos.y);
                    return;
                }
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
            // Safety check: ensure state exists and has targetFace
            if (state && state.targetFace !== undefined) {
                tooltip.visible = true;
                tooltip.dieIndex = posIdx;
                tooltip.faceIndex = state.targetFace;
                tooltip.x = mousePos.x + 15;
                tooltip.y = mousePos.y + 15;
                tooltip.filledSlots = [];
            }
        }
    },

    renderExpandedAbility(ctx, canvas) {
        // Delegate to ExpandedAbilityPanel component
        const DS = window.DiceSystem;
        if (!DS) return;
        
        ExpandedAbilityPanel.render(
            ctx, 
            canvas, 
            CombatManager.state.expandedAbility, 
            this.faceTextures,
            CombatUI.layout,
            DS.colors
        );
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

    // Draw an icon (vector art) - delegates to DiceIcons module
    drawIcon(ctx, iconName, x, y, size) {
        DiceIcons.drawIcon(ctx, iconName, x, y, size);
    },
    
    // Load a character portrait image
    // Caches by unit ID only (hero portraits are cached by their unique captain ID)
    loadPortrait(unitId, imagePath) {
        // If already loaded for this unit ID, skip
        if (this.portraits[unitId]) {
            return;
        }
        
        const img = new Image();
        img.onload = () => {
            this.portraits[unitId] = img;
            console.log(`Portrait loaded successfully: ${unitId}`);
        };
        img.onerror = () => {
            console.warn('CombatUI - Failed to load portrait:', imagePath, 'for ID:', unitId);
        };
        img.src = imagePath;
    },
    
    // Main render function for combat UI
    render(ctx, canvas) {
        if (!Combat.state.active) return;
        
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
        
        // Render all player units
        const playerStartY = 20;
        const unitSpacing = 160;
        for (let i = 0; i < Combat.state.playerUnits.length; i++) {
            const unit = Combat.state.playerUnits[i];
            const unitY = playerStartY + i * unitSpacing;
            this.renderUnitInfo(ctx, unit, 20, unitY, true);
        }
        
        // Render all enemy units
        for (let i = 0; i < Combat.state.enemyUnits.length; i++) {
            const unit = Combat.state.enemyUnits[i];
            const unitY = playerStartY + i * unitSpacing;
            this.renderUnitInfo(ctx, unit, canvas.width - 260, unitY, false);
        }
        
        // Render + buttons in edit mode (below last unit on each side)
        const editMode = window.DiceSystem && window.DiceSystem.state.editMode;
        if (editMode) {
            // Player side + button
            const playerLastY = playerStartY + Combat.state.playerUnits.length * unitSpacing;
            const canAddPlayer = Combat.state.playerUnits.length < 5;
            this.renderAddUnitButton(ctx, 20, playerLastY, true, canAddPlayer);
            
            // Enemy side + button
            const enemyLastY = playerStartY + Combat.state.enemyUnits.length * unitSpacing;
            const canAddEnemy = Combat.state.enemyUnits.length < 5;
            this.renderAddUnitButton(ctx, canvas.width - 260, enemyLastY, false, canAddEnemy);
        }
        
        // Set combat effects positions for all units
        if (window.CombatEffects) {
            // Player units (left side)
            for (let i = 0; i < Combat.state.playerUnits.length; i++) {
                const unit = Combat.state.playerUnits[i];
                const y = 20 + i * 160; // Same spacing as unit panels
                window.CombatEffects.setUnitPosition(unit.id, 20, y);
            }
            
            // Enemy units (right side)
            for (let i = 0; i < Combat.state.enemyUnits.length; i++) {
                const unit = Combat.state.enemyUnits[i];
                const y = 20 + i * 160; // Same spacing as unit panels
                window.CombatEffects.setUnitPosition(unit.id, canvas.width - 260, y);
            }
            
            // Render combat effects (particles and text)
            window.CombatEffects.render(ctx);
        }
        
        this.renderTurnInfo(ctx, canvas);
        this.renderRollingBox(ctx, canvas);
        this.renderCombatLog(ctx, canvas);
        this.renderCombatButtons(ctx, canvas);
        
        // Render unit selection dialog if open
        const inEditMode = window.DiceSystem && window.DiceSystem.state.editMode;
        if (inEditMode && window.DiceSystem && window.DiceSystem.state.unitSelectionDialog) {
            this.renderUnitSelectionDialog(ctx, canvas);
        }
    },
    
    // Render unit selection dialog
    renderUnitSelectionDialog(ctx, canvas) {
        // Delegate to UnitSelectionDialog component
        if (!window.DiceSystem || !window.DiceSystem.state.unitSelectionDialog) return;
        
        UnitSelectionDialog.render(ctx, canvas, window.DiceSystem.state.unitSelectionDialog);
    },
    
    // Render + button for adding units
    renderAddUnitButton(ctx, x, y, isPlayer, enabled) {
        const buttonSize = 50;
        const buttonX = x + 95; // Center in panel width (240)
        
        // Use Button component to draw + button
        const bounds = Button.drawAddButton(ctx, buttonX, y, buttonSize, enabled);
        
        // Store bounds for click detection
        if (!window.DiceSystem.state._addButtonBounds) {
            window.DiceSystem.state._addButtonBounds = {};
        }
        const key = isPlayer ? 'player' : 'enemy';
        window.DiceSystem.state._addButtonBounds[key] = {
            ...bounds,
            side: isPlayer ? 'player' : 'enemy'
        };
    },
    
    // Render the rolling box with 3D dice
    renderRollingBox(ctx, canvas) {
        // Delegate to RollingBox element
        RollingBox.render(ctx, canvas, CombatUI.layout);
    },
    
    // Render reroll tray (for non-combat dice test mode)
    renderRerollTray(ctx, canvas) {
        // Delegate to RerollTray element
        RerollTray.render(ctx, canvas, CombatUI.layout);
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
        // Delegate to ExpandedUnitPanel component
        if (!window.DiceSystem) return;
        
        ExpandedUnitPanel.render(ctx, canvas, window.DiceSystem.state.expandedUnitPanel);
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

    // Tooltip renderer (topmost)
    renderTooltip(ctx, canvas) {
        // Delegate to Tooltip component
        if (!window.DiceSystem) return;
        
        Tooltip.render(ctx, canvas, window.DiceSystem.state.tooltip);
    },

    // Reroll modal
    renderRerollModal(ctx, canvas) {
        // Delegate to RerollModal component
        if (!window.DiceSystem) return;
        
        RerollModal.render(ctx, canvas, window.DiceSystem.state.rerollModal);
    },
    
    // Render unit info panel (HP, armor, status effects, portrait)
    renderUnitInfo(ctx, unit, x, y, isPlayer) {
        const state = {
            expandedUnitPanel: window.DiceSystem && window.DiceSystem.state.expandedUnitPanel,
            editMode: window.DiceSystem && window.DiceSystem.state.editMode
        };
        return UnitInfoCard.draw(ctx, unit, x, y, isPlayer, this.portraits, state);
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
        // Delegate to CombatLog element
        CombatLog.render(ctx, canvas);
    },
    
    // Render combat action buttons
    renderCombatButtons(ctx, canvas) {
        // Delegate to CombatButtons element
        CombatButtons.render(ctx, canvas);
    },
    
    // Check if mouse is hovering over combat buttons
    checkButtonHover(mousePos, canvas) {
        // Delegate to CombatButtons element
        CombatButtons.handleHover(mousePos, canvas);
    },
    
    // Check if a combat action button was clicked
    checkCombatActionClick(mousePos, canvas) {
        // Delegate to CombatButtons element
        return CombatButtons.handleClick(mousePos, canvas);
    },
    
    // Handle mouse up
    onMouseUp(mousePos, canvas) {
        // Stop scrollbar dragging (handled in DiceSystem.onMouseUp, but keep for consistency)
        if (window.DiceSystem && window.DiceSystem.state.unitSelectionDialog) {
            const dialog = window.DiceSystem.state.unitSelectionDialog;
            if (dialog.scrolling) {
                dialog.scrolling = false;
            }
        }
    }
};

