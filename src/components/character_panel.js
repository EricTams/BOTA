// BOTA - Character Panel Component
// Responsibilities:
// - Render a single character panel (portrait, HP, armor, status effects)
// - Handle hover states for status effects
// - Provide hit testing for interactive elements
// Not responsible for:
// - Combat logic (Combat/CombatManager)
// - Input handling (handled by caller)

const CharacterPanel = {
    // Draw a character panel
    // unit: { id, name, hp, maxHp, armor, statusEffects, portrait }
    // x, y: top-left position
    // isPlayer: true for player (blue theme), false for enemy (orange theme)
    // portraits: object mapping unit.id to Image objects
    draw(ctx, unit, x, y, isPlayer, portraits) {
        console.log('CharacterPanel.draw - Drawing unit:', unit.name, 'at', x, y);
        
        const width = 240;
        const portraitSize = 80;
        
        // Draw portrait
        this.drawPortrait(ctx, unit, x, y, portraitSize, isPlayer, portraits);
        
        // Draw name and HP bar to the right of portrait
        const infoX = x + portraitSize + 10;
        this.drawName(ctx, unit, infoX, y + 16, isPlayer);
        this.drawHPBar(ctx, unit, infoX, y + 30, width - portraitSize - 10, 30);
        
        // Draw armor below portrait if unit has armor
        if (unit.armor > 0) {
            this.drawArmor(ctx, unit, x, y + portraitSize + 10);
        }
        
        // Draw status effects below HP bar
        if (unit.statusEffects && unit.statusEffects.length > 0) {
            const effectsY = y + 30 + 30 + 5; // Below HP bar
            this.drawStatusEffects(ctx, unit.statusEffects, infoX, effectsY, isPlayer);
        }
        
        // Return button position for external drawing
        const statusHeight = (unit.statusEffects && unit.statusEffects.length > 0) ? 50 : 15;
        const buttonY = y + 30 + 30 + statusHeight;
        
        console.log('CharacterPanel.draw - Returning button bounds at', infoX, buttonY);
        
        return {
            buttonX: infoX,
            buttonY: buttonY,
            buttonWidth: 100,
            buttonHeight: 25
        };
    },
    
    // Draw character portrait
    drawPortrait(ctx, unit, x, y, size, isPlayer, portraits) {
        if (unit.portrait && portraits && portraits[unit.id]) {
            // Draw portrait image
            ctx.save();
            
            // Flip enemy portraits horizontally to face the player
            if (!isPlayer) {
                ctx.translate(x + size, y);
                ctx.scale(-1, 1);
                ctx.drawImage(portraits[unit.id], 0, 0, size, size);
            } else {
                ctx.drawImage(portraits[unit.id], x, y, size, size);
            }
            
            ctx.restore();
            
            // Draw border (always in normal orientation)
            ctx.strokeStyle = isPlayer ? '#44CCFF' : '#FF8844';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, size, size);
        } else {
            // Draw placeholder
            ctx.fillStyle = '#222222';
            ctx.fillRect(x, y, size, size);
            ctx.strokeStyle = isPlayer ? '#44CCFF' : '#FF8844';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, size, size);
            
            // Draw first letter as placeholder
            ctx.fillStyle = isPlayer ? '#44CCFF' : '#FF8844';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(unit.name.charAt(0), x + size / 2, y + size / 2 + 16);
            ctx.textAlign = 'left';
        }
    },
    
    // Draw character name
    drawName(ctx, unit, x, y, isPlayer) {
        ctx.fillStyle = isPlayer ? '#44CCFF' : '#FF8844';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(unit.name, x, y);
    },
    
    // Draw HP bar
    drawHPBar(ctx, unit, x, y, width, height) {
        const hpPercent = unit.hp / unit.maxHp;
        
        // Dark red background
        ctx.fillStyle = '#3D0000';
        ctx.fillRect(x, y, width, height);
        
        // HP fill (gradient red)
        const gradient = ctx.createLinearGradient(x, y, x + width * hpPercent, y);
        if (hpPercent > 0.5) {
            gradient.addColorStop(0, '#8B0000');
            gradient.addColorStop(1, '#B22222');
        } else if (hpPercent > 0.25) {
            gradient.addColorStop(0, '#8B0000');
            gradient.addColorStop(1, '#DC143C');
        } else {
            gradient.addColorStop(0, '#B22222');
            gradient.addColorStop(1, '#FF0000');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width * hpPercent, height);
        
        // HP bar border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // HP text (white)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${unit.hp} / ${unit.maxHp}`, x + width / 2, y + height / 2 + 5);
        ctx.textAlign = 'left';
    },
    
    // Draw armor value
    drawArmor(ctx, unit, x, y) {
        ctx.fillStyle = '#AAAAFF';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`🛡 Armor: ${unit.armor}`, x, y);
    },
    
    // Draw status effects as icon badges
    drawStatusEffects(ctx, statusEffects, x, y, isPlayer) {
        const effectSize = 35;
        const effectSpacing = 5;
        let offsetX = 0;
        
        for (let i = 0; i < statusEffects.length; i++) {
            const effect = statusEffects[i];
            const effectX = x + offsetX;
            const effectY = y;
            
            // Store bounds for hover detection
            effect._bounds = { x: effectX, y: effectY, width: effectSize, height: effectSize };
            
            // Determine border color based on effect type
            let borderColor;
            if (effect.type === 'poison' || effect.type === 'bleed') {
                borderColor = '#8B1A55'; // Debuff/DoT: deep purple-red
            } else if (effect.type === 'regen' || effect.type === 'regenerate') {
                borderColor = '#32CD32'; // HoT: lime green
            } else {
                borderColor = '#32CD32'; // Default to lime green for other effects (buffs)
            }
            
            // Draw background
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(effectX, effectY, effectSize, effectSize);
            
            // Draw border with glow
            ctx.save();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.shadowColor = borderColor;
            ctx.shadowBlur = 8;
            ctx.strokeRect(effectX, effectY, effectSize, effectSize);
            ctx.shadowBlur = 0;
            ctx.restore();
            
            // Draw the value (large, centered)
            if (effect.value && effect.value > 0) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(effect.value, effectX + effectSize / 2, effectY + effectSize / 2 + 6);
            }
            
            // Draw duration (small, bottom-right corner)
            if (effect.duration !== undefined && effect.duration > 0) {
                ctx.fillStyle = '#FFFF00';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(effect.duration, effectX + effectSize - 3, effectY + effectSize - 3);
            }
            
            ctx.textAlign = 'left';
            offsetX += effectSize + effectSpacing;
        }
    },
    
    // Check if mouse is hovering over a status effect
    // Returns the effect if hovering, null otherwise
    checkStatusEffectHover(statusEffects, mousePos) {
        if (!statusEffects) return null;
        
        for (const effect of statusEffects) {
            if (effect._bounds && 
                mousePos.x >= effect._bounds.x && mousePos.x <= effect._bounds.x + effect._bounds.width &&
                mousePos.y >= effect._bounds.y && mousePos.y <= effect._bounds.y + effect._bounds.height) {
                return effect;
            }
        }
        
        return null;
    }
};

