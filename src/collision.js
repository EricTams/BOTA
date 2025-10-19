// BOTA - Collision Detection Module
// Handles land/water collision using island polygon data

const Collision = {
    data: null,
    loaded: false,
    
    // Alias for loaded (used in game.js)
    get isReady() {
        return this.loaded;
    },

    // Load collision data (now uses embedded data)
    async load() {
        try {
            // Use embedded collision data
            if (typeof COLLISION_DATA === 'undefined') {
                throw new Error('COLLISION_DATA not found - missing collision_data.js?');
            }
            
            this.data = COLLISION_DATA;
            
            // AIDEV-NOTE: Convert collision data from image space to world space
            // Image space: 0,0 at top-left
            // World space: 0,0 at center of map
            const offsetX = this.data.mapWidth / 2;
            const offsetY = this.data.mapHeight / 2;
            
            console.log(`Converting collision data from image space to world space (offset: ${offsetX}, ${offsetY})`);
            
            // Convert all island polygons and bounds
            for (const island of this.data.islands) {
                // Convert polygon coordinates
                for (let i = 0; i < island.polygon.length; i++) {
                    island.polygon[i][0] -= offsetX;
                    island.polygon[i][1] -= offsetY;
                }
                
                // Convert bounds
                island.bounds.minX -= offsetX;
                island.bounds.minY -= offsetY;
                island.bounds.maxX -= offsetX;
                island.bounds.maxY -= offsetY;
            }
            
            this.loaded = true;
            console.log(`Collision data loaded: ${this.data.islands.length} islands (converted to world space)`);
        } catch (error) {
            console.error('Failed to load collision data:', error);
            this.loaded = false;
            throw error;
        }
    },

    // AIDEV-NOTE: Point-in-polygon test using ray casting algorithm
    // Returns true if point is inside the polygon
    pointInPolygon(x, y, polygon) {
        let inside = false;
        const n = polygon.length;
        
        let p1x = polygon[0][0];
        let p1y = polygon[0][1];
        
        for (let i = 1; i <= n; i++) {
            const p2x = polygon[i % n][0];
            const p2y = polygon[i % n][1];
            
            if (y > Math.min(p1y, p2y)) {
                if (y <= Math.max(p1y, p2y)) {
                    if (x <= Math.max(p1x, p2x)) {
                        if (p1y !== p2y) {
                            const xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x;
                            if (p1x === p2x || x <= xinters) {
                                inside = !inside;
                            }
                        }
                    }
                }
            }
            p1x = p2x;
            p1y = p2y;
        }
        
        return inside;
    },

    // Check if point is inside bounding box (quick rejection test)
    pointInBounds(x, y, bounds) {
        return x >= bounds.minX && 
               x <= bounds.maxX && 
               y >= bounds.minY && 
               y <= bounds.maxY;
    },

    // AIDEV-NOTE: Check if a point is on land
    // Returns island ID if on land, null if on water
    // Uses bounding box test first for performance
    // padding: additional radius to check around the point (considers "near land" as on land)
    isOnLand(x, y, padding = 0) {
        if (!this.loaded) {
            console.warn('Collision data not loaded yet!');
            return null;
        }

        // If no padding, do simple point test
        if (padding <= 0) {
            // Test each island
            for (const island of this.data.islands) {
                // Quick rejection using bounding box
                if (!this.pointInBounds(x, y, island.bounds)) {
                    continue;
                }
                
                // Precise test using polygon
                if (this.pointInPolygon(x, y, island.polygon)) {
                    return island.id;
                }
            }
            return null; // On water
        }
        
        // With padding, check center and 8 points around it in a circle
        const testPoints = [
            { x: x, y: y }, // Center
            { x: x + padding, y: y },
            { x: x - padding, y: y },
            { x: x, y: y + padding },
            { x: x, y: y - padding },
            { x: x + padding * 0.707, y: y + padding * 0.707 },
            { x: x - padding * 0.707, y: y + padding * 0.707 },
            { x: x + padding * 0.707, y: y - padding * 0.707 },
            { x: x - padding * 0.707, y: y - padding * 0.707 }
        ];
        
        // Check if any test point is on land
        for (const point of testPoints) {
            for (const island of this.data.islands) {
                if (!this.pointInBounds(point.x, point.y, island.bounds)) {
                    continue;
                }
                if (this.pointInPolygon(point.x, point.y, island.polygon)) {
                    return island.id;
                }
            }
        }
        
        return null; // On water
    },

    // Check if point is on water (inverse of isOnLand)
    isOnWater(x, y) {
        return this.isOnLand(x, y) === null;
    },

    // Get island data by ID
    getIsland(id) {
        if (!this.loaded) return null;
        return this.data.islands.find(island => island.id === id);
    },

    // AIDEV-NOTE: Calculate island center from bounds
    getIslandCenter(island) {
        if (!island || !island.bounds) return null;
        return {
            x: (island.bounds.minX + island.bounds.maxX) / 2,
            y: (island.bounds.minY + island.bounds.maxY) / 2
        };
    },

    // AIDEV-NOTE: Push a point out of an island to the nearest water
    // Returns adjusted position that is on water
    // Finds the closest island and pushes away from its center
    pushOutOfIsland(x, y, maxDistance = 200) {
        // Find the closest island by actual coastline distance
        const closestResult = this.getClosestIsland(x, y, true); // Enable debug logging
        if (!closestResult || !closestResult.island) {
            // No island found
            return { x, y, pushed: false };
        }

        const island = closestResult.island;
        const islandId = island.id;
        
        // If already far enough from island, no need to push
        if (closestResult.distance > 20) {
            return { x, y, pushed: false, islandId };
        }

        // Get island center
        const center = this.getIslandCenter(island);
        
        // Calculate direction from center to point
        let dx = x - center.x;
        let dy = y - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction
        if (dist > 0) {
            dx /= dist;
            dy /= dist;
        } else {
            // Point is exactly at center, push south
            dx = 0;
            dy = 1;
        }

        // Push outward until we hit water (or max distance)
        for (let d = 10; d <= maxDistance; d += 5) {
            const testX = x + dx * d;
            const testY = y + dy * d;
            
            if (this.isOnWater(testX, testY)) {
                return { x: testX, y: testY, pushed: true, distance: d, islandId };
            }
        }

        // Couldn't find water, return original position
        console.warn(`Could not push out of island ${islandId} within max distance (${maxDistance} pixels)`);
        return { x, y, pushed: false, islandId };
    },

    // AIDEV-NOTE: Find the closest island to a point
    // Returns the island and the distance to its actual coastline
    // Checks every island's actual polygon for accuracy
    getClosestIsland(x, y, debug = false) {
        if (!this.loaded) return null;
        
        let closestIsland = null;
        let minDist = Infinity;
        const distances = []; // For debug logging
        
        // Check every island - no premature optimization
        for (const island of this.data.islands) {
            // Calculate actual distance to polygon coastline
            const coastPoint = this.getClosestPointOnIsland(x, y, island);
            if (coastPoint) {
                distances.push({ id: island.id, distance: coastPoint.distance });
                if (coastPoint.distance < minDist) {
                    minDist = coastPoint.distance;
                    closestIsland = island;
                }
            }
        }
        
        // Log distances if debug enabled
        if (debug) {
            distances.sort((a, b) => a.distance - b.distance);
            console.log('Island distances from point (' + x.toFixed(2) + ', ' + y.toFixed(2) + '):');
            distances.slice(0, 5).forEach(d => {
                console.log('  ' + d.id + ': ' + d.distance.toFixed(2) + 'px');
            });
            console.log('  Closest:', closestIsland ? closestIsland.id : 'none');
        }
        
        return closestIsland ? { island: closestIsland, distance: minDist } : null;
    },

    // AIDEV-NOTE: Find closest point on island's polygon (coastline)
    // Returns the closest point on the polygon edge to the given point
    getClosestPointOnIsland(x, y, island) {
        if (!island || !island.polygon) return null;
        
        let closestPoint = null;
        let minDistSq = Infinity;
        
        const polygon = island.polygon;
        for (let i = 0; i < polygon.length; i++) {
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % polygon.length];
            
            // Find closest point on line segment p1-p2 to point (x, y)
            const dx = p2[0] - p1[0];
            const dy = p2[1] - p1[1];
            const lengthSq = dx * dx + dy * dy;
            
            let t = 0;
            if (lengthSq !== 0) {
                t = ((x - p1[0]) * dx + (y - p1[1]) * dy) / lengthSq;
                t = Math.max(0, Math.min(1, t));
            }
            
            const closestX = p1[0] + t * dx;
            const closestY = p1[1] + t * dy;
            
            const distSq = (x - closestX) ** 2 + (y - closestY) ** 2;
            
            if (distSq < minDistSq) {
                minDistSq = distSq;
                closestPoint = { x: closestX, y: closestY };
            }
        }
        
        return closestPoint ? { ...closestPoint, distance: Math.sqrt(minDistSq) } : null;
    },

    // Find all islands within a radius (useful for proximity checks)
    getIslandsNear(x, y, radius) {
        if (!this.loaded) return [];
        
        const nearby = [];
        const radiusSq = radius * radius;
        
        for (const island of this.data.islands) {
            const bounds = island.bounds;
            
            // Check if circle intersects bounding box
            const closestX = Math.max(bounds.minX, Math.min(x, bounds.maxX));
            const closestY = Math.max(bounds.minY, Math.min(y, bounds.maxY));
            
            const distSq = (x - closestX) ** 2 + (y - closestY) ** 2;
            
            if (distSq <= radiusSq) {
                nearby.push(island);
            }
        }
        
        return nearby;
    },

    // AIDEV-NOTE: Get distance to nearest land from water point
    // Useful for keeping boats from getting too close to shore
    distanceToLand(x, y) {
        if (!this.loaded) return Infinity;
        if (this.isOnLand(x, y) !== null) return 0;
        
        let minDist = Infinity;
        
        for (const island of this.data.islands) {
            // Check distance to bounding box first
            const bounds = island.bounds;
            const closestX = Math.max(bounds.minX, Math.min(x, bounds.maxX));
            const closestY = Math.max(bounds.minY, Math.min(y, bounds.maxY));
            const distToBounds = Math.hypot(x - closestX, y - closestY);
            
            if (distToBounds < minDist) {
                // Check distance to each polygon edge
                const polygon = island.polygon;
                for (let i = 0; i < polygon.length; i++) {
                    const p1 = polygon[i];
                    const p2 = polygon[(i + 1) % polygon.length];
                    
                    const dist = this.distanceToSegment(x, y, p1[0], p1[1], p2[0], p2[1]);
                    minDist = Math.min(minDist, dist);
                }
            }
        }
        
        return minDist;
    },

    // Distance from point to line segment
    distanceToSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSq = dx * dx + dy * dy;
        
        if (lengthSq === 0) {
            return Math.hypot(px - x1, py - y1);
        }
        
        let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
        t = Math.max(0, Math.min(1, t));
        
        const closestX = x1 + t * dx;
        const closestY = y1 + t * dy;
        
        return Math.hypot(px - closestX, py - closestY);
    }
};

