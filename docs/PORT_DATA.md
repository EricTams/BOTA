# Port Data Structure

## Overview

All port information is centralized in `src/port_data.js`. This file contains detailed data for every port in the game world, including economic data, production capabilities, and geographic information.

## Port Data File Location

**File**: `src/port_data.js`

## Data Structure

Each port in the `PortData` array contains:

### Basic Information
- **id**: Unique identifier (e.g., `"port_radiant_coral_haven"`)
- **name**: Display name (e.g., `"Coral Haven"`)
- **faction**: Controlling faction (`"Radiant"`, `"Dire"`, or `"Neutral"`)
- **x, y**: World coordinates (centered map coordinates)
- **size**: Visual size in pixels for rendering

### Port Classification
- **tier**: Port size category
  - `"Village"` - Small settlement (pop < 1000)
  - `"Town"` - Growing settlement (pop 1000-5000)
  - `"City"` - Major settlement (pop 5000-20000)
  - `"Metropolis"` - Large city (pop > 20000)
  - `"Capital"` - Faction capital (highest tier)
- **population**: Current population count
- **specialization**: Array of production types (e.g., `["Agricultural", "Coastal"]`)

### Economic Data

#### Production
Resources this port produces:
```javascript
production: {
    "Grain": { 
        rate: 80,           // Units produced per simulation tick
        stockpile: 4000,    // Current available quantity
        baseTier: 1         // Resource tier (1-6)
    }
}
```

#### Consumption
Resources this port consumes:
```javascript
consumption: {
    "Wood": { 
        rate: 50,           // Units consumed per simulation tick
        stockpile: 800,     // Current stockpile
        baseTier: 1         // Resource tier
    }
}
```

#### Prices
Current market prices at this port:
```javascript
prices: {
    "Grain": { 
        base: 40,           // Base price (from tier)
        modifier: -0.20,    // Supply/demand modifier (-0.6 to +0.6)
        current: 32         // Actual price (base × (1 + modifier))
    }
}
```

#### Production Buildings
Facilities built at this port:
```javascript
productionBuildings: [
    { 
        type: "Farm",           // Building name
        produces: "Grain",      // Output resource
        tier: 1                 // Resource tier
    }
]
```

## Current Ports

### Revtel (1 port) - Aquatic coral reef dwellers
1. **Coral Haven** - Town (Agricultural, Coastal)
   - Location: (-210.14, 369.51)
   - Specializes in: Grain, Fish, Beer, Salt

### Artifact Traders (1 port) - Mystical commerce
1. **Golden Shore** - City (Agricultural, Luxury)
   - Location: (320.50, -180.75)
   - Specializes in: Cotton, Sugar, Cloth, Rum, Fine Clothing

### Claddish Navy (1 port) - Naval power and order
1. **Claddish Harbor** - Capital (Luxury, Mixed)
   - Location: (-450.25, -520.80)
   - Specializes in: Fine Clothing, Furniture, Potions, Artifacts

### Stonehall Merchants (2 ports) - Dwarven craftsmanship
1. **Iron Bay** - City (Industrial, Coastal)
   - Location: (580.30, 420.60)
   - Specializes in: Iron Ore, Coal, Iron Ingots, Coke, Weapons

2. **Forge Haven** - Town (Industrial, Mixed)
   - Location: (-680.45, 250.90)
   - Specializes in: Wood, Coal, Planks, Weapons, Armor

### Oglodi Raiders (1 port) - Warrior culture
1. **Bloodstone Keep** - Capital (Industrial, Military)
   - Location: (150.75, -670.25)
   - Specializes in: Weapons, Armor, Magic Items, Enchanted Armor

### Roseleaf Traders (1 port) - Elven merchants
1. **Greenleaf Port** - City (Mixed, Trading Hub)
   - Location: (-50.20, -100.40)
   - Specializes in: Fish, Cloth, Pottery, Furniture

### Slithereen Guard (1 port) - Aquatic Naga warriors
1. **Crystal Cove** - Town (Magical, Coastal)
   - Location: (420.80, 180.30)
   - Specializes in: Mana Crystals, Herbs, Flux, Potions, Elixirs

### Free Captains (1 port) - Pirates
1. **Rogue's Haven** - City (Trading Hub, Mixed)
   - Location: (-280.60, 90.15)
   - Specializes in: Beer, Wine, Rum, Pottery

## Helper Functions

The file includes three utility functions:

### getPortById(portId)
Retrieves a specific port by its unique ID.
```javascript
const port = getPortById("port_radiant_coral_haven");
```

### getPortsByFaction(faction)
Returns all ports controlled by a specific faction.
```javascript
const radiantPorts = getPortsByFaction("Radiant");
```

### getPortAtPosition(worldX, worldY, maxDistance)
Finds a port near a specific world position (useful for proximity detection).
```javascript
const nearbyPort = getPortAtPosition(playerX, playerY, 50);
```

## Usage in Game Code

The port data is automatically loaded in `game.js`:

```javascript
// In game.js - initializePorts()
initializePorts() {
    this.ports = PortData;
    console.log(`Initialized ${this.ports.length} port(s)`);
}
```

The renderer accesses ports through the game state:
```javascript
// In renderer.js
renderGameWorld(cameraX, cameraY, cameraZoom, debug, playerBoat, targetMarker, ports)
```

## Adding New Ports

To add a new port:

1. Open `src/port_data.js`
2. Add a new port object to the `PortData` array
3. Follow the existing structure exactly
4. Ensure all required fields are present
5. Balance production/consumption to create trade opportunities
6. Set prices based on supply (surplus = negative modifier, shortage = positive modifier)

## Economic Balance

### Price Modifiers
- **Surplus** (port produces): Negative modifier (-0.10 to -0.35)
- **Shortage** (port consumes): Positive modifier (+0.15 to +0.60)
- **Balanced**: Near zero modifier (-0.05 to +0.05)

### Production vs Consumption
- Ports should produce some resources and consume others
- This creates natural trade routes (buy where surplus, sell where shortage)
- Higher tier ports consume more luxury goods
- Lower tier ports focus on basic resources

### Faction Themes
- **Claddish Navy**: Naval power, order, military fortifications (navy blue/white/gold)
- **Artifact Traders**: Arcane commerce, mysticism, magical goods (purple/gold/blue)
- **Stonehall Merchants**: Dwarven craftsmanship, metalwork, industrial (gray/copper/brown)
- **Slithereen Guard**: Aquatic Naga warriors, underwater resources (teal/silver)
- **Revtel**: Coral reef dwellers, peaceful traders, tropical goods (coral pink/turquoise)
- **Free Captains**: Pirates, black market, smuggling (black/red)
- **Roseleaf Traders**: Elven merchants, nature goods (green/gold)
- **Oglodi Raiders**: Warrior culture, brutal, conquest-focused (blood red/bone white)

## Future Enhancements

Potential additions to port data:
- Port facilities and upgrades
- Reputation requirements for certain goods
- Special events and quests per port
- Port defenses and military strength
- Dynamic population growth
- Seasonal production variations

## AIDEV-NOTE

When working with port data:
- Never hardcode port information in other files
- Always reference `PortData` from `port_data.js`
- Use helper functions for common queries
- Keep economic balance in mind when modifying prices
- Ensure production chains make sense (outputs of one port = inputs of another)

