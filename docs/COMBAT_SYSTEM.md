# Combat System

## Overview

Turn-based 1v1 combat system for captain duels, integrated into the dice test screen for testing. The system features HP tracking, armor mechanics, status effects (DoT/HoT), and ability execution from rolled dice.

## Combat Flow

### 1. Initialization
```javascript
Combat.init(playerCaptain, enemyCaptain);
Combat.startTurn();
```

- Creates combat units from captain data
- Sets player's turn first
- Initializes combat log

### 2. Turn Phases

**Roll Phase**
- Player rolls their dice (click "Roll Dice" button)
- Dice animate and land on random faces
- Player can see what abilities they rolled

**Execute Phase**
- Player clicks "Execute Ability" to use rolled ability
- Ability affects target based on `effectType`
- Combat log shows results

**End Turn**
- Player clicks "End Turn"
- Status effects tick (DoT, HoT)
- Turn switches to opponent

### 3. Combat End
- Combat ends when either unit reaches 0 HP
- Winner is announced in combat log

## Combat Units

```javascript
{
    id: string,
    name: string,
    side: 'player' | 'enemy',
    hp: number,
    maxHp: number,
    armor: number,              // Temporary damage absorption
    statusEffects: StatusEffect[],
    dice: string[]              // Array of die IDs
}
```

## Status Effects

### Effect Types

**Bleed** (DoT)
- Deals damage at start of each turn
- Does not stack
- Duration: typically 3 turns
- Color: Green

**Poison** (Stacking DoT)
- Deals damage based on stack count
- Each application adds stacks
- Duration: typically 4 turns
- Color: Green

**Regeneration** (HoT)
- Heals HP at start of each turn
- Does not stack (refreshes duration)
- Duration: typically 3 turns
- Color: Blue

### Status Effect Structure

```javascript
{
    type: 'bleed' | 'poison' | 'regen',
    value: number,          // Damage/heal per tick
    duration: number,       // Turns remaining
    stacks: number          // For poison only
}
```

### Status Effect Processing

Happens at **start of turn** before player action:
1. Apply damage/healing from each effect
2. Decrement duration by 1
3. Remove effects with duration <= 0
4. Log results to combat log

## Ability Execution

### Ability Effect Types

**instant/damage**
- Deals immediate damage to target
- Reduced by target's armor first

**heal**
- Restores HP to caster
- Cannot exceed maxHp

**shield**
- Grants temporary armor to caster
- Absorbs damage before HP

**dot** (Damage Over Time)
- Applies bleed or poison status effect
- If `stackable: true` → poison (stacks)
- If `stackable: false` → bleed (refreshes)

**hot** (Heal Over Time)
- Applies regeneration status effect
- Heals each turn

### Execution Flow

```javascript
Combat.executeAbility(ability, caster, target, filledSlots)
```

1. Calculate ability values using `calculateAbilityValue()`
2. Apply effect based on `effectType`
3. Log action and results
4. Check for combat end

### Example: Executing Chop

```javascript
// Ability data
{
    icon: "chop",
    baseDamage: 6,
    damagePerSlot: 3,
    effectType: "damage",
    targetingRestriction: "melee"
}

// Execution
Combat.executeAbility(chopAbility, playerUnit, enemyUnit, 0);
// Result: "Player Axe uses Chop!"
// Result: "Chop dealt 6 damage to Enemy Axe! (HP: 94/100)"
```

### Example: Executing Poison

```javascript
// Ability data
{
    icon: "poison",
    baseDamage: 2,
    effectType: "dot",
    duration: 4,
    stackable: true
}

// Execution
Combat.executeAbility(poisonAbility, playerUnit, enemyUnit, 0);
// Result: "Player Axe uses Poison!"
// Result: "Enemy Axe is afflicted with poison!"

// Next turn (Enemy's)
// Result: "Poison dealt 2 damage to Enemy Axe! (HP: 92/100)"
```

## Armor Mechanics

### Damage Absorption

Armor absorbs damage before HP:
```javascript
if (unit.armor > 0) {
    absorbed = Math.min(unit.armor, damageAmount);
    unit.armor -= absorbed;
    damageAmount -= absorbed;
}
unit.hp -= damageAmount; // Remaining damage
```

### Shield Abilities

Shield abilities grant armor:
```javascript
// Berserker's Call grants 10 armor
unit.armor += 10;
```

Armor persists until:
- Absorbed by damage
- Combat ends
- (No natural decay yet)

## Combat UI

### Left Panel (Combat Info)
- Turn number and current turn indicator
- Player unit info (HP bar, armor, status effects)
- Enemy unit info (HP bar, armor, status effects)
- Combat log (last 5 entries)

### Center Area (Dice Rolling)
- Unwrapped dice display (top)
- 3D rolling dice (center)
- Tooltips on hover

### Bottom Buttons
- **Execute Ability**: Use first rolled ability
- **End Turn**: Finish your turn, switch to opponent

## Testing

### Dice Test Mode

Combat is enabled in `dice_test` state:
```javascript
DiceSystem.testState.combatMode = true
```

Both captains are controlled by player for testing:
- Roll dice for current turn's captain
- Execute abilities
- End turn to switch sides
- Observe status effects ticking

### Testing Specific Abilities

1. **Damage abilities**: chop, jab, culling_blade
2. **Healing**: heal ability
3. **Shield**: dodge, berserkers_call, shield
4. **DoT**: bleed, poison
5. **HoT**: regenerate

## Current Limitations

### Not Yet Implemented
- Multi-target abilities (cleave, AoE)
- Buffs/debuffs (stat modifiers)
- Stun mechanics
- Ability selection (currently uses first rolled ability)
- Power-up slot filling
- Back row/front row positioning
- AI opponent behavior

### TODO
- Let player choose which rolled ability to execute
- Implement power-up slot filling UI
- Add ability targeting indicator
- Visual effects for damage/healing
- Floating damage numbers
- Death animations
- Victory/defeat screens

## Integration with Main Game

Currently integrated into `dice_test` screen for testing. Future integration:
- Combat encounters at sea
- Port defense/attack scenarios
- Story encounters with NPCs
- Arena/tournament mode

## API Reference

### Combat Module

**Combat.init(playerCaptain, enemyCaptain)**
- Initialize combat between two captains

**Combat.startTurn()**
- Begin a new turn, process status effects

**Combat.endTurn()**
- End current turn, switch to next player

**Combat.getCurrentUnit()**
- Get the unit whose turn it is

**Combat.getOpponentUnit()**
- Get the opposing unit

**Combat.applyDamage(unit, amount, source)**
- Apply damage to unit (accounts for armor)

**Combat.applyHealing(unit, amount, source)**
- Restore HP to unit

**Combat.addArmor(unit, amount, source)**
- Grant armor (shield) to unit

**Combat.applyStatusEffect(unit, type, value, duration, stacks)**
- Apply status effect to unit

**Combat.executeAbility(ability, caster, target, filledSlots)**
- Execute an ability from dice

**Combat.addLog(message)**
- Add entry to combat log

**Combat.reset()**
- Clear combat state

### DiceSystem Combat Methods

**DiceSystem.executeCombatAbility()**
- Execute first rolled ability in combat

**DiceSystem.renderCombatUI(ctx, canvas)**
- Render combat info panel and buttons

**DiceSystem.renderUnitInfo(ctx, unit, x, y, isPlayer)**
- Render unit HP, armor, status effects

**DiceSystem.renderCombatButtons(ctx, canvas)**
- Render Execute Ability and End Turn buttons

## Example Combat Session

```
Turn 1 - Player
1. Roll dice → Counter Helix, Jab
2. Execute Ability → Counter Helix deals 8 damage
3. End Turn

Turn 1 - Enemy  
4. Start of turn → (no status effects yet)
5. Roll dice → Chop, Poison
6. Execute Ability → Poison applied (2 damage/turn for 4 turns)
7. End Turn

Turn 2 - Player
8. Start of turn → Poison deals 2 damage (HP: 98/100)
9. Roll dice → Berserker's Call, Dodge
10. Execute Ability → Berserker's Call grants 10 armor
11. End Turn

Turn 2 - Enemy
12. Start of turn → (no status effects)
13. Roll dice → Culling Blade, Chop
14. Execute Ability → Culling Blade deals 15 damage
    → 10 absorbed by armor, 5 damage to HP (HP: 87/100, Armor: 0)
15. End Turn

Turn 3 - Player
16. Start of turn → Poison deals 2 damage (HP: 85/100)
17. Roll dice → Heal, Regenerate
18. Execute Ability → Heal restores 10 HP (HP: 95/100)
19. End Turn

... combat continues until victory ...
```

