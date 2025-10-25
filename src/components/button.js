// button.js - Reusable button component for canvas rendering
// Provides consistent button styling and interaction across the game

const Button = {
    /**
     * Draw a button on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position (top-left corner)
     * @param {number} y - Y position (top-left corner)
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @param {string} text - Button label text
     * @param {boolean} enabled - Whether button is enabled/clickable
     * @param {boolean} hovered - Whether button is currently hovered
     * @param {Object} style - Optional style overrides
     */
    draw(ctx, x, y, width, height, text, enabled = true, hovered = false, style = {}) {
        // Default colors
        const defaults = {
            bgEnabled: '#446644',
            bgHovered: '#557755',
            bgDisabled: '#333333',
            borderEnabled: '#88aa88',
            borderDisabled: '#555555',
            textEnabled: '#ffffff',
            textDisabled: '#666666',
            fontSize: '16px',
            fontFamily: 'Arial'
        };
        
        // Merge with custom styles
        const colors = { ...defaults, ...style };
        
        // Background
        if (enabled) {
            ctx.fillStyle = hovered ? colors.bgHovered : colors.bgEnabled;
        } else {
            ctx.fillStyle = colors.bgDisabled;
        }
        ctx.fillRect(x, y, width, height);

        // Border
        ctx.strokeStyle = enabled ? colors.borderEnabled : colors.borderDisabled;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Text
        ctx.fillStyle = enabled ? colors.textEnabled : colors.textDisabled;
        ctx.font = `${colors.fontSize} ${colors.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + width / 2, y + height / 2);
        
        // Reset text alignment
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    },
    
    /**
     * Draw a small badge inside the button (bottom-right by default)
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x - Button X
     * @param {number} y - Button Y
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @param {string} text - Badge text
     * @param {Object} style - Optional style: { color, fontSize, offsetX, offsetY }
     */
    drawBadge(ctx, x, y, width, height, text, style = {}) {
        const color = style.color || '#FFAA66';
        const fontSize = style.fontSize || '10px';
        const offsetX = style.offsetX !== undefined ? style.offsetX : 0;
        const offsetY = style.offsetY !== undefined ? style.offsetY : -5;
        ctx.fillStyle = color;
        ctx.font = `bold ${fontSize} Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(text, x + width / 2 + offsetX, y + height + offsetY);
        ctx.textAlign = 'left';
    },
    
    /**
     * Check if a point is inside a button's bounds
     * @param {Object} mousePos - {x, y} mouse position
     * @param {number} x - Button X position
     * @param {number} y - Button Y position
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @returns {boolean} True if mouse is over button
     */
    isHovered(mousePos, x, y, width, height) {
        return mousePos.x >= x && 
               mousePos.x <= x + width &&
               mousePos.y >= y && 
               mousePos.y <= y + height;
    },
    
    /**
     * Alias for isHovered using a bounds object
     * @param {Object} mousePos - {x,y}
     * @param {Object} bounds - {x,y,width,height}
     * @returns {boolean}
     */
    hitTest(mousePos, bounds) {
        if (!bounds) return false;
        return this.isHovered(mousePos, bounds.x, bounds.y, bounds.width, bounds.height);
    },
    
    /**
     * Draw a button with icon and text
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @param {string} text - Button label
     * @param {HTMLImageElement} icon - Optional icon image
     * @param {boolean} enabled - Whether button is enabled
     * @param {boolean} hovered - Whether button is hovered
     * @param {Object} style - Optional style overrides
     */
    drawWithIcon(ctx, x, y, width, height, text, icon, enabled = true, hovered = false, style = {}) {
        // Draw button background
        this.draw(ctx, x, y, width, height, '', enabled, hovered, style);
        
        // Draw icon if provided
        if (icon) {
            const iconSize = Math.min(height * 0.6, width * 0.3);
            const iconX = x + 10;
            const iconY = y + (height - iconSize) / 2;
            
            ctx.save();
            if (!enabled) {
                ctx.globalAlpha = 0.5;
            }
            ctx.drawImage(icon, iconX, iconY, iconSize, iconSize);
            ctx.restore();
            
            // Draw text offset to the right
            ctx.fillStyle = enabled ? (style.textEnabled || '#ffffff') : (style.textDisabled || '#666666');
            ctx.font = `${style.fontSize || '16px'} ${style.fontFamily || 'Arial'}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, iconX + iconSize + 10, y + height / 2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
        } else {
            // No icon, just draw text centered
            ctx.fillStyle = enabled ? (style.textEnabled || '#ffffff') : (style.textDisabled || '#666666');
            ctx.font = `${style.fontSize || '16px'} ${style.fontFamily || 'Arial'}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, x + width / 2, y + height / 2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
        }
    }
};

