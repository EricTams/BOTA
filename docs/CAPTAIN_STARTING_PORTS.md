# Captain Starting Ports System

## Overview
Each captain now has a designated starting port where the player's boat spawns when beginning a new game with that captain.

## Implementation

### 1. Captain Data (`src/captain_data.js`)
Added `startingPort` property to each captain:
- Property value is a port ID from `port_data.js`
- Each captain starts at a tier 1 or tier 2 port from their faction
- Example: `startingPort: "port_claddish_02" // Naval Command`

### 2. Game Logic (`src/game.js`)

#### `startGameWithFaction(factionName)`
- Now retrieves the captain for the selected faction using `getCaptainByFaction()`
- Stores captain in `this.selectedCaptain`
- Logs captain name and starting port

#### `initializePlayerBoat()`
- Checks if `this.selectedCaptain` exists and has a `startingPort`
- Looks up the port in `PortData` by port ID
- Positions boat at port coordinates with 50 pixel south offset
- Falls back to map center (0, 100) if no captain/port selected

### 3. Spawn Position
- Boat spawns at port position: `(port.x, port.y)`
- Collision system detects if position is on an island
- If on island, calculates island center from bounds
- Pushes boat outward from center until it hits water
- Maximum push distance: 100 pixels
- Boat faces south initially (rotation: Math.PI / 2)
- This ensures boat is always close to port but on navigable water

## Captain Starting Ports

| Captain | Faction | Starting Port | Port ID |
|---------|---------|---------------|---------|
| Kunkka | Claddish Navy | Naval Command | port_claddish_02 |
| Rubick | Artifact Traders | Arcane Crossroads | port_artifact_02 |
| Alchemist | Stonehall Merchants | Merchant's District | port_stonehall_02 |
| Slardar | Slithereen Guard | Guard Outpost | port_slithereen_02 |
| Naga Siren | Revtel | Reef Sanctuary | port_revtel_02 |
| Tidehunter | Free Captains | Smuggler's Cove | port_freecaptains_02 |
| Enchantress | Roseleaf Traders | Leafwhisper Trading Post | port_roseleaf_02 |
| Axe | Oglodi Raiders | Warblade Fortress | port_oglodi_02 |
| Tinker | Keen Folk Engineers | Cogwheel Port | port_keenfolk_01 |

## Rationale

### Port Selection
- Each captain starts at a significant port from their faction
- Tier 1 or tier 2 ports chosen to be accessible but not the capital
- Provides faction flavor and regional context
- Players begin in their faction's territory

### Spawn Offset (Smart Push)
- Uses collision detection to check if spawn point is on island
- Calculates island center from bounding box
- Pushes boat outward along vector from center to spawn point
- Continues pushing in 5 pixel increments until water is found
- More intelligent than preset directions - adapts to island shape
- Keeps boat as close to port as possible while ensuring it's on water
- Allows immediate navigation without collision concerns

## Testing Checklist
- [ ] Each captain spawns at correct port location
- [ ] Boat is offset 50 pixels south from port center
- [ ] Boat doesn't overlap with port icon
- [ ] Camera centers on boat at start
- [ ] Console logs show correct captain name and starting port
- [ ] Fallback to map center works if no captain selected
- [ ] All 9 captains have valid port IDs

## Future Enhancements
- Could vary offset direction based on port location (away from island)
- Could add animation of boat sailing out from port
- Could show starting port name in a UI message
- Could add faction-specific intro narrative at start

