// expanded_ability_panel.js - Expanded Ability Panel UI Element
// Renders the ability execution panel with main die, power-up slots, and execute/cancel buttons

const ExpandedAbilityPanel = {
    /**
     * Render the expanded ability panel
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} expanded - Expanded ability state from CombatManager
     * @param {Object} faceTextures - Die face textures array (indexed by die index)
     * @param {Object} layout - Layout constants from CombatUI
     * @param {Object} colors - Color palette from DiceSystem
     */
    render(ctx, canvas, expanded, faceTextures, layout, colors) {
        if (!expanded) return;
        
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
        ctx.restore();
        
        // Draw panel using Panel component
        Panel.draw(ctx, panelX, panelY, panelWidth, panelHeight, {
            backgroundColor: '#1a1a2e',
            borderColor: '#00FFFF',
            borderWidth: 3,
            glow: true,
            glowColor: '#00FFFF',
            glowBlur: 20
        });
        
        // Ensure no inherited filters/alpha affect content
        ctx.save();
        ctx.globalAlpha = 1.0;
        if (typeof ctx.filter === 'string') ctx.filter = 'none';
        
        const centerX = panelX + panelWidth / 2;
        
        // Draw main die face icon
        const mainDie = (window.CombatManager && window.CombatManager.state && window.CombatManager.state.rolledDice)
            ? window.CombatManager.state.rolledDice[expanded.dieIndex]
            : null;
            
        if (mainDie && mainDie.face && mainDie.face.icon) {
            const iconSize = 70;
            const iconX = panelX + 15;
            const iconY = panelY + 15;
            const texturesForDie = faceTextures && faceTextures[expanded.dieIndex];
            const texture = texturesForDie ? texturesForDie[mainDie.faceIndex] : null;
            
            if (texture) {
                ctx.drawImage(texture, iconX, iconY, iconSize, iconSize);
                ctx.strokeStyle = '#00FFFF';
                ctx.lineWidth = 3;
                ctx.strokeRect(iconX, iconY, iconSize, iconSize);
            }
        }
        
        // Draw ability name and computed description
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
        
        // Draw power-up slots
        this.drawPowerUpSlots(ctx, panelX, panelY, panelWidth, expanded, faceTextures, colors);
        
        // Draw instructions
        ctx.font = '14px Arial';
        ctx.fillStyle = '#CCCCCC';
        ctx.textAlign = 'center';
        
        CombatManager.ensureState();
        if (CombatManager.state.targetingMode) {
            ctx.fillStyle = '#FFFF00';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('Select a target (click outside to cancel)', centerX, panelY + 185);
        } else {
            ctx.fillText('Click other dice to add power-ups', centerX, panelY + 185);
        }
        
        // Draw buttons
        this.drawButtons(ctx, panelX, panelY, panelWidth);
        
        ctx.restore();
        ctx.textAlign = 'left'; // Reset
    },
    
    /**
     * Draw power-up slots
     */
    drawPowerUpSlots(ctx, panelX, panelY, panelWidth, expanded, faceTextures, colors) {
        const centerX = panelX + panelWidth / 2;
        const maxSlots = expanded.ability.powerUpSlots || 0;
        const slotSize = 40;
        const slotSpacing = 10;
        const totalSlotsWidth = maxSlots * (slotSize + slotSpacing) - slotSpacing;
        const slotsX = centerX - totalSlotsWidth / 2;
        const slotsY = panelY + 120;
        const filledSlots = expanded.powerUpDice.length;
        
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
            
            // Slot background
            ctx.fillStyle = filled ? (colors[color + 'Light'] || colors[color] || '#666666') : '#2a2a2a';
            ctx.fillRect(x, slotsY, slotSize, slotSize);
            
            // Slot border
            ctx.strokeStyle = filled ? '#FFD700' : '#444444';
            ctx.lineWidth = filled ? 3 : 2;
            ctx.strokeRect(x, slotsY, slotSize, slotSize);
            
            // Draw die face icon if filled
            if (filled && expanded.powerUpDice[i] !== undefined) {
                const powerUpDieIdx = expanded.powerUpDice[i];
                const powerUpDie = (window.CombatManager && window.CombatManager.state && window.CombatManager.state.rolledDice)
                    ? window.CombatManager.state.rolledDice[powerUpDieIdx]
                    : null;
                    
                if (powerUpDie && powerUpDie.face && powerUpDie.face.icon) {
                    const pudTextures = faceTextures && faceTextures[powerUpDieIdx];
                    const texture = pudTextures ? pudTextures[powerUpDie.faceIndex] : null;
                    if (texture) {
                        ctx.drawImage(texture, x, slotsY, slotSize, slotSize);
                    }
                }
            }
        }
    },
    
    /**
     * Draw Cancel/Execute buttons
     */
    drawButtons(ctx, panelX, panelY, panelWidth) {
        const centerX = panelX + panelWidth / 2;
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
        ctx.textAlign = 'center';
        ctx.fillText('Cancel', cancelX + buttonWidth / 2, buttonY + 23);
        
        // Execute button (or "Cancel" in targeting mode)
        CombatManager.ensureState();
        const inTargetingMode = CombatManager.state.targetingMode !== null;
        
        if (inTargetingMode) {
            // Show "Cancel Targeting" instead
            ctx.fillStyle = '#664422';
            ctx.fillRect(executeX, buttonY, buttonWidth, buttonHeight);
            ctx.strokeStyle = '#AA8844';
            ctx.lineWidth = 2;
            ctx.strokeRect(executeX, buttonY, buttonWidth, buttonHeight);
            ctx.fillStyle = '#CCCCCC';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('Cancel', executeX + buttonWidth / 2, buttonY + 23);
        } else {
            // Normal execute button
            ctx.fillStyle = '#44AA44';
            ctx.fillRect(executeX, buttonY, buttonWidth, buttonHeight);
            ctx.strokeStyle = '#66FF66';
            ctx.lineWidth = 2;
            ctx.strokeRect(executeX, buttonY, buttonWidth, buttonHeight);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('Execute', executeX + buttonWidth / 2, buttonY + 23);
        }
        
        // Store button bounds for click detection
        const ds = window.DiceSystem;
        if (ds && ds.state) {
            if (!ds.state._expandedButtons) ds.state._expandedButtons = {};
            ds.state._expandedButtons.cancel = { x: cancelX, y: buttonY, width: buttonWidth, height: buttonHeight };
            ds.state._expandedButtons.execute = { x: executeX, y: buttonY, width: buttonWidth, height: buttonHeight };
        }
    },
    
    /**
     * Handle click on expanded ability panel
     * @param {Object} mousePos - Mouse position {x, y}
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Function} onCancelCallback - Callback when cancel is clicked
     * @param {Function} onExecuteCallback - Callback when execute is clicked
     * @returns {boolean} True if click was handled
     */
    handleClick(mousePos, canvas, onCancelCallback, onExecuteCallback) {
        CombatManager.ensureState();
        
        // Don't handle expanded ability clicks if in targeting mode (targeting takes priority)
        if (CombatManager.state.targetingMode) return false;
        
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
            // Cancel targeting mode if active, otherwise cancel expanded ability
            CombatManager.ensureState();
            if (CombatManager.state.targetingMode) {
                CombatManager.state.targetingMode = null;
            } else if (onCancelCallback) {
                onCancelCallback();
            }
            return true;
        }
        
        if (hit(btns?.execute) || (mousePos.x >= executeX && mousePos.x <= executeX + buttonWidth &&
            mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight)) {
            CombatManager.ensureState();
            // If in targeting mode, cancel targeting
            if (CombatManager.state.targetingMode) {
                CombatManager.state.targetingMode = null;
                return true;
            }
            // Otherwise execute (which may enter targeting mode)
            if (onExecuteCallback) {
                onExecuteCallback();
            }
            return true;
        }
        
        return false;
    }
};

