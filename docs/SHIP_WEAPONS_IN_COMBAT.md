# Ship Weapons in Combat

## Overview
Ship equipment dice (weapons) are now integrated into combat testing. These dice represent the ship's armaments that are manned and operated by the generic crew.

## Implementation

### Dice Test Bootstrap Changes
`src/dice_test_bootstrap.js` now:
1. Loads captain data via `getCaptainById()`
2. Loads starting ship data via `getShipById()`
3. Builds a complete dice pool combining:
   - Captain's personal die
   - Captain's equipment die
   - Ship's equipment dice (weapons manned by crew)

### Example: Axe + Oglodi Longboat
```javascript
// Captain dice
'axe_personal'      // Axe's innate abilities
'axe_equipment'     // Berserker's Call equipment

// Ship weapon (manned by crew)
'oglodi_ram'        // Ram weapon from Oglodi Longboat
```

## Ship Equipment Dice

### Oglodi Longboat Ram
Defined in `src/dice_data.js`:
```javascript
oglodi_ram: {
    id: "oglodi_ram",
    name: "Ram",
    owner: null,  // Ship equipment, not captain-specific
    faces: [
        { color: "Red", icon: "slam" },
        { color: "Red", icon: "slam" },
        { color: "Red", icon: "slam" },
        { color: "Red", icon: "slam" },
        { color: null, icon: null },  // Blank
        { color: null, icon: null }   // Blank
    ]
}
```

### Slam Ability
Defined in `src/dice_abilities.js`:
```javascript
slam: {
    icon: "slam",
    displayName: "Slam",
    description: "Deal {base} + {perSlot}*{X} damage",
    baseDamage: 9,
    damagePerSlot: 5,
    color: "Red",
    targeting: "enemy",
    effectType: "damage",
    powerUpSlots: 1,
    powerUpColors: ["Red"]
}
```

### Slam Icon
Added to `src/dice_icons.js`:
- Ship ram (pointed wedge) shape
- Impact lines showing collision force
- Reinforcement lines for detail
- Red color scheme matching other attack abilities

## Generic Crew Concept
Ship weapons are operated by **generic crew** members:
- Crew are not individual characters with their own dice
- Crew operate the ship's equipment (weapons, engines, etc.)
- The ship equipment dice represent the effectiveness of these weapons
- Blank faces represent crew error, reload time, or weapon failure

## Combat Dice Pool Structure
```
Captain:
├─ Personal Die (innate abilities)
├─ Equipment Die (signature item/weapon)
└─ Ship Weapons (operated by crew)
    ├─ Weapon 1 (e.g., Ram)
    ├─ Weapon 2 (e.g., Cannons)
    └─ Weapon 3 (e.g., Ballista)
```

## Faction Starter Ships
Each faction's starting ship provides different equipment dice:

### Combat-Focused Factions
- **Claddish Navy** (Patrol Cutter): Deck Cannons
- **Oglodi Raiders** (Longboat): Ram
- **Free Captains** (Rogue's Sloop): Swivel Guns
- **Slithereen Guard** (Tide Runner): Harpoon Launcher

### Magic-Focused Factions
- **Artifact Traders** (Mystic Skiff): Arcane Staff + Crystal Array
- **Revtel** (Coral Skiff): Coral Spikes

### Utility-Focused Factions
- **Stonehall Merchants** (Granite Trader): No weapons (cargo focus)
- **Roseleaf Traders** (Willowbark Trader): No weapons (crew focus)
- **Keen Folk Engineers** (Tinker's Barge): Steam Engine

## Testing
The dice test now shows:
- All 3 dice: captain personal + captain equipment + ship weapon
- Ram weapon can be rolled and used in combat
- Slam ability shows proper icon and calculations
- Power-up slots work with ship weapons just like captain abilities

## Future Enhancements
- Add all ship equipment dice to `dice_data.js`
- Create ability definitions for all ship weapons
- Design icons for each ship weapon type
- Support multiple crew members per ship (future crew hiring system)
- Add crew-specific bonuses to ship weapon effectiveness

