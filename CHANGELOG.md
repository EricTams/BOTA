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

## October 25, 2025

### Added
- Complete combat system with turn-based dice mechanics
- Combat UI with character panels showing HP, armor, and status effects
- Dice system redesign: separate Die class for state, DiceSystem for rendering
- Character Panel component for reusable unit display
- Crew units in combat (separate from captains)
- Ship weapon dice operated by crew units
- Crew data system with generic crew portraits
- Status effect system (buffs, debuffs, DoTs, HoTs)
- Status effect tooltips with hover detection
- Dice abilities: Slam (ship ram weapon)
- Combat manager for orchestrating combat flow
- Dice icons: Slam icon for ram attacks
- Combat UI module for managing combat rendering and interaction
- Dice test bootstrap for testing combat scenarios

### Improved
- Dice system now uses object-oriented design (Die class)
- Dice rendering separated from dice state
- Combat state management now explicit and testable
- Character panels show armor values when present
- Status effects display with duration and value indicators

### Changed
- Refactored dice system into separate Die.js and DiceSystem.js
- Moved combat UI rendering into dedicated ui_combat.js module
- Combat now supports both captain and crew units
- Dice ownership model: captains own personal/equipment dice, crew own ship weapon dice

### Removed
- Old dice.js module (replaced by die.js + dice_system.js)

### Technical
- Created CharacterPanel component for consistent UI rendering
- Added combat_manager.js for pure combat logic
- Added ui_combat.js for combat rendering and interaction
- Added crew_data.js for crew definitions
- Added dice_icons.js for custom ability icons
- Implemented status effect hover bounds tracking
- Separated combat state from rendering logic

---

## October 22, 2025

### Added
- Dice system with 3D rendering and animation
- Dice test screen for development and testing
- Axe's personal and equipment dice with unique abilities
- Dice ability system with culling_blade, counter_helix, berserkers_call, chop, jab, and dodge
- 3D perspective dice rendering with textured faces
- Dice rolling animation using axis-angle rotation
- Dice reroll functionality with drag-and-drop
- Debug tools menu on main menu (Dice Test and Economy Analyzer buttons)
- Right-click support for camera panning

### Improved
- Main menu now shows debug tools in top-right corner
- Context menu prevention on right-click

### Technical
- Added dice_data.js for dice definitions
- Added dice_abilities.js for ability metadata
- Added dice.js for dice rendering and animation system
- Implemented 3D cube rendering with proper perspective projection
- Implemented texture mapping for die faces
- Added proper Rodrigues' rotation formula for axis-angle rotation

---

## October 21, 2025

### Added
- +1/-1 buttons to trading sliders for precise one-unit adjustments
- Yellow zero-trade marker on sliders showing current price point
- Mouse wheel scrolling support for trading screen

### Improved
- Trading slider constraints now account for other pending trades
- Slider deadzone prevents accidental tiny trades near zero
- Price marker positioning for better visual accuracy

### Technical
- Trading system now calculates available cargo/gold after other pending trades
- Button states update dynamically based on trade constraints
- Added debug logging for trade execution verification

---

## October 20, 2025

### Added
- Options screen with Changelog, Audio, and Controls tabs
- Changelog window on loading screen for tracking changes
- Loading screen with progress bar showing asset loading

### Improved
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
