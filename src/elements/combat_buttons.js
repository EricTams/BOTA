// combat_buttons.js - Combat Action Buttons UI Element
// Renders and handles interaction for combat action buttons (Roll, Reroll, End Turn, Edit)

const CombatButtons = {
    /**
     * Render combat action buttons
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     */
    render(ctx, canvas) {
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
        
        // Edit units toggle button (below combat buttons)
        const editButtonY = buttonY + buttonHeight + 15;
        const editButtonWidth = 140;
        const editButtonHeight = 35;
        const editButtonX = centerX - editButtonWidth / 2;
        const editMode = window.DiceSystem && window.DiceSystem.state.editMode;
        const editHovered = window.DiceSystem && window.DiceSystem.state.hoveredButton === 'edit_units';
        
        Button.draw(
            ctx,
            editButtonX,
            editButtonY,
            editButtonWidth,
            editButtonHeight,
            editMode ? 'Done editing' : 'Edit units',
            true,
            editHovered,
            {
                bgEnabled: editMode ? '#664422' : '#336633',
                bgHovered: editMode ? '#AA6644' : '#44AA44',
                borderEnabled: editMode ? '#FFAA66' : '#66FF66',
                textEnabled: '#FFFFFF',
                fontSize: '14px'
            }
        );
        
        ctx.textAlign = 'left';
    },
    
    /**
     * Handle button hover
     * @param {Object} mousePos - {x, y} mouse position
     * @param {HTMLCanvasElement} canvas - Canvas element
     */
    handleHover(mousePos, canvas) {
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
        const endTurnX = startX + (buttonWidth + buttonSpacing) * 2;

        if (mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
            if (mousePos.x >= rollX && mousePos.x <= rollX + buttonWidth) {
                window.DiceSystem.state.hoveredButton = 'roll';
            } else if (mousePos.x >= rerollX && mousePos.x <= rerollX + buttonWidth) {
                window.DiceSystem.state.hoveredButton = 'reroll';
            } else if (mousePos.x >= endTurnX && mousePos.x <= endTurnX + buttonWidth) {
                window.DiceSystem.state.hoveredButton = 'end_turn';
            }
        }
        
        // Check edit button hover
        const editButtonY = buttonY + buttonHeight + 15;
        const editButtonWidth = 140;
        const editButtonHeight = 35;
        const editButtonX = centerX - editButtonWidth / 2;
        if (mousePos.x >= editButtonX && mousePos.x <= editButtonX + editButtonWidth &&
            mousePos.y >= editButtonY && mousePos.y <= editButtonY + editButtonHeight) {
            window.DiceSystem.state.hoveredButton = 'edit_units';
        }
    },
    
    /**
     * Handle button click
     * @param {Object} mousePos - {x, y} mouse position
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {boolean} True if click was handled
     */
    handleClick(mousePos, canvas) {
        const centerX = canvas.width / 2;
        const buttonY = canvas.height - 80;
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonSpacing = 14;
        const totalWidth = buttonWidth * 3 + buttonSpacing * 2;
        const startX = centerX - totalWidth / 2;

        const rollX = startX;
        const rerollX = startX + buttonWidth + buttonSpacing;
        const endTurnX = startX + (buttonWidth + buttonSpacing) * 2;

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

        // End Turn button
        if (mousePos.x >= endTurnX && mousePos.x <= endTurnX + buttonWidth &&
            mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
            Combat.endTurn();
            return true;
        }
        
        // Edit units toggle button
        const editButtonY = buttonY + buttonHeight + 15;
        const editButtonWidth = 140;
        const editButtonHeight = 35;
        const editButtonX = centerX - editButtonWidth / 2;
        if (mousePos.x >= editButtonX && mousePos.x <= editButtonX + editButtonWidth &&
            mousePos.y >= editButtonY && mousePos.y <= editButtonY + editButtonHeight) {
            if (window.DiceSystem) {
                window.DiceSystem.state.editMode = !window.DiceSystem.state.editMode;
                // Close unit selection dialog when toggling edit mode off
                if (!window.DiceSystem.state.editMode) {
                    window.DiceSystem.state.unitSelectionDialog = null;
                }
            }
            return true;
        }
        
        return false;
    }
};

