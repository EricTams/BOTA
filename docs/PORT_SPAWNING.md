# Port Spawning System

## Overview

Ports are now automatically spawned from the centralized `port_data.js` file. All 9 ports will appear on the map when the game starts.

## How It Works

### 1. Data Loading
When the game starts:
```javascript
// In game.js - startGame()
this.initializePorts();  // Called during game initialization

// In game.js - initializePorts()
this.ports = PortData;   // Loads all ports from port_data.js
```

### 2. Rendering
Ports are rendered every frame:
```javascript
// In renderer.js - renderGameWorld()
ports.forEach(port => this.drawPort(port, ctx));
```

### 3. Visual Representation

Ports are drawn as colored circles based on faction:

**Claddish Navy** (Naval power)
- Main color: Navy Blue (#000080)
- Accent color: White (#FFFFFF)
- Style: Military, orderly appearance

**Artifact Traders** (Mystical commerce)
- Main color: Purple (#9370DB)
- Accent color: Gold (#FFD700)
- Style: Arcane, mystical appearance

**Stonehall Merchants** (Dwarven craftsmen)
- Main color: Gray Stone (#708090)
- Accent color: Copper (#B87333)
- Style: Sturdy, industrial appearance

**Slithereen Guard** (Aquatic Naga)
- Main color: Teal (#008080)
- Accent color: Silver (#C0C0C0)
- Style: Aquatic, warrior appearance

**Revtel** (Coral reef dwellers)
- Main color: Coral Pink (#FF7F50)
- Accent color: Turquoise (#40E0D0)
- Style: Tropical, vibrant appearance

**Free Captains** (Pirates)
- Main color: Black (#000000)
- Accent color: Red (#DC143C)
- Style: Dark, lawless appearance

**Roseleaf Traders** (Elven merchants)
- Main color: Forest Green (#228B22)
- Accent color: Gold (#FFD700)
- Style: Natural, harmonious appearance

**Oglodi Raiders** (Warriors)
- Main color: Blood Red (#8B0000)
- Accent color: Bone White (#F5F5DC)
- Style: Brutal, intimidating appearance

Each port displays:
- Two-tone circle (outer ring in accent color, inner circle in main color)
- Black outline for visibility
- Port name displayed below the circle
- Size varies by port tier (30-50 pixels)

## Current Ports on Map

### Revtel (Coral Pink/Turquoise)
1. **Coral Haven** - Town at (-210.14, 369.51), size 30

### Artifact Traders (Purple/Gold)
1. **Golden Shore** - City at (320.50, -180.75), size 40

### Claddish Navy (Navy Blue/White)
1. **Claddish Harbor** - Capital at (-450.25, -520.80), size 50

### Stonehall Merchants (Gray/Copper)
1. **Iron Bay** - City at (580.30, 420.60), size 35
2. **Forge Haven** - Town at (-680.45, 250.90), size 32

### Oglodi Raiders (Blood Red/Bone White)
1. **Bloodstone Keep** - Capital at (150.75, -670.25), size 50

### Roseleaf Traders (Green/Gold)
1. **Greenleaf Port** - City at (-50.20, -100.40), size 38

### Slithereen Guard (Teal/Silver)
1. **Crystal Cove** - Town at (420.80, 180.30), size 34

### Free Captains (Black/Red)
1. **Rogue's Haven** - City at (-280.60, 90.15), size 36

## Port Sizes

Port size reflects their tier and importance:
- **Towns**: 30-34 pixels
- **Cities**: 35-40 pixels
- **Capitals**: 50 pixels

Larger ports are more visible on the map and indicate major trading hubs.

## Testing Port Spawning

To verify all ports are spawning correctly:

1. **Start the game** - Click "New Game" from main menu
2. **Check console** - Should see: `Initialized 9 port(s)`
3. **Navigate the map** - Use WASD to pan around
4. **Look for colored circles** - All 9 ports should be visible at their locations
5. **Verify factions**:
   - Navy blue/white = Claddish Navy
   - Purple/gold = Artifact Traders
   - Gray/copper = Stonehall Merchants
   - Teal/silver = Slithereen Guard
   - Coral pink/turquoise = Revtel
   - Black/red = Free Captains
   - Green/gold = Roseleaf Traders
   - Blood red/bone white = Oglodi Raiders

## Port Coordinates

All coordinates are in world space (centered map coordinates):
- Center of map: (0, 0)
- Negative X: West side of map
- Positive X: East side of map
- Negative Y: North side of map
- Positive Y: South side of map

## Adding New Ports

To add more ports to the spawn system:

1. Open `src/port_data.js`
2. Add a new port object to the `PortData` array
3. Set appropriate x, y coordinates (use debug mode to find positions)
4. Choose faction: "Claddish Navy", "Artifact Traders", "Stonehall Merchants", "Revtel", "Free Captains", "Slithereen Guard", "Roseleaf Traders", "Oglodi Raiders", or "Keen Folk Engineers"
5. Set size based on tier (30 for towns, 35-40 for cities, 50 for capitals)
6. Fill in economic data (production, consumption, prices)
7. Save file - port will spawn automatically on next game start

## Future Enhancements

Planned improvements for port rendering:
- Custom sprite assets for each faction (replace colored circles)
- Different visual styles for different port tiers (villages vs capitals)
- Animated port elements (smoke from chimneys, ships in harbor)
- Port names only visible when zoomed in (scale with camera zoom)
- Port selection highlight on mouseover
- Port info tooltip on hover

## AIDEV-NOTE

Port rendering technical details:
- Ports are drawn in world space (affected by camera transform)
- Port positions are relative to map center (0, 0)
- Port size is in world pixels, scaled by camera zoom
- Port names are always drawn (future: add zoom threshold)
- Drawing order: ports → markers → boats (so boat appears on top)

