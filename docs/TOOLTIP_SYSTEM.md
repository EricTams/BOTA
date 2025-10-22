# Tooltip System for Dice

## Overview
The tooltip system displays detailed information about dice abilities when hovering over dice faces, including dynamic calculations based on power-up slots.

## Features

### 1. Dynamic Formula Display
Abilities use a formula template with variables:
- `{base}` - Base value (e.g., 10 damage)
- `{perSlot}` - Value per filled slot (e.g., 8 damage per slot)
- `{X}` - Number of filled power-up slots
- `{result}` - Calculated total value

Example: "Deal {base} + {perSlot}*{X} damage" → "Deal 10 + 8*2 damage"

### 2. Power-Up Slots Visualization
Tooltips show:
- Empty slots (outlined squares in ability color)
- Filled slots (solid colored squares)
- Current X value (count of filled slots)
- Final calculated result

### 3. Hover Detection
Tooltips appear when hovering over:
- Camera-facing die face in the rolling box (currently implemented)
- Unwrapped die faces (TODO: future enhancement)

## Ability Data Structure

```javascript
culling_blade: {
    icon: "culling_blade",
    displayName: "Culling Blade",
    description: "Deal {base} + {perSlot}*{X} damage",
    baseDamage: 15,
    damagePerSlot: 10,
    color: "Red",
    targeting: "enemy",
    powerUpSlots: 2,
    powerUpColors: ["Red", "Red"]
}
```

## Supported Value Types
- **Damage**: `baseDamage`, `damagePerSlot`
- **Healing**: `baseHeal`, `healPerSlot`
- **Armor**: `baseArmor`, `armorPerSlot`
- **Evasion**: `baseEvasion`, `evasionPerSlot`

## Helper Functions

### `getAbilityData(iconName)`
Retrieves ability metadata for a given icon name.

### `calculateAbilityValue(ability, filledSlots)`
Returns:
```javascript
{
    base: 15,
    perSlot: 10,
    filledSlots: 2,
    result: 35,
    valueType: 'damage',
    formula: "15 + 10*2",
    hasSlots: true
}
```

### `formatAbilityDescription(ability, filledSlots)`
Returns formatted description with variables replaced:
```javascript
{
    description: "Deal 15 + 10*2 damage",
    calculation: { /* see above */ }
}
```

## Tooltip Rendering

Tooltips display:
1. **Title** (golden): Ability name
2. **Description** (white): Formula with current values
3. **Result** (light green): Final calculation and value type
4. **Power-up Slots** (if applicable): Visual representation with color-coded squares

## Interactive Updates
When a player adds dice to power-up slots:
1. `tooltip.filledSlots` array is updated
2. Tooltip automatically recalculates using `calculateAbilityValue()`
3. Display updates to show new X value and result

## Example Tooltip Display

```
┌─────────────────────────────────┐
│ Culling Blade                   │
│                                 │
│ Deal 15 + 10*2 damage          │
│ 15 + 10*2 = 35 damage          │
│                                 │
│ Power-up slots (X = 2):        │
│ [■] [■]                        │
└─────────────────────────────────┘
```

## Future Enhancements
- Click on power-up slots to toggle filled state (for testing)
- Hover tooltips for unwrapped die faces
- Show targeting indicator in tooltip
- Color-code value types (damage = red, healing = green, etc.)
- Animation when slot values change

