// expanded_unit_panel.js - Expanded Unit Panel UI Element
// Renders the panel showing all unwrapped faces of a unit's dice

const ExpandedUnitPanel = {
    /**
     * Render the expanded unit panel with darkening overlay
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} expanded - Expanded unit panel state
     */
    render(ctx, canvas, expanded) {
        if (!expanded) return;
        
        // Map unitId to the correct unit
        const { unit, isPlayer } = this.findUnit(expanded.unitId);
        if (!unit) return;
        
        // Use dice stored in the unit
        const diceNames = unit.dice;
        if (!diceNames || diceNames.length === 0) {
            console.warn('No dice found for unit:', unit.id);
            return;
        }
        
        // Draw full screen darkening overlay
        Panel.drawOverlay(ctx, canvas.width, canvas.height, {
            color: 'rgba(0, 0, 0, 0.75)'
        });
        
        // Calculate panel dimensions
        const panelWidth = 700;
        const panelHeight = 400;
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = (canvas.height - panelHeight) / 2;
        
        // Store panel bounds for click detection
        expanded.bounds = { x: panelX, y: panelY, width: panelWidth, height: panelHeight };
        
        // Draw themed panel
        Panel.drawWithTitle(ctx, panelX, panelY, panelWidth, panelHeight, `${unit.name}'s Dice`, {
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            borderColor: isPlayer ? '#44CCFF' : '#FF8844',
            borderWidth: 3,
            glow: true,
            glowColor: isPlayer ? '#44CCFF' : '#FF8844',
            glowBlur: 15,
            titleColor: isPlayer ? '#44CCFF' : '#FF8844',
            titleFont: 'bold 20px Arial',
            titleAlign: 'center'
        });
        
        // Draw unwrapped dice
        this.drawUnwrappedDice(ctx, expanded, diceNames, panelX, panelY, panelWidth);
        
        // Draw close instruction
        ctx.fillStyle = '#999999';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click outside to close', panelX + panelWidth / 2, panelY + panelHeight - 15);
        ctx.textAlign = 'left';
    },
    
    /**
     * Find unit by ID in player or enemy units
     */
    findUnit(unitId) {
        let unit = null;
        let isPlayer = false;
        
        // Try to find by unit ID in arrays
        for (const u of Combat.state.playerUnits) {
            if (u.id === unitId) {
                unit = u;
                isPlayer = true;
                break;
            }
        }
        
        if (!unit) {
            for (const u of Combat.state.enemyUnits) {
                if (u.id === unitId) {
                    unit = u;
                    isPlayer = false;
                    break;
                }
            }
        }
        
        // Fallback to legacy hardcoded IDs
        if (!unit) {
            switch (unitId) {
                case 'player_captain':
                case 'player':
                    unit = Combat.state.playerUnits.length > 0 ? Combat.state.playerUnits[0] : null;
                    isPlayer = true;
                    break;
                case 'player_crew':
                    unit = Combat.state.playerUnits.find(u => u.id.includes('crew')) || null;
                    isPlayer = true;
                    break;
                case 'enemy_captain':
                case 'enemy':
                    unit = Combat.state.enemyUnits.length > 0 ? Combat.state.enemyUnits[0] : null;
                    isPlayer = false;
                    break;
                case 'enemy_crew':
                    unit = Combat.state.enemyUnits.find(u => u.id.includes('crew')) || null;
                    isPlayer = false;
                    break;
                default:
                    console.warn('Unknown unitId:', unitId);
                    return { unit: null, isPlayer: false };
            }
        }
        
        return { unit, isPlayer };
    },
    
    /**
     * Draw all unwrapped dice faces
     */
    drawUnwrappedDice(ctx, expanded, diceNames, panelX, panelY, panelWidth) {
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
                if (window.DiceSystem) {
                    window.DiceSystem.drawDieFace(ctx, face, faceX, dieY, faceSize, false);
                }
            }
        });
    }
};

