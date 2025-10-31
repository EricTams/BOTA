// BOTA - List Container Component
// Reusable scrollable container with consistent styling
// Handles common list patterns for cargo, reputation, buildings, etc.

const ListContainer = {
    /**
     * Create a scrollable list container
     * @param {Object} options - Configuration object
     * @param {Array} options.items - Array of DOM elements to display
     * @param {string} options.className - CSS class for the container (default: 'list-container')
     * @param {string} options.emptyMessage - Message to show when no items (default: 'No items available')
     * @param {number} options.maxHeight - Maximum height in pixels (default: 400)
     * @param {string} options.emptyMessageClass - CSS class for empty message (default: 'list-empty-message')
     * @returns {HTMLElement} The list container element
     */
    create({
        items = [],
        className = 'list-container',
        emptyMessage = 'No items available',
        maxHeight = 400,
        emptyMessageClass = 'list-empty-message'
    }) {
        const container = document.createElement('div');
        container.className = className;
        container.style.cssText = `
            max-height: ${maxHeight}px;
            overflow-y: auto;
            margin-bottom: 20px;
            color: #ccc;
            font-size: 14px;
            line-height: 1.5;
        `;

        if (items.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = emptyMessageClass;
            emptyEl.textContent = emptyMessage;
            emptyEl.style.cssText = `
                text-align: center;
                color: #888;
                padding: 40px 20px;
                font-style: italic;
            `;
            container.appendChild(emptyEl);
        } else {
            items.forEach(item => {
                container.appendChild(item);
            });
        }

        return container;
    },

    /**
     * Create a cargo list container (specific styling for cargo items)
     * @param {Array} items - Array of cargo item DOM elements
     * @param {string} emptyMessage - Message when no cargo (default: 'Cargo hold is empty')
     * @returns {HTMLElement} The cargo list container
     */
    createCargoList(items = [], emptyMessage = 'Cargo hold is empty') {
        return this.create({
            items: items,
            className: 'cargo-list',
            emptyMessage: emptyMessage,
            maxHeight: 400,
            emptyMessageClass: 'cargo-empty-message'
        });
    },

    /**
     * Create a reputation list container (specific styling for reputation items)
     * @param {Array} items - Array of reputation item DOM elements
     * @param {string} emptyMessage - Message when no reputations (default: 'No faction relationships established')
     * @returns {HTMLElement} The reputation list container
     */
    createReputationList(items = [], emptyMessage = 'No faction relationships established') {
        return this.create({
            items: items,
            className: 'reputation-list',
            emptyMessage: emptyMessage,
            maxHeight: 500,
            emptyMessageClass: 'reputation-empty-message'
        });
    },

    /**
     * Create a buildings list container (specific styling for building items)
     * @param {Array} items - Array of building item DOM elements
     * @param {string} emptyMessage - Message when no buildings (default: 'No production buildings in this port.')
     * @returns {HTMLElement} The buildings list container
     */
    createBuildingsList(items = [], emptyMessage = 'No production buildings in this port.') {
        return this.create({
            items: items,
            className: 'buildings-list',
            emptyMessage: emptyMessage,
            maxHeight: 600,
            emptyMessageClass: 'buildings-empty-message'
        });
    },

    /**
     * Create a goods list container (specific styling for trading goods)
     * @param {Array} items - Array of good item DOM elements
     * @param {string} emptyMessage - Message when no goods (default: 'No goods available')
     * @returns {HTMLElement} The goods list container
     */
    createGoodsList(items = [], emptyMessage = 'No goods available') {
        return this.create({
            items: items,
            className: 'goods-list',
            emptyMessage: emptyMessage,
            maxHeight: 500,
            emptyMessageClass: 'goods-empty-message'
        });
    },

    /**
     * Create a generic item row with consistent styling
     * @param {Object} options - Configuration object
     * @param {string} options.className - CSS class for the row (default: 'list-item-row')
     * @param {string} options.backgroundColor - Background color (default: 'rgba(0, 0, 0, 0.3)')
     * @param {string} options.borderColor - Border color (default: 'rgba(139, 115, 85, 0.3)')
     * @param {number} options.padding - Padding in pixels (default: 10)
     * @param {number} options.marginBottom - Bottom margin in pixels (default: 8)
     * @param {string} options.gap - Gap between flex items (default: '15px')
     * @returns {HTMLElement} The item row element
     */
    createItemRow({
        className = 'list-item-row',
        backgroundColor = 'rgba(0, 0, 0, 0.3)',
        borderColor = 'rgba(139, 115, 85, 0.3)',
        padding = 10,
        marginBottom = 8,
        gap = '15px'
    } = {}) {
        const row = document.createElement('div');
        row.className = className;
        row.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: ${padding}px;
            margin-bottom: ${marginBottom}px;
            background-color: ${backgroundColor};
            border: 2px solid ${borderColor};
            border-radius: 6px;
            gap: ${gap};
        `;
        return row;
    },

    /**
     * Create a cargo item row (specific styling for cargo items)
     * @param {string} itemName - Name of the cargo item
     * @param {number} quantity - Quantity of the item
     * @param {number} avgPrice - Average price of the item
     * @param {Function} onDiscard - Discard button handler
     * @returns {HTMLElement} The cargo item row
     */
    createCargoItemRow(itemName, quantity, avgPrice, onDiscard) {
        const row = this.createItemRow({
            className: 'cargo-item-row',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderColor: 'rgba(139, 115, 85, 0.3)',
            padding: 10,
            marginBottom: 8,
            gap: '15px'
        });

        // Good image
        const goodImage = document.createElement('img');
        const goodImageName = itemName.toLowerCase().replace(/ /g, '_');
        goodImage.src = `assets/goods/${goodImageName}.png`;
        goodImage.alt = itemName;
        goodImage.style.cssText = `
            width: 40px;
            height: 40px;
            object-fit: contain;
        `;
        goodImage.onerror = () => {
            goodImage.style.display = 'none';
        };
        row.appendChild(goodImage);

        // Item info
        const itemInfo = document.createElement('div');
        itemInfo.style.cssText = `
            color: #f0e6d2;
            font-size: 16px;
            flex: 1;
        `;
        itemInfo.innerHTML = `
            <div style="font-weight: bold;">${itemName}</div>
            <div style="font-size: 14px; color: #ccc; margin-top: 4px;">
                Quantity: ${quantity} | Avg Price: ${avgPrice}g
            </div>
        `;
        row.appendChild(itemInfo);

        // Discard button
        const discardBtn = document.createElement('button');
        discardBtn.textContent = 'Discard';
        discardBtn.className = 'discard-button';
        discardBtn.style.cssText = `
            padding: 5px 15px;
            background-color: #c0392b;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;
        discardBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Discard all ${itemName}?`)) {
                onDiscard(itemName);
            }
        };
        row.appendChild(discardBtn);

        return row;
    },

    /**
     * Create a reputation item row (specific styling for reputation items)
     * @param {string} factionName - Name of the faction
     * @param {number} repValue - Reputation value (0-100)
     * @param {string} statusLabel - Status label (e.g., 'Friendly')
     * @param {string} statusColor - Status color
     * @returns {HTMLElement} The reputation item row
     */
    createReputationItemRow(factionName, repValue, statusLabel, statusColor) {
        const row = this.createItemRow({
            className: 'reputation-item-row',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderColor: 'rgba(139, 115, 85, 0.3)',
            padding: 12,
            marginBottom: 10,
            gap: '15px'
        });

        // Faction name
        const factionInfo = document.createElement('div');
        factionInfo.style.cssText = `
            color: #f0e6d2;
            font-size: 16px;
            font-weight: bold;
        `;
        factionInfo.textContent = factionName;
        row.appendChild(factionInfo);

        // Reputation bar and status
        const repContainer = document.createElement('div');
        repContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 15px;
        `;

        // Status label
        const statusEl = document.createElement('span');
        statusEl.style.cssText = `
            color: ${statusColor};
            font-size: 14px;
            font-weight: bold;
            min-width: 80px;
            text-align: right;
        `;
        statusEl.textContent = statusLabel;
        repContainer.appendChild(statusEl);

        // Progress bar
        const barContainer = document.createElement('div');
        barContainer.style.cssText = `
            width: 200px;
            height: 20px;
            background-color: rgba(0, 0, 0, 0.5);
            border: 2px solid #8b7355;
            border-radius: 10px;
            overflow: hidden;
        `;

        const barFill = document.createElement('div');
        barFill.style.cssText = `
            width: ${repValue}%;
            height: 100%;
            background-color: ${statusColor};
            transition: width 0.3s ease;
        `;
        barContainer.appendChild(barFill);
        repContainer.appendChild(barContainer);

        // Reputation value
        const repValueEl = document.createElement('span');
        repValueEl.style.cssText = `
            color: #f0e6d2;
            font-size: 14px;
            min-width: 40px;
        `;
        repValueEl.textContent = repValue;
        repContainer.appendChild(repValueEl);

        row.appendChild(repContainer);
        return row;
    },

    /**
     * Update list container with new items
     * @param {HTMLElement} container - List container element
     * @param {Array} items - New array of DOM elements
     * @param {string} emptyMessage - Empty message if no items
     */
    updateItems(container, items, emptyMessage = 'No items available') {
        // Clear existing content
        container.innerHTML = '';

        if (items.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.textContent = emptyMessage;
            emptyEl.style.cssText = `
                text-align: center;
                color: #888;
                padding: 40px 20px;
                font-style: italic;
            `;
            container.appendChild(emptyEl);
        } else {
            items.forEach(item => {
                container.appendChild(item);
            });
        }
    }
};
