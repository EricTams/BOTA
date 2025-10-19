# Collision Detection System

## Overview

The collision detection system uses polygon-based island boundaries to determine whether boats are on water or land. This enables realistic navigation where boats can only sail in the ocean and must avoid islands.

## Island Detection Script

### `detect_islands.py`

Python script that analyzes the world map image and automatically generates collision data.

**Features:**
- Detects water vs land based on color analysis (teal/cyan = water)
- Finds contours of all islands
- Simplifies polygons to reduce point count
- Generates bounding boxes for efficient collision testing
- Creates visualization for debugging

**Usage:**

```bash
# Basic usage (generates collision_data.json)
python detect_islands.py

# With visualization (also creates islands_debug.png)
python detect_islands.py --visualize

# Custom paths
python detect_islands.py --input assets/map/world_map.png \
                        --output assets/map/collision_data.json \
                        --visualize \
                        --vis-output assets/map/islands_debug.png
```

**Dependencies:**

```bash
pip install opencv-python numpy Pillow
```

Or use the requirements.txt:
```bash
pip install -r requirements.txt
```

**Output:**

`collision_data.json` structure:
```json
{
  "mapWidth": 1024,
  "mapHeight": 1024,
  "islands": [
    {
      "id": 0,
      "polygon": [[x1, y1], [x2, y2], ...],
      "bounds": {
        "minX": 100,
        "maxX": 500,
        "minY": 200,
        "maxY": 600
      },
      "area": 150
    }
  ]
}
```

## JavaScript Collision Module

### `src/collision.js`

Game module that loads and uses collision data for real-time collision detection.

**API:**

```javascript
// Load collision data (call during game initialization)
await Collision.load();

// Check if point is on land (returns island ID or null)
const islandId = Collision.isOnLand(x, y);
if (islandId !== null) {
    console.log(`Hit island #${islandId}!`);
}

// Check if point is on water
if (Collision.isOnWater(x, y)) {
    console.log('Safe to sail here!');
}

// Get island data
const island = Collision.getIsland(5);
console.log('Island #5 bounds:', island.bounds);

// Find nearby islands
const nearby = Collision.getIslandsNear(x, y, radius);
console.log(`Found ${nearby.length} islands within ${radius} pixels`);

// Get distance to nearest land
const dist = Collision.distanceToLand(x, y);
console.log(`${dist} pixels from shore`);
```

## Integration with Boat Movement

**Example boat collision handling:**

```javascript
function updateBoatPosition(boat, deltaTime) {
    // Calculate new position
    const newX = boat.x + boat.vx * deltaTime;
    const newY = boat.y + boat.vy * deltaTime;
    
    // Check if new position is valid (on water)
    if (Collision.isOnWater(newX, newY)) {
        // Safe to move
        boat.x = newX;
        boat.y = newY;
    } else {
        // Collision! Stop boat
        boat.vx = 0;
        boat.vy = 0;
        console.log('Boat hit land!');
        
        // Optional: Play collision sound, show message, etc.
    }
}
```

**Keep-away distance (prevent boats from getting too close):**

```javascript
const SAFE_DISTANCE = 10; // pixels from shore

function isSafeToSail(x, y) {
    if (Collision.isOnLand(x, y) !== null) {
        return false; // On land
    }
    
    const distToLand = Collision.distanceToLand(x, y);
    return distToLand >= SAFE_DISTANCE;
}
```

## Performance Optimization

**Bounding Box Pre-test:**
The system uses bounding boxes for quick rejection before doing expensive polygon tests. This makes collision detection very fast even with many islands.

```javascript
// Fast: Check bounding box first
if (!Collision.pointInBounds(x, y, island.bounds)) {
    // Skip expensive polygon test
    continue;
}

// Slow: Only if bounding box test passes
if (Collision.pointInPolygon(x, y, island.polygon)) {
    // Hit!
}
```

## Coordinate Systems

**Important:** Collision coordinates are in map space, not screen space.

```
Screen Space (viewport):  [0, 0] to [windowWidth, windowHeight]
Map Space (world):        [0, 0] to [mapWidth, mapHeight]
```

When checking collisions, ensure boat positions are in map coordinates:

```javascript
// Boat position is already in map space
const boatMapX = boat.x;  // Map coordinate
const boatMapY = boat.y;  // Map coordinate

// Check collision
if (Collision.isOnWater(boatMapX, boatMapY)) {
    // Safe
}
```

## Debugging

**Visualize collision boundaries:**

The `islands_debug.png` file shows all detected island boundaries in red with ID numbers in yellow. Use this to verify the collision detection is working correctly.

**Console debugging:**

```javascript
// Log collision data
console.log('Collision data:', Collision.data);
console.log('Number of islands:', Collision.data.islands.length);

// Test specific coordinates
const testX = 500;
const testY = 500;
const island = Collision.isOnLand(testX, testY);
console.log(`Point (${testX}, ${testY}) is on island: ${island}`);
```

## Regenerating Collision Data

If you update the map image, regenerate collision data:

```bash
python detect_islands.py --visualize
```

This will overwrite `assets/map/collision_data.json` and `assets/map/islands_debug.png`.

## AIDEV-NOTE: Water Detection Algorithm

The script uses color-based water detection:

```python
# Teal/cyan water: high blue, moderate green, low red
teal_mask = (b > 80) & (g > 60) & (r < 100) & (b > r) & (g > r * 0.8)

# Dark blue water
dark_water = (b > r + 15) & (b > g + 5) & (b > 50)
```

If your map has different water colors, adjust these thresholds in `detect_water()` function.

## Future Enhancements

- **Port placement:** Detect good port locations (coastal areas with nearby deep water)
- **Shipping lanes:** Generate optimal navigation paths between islands
- **Depth map:** Generate shallow/deep water zones
- **Dynamic obstacles:** Support for moving hazards (ice, storms, etc.)

