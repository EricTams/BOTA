// BOTA - Loading Screen Module
// Manages loading progress bar and changelog display

const LoadingScreen = {
    totalAssets: 0,
    loadedAssets: 0,
    fillElement: null,
    screenElement: null,
    changelogElement: null,

    // AIDEV-NOTE: Changelog entries for loading screen
    // Add new changes to the top of the list (most recent first)
    // IMPORTANT: Use the date from the user's local system timezone, not UTC or server time
    changelog: [
        {
            version: 'November 8, 2025',
            date: 'November 8, 2025',
            changes: [
                { category: 'Added', text: 'Combat effects system for visual feedback (damage, heal, dodge, telekinesis)' },
                { category: 'Added', text: 'Particle system with multiple particle types (dust, slice, sparkle, streak, star, chain)' },
                { category: 'Added', text: 'Status effects system for defensive and reactive abilities' },
                { category: 'Added', text: 'Combat sound effects (heal, powerup, slice, thud, twinkle)' },
                { category: 'Added', text: 'Floating damage/heal text with fade-out animation' },
                { category: 'Added', text: 'Visual particle effects for different ability types' },
                { category: 'Added', text: 'Evasion system with dodge chance calculation' },
                { category: 'Added', text: 'Retribution system for counter-attacks (counter helix)' },
                { category: 'Improved', text: 'Combat now has rich visual and audio feedback' },
                { category: 'Improved', text: 'Status effects properly trigger defensive abilities on damage' },
                { category: 'Improved', text: 'Options menu changelog now supports mouse wheel scrolling' },
                { category: 'Fixed', text: 'Scrollbar now visible in options menu changelog when content overflows' },
                { category: 'Technical', text: 'Created combat_effects.js for effect orchestration' },
                { category: 'Technical', text: 'Created particles.js for particle rendering and physics' },
                { category: 'Technical', text: 'Created status_effects.js for ability trigger logic' }
            ]
        },
        {
            version: 'October 31, 2025',
            date: 'October 31, 2025',
            changes: [
                { category: 'Added', text: 'Game State Manager for centralized state management' },
                { category: 'Added', text: 'Event System for event-driven architecture' },
                { category: 'Added', text: 'Camera Controller separated from game logic' },
                { category: 'Added', text: 'Game Loop Manager for independent frame timing' },
                { category: 'Added', text: 'Asset Manager for centralized asset loading' },
                { category: 'Added', text: 'Render Pipeline for modular rendering system' },
                { category: 'Added', text: 'Render Layers for organized rendering stages' },
                { category: 'Added', text: 'Debug Renderer separated from game rendering' },
                { category: 'Added', text: 'Pricing Engine for centralized price calculations' },
                { category: 'Added', text: 'Trade Validator for pure trade validation logic' },
                { category: 'Added', text: 'Transaction Manager for trade execution' },
                { category: 'Added', text: 'Goods Data Service for goods definitions' },
                { category: 'Added', text: 'Port Simulation extracted from economy logic' },
                { category: 'Technical', text: 'Major architectural refactoring: separated concerns into modular systems' },
                { category: 'Technical', text: 'Improved code organization and maintainability' },
                { category: 'Technical', text: 'Enhanced testability through pure function extraction' }
            ]
        },
        {
            version: 'October 25, 2025',
            date: 'October 25, 2025',
            changes: [
                { category: 'Added', text: 'Complete combat system with turn-based dice mechanics' },
                { category: 'Added', text: 'Combat UI with character panels showing HP, armor, and status effects' },
                { category: 'Added', text: 'Character Panel component for reusable unit display' },
                { category: 'Added', text: 'Crew units in combat (separate from captains)' },
                { category: 'Added', text: 'Ship weapon dice operated by crew units' },
                { category: 'Added', text: 'Status effect system (buffs, debuffs, DoTs, HoTs)' },
                { category: 'Added', text: 'Status effect tooltips with hover detection' },
                { category: 'Added', text: 'Slam ability for ship ram weapons' },
                { category: 'Improved', text: 'Dice system redesigned with object-oriented architecture' },
                { category: 'Changed', text: 'Combat now supports both captain and crew units' },
                { category: 'Technical', text: 'Refactored dice into Die.js (state) and DiceSystem.js (rendering)' },
                { category: 'Technical', text: 'Created CharacterPanel component for consistent UI rendering' }
            ]
        },
        {
            version: 'October 22, 2025',
            date: 'October 22, 2025',
            changes: [
                { category: 'Added', text: 'Dice system with 3D rendering and animation' },
                { category: 'Added', text: 'Dice test screen for development and testing' },
                { category: 'Added', text: "Axe's personal and equipment dice with unique abilities" },
                { category: 'Added', text: 'Dice rolling animation using axis-angle rotation' },
                { category: 'Added', text: 'Debug tools menu on main menu screen' },
                { category: 'Added', text: 'Right-click support for camera panning' },
                { category: 'Technical', text: 'Implemented 3D cube rendering with perspective projection' },
                { category: 'Technical', text: 'Implemented texture mapping for die faces' }
            ]
        },
        {
            version: 'October 21, 2025',
            date: 'October 21, 2025',
            changes: [
                { category: 'Added', text: '+1/-1 buttons to trading sliders for precise one-unit adjustments' },
                { category: 'Added', text: 'Yellow zero-trade marker on sliders showing current price point' },
                { category: 'Added', text: 'Mouse wheel scrolling support for trading screen' },
                { category: 'Improved', text: 'Trading slider constraints now account for other pending trades' },
                { category: 'Improved', text: 'Slider deadzone prevents accidental tiny trades near zero' },
                { category: 'Improved', text: 'Price marker positioning for better visual accuracy' }
            ]
        },
        {
            version: 'October 20, 2025',
            date: 'October 20, 2025',
            changes: [
                { category: 'Added', text: 'Options screen with Changelog, Audio, and Controls tabs' },
                { category: 'Added', text: 'Changelog window on loading screen for tracking changes' },
                { category: 'Added', text: 'Loading screen with progress bar showing asset loading' },
                { category: 'Improved', text: 'Port entry positions for better navigation to inland ports' },
                { category: 'Improved', text: 'Boat placement when leaving ports uses entry positions' },
                { category: 'Improved', text: 'Port proximity detection uses entry positions instead of port centers' },
                { category: 'Fixed', text: 'Asset loading now properly loads all backgrounds with correct keys' }
            ]
        }
    ],

    init() {
        this.fillElement = document.getElementById('loading-bar-fill');
        this.screenElement = document.getElementById('loading-screen');
        this.changelogElement = document.getElementById('loading-changelog-content');
        
        if (!this.fillElement || !this.screenElement) {
            console.error('Loading screen elements not found!');
            return;
        }
        
        // Populate changelog
        this.populateChangelog();
        
        // Show loading screen
        this.screenElement.style.display = 'flex';
    },

    // Populate changelog content
    populateChangelog() {
        if (!this.changelogElement) return;
        
        let html = '';
        
        for (const section of this.changelog) {
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
        
        this.changelogElement.innerHTML = html;
    },

    // Set total number of assets to load
    setTotalAssets(count) {
        this.totalAssets = count;
        this.loadedAssets = 0;
        this.updateProgress();
    },

    // Increment loaded asset count
    assetLoaded() {
        this.loadedAssets++;
        this.updateProgress();
    },

    // Update progress bar
    updateProgress() {
        if (this.totalAssets === 0) return;
        
        const progress = (this.loadedAssets / this.totalAssets) * 100;
        if (this.fillElement) {
            this.fillElement.style.width = progress + '%';
        }
    },

    // Hide loading screen
    hide() {
        if (this.screenElement) {
            this.screenElement.style.display = 'none';
        }
    },

    // Helper function to load an image with progress tracking
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assetLoaded();
                resolve(img);
            };
            img.onerror = () => {
                console.error('Failed to load image:', src);
                this.assetLoaded(); // Count as loaded anyway to keep progress moving
                reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
        });
    },

    // Helper function to load audio with progress tracking
    loadAudio(src) {
        return new Promise((resolve, reject) => {
            const audio = document.createElement('audio');
            audio.preload = 'auto';
            audio.oncanplaythrough = () => {
                this.assetLoaded();
                resolve(audio);
            };
            audio.onerror = () => {
                console.error('Failed to load audio:', src);
                this.assetLoaded(); // Count as loaded anyway to keep progress moving
                reject(new Error(`Failed to load audio: ${src}`));
            };
            audio.src = src;
        });
    }
};

