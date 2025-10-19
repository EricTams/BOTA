# UI Screens

## Overview

Complete screen navigation system for BOTA. Clean transitions between game states, modal overlays, and intuitive navigation.

## Screen Navigation System

### Screen Stack
- **Base screens**: Full-screen game states (Start, Map, Port, etc.)
- **Overlay screens**: Modal dialogs on top of base (Cargo, Pause, etc.)
- **Transitions**: Smooth fades between screens
- **State preservation**: Underlying screens remain active

### Navigation Flow
```
Start Screen
    ↓
Captain Select
    ↓
Main Map ←→ Port Screen ←→ Trading
    ↓           ↓            ↓
Encounter   Shipyard     Town Events
    ↓       Tavern
Cargo       Build
Pause
Character
```

## Core Screens

### 1. Start Screen

**Purpose**: Main menu and game entry point

**Elements**:
- **BOTA Logo**: Large, prominent (DOTA style with planks over D, red B painted)
- **Continue Button**: Resume saved game (disabled if no save exists)
- **New Game Button**: Start new game (warns if save exists)
- **Options Button**: Settings menu
- **Credits Button**: Game credits
- **Exit Button**: Quit game

**Layout**:
```
┌─────────────────────────────────┐
│                                  │
│        [BOTA LOGO]               │
│      (Big and Epic)              │
│                                  │
│      [Continue]                  │
│      (Week 23, 5,420g)           │
│                                  │
│      [New Game]                  │
│      [Options]                   │
│      [Credits]                   │
│      [Exit]                      │
│                                  │
└─────────────────────────────────┘
```

**Note**: Continue button shows save info (week, gold) and is disabled if no save exists.

### 2. Difficulty Select Screen

**Purpose**: Choose game difficulty

**Elements**:
- **Difficulty options**: Easy, Normal, Hard
- **Description panel**: Shows difficulty effects
- **Duration display**: Weeks for each difficulty
- **Back button**: Return to start screen

**Difficulty Info Display**:
```
┌─────────────────────────────────┐
│  SELECT DIFFICULTY               │
│                                  │
│  [Easy]  [●Normal]  [Hard]      │
│                                  │
│  Duration: 52 weeks              │
│  Starting Gold: Standard         │
│  AI Competition: Medium          │
│  Pirate Threat: Moderate         │
│  Profit Margins: Medium          │
│                                  │
│  [Continue]  [Back]              │
└─────────────────────────────────┘
```

### 3. Captain Select Screen

**Purpose**: Choose starting captain (faction leader) and view their dice

**Elements**:
- **Captain portraits**: Grid of 9 faction captains (from captain_data.js)
  - Each portrait is 1024x1024 with painterly background
  - One captain per faction (Kunkka, Rubick, Alchemist, Slardar, Naga Siren, Tidehunter, Enchantress, Axe, Tinker)
- **Captain details panel**: Shows selected captain info
  - Captain portrait (large display)
  - Captain name and faction
  - Captain description (flavor text)
  - Personal die faces
  - Equipment die and name
  - Starting ship for that faction
- **Faction select**: Choosing captain determines starting faction
- **Confirm button**: Start game with selected captain/faction

**Layout**:
```
┌─────────────────────────────────┐
│  CHOOSE YOUR CAPTAIN             │
├──────────────┬──────────────────┤
│ [Kunkka]     │ [Large Portrait] │
│ [Rubick]     │                  │
│ [Alchemist]  │ KUNKKA           │
│ [Slardar]    │ Claddish Navy    │
│ [Naga Siren] │                  │
│ [Tidehunter] │ "Legendary..."   │
│ [Enchantress]│                  │
│ [Axe]        │ Personal Die:    │
│ [Tinker]     │ 4 Red, 2 Green   │
│              │                  │
│              │ Equipment:       │
│              │ Tidebringer      │
│              │ 5 Red, 1 Green   │
│              │                  │
│              │ Starting Ship:   │
│              │ Patrol Cutter    │
│              │                  │
│              │ [Begin Voyage]   │
├──────────────┴──────────────────┤
│  [Back]                          │
└─────────────────────────────────┘
```

**AIDEV-NOTE**: Captain images come from captain_data.js, portraits stored in assets/characters/

### 4. Main Map Screen

**Purpose**: Primary gameplay - navigation and exploration

**Elements**:
- **Full-screen canvas**: Map with player boat
- **HUD overlay** (top):
  - Current week / total weeks
  - Gold amount
  - Time control buttons (Pause, 1x, 2x, 4x)
- **HUD overlay** (bottom left):
  - Mini-map (optional)
  - Current location
- **HUD overlay** (bottom right):
  - Quick access buttons:
    - Cargo Manifest
    - Crew Roster
    - Pause Menu
- **Port proximity**: "Press E to enter port" when near

**HUD Layout**:
```
┌─────────────────────────────────┐
│ Week 23/52  💰5,420g  [⏸][▶][▶▶]│
├─────────────────────────────────┤
│                                  │
│        [GAME MAP CANVAS]         │
│                                  │
│  [Mini-map]            [Cargo]  │
│  Location: At Sea      [Crew]   │
│                        [Pause]  │
└─────────────────────────────────┘
```

### 5. Port Screen

**Purpose**: Enter port and access town services

**Elements**:
- **Port name and faction**: Header showing control
- **Faction banner**: Visual faction theming
- **Menu options**:
  - Trading (buy/sell goods)
  - Shipyard (purchase boats)
  - Tavern (recruit crew)
  - Town Encounters (quests and events)
  - Build (invest in production) [if reputation high enough]
  - Leave Port (return to map)
- **Background**: Port-themed image with faction styling

**Layout**:
```
┌─────────────────────────────────┐
│ CLADDISH HARBOR [Navy Banner]   │
│ Controlled by: Claddish Navy     │
├─────────────────────────────────┤
│                                  │
│        [Port Background]         │
│                                  │
│        [⚓ Trading]               │
│        [🚢 Shipyard]             │
│        [🍺 Tavern]               │
│        [📜 Town Encounters]      │
│        [🏗️ Build]                │
│        [⛵ Leave Port]            │
│                                  │
└─────────────────────────────────┘
```

### 6. Trading Screen

**Purpose**: Buy and sell goods at port

**Elements**:
- **Three-panel layout**:
  - Left: Port's available goods (for buying)
  - Center: Your cargo hold
  - Right: Transaction summary
- **Resource list**: Name, icon, price, quantity available
- **Price indicators**: Trend arrows (↑↓→)
- **Buy/Sell buttons**: Quick transaction
- **Quantity slider**: Select amount
- **Confirm transaction**: Finalize trade

**Layout**:
```
┌─────────────────────────────────┐
│ TRADING - Claddish Harbor        │
├───────┬──────────┬───────────────┤
│PORT   │YOUR CARGO│TRANSACTION    │
│GOODS  │          │               │
├───────┤          │Buy: Grain     │
│Grain  │Grain: 50 │Qty: [▮▮▯▯▯]25│
│40g ↑  │Wood: 30  │Cost: 1,000g   │
│Avail: │          │               │
│500    │Capacity: │               │
│[Buy]  │80/200    │[Confirm Buy]  │
├───────┤          │               │
│Wood   │          │               │
│42g →  │          │               │
│Avail: │          │               │
│300    │          │               │
│[Buy]  │          │               │
├───────┴──────────┴───────────────┤
│ [Exit Trading]                    │
└─────────────────────────────────┘
```

### 7. Cargo Manifest Screen (Overlay)

**Purpose**: View inventory details

**Elements**:
- **Cargo list**: All goods with quantities
- **Current value**: Total worth of cargo
- **Capacity bar**: Visual fullness indicator
- **Sort options**: By name, by tier, by value
- **Filter**: Show only specific tiers

**Layout**:
```
┌─────────────────────────────────┐
│ CARGO MANIFEST                   │
├─────────────────────────────────┤
│ Capacity: 130 / 200 units        │
│ Total Value: 12,500g             │
│                                  │
│ [Sort: Name ▼]  [Filter: All ▼] │
│                                  │
│ ┌─────────────────────────────┐ │
│ │ Grain × 50    Value: 2,000g │ │
│ │ Wood × 30     Value: 1,260g │ │
│ │ Iron Ingots × 20  5,400g    │ │
│ │ Weapons × 10   Value: 4,000g│ │
│ └─────────────────────────────┘ │
│                                  │
│ [Close]                          │
└─────────────────────────────────┘
```

### 8. Encounter Screen

**Purpose**: Dice-based challenge resolution

**Elements**:
- **Encounter description**: Narrative text
- **Challenge requirements**: "Need 3 Blue" or "Need 4 Red + 2 Green"
- **Dice pool display**: Show available dice (grouped by crew)
- **Select dice**: Choose which to roll
- **Roll button**: Execute roll
- **Results display**: Show dice results, success/failure
- **Rewards/consequences**: What happens next
- **Continue button**: Proceed after encounter

**Layout**:
```
┌─────────────────────────────────┐
│ ENCOUNTER: Storm at Sea          │
├─────────────────────────────────┤
│ A massive storm blocks your      │
│ path. Navigate through it or     │
│ risk damage!                     │
│                                  │
│ Challenge: Roll 4 Green (Agility)│
│                                  │
│ YOUR DICE POOL:                  │
│ Captain: [🎲][🎲][🎲]           │
│ Sailor:  [🎲][🎲]               │
│ Rogue:   [🎲][🎲]               │
│                                  │
│ [✓Select All] [Roll Dice]       │
│                                  │
│ Re-rolls remaining: 2            │
│                                  │
│ RESULT:                          │
│ Red: 2  Green: 3  Blue: 1        │
│ ❌ FAILED (need 4 Green)         │
│                                  │
│ [-100g damage repairs]           │
│                                  │
│ [Continue]                       │
└─────────────────────────────────┘
```

### 9. Monthly Balance Sheet

**Purpose**: Show monthly financial summary

**Elements**:
- **Month number**: "Month 6 Summary"
- **Income breakdown**: Trade profits, quests, production
- **Expense breakdown**: Crew wages, maintenance, fees
- **Net profit**: Total for month
- **Faction changes**: Reputation gains/losses
- **Goals progress**: Track objectives
- **Continue button**: Resume gameplay

**Layout**:
```
┌─────────────────────────────────┐
│ MONTH 6 SUMMARY                  │
├─────────────────────────────────┤
│ INCOME:                          │
│   Trade Profits:      +2,450g    │
│   Quest Rewards:      +500g      │
│   Production Income:  +300g      │
│   Total Income:       +3,250g    │
│                                  │
│ EXPENSES:                        │
│   Crew Wages:         -200g      │
│   Ship Maintenance:   -150g      │
│   Port Fees:          -100g      │
│   Total Expenses:     -450g      │
│                                  │
│ NET PROFIT:           +2,800g    │
│                                  │
│ FACTION RELATIONS:               │
│   Claddish Navy: +5 (now +35)   │
│   Free Captains: -3 (now -15)   │
│                                  │
│ GOALS:                           │
│   Reach 10,000g:  7,500/10,000   │
│   Allied:         35/50          │
│                                  │
│ [Continue to Month 7]            │
└─────────────────────────────────┘
```

## Overlay/Pause Screens

### Pause Menu (Overlay)

**Elements**:
- **Resume**: Return to game
- **Options**: Settings
- **Main Menu**: Return to start (auto-saves and confirms)

### Character Sheet (Overlay)

**Elements**:
- **Crew list**: All crew members
- **Selected character details**:
  - Portrait
  - Name, class, quality
  - Dice pool preview
  - Special abilities
  - Recruitment cost (historical)
- **Dismiss button**: Remove crew member

### Map Legend (Overlay)

**Elements**:
- **Faction territories**: Color-coded regions
- **Port icons**: Symbol legend
- **Hazard markers**: Danger zones
- **Legend explanations**: What each icon means

## Screen Transitions

### Transition Types

**Fade**:
- Screen fades to black, new screen fades in
- Duration: 0.3 seconds
- Used for: Major screen changes (Start → Captain Select)

**Slide**:
- New screen slides in from side
- Duration: 0.2 seconds
- Used for: Related screens (Port → Trading)

**Modal**:
- Overlay appears with background dim
- Duration: 0.1 seconds
- Used for: Cargo, Pause, Character Sheet

### Loading Screens (Optional)

For longer loads (if needed):
- **Loading indicator**: Spinner or progress bar
- **Tip text**: Random gameplay tips
- **Background**: Themed image

## Responsive Design (Optional, TBD)

Future consideration for different screen sizes:
- **Desktop**: Full layout as designed
- **Tablet**: Adjusted layout, larger touch targets
- **Mobile**: Simplified UI, portrait mode support

## Accessibility (Optional, TBD)

Future improvements:
- **Font size options**: Larger text for readability
- **Color blind mode**: Alternative color schemes
- **Keyboard navigation**: Full keyboard support
- **Screen reader**: Text-to-speech descriptions

## AIDEV-NOTE: UI Data Structures

```javascript
// Screen state
{
    currentScreen: "main_map",
    previousScreen: "port",
    
    overlays: ["cargo_manifest"],  // Active overlays
    
    transition: {
        active: true,
        type: "fade",
        progress: 0.5,  // 0-1
        from: "port",
        to: "main_map"
    }
}

// Screen definitions
const SCREENS = {
    START: "start",
    DIFFICULTY: "difficulty_select",
    CAPTAIN: "captain_select",
    MAP: "main_map",
    PORT: "port",
    TRADING: "trading",
    SHIPYARD: "shipyard",
    TAVERN: "tavern",
    ENCOUNTER: "encounter",
    BALANCE: "monthly_balance",
    GAME_END: "game_end"
};

// Overlay definitions
const OVERLAYS = {
    CARGO: "cargo_manifest",
    PAUSE: "pause_menu",
    CHARACTER: "character_sheet",
    LEGEND: "map_legend",
    OPTIONS: "options_menu"
};
```

## UI Styling

### Theme
- **Font**: Bold, fantasy-style for headers; clean sans-serif for body
- **Colors**: Faction-themed (navy, purple, teal, etc.)
- **Buttons**: Wooden texture, carved appearance
- **Panels**: Weathered parchment or wood
- **Icons**: Clear, recognizable symbols

### Consistency
- **Button style**: Uniform across all screens
- **Panel frames**: Consistent decoration
- **Font hierarchy**: Clear sizes for headers, body, small text
- **Color coding**: Resources by tier, factions by color

## Future Enhancements

- **Tutorials**: Contextual help on first visit to each screen
- **Animations**: More dynamic UI transitions
- **Tooltips**: Hover for detailed information
- **Quick actions**: Keyboard shortcuts for common tasks
- **Customization**: Player can adjust UI layout
- **Themes**: Alternative UI skins
- **Voice acting**: Character dialogue
- **Dynamic backgrounds**: Animated port scenes

