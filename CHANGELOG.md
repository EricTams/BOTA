# BOTA Changelog

This changelog tracks all notable changes to the game. Changes shown on the loading screen are sourced from `src/loading.js`.

## How to Update the Changelog

Edit the `changelog` array in `src/loading.js`:

**IMPORTANT:** Use the date from your local system timezone (not UTC or server time).

```javascript
changelog: [
    {
        version: 'Current Session',  // Version or session name
        date: 'October 20, 2025',    // Date of changes (use local timezone)
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

## Current Session - October 20, 2025

### Added
- +1/-1 buttons to trading sliders for precise one-unit adjustments
- Yellow zero-trade marker on sliders showing current price point
- Mouse wheel scrolling support for trading screen
- Options screen with Changelog, Audio, and Controls tabs
- Changelog window on loading screen for tracking changes
- Loading screen with progress bar showing asset loading

### Improved
- Trading slider constraints now account for other pending trades
- Slider deadzone prevents accidental tiny trades near zero
- Price marker positioning for better visual accuracy
- Port entry positions for better navigation to inland ports
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
