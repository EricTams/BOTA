# World Simulation System

## Overview

The game world is alive and constantly evolving. Cities produce and consume resources, prices fluctuate based on supply and demand, AI boats trade, and time progresses through weeks and months.

## Dual-Loop System

### Render Loop
- **RequestAnimationFrame**: Runs at 60fps (or monitor refresh rate)
- **Purpose**: Visual updates, animations, input handling
- **Canvas rendering**: Ships, map, particles, UI
- **Smooth visuals**: Independent of simulation speed

### Simulation Tick
- **Independent loop**: Separate from rendering
- **Base rate**: 1 tick per second (1Hz) by default
- **Adjustable speed**: Player can control simulation speed
- **Game logic**: Resource production, AI decisions, price updates

### Speed Control
Player can adjust simulation speed:
- **Paused** (0x): Time frozen, nothing happens
- **Normal** (1x): 1 simulation tick per second
- **Fast** (2x): 2 simulation ticks per second
- **Very Fast** (4x): 4 simulation ticks per second

## City Resource Simulation

### Production
Each city produces resources based on:
- **City type**: Agricultural, industrial, coastal, etc.
- **Population**: Larger cities produce more
- **Specialization**: 1-3 primary goods
- **Production rate**: Units per simulation tick

**Example**:
```javascript
// Claddish Harbor (Naval city)
production: {
    "Weapons": { rate: 10 },    // 10 units per tick
    "Iron Ingots": { rate: 15 },
    "Ships": { rate: 2 }
}
```

### Consumption
Cities consume resources based on:
- **Population**: More people = more consumption
- **City tier**: Larger cities consume luxury goods
- **Industry**: Production facilities consume raw materials
- **Consumption rate**: Units per simulation tick

**Example**:
```javascript
// Claddish Harbor
consumption: {
    "Grain": { rate: 20 },      // 20 units per tick
    "Fish": { rate: 15 },
    "Beer": { rate: 10 },
    "Coal": { rate: 12 }        // For forges
}
```

### Stockpiles
Each city maintains stockpiles:
- **Current stock**: Units currently available
- **Target stock**: Desired level (typically 1000-5000 units)
- **Overflow**: Excess production adds to stock
- **Shortage**: Consumption depletes stock

### Price Adjustments
Prices change based on stockpile levels:

**Shortage** (Stock < 25% of target):
- Price increases (+20% to +60%)
- City desperate for imports
- High profit opportunity

**Low Stock** (25-50% of target):
- Price increases slightly (+10% to +20%)
- City willing to pay more

**Balanced** (50-150% of target):
- Normal prices (±10%)
- Fair trade conditions

**Surplus** (150-300% of target):
- Price decreases (-10% to -30%)
- City eager to export

**Oversupply** (> 300% of target):
- Price crashes (-30% to -60%)
- City desperate to sell

## Time System

### Week Progression
- **52 weeks per game** (default duration)
- **1 week = X simulation ticks** (configurable, e.g., 60 ticks)
- **Weekly events**: Some events trigger weekly
- **Progress tracking**: Current week displayed in HUD

### Monthly Balance Sheet
Every 4 weeks (1 month):
- **Summary screen**: Shows income, expenses, profit
- **Reputation changes**: Net faction standing changes
- **Goals progress**: Track toward objectives
- **Continue button**: Resume gameplay

**Balance Sheet Contents**:
```
MONTH 3 SUMMARY

Income:
  Trade Profits: +2,450g
  Quest Rewards: +500g
  Production Income: +300g
  Total Income: +3,250g

Expenses:
  Crew Wages: -200g
  Ship Maintenance: -150g
  Port Fees: -100g
  Total Expenses: -450g

Net Profit: +2,800g

Faction Relations:
  Claddish Navy: +5 (now +35)
  Free Captains: -3 (now -15)

Goals:
  Reach 10,000g: 7,500 / 10,000 (75%)
  Allied with any faction: 35 / 50 (70%)
```

### Day/Night Cycle (Optional, TBD)
Future feature:
- Visual time of day
- Some events only at night
- Different encounters based on time
- Purely cosmetic or gameplay impact TBD

## AI Boat Behavior

### AI Trading Logic
AI boats follow similar trading strategies:
1. **Check cargo**: What goods do they have?
2. **Scan prices**: Find profitable routes
3. **Make decision**: Buy low, sell high
4. **Execute trade**: Purchase/sell at ports
5. **Navigate**: Move to next port

### AI Boat Types

**Merchant Traders**:
- Focus on profitable routes
- Avoid danger
- Trade common goods (Tier 1-3)

**Luxury Traders**:
- Trade high-value goods (Tier 4-6)
- Armed escorts
- Fewer but more profitable trips

**Faction Supply Ships**:
- Supply faction ports
- Prioritize faction needs over profit
- Heavily defended

**Pirates**:
- Attack weak ships
- Steal cargo
- Sell at pirate havens

### AI Encounters
- **Meeting at sea**: Can interact with AI boats
- **Trade offers**: AI may offer trades
- **Combat**: Pirates or hostile factions attack
- **Escort requests**: Pay for protection

## Simulation Tick Execution

### Tick Order
Each simulation tick executes in order:

1. **Update timer**: Increment game time
2. **City production**: Add produced goods to stockpiles
3. **City consumption**: Subtract consumed goods from stockpiles
4. **Price updates**: Adjust prices based on stockpiles
5. **AI decisions**: Each AI boat makes decision
6. **AI movement**: Move AI boats
7. **Random events**: Check for encounter triggers
8. **Player state**: Update player effects (buffs, debuffs)
9. **Check goals**: Evaluate victory/objectives

### Performance
- **Efficient calculations**: Optimized for many cities/boats
- **Batch updates**: Update all cities at once
- **Spatial partitioning**: Only calculate nearby interactions
- **Lazy evaluation**: Skip unnecessary calculations

## Pausing and Time Control

### Pause Functionality
- **Spacebar or button**: Toggle pause
- **Simulation stops**: No ticks execute
- **Rendering continues**: Map still visible, animations frozen
- **Access menus**: Can open cargo, crew, etc. while paused

### Speed Control UI
```
[⏸ Pause] [▶ 1x] [▶▶ 2x] [▶▶▶ 4x]

Current Week: 12 / 52
Time until next month: 2 weeks
```

### Speed Multiplier Application
All time-based systems respect multiplier:
- Production rate × multiplier
- Consumption rate × multiplier
- AI decision frequency × multiplier
- Event trigger chance × multiplier
- Movement speed × multiplier

## Random Events

### Event Triggers
Events can trigger on simulation ticks:
- **Percentage chance**: e.g., 1% chance per tick
- **Condition-based**: Only when certain conditions met
- **Location-based**: Only in specific areas
- **Faction-based**: Related to faction standings

### Event Types
- **Storms**: Require navigation challenge
- **Pirates**: Combat or evasion
- **Treasure**: Opportunity for loot
- **Distress**: Help another ship (reward: gold/rep)
- **Faction patrol**: Inspection (smuggling check)
- **Market crash**: Sudden price change
- **Festival**: Temporary reputation boost at port

## World State Persistence

### Save System
World state is saved including:
- All city stockpiles and prices
- All AI boat positions and cargos
- Current week number
- Player state (position, cargo, crew, gold)
- Faction reputations
- Active quests and events
- Time control setting (current speed)

### Load System
- Restore complete world state
- Resume simulation from exact point
- No information lost

## AIDEV-NOTE: Simulation Data Structures

```javascript
// Simulation state
{
    currentWeek: 12,
    currentTick: 720,
    ticksPerWeek: 60,
    
    speedMultiplier: 1.0,  // 1x, 2x, or 4x
    isPaused: false,
    
    lastTickTime: Date.now()
}

// City sim state
{
    cityId: "claddish_harbor",
    
    stockpiles: {
        "Grain": { current: 800, target: 2000 },
        "Weapons": { current: 1500, target: 1000 }  // Surplus
    },
    
    production: {
        "Weapons": { rate: 10, ticksProduced: 0 },
        "Iron Ingots": { rate: 15, ticksProduced: 0 }
    },
    
    consumption: {
        "Grain": { rate: 20, ticksConsumed: 0 },
        "Coal": { rate: 12, ticksConsumed: 0 }
    },
    
    prices: {
        "Grain": { base: 40, current: 56, trend: "rising" },
        "Weapons": { base: 200, current: 160, trend: "falling" }
    }
}

// AI boat state
{
    boatId: "ai_merchant_01",
    position: { x: 1200, y: 800 },
    destination: { x: 2000, y: 1500, portId: "port_stonehall" },
    
    cargo: {
        "Grain": 50,
        "Wood": 30
    },
    
    aiType: "merchant_trader",
    faction: "StonehallMerchants",
    
    state: "traveling",  // or "docked", "trading", "fleeing"
    lastDecisionTick: 700
}
```

## Balancing Production and Consumption

### Resource Flow
Healthy economy requires balance:
- **Producers**: Cities that make more than they consume
- **Consumers**: Cities that consume more than they make
- **Trade dependency**: Creates profitable opportunities

### Example Flow
1. **Port A** (agricultural): Produces 100 Grain/tick, consumes 20
   - Surplus: 80 Grain/tick
   - Price: Low (surplus)
   
2. **Port B** (industrial): Produces 0 Grain, consumes 100/tick
   - Shortage: -100 Grain/tick
   - Price: High (shortage)

3. **Opportunity**: Buy Grain at Port A (cheap), sell at Port B (expensive)

4. **Player/AI trades**: Transport Grain from A to B

5. **Prices equilibrate**: Port A price rises, Port B price falls

6. **New opportunity**: Find next imbalance

## Future Enhancements (TBD)

- Weather system affecting production
- Seasonal variations (harvest seasons)
- Political events (wars, alliances affecting production)
- City growth and expansion
- Port construction (new ports appear)
- Resource depletion (mines run out)
- Technology progression (better production rates)
- Trade routes visualization
- Economic reports and statistics

