// panel.js - Reusable panel/box component for canvas rendering
// Provides consistent panel styling (background, border, glow, title) across the game

const Panel = {
    /**
     * Draw a panel (box) on the canvas with background, border, and optional glow
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position (top-left corner)
     * @param {number} y - Y position (top-left corner)
     * @param {number} width - Panel width
     * @param {number} height - Panel height
     * @param {Object} options - Optional styling
     * @returns {Object} Panel bounds { x, y, width, height }
     */
    draw(ctx, x, y, width, height, options = {}) {
        const defaults = {
            backgroundColor: '#1a1a2e',
            borderColor: '#00FFFF',
            borderWidth: 3,
            glow: true,
            glowColor: '#00FFFF',
            glowBlur: 20,
            alpha: 1.0
        };
        
        const style = { ...defaults, ...options };
        
        ctx.save();
        
        // Set alpha if specified
        if (style.alpha < 1.0) {
            ctx.globalAlpha = style.alpha;
        }
        
        // Draw background
        ctx.fillStyle = style.backgroundColor;
        ctx.fillRect(x, y, width, height);
        
        // Draw border with optional glow
        if (style.glow) {
            ctx.shadowColor = style.glowColor;
            ctx.shadowBlur = style.glowBlur;
        }
        
        ctx.strokeStyle = style.borderColor;
        ctx.lineWidth = style.borderWidth;
        ctx.strokeRect(x, y, width, height);
        
        if (style.glow) {
            ctx.shadowBlur = 0;
        }
        
        ctx.restore();
        
        return { x, y, width, height };
    },
    
    /**
     * Draw a panel with a title
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Panel width
     * @param {number} height - Panel height
     * @param {string} title - Title text
     * @param {Object} options - Optional styling (extends draw options)
     * @returns {Object} Panel bounds and content area { x, y, width, height, contentY }
     */
    drawWithTitle(ctx, x, y, width, height, title, options = {}) {
        const defaults = {
            titleColor: '#00FFFF',
            titleFont: 'bold 20px Arial',
            titleAlign: 'center',
            titleOffsetY: 35
        };
        
        const style = { ...defaults, ...options };
        
        // Draw the panel background/border
        const bounds = this.draw(ctx, x, y, width, height, style);
        
        // Draw title
        ctx.save();
        ctx.fillStyle = style.titleColor;
        ctx.font = style.titleFont;
        ctx.textAlign = style.titleAlign;
        
        const titleX = style.titleAlign === 'center' ? x + width / 2 : x + 20;
        ctx.fillText(title, titleX, y + style.titleOffsetY);
        
        ctx.textAlign = 'left'; // Reset
        ctx.restore();
        
        return {
            ...bounds,
            contentY: y + style.titleOffsetY + 10 // Content starts below title
        };
    },
    
    /**
     * Draw a darkening overlay (for modal backgrounds)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     * @param {Object} options - Optional styling
     */
    drawOverlay(ctx, canvasWidth, canvasHeight, options = {}) {
        const defaults = {
            color: 'rgba(0, 0, 0, 0.7)'
        };
        
        const style = { ...defaults, ...options };
        
        ctx.save();
        ctx.fillStyle = style.color;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
    },
    
    /**
     * Draw a themed panel (player vs enemy)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Panel width
     * @param {number} height - Panel height
     * @param {boolean} isPlayer - True for player theme (blue), false for enemy theme (orange)
     * @param {Object} options - Optional styling overrides
     * @returns {Object} Panel bounds
     */
    drawThemed(ctx, x, y, width, height, isPlayer, options = {}) {
        const themeDefaults = isPlayer ? {
            borderColor: '#44CCFF',
            glowColor: '#44CCFF'
        } : {
            borderColor: '#FF8844',
            glowColor: '#FF8844'
        };
        
        const style = { ...themeDefaults, ...options };
        return this.draw(ctx, x, y, width, height, style);
    }
};

