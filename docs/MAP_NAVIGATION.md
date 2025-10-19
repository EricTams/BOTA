# Map Navigation System

## Overview

The map is a single large image (8192x8192 or maximum resolution) rendered on HTML5 Canvas with a painterly shader for stylized visuals. Players navigate their boat freely across water, avoiding land collision.

## Map Image

- **Single detailed image**: One large background image for entire world
- **Maximum resolution**: 8192x8192 pixels (or largest supported)
- **Painterly shader**: WebGL shader for stylized, artistic look
- **Maritime theme**: Ocean, islands, coastlines, DOTA-themed aesthetics

## Collision Detection

### Water vs Land
- **Collision map**: Separate image or data structure defining navigable areas
- **Color-based detection**: Sample pixel color to determine if location is water/land
- **Polygon data**: Alternative approach using JSON polygon definitions
- **Real-time checking**: Validate boat position every frame

### Implementation Options

**Option 1: Collision Map Image**
```javascript
// Sample collision map at boat position
const pixel = collisionCtx.getImageData(boatX, boatY, 1, 1).data;
const isWater = (pixel[2] > 128); // Blue channel indicates water
```

**Option 2: Polygon-based**
```javascript
// Check if point is inside water polygons
const isWater = waterPolygons.some(poly => pointInPolygon(boatPos, poly));
```

## Camera System

### Viewport Management
- **Follow player boat**: Camera centers on player's position
- **Smooth scrolling**: Interpolate camera position for smooth movement
- **Zoom levels**: Multiple zoom levels (100%, 75%, 50%)
- **Map bounds**: Clamp camera to keep map edges in view

### Camera Math
```javascript
// Center camera on boat
const cameraX = boatX - (canvasWidth / 2);
const cameraY = boatY - (canvasHeight / 2);

// Clamp to map bounds
const clampedX = Math.max(0, Math.min(cameraX, mapWidth - canvasWidth));
const clampedY = Math.max(0, Math.min(cameraY, mapHeight - canvasHeight));
```

## Player Boat Movement

### Movement Physics
- **Position**: Pixel-level (x, y) coordinates
- **Velocity**: Speed and direction
- **Acceleration**: Smooth start/stop
- **Rotation**: Canvas transform for boat direction
- **Speed stat**: Each boat has max speed value

### Input Handling
- **WASD / Arrow keys**: 8-directional movement
- **Mouse click**: Click to move toward target (optional)
- **Touch support**: Mobile-friendly controls

### Movement Code Structure
```javascript
// Update boat velocity based on input
function updateBoatVelocity(boat, input, deltaTime) {
    // Apply acceleration toward target velocity
    // Respect boat's max speed
    // Smooth turning
}

// Update boat position
function updateBoatPosition(boat, deltaTime) {
    // Apply velocity to position
    // Check collision
    // Clamp to water areas
}
```

## Rendering Pipeline

### Render Order
1. Draw map image (background)
2. Draw port icons and markers
3. Draw AI boats
4. Draw player boat
5. Draw particles (wake trails, etc.)
6. Draw UI overlays (HUD)

### Painterly Shader (Optional)
```glsl
// Fragment shader for painterly effect
// Apply brush stroke patterns
// Color adjustment for stylized look
// Edge detection for outline effect
```

## Performance Considerations

- **Large map**: Only render visible portion (viewport culling)
- **Collision optimization**: Use spatial partitioning for collision checks
- **Asset loading**: Load high-res map progressively
- **Canvas size**: Match viewport size, not full map size

## Editor Mode Integration

In editor mode, the map system provides:
- **Water boundary painting**: Click and drag to mark navigable areas
- **Visual feedback**: Overlay showing water/land distinction
- **Save collision data**: Export to JSON or image file
- **Port placement**: Click to place port markers on map

## AIDEV-NOTE: Canvas-Only Rendering

CRITICAL: Map, boats, and all game objects are rendered on Canvas ONLY.
- NEVER create DOM elements for game objects
- Use Canvas transforms for rotation
- All positions are in map coordinates, not screen coordinates
- Camera offset is applied during rendering, not to game state

## Data Structures

### Boat Position
```javascript
{
    x: 4096,        // Map X coordinate (pixels)
    y: 2048,        // Map Y coordinate (pixels)
    angle: Math.PI, // Rotation in radians
    vx: 0,          // Velocity X
    vy: 0,          // Velocity Y
    speed: 100      // Max speed (pixels/second)
}
```

### Camera State
```javascript
{
    x: 3596,        // Camera X (top-left of viewport)
    y: 1548,        // Camera Y (top-left of viewport)
    zoom: 1.0,      // Zoom level (1.0 = 100%)
    targetX: 4096,  // Follow target X
    targetY: 2048   // Follow target Y
}
```

## Future Enhancements (TBD)

- Mini-map overlay
- Fog of war (unexplored areas)
- Weather effects (storms, fog)
- Day/night cycle
- Parallax water effects

