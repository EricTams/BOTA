// tooltip.js - Tooltip UI Element
// Renders ability tooltips with description, formula, and power-up slots

const Tooltip = {
    /**
     * Render a tooltip for an ability
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} tooltip - Tooltip state from DiceSystem
     */
    render(ctx, canvas, tooltip) {
        if (!tooltip || !tooltip.visible) return;
        
        const DS = window.DiceSystem;
        if (!DS) return;
        
        // Get ability data based on tooltip source
        let ability;
        let face;
        
        if (tooltip.source === 'status_effect') {
            ability = getAbilityData(tooltip.abilityIcon);
            if (!ability) return;
        } else if (tooltip.source === 'expanded_unit_panel') {
            if (DS.state.expandedUnitPanel && DS.state.expandedUnitPanel.faceBounds) {
                const fb = DS.state.expandedUnitPanel.faceBounds.find(
                    b => b.dieIndex === tooltip.dieIndex && b.faceIndex === tooltip.faceIndex
                );
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
            // Normal die face tooltip
            if (tooltip.dieIndex === null || tooltip.dieIndex < 0) return;
            const die = DS.state.dice[tooltip.dieIndex];
            face = die.faces[tooltip.faceIndex];
            if (!face.icon) return;
            ability = getAbilityData(face.icon);
            if (!ability) return;
        }
        
        // Calculate tooltip content
        const filledCount = tooltip.filledSlots.filter(f => f).length;
        const formatted = formatAbilityDescription(ability, filledCount);
        const calc = formatted.calculation;
        
        // Measure text to calculate tooltip size
        ctx.font = 'bold 16px Arial';
        const titleWidth = ctx.measureText(ability.displayName).width;
        ctx.font = '14px Arial';
        const descWidth = ctx.measureText(formatted.description).width;
        const formulaText = calc.hasSlots ? `${calc.formula} = ${calc.result} ${calc.valueType}` : `${calc.result} ${calc.valueType}`;
        const formulaWidth = ctx.measureText(formulaText).width;
        
        const tooltipWidth = Math.max(titleWidth, descWidth, formulaWidth, 200) + 40;
        const slotRowHeight = ability.powerUpSlots > 0 ? 30 : 0;
        const tooltipHeight = 100 + slotRowHeight;
        
        // Position tooltip (adjust to stay on screen)
        let x = tooltip.x;
        let y = tooltip.y;
        if (x + tooltipWidth > canvas.width) x = canvas.width - tooltipWidth - 10;
        if (y + tooltipHeight > canvas.height) y = canvas.height - tooltipHeight - 10;
        
        // Draw tooltip panel
        Panel.draw(ctx, x, y, tooltipWidth, tooltipHeight, {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderColor: '#FFD700',
            borderWidth: 2,
            glow: false
        });
        
        // Draw ability name
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(ability.displayName, x + 20, y + 25);
        
        // Draw description
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.fillText(formatted.description, x + 20, y + 50);
        
        // Draw formula/result
        ctx.fillStyle = '#AAFFAA';
        ctx.fillText(formulaText, x + 20, y + 70);
        
        // Draw power-up slots if applicable
        if (ability.powerUpSlots > 0) {
            this.drawPowerUpSlots(ctx, x, y, ability, tooltip, DS.colors);
        }
    },
    
    /**
     * Draw power-up slots visualization
     */
    drawPowerUpSlots(ctx, x, y, ability, tooltip, colors) {
        const filledCount = tooltip.filledSlots.filter(f => f).length;
        
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Power-up slots (X = ${filledCount}):`, x + 20, y + 90);
        
        const slotSize = 20;
        const slotSpacing = 5;
        
        for (let i = 0; i < ability.powerUpSlots; i++) {
            const sx = x + 20 + i * (slotSize + slotSpacing);
            const sy = y + 95;
            const slotColor = ability.powerUpColors[i];
            const isFilled = tooltip.filledSlots[i] === true;
            
            // Draw slot border
            ctx.strokeStyle = colors[slotColor] || '#888888';
            ctx.lineWidth = 2;
            ctx.strokeRect(sx, sy, slotSize, slotSize);
            
            // Fill slot if filled
            if (isFilled) {
                ctx.fillStyle = colors[slotColor] || '#888888';
                ctx.fillRect(sx + 2, sy + 2, slotSize - 4, slotSize - 4);
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(sx + 2, sy + 2, slotSize - 4, slotSize - 4);
            }
        }
    }
};

