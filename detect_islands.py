#!/usr/bin/env python3
"""
BOTA - Island Boundary Detection
Analyzes the world map to detect land masses and generate collision polygons.
"""

import numpy as np
from PIL import Image
import json
import sys

def load_map(path):
    """Load the map image."""
    try:
        img = Image.open(path)
        return np.array(img)
    except Exception as e:
        print(f"Error loading map: {e}")
        sys.exit(1)

def detect_water(img_array):
    """
    Create a binary mask where water=True, land=False.
    Water detection: Any blue-ish or teal colors (not green/brown land or white snow).
    
    AIDEV-NOTE: Snow can have blue tint but is much brighter than water.
    Key distinction: Snow is bright (high overall luminosity), water is more saturated blue.
    """
    r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
    
    # Calculate brightness and saturation metrics
    brightness = (r.astype(np.float32) + g.astype(np.float32) + b.astype(np.float32)) / 3
    
    # AIDEV-NOTE: Enhanced snow detection
    # Snow is bright with high R, G, and B values, even if slightly blue-tinted
    # Key: brightness must be high (>140) even if there's a blue tint
    is_snow_white = brightness > 140  # Much brighter than water
    
    # Additional snow check: light colors where no channel is too dark
    # Snow typically has all channels above 100, even in shadows
    is_snow_light = (r > 100) & (g > 100) & (b > 100)
    
    # Combine snow masks - if it's bright OR all channels are light, it's probably snow
    is_snow = is_snow_white | is_snow_light
    
    # Method 1: Bright teal/cyan water (shallow water)
    # Must be saturated enough and not too bright (not snow)
    teal_mask = (b > 80) & (g > 60) & (r < 100) & (b > r + 15) & (g > r * 0.8) & (brightness < 130)
    
    # Method 2: Darker blue-teal deep water
    # Blue must be dominant and not too bright
    dark_water = (b > r + 15) & (b > g) & (b > 50) & (brightness < 130)
    
    # Method 3: Very dark water (almost black-blue)
    very_dark = (b > r + 10) & (b > g) & (r < 80) & (g < 100) & (b > 30) & (b < 150)
    
    # Method 4: Swamp water (murky blue-green-brown)
    # Has more blue than typical brown land, but not bright like snow
    swamp = (b > 60) & (g > 50) & (b > r + 10) & (r < 120) & (brightness < 130)
    
    # Combine all water detection methods, then exclude snow
    water_mask = (teal_mask | dark_water | very_dark | swamp) & ~is_snow
    
    return water_mask

def find_island_contours(water_mask, min_collision_area=800):
    """
    Find contours of land masses (inverse of water).
    Returns list of contours where each contour is a list of (x, y) points.
    
    Args:
        water_mask: Boolean mask where True = water, False = land
        min_collision_area: Minimum area (pixels) for collision islands.
                           Islands smaller than this are excluded from collision
                           (e.g., small rocks, buoys that shouldn't block navigation)
    """
    try:
        import cv2
    except ImportError:
        print("Error: OpenCV (cv2) is required for contour detection.")
        print("Install with: pip install opencv-python")
        sys.exit(1)
    
    # Invert mask: land=255, water=0
    land_mask = (~water_mask).astype(np.uint8) * 255
    
    # Find contours
    contours, hierarchy = cv2.findContours(
        land_mask, 
        cv2.RETR_EXTERNAL,  # Only outer contours (islands)
        cv2.CHAIN_APPROX_SIMPLE  # Compress contours
    )
    
    # Convert contours to list of coordinate lists
    island_contours = []
    excluded_count = 0
    
    for contour in contours:
        area = cv2.contourArea(contour)
        
        # Filter out tiny artifacts (< 100 pixels)
        if area < 100:
            continue
        
        # AIDEV-NOTE: Exclude small islands from collision
        # These are navigable (boats can sail through/around them)
        if area < min_collision_area:
            excluded_count += 1
            print(f"  Excluding small island: {area:.0f} pixels (below {min_collision_area} threshold)")
            continue
        
        # Simplify contour to reduce points (Douglas-Peucker)
        # Keep large islands detailed, aggressively simplify small islands
        perimeter = cv2.arcLength(contour, True)
        if area > 50000:  # Very large island - preserve good detail
            epsilon = 0.0025 * perimeter
        elif area > 10000:  # Large island (top ~6 islands)
            epsilon = 0.004 * perimeter
        elif area > 5000:  # Medium island - more aggressive
            epsilon = 0.012 * perimeter  # Was 0.0055, now ~2x more aggressive
        else:  # Small island - very aggressive
            epsilon = 0.018 * perimeter  # Was 0.0075, now ~2.4x more aggressive
        
        simplified = cv2.approxPolyDP(contour, epsilon, True)
        
        # Make small islands more convex by applying convex hull
        # This reduces concave features and simplifies navigation
        if area < 3000:  # Small islands - make fully convex
            simplified = cv2.convexHull(simplified)
        elif area < 5000:  # Medium-small islands - partial convex hull
            # Blend between original and convex hull for smoother transition
            hull = cv2.convexHull(simplified)
            # Use hull if it's not too much larger than the original
            hull_area = cv2.contourArea(hull)
            simplified_area = cv2.contourArea(simplified)
            if hull_area < simplified_area * 1.3:  # Only if hull adds <30% area
                simplified = hull
        
        # Post-process: Remove kinks and zigzags from large islands
        # A kink is when 3 consecutive points are nearly collinear or form a sharp angle
        if area > 5000:  # Only for medium/large islands
            points = simplified.reshape(-1, 2).tolist()
            cleaned = []
            n = len(points)
            
            for i in range(n):
                p0 = points[(i - 1) % n]
                p1 = points[i]
                p2 = points[(i + 1) % n]
                
                # Calculate vectors
                v1 = [p1[0] - p0[0], p1[1] - p0[1]]
                v2 = [p2[0] - p1[0], p2[1] - p1[1]]
                
                # Calculate lengths
                len1 = np.sqrt(v1[0]**2 + v1[1]**2)
                len2 = np.sqrt(v2[0]**2 + v2[1]**2)
                
                # Skip if either segment is too short (degenerate)
                if len1 < 1 or len2 < 1:
                    continue
                
                # Normalize vectors
                v1_norm = [v1[0] / len1, v1[1] / len1]
                v2_norm = [v2[0] / len2, v2[1] / len2]
                
                # Calculate dot product (cos of angle)
                dot = v1_norm[0] * v2_norm[0] + v1_norm[1] * v2_norm[1]
                
                # Keep point if:
                # 1. Angle is significant (not nearly collinear or sharp reversal)
                # 2. Both segments are reasonably long
                # dot > 0.92 means angle < ~23 degrees (nearly straight line - remove)
                # dot < -0.92 means angle > ~157 degrees (sharp reversal - remove)
                # Only remove very obvious kinks - preserve most detail
                keep_point = False
                if abs(dot) < 0.92:
                    # Significant angle - keep
                    keep_point = True
                elif len1 > 8 and len2 > 8:
                    # Nearly straight but long segments - keep
                    keep_point = True
                
                if keep_point:
                    cleaned.append(p1)
            
            # Ensure we have at least 4 points
            if len(cleaned) >= 4:
                points = cleaned
            else:
                points = simplified.reshape(-1, 2).tolist()
        else:
            # Convert to list of [x, y] points
            points = simplified.reshape(-1, 2).tolist()
        
        island_contours.append(points)
    
    if excluded_count > 0:
        print(f"  Excluded {excluded_count} small island(s) from collision (navigable)")
    
    return island_contours

def point_in_polygon(point, polygon):
    """
    Ray casting algorithm to determine if point is inside polygon.
    point: (x, y) tuple
    polygon: list of [x, y] points
    """
    x, y = point
    n = len(polygon)
    inside = False
    
    p1x, p1y = polygon[0]
    for i in range(1, n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    
    return inside

def find_nearest_water(x, y, water_mask, max_search_distance=50):
    """
    Find the nearest water pixel to the given position.
    Returns (water_x, water_y) or None if no water found within max_search_distance.
    """
    # Quick check - already on water?
    if (0 <= int(x) < water_mask.shape[1] and 
        0 <= int(y) < water_mask.shape[0] and
        water_mask[int(y), int(x)]):
        return (x, y)
    
    # Search in expanding circles
    for radius in range(1, max_search_distance + 1, 2):
        # Sample points around circle
        num_samples = max(8, radius * 2)
        for i in range(num_samples):
            angle = (i / num_samples) * 2 * np.pi
            test_x = int(x + np.cos(angle) * radius)
            test_y = int(y + np.sin(angle) * radius)
            
            # Check bounds
            if 0 <= test_x < water_mask.shape[1] and 0 <= test_y < water_mask.shape[0]:
                if water_mask[test_y, test_x]:
                    return (test_x, test_y)
    
    return None

def can_see_neighbors(waypoint_x, waypoint_y, prev_wp, next_wp, water_mask, map_width, map_height, visibility_pct=0.90):
    """
    Check if a waypoint can see both its neighbors (line-of-sight over water).
    Returns True if both connections are clear.
    
    AIDEV-NOTE: Checks visibility_pct (default 90%) of the way to neighbor to be more forgiving.
    Neighbors might be on/near coastline, so we don't need perfect visibility to their exact position.
    """
    for neighbor in [prev_wp, next_wp]:
        if neighbor is None:
            continue
        
        dx = neighbor['x'] - waypoint_x
        dy = neighbor['y'] - waypoint_y
        distance = np.sqrt(dx * dx + dy * dy)
        
        if distance < 1:
            continue
        
        # Sample along line to visibility_pct of the distance
        # Sample every ~5 pixels
        num_samples = int((distance * visibility_pct) / 5) + 1
        for i in range(1, num_samples + 1):
            # t ranges from (1/num_samples)*visibility_pct to visibility_pct
            t = (i / num_samples) * visibility_pct
            test_x = int(waypoint_x + dx * t)
            test_y = int(waypoint_y + dy * t)
            
            # Check bounds
            if test_x < 0 or test_x >= map_width or test_y < 0 or test_y >= map_height:
                return False
            
            # Check if on water
            if not water_mask[test_y, test_x]:
                return False
    
    return True

def push_waypoint_out(waypoint_x, waypoint_y, push_distance, island_contour, water_mask, map_width, map_height, prev_wp=None, next_wp=None, debug_island=None, wp_index=None, visibility_pct=0.90):
    """
    Push a waypoint away from the island coastline.
    Returns (new_x, new_y, success) where success indicates if the push was valid.
    
    Push direction is calculated by bisecting the angle between the vectors
    to the previous and next waypoints, creating a natural "bulge outward"
    that follows the coastline shape.
    
    Push is valid if:
    - New position is on water
    - Can still see both neighbors (if provided)
    """
    # Calculate push direction based on angle bisector between neighbors
    if prev_wp is not None and next_wp is not None:
        # Vector from current to previous
        v1_x = prev_wp['x'] - waypoint_x
        v1_y = prev_wp['y'] - waypoint_y
        v1_len = np.sqrt(v1_x * v1_x + v1_y * v1_y)
        
        # Vector from current to next
        v2_x = next_wp['x'] - waypoint_x
        v2_y = next_wp['y'] - waypoint_y
        v2_len = np.sqrt(v2_x * v2_x + v2_y * v2_y)
        
        # Normalize both vectors
        if v1_len > 0.1:
            v1_x /= v1_len
            v1_y /= v1_len
        else:
            v1_x, v1_y = 0, 0
        
        if v2_len > 0.1:
            v2_x /= v2_len
            v2_y /= v2_len
        else:
            v2_x, v2_y = 0, 0
        
        # Add normalized vectors to get angle bisector
        bisect_x = v1_x + v2_x
        bisect_y = v1_y + v2_y
        bisect_len = np.sqrt(bisect_x * bisect_x + bisect_y * bisect_y)
        
        if bisect_len > 0.1:
            # Normalize bisector
            bisect_x /= bisect_len
            bisect_y /= bisect_len
            
            # AIDEV-NOTE: Use cross product to determine if corner is convex or concave
            # OpenCV findContours returns contours in a consistent winding order.
            # For exterior contours with RETR_EXTERNAL, the winding is counter-clockwise.
            # 
            # Edge vectors (in traversal order):
            # e1 = current - previous (edge coming into current point)
            # e2 = next - current (edge leaving current point)
            # 
            # Cross product: e1 × e2 = e1_x * e2_y - e1_y * e2_x
            # - Positive cross product = left turn = convex corner (bulging outward)
            #   → Angle bisector points inward, so negate it to push outward
            # - Negative cross product = right turn = concave corner (indented)
            #   → Angle bisector points outward, use as-is
            
            # Calculate edge vectors (in traversal order)
            e1_x = waypoint_x - prev_wp['x']
            e1_y = waypoint_y - prev_wp['y']
            e2_x = next_wp['x'] - waypoint_x
            e2_y = next_wp['y'] - waypoint_y
            
            # Cross product (z-component of 3D cross product)
            cross = e1_x * e2_y - e1_y * e2_x
            
            # For CCW polygon: negative cross = convex = bisector points inward
            # So negate the bisector to push outward
            # (Most of the coastline is convex, concave corners are rare indentations)
            if cross < 0:
                bisect_x = -bisect_x
                bisect_y = -bisect_y
            
            # Use bisector as push direction
            dx = bisect_x
            dy = bisect_y
        else:
            # Bisector is zero (neighbors are opposite), fall back to centroid method
            centroid_x = sum(p[0] for p in island_contour) / len(island_contour)
            centroid_y = sum(p[1] for p in island_contour) / len(island_contour)
            dx = waypoint_x - centroid_x
            dy = waypoint_y - centroid_y
            dist = np.sqrt(dx * dx + dy * dy)
            if dist > 0.1:
                dx /= dist
                dy /= dist
            else:
                return (waypoint_x, waypoint_y, False)
    else:
        # No neighbors provided, fall back to centroid method
        centroid_x = sum(p[0] for p in island_contour) / len(island_contour)
        centroid_y = sum(p[1] for p in island_contour) / len(island_contour)
        dx = waypoint_x - centroid_x
        dy = waypoint_y - centroid_y
        dist = np.sqrt(dx * dx + dy * dy)
        if dist > 0.1:
            dx /= dist
            dy /= dist
        else:
            return (waypoint_x, waypoint_y, False)
    
    # Helper function to validate a pushed position with detailed failure reason
    def validate_position(test_x, test_y):
        # Check bounds
        if test_x < 0 or test_x >= map_width or test_y < 0 or test_y >= map_height:
            return (False, 'out_of_bounds')
        # Check if on water
        if not water_mask[test_y, test_x]:
            return (False, 'on_land')
        # Check if can still see neighbors (use custom visibility percentage)
        if not can_see_neighbors(test_x, test_y, prev_wp, next_wp, water_mask, map_width, map_height, visibility_pct):
            return (False, 'lost_neighbor_visibility')
        return (True, 'ok')
    
    # Try pushing using angle bisection direction
    new_x = int(waypoint_x + dx * push_distance)
    new_y = int(waypoint_y + dy * push_distance)
    
    bisect_valid, bisect_reason = validate_position(new_x, new_y)
    if bisect_valid:
        return (new_x, new_y, True)
    
    # Fallback: Try pushing from island center
    centroid_x = sum(p[0] for p in island_contour) / len(island_contour)
    centroid_y = sum(p[1] for p in island_contour) / len(island_contour)
    
    dx_center = waypoint_x - centroid_x
    dy_center = waypoint_y - centroid_y
    dist_center = np.sqrt(dx_center * dx_center + dy_center * dy_center)
    
    center_valid = False
    center_reason = 'centroid_too_close'
    
    if dist_center > 0.1:
        dx_center /= dist_center
        dy_center /= dist_center
        
        new_x_center = int(waypoint_x + dx_center * push_distance)
        new_y_center = int(waypoint_y + dy_center * push_distance)
        
        center_valid, center_reason = validate_position(new_x_center, new_y_center)
        if center_valid:
            return (new_x_center, new_y_center, True)
    
    # Both methods failed - log debug info if requested
    if debug_island is not None:
        print(f"    Waypoint {wp_index}: ({waypoint_x}, {waypoint_y}) FAILED push={push_distance}px")
        print(f"      Bisect attempt: ({new_x}, {new_y}) failed: {bisect_reason}")
        print(f"      Center attempt: ({new_x_center if dist_center > 0.1 else 'N/A'}, {new_y_center if dist_center > 0.1 else 'N/A'}) failed: {center_reason}")
        if prev_wp and next_wp:
            print(f"      Neighbors: prev=({prev_wp['x']}, {prev_wp['y']}) next=({next_wp['x']}, {next_wp['y']})")
    
    return (waypoint_x, waypoint_y, False)

def create_water_mask_from_polygons(island_contours, map_width, map_height):
    """
    Create a water mask from collision polygons.
    The polygons are authoritative - everything NOT inside a polygon is water.
    Boundaries are treated as water (for visibility checks).
    """
    try:
        import cv2
    except ImportError:
        print("Error: OpenCV (cv2) is required for mask generation.")
        print("Install with: pip install opencv-python")
        sys.exit(1)
    
    # Start with all water (255 = water)
    mask = np.ones((map_height, map_width), dtype=np.uint8) * 255
    
    # Fill each island polygon with land (0 = land)
    for contour in island_contours:
        # Convert to numpy array format for cv2
        pts = np.array(contour, dtype=np.int32)
        # Fill polygon (this marks interior as land, boundary pixels may vary)
        cv2.fillPoly(mask, [pts], 0)
    
    # Convert to boolean (True = water, False = land)
    water_mask = mask > 0
    
    print(f"  Generated water mask from {len(island_contours)} collision polygons")
    water_percent = (water_mask.sum() / water_mask.size) * 100
    print(f"  Water coverage: {water_percent:.1f}%")
    
    return water_mask

def generate_waypoints(island_contours, water_mask, map_width, map_height):
    """
    Generate waypoints around island perimeters for pathfinding.
    Returns list of waypoints with format: {'id': n, 'x': px, 'y': py, 'connections': []}
    
    New algorithm:
    1. Place waypoints at each polygon vertex (collision point)
    2. Connect neighbors around each island
    3. Push waypoints out in 3 passes (checking for land and neighbor visibility)
    4. Simplify by removing redundant middle waypoints
    5. Connect waypoints between islands
    """
    waypoints = []
    waypoint_id = 0
    island_waypoint_groups = []  # Track which waypoints belong to which island
    
    print("Generating waypoints around islands...")
    
    # Calculate island properties (area and centroid) for each island
    island_properties = []
    for island_idx, contour in enumerate(island_contours):
        # Calculate centroid (simple average of vertices)
        cx = int(sum(p[0] for p in contour) / len(contour))
        cy = int(sum(p[1] for p in contour) / len(contour))
        
        # Estimate area using Shoelace formula
        n = len(contour)
        area = 0.0
        for i in range(n):
            j = (i + 1) % n
            area += contour[i][0] * contour[j][1]
            area -= contour[j][0] * contour[i][1]
        area = abs(area) / 2.0
        
        island_properties.append({
            'area': area,
            'center_x': cx,
            'center_y': cy,
            'is_small': area < 5000  # Small islands use center-based push
        })
    
    # STEP 1: Place waypoints at each polygon vertex
    for island_idx, contour in enumerate(island_contours):
        island_waypoints = []
        
        for vertex in contour:
            # Place waypoint at vertex
                        waypoints.append({
                            'id': waypoint_id,
                'x': vertex[0],
                'y': vertex[1],
                            'connections': []
                        })
                        island_waypoints.append(waypoint_id)
                        waypoint_id += 1
                
        island_info = island_properties[island_idx]
        small_marker = " (small/convex)" if island_info['is_small'] else ""
        print(f"  Island #{island_idx}: {len(island_waypoints)} initial waypoints (at vertices){small_marker}")
        
        if len(island_waypoints) > 0:
            island_waypoint_groups.append(island_waypoints)
    
    # STEP 2: Connect neighbors around each island
    print("Connecting neighbor waypoints around islands...")
    for island_wps in island_waypoint_groups:
        for i in range(len(island_wps)):
            wp_id = island_wps[i]
            next_wp_id = island_wps[(i + 1) % len(island_wps)]
            
            waypoints[wp_id]['connections'].append(next_wp_id)
            waypoints[next_wp_id]['connections'].append(wp_id)
    
    # STEP 3: Push waypoints out in 3 passes
    print("Pushing waypoints away from shore (3 passes)...")
    PUSH_DISTANCES = [10, 15, 20]  # Three passes with increasing push distances
    
    # Track which waypoints were pushed at least once
    pushed_at_least_once = set()
    
    for pass_num, push_distance in enumerate(PUSH_DISTANCES):
        pushed_count = 0
        
        # Use more forgiving visibility check for early passes
        # Pass 1: 75% (very forgiving - neighbors unpushed)
        # Pass 2: 85% (more forgiving - some neighbors pushed)
        # Pass 3: 90% (standard - most neighbors pushed)
        visibility_pct = [0.75, 0.85, 0.90][pass_num]
        
        for island_idx, island_wps in enumerate(island_waypoint_groups):
            contour = island_contours[island_idx]
            island_info = island_properties[island_idx]
            
            for i in range(len(island_wps)):
                wp_id = island_wps[i]
                prev_wp_id = island_wps[(i - 1) % len(island_wps)]
                next_wp_id = island_wps[(i + 1) % len(island_wps)]
                
                wp = waypoints[wp_id]
                prev_wp = waypoints[prev_wp_id]
                next_wp = waypoints[next_wp_id]
                
                # Disable debug output
                debug_island = None
                
                # For small islands, use simple center-based push (they're convex)
                # For large islands, use angle bisection (handles concave features)
                if island_info['is_small']:
                    # Simple push away from island center
                    dx = wp['x'] - island_info['center_x']
                    dy = wp['y'] - island_info['center_y']
                    dist = np.sqrt(dx * dx + dy * dy)
                    
                    if dist > 0.1:
                        dx /= dist
                        dy /= dist
                        
                        new_x = int(wp['x'] + dx * push_distance)
                        new_y = int(wp['y'] + dy * push_distance)
                        
                        # Debug output for Island #0
                        if debug_island is not None:
                            print(f"    Waypoint {i}: ({wp['x']}, {wp['y']}) -> ({new_x}, {new_y})")
                        
                        # For small convex islands, we only check bounds, water, and not-in-island
                        # No need for neighbor visibility check since radial push guarantees circular pattern
                        in_bounds = new_x >= 0 and new_x < map_width and new_y >= 0 and new_y < map_height
                        on_water = water_mask[new_y, new_x] if in_bounds else False
                        not_in_island = not point_in_polygon((new_x, new_y), contour) if in_bounds else False
                        
                        if debug_island is not None:
                            print(f"      in_bounds={in_bounds}, on_water={on_water}, not_in_island={not_in_island}")
                        
                        if in_bounds and on_water and not_in_island:
                            wp['x'] = new_x
                            wp['y'] = new_y
                            pushed_count += 1
                            pushed_at_least_once.add(wp_id)
                            if debug_island is not None:
                                print(f"      SUCCESS!")
                        else:
                            if debug_island is not None:
                                print(f"      FAILED!")
                else:
                    # Large island - use angle bisection method
                    new_x, new_y, success = push_waypoint_out(
                        wp['x'], wp['y'],
                        push_distance,
                        contour,
                        water_mask,
                        map_width, map_height,
                        prev_wp, next_wp,
                        debug_island, i,
                        visibility_pct
                    )
                    
                    if success:
                        wp['x'] = new_x
                        wp['y'] = new_y
                        pushed_count += 1
                        pushed_at_least_once.add(wp_id)
        
        print(f"  Pass {pass_num + 1}: Pushed {pushed_count} waypoints by {push_distance}px")
    
    # Report waypoints that were never pushed
    total_waypoints = len(waypoints)
    never_pushed = total_waypoints - len(pushed_at_least_once)
    if never_pushed > 0:
        print(f"  WARNING: {never_pushed} waypoint(s) never pushed (stuck at coastline)")
    
    # STEP 4: Simplify by merging pairs of neighbors with averaged position (3 passes)
    print("Simplifying waypoint chains (merging neighbor pairs - 3 passes)...")
    
    for pass_num in range(3):
        pass_merged = 0
        
        for island_idx, island_wps in enumerate(island_waypoint_groups):
            island_merged = 0
            
            # Don't simplify if we'd go below 4 waypoints
            if len(island_wps) <= 4:
                continue
            
            # Single pass through the list, merging every other pair
            # Process in stride of 2 to avoid re-processing merged waypoints
            i = 0
            while i < len(island_wps) - 1:  # -1 because we need at least 2 waypoints
                # Stop if we'd go below 4 waypoints
                if len(island_wps) <= 4:
                    break
                
                # Get four consecutive waypoints: before, first, second, after
                before_idx = (i - 1) % len(island_wps)
                first_idx = i
                second_idx = i + 1
                after_idx = (i + 2) % len(island_wps)
                
                wp_before_id = island_wps[before_idx]
                wp_first_id = island_wps[first_idx]
                wp_second_id = island_wps[second_idx]
                wp_after_id = island_wps[after_idx]
                
                wp_before = waypoints[wp_before_id]
                wp_first = waypoints[wp_first_id]
                wp_second = waypoints[wp_second_id]
                wp_after = waypoints[wp_after_id]
                
                # Calculate averaged position
                avg_x = int((wp_first['x'] + wp_second['x']) / 2)
                avg_y = int((wp_first['y'] + wp_second['y']) / 2)
                
                # Check if averaged position is on water
                if not (avg_x >= 0 and avg_x < map_width and 
                        avg_y >= 0 and avg_y < map_height and
                        water_mask[avg_y, avg_x]):
                    # Averaged position not on water, skip
                    i += 2
                    continue
                
                # Check if before→averaged crosses land
                dx1 = avg_x - wp_before['x']
                dy1 = avg_y - wp_before['y']
                dist1 = np.sqrt(dx1 * dx1 + dy1 * dy1)
                
                crosses_land = False
                if dist1 > 5:  # Only check if distance is significant
                    num_samples = int(dist1 / 5) + 1
                    for j in range(1, num_samples):
                        t = j / num_samples
                        test_x = int(wp_before['x'] + dx1 * t)
                        test_y = int(wp_before['y'] + dy1 * t)
                        
                        if (test_x < 0 or test_x >= map_width or 
                            test_y < 0 or test_y >= map_height or
                            not water_mask[test_y, test_x]):
                            crosses_land = True
                            break
                
                if crosses_land:
                    # Connection would cross land, skip
                    i += 2
                    continue
                
                # Check if averaged→after crosses land
                dx2 = wp_after['x'] - avg_x
                dy2 = wp_after['y'] - avg_y
                dist2 = np.sqrt(dx2 * dx2 + dy2 * dy2)
                
                if dist2 > 5:  # Only check if distance is significant
                    num_samples = int(dist2 / 5) + 1
                    for j in range(1, num_samples):
                        t = j / num_samples
                        test_x = int(avg_x + dx2 * t)
                        test_y = int(avg_y + dy2 * t)
                        
                        if (test_x < 0 or test_x >= map_width or 
                            test_y < 0 or test_y >= map_height or
                            not water_mask[test_y, test_x]):
                            crosses_land = True
                            break
                
                if crosses_land:
                    # Connection would cross land, skip
                    i += 2
                    continue
                
                # SUCCESS! All checks passed - merge the pair
                # 1. Moving first waypoint to averaged position
                # 2. Removing second waypoint
                waypoints[wp_first_id]['x'] = avg_x
                waypoints[wp_first_id]['y'] = avg_y
                
                # Remove second waypoint
                island_wps.pop(second_idx)
                waypoints[wp_second_id]['connections'] = []
                island_merged += 1
                pass_merged += 1
                
                # Skip ahead by 1 (the merged point)
                i += 1
            
            if island_merged > 0:
                if pass_num == 0:  # Only print on first pass to avoid spam
                    print(f"  Island #{island_idx}: Starting simplification...")
        
        print(f"  Pass {pass_num + 1}: Merged {pass_merged} waypoint pairs")
    
    # Rebuild neighbor connections after simplification
    print("Rebuilding neighbor connections after simplification...")
    for island_idx, island_wps in enumerate(island_waypoint_groups):
        # Debug check
        if len(island_wps) < 3:
            print(f"  WARNING: Island #{island_idx} has only {len(island_wps)} waypoints after simplification!")
        
        # Clear all old connections for this island first
        for i in range(len(island_wps)):
            wp_id = island_wps[i]
            waypoints[wp_id]['connections'] = []
        
        # Add new ring connections (each waypoint connects to next, forming a closed loop)
        for i in range(len(island_wps)):
            wp_id = island_wps[i]
            next_wp_id = island_wps[(i + 1) % len(island_wps)]
            
            # Add bidirectional connection
            if next_wp_id not in waypoints[wp_id]['connections']:
                waypoints[wp_id]['connections'].append(next_wp_id)
            if wp_id not in waypoints[next_wp_id]['connections']:
                waypoints[next_wp_id]['connections'].append(wp_id)
    
    # Filter out waypoints with no connections (removed during simplification)
    active_waypoints = [wp for wp in waypoints if len(wp['connections']) > 0]
    
    # Renumber waypoint IDs to be sequential
    id_mapping = {}
    for new_id, wp in enumerate(active_waypoints):
        old_id = wp['id']
        id_mapping[old_id] = new_id
        wp['id'] = new_id
    
    # Update connection IDs to match new numbering
    for wp in active_waypoints:
        wp['connections'] = [id_mapping[old_id] for old_id in wp['connections'] if old_id in id_mapping]
    
    print(f"Total waypoints after simplification and cleanup: {len(active_waypoints)}")
    return active_waypoints

def calculate_waypoint_connections(waypoints, water_mask, island_contours):
    """
    Calculate which waypoints have line-of-sight to each other (no land in between).
    Updates waypoint 'connections' lists in place.
    
    Note: Coastal ring connections (neighbors around same island) are already added,
    this function adds additional cross-water connections between distant waypoints.
    """
    print("Calculating cross-water waypoint connections...")
    
    SAMPLE_INTERVAL = 5  # Check every 5 pixels along line
    MAX_CONNECTION_DISTANCE = 300  # Don't connect waypoints more than 300px apart
    
    # Count existing connections (coastal rings)
    existing_connections = sum(len(wp['connections']) for wp in waypoints) // 2
    print(f"  Starting with {existing_connections} coastal ring connections")
    
    total_connections = 0
    
    for i, wp1 in enumerate(waypoints):
        if i % 50 == 0:
            print(f"  Processing waypoint {i}/{len(waypoints)}...")
        
        for j in range(i + 1, len(waypoints)):
            wp2 = waypoints[j]
            
            # Calculate distance
            dx = wp2['x'] - wp1['x']
            dy = wp2['y'] - wp1['y']
            distance = np.sqrt(dx * dx + dy * dy)
            
            # Skip if too far apart
            if distance > MAX_CONNECTION_DISTANCE:
                continue
            
            # Check if line is clear (all water)
            num_samples = int(distance / SAMPLE_INTERVAL) + 1
            line_clear = True
            
            for k in range(num_samples + 1):
                t = k / max(num_samples, 1)
                test_x = int(wp1['x'] + dx * t)
                test_y = int(wp1['y'] + dy * t)
                
                # Check bounds
                if test_x < 0 or test_x >= water_mask.shape[1] or test_y < 0 or test_y >= water_mask.shape[0]:
                    line_clear = False
                    break
                
                # Check if on water
                if not water_mask[test_y, test_x]:
                    line_clear = False
                    break
            
            # Add bidirectional connection if clear (and not already connected)
            if line_clear:
                # Check if already connected (avoid duplicates from coastal rings)
                if wp2['id'] not in wp1['connections']:
                    wp1['connections'].append(wp2['id'])
                    wp2['connections'].append(wp1['id'])
                    total_connections += 1
    
    print(f"Added {total_connections} cross-water connections")
    final_connections = sum(len(wp['connections']) for wp in waypoints) // 2
    print(f"Total connections: {final_connections} ({existing_connections} coastal + {total_connections} cross-water)")
    
    # Print stats
    connections_per_waypoint = [len(wp['connections']) for wp in waypoints]
    if connections_per_waypoint:
        avg_connections = sum(connections_per_waypoint) / len(connections_per_waypoint)
        print(f"Average connections per waypoint: {avg_connections:.1f}")
        print(f"Min connections: {min(connections_per_waypoint)}")
        print(f"Max connections: {max(connections_per_waypoint)}")

def generate_collision_data(island_contours, map_width, map_height, waypoints=None):
    """
    Generate collision data structure for game use.
    All coordinates are in world space (0,0 at center of map).
    """
    # Calculate offset to convert from image space to world space
    offsetX = map_width / 2
    offsetY = map_height / 2
    
    islands = []
    
    for i, contour in enumerate(island_contours):
        # Convert contour to world space
        world_contour = [[p[0] - offsetX, p[1] - offsetY] for p in contour]
        
        # Calculate bounding box in world space
        xs = [p[0] for p in world_contour]
        ys = [p[1] for p in world_contour]
        
        island_data = {
            'id': i,
            'polygon': world_contour,
            'bounds': {
                'minX': min(xs),
                'maxX': max(xs),
                'minY': min(ys),
                'maxY': max(ys)
            },
            'area': len(world_contour)  # Approximate
        }
        islands.append(island_data)
    
    result = {
        'mapWidth': map_width,
        'mapHeight': map_height,
        'islands': islands
    }
    
    # Convert waypoints to world space
    if waypoints:
        world_waypoints = []
        for wp in waypoints:
            world_waypoints.append({
                'id': wp['id'],
                'x': wp['x'] - offsetX,
                'y': wp['y'] - offsetY,
                'connections': wp['connections']
            })
        result['waypoints'] = world_waypoints
    
    return result

def save_collision_data(data, output_path):
    """Save collision data to JSON file."""
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Collision data saved to: {output_path}")

def save_collision_js(data, output_path):
    """Save collision data as JavaScript module."""
    with open(output_path, 'w') as f:
        f.write('// BOTA - Collision Data (Auto-generated)\n')
        f.write('// Regenerate with: python detect_islands.py --visualize\n')
        f.write('// AIDEV-NOTE: All coordinates are in WORLD SPACE (0,0 at center of map)\n\n')
        f.write('const COLLISION_DATA = ')
        json.dump(data, f, indent=2)
        f.write(';\n')
    print(f"JavaScript collision data saved to: {output_path}")

def visualize_collision(img_array, island_contours, waypoints, output_path):
    """
    Create a visualization showing detected islands and waypoints.
    """
    try:
        import cv2
    except ImportError:
        print("Skipping visualization (OpenCV not available)")
        return
    
    # Create output image
    vis = img_array.copy()
    
    # Draw waypoint connections first (so they're behind waypoints)
    if waypoints:
        print("Drawing waypoint connections...")
        for wp in waypoints:
            for conn_id in wp['connections']:
                # Only draw each connection once (from lower ID to higher ID)
                if conn_id > wp['id']:
                    conn_wp = waypoints[conn_id]
                    # Draw green line with transparency
                    overlay = vis.copy()
                    cv2.line(overlay, 
                            (wp['x'], wp['y']), 
                            (conn_wp['x'], conn_wp['y']), 
                            (0, 255, 0), 1)
                    # Blend with alpha 0.3
                    vis = cv2.addWeighted(vis, 0.7, overlay, 0.3, 0)
    
    # Draw island contours in red
    for i, contour in enumerate(island_contours):
        # Convert back to cv2 format
        cv_contour = np.array(contour, dtype=np.int32).reshape(-1, 1, 2)
        
        # Draw contour in red
        cv2.drawContours(vis, [cv_contour], -1, (255, 0, 0), 2)
        
        # Draw island ID at centroid
        M = cv2.moments(cv_contour)
        if M['m00'] != 0:
            cx = int(M['m10'] / M['m00'])
            cy = int(M['m01'] / M['m00'])
            cv2.putText(vis, f"#{i}", (cx, cy), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)
    
    # Draw waypoints as green circles
    if waypoints:
        print(f"Drawing {len(waypoints)} waypoints...")
        for wp in waypoints:
            cv2.circle(vis, (wp['x'], wp['y']), 5, (0, 255, 0), -1)
    
    # Add legend
    legend_y = 30
    cv2.putText(vis, f"Islands: {len(island_contours)}", (10, legend_y), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    if waypoints:
        legend_y += 30
        cv2.putText(vis, f"Waypoints: {len(waypoints)}", (10, legend_y), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    
    # Save visualization
    Image.fromarray(vis).save(output_path)
    print(f"Visualization saved to: {output_path}")

def main():
    """Main script entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Detect island boundaries from map')
    parser.add_argument('--input', default='assets/map/world_map.png',
                       help='Path to input map image')
    parser.add_argument('--output', default='assets/map/collision_data.json',
                       help='Path to output collision data JSON')
    parser.add_argument('--js-output', default='src/collision_data.js',
                       help='Path to output JavaScript module')
    parser.add_argument('--visualize', action='store_true',
                       help='Create visualization image')
    parser.add_argument('--vis-output', default='assets/map/islands_debug.png',
                       help='Path to visualization output')
    
    args = parser.parse_args()
    
    print("BOTA - Island Boundary Detection")
    print("=" * 50)
    print(f"Loading map: {args.input}")
    
    # Load map
    img_array = load_map(args.input)
    height, width = img_array.shape[:2]
    print(f"Map size: {width}x{height}")
    
    # Detect water from image (used only for initial contour detection)
    print("Detecting water/land boundaries from image...")
    image_water_mask = detect_water(img_array)
    water_percent = (image_water_mask.sum() / image_water_mask.size) * 100
    print(f"Initial water coverage: {water_percent:.1f}%")
    
    # Find island contours (simplified polygons)
    print("Finding island contours...")
    island_contours = find_island_contours(image_water_mask)
    print(f"Found {len(island_contours)} islands")
    
    # Generate authoritative water mask from simplified collision polygons
    print("Generating water mask from collision polygons (authoritative)...")
    water_mask = create_water_mask_from_polygons(island_contours, width, height)
    
    # Generate waypoints using polygon-based water mask
    waypoints = generate_waypoints(island_contours, water_mask, width, height)
    
    # Calculate cross-water connections between islands
    calculate_waypoint_connections(waypoints, water_mask, island_contours)
    
    # Generate collision data
    print("Generating collision data...")
    collision_data = generate_collision_data(island_contours, width, height, waypoints)
    
    # Print island info
    for island in collision_data['islands']:
        print(f"  Island #{island['id']}: {len(island['polygon'])} points, "
              f"bounds=({island['bounds']['minX']},{island['bounds']['minY']}) to "
              f"({island['bounds']['maxX']},{island['bounds']['maxY']})")
    
    # Save collision data
    save_collision_data(collision_data, args.output)
    
    # Save JavaScript module
    save_collision_js(collision_data, args.js_output)
    
    # Create visualization if requested
    if args.visualize:
        print("Creating visualization...")
        visualize_collision(img_array, island_contours, waypoints, args.vis_output)
    
    print("\n" + "=" * 50)
    print("Done! Collision data is ready for use in game.")
    print("\nUsage in JavaScript:")
    print("  const collision = await fetch('assets/map/collision_data.json').then(r => r.json());")
    print("  const isOnLand = pointInPolygon(x, y, collision.islands[0].polygon);")

if __name__ == '__main__':
    main()

