// rolling_box.js - Rolling Box UI Element
// Renders the dice rolling area with 3D dice and highlighting

const RollingBox = {
    /**
     * Render the rolling box with 3D dice
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} layout - Layout constants from CombatUI
     */
    render(ctx, canvas, layout) {
        if (!window.DiceSystem) return;
        
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

        // Draw dice in a grid (up to 2 rows)
        this.renderDiceGrid(ctx, canvas, layout, boxY, centerX);
    },
    
    /**
     * Render the dice grid with highlighting
     */
    renderDiceGrid(ctx, canvas, layout, boxY, centerX) {
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
            
            // Check die state for highlighting
            const rolledDie = (window.CombatManager?.state?.rolledDice || []).find(rd => rd.dieIndex === i);
            const expanded = testState.expandedAbility;
            const isMainDie = expanded && i === expanded.dieIndex;
            const isPowerUpDie = expanded && expanded.powerUpDice.includes(i);
            const isAssigned = rolledDie && rolledDie.assigned;
            const notRolledYet = (window.CombatManager?.state?.rolledDice || []).length === 0;
            
            // Draw highlighting borders
            this.drawDieHighlight(ctx, dieX, diceY, layout, isMainDie, isPowerUpDie, isAssigned);
            
            // Darken inactive dice (main die, assigned, or not rolled yet)
            const shouldDarken = (isMainDie || isAssigned || notRolledYet) && !isPowerUpDie;
            if (shouldDarken) {
                ctx.save();
                ctx.filter = 'brightness(0.4) saturate(0.3)';
            }
            
            // Delegate to DiceSystem for actual 3D die rendering
            window.DiceSystem.drawPerspectiveDie(ctx, die, dieX, diceY + state.yOffset, 
                                    layout.dieSize, state, i);
            
            if (shouldDarken) {
                ctx.restore();
            }
        }
    },
    
    /**
     * Draw highlight borders around dice based on their state
     */
    drawDieHighlight(ctx, dieX, diceY, layout, isMainDie, isPowerUpDie, isAssigned) {
        if (isMainDie) {
            // Main die: bright cyan border with strong glow
            ctx.save();
            const borderSize = layout.dieSize * 1.4;
            
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
            // Power-up die: gold border with strong glow
            ctx.save();
            const borderSize = layout.dieSize * 1.4;
            
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
            // Assigned die: dark gray border
            ctx.save();
            const borderSize = layout.dieSize * 1.3;
            
            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 3;
            ctx.strokeRect(dieX - borderSize / 2, diceY - borderSize / 2, borderSize, borderSize);
            
            ctx.restore();
        }
    }
};

