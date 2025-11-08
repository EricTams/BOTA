// combat_log.js - Combat Log UI Element
// Renders the combat log panel showing recent combat events

const CombatLog = {
    /**
     * Render the combat log panel
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     */
    render(ctx, canvas) {
        // Combat is a global constant, not on window
        if (typeof Combat === 'undefined' || !Combat.state) return;
        
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
    }
};

