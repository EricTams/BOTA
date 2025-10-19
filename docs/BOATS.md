# Boats System

## Overview

Boats are the primary mode of transportation and your mobile base. Each boat has stats that affect gameplay: speed, cargo capacity, and crew space.

## Boat Stats

### Speed
- **Affects**: How fast boat moves on map (pixels per second)
- **Range**: 50 (very slow) to 200 (very fast)
- **Trade-off**: Faster boats often have less cargo space
- **Usage**: Fast boats for time-sensitive trades, slow for bulk cargo

### Cargo Space
- **Affects**: Maximum units of goods you can carry
- **Range**: 50 (small) to 500 (huge)
- **Trade-off**: Large cargo means slower speed
- **Usage**: Key stat for profit maximization

### Crew Space
- **Affects**: Maximum number of crew members (exclud ing captain)
- **Range**: 3 (small) to 15 (large)
- **Trade-off**: More crew = more dice, but higher wages
- **Usage**: Important for dice challenges and encounters

## Boat Types

### Small Boat (Starting)
- **Speed**: 120
- **Cargo**: 80
- **Crew**: 3
- **Cost**: 500g
- **Description**: Basic starter boat, good for learning
- **Best for**: Early game, coastal trading

### Merchant Ship (Balanced)
- **Speed**: 100
- **Cargo**: 200
- **Crew**: 6
- **Cost**: 2,000g
- **Description**: Balanced trader, most versatile
- **Best for**: Mid-game general trading

### Fast Sloop (Speed)
- **Speed**: 180
- **Cargo**: 100
- **Crew**: 4
- **Cost**: 2,500g
- **Description**: Very fast, good for luxury goods
- **Best for**: Time-sensitive trades, evasion

### Cargo Hauler (Bulk)
- **Speed**: 70
- **Cargo**: 400
- **Crew**: 8
- **Cost**: 4,000g
- **Description**: Massive cargo, very slow
- **Best for**: Bulk commodity trading (Tier 1-2 goods)

### Ironclad Trader (Durable)
- **Speed**: 80
- **Cargo**: 300
- **Crew**: 10
- **Cost**: 5,500g
- **Description**: Armored, durable, Stonehall design
- **Best for**: Dangerous routes, pirate waters
- **Special**: Reduced damage from attacks

### Warship (Combat)
- **Speed**: 110
- **Cargo**: 150
- **Crew**: 12
- **Cost**: 6,000g
- **Description**: Armed and dangerous
- **Best for**: Pirate hunting, faction wars
- **Special**: Combat bonuses, can equip weapons

## Faction-Specific Boats

### Naval Frigate (Claddish Navy)
- **Speed**: 140
- **Cargo**: 180
- **Crew**: 8
- **Cost**: 4,500g
- **Requirements**: Friendly+ with Claddish Navy
- **Special**: Naval protection, no pirate attacks near navy ports

### Arcane Vessel (Artifact Traders)
- **Speed**: 130
- **Cargo**: 150
- **Crew**: 7
- **Cost**: 5,000g
- **Requirements**: Friendly+ with Artifact Traders
- **Special**: +20% profit on Mana Crystals and Artifacts

### Reef Runner (Revtel)
- **Speed**: 150
- **Cargo**: 120
- **Crew**: 5
- **Cost**: 3,500g
- **Requirements**: Friendly+ with Revtel
- **Special**: Can navigate shallow water (shortcuts)

### Pirate Sloop (Free Captains)
- **Speed**: 200
- **Cargo**: 90
- **Crew**: 4
- **Cost**: 3,000g
- **Requirements**: Allied with Free Captains
- **Special**: +30% evasion chance, access to pirate ports

### Naga Escort (Slithereen Guard)
- **Speed**: 140
- **Cargo**: 160
- **Crew**: 6
- **Cost**: 4,800g
- **Requirements**: Allied with Slithereen Guard
- **Special**: Underwater routes, protection from sea hazards

## Boat Acquisition

### Purchasing
- **Location**: Shipyard at ports
- **Requirements**: Sufficient gold
- **Faction requirement**: Some boats need reputation
- **Trade-in**: Can sell current boat (50% value)

### Shipyard UI
```
SHIPYARD - Claddish Harbor
───────────────────────────────────
Your Current Ship:
  Merchant Ship
  Speed: 100  Cargo: 200  Crew: 6
  [Sell for 1,000g]

Available Ships:
┌─────────────────────────────────┐
│ Fast Sloop                      │
│ Speed: 180  Cargo: 100  Crew: 4│
│ Cost: 2,500g                    │
│ [Purchase]                      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Naval Frigate ⭐ EXCLUSIVE      │
│ Speed: 140  Cargo: 180  Crew: 8│
│ Cost: 4,500g                    │
│ Requires: Friendly with Navy    │
│ [Purchase]                      │
└─────────────────────────────────┘

[Exit Shipyard]
```

### Availability
- **Standard boats**: Available at most ports
- **Faction boats**: Only at faction-controlled ports
- **Stock**: Some ports have limited selection
- **Pricing**: Prices vary slightly by port

## Boat Upgrades (Optional, TBD)

Future feature: Upgrade existing boats instead of buying new:

### Possible Upgrades
- **Cargo expansion**: +50 cargo space (3,000g)
- **Speed enhancement**: +20 speed (2,500g)
- **Crew quarters**: +3 crew space (2,000g)
- **Armor plating**: Damage reduction (4,000g)
- **Weapons**: Combat bonuses (5,000g)
- **Enchantments**: Magical effects (8,000g)

### Upgrade Locations
- **Shipyards**: Basic upgrades
- **Faction shipyards**: Advanced/exclusive upgrades
- **Special ports**: Rare/unique upgrades

## Boat Maintenance (Optional, TBD)

Future feature: Boats require maintenance:

### Durability System
- **Durability**: 0-100%
- **Degrades**: Travel, combat, storms reduce durability
- **Effects**: Low durability = slower speed, less cargo capacity
- **Repair**: Pay gold at ports to restore durability

### Maintenance Costs
- **Minor repair**: 50-200g (restore 25% durability)
- **Major overhaul**: 500-1000g (restore 100% durability)
- **Frequency**: Repair every 10-20 weeks depending on usage

## Boat Visual Representation

### Ship Tokens
- **Top-down view**: See from above
- **Rotation**: Rotates to face movement direction
- **Faction colors**: Faction boats show faction colors
- **Size**: Visually distinct sizes (small vs large)

### Movement Animations
- **Smooth interpolation**: Between positions
- **Wake particles**: Trail behind boat
- **Turning**: Smooth rotation animation
- **Speed variation**: Visual speed matches stats

### Status Indicators (Optional)
- **Health bar**: If durability system implemented
- **Cargo indicator**: Visual fullness (ship sits lower in water)
- **Faction flag**: Flying faction banner

## Starting Boats (By Captain)

Each captain starts with different boat:

- **Merchant Captain**: Medium Merchant Ship
- **Naval Officer**: Fast Frigate (Claddish)
- **Mystic Trader**: Small Arcane Vessel
- **Pirate Captain**: Pirate Sloop
- **Naga Diplomat**: Amphibious Vessel (unique)
- **Dwarven Trader**: Ironclad Trader

See [GAME_PROGRESSION.md](GAME_PROGRESSION.md#captain-selection) for details.

## Boat Strategy

### Early Game
- **Keep starting boat**: Save gold for cargo
- **Upgrade when**: Cargo becomes limiting factor
- **Priority**: Cargo space > Speed

### Mid Game
- **Upgrade to specialist**: Choose speed or cargo based on strategy
- **Fast boat**: For high-value, low-volume goods (Tier 5-6)
- **Cargo boat**: For bulk trading (Tier 1-3)

### Late Game
- **Optimize**: Match boat to trading strategy
- **Multiple boats** (future): Operate fleet for maximum profit
- **Faction boats**: Get exclusive boats for special bonuses

### Boat Comparison
```
TRADE-OFFS:

Speed vs Cargo:
  Fast Sloop: 180 speed, 100 cargo = 1.8 speed per cargo
  Cargo Hauler: 70 speed, 400 cargo = 0.175 speed per cargo

Profit potential:
  Fast boat: Few goods, fast delivery, high-value
  Slow boat: Many goods, slow delivery, bulk volume
  
Best choice depends on:
  - Trade route distance
  - Goods type (bulk vs luxury)
  - Competition (need speed?)
  - Safety (need armor/evasion?)
```

## AIDEV-NOTE: Boat Data Structures

```javascript
// Boat definition
{
    boatId: "merchant_ship_01",
    name: "Merchant Ship",
    type: "merchant",
    
    stats: {
        speed: 100,        // pixels per second
        cargoCapacity: 200,
        crewCapacity: 6
    },
    
    value: 2000,  // Purchase/sell price
    
    faction: null,  // null = standard, or faction ID if exclusive
    requiresReputation: 0,  // Minimum reputation if faction-specific
    
    sprite: "assets/ships/merchant_ship.png",
    scale: 1.0,
    
    special: null  // Special abilities if any
}

// Player's current boat
{
    boatId: "merchant_ship_01",
    position: { x: 1234, y: 5678 },
    rotation: 1.57,  // radians
    
    cargo: {
        "Grain": 50,
        "Wood": 80
    },
    cargoUsed: 130,
    cargoCapacity: 200,
    
    crew: ["captain", "warrior_01", "mage_01"],
    crewCount: 3,
    crewCapacity: 6,
    
    durability: 85  // Optional, if maintenance system
}
```

## Future Enhancements

- **Ship customization**: Paint colors, flags, names
- **Ship crews**: Dedicated sailors (separate from combat crew)
- **Fleet management**: Own and operate multiple ships
- **Ship building**: Construct custom boats
- **Legendary ships**: Unique named vessels with special histories
- **Ship insurance**: Pay premium, get reimbursed if lost
- **Ship combat**: Direct ship-to-ship battles (not just dice)
- **Ship upgrades**: Modular upgrade system
- **Environmental effects**: Ships affected by weather, currents

