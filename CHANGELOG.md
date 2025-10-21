# BOTA Changelog

This changelog tracks all notable changes to the game. Changes shown on the loading screen are sourced from `src/loading.js`.

## How to Update the Changelog

Edit the `changelog` array in `src/loading.js`:

```javascript
changelog: [
    {
        version: 'Current Session',  // Version or session name
        date: 'October 21, 2025',    // Date of changes
        changes: [
            { category: 'Added', text: 'Description of what was added' },
            { category: 'Improved', text: 'Description of improvement' },
            { category: 'Fixed', text: 'Description of bug fix' },
            { category: 'Changed', text: 'Description of change' },
            { category: 'Removed', text: 'Description of what was removed' }
        ]
    }
]
```

### Categories
- **Added**: New features
- **Improved**: Enhancements to existing features
- **Fixed**: Bug fixes
- **Changed**: Changes in existing functionality
- **Removed**: Removed features
- **Technical**: Technical/internal changes

---

## Current Session - October 21, 2025

### Added
- Loading screen with progress bar showing asset loading
- Changelog window on loading screen for tracking changes
- Options screen with Changelog, Audio, and Controls tabs
- Port entry positions for better navigation to inland ports

### Improved
- Boat placement when leaving ports uses entry positions
- Port proximity detection uses entry positions instead of port centers
- Asset loading now properly loads all backgrounds with correct keys
- Options menu now shows proper tabbed interface instead of placeholder

### Technical
- Refactored asset loading to use sequential promise-based loading with progress tracking
- Added LoadingScreen module to manage loading state and changelog display

---

## Previous Work

### Game Systems
- Maritime trading simulation with real-time navigation
- Economy system with production, consumption, and dynamic pricing
- Nine factions with unique captains and starting ships
- Pathfinding system with waypoint navigation around islands
- Time advancement based on distance traveled
- Port trading system with supply/demand mechanics
- Reputation system with all factions
- Music and ambient sound system

### Technical Features
- HTML5 Canvas rendering (2D context)
- Collision detection system for islands
- Smooth camera following with auto-follow
- Asset management for ships, captains, goods, and ports
- Modular code architecture separating concerns
