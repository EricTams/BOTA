# Editor Mode

## Overview

In-game map editor for designing and modifying the game world. Paint water boundaries, place ports, position encounters, and save all data to JSON files.

## Activating Editor Mode

### Toggle Editor
- **Keyboard shortcut**: Press `E` key (or dev console command)
- **Editor UI appears**: Tools and panels overlay the map
- **Game paused**: Simulation stops during editing
- **Exit**: Press `E` again to return to game

### Editor UI Layout
```
┌─────────────────────────────────────────┐
│  [Tools] [File] [View]           [Exit] │
├─────────────────────────────────────────┤
│                                          │
│        MAP CANVAS (with overlays)       │
│                                          │
├─────────────────────────────────────────┤
│  Coordinates: 1234, 5678    Zoom: 100%  │
│  [Tool Options Panel]                    │
└─────────────────────────────────────────┘
```

## Water Boundary Painting

### Purpose
Define navigable water vs land collision areas.

### Paint Tool
- **Brush mode**: Click and drag to paint
- **Brush size**: Adjustable (10px to 100px radius)
- **Water mode**: Mark area as navigable water (blue)
- **Land mode**: Mark area as blocked land (red)
- **Erase mode**: Clear painted areas

### Visual Feedback
- **Overlay layer**: Semi-transparent colored overlay
  - Blue = Water (navigable)
  - Red = Land (blocked)
- **Toggle visibility**: Show/hide collision overlay
- **Opacity slider**: Adjust overlay transparency (0-100%)

### Implementation Options

**Option 1: Collision Image**
- Paint directly to separate collision map image
- Same dimensions as world map
- Sample pixel color for collision detection
- Export as PNG file

**Option 2: Polygon Data**
- Define water/land as polygon shapes
- More efficient for simple maps
- Export as JSON with polygon coordinates
- Use point-in-polygon algorithm for collision

### Collision Map Export
Save to: `map-collision.json` or `map-collision.png`

**JSON Format** (if using polygons):
```json
{
    "waterRegions": [
        {
            "polygon": [
                [100, 100],
                [200, 100],
                [200, 200],
                [100, 200]
            ]
        }
    ],
    "landRegions": [...]
}
```

**Image Format** (if using collision map):
- Blue channel > 128 = Water
- Blue channel <= 128 = Land
- Simple and fast pixel sampling

## Port Placement

### Port Tool
- **Click to place**: Add new port at cursor position
- **Drag to move**: Reposition existing ports
- **Delete**: Select port, press Delete key
- **Properties panel**: Edit port details

### Port Properties

**Basic Info**:
- **Port ID**: Unique identifier (auto-generated or custom)
- **Port name**: Display name (e.g., "Claddish Harbor")
- **Position**: X, Y coordinates on map

**Faction & Economy**:
- **Controlling faction**: Dropdown selector
- **Port type**: Agricultural, Industrial, Coastal, Luxury, Mixed
- **Specialization**: Which resources produced/consumed
- **Population**: Affects production/consumption rates
- **Wealth tier**: Small, Medium, Large, Metropolis, Capital

**Visual**:
- **Icon**: Port icon image (faction-themed)
- **Size**: Visual scale (small/medium/large port)
- **Rotation**: Icon rotation (for docks facing specific direction)

### Port Properties Panel
```
PORT PROPERTIES
───────────────────────────────────
ID: port_claddish_01
Name: [Claddish Harbor____]
Position: (1234, 5678)

Faction: [Claddish Navy ▼]
Type: [Industrial ▼]
Population: [25000_______]
Wealth: [Metropolis ▼]

Production:
  [+Add Resource]
  - Weapons (rate: 10)  [Edit] [Remove]
  - Iron Ingots (rate: 15)  [Edit] [Remove]

Consumption:
  [+Add Resource]
  - Grain (rate: 20)  [Edit] [Remove]
  - Fish (rate: 15)  [Edit] [Remove]

[Save] [Cancel] [Delete Port]
```

### Ports Export
Save to: `ports.json`

```json
{
    "ports": [
        {
            "portId": "port_claddish_01",
            "name": "Claddish Harbor",
            "position": { "x": 1234, "y": 5678 },
            "faction": "CladdishNavy",
            "type": "industrial",
            "population": 25000,
            "wealth": "metropolis",
            "production": {
                "Weapons": { "rate": 10 },
                "Iron Ingots": { "rate": 15 }
            },
            "consumption": {
                "Grain": { "rate": 20 },
                "Fish": { "rate": 15 },
                "Coal": { "rate": 12 }
            },
            "icon": "assets/ports/claddish_port.png",
            "iconScale": 1.0
        }
    ]
}
```

## Object Placement

### Object Types
- **Encounters**: Random events, challenges
- **Treasure**: Loot locations
- **Hazards**: Storms, rocks, dangerous areas
- **NPCs**: Special characters or boats
- **Quest markers**: Story locations

### Object Tool
- **Select type**: Choose object type from list
- **Click to place**: Add object at cursor
- **Properties**: Edit object-specific properties
- **Visual marker**: Different icon for each type

### Object Properties
Varies by type, but generally:
- **Object ID**: Unique identifier
- **Position**: X, Y coordinates
- **Type**: Encounter, treasure, hazard, etc.
- **Trigger radius**: How close player must be
- **One-time or repeating**: Can it trigger multiple times?
- **Custom data**: Type-specific properties (e.g., encounter difficulty)

### Objects Export
Save to: `objects.json`

```json
{
    "encounters": [
        {
            "objectId": "encounter_storm_01",
            "type": "storm",
            "position": { "x": 2000, "y": 3000 },
            "triggerRadius": 200,
            "repeating": true,
            "difficulty": "medium",
            "rewards": { "gold": 100, "reputation": 5 }
        }
    ],
    "treasures": [...],
    "hazards": [...]
}
```

## Save/Load System

### Save Menu
```
SAVE / LOAD
───────────────────────────────────
Current Files:
  - map-collision.json ✓
  - ports.json ✓
  - objects.json ✓

[Save All]
[Save Collision Only]
[Save Ports Only]
[Save Objects Only]

[Load All]
[Import...]

[Export for Production]
```

### File Locations
Save to project directory:
```
BOTA/
├── data/
│   ├── map-collision.json
│   ├── ports.json
│   └── objects.json
```

### Auto-save
- **Periodic auto-save**: Every 5 minutes
- **Before exit**: Prompt to save if changes
- **Backup**: Keep previous version as `.bak` file

## Visual Tools

### Grid Overlay
- **Toggle grid**: Show/hide alignment grid
- **Grid size**: Adjustable (50px, 100px, 200px, custom)
- **Snap to grid**: Objects align to grid points
- **Grid color**: Customizable

### Coordinate Display
- **Mouse position**: Show cursor X, Y in real-time
- **Selected object**: Show object position
- **Distance tool**: Measure distance between points

### Zoom Controls
- **Zoom in/out**: Mouse wheel or buttons
- **Zoom levels**: 25%, 50%, 75%, 100%, 150%, 200%
- **Fit to view**: Auto-zoom to see entire map
- **Reset zoom**: Return to 100%

### Layer System
- **Map layer**: Background image (always visible)
- **Collision layer**: Water/land overlay (toggleable)
- **Ports layer**: Port markers (toggleable)
- **Objects layer**: Encounters, hazards, etc. (toggleable)
- **Grid layer**: Alignment grid (toggleable)

## Undo/Redo

### History System
- **Undo**: Ctrl+Z (revert last action)
- **Redo**: Ctrl+Y (redo undone action)
- **History limit**: 50 actions
- **Actions tracked**:
  - Port placement/movement/deletion
  - Object placement/movement/deletion
  - Collision painting (by stroke)
  - Property edits

### History Panel (Optional)
```
HISTORY
───────────────────────────────────
▶ Moved port "Claddish Harbor"
▶ Added object "Storm Encounter"
▶ Painted water boundary
▶ Created port "Stonehall Docks"
  ...

[Clear History]
```

## Validation

### Error Checking
Before saving, validate:
- **No overlapping ports**: Ports too close together
- **Ports in water**: Ports must be on water, not land
- **Valid IDs**: No duplicate IDs
- **Required fields**: All properties filled in
- **Resource references**: All resources exist in game

### Validation Report
```
VALIDATION REPORT
───────────────────────────────────
✓ 15 ports validated
✓ 23 objects validated
✓ Collision map complete
⚠ Warning: Port "port_05" very close to "port_06"
✗ Error: Port "port_12" on land (not water)

[Fix Automatically] [Ignore] [Cancel Save]
```

## Testing Mode

### Play Test
- **Test from editor**: Click "Test" button
- **Spawn at location**: Choose starting position
- **Quick test**: Test map without full game setup
- **Return to editor**: Exit test, return to editing

### Debug Overlays
- **Show collision**: See collision boundaries in game
- **Show object triggers**: See trigger radii
- **Performance stats**: FPS, object count, etc.

## AIDEV-NOTE: Editor Implementation

```javascript
// Editor state
{
    active: true,
    currentTool: "port_placement",
    selectedObject: null,
    
    clipboard: null,  // For copy/paste
    history: [],      // Undo/redo
    historyIndex: 0,
    
    layers: {
        collision: { visible: true, opacity: 0.5 },
        ports: { visible: true },
        objects: { visible: true },
        grid: { visible: false, size: 100 }
    },
    
    collisionMap: ImageData,  // Collision data
    ports: [...],             // Port objects
    objects: [...]            // Other objects
}

// Editor tools
const TOOLS = {
    SELECT: "select",
    PAINT_WATER: "paint_water",
    PAINT_LAND: "paint_land",
    PORT_PLACE: "port_placement",
    OBJECT_PLACE: "object_placement",
    MEASURE: "measure_distance"
};
```

## Keyboard Shortcuts

- **E**: Toggle editor mode
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Ctrl+S**: Save all
- **Delete**: Delete selected object
- **Ctrl+C**: Copy selected object
- **Ctrl+V**: Paste object
- **Space**: Pan/drag map
- **+/-**: Zoom in/out
- **G**: Toggle grid
- **H**: Toggle collision overlay
- **Escape**: Deselect / Cancel

## Future Enhancements (TBD)

- Terrain painting (shallow water, deep water, reefs)
- Path editor (define trade routes visually)
- Event scripting (custom encounter logic)
- Tileset editor (place decorative elements)
- Lighting editor (ambient colors, fog)
- Sound zone editor (ambient audio regions)
- Prefab system (save/load port templates)
- Collaborative editing (multi-user)
- Version control integration (Git diff for JSON)

