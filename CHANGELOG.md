# BOTA - Battle of the Ancients: Maritime Trading
## Changelog

### Version 0.3.0 - Pathfinding & Navigation Update (October 20, 2025)

#### 🎯 Major Features

**A* Pathfinding System**
- Implemented A* algorithm for intelligent waypoint-based navigation
- Ships now automatically find optimal routes around islands
- Path smoothing with corner-cutting for natural ship movement
- Line-of-sight checks prevent ships from attempting invalid shortcuts
- Wide corridor detection ensures safe passage through narrow channels
- Debug visualization for waypoint graphs and active paths

**Enhanced Collision Detection**
- Dramatically improved island detection algorithm in `detect_islands.py`
- Automatic waypoint graph generation for navigation
- Waypoints are strategically placed near islands and in channels
- Line-of-sight connectivity between waypoints for pathfinding
- Better coastline detection and polygon simplification
- Debug rendering shows island polygons, waypoints, and connections

**Intelligent Ship Navigation**
- Click-to-move now uses A* pathfinding for route planning
- Automatic path smoothing cuts corners when safe to do so
- Ships push away from land if they get stuck
- Lookahead system finds furthest visible waypoint to skip intermediate points
- Smooth rotation as ships follow curved paths
- Better collision avoidance and land detection

#### 🛠️ Developer Tools

**Economy Analyzer**
- New standalone HTML tool for analyzing global economy balance
- Shows production vs consumption for all goods across all ports
- Tier-by-tier analysis with color-coded balance indicators
- Faction production summaries
- Helps identify oversupply/undersupply issues for game balancing
- Trading-focused metrics: ideal scarcity is 1.5x-3x consumption/production

**Enhanced Debug Tools**
- Visual debug for collision system (island polygons, bounding boxes)
- Waypoint graph visualization (nodes and connections)
- Active pathfinding route display
- Better debug panel organization
- Click position capture for waypoint placement

#### 🎵 Audio Improvements

**Music System Enhancements**
- Better focus/blur handling (pauses when window loses focus)
- Smoother fade-in/fade-out transitions between tracks
- More robust ambient sound management
- Fixed audio playback issues when switching windows
- Better cleanup of audio resources

#### 🎨 Rendering Updates

- Better debug visualization with color-coded elements
- Waypoint rendering with connection lines
- Active path highlighting in distinct color
- Improved performance for collision debug overlay
- Better handling of very large collision data

#### 🐛 Bug Fixes

- Fixed ships getting stuck on coastlines
- Fixed collision data coordinate system (world space centered at 0,0)
- Improved polygon winding order for consistent collision detection
- Better handling of narrow channels and peninsulas
- Fixed music not stopping properly when disabled
- Fixed UI overlay blocking gameplay input correctly

#### 📝 Technical Changes

- Added `src/pathfinding.js` - A* implementation
- Massive improvements to `detect_islands.py` (869 lines added)
- Enhanced `src/collision.js` with waypoint support
- Updated `src/game.js` with pathfinding integration (415 lines added)
- Improved `src/music.js` with better lifecycle management
- Updated `src/renderer.js` with debug visualization
- Regenerated collision data with waypoint graph
- Added AIDEV-NOTE markers throughout codebase for AI development context

#### 📊 Statistics

- Modified 10 files, added 2 new files
- +8,841 lines added, -3,533 lines removed
- 5,380 waypoints generated for navigation
- Collision data now includes complete waypoint graph

---

### Version 0.2.0 - Previous Release
See git history for earlier changes.


