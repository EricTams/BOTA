// dice_icons.js - Vector art icon drawing for dice faces (pure drawing helpers)
// Responsibilities:
// - Provide drawing routines for ability icons used on die faces
// - Take a canvas context and center (x,y) with a size; draw only within those bounds
// Not responsible for:
// - Layout/positioning/tooltip text (CombatUI)
// - Combat logic or ability values (Combat, dice_abilities)
// - Face background/borders (Die)

const DiceIcons = {
    // Draw Culling Blade icon - axe blade for execute ability
    drawCullingBladeIcon(ctx, x, y, size) {
        const s = size * 0.4; // Scale factor
        
        ctx.save();
        ctx.translate(x, y);
        
        // Axe blade (triangle)
        ctx.fillStyle = '#CC2222';
        ctx.beginPath();
        ctx.moveTo(-s * 0.8, -s * 0.6);
        ctx.lineTo(s * 0.8, 0);
        ctx.lineTo(-s * 0.8, s * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // Handle
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(s * 0.3, -s * 0.15, s * 0.8, s * 0.3);
        
        ctx.restore();
    },

    // Draw Counter Helix icon - spinning blades
    drawCounterHelixIcon(ctx, x, y, size) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Draw 4 spinning blades
        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.rotate((Math.PI / 2) * i + Math.PI / 4);
            
            // Blade
            ctx.fillStyle = '#DD3333';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(s * 0.8, -s * 0.2);
            ctx.lineTo(s * 0.8, s * 0.2);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
        
        // Center circle
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },

    // Draw Berserker's Call icon - taunt symbol
    drawBerserkersCallIcon(ctx, x, y, size) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Angry face outline
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = s * 0.15;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        
        // Angry eyes
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(-s * 0.4, -s * 0.3, s * 0.25, s * 0.15);
        ctx.fillRect(s * 0.15, -s * 0.3, s * 0.25, s * 0.15);
        
        // Angry mouth (downward arc)
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = s * 0.12;
        ctx.beginPath();
        ctx.arc(0, s * 0.1, s * 0.4, 0.3, Math.PI - 0.3);
        ctx.stroke();
        
        ctx.restore();
    },

    // Draw Chop icon - simple axe swing
    drawChopIcon(ctx, x, y, size) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 4);
        
        // Axe head
        ctx.fillStyle = '#999999';
        ctx.fillRect(-s * 0.3, -s * 0.8, s * 0.6, s * 0.4);
        
        // Handle
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-s * 0.1, -s * 0.4, s * 0.2, s * 1.0);
        
        // Motion lines
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = s * 0.08;
        ctx.beginPath();
        ctx.moveTo(s * 0.5, -s * 0.9);
        ctx.lineTo(s * 0.8, -s * 0.6);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(s * 0.6, -s * 0.7);
        ctx.lineTo(s * 0.9, -s * 0.4);
        ctx.stroke();
        
        ctx.restore();
    },

    // Draw Jab icon - quick punch
    drawJabIcon(ctx, x, y, size) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Fist
        ctx.fillStyle = '#FFE4C4';
        ctx.beginPath();
        ctx.arc(s * 0.3, 0, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // Arm
        ctx.fillStyle = '#FFE4C4';
        ctx.fillRect(-s * 0.6, -s * 0.2, s * 0.9, s * 0.4);
        
        // Speed lines
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = s * 0.1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(s * 0.7, -s * 0.4 + i * s * 0.4);
            ctx.lineTo(s * 1.0, -s * 0.4 + i * s * 0.4);
            ctx.stroke();
        }
        
        ctx.restore();
    },

    // Draw Dodge icon - agility/evasion symbol
    drawDodgeIcon(ctx, x, y, size) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Curved arrow showing dodge movement
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = s * 0.15;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.6, Math.PI * 0.7, Math.PI * 1.8);
        ctx.stroke();
        
        // Arrow head
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.moveTo(-s * 0.6, s * 0.3);
        ctx.lineTo(-s * 0.8, s * 0.5);
        ctx.lineTo(-s * 0.4, s * 0.5);
        ctx.closePath();
        ctx.fill();
        
        // Original position (small circle)
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        ctx.arc(s * 0.5, -s * 0.2, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },

    // Draw Slash icon - sword slash
    drawSlashIcon(ctx, x, y, size) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 4);
        
        // Sword blade
        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(-s * 0.1, -s * 0.9, s * 0.2, s * 1.2);
        
        // Cross guard
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-s * 0.4, s * 0.3, s * 0.8, s * 0.15);
        
        // Slash effect
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = s * 0.12;
        ctx.beginPath();
        ctx.moveTo(-s * 0.8, -s * 0.8);
        ctx.lineTo(s * 0.6, s * 0.6);
        ctx.stroke();
        
        ctx.restore();
    },

    // Draw Heal icon - medical cross
    drawHealIcon(ctx, x, y, size) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Cross
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(-s * 0.2, -s * 0.8, s * 0.4, s * 1.6); // Vertical
        ctx.fillRect(-s * 0.8, -s * 0.2, s * 1.6, s * 0.4); // Horizontal
        
        // Glow effect
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.9, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },

    // Draw Bleed icon - blood drops
    drawBleedIcon(ctx, x, y, size) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Three blood drops at different positions
        const drops = [
            { x: -s * 0.3, y: -s * 0.4, size: 0.3 },
            { x: s * 0.2, y: -s * 0.2, size: 0.25 },
            { x: 0, y: s * 0.3, size: 0.35 }
        ];
        
        drops.forEach(drop => {
            ctx.fillStyle = '#8B0000';
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y - s * drop.size);
            ctx.bezierCurveTo(
                drop.x - s * drop.size * 0.5, drop.y - s * drop.size * 0.3,
                drop.x - s * drop.size * 0.5, drop.y + s * drop.size * 0.3,
                drop.x, drop.y + s * drop.size * 0.6
            );
            ctx.bezierCurveTo(
                drop.x + s * drop.size * 0.5, drop.y + s * drop.size * 0.3,
                drop.x + s * drop.size * 0.5, drop.y - s * drop.size * 0.3,
                drop.x, drop.y - s * drop.size
            );
            ctx.fill();
        });
        
        ctx.restore();
    },

    // Draw Poison icon - skull
    drawPoisonIcon(ctx, x, y, size) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Skull
        ctx.fillStyle = '#9932CC';
        ctx.beginPath();
        ctx.arc(0, -s * 0.2, s * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye sockets
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-s * 0.25, -s * 0.3, s * 0.15, 0, Math.PI * 2);
        ctx.arc(s * 0.25, -s * 0.3, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Jaw
        ctx.fillStyle = '#9932CC';
        ctx.beginPath();
        ctx.arc(0, s * 0.3, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },

    // Draw Regenerate icon - heart with plus
    drawRegenerateIcon(ctx, x, y, size) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Heart shape
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s * 0.8, -s * 0.5, -s * 0.3, -s * 0.9, 0, -s * 0.3);
        ctx.bezierCurveTo(s * 0.3, -s * 0.9, s * 0.8, -s * 0.5, 0, s * 0.3);
        ctx.fill();
        
        // Plus sign
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-s * 0.1, -s * 0.4, s * 0.2, s * 0.6);
        ctx.fillRect(-s * 0.3, -s * 0.2, s * 0.6, s * 0.2);
        
        ctx.restore();
    },

    // Draw Arcane Burst icon - starburst
    drawArcaneBurstIcon(ctx, x, y, size) {
        const s = size * 0.4;
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = s * 0.15;
        for (let i = 0; i < 8; i++) {
            ctx.save();
            ctx.rotate((Math.PI / 4) * i);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -s * 0.9);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    },

    // Draw Arcane Chain icon - zigzag chain lightning
    drawArcaneChainIcon(ctx, x, y, size) {
        const s = size * 0.4;
        ctx.save();
        ctx.translate(x - s * 0.8, y - s * 0.5);
        ctx.strokeStyle = '#66CCFF';
        ctx.lineWidth = s * 0.15;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s * 0.6, s * 0.3);
        ctx.lineTo(s * 1.2, -s * 0.2);
        ctx.lineTo(s * 1.8, s * 0.4);
        ctx.lineTo(s * 2.4, 0);
        ctx.stroke();
        ctx.restore();
    },

    // Draw Zap icon - small bolt
    drawZapIcon(ctx, x, y, size) {
        const s = size * 0.4;
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = '#00CCFF';
        ctx.lineWidth = s * 0.18;
        ctx.beginPath();
        ctx.moveTo(-s * 0.6, -s * 0.5);
        ctx.lineTo(-s * 0.1, 0);
        ctx.lineTo(-s * 0.5, 0);
        ctx.lineTo(s * 0.6, s * 0.5);
        ctx.stroke();
        ctx.restore();
    },

    // Draw Telekinesis icon - lifted cube
    drawTelekenesisIcon(ctx, x, y, size) {
        const s = size * 0.35;
        ctx.save();
        ctx.translate(x, y);
        // Cube
        ctx.fillStyle = '#66AAFF';
        ctx.fillRect(-s, -s, s * 2, s * 2);
        // Up arrows
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = s * 0.12;
        ctx.beginPath();
        ctx.moveTo(-s * 1.2, s * 1.2);
        ctx.lineTo(-s * 0.6, s * 0.3);
        ctx.moveTo(0, s * 1.2);
        ctx.lineTo(0, s * 0.3);
        ctx.moveTo(s * 1.2, s * 1.2);
        ctx.lineTo(s * 0.6, s * 0.3);
        ctx.stroke();
        ctx.restore();
    },

    // Draw Shield icon - defensive shield
    drawShieldIcon(ctx, x, y, size) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Shield outline
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.8);
        ctx.lineTo(s * 0.6, -s * 0.4);
        ctx.lineTo(s * 0.6, s * 0.4);
        ctx.lineTo(0, s * 0.9);
        ctx.lineTo(-s * 0.6, s * 0.4);
        ctx.lineTo(-s * 0.6, -s * 0.4);
        ctx.closePath();
        ctx.fill();
        
        // Shield emblem (cross)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-s * 0.1, -s * 0.5, s * 0.2, s * 0.8);
        ctx.fillRect(-s * 0.4, -s * 0.1, s * 0.8, s * 0.2);
        
        ctx.restore();
    },

    // Draw Slam icon - hull/ram impact
    drawSlamIcon(ctx, x, y, size) {
        const s = size * 0.4;
        ctx.save();
        ctx.translate(x, y);
        // Bow triangle
        ctx.fillStyle = '#AA3333';
        ctx.beginPath();
        ctx.moveTo(-s * 0.9, 0);
        ctx.lineTo(0, -s * 0.6);
        ctx.lineTo(0, s * 0.6);
        ctx.closePath();
        ctx.fill();
        // Impact lines
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = s * 0.12;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s * 0.9, -s * 0.4);
        ctx.moveTo(0, 0);
        ctx.lineTo(s * 0.9, s * 0.4);
        ctx.stroke();
        ctx.restore();
    },

    // Generic fallback for unknown icons
    drawGenericIcon(ctx, x, y, size, iconName) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Draw a placeholder circle with first letter
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw first letter of icon name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${s * 1.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(iconName.charAt(0).toUpperCase(), 0, 0);
        
        ctx.restore();
    },

    // Draw Slam icon - ship ram impact
    drawSlamIcon(ctx, x, y, size) {
        const s = size * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Ship ram (pointed wedge)
        ctx.fillStyle = '#CC2222';
        ctx.beginPath();
        ctx.moveTo(s * 0.8, 0); // Point
        ctx.lineTo(-s * 0.6, -s * 0.6); // Top left
        ctx.lineTo(-s * 0.6, s * 0.6); // Bottom left
        ctx.closePath();
        ctx.fill();
        
        // Impact lines
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = s * 0.12;
        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * s * 0.4;
            ctx.beginPath();
            ctx.moveTo(s * 0.6, offset);
            ctx.lineTo(s * 1.0, offset);
            ctx.stroke();
        }
        
        // Reinforcement lines on ram
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = s * 0.08;
        ctx.beginPath();
        ctx.moveTo(-s * 0.3, -s * 0.3);
        ctx.lineTo(s * 0.5, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s * 0.3, s * 0.3);
        ctx.lineTo(s * 0.5, 0);
        ctx.stroke();
        
        ctx.restore();
    },

    // Main entry point - draws the appropriate icon
    drawIcon(ctx, iconName, x, y, size) {
        // Convert icon name to function name (e.g., "culling_blade" -> "drawCullingBladeIcon")
        const functionName = 'draw' + iconName.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('') + 'Icon';
        
        // Call the specific icon function or fallback to generic
        if (typeof this[functionName] === 'function') {
            this[functionName](ctx, x, y, size);
        } else {
            this.drawGenericIcon(ctx, x, y, size, iconName);
        }
    }
};
