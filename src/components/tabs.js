// BOTA - Tabs Component
// Reusable tabbed interface with tab buttons and content panels
// Handles consistent styling for options screens and other tabbed interfaces

const Tabs = {
    /**
     * Create a tabbed interface
     * @param {Object} options - Configuration object
     * @param {Array} options.tabs - Array of tab configurations
     * @param {string} options.tabs[].id - Unique tab ID
     * @param {string} options.tabs[].label - Tab button text
     * @param {HTMLElement} options.tabs[].content - Tab content element
     * @param {string} options.defaultTab - ID of default active tab (default: first tab)
     * @param {string} options.className - CSS class for tabs container (default: 'tabs-container')
     * @param {Function} options.onTabChange - Callback when tab changes (optional)
     * @returns {HTMLElement} The tabs container element
     */
    create({
        tabs = [],
        defaultTab = null,
        className = 'tabs-container',
        onTabChange = null
    }) {
        if (tabs.length === 0) {
            console.warn('Tabs.create: No tabs provided');
            return document.createElement('div');
        }

        // Use first tab as default if none specified
        const activeTabId = defaultTab || tabs[0].id;

        const container = document.createElement('div');
        container.className = className;
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            height: 100%;
        `;

        // Create tab buttons container
        const tabButtonsContainer = document.createElement('div');
        tabButtonsContainer.className = 'tabs-buttons';
        tabButtonsContainer.style.cssText = `
            display: flex;
            border-bottom: 2px solid #8b7355;
            background: linear-gradient(135deg, #2a1810 0%, #1a0f0a 100%);
        `;

        // Create content area
        const contentArea = document.createElement('div');
        contentArea.className = 'tabs-content';
        contentArea.style.cssText = `
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        `;

        // Create tab buttons and content
        const tabButtons = {};
        const tabContents = {};

        tabs.forEach((tab, index) => {
            // Create tab button
            const button = document.createElement('button');
            button.className = 'tab-button';
            button.textContent = tab.label;
            button.dataset.tabId = tab.id;
            
            // Style tab button
            const isActive = tab.id === activeTabId;
            this.styleTabButton(button, isActive);
            
            // Add click handler
            button.onclick = () => {
                this.switchTab(tab.id, tabButtons, tabContents, contentArea, onTabChange);
            };
            
            tabButtons[tab.id] = button;
            tabButtonsContainer.appendChild(button);

            // Create content container
            const contentContainer = document.createElement('div');
            contentContainer.className = 'tab-content';
            contentContainer.dataset.tabId = tab.id;
            contentContainer.style.display = isActive ? 'block' : 'none';
            
            if (tab.content) {
                contentContainer.appendChild(tab.content);
            }
            
            tabContents[tab.id] = contentContainer;
            contentArea.appendChild(contentContainer);
        });

        container.appendChild(tabButtonsContainer);
        container.appendChild(contentArea);

        return container;
    },

    /**
     * Style a tab button based on active state
     * @param {HTMLElement} button - Tab button element
     * @param {boolean} isActive - Whether the tab is active
     */
    styleTabButton(button, isActive) {
        button.style.cssText = `
            padding: 12px 20px;
            background: ${isActive ? 
                'linear-gradient(145deg, #8b4513, #a0522d)' : 
                'linear-gradient(145deg, #2c3e50, #34495e)'};
            border: 2px solid ${isActive ? '#cd853f' : '#555'};
            border-bottom: none;
            border-radius: 6px 6px 0 0;
            color: ${isActive ? '#f0e6d2' : '#999'};
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-right: 2px;
        `;

        if (!isActive) {
            button.onmouseover = () => {
                button.style.background = 'linear-gradient(145deg, #34495e, #2c3e50)';
                button.style.color = '#ccc';
            };
            button.onmouseout = () => {
                button.style.background = 'linear-gradient(145deg, #2c3e50, #34495e)';
                button.style.color = '#999';
            };
        }
    },

    /**
     * Switch to a different tab
     * @param {string} tabId - ID of tab to switch to
     * @param {Object} tabButtons - Object containing tab buttons
     * @param {Object} tabContents - Object containing tab content containers
     * @param {HTMLElement} contentArea - Content area container
     * @param {Function} onTabChange - Optional callback when tab changes
     */
    switchTab(tabId, tabButtons, tabContents, contentArea, onTabChange = null) {
        // Update tab buttons
        Object.keys(tabButtons).forEach(id => {
            const button = tabButtons[id];
            const isActive = id === tabId;
            this.styleTabButton(button, isActive);
        });

        // Update tab contents
        Object.keys(tabContents).forEach(id => {
            const content = tabContents[id];
            content.style.display = id === tabId ? 'block' : 'none';
        });

        // Call change callback
        if (onTabChange) {
            onTabChange(tabId);
        }
    },

    /**
     * Create options-style tabs (specific styling for options screen)
     * @param {Array} tabs - Array of tab configurations
     * @param {string} defaultTab - ID of default active tab
     * @param {Function} onTabChange - Callback when tab changes
     * @returns {HTMLElement} The options tabs container
     */
    createOptionsTabs(tabs, defaultTab = null, onTabChange = null) {
        const container = this.create({
            tabs: tabs,
            defaultTab: defaultTab,
            className: 'options-tabs',
            onTabChange: onTabChange
        });

        // Override tab button styling for options
        const tabButtons = container.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.className = 'options-tab';
            button.style.cssText = `
                padding: 10px 20px;
                background: transparent;
                border: none;
                border-bottom: 3px solid transparent;
                color: #999;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-right: 10px;
            `;
        });

        return container;
    },

    /**
     * Create debug-style tabs (specific styling for debug panels)
     * @param {Array} tabs - Array of tab configurations
     * @param {string} defaultTab - ID of default active tab
     * @param {Function} onTabChange - Callback when tab changes
     * @returns {HTMLElement} The debug tabs container
     */
    createDebugTabs(tabs, defaultTab = null, onTabChange = null) {
        const container = this.create({
            tabs: tabs,
            defaultTab: defaultTab,
            className: 'debug-tabs',
            onTabChange: onTabChange
        });

        // Override styling for debug tabs
        const tabButtonsContainer = container.querySelector('.tabs-buttons');
        tabButtonsContainer.style.cssText = `
            display: flex;
            border-bottom: 1px solid #555;
            background: rgba(20, 30, 40, 0.9);
            padding: 5px;
        `;

        const tabButtons = container.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.className = 'debug-tab';
            button.style.cssText = `
                padding: 6px 12px;
                background: #2c3e50;
                border: 1px solid #555;
                border-radius: 4px;
                color: #999;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-right: 5px;
            `;
        });

        return container;
    },

    /**
     * Get currently active tab ID from a tabs container
     * @param {HTMLElement} container - Tabs container element
     * @returns {string|null} Active tab ID or null if not found
     */
    getActiveTab(container) {
        const activeButton = container.querySelector('.tab-button[style*="background: linear-gradient(145deg, #8b4513"]');
        return activeButton ? activeButton.dataset.tabId : null;
    },

    /**
     * Programmatically switch to a tab
     * @param {HTMLElement} container - Tabs container element
     * @param {string} tabId - ID of tab to switch to
     */
    switchToTab(container, tabId) {
        const tabButtons = {};
        const tabContents = {};
        
        // Collect tab buttons and contents
        const buttons = container.querySelectorAll('.tab-button');
        const contents = container.querySelectorAll('.tab-content');
        
        buttons.forEach(button => {
            tabButtons[button.dataset.tabId] = button;
        });
        
        contents.forEach(content => {
            tabContents[content.dataset.tabId] = content;
        });

        const contentArea = container.querySelector('.tabs-content');
        this.switchTab(tabId, tabButtons, tabContents, contentArea);
    }
};
