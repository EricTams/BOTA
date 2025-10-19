# Dice System

## Overview

Dual-purpose dice system for skill challenges and combat. Each die has colored faces (Red/Green/Blue) representing skills, and icons representing combat abilities.

## Dice Faces

### Face Components
Each die face is either:
1. **Colored face**: Has both a color AND an icon
2. **Blank face**: Has neither color nor icon (completely blank)

### Colors (Skill Challenges)
- **Red = Strength**: Physical challenges, intimidation, brute force
- **Green = Agility**: Dexterity, stealth, evasion, navigation
- **Blue = Magic**: Arcane challenges, persuasion, mysticism, knowledge
- **Blank**: No color, no icon, doesn't count for challenges or combat

**Important**: All colored faces have an icon. All blank faces have nothing.

### Icons (Combat)
- Represent specific combat abilities
- Used in combat encounters (system TBD)
- Can slot additional dice to enhance abilities
- Combat mechanics to be defined later

## Skill Challenges (Non-Combat)

### Challenge Structure
Challenges require specific colored faces:

**Example Challenges**:
- "Roll 3 Blue to recruit the mage" (persuasion)
- "Roll 2 Red and 1 Green to break down the door" (strength + agility)
- "Roll 4 Green to navigate the storm" (dexterity)
- "Roll 2 Blue to decipher ancient runes" (magic/knowledge)

### Challenge Types

**Recruitment**:
- **Blue (persuasion)**: Convince hero to join peacefully
- **Red (intimidation)**: Threaten hero into service
- Result depends on approach (friendly hire vs forced conscription)

**Navigation**:
- **Green**: Avoid hazards, navigate difficult waters
- **Blue**: Use magic to calm storms or find safe passage

**Resource Acquisition**:
- **Red**: Take by force, break into storage
- **Blue**: Negotiate favorable deal, use magic to enhance value

**Social Encounters**:
- **Blue**: Diplomacy, charm, persuasion
- **Red**: Intimidation, threats
- **Green**: Trickery, sleight of hand

### Rolling Mechanics
**AIDEV-NOTE**: Simplified roll system - all dice rolled at once, one reroll with auto-blank selection

1. **Initial Roll**: All dice from all characters are rolled simultaneously (no selection)
2. **Evaluate**: Count matching colors for challenge requirement
3. **One Reroll**: Player gets ONE reroll attempt per challenge
   - All blank results are automatically selected for reroll
   - Player can choose to reroll additional non-blank dice
   - Or player can keep current results and skip reroll
4. **Final Result**: Success if requirement met, failure otherwise
5. Partial success possible (some challenges scale with result)

### Challenge Difficulty
- **Easy**: 1-2 colored faces required
- **Medium**: 3-4 colored faces required
- **Hard**: 5-6 colored faces required
- **Very Hard**: 7+ colored faces required

## Combat System (Icons)

### Combat Overview (TBD)
- Icons trigger specific attacks/effects
- Slot additional dice to enhance abilities
- Combo system for multiple matching icons
- Detailed mechanics to be defined later

### Placeholder Structure
```javascript
// Combat ability triggered by icon
{
    icon: "sword_attack",
    baseDamage: 10,
    enhancementSlots: 2,  // Can slot 2 extra dice
    effect: "physical_damage"
}

// Enhanced by slotting additional dice
// Each slotted die adds bonus based on its color
// Red = +damage, Green = +accuracy, Blue = +magic effect
```

## Character Dice Bonuses

### Dice Pools
Each character provides dice to the player's pool:
- **Basic crew**: 1 die with mostly blanks
- **Skilled crew**: 1-2 dice with some colored faces
- **Heroes**: 2-3 dice with many colored faces
- **Legendary heroes**: 3+ dice with all colored faces

### Character Specialization
Different characters provide different dice distributions:

**Warrior**:
- 2 dice, heavy Red, some Green, no Blue
- Good for strength challenges and physical combat

**Mage**:
- 2 dice, heavy Blue, no Red, some Green
- Good for magic challenges and spellcasting

**Rogue**:
- 2 dice, heavy Green, some Red, some Blue
- Good for agility challenges and trickery

**Paladin**:
- 3 dice, balanced Red/Blue, some Green
- Versatile for multiple challenge types

### Dice Example
```javascript
// Warrior's die
faces: [
    { color: "Red", icon: "sword_attack" },
    { color: "Red", icon: "shield_bash" },
    { color: "Red", icon: "cleave" },
    { color: "Green", icon: "dodge" },
    { color: null, icon: null },  // Blank face
    { color: null, icon: null }   // Blank face
]

// Mage's die
faces: [
    { color: "Blue", icon: "fireball" },
    { color: "Blue", icon: "ice_shard" },
    { color: "Blue", icon: "arcane_bolt" },
    { color: "Green", icon: "teleport" },
    { color: null, icon: null },  // Blank face
    { color: null, icon: null }   // Blank face
]
```

## Dice Manipulation

### Re-rolls
- **One reroll per challenge**: Every challenge gives ONE reroll opportunity
- **Automatic blank selection**: All blank faces are automatically marked for reroll
- **Selective reroll**: Player can choose to reroll additional non-blank dice
- **Optional**: Player can skip reroll and accept current results
- **Strategy**: Decide which non-blank faces to keep vs reroll

### Dice Selection During Reroll
- **Blanks**: Always automatically selected for reroll
- **Colored faces**: Player can choose to reroll or keep
- **Lock favorable results**: Keep good colored faces, reroll bad ones
- **All or nothing**: Can reroll all dice or only the blanks

### Modifiers
Various sources can provide bonuses:
- **Character abilities**: "Add 1 Red to result" or "Convert one Blank to Green"
- **Items**: "Lock an additional die during reroll" or "Reroll one extra die"
- **Faction bonuses**: "All Blue faces count double in Radiant ports"
- **Temporary buffs**: "Next challenge: Blanks count as Green"

## Visual Representation

### Dice Rendering (Canvas)
- **3D dice models** (optional, if using WebGL)
- **2D sprites** (simpler, top-down view)
- **Color-coded clearly**: Red, Green, Blue easily distinguishable
- **Icon visibility**: Icons clear and readable
- **Animation**: Rolling animation, landing, highlight matching colors

### Dice Display
- Show all available dice before rolling
- Highlight dice by character (group by crew member)
- Clear indication of which dice are being rolled
- Result display shows colors prominently

### Challenge UI
```
Challenge: Navigate the Storm
Requirement: 4 Green faces

Your Dice Pool:
[Captain: 3 dice] [Sailor: 2 dice] [Navigator: 2 dice]

[Roll All Dice]

Initial Roll Result:
Red: 2, Green: 3, Blue: 1, Blank: 1
FAILED: Need 4 Green, got 3

Reroll Available:
[Blank faces automatically selected]
Click dice to select/deselect for reroll:
[🔴 Keep] [🟢 Keep] [🔵 Keep] [⚪ Reroll] 
(Blanks shown with reroll mark)

[Reroll Selected Dice] [Accept Current Result]
```

## Dice Acquisition

### Crew Recruitment
Primary source of dice:
- Hire characters at taverns
- Each character brings their dice
- Better characters = better dice

### Dice Quality Levels
1. **Basic**: 1-2 colored faces per die (6 faces total)
2. **Skilled**: 3-4 colored faces per die
3. **Expert**: 4-5 colored faces per die
4. **Legendary**: 5-6 colored faces per die (all or mostly colored)

### Progression
- Start with captain's basic dice (2-3 dice)
- Recruit crew to expand pool (up to 10-15 dice)
- Find legendary heroes for best dice
- Balance crew for desired color distribution

## Strategy

### Dice Pool Building
- **Generalist**: Balanced Red/Green/Blue for all challenges
- **Specialist**: Focus on one color for specific challenge types
- **Adaptive**: Swap crew based on expected challenges

### Challenge Approach
- **Assess difficulty**: How many colored faces needed?
- **Count pool**: How many relevant colors in your dice?
- **Calculate odds**: Probability of success with one reroll
- **Reroll strategy**: Which non-blank dice to keep vs reroll?

### Risk Management
- **Use your reroll**: Every challenge gives one, use it strategically
- **Partial success**: Accept "close enough" if available
- **Retreat option**: Some challenges can be avoided
- **Reroll decisions**: Sometimes keeping suboptimal colored faces is better than risking blanks

## AIDEV-NOTE: Dice Data Structures

```javascript
// Die definition
{
    dieId: "warrior_die_1",
    owner: "character_warrior_01",
    faces: [
        { color: "Red", icon: "sword_attack" },
        { color: "Red", icon: "shield_bash" },
        { color: "Red", icon: "cleave" },
        { color: "Green", icon: "dodge" },
        { color: null, icon: null },  // Blank face
        { color: null, icon: null }   // Blank face
    ]
}

// Challenge definition
{
    challengeId: "recruit_mage_01",
    description: "The mage eyes you skeptically. How will you convince them?",
    requirements: [
        { color: "Blue", count: 3, approach: "persuasion" },
        { color: "Red", count: 4, approach: "intimidation" }
    ],
    rewards: {
        success: { crewMember: "mage_npc_01", reputation: +5 },
        failure: { gold: -100, reputation: -2 }
    }
}

// Roll result
{
    diceRolled: ["warrior_die_1", "mage_die_1", "captain_die_1"],
    results: [
        { dieId: "warrior_die_1", faceIndex: 0, color: "Red", icon: "sword_attack" },
        { dieId: "mage_die_1", faceIndex: 2, color: "Blue", icon: "arcane_bolt" },
        { dieId: "captain_die_1", faceIndex: 4, color: null, icon: null }  // Blank face
    ],
    summary: { Red: 1, Green: 0, Blue: 1, Blank: 1 },
    rerollAvailable: true
}

// Reroll state
{
    selectedForReroll: [
        { dieId: "captain_die_1", autoSelected: true },  // Blank, automatically selected
        { dieId: "warrior_die_1", autoSelected: false }  // Player chose to reroll this too
    ]
}
```

## Future Enhancements (TBD)

- Custom dice crafting
- Dice fusion (combine two dice into one better die)
- Cursed dice (negative effects but powerful)
- Lucky charms (reusable modifiers)
- Dice-based mini-games
- PvP dice battles with other traders

