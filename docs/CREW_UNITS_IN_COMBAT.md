# Crew Units in Combat

## Overview
Crew members now appear as separate combat units below captain panels. Each crew member represents the ship's crew operating the ship's weapons/equipment.

## Combat Structure
```
Player Side:
├─ Captain (top panel at 20, 20)
│   ├─ Personal Die
│   └─ Equipment Die
└─ Crew (bottom panel at 20, 180)
    └─ Ship Weapon Dice

Enemy Side:
├─ Captain (top panel at width-260, 20)
│   ├─ Personal Die
│   └─ Equipment Die
└─ Crew (bottom panel at width-260, 180)
    └─ Ship Weapon Dice
```

## Implementation

### Combat State (`src/combat.js`)
Added crew unit storage:
```javascript
state: {
    active: false,
    playerUnit: null,
    enemyUnit: null,
    playerCrew: null,  // NEW: Crew member manning ship weapons
    enemyCrew: null,   // NEW: Crew member manning ship weapons
    // ...
}
```

### Combat Initialization
Updated `Combat.init()` to accept optional crew data:
```javascript
Combat.init(playerCaptain, enemyCaptain, playerCrewData, enemyCrewData)
```

### Crew Unit Creation
New method `createCrewUnit()`:
- Creates a combat unit from crew data
- Uses generic crew portrait
- Holds ship equipment dice
- Has independent HP pool (50 HP by default)

### Visual Layout
Combat UI now renders:
1. **Captain Panels** - Top position (y: 20)
2. **Crew Panels** - Below captains (y: 180)

Both use the same CharacterPanel component for consistent display.

## Crew Data Structure
```javascript
{
    id: 'crew',
    name: 'Crew',
    health: 50,
    dice: ['oglodi_ram', 'other_ship_weapons']
}
```

## Portrait Loading
Generic crew portrait loaded from:
`assets/characters/crew/generic_crew_portrait.png`

## Dice Test Usage
In `dice_test_bootstrap.js`:
```javascript
// Create crew data with ship weapon dice
const playerCrewData = {
    id: 'crew',
    name: 'Crew',
    health: genericCrew.health,
    dice: ['oglodi_ram'] // Ship weapon dice operated by crew
};

// Initialize combat with crew
Combat.init(playerCaptain, enemyCaptain, playerCrewData, enemyCrewData);
```

## Benefits

### Separation of Roles
- **Captain**: Commands the battle with personal abilities
- **Crew**: Operates ship weapons/equipment

### Independent HP Pools
- Captain can be wounded without affecting crew
- Crew can be wounded without affecting captain
- Adds strategic depth (protect captain vs protect crew)

### Visual Clarity
- Players can see both units at a glance
- Clear distinction between personal and ship abilities
- Each unit shows its own HP, armor, status effects

### Future Extensibility
- Support multiple crew members per ship
- Different crew types (marines, engineers, etc.)
- Crew-specific abilities and bonuses
- Crew hiring and management system

## Status Effect Hover Detection
Updated to check crew status effects:
- Player captain status effects
- Player crew status effects
- Enemy captain status effects
- Enemy crew status effects

## Future Enhancements
- Crew portraits for specific crew types (marines, engineers, etc.)
- Crew abilities beyond ship weapons
- Crew leveling/experience system
- Multiple crew members per ship
- Crew morale and bonuses
- Crew hiring at ports

