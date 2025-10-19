# Trading System

## Overview

Players buy and sell resources at ports to earn profits. Each port has different prices based on local supply/demand, production capabilities, and faction control.

## Port Interaction

### Entering a Port
- **Proximity trigger**: When boat enters port's radius, show "Enter Port" prompt
- **Automatic docking**: Boat stops moving when docked
- **Port screen**: Opens menu with trading and other options

### Port Screen Options
1. **Trading** - Buy and sell resources
2. **Shipyard** - Purchase new boats
3. **Tavern** - Recruit crew members
4. **Town Encounters** - Special events and quests
5. **Build** - Construct production facilities (high reputation required)
6. **Leave Port** - Return to map

## Trading Interface

### Buy/Sell Screen
- **Left panel**: Available goods at this port
- **Center**: Your cargo hold
- **Right panel**: Transaction summary

### Information Displayed
For each resource:
- Resource name and icon
- Current price (gold per unit)
- Price trend indicator (↑ rising, ↓ falling, → stable)
- Available quantity at port (for buying)
- Your cargo quantity (for selling)

### Transaction Flow
1. Select resource to buy or sell
2. Choose quantity (slider or number input)
3. See total cost/profit
4. Confirm transaction
5. Update cargo and gold

## Inventory Management

### Cargo Hold
- **Capacity limit**: Based on boat's cargo space stat
- **Weight/volume**: Each resource takes 1 unit of space
- **Organized display**: Group by tier or alphabetically
- **Quick info**: Hover for resource details

### Cargo Manifest Screen
Accessible from map or port:
- List all cargo with quantities
- Show current value of each resource
- Display total cargo value
- Show capacity usage (45/100 units)
- Sort and filter options

## Pricing System

### Base Prices (by Tier)
- Tier 1: 40g per unit
- Tier 2: 60g per unit
- Tier 3: 90g per unit
- Tier 4: 135g per unit
- Tier 5: 200g per unit
- Tier 6: 300g per unit

### Dynamic Price Modifiers
Actual price = Base price × Supply/Demand modifier

**Supply/Demand**: ±60% variance
- Low supply / high demand: +60% (prices rise)
- High supply / low demand: -60% (prices fall)
- Balanced: 0% (base price)

**Note**: Reputation does NOT affect trading prices. This encourages exploration and trading at all ports regardless of faction standing. Reputation affects other benefits like exclusive goods and building permissions.

### Price Trends
- **Historical tracking**: Track price changes over time
- **Visual indicators**: Show if price is rising or falling
- **Prediction**: Hint at future price direction based on simulation

## Faction-Specific Goods

### Faction Bonuses
Each faction offers unique advantages:
- **Radiant ports**: Better prices on Food, Cloth, Beer
- **Dire ports**: Better prices on Weapons, Armor, Coal
- **Neutral ports**: Balanced prices, more variety

### Exclusive Items
High reputation unlocks faction-exclusive goods:
- Special boat types
- Rare resources
- Unique equipment

## Port Visual Theming

### Faction Styling
Port appearance reflects controlling faction:
- **Radiant**: Gold/white colors, bright aesthetic
- **Dire**: Red/black colors, dark aesthetic
- **Neutral**: Blue/gray colors, generic style

### UI Elements
- Port name and faction banner
- Faction colors on buttons and panels
- Faction icons and decorations
- Dynamic styling based on controlling faction

## Resource Production (Port Building)

### Building Options (High Reputation Required)
Players can invest in production facilities:
- **Raw resource production**: Farms, mines, lumber mills (Tier 1-2)
- **Processing facilities**: Breweries, forges, workshops (Tier 3-4)
- **Advanced production**: Armories, jewelers (Tier 5-6)

### Building Benefits
- **Passive income**: Facilities generate resources over time
- **Price control**: Increase local supply, reduce prices
- **Reputation gain**: Building improves faction standing
- **Investment**: Costs gold upfront, pays off over weeks

### Building Requirements
- Minimum reputation level with port faction
- Gold investment (varies by building type)
- Port must support the resource type (farms need agricultural ports)

## Trade Routes

### Emerging Patterns
Players discover profitable routes:
1. **Find price differences**: Port A sells Grain cheap, Port B buys expensive
2. **Plan route**: Calculate profit vs. time/distance
3. **Execute trades**: Buy low, sell high
4. **Repeat**: Establish regular trading pattern

### Route Optimization
- **Distance calculation**: Shorter routes = faster profits
- **Port capacity**: Some ports have limited stock
- **Competition**: AI boats also trade, affecting prices
- **Risk vs reward**: Longer routes may have better margins but more encounters

## AIDEV-NOTE: Trading Data Structure

```javascript
// Port trading data
{
    portId: "port_radiant_01",
    faction: "Radiant",
    resources: {
        "Grain": {
            basePrice: 40,
            currentPrice: 48,     // After modifiers
            available: 500,       // Units in stock
            trend: "rising"       // Price trend
        },
        // ... more resources
    },
    productionBuildings: [
        {
            type: "Brewery",
            produces: "Beer",
            rate: 10              // Units per simulation tick
        }
    ]
}

// Player cargo
{
    capacity: 100,
    current: 45,
    items: {
        "Grain": { quantity: 20, averageBuyPrice: 40 },
        "Wood": { quantity: 25, averageBuyPrice: 42 }
    }
}
```

## Future Enhancements (TBD)

- Trade contracts (commit to deliver goods by deadline)
- Bulk discounts (buying large quantities)
- Storage warehouses (store goods at ports)
- Loan system (borrow gold to invest)
- Price history graphs

