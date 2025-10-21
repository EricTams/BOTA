// BOTA - Loading Screen Module
// Manages loading progress bar and changelog display

const LoadingScreen = {
    totalAssets: 0,
    loadedAssets: 0,
    fillElement: null,
    screenElement: null,
    changelogElement: null,

    // AIDEV-NOTE: Changelog entries for loading screen
    // Add new changes to the top of the list
    // IMPORTANT: Use the date from the user's local system timezone, not UTC or server time
    changelog: [
        {
            version: 'Current Session',
            date: 'October 20, 2025',
            changes: [
                { category: 'Added', text: 'Loading screen with progress bar showing asset loading' },
                { category: 'Added', text: 'Changelog window on loading screen for tracking changes' },
                { category: 'Added', text: 'Options screen with Changelog, Audio, and Controls tabs' },
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

