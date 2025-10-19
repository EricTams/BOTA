# Resources and Economy

## Overview

A 6-tier resource system inspired by Port Royale 4, themed for the DOTA universe. Resources are processed through production chains, with prices determined by supply and demand.

## 6-Tier Pricing System

Each tier costs ~50% more per unit than the previous tier:
- **Tier 1**: 40g per unit (Basic raw materials)
- **Tier 2**: 60g per unit (Valuable raw materials)
- **Tier 3**: 90g per unit (Processed Tier 1)
- **Tier 4**: 135g per unit (Processed Tier 2)
- **Tier 5**: 200g per unit (Combined goods)
- **Tier 6**: 300g per unit (Luxury combinations)

## Resource List

### Tier 1 - Basic Raw Materials (40g/unit)
**Cheapest bulk goods, high volume trade**

- Grain
- Corn
- Fish
- Wood
- Clay
- Salt
- Herbs

### Tier 2 - Valuable Raw Materials (60g/unit)
**More specialized raw goods**

- Cotton
- Sugar
- Meat
- Fruit
- Coal
- Iron Ore
- Mana Crystals (magical essence)

### Tier 3 - Processed Tier 1 (90g/unit)
**Single-ingredient processing**

- **Beer** (Grain) - Comfort good
- **Dye** (Herbs) - Textile component
- **Pottery** (Clay) - Containers and building material
- **Flux** (Salt) - Alchemical catalyst
- **Planks** (Wood) - Building material

### Tier 4 - Processed Tier 2 (135g/unit)
**Single-ingredient refinement**

- **Cloth** (Cotton) - Textile for armor and clothing
- **Rum** (Sugar) - Luxury alcohol
- **Wine** (Fruit) - Fermented beverage
- **Iron Ingots** (Iron Ore) - Refined metal
- **Coke** (Coal) - High-grade fuel

### Tier 5 - Combined Goods (200g/unit)
**Multi-ingredient crafted items**

- **Weapons** (Iron Ingots + Coke) - Swords, axes, bows
- **Armor** (Iron Ingots + Cloth) - Protection gear
- **Furniture** (Planks + Iron Ingots) - Furnishings
- **Potions** (Wine + Herbs) - Healing/buff consumables
- **Fine Clothing** (Dye + Cloth) - Luxury garments

### Tier 6 - Luxury Combinations (300g/unit)
**Highest value, lowest volume**

- **Magic Items** (Weapons + Flux) - Enchanted gear
- **Enchanted Armor** (Armor + Mana Crystals) - Magical protection
- **Artifacts** (Fine Clothing + Mana Crystals) - Divine items
- **Elixirs** (Potions + Flux) - Powerful consumables

## Production Chains

### Chain Rules
- **Tier 3**: Process one Tier 1 resource
- **Tier 4**: Process one Tier 2 resource
- **Tier 5**: Combine Tier 3 + Tier 4, or Tier 3 + Tier 3, or special
- **Tier 6**: Combine Tier 5 + special resources (Mana Crystals, Flux)

### Example Chains

**Grain → Beer → (consumed)**
- Tier 1 → Tier 3 → Consumption sink

**Cotton → Cloth → Armor → Enchanted Armor**
- Tier 2 → Tier 4 → Tier 5 → Tier 6

**Wood → Planks → Furniture → (consumed)**
- Tier 1 → Tier 3 → Tier 5 → Consumption sink

**Iron Ore + Coal → Iron Ingots + Coke → Weapons → Magic Items**
- Tier 2 + Tier 2 → Tier 4 + Tier 4 → Tier 5 → Tier 6

## Economic Simulation

### City Production
Each city produces certain resources based on:
- **Location**: Coastal cities produce Fish, forest cities produce Wood
- **Faction**: Radiant cities favor agricultural goods, Dire favors industrial
- **Specialization**: Each city has 1-3 primary production types
- **Production rate**: Units produced per simulation tick

### City Consumption
Cities consume resources based on:
- **Population**: Larger cities consume more
- **Industry**: Production facilities consume raw materials
- **Wealth**: Richer cities consume luxury goods
- **Tier progression**: Small cities consume Tier 1-3, large cities consume up to Tier 6

### Price Dynamics
Prices fluctuate based on supply and demand:

**Supply Factors**:
- Local production rate
- Recent imports by traders
- City stockpile levels

**Demand Factors**:
- Local consumption rate
- Production facility needs
- Recent exports

**Price Formula**:
```
Current Price = Base Price × (1 + SupplyDemandModifier)

SupplyDemandModifier range: -0.6 to +0.6 (±60%)

Note: Reputation does NOT affect prices. This encourages players to explore
all ports and find the best supply/demand opportunities regardless of faction.
```

### Trade Routes
Profitable trade routes emerge naturally:
- **Price differences**: Buy from surplus cities, sell to deficit cities
- **Distance vs profit**: Balance travel time against profit margins
- **Competition**: AI traders also exploit price differences
- **Equilibrium**: Prices tend toward balance as goods flow

## Consumption Sinks

Cities consume goods, creating constant demand:

### Food Consumption
All cities consume food based on population:
- **Grain**: Staple food, always in demand
- **Corn**: Secondary food source
- **Fish**: Coastal cities consume heavily
- **Meat**: High-value protein, cities prefer when available

### Comfort Goods
Cities consume for happiness/morale:
- **Beer**: Common comfort good, all cities
- **Rum**: Luxury alcohol, wealthier cities
- **Wine**: Refined beverage, mid-to-large cities

### Building Materials
Growing cities consume for construction:
- **Wood**: Basic building material
- **Planks**: Processed lumber for quality buildings
- **Clay**: Raw material for bricks and pottery
- **Pottery**: Finished containers and tiles

### Luxury Consumption
Large/wealthy cities consume:
- **Fine Clothing**: Fashion for elites
- **Furniture**: Furnishings for wealthy homes
- **Potions**: Healing and enhancement

### Elite Consumption
Capital cities and major hubs consume:
- **Magic Items**: Rare enchanted gear
- **Artifacts**: Divine ceremonial items
- **Enchanted Armor**: Magical protection
- **Elixirs**: Powerful consumables for heroes

### Industrial Consumption
Production cities consume for manufacturing:
- **Coal**: Fuel for forges and smelters
- **Coke**: High-grade fuel for advanced production
- **Iron Ore**: Raw material for metalworking

## City Growth & Specialization

### Growth Mechanics
- **Well-supplied cities grow**: Adequate food and materials → population increase
- **Shortages slow growth**: Missing essentials → stagnation
- **Surpluses enable expansion**: Excess resources → faster growth

### City Tiers
As cities grow, they unlock higher-tier production and consumption:
1. **Small village** (Pop < 1000): Tier 1-2 production, Tier 1-3 consumption
2. **Town** (Pop 1000-5000): Tier 1-3 production, Tier 1-4 consumption
3. **City** (Pop 5000-20000): Tier 1-4 production, Tier 1-5 consumption
4. **Metropolis** (Pop > 20000): Tier 1-5 production, All tier consumption
5. **Capital**: Can produce/consume all tiers, including Tier 6

### Specialization
Each city focuses on certain production types:
- **Agricultural**: Grain, Corn, Cotton, Herbs
- **Industrial**: Iron Ore, Coal, Weapons, Armor
- **Coastal**: Fish, Salt, maritime goods
- **Luxury**: Fine goods, high-tier items
- **Mixed**: Balanced production

## AIDEV-NOTE: Economic Data Structures

```javascript
// City economic data
{
    cityId: "city_radiant_capital",
    faction: "Radiant",
    population: 25000,
    tier: "Capital",
    specialization: ["Agricultural", "Luxury"],
    
    production: {
        "Grain": { rate: 100, stockpile: 5000 },
        "Beer": { rate: 50, stockpile: 2000 },
        "Fine Clothing": { rate: 10, stockpile: 100 }
    },
    
    consumption: {
        "Fish": { rate: 50, stockpile: 1000 },
        "Wood": { rate: 30, stockpile: 500 },
        "Rum": { rate: 20, stockpile: 300 }
    },
    
    prices: {
        "Grain": { 
            base: 40, 
            current: 32,  // -20% due to surplus
            trend: "falling" 
        },
        "Fish": {
            base: 40,
            current: 56,  // +40% due to shortage
            trend: "rising"
        }
    }
}
```

## Profit Strategies

### Basic Trading
- **Buy low, sell high**: Find price differences between cities
- **Volume trading**: Tier 1-2 goods, high volume, low margins
- **Luxury trading**: Tier 5-6 goods, low volume, high margins

### Production Investment
- **Build facilities**: Invest in production at friendly ports
- **Vertical integration**: Control entire production chain
- **Passive income**: Facilities generate goods over time

### Arbitrage
- **Price watching**: Track prices across multiple cities
- **Route planning**: Optimize multi-city trading loops
- **Timing**: Buy when prices dip, sell when they spike

### Faction Leverage
- **Build reputation**: Get better prices at faction ports
- **Exclusive access**: Unlock rare goods and boats
- **Political advantage**: Manipulate faction relations for profit

## Future Enhancements (TBD)

- Random events affecting prices (storms, wars, festivals)
- Seasonal variations (harvest seasons, winter shortages)
- Trade embargoes between hostile factions
- Market manipulation (intentional supply/demand shifts)
- Commodity futures/contracts

