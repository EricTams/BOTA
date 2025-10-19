# Game Progression

## Overview

BOTA is a score-based game where players compete for the highest wealth after 52 weeks. Difficulty settings affect game duration and starting conditions.

## Victory Conditions

### End Game
- **Duration**: 52 weeks (one year) by default
- **No game over**: Cannot "lose", only achieve lower scores
- **Final score**: Total wealth at end of 52 weeks

### Wealth Calculation
```
Final Score = 
    Current Gold
    + Value of Cargo
    + Value of Ship
    + Value of Production Buildings
    + Bonus for Faction Alliances (optional)
```

### High Score Tracking
- **Local scores**: Save top 10 scores locally
- **Score screen**: Show at game end with breakdown
- **Replay value**: Try different strategies for higher scores

### Example Score Screen
```
GAME COMPLETE - WEEK 52

Captain: Merchant Thalia
Difficulty: Normal (52 weeks)

FINAL WEALTH: 45,750 Gold

Breakdown:
  Cash on Hand:         15,250g
  Cargo Value:          12,500g
  Ship Value:            8,000g
  Buildings Value:      10,000g
  Alliance Bonus:        -0g

Faction Relations:
  Claddish Navy: Allied (+65)
  Artifact Traders: Friendly (+35)
  Stonehall: Allied (+52)

Achievements Unlocked:
  ✓ Master Trader (10,000g profit in one month)
  ✓ Allied Captain (Allied with 2+ factions)

[New Game] [View Leaderboard] [Main Menu]
```

## Difficulty Selection

### Difficulty Affects
1. **Game duration**: Longer game on higher difficulties
2. **Starting captains**: More powerful captains on harder modes
3. **Starting challenges**: More aggressive AI, hostile factions
4. **Economic difficulty**: Tighter profit margins, more competition

### Difficulty Levels

**Easy**:
- **Duration**: 26 weeks (half year)
- **Available captains**: Merchant Captain, Naval Officer, Dwarven Trader
- **Starting gold**: +20% bonus
- **AI competition**: Low (fewer AI traders)
- **Pirate threat**: Minimal
- **Profit margins**: High (+30% price variance)

**Normal**:
- **Duration**: 52 weeks (one year)
- **Available captains**: All standard captains
- **Starting gold**: Standard
- **AI competition**: Medium (balanced AI traders)
- **Pirate threat**: Moderate
- **Profit margins**: Medium (standard variance)

**Hard**:
- **Duration**: 78 weeks (1.5 years)
- **Available captains**: All captains including Pirate, Naga
- **Starting gold**: -20% penalty
- **AI competition**: High (many AI traders)
- **Pirate threat**: Frequent
- **Profit margins**: Low (±40% price variance, tighter)

**Expert** (Future):
- **Duration**: 104 weeks (2 years)
- **Available captains**: All + legendary captains
- **Starting gold**: -40% penalty
- **AI competition**: Extreme (cutthroat economy)
- **Pirate threat**: Constant danger
- **Profit margins**: Minimal (±30% variance)

## Captain Selection

Each captain provides unique starting conditions. See [CHARACTERS_AND_CREW.md](CHARACTERS_AND_CREW.md#captain-selection) for full captain details.

### Captain Categories

**Beginner-Friendly** (Easy/Normal):
- Merchant Captain
- Dwarven Trader
- Naval Officer

**Challenging** (Normal/Hard):
- Mystic Trader
- Naga Diplomat

**Advanced** (Hard only):
- Pirate Captain
- Oglodi Raider (future)

### Starting Conditions Summary
Each captain determines:
- Starting gold (200g - 500g)
- Starting ship (type, stats)
- Starting port/location
- Starting faction reputations
- Starting crew members
- Special abilities

## Save/Load System

### Save Game Data
Saves include complete game state:

**Player State**:
- Captain choice and stats
- Current week/tick
- Gold, cargo, ship
- Crew roster
- Position on map

**World State**:
- All city stockpiles and prices
- All AI boat positions and states
- Faction reputations
- Active quests and events

**Progress**:
- Achievements unlocked
- High scores
- Unlocked captains (future)

### Save System
- **Auto-save only**: Game automatically saves progress
- **Single save file**: One game in progress at a time
- **Continue**: Resume from auto-save on start screen
- **No manual saves**: Simplified system, always saves current progress

### Save File Format
Single JSON file stored locally:

```
BOTA/saves/
└── game_save.json
```

**Save File Structure**:
```json
{
    "version": "1.0.0",
    "timestamp": "2025-10-15T12:34:56Z",
    "playtime": 7230,  // seconds
    
    "difficulty": "normal",
    "currentWeek": 23,
    "currentTick": 1380,
    
    "player": {
        "captainId": "merchant_captain",
        "name": "Captain Thalia",
        "gold": 5420,
        "position": { "x": 1234, "y": 5678 },
        "shipId": "merchant_ship_01",
        "cargo": { "Grain": 50, "Wood": 30 },
        "crew": ["warrior_01", "mage_01"]
    },
    
    "world": {
        "cities": [...],
        "aiBoats": [...],
        "prices": {...}
    },
    
    "factions": {
        "CladdishNavy": 35,
        "ArtifactTraders": 15,
        ...
    },
    
    "quests": [...],
    "achievements": [...]
}
```

### Load Game
- **Continue**: Load most recent save automatically
- **Load menu**: Browse save slots with preview
- **Delete saves**: Manage save slots

### Save Game UI
```
SAVE GAME
───────────────────────────────────
Slot 1: [Captain Thalia - Week 23]
        Normal Difficulty
        5,420 gold
        2025-10-15 12:34
        [Load] [Delete]

Slot 2: [Empty]
        [Save Here]

Slot 3: [Captain Marcus - Week 45]
        Hard Difficulty
        12,850 gold
        2025-10-14 18:22
        [Load] [Delete]

[Auto-save: Week 23] [Load]

[Back to Game]
```

## Goals and Achievements (Optional, TBD)

### In-Game Goals
Optional objectives for guided gameplay:

**Wealth Goals**:
- Reach 10,000 gold
- Reach 50,000 gold
- Reach 100,000 gold

**Reputation Goals**:
- Become Allied with any faction
- Become Allied with 3+ factions
- Max out reputation (+100) with one faction

**Trading Goals**:
- Complete 100 trades
- Trade all 30+ resource types
- Earn 10,000g profit in single month

**Exploration Goals**:
- Visit all ports
- Discover all factions
- Complete all encounters

### Achievements
Permanent unlocks across all saves:

**Trading Achievements**:
- **Merchant Apprentice**: Earn 1,000g total profit
- **Master Trader**: Earn 10,000g in one month
- **Tycoon**: Reach 100,000g wealth

**Combat Achievements**:
- **Pirate Hunter**: Defeat 10 pirate ships
- **Undefeated**: Never lose a combat encounter
- **Legendary Warrior**: Win with all Red dice

**Diplomatic Achievements**:
- **Allied Captain**: Allied with 2+ factions
- **Peace Broker**: Improve relations between 2 factions
- **Universal Trader**: Trade with all factions

**Exploration Achievements**:
- **World Traveler**: Visit every port
- **Cartographer**: Discover all map locations
- **Treasure Hunter**: Find 10 hidden treasures

### Unlockables (Future)
Achievements could unlock:
- New captains
- Special ships
- Bonus starting gold
- Unique dice
- Cheat codes/modifiers

## Progression Curve

### Early Game (Weeks 1-13)
- **Focus**: Learn trading basics
- **Goals**: Build starting capital (1,000-5,000g)
- **Challenges**: Limited cargo space, basic crew
- **Opportunities**: Simple trades, easy encounters

### Mid Game (Weeks 14-39)
- **Focus**: Expand operations
- **Goals**: Upgrade ship, recruit crew, build reputation
- **Challenges**: AI competition increases, complex routes
- **Opportunities**: Luxury goods, faction exclusives, production buildings

### Late Game (Weeks 40-52)
- **Focus**: Maximize wealth
- **Goals**: Optimize profit per week, secure alliances
- **Challenges**: Saturated markets, frequent encounters
- **Opportunities**: Tier 6 goods, legendary crew, high-risk routes

### Endgame Strategy
Final weeks:
- **Liquidate**: Sell production buildings for cash boost
- **High-value cargo**: Fill ship with Tier 6 goods
- **Time management**: Maximize profit before week 52 ends
- **Safe play**: Avoid risks that could lose wealth

## Difficulty Balance

### Easy Mode Strategy
- **Relaxed pace**: Plenty of time to learn
- **Safe trading**: High profit margins, low risk
- **Goal**: Reach 20,000g by week 26

### Normal Mode Strategy
- **Balanced pace**: Standard learning curve
- **Moderate risk**: Balance profit and safety
- **Goal**: Reach 50,000g by week 52

### Hard Mode Strategy
- **Fast pace**: Aggressive trading required
- **High risk**: Tight margins, dangerous routes
- **Goal**: Reach 75,000g by week 78

## New Game Plus (Future, TBD)

Potential post-completion features:
- **Carry over**: Keep achievements, unlocks
- **Bonus modifiers**: Start with bonus gold or crew
- **Challenge modes**: Special constraints (e.g., "Pacifist", "Solo Captain")
- **Endless mode**: Play beyond 52 weeks
- **Custom difficulty**: Tweak individual parameters

## AIDEV-NOTE: Progression Data

```javascript
// Game progression state
{
    difficulty: "normal",
    startWeek: 0,
    currentWeek: 23,
    endWeek: 52,
    
    captain: "merchant_captain",
    startingGold: 500,
    currentGold: 5420,
    
    goals: [
        {
            id: "reach_10k",
            description: "Reach 10,000 gold",
            progress: 5420,
            target: 10000,
            completed: false
        }
    ],
    
    achievements: [
        {
            id: "first_trade",
            name: "First Trade",
            unlockedAt: 152  // tick number
        }
    ],
    
    stats: {
        totalProfit: 15200,
        tradesCompleted: 87,
        encountersWon: 12,
        portsVisited: 15
    }
}
```

## Future Enhancements

- Story mode with narrative
- Multiple endings based on choices
- Faction conquest (control ports)
- Fleet management (multiple ships)
- Crew loyalty and mutiny
- Retirement system (score multiplier for early retirement)
- Legacy system (benefits for future runs)
- Seasonal events and festivals

