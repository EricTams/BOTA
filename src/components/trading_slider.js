// BOTA - Trading Slider Component
// Replicates the original sophisticated trading slider with price markers and color coding
// Handles complex price calculation, visual markers, and transaction validation

const TradingSlider = {
    /**
     * Create a trading slider for a specific good (replicates original createGoodTradingRow)
     * @param {Object} options - Configuration object
     * @param {string} options.goodId - ID of the good being traded
     * @param {Object} options.port - Port data for pricing
     * @param {Object} options.boat - Player boat data for cargo capacity
     * @param {Object} options.player - Player data for gold
     * @param {Function} options.onValueChange - Callback when slider value changes
     * @param {number} options.maxQuantity - Maximum quantity that can be traded
     * @param {string} options.className - CSS class for the slider container
     * @returns {HTMLElement} The trading slider element
     */
    create({
        goodId,
        port,
        boat,
        player,
        onValueChange = () => {},
        maxQuantity = 0,
        className = 'good-trading-row'
    }) {
        const row = document.createElement('div');
        row.className = className;
        
        const goodData = GoodsData[goodId];
        const portQty = port.stockpile[goodId] || 0;
        const cargoData = Game.playerBoat.cargo[goodId];
        const playerQty = cargoData ? (typeof cargoData === 'number' ? cargoData : cargoData.quantity) : 0;
        const playerAvgPrice = cargoData && typeof cargoData === 'object' ? cargoData.avgPrice : null;
        const householdQty = port.householdSupply ? (port.householdSupply[goodId] || 0) : 0;
        const basePrice = goodData.basePrice;
        
        // Check if port produces this good
        let produces = false;
        
        if (port.buildings) {
            for (const building of port.buildings) {
                if (building.goodId === goodId) {
                    produces = true;
                    break;
                }
            }
        }
        
        // Create indicator string
        let indicator = '';
        if (produces) {
            indicator = '<span style="color: #4CAF50;">+</span> '; // Produces
        }
        
        // Calculate current supply status
        const status = Economy.calculateSupplyStatus(port, goodId);
        const equilibrium = status.equilibriumStock > 0 ? status.equilibriumStock : 200;
        
        // Get current price multiplier
        const currentMultiplier = Economy.getPriceMultiplierFromStock(portQty, equilibrium);
        
        // Price bounds (asymptotic)
        const minMultiplier = 0.25;  // 25% of base (surplus floor)
        const maxMultiplier = 4.0;   // 400% of base (shortage ceiling)
        
        const sliderMin = minMultiplier;  // 0.25
        const sliderMax = maxMultiplier;  // 4.0
        
        // Initial price
        const initialPrice = Math.round(basePrice * currentMultiplier);
        
        // AIDEV-NOTE: Exponential scale with 1.0x at 50%
        // Symmetric on log scale: 0.25x to 4.0x range (16x span)
        // Formula: multiplier = 4^(2*position - 1)
        // This gives: 0→0.25x, 0.5→1.0x, 1.0→4.0x
        
        // Convert multiplier to position (0-100)
        const multiplierToPosition = (mult) => {
            if (mult < sliderMin || mult > sliderMax) return null;
            // position = (log(mult) / log(4) + 1) / 2, scaled to 0-100
            return ((Math.log(mult) / Math.log(4) + 1) / 2) * 100;
        };
        
        // Convert position (0-100) to multiplier
        const positionToMultiplier = (pos) => {
            // multiplier = 4^(2*position - 1), where position is 0-1
            const normalizedPos = pos / 100; // Convert 0-100 to 0-1
            return Math.pow(4, 2 * normalizedPos - 1);
        };
        
        // AIDEV-NOTE: Convert slider value position to visual CSS percentage
        // HTML range inputs have thumb positioning quirks - the thumb center is inset
        // from the edges to keep the whole thumb visible. We need to compensate for this.
        const valueToVisualPercent = (value) => {
            // For a slider with min=0, max=100, the visual position formula is:
            // The marker uses transform: translate(-50%, -50%) to center on the position
            // We just need to match where the thumb center actually appears
            // Adjusted from 5.5 to 2.0 for better alignment
            const thumbOffset = 2.0;
            return thumbOffset + (value / 100) * (100 - 2 * thumbOffset);
        };
        
        // AIDEV-NOTE: Calculate zero-trade position (where tradeAmount = 0)
        // This is where targetStock equals initialStock (current port stock)
        const zeroMultiplier = Economy.getPriceMultiplierFromStock(portQty, equilibrium);
        const zeroPosition = multiplierToPosition(zeroMultiplier);
        
        // Position markers at exact visual percentages accounting for thumb offset
        // The price markers use slider values, but need visual adjustment for CSS positioning
        const cheapMarkerPos = valueToVisualPercent(25.0);      // 0.5x multiplier
        const baseMarkerPos = valueToVisualPercent(50.0);        // 1.0x multiplier
        const expensiveMarkerPos = valueToVisualPercent(75.0);   // 2.0x multiplier
        const zeroMarkerPos = valueToVisualPercent(zeroPosition); // Current price (no trade)
        
        // Build cargo display with average price if available
        let cargoDisplay = `You: ${playerQty}`;
        if (playerQty > 0 && playerAvgPrice !== null) {
            cargoDisplay += ` <span style="opacity: 0.7;">@${Math.round(playerAvgPrice)}g</span>`;
        }
        
        // Good info and slider in one compact row (replicates original HTML structure)
        row.innerHTML = `
            <div class="good-name">${indicator}${goodId}</div>
            <div class="good-stats">
                <span class="stat">Port: ${Math.round(portQty)}</span>
                <span class="stat">Home: ${Math.round(householdQty)}</span>
                <span class="price" data-good-id="${goodId}">${initialPrice}g</span>
            </div>
            <div class="slider-container" data-good-id="${goodId}">
                <button class="slider-adjust-btn minus-btn" data-good-id="${goodId}" title="Sell one more unit">-1</button>
                <div class="slider-track-wrapper">
                    ${cheapMarkerPos !== null ? `<div class="price-marker cheap-marker" style="left: ${cheapMarkerPos.toFixed(1)}%"></div>` : ''}
                    ${baseMarkerPos !== null ? `<div class="price-marker base-marker" style="left: ${baseMarkerPos.toFixed(1)}%"></div>` : ''}
                    ${expensiveMarkerPos !== null ? `<div class="price-marker expensive-marker" style="left: ${expensiveMarkerPos.toFixed(1)}%"></div>` : ''}
                    <div class="price-marker zero-marker" style="left: ${zeroMarkerPos.toFixed(1)}%" title="No trade"></div>
                    <input type="range" 
                        class="trade-slider" 
                        min="0" 
                        max="100" 
                        value="${zeroPosition.toFixed(2)}"
                        step="0.1"
                        data-good-id="${goodId}"
                        data-base-price="${basePrice}"
                        data-initial-stock="${portQty}"
                        data-equilibrium="${equilibrium}"
                        data-player-qty="${playerQty}"
                        data-zero-pos="${zeroPosition.toFixed(2)}">
                </div>
                <button class="slider-adjust-btn plus-btn" data-good-id="${goodId}" title="Buy one more unit">+1</button>
                <div class="slider-value">0</div>
            </div>
            <div class="cargo-stock" style="color: ${playerQty > 0 ? '#4CAF50' : '#888'}">${cargoDisplay}</div>
        `;
        
        const slider = row.querySelector('.trade-slider');
        const valueDisplay = row.querySelector('.slider-value');
        const priceDisplay = row.querySelector('.price');
        const minusBtn = row.querySelector('.minus-btn');
        const plusBtn = row.querySelector('.plus-btn');
        
        // AIDEV-NOTE: Shared update function for slider and buttons (replicates original logic)
        const updateTrade = (requestedTradeAmount = null) => {
            const initialStock = parseInt(slider.getAttribute('data-initial-stock'));
            const equilibriumStock = parseInt(slider.getAttribute('data-equilibrium'));
            const basePriceValue = parseInt(slider.getAttribute('data-base-price'));
            const playerQuantity = parseInt(slider.getAttribute('data-player-qty'));
            const zeroPos = parseFloat(slider.getAttribute('data-zero-pos'));
            
            let tradeAmount;
            let position;
            
            if (requestedTradeAmount !== null) {
                // Called from +1/-1 buttons with explicit trade amount
                tradeAmount = requestedTradeAmount;
                
                // Update slider position to match requested trade
                if (tradeAmount === 0) {
                    position = zeroPos;
                } else {
                    const targetStock = initialStock - tradeAmount;
                    const targetMultiplier = Economy.getPriceMultiplierFromStock(targetStock, equilibriumStock);
                    position = multiplierToPosition(targetMultiplier);
                }
                slider.value = position;
            } else {
                // Called from slider - convert position to trade amount
                position = parseFloat(slider.value);
                
                // AIDEV-NOTE: Snap to zero deadzone (±0.5% of slider range around zero position)
                // This prevents rounding errors from causing small unwanted trades
                const deadzoneRadius = 0.5;
                if (Math.abs(position - zeroPos) < deadzoneRadius) {
                    position = zeroPos;
                    slider.value = zeroPos;
                    tradeAmount = 0;
                } else {
                    // Convert position to multiplier to stock to trade amount
                    const targetMultiplier = positionToMultiplier(position);
                    const targetStock = Math.round(Economy.getStockFromPriceMultiplier(targetMultiplier, equilibriumStock));
                    tradeAmount = initialStock - targetStock;
                    
                    // Additional check: if calculated trade is tiny (±0.5 units), snap to zero
                    if (Math.abs(tradeAmount) < 0.5) {
                        tradeAmount = 0;
                        slider.value = zeroPos;
                    }
                }
            }
            
            // AIDEV-NOTE: Calculate post-trade state from OTHER pending trades
            // This gives us accurate cargo space and gold available for THIS trade
            let otherTradesCargo = 0;
            let otherTradesGold = 0;
            const currentTransactions = UI.currentTransactions || {};
            for (const otherGoodId in currentTransactions) {
                if (otherGoodId !== goodId) {
                    const otherAmount = currentTransactions[otherGoodId] || 0;
                    if (otherAmount !== 0) {
                        // Cargo: positive = buying (uses space), negative = selling (frees space)
                        otherTradesCargo += otherAmount;
                        
                        // Gold: calculate cost/earnings from other trades
                        const otherGoldChange = Economy.calculateTotalCostForTrade(port, otherGoodId, otherAmount);
                        otherTradesGold -= otherGoldChange; // Invert: negative = spending, positive = earning
                    }
                }
            }
            
            // Calculate available resources AFTER other trades
            const currentCargo = Economy.getCargoUsed(Game.playerBoat);
            const postTradeCargoUsed = currentCargo + otherTradesCargo;
            const postTradeGold = Game.player.gold - otherTradesGold;
            const availableSpace = Game.playerBoat.cargoCapacity - postTradeCargoUsed;
            
            // AIDEV-NOTE: Apply trade constraints (gold, cargo, inventory)
            if (tradeAmount > 0) {
                // BUYING from port: check gold and cargo space (post-trade)
                
                // Calculate max we can afford with post-trade gold
                let maxCanAfford = 0;
                let goldSpent = 0;
                for (let i = 1; i <= tradeAmount; i++) {
                    const stockLevel = initialStock - i;
                    const unitPrice = Economy.calculatePriceAtStockLevel(goodId, stockLevel, equilibriumStock);
                    if (goldSpent + unitPrice <= postTradeGold) {
                        goldSpent += unitPrice;
                        maxCanAfford = i;
                    } else {
                        break;
                    }
                }
                
                // Clamp to constraints (using post-trade available space)
                const maxCanBuy = Math.min(tradeAmount, maxCanAfford, availableSpace, initialStock);
                if (tradeAmount > maxCanBuy) {
                    tradeAmount = maxCanBuy;
                    // Recalculate slider position from clamped amount
                    const clampedStock = initialStock - tradeAmount;
                    const clampedMultiplier = Economy.getPriceMultiplierFromStock(clampedStock, equilibriumStock);
                    position = multiplierToPosition(clampedMultiplier);
                    slider.value = position;
                }
            } else if (tradeAmount < 0) {
                // SELLING to port: ensure we don't sell more than we have
                const maxCanSell = playerQuantity;
                if (Math.abs(tradeAmount) > maxCanSell) {
                    tradeAmount = -maxCanSell;
                    // Recalculate slider position from clamped amount
                    const clampedStock = initialStock - tradeAmount;
                    const clampedMultiplier = Economy.getPriceMultiplierFromStock(clampedStock, equilibriumStock);
                    position = multiplierToPosition(clampedMultiplier);
                    slider.value = position;
                }
            }
            
            // Calculate final prices
            const originalPrice = Math.round(basePriceValue * Economy.getPriceMultiplierFromStock(initialStock, equilibriumStock));
            const finalStock = initialStock - tradeAmount;
            const newPrice = Math.round(basePriceValue * Economy.getPriceMultiplierFromStock(finalStock, equilibriumStock));
            
            // Calculate total gold cost and average price
            const totalGold = Economy.calculateTotalCostForTrade(port, goodId, tradeAmount);
            const avgPrice = tradeAmount !== 0 ? Math.abs(totalGold / tradeAmount) : originalPrice;
            
            // Update displays
            if (tradeAmount === 0) {
                priceDisplay.textContent = `${originalPrice}g`;
                valueDisplay.textContent = '0';
            } else {
                priceDisplay.textContent = `${originalPrice}g → ${newPrice}g`;
                const unitsText = tradeAmount > 0 ? `+${tradeAmount}` : tradeAmount;
                valueDisplay.textContent = `${unitsText} @ ${Math.round(avgPrice)}g`;
            }
            
            // AIDEV-NOTE: Update button states
            // -1: Sell more OR reduce a purchase (tradeAmount - 1)
            // +1: Buy more OR reduce a sale (tradeAmount + 1)
            
            // Can use -1 button if:
            // - Currently buying and can reduce (tradeAmount > 0), OR
            // - Can sell from inventory (tradeAmount > -playerQuantity)
            const canMinusOne = tradeAmount > 0 || (playerQuantity > 0 && tradeAmount > -playerQuantity);
            
            // Can use +1 button if:
            // - Currently selling and can reduce (tradeAmount < 0), OR  
            // - Can buy more from port (tradeAmount < initialStock)
            const canPlusOne = tradeAmount < 0 || tradeAmount < initialStock;
            
            plusBtn.disabled = !canPlusOne;
            minusBtn.disabled = !canMinusOne;
            
            // Store transaction
            if (!UI.currentTransactions) {
                UI.currentTransactions = {};
            }
            UI.currentTransactions[goodId] = tradeAmount;
            
            // Call the callback with the trade information
            onValueChange(goodId, tradeAmount, avgPrice, totalGold);
        };
        
        // Event listeners
        slider.addEventListener('input', () => updateTrade());
        
        // AIDEV-NOTE: +1/-1 button handlers
        plusBtn.addEventListener('click', () => {
            const currentAmount = (UI.currentTransactions || {})[goodId] || 0;
            updateTrade(currentAmount + 1);
        });
        
        minusBtn.addEventListener('click', () => {
            const currentAmount = (UI.currentTransactions || {})[goodId] || 0;
            updateTrade(currentAmount - 1);
        });
        
        // Initialize button states
        updateTrade();
        
        return row;
    }
};