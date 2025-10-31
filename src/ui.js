// BOTA - UI Module
// Handles DOM-based UI elements (menus, buttons, overlays)

const UI = {
    overlay: null,
    currentScreen: null,
    viewCargoButton: null,
    viewReputationsButton: null,
    isOverlayActive: false, // Track if any UI overlay is blocking gameplay

    init() {
        this.overlay = document.getElementById('ui-overlay');
        if (!this.overlay) {
            throw new Error('UI overlay element not found!');
        }
        
        // Create View Cargo button (hidden by default)
        this.createViewCargoButton();
        
        // Create View Reputations button (hidden by default)
        this.createViewReputationsButton();
        
        console.log('UI initialized');
    },
    
    // AIDEV-NOTE: Check if any UI overlay is currently blocking gameplay
    hasActiveOverlay() {
        // Check if main overlay has content
        if (this.currentScreen !== null) {
            return true;
        }
        
        // Check if cargo modal is open
        const cargoModal = document.getElementById('cargo-modal');
        if (cargoModal) {
            return true;
        }
        
        // Check if reputation modal is open
        const repModal = document.getElementById('reputation-modal');
        if (repModal) {
            return true;
        }
        
        return false;
    },
    
    // AIDEV-NOTE: Create "View Cargo" button for ship stats panel
    createViewCargoButton() {
        this.viewCargoButton = document.createElement('button');
        this.viewCargoButton.id = 'view-cargo-button';
        this.viewCargoButton.className = 'view-cargo-button';
        this.viewCargoButton.textContent = '📦 View Cargo';
        this.viewCargoButton.style.display = 'none'; // Hidden by default
        this.viewCargoButton.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.showCargoWindow();
        };
        document.body.appendChild(this.viewCargoButton);
    },
    
    // AIDEV-NOTE: Show/hide View Cargo button
    // Position it at the bottom of the ship stats panel
    showViewCargoButton() {
        if (!this.viewCargoButton) return;
        
        // Position button at bottom of ship stats panel
        const padding = 20;
        const portraitSize = 100;
        const panelY = padding + portraitSize + 20;
        const panelHeight = 160; // Updated to match new ship panel height
        const buttonY = panelY + panelHeight - 32;
        
        this.viewCargoButton.style.display = 'block';
        this.viewCargoButton.style.position = 'absolute';
        this.viewCargoButton.style.left = (padding + 10) + 'px';
        this.viewCargoButton.style.top = buttonY + 'px';
        this.viewCargoButton.style.width = '150px';
        this.viewCargoButton.style.zIndex = '100';
    },
    
    hideViewCargoButton() {
        if (this.viewCargoButton) {
            this.viewCargoButton.style.display = 'none';
        }
    },
    
    // AIDEV-NOTE: Create "View Reputations" button for player stats panel
    createViewReputationsButton() {
        this.viewReputationsButton = document.createElement('button');
        this.viewReputationsButton.id = 'view-reputations-button';
        this.viewReputationsButton.className = 'view-reputations-button';
        this.viewReputationsButton.textContent = '🤝 View Reputations';
        this.viewReputationsButton.style.display = 'none'; // Hidden by default
        this.viewReputationsButton.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.showReputationWindow();
        };
        document.body.appendChild(this.viewReputationsButton);
    },
    
    // AIDEV-NOTE: Show/hide View Reputations button
    // Position it at the bottom of the player stats panel
    showViewReputationsButton() {
        if (!this.viewReputationsButton) return;
        
        // Position button at bottom of player stats panel
        const padding = 20;
        const portraitSize = 100;
        const shipPanelY = padding + portraitSize + 20;
        const shipPanelHeight = 160; // Updated to match new ship panel height
        const playerPanelY = shipPanelY + shipPanelHeight + 10;
        const playerPanelHeight = 80;
        const buttonY = playerPanelY + playerPanelHeight - 32;
        
        this.viewReputationsButton.style.display = 'block';
        this.viewReputationsButton.style.position = 'absolute';
        this.viewReputationsButton.style.left = (padding + 10) + 'px';
        this.viewReputationsButton.style.top = buttonY + 'px';
        this.viewReputationsButton.style.width = '180px';
        this.viewReputationsButton.style.zIndex = '100';
    },
    
    hideViewReputationsButton() {
        if (this.viewReputationsButton) {
            this.viewReputationsButton.style.display = 'none';
        }
    },

    clear() {
        this.overlay.innerHTML = '';
        this.currentScreen = null;
    },

    // AIDEV-NOTE: Create main menu screen
    showMainMenu(hasSaveGame = false) {
        this.clear();
        this.currentScreen = 'main_menu';

        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu-container';

        // Logo (text placeholder for now)
        const logo = document.createElement('div');
        logo.className = 'logo-text';
        logo.textContent = ''; // Logo drawn on canvas
        menuContainer.appendChild(logo);

        // Continue button (disabled if no save)
        const continueBtn = document.createElement('button');
        continueBtn.className = 'menu-button';
        continueBtn.textContent = 'Continue';
        continueBtn.disabled = !hasSaveGame;
        continueBtn.onclick = () => Game.onContinueGame();
        menuContainer.appendChild(continueBtn);

        if (hasSaveGame) {
            const saveInfo = document.createElement('div');
            saveInfo.className = 'save-info';
            saveInfo.textContent = '(Week 1, 500g)'; // TODO: Load actual save info
            menuContainer.appendChild(saveInfo);
        }

        // New Game button
        const newGameBtn = document.createElement('button');
        newGameBtn.className = 'menu-button';
        newGameBtn.textContent = 'New Game';
        newGameBtn.onclick = () => Game.onNewGame();
        menuContainer.appendChild(newGameBtn);

        // Options button
        const optionsBtn = document.createElement('button');
        optionsBtn.className = 'menu-button';
        optionsBtn.textContent = 'Options';
        optionsBtn.onclick = () => Game.onOptions();
        menuContainer.appendChild(optionsBtn);

        // Credits button
        const creditsBtn = document.createElement('button');
        creditsBtn.className = 'menu-button';
        creditsBtn.textContent = 'Credits';
        creditsBtn.onclick = () => Game.onCredits();
        menuContainer.appendChild(creditsBtn);

        // Exit button
        const exitBtn = document.createElement('button');
        exitBtn.className = 'menu-button';
        exitBtn.textContent = 'Exit';
        exitBtn.onclick = () => {
            if (confirm('Are you sure you want to exit?')) {
                window.close();
            }
        };
        menuContainer.appendChild(exitBtn);

        this.overlay.appendChild(menuContainer);
        
        // Debug Tools section (positioned in top-right corner)
        const debugContainer = document.createElement('div');
        debugContainer.style.position = 'absolute';
        debugContainer.style.top = '20px';
        debugContainer.style.right = '20px';
        debugContainer.style.textAlign = 'right';
        
        const debugTitle = document.createElement('div');
        debugTitle.textContent = 'Debug Tools';
        debugTitle.style.color = '#999';
        debugTitle.style.fontSize = '14px';
        debugTitle.style.marginBottom = '10px';
        debugContainer.appendChild(debugTitle);
        
        // Dice Test button
        const diceTestBtn = document.createElement('button');
        diceTestBtn.className = 'menu-button';
        diceTestBtn.textContent = 'Dice Test';
        diceTestBtn.style.fontSize = '14px';
        diceTestBtn.style.padding = '8px 16px';
        diceTestBtn.style.marginBottom = '8px';
        diceTestBtn.onclick = () => window.open('dice_test_standalone.html', '_blank');
        debugContainer.appendChild(diceTestBtn);
        
        // Economy Analyzer button
        const econBtn = document.createElement('button');
        econBtn.className = 'menu-button';
        econBtn.textContent = 'Economy Analyzer';
        econBtn.style.fontSize = '14px';
        econBtn.style.padding = '8px 16px';
        econBtn.onclick = () => window.open('economy_analyzer.html', '_blank');
        debugContainer.appendChild(econBtn);
        
        this.overlay.appendChild(debugContainer);
    },

    // Show simple message screen
    showMessage(title, message, onClose) {
        this.clear();

        const container = document.createElement('div');
        container.className = 'menu-container';

        const titleEl = document.createElement('h1');
        titleEl.textContent = title;
        titleEl.style.color = '#f0e6d2';
        titleEl.style.marginBottom = '20px';
        container.appendChild(titleEl);

        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        messageEl.style.color = '#ccc';
        messageEl.style.marginBottom = '30px';
        messageEl.style.fontSize = '18px';
        container.appendChild(messageEl);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'menu-button';
        closeBtn.textContent = 'OK';
        closeBtn.onclick = onClose;
        container.appendChild(closeBtn);

        this.overlay.appendChild(container);
    },

    // AIDEV-NOTE: Show options screen with tabs
    showOptions(onClose) {
        this.clear();

        const container = document.createElement('div');
        container.className = 'menu-container';

        const optionsBox = document.createElement('div');
        optionsBox.className = 'options-container';

        // Header
        const header = document.createElement('div');
        header.className = 'options-header';
        const title = document.createElement('h1');
        title.className = 'options-title';
        title.textContent = 'Options';
        header.appendChild(title);
        optionsBox.appendChild(header);

        // Create tab content
        const changelogContent = document.createElement('div');
        changelogContent.className = 'options-tab-content';
        changelogContent.innerHTML = this.generateChangelogHTML();

        const audioContent = document.createElement('div');
        audioContent.className = 'options-tab-content';
        audioContent.innerHTML = `
            <div class="options-section">
                <div class="options-section-title">Audio Settings</div>
                <p style="color: #888; font-style: italic;">Audio settings coming soon!</p>
                <p style="color: #aaa; margin-top: 15px;">Future features:</p>
                <p style="color: #aaa; padding-left: 20px;">• Master Volume</p>
                <p style="color: #aaa; padding-left: 20px;">• Music Volume</p>
                <p style="color: #aaa; padding-left: 20px;">• Sound Effects Volume</p>
                <p style="color: #aaa; padding-left: 20px;">• Ambient Sounds Volume</p>
            </div>
        `;

        const controlsContent = document.createElement('div');
        controlsContent.className = 'options-tab-content';
        controlsContent.innerHTML = `
            <div class="options-section">
                <div class="options-section-title">Controls</div>
                <p style="color: #aaa; margin-bottom: 10px;"><strong style="color: #d4af37;">WASD</strong> - Pan camera</p>
                <p style="color: #aaa; margin-bottom: 10px;"><strong style="color: #d4af37;">Mouse Wheel</strong> - Zoom in/out</p>
                <p style="color: #aaa; margin-bottom: 10px;"><strong style="color: #d4af37;">Left Click</strong> - Navigate boat / Select destination</p>
                <p style="color: #aaa; margin-bottom: 10px;"><strong style="color: #d4af37;">Shift</strong> - Show port information on map</p>
            </div>
            <div class="options-section">
                <div class="options-section-title">Camera</div>
                <p style="color: #aaa;">Camera auto-follows your boat after 4 seconds of no input.</p>
            </div>
        `;

        // Create tabs using Tabs component
        const tabs = [
            { id: 'changelog', label: 'Changelog', content: changelogContent },
            { id: 'audio', label: 'Audio', content: audioContent },
            { id: 'controls', label: 'Controls', content: controlsContent }
        ];

        const tabsContainer = Tabs.createOptionsTabs(tabs, 'changelog');
        optionsBox.appendChild(tabsContainer);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'options-footer';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'back-button';
        closeBtn.textContent = 'Back';
        closeBtn.onclick = onClose;
        footer.appendChild(closeBtn);
        optionsBox.appendChild(footer);

        container.appendChild(optionsBox);
        this.overlay.appendChild(container);
    },


    // Generate changelog HTML from LoadingScreen changelog data
    generateChangelogHTML() {
        if (!LoadingScreen || !LoadingScreen.changelog) {
            return '<p style="color: #888;">Changelog not available.</p>';
        }

        let html = '';
        
        for (const section of LoadingScreen.changelog) {
            html += '<div class="changelog-section">';
            html += `<div class="changelog-version">${section.version}`;
            if (section.date) {
                html += `<span class="changelog-date">${section.date}</span>`;
            }
            html += '</div>';
            
            for (const change of section.changes) {
                html += '<div class="changelog-item">';
                html += `<span class="changelog-category">[${change.category}]</span>`;
                html += change.text;
                html += '</div>';
            }
            
            html += '</div>';
        }
        
        return html;
    },

    // AIDEV-NOTE: Show error modal on top of existing screen
    showErrorModal(title, message) {
        // Create modal content
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #2a1810 0%, #1a0f0a 100%);
            border: 3px solid #8b4513;
            border-radius: 10px;
            padding: 30px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        `;

        const titleEl = document.createElement('h2');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            color: #ff6b6b;
            margin: 0 0 20px 0;
            font-size: 24px;
        `;
        content.appendChild(titleEl);

        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            color: #f0e6d2;
            margin: 0 0 30px 0;
            font-size: 16px;
            line-height: 1.5;
        `;
        content.appendChild(messageEl);

        const closeBtn = Modal.createCloseButton(() => {
            Modal.hide(modal);
        }, 'OK', 'menu-button');
        closeBtn.style.cssText = `
            padding: 12px 40px;
            font-size: 16px;
            cursor: pointer;
        `;
        content.appendChild(closeBtn);

        // Create and show modal
        const modal = Modal.create({
            className: 'error-modal',
            content: content,
            onClose: () => Modal.hide(modal),
            closeOnBackdrop: true
        });

        document.body.appendChild(modal);
    },

    // AIDEV-NOTE: Show debug panel with toggle buttons
    showDebugPanel(debugOptions) {
        // Remove existing debug panel if any
        const existing = document.getElementById('debug-panel');
        if (existing) {
            existing.remove();
        }

        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.className = 'debug-panel collapsed'; // Start collapsed

        // Title with expand/collapse button
        const title = document.createElement('div');
        title.className = 'debug-title';
        
        const titleText = document.createElement('span');
        titleText.textContent = 'Debug';
        title.appendChild(titleText);
        
        const expandIcon = document.createElement('span');
        expandIcon.className = 'debug-expand-icon';
        expandIcon.textContent = '▼';
        title.appendChild(expandIcon);
        
        // Toggle expand/collapse on click
        title.onclick = () => {
            const wasCollapsed = panel.classList.contains('collapsed');
            panel.classList.toggle('collapsed');
            
            // AIDEV-NOTE: When closing (collapsing) debug panel, turn off all debug options
            if (!wasCollapsed) {
                // Panel is now collapsed, reset all debug options
                debugOptions.showCoastlines = false;
                debugOptions.showIslandIds = false;
                debugOptions.showBounds = false;
                debugOptions.showWaypoints = false;
                debugOptions.showDebugInfo = false;
                
                if (debugOptions.showClickPosition) {
                    debugOptions.showClickPosition = false;
                    this.hideClickPositionWindow();
                }
                
                if (debugOptions.portEditMode) {
                    debugOptions.portEditMode = false;
                    this.hidePortEditWindow();
                }
                
                // Update all toggle button states
                this.updateDebugToggles(panel, debugOptions);
            }
        };
        
        panel.appendChild(title);

        // Content container
        const content = document.createElement('div');
        content.className = 'debug-content';

        // Toggle buttons
        this.addDebugToggle(content, 'Coastlines', debugOptions, 'showCoastlines');
        this.addDebugToggle(content, 'Island IDs', debugOptions, 'showIslandIds');
        this.addDebugToggle(content, 'Bounds', debugOptions, 'showBounds');
        this.addDebugToggle(content, 'Waypoints', debugOptions, 'showWaypoints');
        this.addDebugToggle(content, 'Active Path', debugOptions, 'showActivePath');
        this.addDebugToggle(content, 'Info', debugOptions, 'showDebugInfo');
        this.addDebugToggle(content, 'Click Position', debugOptions, 'showClickPosition', (isActive) => {
            // Show or hide click position window
            if (isActive) {
                this.showClickPositionWindow();
            } else {
                this.hideClickPositionWindow();
            }
        });
        this.addDebugToggle(content, 'Port Edit Mode', debugOptions, 'portEditMode', (isActive) => {
            // Show or hide port edit window
            if (isActive) {
                this.showPortEditWindow();
            } else {
                this.hidePortEditWindow();
            }
        });

        // Add trade log button (not a toggle, just a button)
        this.addDebugButton(content, 'Show Trade Log', () => {
            this.showTradeLogWindow();
        });
        
        // Add production/consumption analysis button
        this.addDebugButton(content, 'Production vs Consumption', () => {
            this.showProductionConsumptionWindow();
        });

        panel.appendChild(content);
        this.overlay.appendChild(panel);
    },

    // AIDEV-NOTE: Update all debug toggle buttons to match current state
    updateDebugToggles(panel, debugOptions) {
        const content = panel.querySelector('.debug-content');
        if (!content) return;
        
        const rows = content.querySelectorAll('.debug-row');
        rows.forEach(row => {
            const btn = row.querySelector('.debug-toggle');
            const labelElement = row.querySelector('span');
            if (!labelElement) return; // Skip rows without a label span
            
            const label = labelElement.textContent;
            
            // Map label to debug option key
            const keyMap = {
                'Coastlines': 'showCoastlines',
                'Island IDs': 'showIslandIds',
                'Bounds': 'showBounds',
                'Waypoints': 'showWaypoints',
                'Active Path': 'showActivePath',
                'Info': 'showDebugInfo',
                'Click Position': 'showClickPosition',
                'Port Edit Mode': 'portEditMode'
            };
            
            const key = keyMap[label];
            if (key && btn) {
                btn.textContent = debugOptions[key] ? 'ON' : 'OFF';
                if (debugOptions[key]) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
    },

    // Helper to add a toggle button
    addDebugToggle(container, label, debugOptions, key, onChange = null) {
        const row = document.createElement('div');
        row.className = 'debug-row';

        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        row.appendChild(labelEl);

        const btn = document.createElement('button');
        btn.className = 'debug-toggle';
        btn.textContent = debugOptions[key] ? 'ON' : 'OFF';
        btn.onclick = () => {
            debugOptions[key] = !debugOptions[key];
            btn.textContent = debugOptions[key] ? 'ON' : 'OFF';
            btn.classList.toggle('active', debugOptions[key]);
            if (onChange) {
                onChange(debugOptions[key]);
            }
        };
        if (debugOptions[key]) {
            btn.classList.add('active');
        }
        row.appendChild(btn);

        container.appendChild(row);
    },
    
    // Helper to add a simple button (not a toggle)
    addDebugButton(container, label, onClick) {
        const row = document.createElement('div');
        row.className = 'debug-row';

        const btn = document.createElement('button');
        btn.className = 'debug-button';
        btn.textContent = label;
        btn.onclick = onClick;
        row.appendChild(btn);

        container.appendChild(row);
    },

    // AIDEV-NOTE: Show click position window
    showClickPositionWindow() {
        // Remove existing window if any
        this.hideClickPositionWindow();

        const window = DebugWindow.createClickPositionWindow(
            () => {
                Game.clickPositions = [];
                this.updateClickPositions();
            },
            () => {
                const text = Game.clickPositions.join('\n');
                navigator.clipboard.writeText(text).then(() => {
                    // Update button text temporarily
                    const copyBtn = window.querySelector('.click-position-btn:last-child');
                    if (copyBtn) {
                        const originalText = copyBtn.textContent;
                        copyBtn.textContent = 'Copied!';
                        setTimeout(() => {
                            copyBtn.textContent = originalText;
                        }, 1000);
                    }
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    alert('Failed to copy to clipboard');
                });
            }
        );

        this.overlay.appendChild(window);
    },

    // Hide click position window
    hideClickPositionWindow() {
        DebugWindow.hide('click-position-window');
    },

    // Update click position list
    updateClickPositions() {
        DebugWindow.updateClickPositions('click-position-window', Game.clickPositions);
    },

    // AIDEV-NOTE: Show port edit window
    showPortEditWindow() {
        // Remove existing window if any
        this.hidePortEditWindow();

        const window = DebugWindow.createPortEditWindow(() => {
            const code = Game.exportPortData();
            navigator.clipboard.writeText(code).then(() => {
                // Update button text temporarily
                const copyBtn = window.querySelector('.port-edit-btn');
                if (copyBtn) {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                    }, 2000);
                }
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard');
            });
        });

        this.overlay.appendChild(window);
    },

    // Hide port edit window
    hidePortEditWindow() {
        DebugWindow.hide('port-edit-window');
    },
    
    // AIDEV-NOTE: Show trade log window for debugging
    showTradeLogWindow() {
        // Get trade log for port 15 (index 14 in array)
        const portIndex = 14; // 0-based index for port 15
        const port = Game.ports[portIndex];
        
        if (!port) {
            console.error('Port 15 not found');
            return;
        }
        
        const tradeLog = Economy.getTradeLogForPort(port.id);
        if (!tradeLog) {
            console.error('No trade log available');
            return;
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'cargo-modal';
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
        
        // Create window
        const window = document.createElement('div');
        window.className = 'cargo-window';
        window.style.maxHeight = '80vh';
        window.style.minWidth = '600px';
        
        // Title
        const title = document.createElement('h2');
        title.textContent = `Trade Log: ${port.name} (${port.id})`;
        title.style.marginBottom = '20px';
        title.style.color = '#d4af37';
        window.appendChild(title);
        
        // Content
        const content = document.createElement('div');
        content.style.overflowY = 'auto';
        content.style.maxHeight = '60vh';
        content.style.color = '#ccc';
        content.style.fontFamily = 'monospace';
        content.style.fontSize = '14px';
        content.style.lineHeight = '1.6';
        
        // Generate trade log text
        let logText = '';
        const otherPorts = Object.keys(tradeLog).sort();
        
        for (const otherPortId of otherPorts) {
            const trades = tradeLog[otherPortId];
            const goodIds = Object.keys(trades);
            
            if (goodIds.length === 0) continue;
            
            // Get other port info
            const otherPort = Game.ports.find(p => p.id === otherPortId);
            const otherPortName = otherPort ? otherPort.name : otherPortId;
            
            logText += `<div style="margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px;">`;
            logText += `<strong style="color: #d4af37;">${port.name} traded with ${otherPortName}:</strong><br>`;
            
            // Sort goods alphabetically
            const sortedGoods = goodIds.sort();
            for (const goodId of sortedGoods) {
                const delta = trades[goodId];
                const sign = delta > 0 ? '+' : '';
                const color = delta > 0 ? '#4CAF50' : '#f44336';
                logText += `<span style="color: ${color};">${sign}${delta} ${goodId}</span><br>`;
            }
            
            logText += `</div>`;
        }
        
        if (logText === '') {
            logText = '<p>No trades recorded for this port.</p>';
        }
        
        content.innerHTML = logText;
        window.appendChild(content);
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'cargo-close-btn';
        closeBtn.textContent = 'Close';
        closeBtn.onclick = () => modal.remove();
        window.appendChild(closeBtn);
        
        modal.appendChild(window);
        this.overlay.appendChild(modal);
    },
    
    // AIDEV-NOTE: Show production vs consumption analysis window
    showProductionConsumptionWindow() {
        // Analyze all ports
        const analyses = [];
        for (const port of Game.ports) {
            const analysis = Economy.getProductionConsumptionAnalysis(port);
            analyses.push(analysis);
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'cargo-modal';
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
        
        // Create window
        const window = document.createElement('div');
        window.className = 'cargo-window';
        window.style.maxHeight = '80vh';
        window.style.minWidth = '800px';
        
        // Title
        const title = document.createElement('h2');
        title.textContent = 'Production vs Consumption Analysis';
        title.style.marginBottom = '20px';
        title.style.color = '#d4af37';
        window.appendChild(title);
        
        // Summary stats
        const summary = document.createElement('div');
        summary.style.marginBottom = '20px';
        summary.style.padding = '15px';
        summary.style.background = 'rgba(0,0,0,0.4)';
        summary.style.borderRadius = '6px';
        summary.style.color = '#ccc';
        
        let totalProd = 0;
        let totalCons = 0;
        for (const analysis of analyses) {
            totalProd += analysis.totalProduction;
            totalCons += analysis.totalConsumption;
        }
        
        summary.innerHTML = `
            <strong style="color: #d4af37;">Overall Economy:</strong><br>
            Total Production: <span style="color: #4CAF50;">${totalProd.toFixed(1)} units/week</span><br>
            Total Consumption: <span style="color: #f44336;">${totalCons.toFixed(1)} units/week</span><br>
            Net Balance: <span style="color: ${totalProd > totalCons ? '#4CAF50' : '#f44336'};">${(totalProd - totalCons).toFixed(1)} units/week</span>
        `;
        window.appendChild(summary);
        
        // Content
        const content = document.createElement('div');
        content.style.overflowY = 'auto';
        content.style.maxHeight = '50vh';
        content.style.color = '#ccc';
        content.style.fontSize = '13px';
        content.style.lineHeight = '1.5';
        
        // Generate analysis for each port
        let htmlContent = '';
        
        // Sort ports by tier then name
        analyses.sort((a, b) => {
            if (a.tier !== b.tier) return b.tier - a.tier; // Higher tier first
            return a.portName.localeCompare(b.portName);
        });
        
        for (const analysis of analyses) {
            htmlContent += `<div style="margin-bottom: 15px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 4px;">`;
            htmlContent += `<strong style="color: #d4af37;">${analysis.portName}</strong> `;
            htmlContent += `<span style="color: #999;">(Tier ${analysis.tier})</span><br>`;
            htmlContent += `<span style="font-size: 11px; color: #888;">Production: ${analysis.totalProduction} units/week | Consumption: ${analysis.totalConsumption.toFixed(1)} units/week | Net: ${(analysis.totalProduction - analysis.totalConsumption).toFixed(1)}</span><br><br>`;
            
            // Sort goods by net production (highest first)
            const sortedGoods = Object.keys(analysis.goods).sort((a, b) => {
                return analysis.goods[b].net - analysis.goods[a].net;
            });
            
            for (const goodId of sortedGoods) {
                const good = analysis.goods[goodId];
                const netColor = good.net > 0 ? '#4CAF50' : good.net < 0 ? '#f44336' : '#FFC107';
                const netSign = good.net > 0 ? '+' : '';
                
                htmlContent += `<div style="margin-left: 10px; padding: 3px 0;">`;
                htmlContent += `<span style="color: #d4af37;">${goodId}</span>: `;
                htmlContent += `<span style="color: #4CAF50;">+${good.production}</span> `;
                htmlContent += `<span style="color: #f44336;">-${good.consumption.toFixed(1)}</span> `;
                htmlContent += `= <span style="color: ${netColor}; font-weight: bold;">${netSign}${good.net.toFixed(1)}</span>`;
                htmlContent += `</div>`;
            }
            
            htmlContent += `</div>`;
        }
        
        content.innerHTML = htmlContent;
        window.appendChild(content);
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'cargo-close-btn';
        closeBtn.textContent = 'Close';
        closeBtn.onclick = () => modal.remove();
        window.appendChild(closeBtn);
        
        modal.appendChild(window);
        this.overlay.appendChild(modal);
    },

    // AIDEV-NOTE: Show port screen with faction-specific background
    // Main entry point when player docks at a port
    showPortScreen(port) {
        this.clear();
        this.currentScreen = 'port';

        // Create port modal container
        const modal = document.createElement('div');
        modal.className = 'port-modal';

        // Create port background container
        const background = document.createElement('div');
        background.className = 'port-background';
        
        // Set faction-specific background image
        const factionKey = port.faction.toLowerCase().replace(/\s+/g, '_');
        const bgImage = Renderer.portBackgrounds?.[port.faction];
        if (bgImage) {
            background.style.backgroundImage = `url('${bgImage.src}')`;
        } else {
            // Fallback color if image not loaded
            background.style.backgroundColor = '#2c3e50';
            console.warn('Port background not found for faction:', port.faction);
        }

        // Create header
        const header = document.createElement('div');
        header.className = 'port-header';
        
        const portName = document.createElement('h1');
        portName.className = 'port-name';
        portName.textContent = port.name;
        header.appendChild(portName);
        
        const factionLabel = document.createElement('p');
        factionLabel.className = 'port-faction';
        factionLabel.textContent = `Controlled by: ${port.faction}`;
        header.appendChild(factionLabel);
        
        background.appendChild(header);

        // Create action buttons container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'port-actions';

        // Trading button
        const tradingBtn = this.createActionButton('⚓', 'Trading', () => {
            this.showTradingScreen(port);
        });
        actionsContainer.appendChild(tradingBtn);

        // Production button
        const productionBtn = this.createActionButton('🏭', 'Production', () => {
            this.showProductionScreen(port);
        });
        actionsContainer.appendChild(productionBtn);

        // Shipyard button
        const shipyardBtn = this.createActionButton('🚢', 'Shipyard', () => {
            this.showShipyardScreen(port);
        });
        actionsContainer.appendChild(shipyardBtn);

        // Tavern button
        const tavernBtn = this.createActionButton('🍺', 'Tavern', () => {
            this.showTavernScreen(port);
        });
        actionsContainer.appendChild(tavernBtn);

        // Town Encounters button
        const encountersBtn = this.createActionButton('📜', 'Town Encounters', () => {
            this.showTownEncountersScreen(port);
        });
        actionsContainer.appendChild(encountersBtn);

        // Leave Port button
        const leaveBtn = this.createActionButton('⛵', 'Leave Port', () => {
            this.clear();
            Game.leavePort();
        });
        leaveBtn.classList.add('leave');
        actionsContainer.appendChild(leaveBtn);

        background.appendChild(actionsContainer);
        modal.appendChild(background);
        this.overlay.appendChild(modal);
    },

    // Helper to create action button
    createActionButton(icon, text, onClick) {
        const button = document.createElement('button');
        button.className = 'port-action-button';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'icon';
        iconSpan.textContent = icon;
        button.appendChild(iconSpan);
        
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        button.appendChild(textSpan);
        
        button.onclick = onClick;
        
        return button;
    },

    // AIDEV-NOTE: Show trading sub-screen with full trading interface
    showTradingScreen(port) {
        this.clear();
        this.currentScreen = 'trading';
        
        // Store current transactions (goodId -> quantity, positive = buy, negative = sell)
        this.currentTransactions = {};
        
        // Create a function to update the trading summary (must be defined before screen creation)
        let screenElement = null;
        const updateSummary = () => {
            if (screenElement) {
                const summary = screenElement.querySelector('#trading-summary');
                const confirmBtn = screenElement.querySelector('.confirm-button');
                if (summary) {
                    ScreenLayout.updateTradingSummary(port, summary, confirmBtn);
                }
            }
        };
        
        // Create trading screen using ScreenLayout component
        screenElement = ScreenLayout.createTradingScreenWithSliders({
            port: port,
            onValueChange: (goodId, quantity, price, total) => {
                this.currentTransactions[goodId] = quantity;
                // Update the trading summary in the screen
                updateSummary();
            },
            onConfirm: () => this.executeTradeTransaction(port),
            onBack: () => this.showPortScreen(port)
        });
        
        this.overlay.appendChild(screenElement);
    },
    
    // AIDEV-NOTE: Get list of goods available for trading
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
    
    // AIDEV-NOTE: Create a trading row for a single good
    // Slider position represents PRICE (asymptotic), not supply
    createGoodTradingRow(port, goodId) {
        const row = document.createElement('div');
        row.className = 'good-trading-row';
        
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
        // Note: We don't show consumption indicator (-) for general citizen consumption
        // Only if buildings use it as input (not yet implemented)
        
        // Calculate current supply status
        const status = Economy.calculateSupplyStatus(port, goodId);
        const equilibrium = status.equilibriumStock > 0 ? status.equilibriumStock : 200;
        
        // Get current price multiplier
        const currentMultiplier = Economy.getPriceMultiplierFromStock(portQty, equilibrium);
        
        // Price bounds (asymptotic)
        const minMultiplier = 0.25;  // 25% of base (surplus floor)
        const maxMultiplier = 4.0;   // 400% of base (shortage ceiling)
        
        // AIDEV-NOTE: No pre-clamping of slider range - let user drag freely
        // Constraints will be applied dynamically in updateTrade() based on current state
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
        // The thumb is 16px wide, and the visual percentage needs adjustment.
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
        
        // Good info and slider in one compact row
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
        
        // AIDEV-NOTE: Shared update function for slider and buttons
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
            for (const otherGoodId in this.currentTransactions) {
                if (otherGoodId !== goodId) {
                    const otherAmount = this.currentTransactions[otherGoodId] || 0;
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
            this.currentTransactions[goodId] = tradeAmount;
            this.updateTransactionSummary(port);
        };
        
        slider.oninput = () => updateTrade();
        
        // AIDEV-NOTE: +1/-1 button handlers
        plusBtn.onclick = () => {
            const currentAmount = this.currentTransactions[goodId] || 0;
            updateTrade(currentAmount + 1);
        };
        
        minusBtn.onclick = () => {
            const currentAmount = this.currentTransactions[goodId] || 0;
            updateTrade(currentAmount - 1);
        };
        
        // Initialize button states
        updateTrade();
        
        return row;
    },
    
    // AIDEV-NOTE: Update transaction summary display
    updateTransactionSummary(port, summaryElement = null) {
        const summary = summaryElement || document.getElementById('transaction-summary');
        if (!summary) return;
        
        let totalGoldSpent = 0;
        let totalCargoChange = 0;
        
        for (const goodId in this.currentTransactions) {
            const amount = this.currentTransactions[goodId];
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
        const goldShortfall = hasEnoughGold ? 0 : Math.ceil(totalGoldSpent - Game.player.gold);
        const spaceShortfall = hasEnoughSpace ? 0 : newCargo - Game.playerBoat.cargoCapacity;
        
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
    },
    
    // AIDEV-NOTE: Execute the trade transaction
    executeTradeTransaction(port) {
        // Check if there are any transactions
        const hasTransactions = Object.values(this.currentTransactions).some(v => v !== 0);
        if (!hasTransactions) {
            // No transactions selected, just return to main port screen
            this.showPortScreen(port);
            return;
        }
        
        // DEBUG: Capture state before trade
        console.log('=== TRADE EXECUTION DEBUG ===');
        console.log('Port:', port.name);
        console.log('Player Gold Before:', Game.player.gold);
        console.log('Cargo Before:', Economy.getCargoUsed(Game.playerBoat), '/', Game.playerBoat.cargoCapacity);
        
        // Deep copy cargo before trade
        const cargoBefore = {};
        for (const goodId in Game.playerBoat.cargo) {
            const cargoItem = Game.playerBoat.cargo[goodId];
            cargoBefore[goodId] = typeof cargoItem === 'number' ? cargoItem : cargoItem.quantity;
        }
        
        console.log('UI Requested Transactions:');
        for (const goodId in this.currentTransactions) {
            const amount = this.currentTransactions[goodId];
            if (amount !== 0) {
                console.log(`  ${goodId}: ${amount > 0 ? '+' : ''}${amount} (${amount > 0 ? 'BUY' : 'SELL'})`);
            }
        }
        
        // Execute trade through economy system
        const result = Economy.executeTrade(port, Game.playerBoat, this.currentTransactions, Game.player.gold);
        
        if (!result.success) {
            console.log('Trade FAILED:', result.error);
            console.log('=== END TRADE DEBUG ===');
            // Show error modal on top of trading screen
            this.showErrorModal('Trade Failed', result.error);
            return;
        }
        
        // DEBUG: Capture state after trade
        console.log('Trade Result:', result);
        console.log('Player Gold After:', Game.player.gold - result.goldChange);
        console.log('Cargo After:', Economy.getCargoUsed(Game.playerBoat), '/', Game.playerBoat.cargoCapacity);
        
        console.log('Actual Cargo Changes:');
        const cargoAfter = {};
        for (const goodId in Game.playerBoat.cargo) {
            const cargoItem = Game.playerBoat.cargo[goodId];
            cargoAfter[goodId] = typeof cargoItem === 'number' ? cargoItem : cargoItem.quantity;
        }
        
        // Show changes
        const allGoods = new Set([...Object.keys(cargoBefore), ...Object.keys(cargoAfter)]);
        for (const goodId of allGoods) {
            const before = cargoBefore[goodId] || 0;
            const after = cargoAfter[goodId] || 0;
            const change = after - before;
            if (change !== 0) {
                const expected = this.currentTransactions[goodId] || 0;
                const match = change === expected ? '✓' : '❌ MISMATCH';
                console.log(`  ${goodId}: ${before} → ${after} (${change > 0 ? '+' : ''}${change}) Expected: ${expected} ${match}`);
            }
        }
        console.log('=== END TRADE DEBUG ===');
        
        // Play money click sound on successful transaction
        Audio.play('money_click');
        
        // Update player gold (ensure it stays an integer)
        Game.player.gold = Math.round(Game.player.gold - result.goldChange);
        
        // Clear transactions
        this.currentTransactions = {};
        
        // Return to main port screen after successful trade
        this.showPortScreen(port);
    },

    // AIDEV-NOTE: Show shipyard sub-screen
    showShipyardScreen(port) {
        this.showSubScreen(port, 'Shipyard', 'location_shipyard', 
            'Shipyard interface will be implemented here.');
    },

    // AIDEV-NOTE: Show tavern sub-screen
    showTavernScreen(port) {
        this.showSubScreen(port, 'Tavern', 'location_tavern', 
            'Tavern interface will be implemented here.');
    },

    // AIDEV-NOTE: Show town encounters sub-screen
    showTownEncountersScreen(port) {
        this.showSubScreen(port, 'Town Square', 'location_town_square', 
            'Town encounters will be implemented here.');
    },

    // AIDEV-NOTE: Show production sub-screen
    // Displays all production buildings and their output/consumption
    showProductionScreen(port) {
        this.clear();
        this.currentScreen = 'production';

        // Buildings list
        const buildingsContainer = document.createElement('div');
        buildingsContainer.className = 'buildings-list';

        if (!port.buildings || port.buildings.length === 0) {
            const noBuildings = document.createElement('p');
            noBuildings.textContent = 'No production buildings in this port.';
            noBuildings.style.textAlign = 'center';
            noBuildings.style.color = '#8B4513';
            buildingsContainer.appendChild(noBuildings);
        } else {
            // Sort buildings by good tier (lower tier first)
            const sortedBuildings = [...port.buildings].sort((a, b) => {
                const tierA = GoodsData[a.goodId]?.tier || 0;
                const tierB = GoodsData[b.goodId]?.tier || 0;
                return tierA - tierB;
            });

            for (const building of sortedBuildings) {
                const goodId = building.goodId;
                const goodData = GoodsData[goodId];
                
                if (!goodData) {
                    console.warn(`Missing good data for ${goodId}`);
                    continue;
                }

                const buildingRow = document.createElement('div');
                buildingRow.className = 'building-row';

                // Building name with icon
                const buildingInfo = document.createElement('div');
                buildingInfo.className = 'building-info';
                
                // Good image next to building name
                const goodImage = document.createElement('img');
                const goodImageName = goodId.toLowerCase().replace(/ /g, '_');
                goodImage.src = `assets/goods/${goodImageName}.png`;
                goodImage.alt = goodId;
                goodImage.className = 'good-icon';
                goodImage.onerror = () => {
                    // Hide image if it fails to load
                    goodImage.style.display = 'none';
                };
                buildingInfo.appendChild(goodImage);
                
                const buildingName = document.createElement('div');
                buildingName.className = 'building-name';
                buildingName.textContent = goodData.building;
                buildingInfo.appendChild(buildingName);
                
                buildingRow.appendChild(buildingInfo);

                // Production info
                const productionInfo = document.createElement('div');
                productionInfo.className = 'production-info';
                
                const producesLabel = document.createElement('div');
                producesLabel.className = 'production-label';
                producesLabel.textContent = 'Produces:';
                productionInfo.appendChild(producesLabel);
                
                const producesValue = document.createElement('div');
                producesValue.className = 'production-value produces';
                producesValue.textContent = `${goodId} (${building.productionRate}/week)`;
                productionInfo.appendChild(producesValue);
                
                buildingRow.appendChild(productionInfo);

                // Consumption info (what the building needs to produce)
                const consumptionInfo = document.createElement('div');
                consumptionInfo.className = 'consumption-info';
                
                // Check if this building consumes any input materials
                if (goodData.consumes && goodData.consumes.length > 0) {
                    const consumesLabel = document.createElement('div');
                    consumesLabel.className = 'production-label';
                    consumesLabel.textContent = 'Consumes:';
                    consumptionInfo.appendChild(consumesLabel);
                    
                    const consumesValue = document.createElement('div');
                    consumesValue.className = 'production-value consumes';
                    // Show all input materials
                    const inputList = goodData.consumes.join(', ');
                    consumesValue.textContent = `${inputList} (${building.productionRate}/week)`;
                    consumptionInfo.appendChild(consumesValue);
                }
                
                buildingRow.appendChild(consumptionInfo);

                buildingsContainer.appendChild(buildingRow);
            }
        }

        // Create screen using ScreenLayout component
        const screen = ScreenLayout.createProductionScreen({
            portName: port.name,
            content: buildingsContainer,
            onBack: () => this.showPortScreen(port)
        });

        // Set location-specific background image
        const bgImage = Renderer.locationBackgrounds?.['location_construction'];
        if (bgImage) {
            screen.style.backgroundImage = `url('${bgImage.src}')`;
        } else {
            screen.style.backgroundColor = '#34495e';
            console.warn('Location background not found: location_construction');
        }

        // Create modal wrapper
        const modal = Modal.createPortWindow({
            content: screen,
            onClose: () => this.showPortScreen(port)
        });

        this.overlay.appendChild(modal);
    },

    // AIDEV-NOTE: Generic sub-screen display
    // Shows location-specific background with placeholder content
    showSubScreen(port, locationName, locationImageKey, placeholderText) {
        this.clear();
        this.currentScreen = 'port_sub';

        // Create port modal container
        const modal = document.createElement('div');
        modal.className = 'port-modal';

        // Create sub-screen container
        const container = document.createElement('div');
        container.className = 'sub-screen-container';
        
        // Set location-specific background image
        const bgImage = Renderer.locationBackgrounds?.[locationImageKey];
        if (bgImage) {
            container.style.backgroundImage = `url('${bgImage.src}')`;
        } else {
            // Fallback color if image not loaded
            container.style.backgroundColor = '#34495e';
            console.warn('Location background not found:', locationImageKey);
        }

        // Create header
        const header = document.createElement('div');
        header.className = 'sub-screen-header';
        
        const title = document.createElement('h1');
        title.className = 'sub-screen-title';
        title.textContent = locationName;
        header.appendChild(title);
        
        const subtitle = document.createElement('p');
        subtitle.className = 'sub-screen-subtitle';
        subtitle.textContent = `${port.name} - ${port.faction}`;
        header.appendChild(subtitle);
        
        container.appendChild(header);

        // Create content area
        const content = document.createElement('div');
        content.className = 'sub-screen-content';
        
        const placeholder = document.createElement('div');
        placeholder.className = 'sub-screen-placeholder';
        placeholder.textContent = placeholderText;
        content.appendChild(placeholder);
        
        container.appendChild(content);

        // Create footer with back button
        const footer = document.createElement('div');
        footer.className = 'sub-screen-footer';
        
        const backBtn = document.createElement('button');
        backBtn.className = 'back-button';
        backBtn.textContent = '← Back to Port';
        backBtn.onclick = () => this.showPortScreen(port);
        footer.appendChild(backBtn);
        
        container.appendChild(footer);

        modal.appendChild(container);
        this.overlay.appendChild(modal);
    },

    // AIDEV-NOTE: Show captain selection screen for new game
    // Renamed from faction select - choosing captain determines faction
    showFactionSelect() {
        this.clear();
        this.currentScreen = 'captain_select';

        const container = document.createElement('div');
        container.className = 'menu-container captain-select-container';

        // Title
        const title = document.createElement('h1');
        title.textContent = 'Choose Your Captain';
        title.style.color = '#f0e6d2';
        title.style.marginBottom = '30px';
        title.style.fontSize = '32px';
        container.appendChild(title);

        // Captain grid
        const grid = document.createElement('div');
        grid.className = 'captain-grid';

        // Get all captains
        const captains = getAllCaptains();

        captains.forEach(captain => {
            const captainCard = document.createElement('button');
            captainCard.className = 'captain-card';
            
            // Captain portrait image
            const portrait = document.createElement('img');
            portrait.src = captain.image;
            portrait.alt = captain.name;
            portrait.className = 'captain-portrait';
            captainCard.appendChild(portrait);

            // Captain name overlay
            const nameOverlay = document.createElement('div');
            nameOverlay.className = 'captain-name-overlay';
            nameOverlay.textContent = captain.name;
            captainCard.appendChild(nameOverlay);

            captainCard.onclick = () => this.showFactionDetails(captain.faction);
            grid.appendChild(captainCard);
        });

        container.appendChild(grid);

        // Back button
        const backBtn = document.createElement('button');
        backBtn.className = 'menu-button';
        backBtn.textContent = '← Back';
        backBtn.onclick = () => Game.showMainMenu();
        backBtn.style.marginTop = '30px';
        container.appendChild(backBtn);

        this.overlay.appendChild(container);
    },

    // AIDEV-NOTE: Show faction details screen with captain portrait and dice
    showFactionDetails(factionName) {
        this.clear();
        this.currentScreen = 'faction_details';

        const container = document.createElement('div');
        container.className = 'menu-container faction-details-container';

        // Get captain for this faction
        const captain = getCaptainByFaction(factionName);
        if (!captain) {
            console.error('Captain not found for faction:', factionName);
            this.showFactionSelect();
            return;
        }

        // Get faction ship
        const ship = ShipData.find(s => s.faction === factionName);
        if (!ship) {
            console.error('Ship not found for faction:', factionName);
            this.showFactionSelect();
            return;
        }

        // Main layout: side-by-side
        const mainLayout = document.createElement('div');
        mainLayout.className = 'faction-details-layout';
        mainLayout.style.display = 'flex';
        mainLayout.style.gap = '40px';
        mainLayout.style.maxWidth = '1200px';
        mainLayout.style.margin = '0 auto';

        // LEFT SIDE: Captain Portrait and Info
        const leftSide = document.createElement('div');
        leftSide.className = 'captain-details-side';
        leftSide.style.flex = '1';
        leftSide.style.display = 'flex';
        leftSide.style.flexDirection = 'column';
        leftSide.style.alignItems = 'center';

        // Captain portrait (large)
        const portraitContainer = document.createElement('div');
        portraitContainer.className = 'captain-portrait-large';
        portraitContainer.style.width = '300px';
        portraitContainer.style.height = '300px';
        portraitContainer.style.marginBottom = '20px';
        portraitContainer.style.borderRadius = '8px';
        portraitContainer.style.overflow = 'hidden';
        portraitContainer.style.border = '3px solid #f0e6d2';

        const portrait = document.createElement('img');
        portrait.src = captain.image;
        portrait.alt = captain.name;
        portrait.style.width = '100%';
        portrait.style.height = '100%';
        portrait.style.objectFit = 'cover';
        portraitContainer.appendChild(portrait);
        leftSide.appendChild(portraitContainer);

        // Captain name and faction
        const captainName = document.createElement('h1');
        captainName.textContent = captain.name;
        captainName.style.color = '#f0e6d2';
        captainName.style.marginBottom = '5px';
        captainName.style.fontSize = '36px';
        leftSide.appendChild(captainName);

        const factionLabel = document.createElement('h2');
        factionLabel.textContent = captain.faction;
        factionLabel.style.color = '#ccc';
        factionLabel.style.marginBottom = '15px';
        factionLabel.style.fontSize = '24px';
        factionLabel.style.fontWeight = 'normal';
        leftSide.appendChild(factionLabel);

        // Captain description
        const description = document.createElement('p');
        description.textContent = captain.description;
        description.style.color = '#ccc';
        description.style.fontSize = '16px';
        description.style.fontStyle = 'italic';
        description.style.textAlign = 'center';
        description.style.maxWidth = '350px';
        description.style.marginBottom = '20px';
        leftSide.appendChild(description);

        mainLayout.appendChild(leftSide);

        // RIGHT SIDE: Dice and Ship Info
        const rightSide = document.createElement('div');
        rightSide.className = 'stats-details-side';
        rightSide.style.flex = '1';
        rightSide.style.display = 'flex';
        rightSide.style.flexDirection = 'column';
        rightSide.style.gap = '20px';

        // Dice section
        const diceSection = document.createElement('div');
        diceSection.className = 'dice-section';
        diceSection.style.padding = '20px';
        diceSection.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        diceSection.style.borderRadius = '8px';

        const diceTitle = document.createElement('h3');
        diceTitle.textContent = 'Captain Dice';
        diceTitle.style.color = '#f0e6d2';
        diceTitle.style.marginBottom = '15px';
        diceTitle.style.fontSize = '24px';
        diceSection.appendChild(diceTitle);

        // Personal die
        const personalDie = document.createElement('div');
        personalDie.style.marginBottom = '15px';
        personalDie.innerHTML = `
            <p style="color: #f0e6d2; margin-bottom: 5px;"><strong>Personal Die:</strong></p>
            <p style="color: #ccc; margin-left: 20px;">${captain.personalDie.faces}</p>
        `;
        diceSection.appendChild(personalDie);

        // Equipment die
        const equipmentDie = document.createElement('div');
        equipmentDie.innerHTML = `
            <p style="color: #f0e6d2; margin-bottom: 5px;"><strong>Equipment: ${captain.equipmentDie.equipment}</strong></p>
            <p style="color: #ccc; margin-left: 20px;">${captain.equipmentDie.faces}</p>
        `;
        diceSection.appendChild(equipmentDie);

        rightSide.appendChild(diceSection);

        // Ship section
        const shipSection = document.createElement('div');
        shipSection.className = 'ship-section';
        shipSection.style.padding = '20px';
        shipSection.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        shipSection.style.borderRadius = '8px';

        const shipTitle = document.createElement('h3');
        shipTitle.textContent = 'Starting Ship';
        shipTitle.style.color = '#f0e6d2';
        shipTitle.style.marginBottom = '15px';
        shipTitle.style.fontSize = '24px';
        shipSection.appendChild(shipTitle);

        let shipDiceInfo = 'None';
        if (ship.extraDice && ship.extraDice.length > 0) {
            shipDiceInfo = ship.extraDice.map(die => `<div style="margin-bottom: 10px;">
                <strong>${die.equipment}:</strong><br>
                <span style="margin-left: 20px;">${die.faces}</span>
            </div>`).join('');
        }

        const shipInfo = document.createElement('div');
        shipInfo.style.color = '#ccc';
        shipInfo.innerHTML = `
            <h4 style="color: #f0e6d2; margin-bottom: 15px; font-size: 20px;">${ship.name}</h4>
            <p style="margin-bottom: 8px;"><strong>Speed:</strong> ${ship.speed}</p>
            <p style="margin-bottom: 8px;"><strong>Cargo:</strong> ${ship.cargoCapacity} units</p>
            <p style="margin-bottom: 8px;"><strong>Cabins:</strong> ${ship.cabins}</p>
            <p style="margin-bottom: 8px;"><strong>Durability:</strong> ${ship.durability}</p>
            <p style="margin-bottom: 8px; margin-top: 15px;"><strong>Ship Dice:</strong></p>
            <div style="margin-left: 10px; font-size: 14px;">${shipDiceInfo}</div>
        `;
        shipSection.appendChild(shipInfo);

        rightSide.appendChild(shipSection);
        mainLayout.appendChild(rightSide);

        container.appendChild(mainLayout);

        // Buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '20px';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.marginTop = '30px';

        const backBtn = document.createElement('button');
        backBtn.className = 'menu-button';
        backBtn.textContent = '← Back';
        backBtn.onclick = () => this.showFactionSelect();
        buttonContainer.appendChild(backBtn);

        const startBtn = document.createElement('button');
        startBtn.className = 'menu-button';
        startBtn.textContent = 'Begin Voyage';
        startBtn.style.backgroundColor = '#2ecc71';
        startBtn.onclick = () => Game.startGameWithFaction(factionName);
        buttonContainer.appendChild(startBtn);

        container.appendChild(buttonContainer);
        this.overlay.appendChild(container);
    },

    // AIDEV-NOTE: Show cargo management window
    // Displays all cargo items with ability to discard them
    showCargoWindow() {
        // Create cargo items using ListContainer component
        const cargo = Game.playerBoat?.cargo || {};
        const cargoEntries = Object.entries(cargo);
        
        const cargoItems = cargoEntries.map(([itemName, cargoData]) => {
            // Handle both old format (number) and new format (object)
            const quantity = typeof cargoData === 'number' ? cargoData : cargoData.quantity;
            const avgPrice = typeof cargoData === 'object' ? cargoData.avgPrice : (GoodsData[itemName]?.basePrice || 0);
            
            return ListContainer.createCargoItemRow(
                itemName, 
                quantity, 
                avgPrice, 
                (itemName) => {
                    this.discardCargo(itemName);
                    this.closeCargoWindow();
                    this.showCargoWindow(); // Refresh window
                }
            );
        });
        
        // Create cargo list using ListContainer component
        const cargoList = ListContainer.createCargoList(cargoItems, 'Cargo hold is empty');
        
        // Create footer with close button
        const footer = document.createElement('div');
        const closeBtn = Modal.createCloseButton((e) => {
            e.stopPropagation();
            this.closeCargoWindow();
        }, 'Close', 'menu-button');
        closeBtn.style.width = '100%';
        footer.appendChild(closeBtn);
        
        // Create and show modal
        const modal = Modal.createCargoWindow({
            title: 'Ship Cargo',
            content: cargoList,
            footer: footer,
            onClose: () => this.closeCargoWindow(),
            id: 'cargo-modal'
        });
        
        // Prevent clicks on window from propagating
        const window = modal.querySelector('.cargo-window');
        if (window) {
            window.onclick = (e) => {
                e.stopPropagation();
            };
        }
        
        document.body.appendChild(modal);
    },
    
    // AIDEV-NOTE: Close cargo window
    closeCargoWindow() {
        Modal.hide('cargo-modal');
    },
    
    // AIDEV-NOTE: Discard cargo item
    discardCargo(itemName) {
        if (!Game.playerBoat || !Game.playerBoat.cargo) return;
        
        delete Game.playerBoat.cargo[itemName];
        console.log('Discarded cargo:', itemName);
    },
    
    // AIDEV-NOTE: Show reputation management window
    // Displays all faction reputations with status labels
    showReputationWindow() {
        // Create reputation items using ListContainer component
        const reputations = Game.player?.reputations || {};
        const repEntries = Object.entries(reputations).sort((a, b) => b[1] - a[1]); // Sort by reputation value
        
        const repItems = repEntries.map(([factionName, repValue]) => {
            const status = this.getReputationStatus(repValue);
            return ListContainer.createReputationItemRow(
                factionName, 
                repValue, 
                status.label, 
                status.color
            );
        });
        
        // Create reputation list using ListContainer component
        const repList = ListContainer.createReputationList(repItems, 'No faction relationships established');
        
        // Create footer with close button
        const footer = document.createElement('div');
        const closeBtn = Modal.createCloseButton((e) => {
            e.stopPropagation();
            this.closeReputationWindow();
        }, 'Close', 'menu-button');
        closeBtn.style.width = '100%';
        footer.appendChild(closeBtn);
        
        // Create and show modal
        const modal = Modal.createCargoWindow({
            title: 'Faction Reputations',
            content: repList,
            footer: footer,
            onClose: () => this.closeReputationWindow(),
            id: 'reputation-modal'
        });
        
        // Prevent clicks on window from propagating
        const window = modal.querySelector('.cargo-window');
        if (window) {
            window.onclick = (e) => {
                e.stopPropagation();
            };
        }
        
        document.body.appendChild(modal);
    },
    
    // AIDEV-NOTE: Close reputation window
    closeReputationWindow() {
        Modal.hide('reputation-modal');
    },
    
    // AIDEV-NOTE: Get reputation status label and color
    getReputationStatus(repValue) {
        if (repValue >= 90) return { label: 'Exalted', color: '#FFD700' };
        if (repValue >= 75) return { label: 'Revered', color: '#4CAF50' };
        if (repValue >= 60) return { label: 'Honored', color: '#8BC34A' };
        if (repValue >= 45) return { label: 'Friendly', color: '#00BCD4' };
        if (repValue >= 30) return { label: 'Neutral', color: '#9E9E9E' };
        if (repValue >= 15) return { label: 'Unfriendly', color: '#FF9800' };
        if (repValue >= 5) return { label: 'Hostile', color: '#F44336' };
        return { label: 'Hated', color: '#C62828' };
    }
};

