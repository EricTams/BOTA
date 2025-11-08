// unit_info_card.js - Unit Info Card UI Element
// Renders a unit's info card with portrait, HP, status, and buttons

const UnitInfoCard = {
    /**
     * Draw a unit info card with all interactive elements
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} unit - Unit object
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} isPlayer - True for player, false for enemy
     * @param {Object} portraits - Portrait image cache
     * @param {Object} state - UI state object { expandedUnitPanel, editMode }
     * @returns {Object} Bounds for click detection
     */
    draw(ctx, unit, x, y, isPlayer, portraits, state) {
        // Determine highlight state from targeting mode
        const highlightState = this.getHighlightState(unit);
        
        // Use CharacterPanel to draw the main panel
        const buttonBounds = CharacterPanel.draw(ctx, unit, x, y, isPlayer, portraits, highlightState);
        
        // Calculate and store panel bounds
        this.storePanelBounds(unit, x, y);
        
        // Draw View Dice button
        this.drawViewDiceButton(ctx, unit, buttonBounds, isPlayer, state);
        
        // Draw remove button in edit mode
        if (state.editMode) {
            this.drawRemoveButton(ctx, unit, x, y);
        } else {
            unit._removeButton = null;
        }
        
        return {
            panelBounds: unit._panelBounds,
            viewDiceButton: unit._viewDiceButton,
            removeButton: unit._removeButton
        };
    },
    
    // Get targeting highlight state for unit
    getHighlightState(unit) {
        CombatManager.ensureState();
        const targetingMode = CombatManager.state.targetingMode;
        if (!targetingMode || !targetingMode.validTargets) return null;
        
        const targetInfo = targetingMode.validTargets.find(t => t.unit === unit);
        if (!targetInfo) return null;
        
        return {
            isValidTarget: true,
            isHovered: targetingMode.hoveredTarget === unit
        };
    },
    
    // Store panel bounds on unit for click detection
    storePanelBounds(unit, x, y) {
        const width = 240;
        const portraitSize = 80;
        const statusHeight = (unit.statusEffects && unit.statusEffects.length > 0) ? 50 : 15;
        const panelHeight = Math.max(portraitSize + 20, 30 + 30 + statusHeight + 40);
        unit._panelBounds = { x, y, width, height: panelHeight };
    },
    
    // Draw the "View Dice" button
    drawViewDiceButton(ctx, unit, buttonBounds, isPlayer, state) {
        // Store button bounds
        unit._viewDiceButton = {
            x: buttonBounds.buttonX,
            y: buttonBounds.buttonY,
            width: buttonBounds.buttonWidth,
            height: buttonBounds.buttonHeight,
            unitId: isPlayer ? 'player' : 'enemy'
        };
        
        // Check if this unit's panel is expanded
        const isExpanded = state.expandedUnitPanel && state.expandedUnitPanel.unitId === unit.id;
        const isHovered = !!unit._viewDiceButton.hovered;
        
        // Draw button
        Button.draw(
            ctx,
            buttonBounds.buttonX,
            buttonBounds.buttonY,
            buttonBounds.buttonWidth,
            buttonBounds.buttonHeight,
            'View Dice',
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
    
    // Draw the remove button (X) in edit mode
    drawRemoveButton(ctx, unit, x, y) {
        const width = 240;
        const xButtonSize = 35;
        const xButtonX = x + width - xButtonSize - 5;
        const xButtonY = y + 5;
        
        // Store bounds
        unit._removeButton = { x: xButtonX, y: xButtonY, width: xButtonSize, height: xButtonSize };
        
        // Draw button background
        ctx.fillStyle = '#AA4444';
        ctx.fillRect(xButtonX, xButtonY, xButtonSize, xButtonSize);
        ctx.strokeStyle = '#FF6666';
        ctx.lineWidth = 3;
        ctx.strokeRect(xButtonX, xButtonY, xButtonSize, xButtonSize);
        
        // Draw X symbol
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(xButtonX + 8, xButtonY + 8);
        ctx.lineTo(xButtonX + xButtonSize - 8, xButtonY + xButtonSize - 8);
        ctx.moveTo(xButtonX + xButtonSize - 8, xButtonY + 8);
        ctx.lineTo(xButtonX + 8, xButtonY + xButtonSize - 8);
        ctx.stroke();
    }
};

