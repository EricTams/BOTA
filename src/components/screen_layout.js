// BOTA - Screen Layout Component
// Reusable full-screen subscreen layout with header and footer
// Handles consistent styling for port screens, trading screens, etc.

const ScreenLayout = {
    /**
     * Create a full-screen subscreen with header and footer
     * @param {Object} options - Configuration object
     * @param {string} options.title - Screen title
     * @param {string} options.subtitle - Optional subtitle
     * @param {HTMLElement} options.content - Main content element
     * @param {Object} options.backButton - Back button configuration
     * @param {string} options.backButton.text - Button text (default: 'Back')
     * @param {Function} options.backButton.onClick - Click handler
     * @param {Object} options.confirmButton - Confirm button configuration (optional)
     * @param {string} options.confirmButton.text - Button text (default: 'Confirm')
     * @param {Function} options.confirmButton.onClick - Click handler
     * @param {boolean} options.confirmButton.enabled - Whether button is enabled (default: true)
     * @param {string} options.className - CSS class for the container (default: 'sub-screen-container')
     * @returns {HTMLElement} The screen container element
     */
    create({
        title,
        subtitle = null,
        content,
        backButton = { text: 'Back', onClick: () => {} },
        confirmButton = null,
        className = 'sub-screen-container'
    }) {
        // Create main container
        const container = document.createElement('div');
        container.className = className;
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            z-index: 10000;
        `;

        // Create header
        const header = this.createHeader(title, subtitle);
        container.appendChild(header);

        // Create content area
        const contentArea = document.createElement('div');
        contentArea.className = 'sub-screen-content';
        contentArea.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            color: #f0e6d2;
        `;
        
        if (content) {
            contentArea.appendChild(content);
        }
        container.appendChild(contentArea);

        // Create footer
        const footer = this.createFooter(backButton, confirmButton);
        container.appendChild(footer);

        return container;
    },

    /**
     * Create screen header with title and optional subtitle
     * @param {string} title - Screen title
     * @param {string} subtitle - Optional subtitle
     * @returns {HTMLElement} Header element
     */
    createHeader(title, subtitle = null) {
        const header = document.createElement('div');
        header.className = 'sub-screen-header';
        header.style.cssText = `
            background: linear-gradient(135deg, #2a1810 0%, #1a0f0a 100%);
            border-bottom: 3px solid #8b4513;
            padding: 20px;
            text-align: center;
        `;

        // Title
        const titleEl = document.createElement('h1');
        titleEl.className = 'sub-screen-title';
        titleEl.textContent = title;
        titleEl.style.cssText = `
            color: #d4af37;
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: bold;
        `;
        header.appendChild(titleEl);

        // Subtitle (optional)
        if (subtitle) {
            const subtitleEl = document.createElement('div');
            subtitleEl.className = 'sub-screen-subtitle';
            subtitleEl.textContent = subtitle;
            subtitleEl.style.cssText = `
                color: #f0e6d2;
                font-size: 16px;
                font-style: italic;
            `;
            header.appendChild(subtitleEl);
        }

        return header;
    },

    /**
     * Create screen footer with back and optional confirm buttons
     * @param {Object} backButton - Back button configuration
     * @param {Object} confirmButton - Confirm button configuration (optional)
     * @returns {HTMLElement} Footer element
     */
    createFooter(backButton, confirmButton = null) {
        const footer = document.createElement('div');
        footer.className = 'sub-screen-footer';
        footer.style.cssText = `
            background: linear-gradient(135deg, #1a0f0a 0%, #0f0a05 100%);
            border-top: 3px solid #8b4513;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
        `;

        // Back button
        const backBtn = document.createElement('button');
        backBtn.className = 'back-button';
        backBtn.textContent = backButton.text;
        backBtn.style.cssText = `
            padding: 12px 30px;
            background: linear-gradient(145deg, #8b4513, #a0522d);
            border: 2px solid #cd853f;
            border-radius: 6px;
            color: #f0e6d2;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 120px;
        `;
        backBtn.onclick = backButton.onClick;
        backBtn.onmouseover = () => {
            backBtn.style.background = 'linear-gradient(145deg, #a0522d, #8b4513)';
            backBtn.style.transform = 'translateY(-2px)';
        };
        backBtn.onmouseout = () => {
            backBtn.style.background = 'linear-gradient(145deg, #8b4513, #a0522d)';
            backBtn.style.transform = 'translateY(0)';
        };
        footer.appendChild(backBtn);

        // Confirm button (optional)
        if (confirmButton) {
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'confirm-button';
            confirmBtn.textContent = confirmButton.text;
            confirmBtn.disabled = !confirmButton.enabled;
            confirmBtn.style.cssText = `
                padding: 12px 30px;
                background: ${confirmButton.enabled ? 
                    'linear-gradient(145deg, #2e7d32, #388e3c)' : 
                    'linear-gradient(145deg, #424242, #616161)'};
                border: 2px solid ${confirmButton.enabled ? '#4caf50' : '#757575'};
                border-radius: 6px;
                color: ${confirmButton.enabled ? '#f0e6d2' : '#9e9e9e'};
                font-size: 16px;
                font-weight: bold;
                cursor: ${confirmButton.enabled ? 'pointer' : 'not-allowed'};
                transition: all 0.3s ease;
                min-width: 120px;
            `;
            confirmBtn.onclick = confirmButton.onClick;
            
            if (confirmButton.enabled) {
                confirmBtn.onmouseover = () => {
                    confirmBtn.style.background = 'linear-gradient(145deg, #388e3c, #2e7d32)';
                    confirmBtn.style.transform = 'translateY(-2px)';
                };
                confirmBtn.onmouseout = () => {
                    confirmBtn.style.background = 'linear-gradient(145deg, #2e7d32, #388e3c)';
                    confirmBtn.style.transform = 'translateY(0)';
                };
            }
            
            footer.appendChild(confirmBtn);
        }

        return footer;
    },

    /**
     * Create a port-style screen layout (specific styling for port screens)
     * @param {Object} options - Configuration object
     * @param {string} options.portName - Port name for title
     * @param {string} options.faction - Faction name for subtitle
     * @param {HTMLElement} options.content - Main content element
     * @param {Function} options.onBack - Back button handler
     * @returns {HTMLElement} The screen container element
     */
    createPortScreen({ portName, faction, content, onBack }) {
        return this.create({
            title: portName,
            subtitle: faction ? `${faction} Territory` : null,
            content: content,
            backButton: { text: 'Back to Map', onClick: onBack },
            className: 'sub-screen-container port-screen'
        });
    },

    /**
     * Create a trading-style screen layout
     * @param {Object} options - Configuration object
     * @param {string} options.portName - Port name for title
     * @param {HTMLElement} options.content - Main content element
     * @param {Function} options.onBack - Back button handler
     * @param {Function} options.onConfirm - Confirm button handler
     * @param {boolean} options.confirmEnabled - Whether confirm button is enabled
     * @returns {HTMLElement} The screen container element
     */
    createTradingScreen({ portName, content, onBack, onConfirm, confirmEnabled = true }) {
        return this.create({
            title: `Trading at ${portName}`,
            content: content,
            backButton: { text: 'Back', onClick: onBack },
            confirmButton: onConfirm ? {
                text: 'Confirm Trade',
                onClick: onConfirm,
                enabled: confirmEnabled
            } : null,
            className: 'sub-screen-container trading-screen'
        });
    },

    /**
     * Create a production-style screen layout
     * @param {Object} options - Configuration object
     * @param {string} options.portName - Port name for title
     * @param {HTMLElement} options.content - Main content element
     * @param {Function} options.onBack - Back button handler
     * @returns {HTMLElement} The screen container element
     */
    createProductionScreen({ portName, content, onBack }) {
        return this.create({
            title: `Production at ${portName}`,
            subtitle: 'View buildings and their production/consumption',
            content: content,
            backButton: { text: 'Back', onClick: onBack },
            className: 'sub-screen-container production-screen'
        });
    },

    /**
     * Create a trading screen with goods trading interface
     * @param {Object} options - Configuration object
     * @param {Object} options.port - Port data
     * @param {Function} options.onValueChange - Callback when slider value changes
     * @param {Function} options.onConfirm - Callback when confirm button is clicked
     * @param {Function} options.onBack - Callback when back button is clicked
     * @returns {HTMLElement} The trading screen element
     */
    createTradingScreenWithSliders({ port, onValueChange, onConfirm, onBack }) {
        const screen = this.create({
            title: `${port.name} - Marketplace`,
            backButton: { text: 'Back to Port', onClick: onBack },
            confirmButton: { text: 'Confirm Trade', onClick: onConfirm },
            className: 'sub-screen-container trading-screen'
        });
        
        // Set trading background image
        const bgImage = Renderer.locationBackgrounds?.['location_marketplace'];
        if (bgImage) {
            screen.style.backgroundImage = `url('${bgImage.src}')`;
            screen.style.backgroundSize = 'cover';
            screen.style.backgroundPosition = 'center';
            screen.style.backgroundRepeat = 'no-repeat';
        } else {
            // Fallback color if image not loaded
            screen.style.backgroundColor = '#2c3e50';
            console.warn('Trading background not found: location_marketplace');
        }

        const content = screen.querySelector('.sub-screen-content');
        
        // Prevent horizontal scrolling and dragging on the trading screen
        content.style.cssText = `
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 20px;
            color: #f0e6d2;
            touch-action: pan-y;
        `;
        
        // Get available goods for trading
        const availableGoods = this.getAvailableGoodsForTrading(port);
        
        // Create goods list with trading sliders (replicates original structure)
        const goodsList = document.createElement('div');
        goodsList.className = 'trading-goods-list';
        // Remove custom styling to use original CSS

        for (const goodId of availableGoods) {
            // Don't filter by maxQuantity - show all goods like original
            const slider = TradingSlider.create({
                goodId: goodId,
                port: port,
                boat: Game.playerBoat,
                player: Game.player,
                onValueChange: onValueChange,
                maxQuantity: 999 // Let the slider handle constraints internally
            });
            goodsList.appendChild(slider);
        }

        content.appendChild(goodsList);
        
        // Add transaction summary to the footer (not inside scrollable content)
        const footer = screen.querySelector('.sub-screen-footer');
        const summary = document.createElement('div');
        summary.id = 'trading-summary';
        summary.className = 'trading-summary trading-fixed-footer';
        summary.style.cssText = `
            width: 100%;
            background: rgba(0, 0, 0, 0.9);
            padding: 15px;
            border-top: 2px solid rgba(139, 115, 85, 0.3);
            margin-top: 10px;
        `;
        // Get confirm button before inserting summary
        const confirmBtn = footer.querySelector('.confirm-button');
        
        // Insert summary before the buttons in the footer
        footer.insertBefore(summary, footer.firstChild);
        
        // Update footer buttons
        if (confirmBtn) {
            confirmBtn.onclick = onConfirm;
        }
        
        // Update summary and button state (pass confirm button for state updates)
        this.updateTradingSummary(port, summary, confirmBtn);

        return screen;
    },

    /**
     * Get list of goods available for trading
     * @param {Object} port - Port data
     * @returns {Array} Array of good IDs
     */
    getAvailableGoodsForTrading(port) {
        const goods = new Set();
        
        // Add all goods the port produces (from buildings)
        if (port.buildings) {
            for (const building of port.buildings) {
                goods.add(building.goodId);
            }
        }
        
        // Add all goods the port consumes
        if (port.consumption) {
            for (const goodId in port.consumption) {
                goods.add(goodId);
            }
        }
        
        // Add all goods in port's stockpile
        for (const goodId in port.stockpile) {
            goods.add(goodId);
        }
        
        // Add all goods in player cargo
        if (Game.playerBoat && Game.playerBoat.cargo) {
            for (const goodId in Game.playerBoat.cargo) {
                goods.add(goodId);
            }
        }
        
        // Sort by tier then alphabetically
        return Array.from(goods).sort((a, b) => {
            const tierA = GoodsData[a]?.tier || 0;
            const tierB = GoodsData[b]?.tier || 0;
            if (tierA !== tierB) return tierA - tierB;
            return a.localeCompare(b);
        });
    },

    /**
     * Calculate maximum tradeable quantity for a good
     * @param {Object} port - Port data
     * @param {string} goodId - ID of the good
     * @returns {number} Maximum tradeable quantity
     */
    calculateMaxQuantity(port, goodId) {
        const stock = port.stockpile?.[goodId] || 0;
        const cargoSpace = this.getCargoSpaceAvailable(Game.playerBoat);
        const cargoQuantity = this.getCargoQuantity(Game.playerBoat, goodId);
        
        const maxBuy = Math.min(stock, cargoSpace);
        const maxSell = cargoQuantity;
        
        return Math.max(maxBuy, maxSell);
    },

    /**
     * Get cargo space available
     * @param {Object} boat - Boat data
     * @returns {number} Available cargo space
     */
    getCargoSpaceAvailable(boat) {
        if (!boat.cargo) return boat.cargoCapacity;
        
        let used = 0;
        for (const goodId in boat.cargo) {
            const quantity = typeof boat.cargo[goodId] === 'number' ? 
                boat.cargo[goodId] : boat.cargo[goodId].quantity;
            used += quantity;
        }
        return boat.cargoCapacity - used;
    },

    /**
     * Get cargo quantity for a specific good
     * @param {Object} boat - Boat data
     * @param {string} goodId - ID of the good
     * @returns {number} Quantity of good in cargo
     */
    getCargoQuantity(boat, goodId) {
        const cargo = boat.cargo?.[goodId];
        return typeof cargo === 'number' ? cargo : (cargo?.quantity || 0);
    },

    /**
     * Update trading summary display
     * @param {Object} port - Port data
     * @param {HTMLElement} summary - Summary element
     * @param {HTMLElement} confirmButton - Optional confirm button to update
     */
    updateTradingSummary(port, summary, confirmButton = null) {
        if (!summary) return;
        
        const transactions = UI.currentTransactions || {};
        
        let totalGoldSpent = 0;
        let totalCargoChange = 0;
        
        for (const goodId in transactions) {
            const amount = transactions[goodId];
            if (amount === 0) continue;
            
            // Calculate total cost by simulating one unit at a time
            // calculateTotalCostForTrade returns negative for buying, positive for selling
            const goldChange = Economy.calculateTotalCostForTrade(port, goodId, amount);
            totalGoldSpent -= goldChange; // Invert: positive = spending, negative = earning
            totalCargoChange += amount;
        }
        
        const currentCargo = Economy.getCargoUsed(Game.playerBoat);
        const newCargo = currentCargo + totalCargoChange;
        const newGold = Game.player.gold - totalGoldSpent;
        
        const roundedGoldSpent = Math.round(totalGoldSpent);
        const goldChangeText = roundedGoldSpent >= 0 ? `-${roundedGoldSpent}g` : `+${Math.abs(roundedGoldSpent)}g`;
        const cargoChangeText = totalCargoChange >= 0 ? `+${totalCargoChange}` : `${totalCargoChange}`;
        
        // Check if trade is valid
        const hasEnoughGold = totalGoldSpent <= Game.player.gold;
        const hasEnoughSpace = newCargo <= Game.playerBoat.cargoCapacity;
        const hasTransactions = Object.values(transactions).some(v => v !== 0);
        const goldShortfall = hasEnoughGold ? 0 : Math.ceil(totalGoldSpent - Game.player.gold);
        const spaceShortfall = hasEnoughSpace ? 0 : newCargo - Game.playerBoat.cargoCapacity;
        
        // Update confirm button state
        if (confirmButton) {
            const isValidTrade = hasTransactions && hasEnoughGold && hasEnoughSpace;
            confirmButton.disabled = !isValidTrade;
            
            // Update button styling
            confirmButton.style.background = isValidTrade ? 
                'linear-gradient(145deg, #2e7d32, #388e3c)' : 
                'linear-gradient(145deg, #424242, #616161)';
            confirmButton.style.borderColor = isValidTrade ? '#4caf50' : '#757575';
            confirmButton.style.color = isValidTrade ? '#f0e6d2' : '#9e9e9e';
            confirmButton.style.cursor = isValidTrade ? 'pointer' : 'not-allowed';
            
            // Update hover handlers
            confirmButton.onmouseover = isValidTrade ? () => {
                confirmButton.style.background = 'linear-gradient(145deg, #388e3c, #2e7d32)';
                confirmButton.style.transform = 'translateY(-2px)';
            } : null;
            confirmButton.onmouseout = isValidTrade ? () => {
                confirmButton.style.background = 'linear-gradient(145deg, #2e7d32, #388e3c)';
                confirmButton.style.transform = 'translateY(0)';
            } : null;
        }
        
        summary.innerHTML = `
            <div class="summary-line">
                <span>Gold Cost:</span>
                <span class="${roundedGoldSpent > 0 ? 'negative' : 'positive'}">${goldChangeText}</span>
            </div>
            <div class="summary-line">
                <span>Cargo Change:</span>
                <span class="${totalCargoChange > 0 ? 'cargo-add' : totalCargoChange < 0 ? 'cargo-remove' : ''}">${cargoChangeText}</span>
            </div>
            <div class="summary-line" style="border-top: 1px solid #5a3a1a; padding-top: 8px; margin-top: 8px;">
                <span>Gold After Trade:</span>
                <span class="${hasEnoughGold ? '' : 'error'}">${Math.round(newGold)}g ${hasEnoughGold ? '✓' : `(need ${goldShortfall}g more)`}</span>
            </div>
            <div class="summary-line">
                <span>Cargo After Trade:</span>
                <span class="${hasEnoughSpace ? '' : 'error'}">${newCargo}/${Game.playerBoat.cargoCapacity} ${hasEnoughSpace ? '✓' : `(${spaceShortfall} over capacity)`}</span>
            </div>
        `;
    }
};
