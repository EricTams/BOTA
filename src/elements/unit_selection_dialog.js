// unit_selection_dialog.js - Unit Selection Dialog UI Element
// Renders the dialog for adding units (captains/crew/ships) in edit mode

const UnitSelectionDialog = {
    /**
     * Render the unit selection dialog
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} dialog - Dialog state from DiceSystem
     */
    render(ctx, canvas, dialog) {
        if (!dialog) return;
        
        const side = dialog.side;
        const panelWidth = 600;
        const panelHeight = 500;
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = (canvas.height - panelHeight) / 2;
        
        dialog.bounds = { x: panelX, y: panelY, width: panelWidth, height: panelHeight };
        
        // Draw darkening overlay
        Panel.drawOverlay(ctx, canvas.width, canvas.height, {
            color: 'rgba(0, 0, 0, 0.7)'
        });
        
        // Draw panel with themed border
        Panel.drawThemed(ctx, panelX, panelY, panelWidth, panelHeight, side === 'player', {
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            borderWidth: 3,
            glow: true,
            glowBlur: 15
        });
        
        // Draw title
        ctx.fillStyle = side === 'player' ? '#44CCFF' : '#FF8844';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Add Unit to ${side === 'player' ? 'Player' : 'Enemy'} Side`, panelX + panelWidth / 2, panelY + 35);
        
        // Draw categories with items
        this.drawCategories(ctx, dialog, panelX, panelY, panelWidth, panelHeight);
        
        // Draw scrollbar if needed
        this.drawScrollbar(ctx, dialog, panelX, panelY, panelWidth, panelHeight);
        
        // Draw close button
        this.drawCloseButton(ctx, dialog, panelX, panelY, panelWidth, panelHeight);
        
        ctx.textAlign = 'left';
    },
    
    /**
     * Draw categories (Captains, Crew, Ships) with items
     */
    drawCategories(ctx, dialog, panelX, panelY, panelWidth, panelHeight) {
        const categories = [
            { name: 'Captains', items: getAllCaptains(), type: 'captain' },
            { name: 'Crew Types', items: getAllCrew().filter(c => c.id !== 'crew'), type: 'crew' },
            { name: 'Ships', items: getAllShips(), type: 'ship' }
        ];
        
        let yOffset = 70;
        const itemHeight = 50;
        const scrollY = dialog.scrollY || 0;
        const visibleHeight = panelHeight - 120;
        
        dialog.itemBounds = [];
        
        for (const category of categories) {
            // Category header
            ctx.fillStyle = '#CCCCCC';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(category.name, panelX + 20, panelY + yOffset - scrollY);
            yOffset += 25;
            
            // Category items
            for (const item of category.items) {
                const itemY = panelY + yOffset - scrollY;
                
                // Skip if outside visible area
                if (itemY < panelY + 60 || itemY > panelY + panelHeight - 60) {
                    yOffset += itemHeight;
                    continue;
                }
                
                const itemBounds = {
                    x: panelX + 20,
                    y: itemY,
                    width: panelWidth - 40,
                    height: itemHeight - 5,
                    item: item,
                    type: category.type
                };
                dialog.itemBounds.push(itemBounds);
                
                // Item background
                ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
                ctx.fillRect(itemBounds.x, itemBounds.y, itemBounds.width, itemBounds.height);
                
                // Item border
                ctx.strokeStyle = '#666666';
                ctx.lineWidth = 1;
                ctx.strokeRect(itemBounds.x, itemBounds.y, itemBounds.width, itemBounds.height);
                
                // Item name
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(item.name, itemBounds.x + 10, itemBounds.y + 20);
                
                // Item description
                if (item.description) {
                    ctx.fillStyle = '#AAAAAA';
                    ctx.font = '12px Arial';
                    ctx.fillText(item.description, itemBounds.x + 10, itemBounds.y + 38);
                }
                
                yOffset += itemHeight;
            }
            
            yOffset += 10; // Spacing between categories
        }
        
        dialog.totalHeight = yOffset;
    },
    
    /**
     * Draw scrollbar if content exceeds visible area
     */
    drawScrollbar(ctx, dialog, panelX, panelY, panelWidth, panelHeight) {
        const contentHeight = dialog.totalHeight;
        const visibleHeight = panelHeight - 120;
        const scrollY = dialog.scrollY || 0;
        const maxScroll = Math.max(0, contentHeight - visibleHeight);
        
        // Clamp scroll position
        if (scrollY < 0) dialog.scrollY = 0;
        if (scrollY > maxScroll) dialog.scrollY = maxScroll;
        
        // Draw scrollbar if content exceeds visible area
        if (contentHeight > visibleHeight) {
            const scrollbarWidth = 20;
            const scrollbarX = panelX + panelWidth - scrollbarWidth - 5;
            const scrollbarTrackY = panelY + 60;
            const scrollbarTrackHeight = visibleHeight;
            
            // Scrollbar track
            ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
            ctx.fillRect(scrollbarX, scrollbarTrackY, scrollbarWidth, scrollbarTrackHeight);
            ctx.strokeStyle = '#666666';
            ctx.lineWidth = 1;
            ctx.strokeRect(scrollbarX, scrollbarTrackY, scrollbarWidth, scrollbarTrackHeight);
            
            // Scrollbar thumb
            const thumbHeight = Math.max(30, (visibleHeight / contentHeight) * scrollbarTrackHeight);
            const thumbY = scrollbarTrackY + (scrollY / maxScroll) * (scrollbarTrackHeight - thumbHeight);
            
            dialog.scrollbarBounds = {
                x: scrollbarX,
                y: scrollbarTrackY,
                width: scrollbarWidth,
                height: scrollbarTrackHeight,
                thumbY: thumbY,
                thumbHeight: thumbHeight
            };
            
            ctx.fillStyle = '#888888';
            ctx.fillRect(scrollbarX + 2, thumbY, scrollbarWidth - 4, thumbHeight);
            ctx.strokeStyle = '#AAAAAA';
            ctx.lineWidth = 1;
            ctx.strokeRect(scrollbarX + 2, thumbY, scrollbarWidth - 4, thumbHeight);
        } else {
            dialog.scrollbarBounds = null;
        }
    },
    
    /**
     * Draw close button
     */
    drawCloseButton(ctx, dialog, panelX, panelY, panelWidth, panelHeight) {
        const closeButtonWidth = 100;
        const closeButtonHeight = 35;
        const closeButtonX = panelX + panelWidth / 2 - closeButtonWidth / 2;
        const closeButtonY = panelY + panelHeight - 50;
        
        dialog.closeButton = { x: closeButtonX, y: closeButtonY, width: closeButtonWidth, height: closeButtonHeight };
        
        Button.draw(
            ctx,
            closeButtonX,
            closeButtonY,
            closeButtonWidth,
            closeButtonHeight,
            'Close',
            true,
            false,
            {
                bgEnabled: '#663333',
                borderEnabled: '#FF8888',
                textEnabled: '#FFFFFF',
                fontSize: 'bold 16px'
            }
        );
    }
};

