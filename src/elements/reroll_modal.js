// reroll_modal.js - Reroll Modal UI Element
// Renders the modal for selecting dice to reroll

const RerollModal = {
    /**
     * Render the reroll modal
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} modal - Modal state from DiceSystem
     */
    render(ctx, canvas, modal) {
        if (!modal) return;
        
        // Draw darkening overlay
        Panel.drawOverlay(ctx, canvas.width, canvas.height);
        
        const panelWidth = 600;
        const panelHeight = 450;
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = (canvas.height - panelHeight) / 2;
        
        modal.bounds = { x: panelX, y: panelY, width: panelWidth, height: panelHeight };
        
        // Draw panel
        Panel.draw(ctx, panelX, panelY, panelWidth, panelHeight, {
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            borderColor: '#FFAA66',
            borderWidth: 3,
            glow: true,
            glowColor: '#FFAA66',
            glowBlur: 15
        });
        
        // Draw title
        ctx.fillStyle = '#FFAA66';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Select Dice to Reroll', panelX + panelWidth / 2, panelY + 40);
        
        // Draw instruction
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '14px Arial';
        ctx.fillText('Click dice to select/deselect', panelX + panelWidth / 2, panelY + 70);
        
        // Draw dice with checkboxes
        this.drawDiceSelection(ctx, modal, panelX, panelY);
        
        // Draw buttons
        this.drawButtons(ctx, modal, panelX, panelY, panelWidth, panelHeight);
        
        ctx.textAlign = 'left';
    },
    
    /**
     * Draw dice selection grid with checkboxes
     */
    drawDiceSelection(ctx, modal, panelX, panelY) {
        const DS = window.DiceSystem;
        if (!DS) return;
        
        const availableDice = (window.CombatManager?.state?.rolledDice || []).filter(d => !d.assigned);
        const diceStartY = panelY + 100;
        const diceSize = 80;
        const diceSpacing = 20;
        const dicePerRow = 4;
        
        modal.checkboxBounds = [];
        
        availableDice.forEach((rolledDie, idx) => {
            const row = Math.floor(idx / dicePerRow);
            const col = idx % dicePerRow;
            const dieX = panelX + 50 + col * (diceSize + diceSpacing);
            const dieY = diceStartY + row * (diceSize + diceSpacing + 30);
            const isSelected = modal.selectedDice.includes(rolledDie.dieIndex);
            
            modal.checkboxBounds.push({ 
                x: dieX, 
                y: dieY, 
                width: diceSize, 
                height: diceSize, 
                dieIndex: rolledDie.dieIndex 
            });
            
            const die = DS.state.dice[rolledDie.dieIndex];
            const face = die.faces[rolledDie.faceIndex];
            
            // Draw die face
            DS.drawDieFace(ctx, face, dieX, dieY, diceSize, false);
            
            // Draw selection border if selected
            if (isSelected) {
                ctx.save();
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 4;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                ctx.strokeRect(dieX, dieY, diceSize, diceSize);
                ctx.restore();
            }
            
            // Draw checkbox
            const checkboxSize = 24;
            const checkboxX = dieX + diceSize / 2 - checkboxSize / 2;
            const checkboxY = dieY + diceSize + 5;
            
            ctx.fillStyle = isSelected ? '#FFD700' : '#333333';
            ctx.fillRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
            
            // Draw checkmark if selected
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
    },
    
    /**
     * Draw Cancel and Confirm buttons
     */
    drawButtons(ctx, modal, panelX, panelY, panelWidth, panelHeight) {
        const buttonY = panelY + panelHeight - 60;
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonSpacing = 20;
        const cancelX = panelX + panelWidth / 2 - buttonWidth - buttonSpacing / 2;
        const confirmX = panelX + panelWidth / 2 + buttonSpacing / 2;
        const canConfirm = modal.selectedDice.length > 0;
        
        modal.cancelButton = { x: cancelX, y: buttonY, width: buttonWidth, height: buttonHeight };
        modal.confirmButton = { x: confirmX, y: buttonY, width: buttonWidth, height: buttonHeight };
        
        // Cancel button
        Button.draw(
            ctx,
            cancelX,
            buttonY,
            buttonWidth,
            buttonHeight,
            'Cancel',
            true,
            false,
            {
                bgEnabled: '#663333',
                borderEnabled: '#FF8888',
                textEnabled: '#FFFFFF',
                fontSize: 'bold 16px'
            }
        );
        
        // Confirm button
        Button.draw(
            ctx,
            confirmX,
            buttonY,
            buttonWidth,
            buttonHeight,
            'Confirm',
            canConfirm,
            false,
            {
                bgEnabled: '#336633',
                bgDisabled: '#333333',
                borderEnabled: '#88FF88',
                borderDisabled: '#555555',
                textEnabled: '#FFFFFF',
                textDisabled: '#666666',
                fontSize: 'bold 16px'
            }
        );
    }
};

