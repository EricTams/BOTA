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

def find_island_contours(water_mask):
    """
    Find contours of land masses (inverse of water).
    Returns list of contours where each contour is a list of (x, y) points.
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
    for contour in contours:
        # Filter out tiny artifacts (< 100 pixels)
        area = cv2.contourArea(contour)
        if area < 100:
            continue
        
        # Simplify contour to reduce points (Douglas-Peucker)
        # Moderate simplification - balanced between detail and performance
        perimeter = cv2.arcLength(contour, True)
        if area > 50000:  # Very large island - preserve good detail
            epsilon = 0.0025 * perimeter
        elif area > 10000:  # Large island
            epsilon = 0.004 * perimeter
        elif area > 5000:  # Medium island
            epsilon = 0.0055 * perimeter
        else:  # Small island
            epsilon = 0.0075 * perimeter
        
        simplified = cv2.approxPolyDP(contour, epsilon, True)
        
        # Convert to list of [x, y] points
        points = simplified.reshape(-1, 2).tolist()
        island_contours.append(points)
    
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

def generate_collision_data(island_contours, map_width, map_height):
    """
    Generate collision data structure for game use.
    """
    islands = []
    
    for i, contour in enumerate(island_contours):
        # Calculate bounding box for quick rejection
        xs = [p[0] for p in contour]
        ys = [p[1] for p in contour]
        
        island_data = {
            'id': i,
            'polygon': contour,
            'bounds': {
                'minX': min(xs),
                'maxX': max(xs),
                'minY': min(ys),
                'maxY': max(ys)
            },
            'area': len(contour)  # Approximate
        }
        islands.append(island_data)
    
    return {
        'mapWidth': map_width,
        'mapHeight': map_height,
        'islands': islands
    }

def save_collision_data(data, output_path):
    """Save collision data to JSON file."""
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Collision data saved to: {output_path}")

def save_collision_js(data, output_path):
    """Save collision data as JavaScript module."""
    with open(output_path, 'w') as f:
        f.write('// BOTA - Collision Data (Auto-generated)\n')
        f.write('// Regenerate with: python detect_islands.py\n\n')
        f.write('const COLLISION_DATA = ')
        json.dump(data, f, indent=2)
        f.write(';\n')
    print(f"JavaScript collision data saved to: {output_path}")

def visualize_islands(img_array, island_contours, output_path):
    """
    Create a visualization showing detected islands.
    """
    try:
        import cv2
    except ImportError:
        print("Skipping visualization (OpenCV not available)")
        return
    
    # Create output image
    vis = img_array.copy()
    
    # Draw contours on image
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
    
    # Detect water
    print("Detecting water/land boundaries...")
    water_mask = detect_water(img_array)
    water_percent = (water_mask.sum() / water_mask.size) * 100
    print(f"Water coverage: {water_percent:.1f}%")
    
    # Find island contours
    print("Finding island contours...")
    island_contours = find_island_contours(water_mask)
    print(f"Found {len(island_contours)} islands")
    
    # Generate collision data
    print("Generating collision data...")
    collision_data = generate_collision_data(island_contours, width, height)
    
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
        visualize_islands(img_array, island_contours, args.vis_output)
    
    print("\n" + "=" * 50)
    print("Done! Collision data is ready for use in game.")
    print("\nUsage in JavaScript:")
    print("  const collision = await fetch('assets/map/collision_data.json').then(r => r.json());")
    print("  const isOnLand = pointInPolygon(x, y, collision.islands[0].polygon);")

if __name__ == '__main__':
    main()

