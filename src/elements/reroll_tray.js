// reroll_tray.js - Reroll Tray UI Element (for test mode)
// Renders the reroll tray with selected dice for rerolling

const RerollTray = {
    /**
     * Render the reroll tray (test mode only)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} layout - Layout constants from CombatUI
     */
    render(ctx, canvas, layout) {
        if (!window.DiceSystem) return;
        
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
    }
};

