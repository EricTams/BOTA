// BOTA - Pathfinding System
// AIDEV-NOTE: Implements A* algorithm for waypoint-based navigation
// Finds shortest path from boat position to target position using waypoint graph

const Pathfinding = {
    // AIDEV-NOTE: Find path from start position to end position
    // Returns array of waypoint IDs to follow, or null if no path found
    // Uses A* with Euclidean distance heuristic
    findPath(startX, startY, endX, endY, collision) {
        const waypoints = collision.getAllWaypoints();
        
        if (!waypoints || waypoints.length === 0) {
            console.warn('No waypoints available for pathfinding');
            return null;
        }
        
        // Find nearest waypoint to start and end positions
        const startWP = this.findNearestWaypoint(startX, startY, waypoints, collision);
        const endWP = this.findNearestWaypoint(endX, endY, waypoints, collision);
        
        if (!startWP || !endWP) {
            console.warn('Could not find waypoints near start/end positions');
            return null;
        }
        
        // If start and end are same waypoint, no path needed
        if (startWP.id === endWP.id) {
            return [];
        }
        
        // Run A* algorithm
        const path = this.astar(startWP.id, endWP.id, waypoints);
        
        return path;
    },
    
    // AIDEV-NOTE: Find nearest waypoint to given position
    // Only considers waypoints that have line-of-sight to position
    findNearestWaypoint(x, y, waypoints, collision) {
        let nearest = null;
        let nearestDist = Infinity;
        
        for (const wp of waypoints) {
            // Check if we have line of sight to this waypoint
            if (!this.hasLineOfSight(x, y, wp.x, wp.y, collision)) {
                continue;
            }
            
            const dist = Math.hypot(wp.x - x, wp.y - y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = wp;
            }
        }
        
        return nearest;
    },
    
    // AIDEV-NOTE: Check if there's a clear line of sight between two points
    // Samples along line at 10-pixel intervals (centerline only)
    // Used for A* pathfinding - allows narrow passages
    hasLineOfSight(x1, y1, x2, y2, collision) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 1) return true;
        
        // Sample every 10 pixels
        const numSamples = Math.ceil(distance / 10);
        
        for (let i = 0; i <= numSamples; i++) {
            const t = i / numSamples;
            const testX = x1 + dx * t;
            const testY = y1 + dy * t;
            
            // Check if this point is on land
            if (collision.isOnLand(testX, testY) !== null) {
                return false;
            }
        }
        
        return true;
    },
    
    // AIDEV-NOTE: Check if there's a safe corridor of water between two points
    // Used for path smoothing/corner-cutting - ensures boat has safe clearance
    // Checks left and right edges (±2 pixels) along the path
    hasWideCorridor(x1, y1, x2, y2, collision, corridorWidth = 2, storeDebugPoints = false) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 1) return true;
        
        // Calculate perpendicular direction for corridor checking
        const perpX = -dy / distance;  // Perpendicular X (normalized)
        const perpY = dx / distance;   // Perpendicular Y (normalized)
        
        // Sample every 10 pixels along the centerline
        const numSamples = Math.ceil(distance / 10);
        
        // Check 2 points: left and right edge
        const crossSamples = [-corridorWidth, corridorWidth];
        
        // Store debug points if requested
        if (storeDebugPoints) {
            this.debugCorridorPoints = [];
        }
        
        for (let i = 0; i <= numSamples; i++) {
            const t = i / numSamples;
            const centerX = x1 + dx * t;
            const centerY = y1 + dy * t;
            
            // Check multiple points across the corridor width
            for (const offset of crossSamples) {
                const testX = centerX + perpX * offset;
                const testY = centerY + perpY * offset;
                
                const isLand = collision.isOnLand(testX, testY) !== null;
                
                // Store for debug visualization
                if (storeDebugPoints) {
                    this.debugCorridorPoints.push({
                        x: testX,
                        y: testY,
                        isLand: isLand
                    });
                }
                
                if (isLand) {
                    return false;
                }
            }
        }
        
        return true;
    },
    
    // AIDEV-NOTE: A* pathfinding algorithm
    // Returns array of waypoint IDs from start to end, or null if no path
    astar(startId, endId, waypoints) {
        // Build waypoint lookup map
        const wpMap = {};
        for (const wp of waypoints) {
            wpMap[wp.id] = wp;
        }
        
        const endWP = wpMap[endId];
        if (!endWP) return null;
        
        // A* data structures
        const openSet = new Set([startId]);
        const closedSet = new Set();
        
        // gScore: cost from start to node
        const gScore = {};
        gScore[startId] = 0;
        
        // fScore: gScore + heuristic (estimated cost to end)
        const fScore = {};
        fScore[startId] = this.heuristic(wpMap[startId], endWP);
        
        // Track path
        const cameFrom = {};
        
        while (openSet.size > 0) {
            // Find node in openSet with lowest fScore
            let current = null;
            let lowestF = Infinity;
            
            for (const id of openSet) {
                const f = fScore[id] || Infinity;
                if (f < lowestF) {
                    lowestF = f;
                    current = id;
                }
            }
            
            // Reached goal
            if (current === endId) {
                return this.reconstructPath(cameFrom, current);
            }
            
            openSet.delete(current);
            closedSet.add(current);
            
            const currentWP = wpMap[current];
            
            // Check all neighbors
            for (const neighborId of currentWP.connections) {
                if (closedSet.has(neighborId)) continue;
                
                const neighborWP = wpMap[neighborId];
                
                // Calculate tentative gScore
                const dist = Math.hypot(
                    neighborWP.x - currentWP.x,
                    neighborWP.y - currentWP.y
                );
                const tentativeG = gScore[current] + dist;
                
                if (!openSet.has(neighborId)) {
                    openSet.add(neighborId);
                } else if (tentativeG >= (gScore[neighborId] || Infinity)) {
                    continue; // Not a better path
                }
                
                // This is the best path so far
                cameFrom[neighborId] = current;
                gScore[neighborId] = tentativeG;
                fScore[neighborId] = tentativeG + this.heuristic(neighborWP, endWP);
            }
        }
        
        // No path found
        return null;
    },
    
    // AIDEV-NOTE: Heuristic function for A* (Euclidean distance)
    heuristic(wp1, wp2) {
        return Math.hypot(wp2.x - wp1.x, wp2.y - wp1.y);
    },
    
    // AIDEV-NOTE: Reconstruct path from cameFrom map
    reconstructPath(cameFrom, current) {
        const path = [current];
        
        while (current in cameFrom) {
            current = cameFrom[current];
            path.unshift(current);
        }
        
        return path;
    }
};


