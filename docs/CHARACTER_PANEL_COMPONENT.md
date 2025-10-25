# Character Panel Component

## Overview
Created a reusable UI component for rendering character panels in combat. This component handles all character display logic including portraits, HP bars, armor, status effects, and provides hit testing for interactive elements.

## Component Location
`src/components/character_panel.js`

## Features

### Visual Elements
- **Portrait Display**: Shows captain portrait with faction-colored border
- **HP Bar**: Gradient-filled health bar with current/max HP display
- **Armor Display**: Shows shield icon and armor value when unit has armor
- **Status Effects**: Icon badges showing active buffs/debuffs with duration and value
- **Responsive Layout**: All elements positioned relative to portrait

### Interaction Support
- **Status Effect Hover Detection**: `checkStatusEffectHover()` method for tooltip support
- **Button Positioning**: Returns calculated button bounds for external drawing
- **Bounds Storage**: Stores hitbox bounds on status effect objects for hover detection

## Usage

### Basic Drawing
```javascript
const buttonBounds = CharacterPanel.draw(ctx, unit, x, y, isPlayer, portraits);
// Returns: { buttonX, buttonY, buttonWidth, buttonHeight }
```

### Parameters
- `ctx`: Canvas 2D context
- `unit`: Character data object with `{ id, name, hp, maxHp, armor, statusEffects, portrait }`
- `x, y`: Top-left position for the panel
- `isPlayer`: Boolean for color theming (blue for player, orange for enemy)
- `portraits`: Object mapping unit IDs to loaded Image objects

### Status Effect Hover Detection
```javascript
const hoveredEffect = CharacterPanel.checkStatusEffectHover(statusEffects, mousePos);
if (hoveredEffect) {
    // Show tooltip for hoveredEffect
}
```

## Integration

### Combat UI Integration
The component is now used in `src/ui_combat.js`:
- `renderUnitInfo()` uses `CharacterPanel.draw()` for all unit display
- `checkStatusEffectHover()` delegates to `CharacterPanel.checkStatusEffectHover()`
- Removed duplicate drawing code from CombatUI

### Benefits
- **Separation of Concerns**: UI rendering isolated from combat logic
- **Reusability**: Can be used anywhere character panels are needed
- **Maintainability**: Single source of truth for character display
- **Consistency**: All character panels look and behave identically

## Status Effect Display
Status effects are shown as icon badges with:
- **Border Color**: 
  - Debuffs (poison, bleed): Deep purple-red (#8B1A55)
  - Buffs/HoT (regen): Lime green (#32CD32)
- **Value**: Large centered number showing effect strength
- **Duration**: Small yellow number in bottom-right corner
- **Hover**: Bounds stored for tooltip interaction

## Future Enhancements
- Add ability icon rendering within status effect badges
- Support different panel sizes/layouts
- Add animation states for damage/healing feedback
- Support custom theming beyond player/enemy colors

