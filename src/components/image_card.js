// BOTA - Image Card Component
// Reusable clickable card with image and text overlay
// Handles consistent styling for captain selection and other card-based interfaces

const ImageCard = {
    /**
     * Create a clickable image card
     * @param {Object} options - Configuration object
     * @param {string} options.image - Path to image file
     * @param {string} options.title - Card title text
     * @param {string} options.subtitle - Optional subtitle text
     * @param {Function} options.onClick - Click handler
     * @param {string} options.className - CSS class for the card (default: 'image-card')
     * @param {boolean} options.enabled - Whether the card is clickable (default: true)
     * @param {boolean} options.selected - Whether the card is selected (default: false)
     * @param {number} options.width - Card width in pixels (default: 200)
     * @param {number} options.height - Card height in pixels (default: 250)
     * @returns {HTMLElement} The image card element
     */
    create({
        image,
        title,
        subtitle = null,
        onClick = null,
        className = 'image-card',
        enabled = true,
        selected = false,
        width = 200,
        height = 250
    }) {
        const card = document.createElement('div');
        card.className = className;
        card.style.cssText = `
            width: ${width}px;
            height: ${height}px;
            position: relative;
            border: 3px solid ${selected ? '#d4af37' : '#8b7355'};
            border-radius: 10px;
            overflow: hidden;
            cursor: ${enabled ? 'pointer' : 'default'};
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #2a1810 0%, #1a0f0a 100%);
            box-shadow: ${selected ? 
                '0 8px 20px rgba(212, 175, 55, 0.3)' : 
                '0 4px 12px rgba(0, 0, 0, 0.5)'};
        `;

        // Add hover effects if enabled
        if (enabled) {
            card.onmouseover = () => {
                if (!selected) {
                    card.style.transform = 'translateY(-5px) scale(1.02)';
                    card.style.borderColor = '#cd853f';
                    card.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.7)';
                }
            };
            card.onmouseout = () => {
                if (!selected) {
                    card.style.transform = 'translateY(0) scale(1)';
                    card.style.borderColor = '#8b7355';
                    card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                }
            };
        }

        // Add click handler
        if (enabled && onClick) {
            card.onclick = (e) => {
                e.stopPropagation();
                onClick();
            };
        }

        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'card-image-container';
        imageContainer.style.cssText = `
            width: 100%;
            height: 70%;
            position: relative;
            overflow: hidden;
        `;

        // Create image element
        const img = document.createElement('img');
        img.src = image;
        img.alt = title;
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        `;
        img.onerror = () => {
            // Show placeholder if image fails to load
            img.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #34495e, #2c3e50);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #888;
                font-size: 14px;
            `;
            placeholder.textContent = 'No Image';
            imageContainer.appendChild(placeholder);
        };

        // Add image hover effect
        if (enabled) {
            card.onmouseover = () => {
                if (!selected) {
                    card.style.transform = 'translateY(-5px) scale(1.02)';
                    card.style.borderColor = '#cd853f';
                    card.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.7)';
                    img.style.transform = 'scale(1.1)';
                }
            };
            card.onmouseout = () => {
                if (!selected) {
                    card.style.transform = 'translateY(0) scale(1)';
                    card.style.borderColor = '#8b7355';
                    card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                    img.style.transform = 'scale(1)';
                }
            };
        }

        imageContainer.appendChild(img);
        card.appendChild(imageContainer);

        // Create text overlay
        const textOverlay = document.createElement('div');
        textOverlay.className = 'card-text-overlay';
        textOverlay.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
            padding: 15px;
            color: #f0e6d2;
        `;

        // Title
        const titleEl = document.createElement('div');
        titleEl.className = 'card-title';
        titleEl.textContent = title;
        titleEl.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        `;
        textOverlay.appendChild(titleEl);

        // Subtitle (optional)
        if (subtitle) {
            const subtitleEl = document.createElement('div');
            subtitleEl.className = 'card-subtitle';
            subtitleEl.textContent = subtitle;
            subtitleEl.style.cssText = `
                font-size: 12px;
                color: #ccc;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            `;
            textOverlay.appendChild(subtitleEl);
        }

        card.appendChild(textOverlay);

        // Add selected indicator
        if (selected) {
            const selectedIndicator = document.createElement('div');
            selectedIndicator.className = 'card-selected-indicator';
            selectedIndicator.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                width: 20px;
                height: 20px;
                background: #d4af37;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000;
                font-weight: bold;
                font-size: 12px;
            `;
            selectedIndicator.textContent = '✓';
            card.appendChild(selectedIndicator);
        }

        return card;
    },

    /**
     * Create a captain selection card (specific styling for captain selection)
     * @param {Object} captain - Captain data object
     * @param {string} captain.id - Captain ID
     * @param {string} captain.name - Captain name
     * @param {string} captain.title - Captain title
     * @param {string} captain.image - Captain portrait path
     * @param {Function} onClick - Click handler
     * @param {boolean} selected - Whether this captain is selected
     * @returns {HTMLElement} The captain card element
     */
    createCaptainCard(captain, onClick, selected = false) {
        return this.create({
            image: captain.image,
            title: captain.name,
            subtitle: captain.title,
            onClick: onClick,
            className: 'captain-card',
            enabled: true,
            selected: selected,
            width: 180,
            height: 220
        });
    },

    /**
     * Create a ship selection card (specific styling for ship selection)
     * @param {Object} ship - Ship data object
     * @param {string} ship.name - Ship name
     * @param {string} ship.type - Ship type
     * @param {string} ship.image - Ship image path
     * @param {Function} onClick - Click handler
     * @param {boolean} selected - Whether this ship is selected
     * @returns {HTMLElement} The ship card element
     */
    createShipCard(ship, onClick, selected = false) {
        return this.create({
            image: ship.image,
            title: ship.name,
            subtitle: ship.type,
            onClick: onClick,
            className: 'ship-card',
            enabled: true,
            selected: selected,
            width: 200,
            height: 250
        });
    },

    /**
     * Create a disabled card (not clickable, grayed out)
     * @param {string} image - Path to image file
     * @param {string} title - Card title text
     * @param {string} subtitle - Optional subtitle text
     * @param {string} reason - Reason for being disabled
     * @returns {HTMLElement} The disabled card element
     */
    createDisabledCard(image, title, subtitle = null, reason = 'Unavailable') {
        const card = this.create({
            image: image,
            title: title,
            subtitle: subtitle,
            onClick: null,
            className: 'image-card disabled',
            enabled: false,
            selected: false,
            width: 200,
            height: 250
        });

        // Add disabled styling
        card.style.cssText += `
            opacity: 0.5;
            filter: grayscale(50%);
            cursor: not-allowed;
        `;

        // Add disabled overlay
        const disabledOverlay = document.createElement('div');
        disabledOverlay.className = 'card-disabled-overlay';
        disabledOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ff6b6b;
            font-weight: bold;
            font-size: 14px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        `;
        disabledOverlay.textContent = reason;
        card.appendChild(disabledOverlay);

        return card;
    },

    /**
     * Create a grid of cards
     * @param {Array} cards - Array of card elements
     * @param {Object} options - Grid configuration
     * @param {number} options.columns - Number of columns (default: 3)
     * @param {number} options.gap - Gap between cards in pixels (default: 20)
     * @param {string} options.className - CSS class for grid container (default: 'card-grid')
     * @returns {HTMLElement} The card grid container
     */
    createGrid(cards = [], { columns = 3, gap = 20, className = 'card-grid' } = {}) {
        const grid = document.createElement('div');
        grid.className = className;
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(${columns}, 1fr);
            gap: ${gap}px;
            padding: 20px;
            justify-items: center;
        `;

        cards.forEach(card => {
            grid.appendChild(card);
        });

        return grid;
    },

    /**
     * Update card selection state
     * @param {HTMLElement} card - Card element to update
     * @param {boolean} selected - Whether the card should be selected
     */
    setSelected(card, selected) {
        const isSelected = card.classList.contains('selected') || card.querySelector('.card-selected-indicator');
        
        if (selected && !isSelected) {
            // Add selected styling
            card.style.borderColor = '#d4af37';
            card.style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.3)';
            
            // Add selected indicator
            const indicator = document.createElement('div');
            indicator.className = 'card-selected-indicator';
            indicator.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                width: 20px;
                height: 20px;
                background: #d4af37;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000;
                font-weight: bold;
                font-size: 12px;
            `;
            indicator.textContent = '✓';
            card.appendChild(indicator);
        } else if (!selected && isSelected) {
            // Remove selected styling
            card.style.borderColor = '#8b7355';
            card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
            
            // Remove selected indicator
            const indicator = card.querySelector('.card-selected-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    }
};
