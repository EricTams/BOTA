# Asset Generation Guide

## Overview

Use the Imagine tool in the `Imagine/` folder to generate all game art assets. The tool uses OpenAI's DALL-E API to create images from text prompts.

## Imagine Tool Usage

### IMPORTANT: Directory Setup

The `imagine.py` script must be run **from within the `Imagine/` directory** because it loads API keys from files in that directory.

**Windows/PowerShell:**
```powershell
# Navigate to Imagine directory first
cd Imagine

# Then run commands (output paths use ../ to go back to project root)
python imagine.py generate "prompt description" ../assets/ui/output.png --background transparent --quality high

# When done, return to project root
cd ..
```

**Linux/Mac:**
```bash
cd Imagine
python imagine.py generate "prompt description" ../assets/ui/output.png --background transparent --quality high
cd ..
```

### Command Syntax

**Correct syntax:**
```bash
python imagine.py generate "prompt text" output_file.png [options]
```

**Common mistakes to avoid:**
- ❌ `python imagine.py "prompt"` - Missing subcommand (`generate`, `edit`, etc.)
- ❌ `python imagine.py generate "prompt" --output file.png` - Use positional arg, not `--output` flag
- ❌ `python Imagine/imagine.py generate ...` - Run from within Imagine/ directory instead

### Common Parameters
- `--background transparent`: For sprites, tokens, UI elements
- `--background opaque`: For backgrounds, map images
- `--quality high`: Best quality output
- `--size 1024x1024`: **STANDARD SIZE FOR ALL ASSETS**

### Note on Examples Below

All command examples in this document follow the pattern shown above. If an example shows:
```bash
python Imagine/imagine.py generate "prompt" assets/output.png [options]
```

It should actually be run as:
```bash
cd Imagine
python imagine.py generate "prompt" ../assets/output.png [options]
cd ..
```

Only the first few examples have been fully updated. Apply this pattern to all others.

## Asset Categories

### 1. Game Logo (BOTA)

**Concept**: DOTA logo style, but with planks nailed over the "D" and a red "B" painted on it.

**Prompt**:
```
The DOTA game logo, but modified: wooden planks are nailed over the letter D, covering it. A large red letter B is painted over the planks in rough brushstrokes. The logo maintains the epic fantasy style of DOTA with gold metallic letters, dramatic lighting, and fantasy game aesthetic. The planks should look weathered and nailed with visible nails. Maritime/nautical theme subtle in background.
```

**Generation**:
```bash
# From Imagine/ directory:
cd Imagine
python imagine.py generate "The DOTA game logo, but modified: wooden planks are nailed over the letter D, covering it. A large red letter B is painted over the planks in rough brushstrokes. The logo maintains the epic fantasy style of DOTA with gold metallic letters, dramatic lighting, and fantasy game aesthetic. The planks should look weathered and nailed with visible nails. Maritime/nautical theme subtle in background." ../assets/ui/bota_logo.png --size 1024x1024 --quality high --background transparent
cd ..
```

### 2. Map Image

**Specifications**:
- **Size**: 1024x1024 pixels (standard)
- **Style**: Painterly, stylized, fantasy maritime world
- **Content**: Ocean with islands, coastlines, sea routes
- **Theme**: DOTA-inspired (Radiant vs Dire territories)

**Prompt**:
```
A fantasy maritime world map from top-down perspective, painterly art style. Large ocean with scattered islands and continents. Left side has bright, lush green islands (Radiant territory) with golden coastlines. Right side has dark, volcanic islands (Dire territory) with red/black rocky shores. Center has neutral blue ocean. Shipping lanes visible as lighter blue paths. Deep water is dark blue, shallow water is light blue/turquoise. Stylized waves, artistic brush strokes, game map aesthetic. No text, no labels, just the painted world.
```

**Generation**:
```bash
# From Imagine/ directory:
cd Imagine
python imagine.py generate "A fantasy maritime world map from top-down perspective, painterly art style. Large ocean with scattered islands and continents. Left side has bright, lush green islands (Radiant territory) with golden coastlines. Right side has dark, volcanic islands (Dire territory) with red/black rocky shores. Center has neutral blue ocean. Shipping lanes visible as lighter blue paths. Deep water is dark blue, shallow water is light blue/turquoise. Stylized waves, artistic brush strokes, game map aesthetic. No text, no labels, just the painted world." ../assets/map/world_map.png --size 1024x1024 --quality high --background opaque
cd ..
```

### 3. Ship Tokens

**Specifications**:
- **Size**: 1024x1024 pixels (standard)
- **Style**: Simple top-down view, boardgame token aesthetic
- **Rotation**: Will be rotated via Canvas for direction
- **Transparent background**: Must have alpha channel
- **Clear silhouette**: Easily identifiable at any rotation

**Player Ships**:

**Small Boat**:
```bash
# From Imagine/ directory:
cd Imagine
python imagine.py generate "Top-down view of a small wooden sailing boat, simple boardgame token style, single mast with sail, clear silhouette, painted in warm brown wood tones, white sail with subtle details. Suitable for rotating to any direction. Clean, iconic design. Transparent background." ../assets/ships/small_boat.png --size 1024x1024 --quality high --background transparent
cd ..
```

**Merchant Ship**:
```bash
python Imagine/imagine.py generate "Top-down view of a medium merchant sailing ship, boardgame token style, two masts, wider hull for cargo, brown wood, white sails, simple and clear design for rotation. Transparent background." assets/ships/merchant_ship.png --size 1024x1024 --quality high --background transparent
```

**Warship**:
```bash
python Imagine/imagine.py generate "Top-down view of a large warship, boardgame token style, three masts, wide imposing hull, gun ports visible, dark wood, weathered sails, intimidating but simple design. Transparent background." assets/ships/warship.png --size 1024x1024 --quality high --background transparent
```

**Faction Ships**:

**Radiant Ship**:
```bash
python Imagine/imagine.py generate "Top-down view of a Radiant faction sailing ship, golden wood, white pristine sails with subtle radiant symbols, bright and heroic aesthetic, boardgame token style, simple silhouette for rotation. Transparent background." assets/ships/radiant_ship.png --size 1024x1024 --quality high --background transparent
```

**Dire Ship**:
```bash
python Imagine/imagine.py generate "Top-down view of a Dire faction sailing ship, dark red/black wood, tattered dark sails with demonic symbols, menacing aesthetic, boardgame token style, clear silhouette for rotation. Transparent background." assets/ships/dire_ship.png --size 1024x1024 --quality high --background transparent
```

### 4. Port Icons

**Specifications**:
- **Size**: 1024x1024 pixels (standard)
- Top-down view to match map perspective
- Faction-themed (Radiant, Dire, Neutral)
- Clear, iconic, recognizable

**CRITICAL Design Requirements**:
- **Water areas should be MOSTLY TRANSPARENT (alpha)** - So port water blends with the sea map
- **City wall around the perimeter** - Makes the port "pop" visually from terrain
- **Buildings and docks are fully opaque** - Only water areas transparent
- **Wall should be visible and faction-themed**
- **Boardgame token aesthetic** - Simple, iconic, readable at small sizes
- **NO ships in images** - Just dock structures on left side

**Port Tier System**:
Ports have three tiers representing size and development:
- **Tier 1 (Town)**: 2-3 buildings, simple walls, simple dock on left
- **Tier 2 (City)**: 4-5 buildings, walls with corner towers, medium dock on left
- **Tier 3 (Capital)**: 6-7 buildings, massive walls with multiple towers, large dock on left

Filename format: `{faction_name}_port_tier{1-3}.png`

**Radiant Port**:
```bash
# From Imagine/ directory:
cd Imagine
python imagine.py generate "Top-down view of a coastal port city, Radiant faction from DOTA theme, golden roofs, bright clean buildings, docks with ships, castle with radiant banners, heroic fantasy aesthetic. City surrounded by bright stone walls with golden highlights. Water areas should be mostly transparent to blend with the sea. Buildings are opaque. Painterly style to match map. No text." ../assets/ports/radiant_port.png --size 1024x1024 --quality high --background transparent
cd ..
```

**Dire Port**:
```bash
python Imagine/imagine.py generate "Top-down view of a coastal port city, Dire faction from DOTA theme, dark red/black roofs, imposing buildings, docks with warships, fortress with dire banners, dark fantasy aesthetic. City surrounded by dark foreboding walls with red and black stone. Water areas should be mostly transparent to blend with the sea. Buildings are opaque. Painterly style to match map. No text." assets/ports/dire_port.png --size 1024x1024 --quality high --background transparent
```

**Neutral Port**:
```bash
python Imagine/imagine.py generate "Top-down view of a coastal port city, neutral merchant theme, blue/gray roofs, practical buildings, busy docks with many ships, trade warehouses, balanced aesthetic. City surrounded by simple stone walls. Water areas should be mostly transparent to blend with the sea. Buildings are opaque. Painterly style to match map. No text." assets/ports/neutral_port.png --size 1024x1024 --quality high --background transparent
```

**Note**: For faction-specific ports (Revtel, Artifact Traders, etc.), see `assets/ports/art_guidance.txt` for detailed prompts with faction-themed walls and transparent water specifications.

### 5. Dice Visuals

**Specifications**:
- **Size**: 1024x1024 pixels (standard)
- 6-sided dice
- Clear color coding: Red, Green, Blue
- Icons ONLY on colored faces
- Blank faces are completely empty (no color, no icon)

**Dice Face Colors**:
```bash
# Red (Strength) die face with icon
python Imagine/imagine.py generate "A single six-sided die face, bright red color, with a simple sword icon in white, clean game art style, flat design, clear and readable." assets/dice/face_red_sword.png --size 1024x1024 --quality high --background transparent

# Green (Agility) die face with icon
python Imagine/imagine.py generate "A single six-sided die face, bright green color, with a simple running figure icon in white, clean game art style, flat design, clear and readable." assets/dice/face_green_run.png --size 1024x1024 --quality high --background transparent

# Blue (Magic) die face with icon
python Imagine/imagine.py generate "A single six-sided die face, bright blue color, with a simple star/magic symbol icon in white, clean game art style, flat design, clear and readable." assets/dice/face_blue_magic.png --size 1024x1024 --quality high --background transparent

# Blank face (no color, no icon)
python Imagine/imagine.py generate "A single six-sided die face, plain gray/white color, completely empty with no symbols or icons, clean game art style, flat design." assets/dice/face_blank.png --size 1024x1024 --quality high --background transparent
```

**Important**: Colored faces always have icons. Blank faces are completely empty.

**Alternative: 3D Dice Models**:
Generate full 3D-looking dice if using WebGL:
```bash
python Imagine/imagine.py generate "A red six-sided die with rounded edges, 3D rendered, sword icons on each face in white, game asset style, dramatic lighting, transparent background." assets/dice/die_red_3d.png --size 1024x1024 --quality high --background transparent
```

### 6. Character Portraits

**Specifications**:
- **Size**: 1024x1024 pixels (standard)
- Face/bust portraits for captain select and crew roster
- DOTA-inspired characters
- Various classes (Warrior, Mage, Rogue, etc.)

**Example Portraits**:
```bash
# Radiant Warrior Captain
python Imagine/imagine.py generate "Portrait of a heroic Radiant warrior from DOTA universe, golden armor, determined expression, fantasy game character portrait, painted art style, warm colors, suitable for captain selection screen." assets/characters/radiant_warrior_portrait.png --size 1024x1024 --quality high --background transparent

# Dire Mage Captain
python Imagine/imagine.py generate "Portrait of a dark Dire mage from DOTA universe, purple robes, mysterious expression with glowing eyes, fantasy game character portrait, painted art style, cool colors, suitable for captain selection screen." assets/characters/dire_mage_portrait.png --size 1024x1024 --quality high --background transparent
```

### 7. UI Elements

**Size**: 1024x1024 pixels (standard for all UI)

**Buttons**:
```bash
python Imagine/imagine.py generate "A wooden button for a maritime fantasy game, carved wood texture, slightly rounded, suitable for UI element, game art style." assets/ui/button_wood.png --size 1024x1024 --quality high --background transparent
```

**Panels**:
```bash
python Imagine/imagine.py generate "A decorative panel frame for a maritime fantasy game, ornate wood border with nautical rope details, suitable for menu background, game art style, transparent center." assets/ui/panel_frame.png --size 1024x1024 --quality high --background transparent
```

**Resource Icons** (Generate for each resource tier):
```bash
python Imagine/imagine.py generate "Icon of grain wheat stalks, simple game asset icon style, clear silhouette, suitable for inventory display." assets/ui/icon_grain.png --size 1024x1024 --quality high --background transparent
```

### 8. Particle Effects (Optional)

**Size**: 1024x1024 pixels (standard)

**Wake Trail**:
```bash
python Imagine/imagine.py generate "Water wake effect for a boat, white foam and blue water splash, top-down view, game particle effect, transparent background, painterly style." assets/particles/wake.png --size 1024x1024 --quality high --background transparent
```

**Smoke**:
```bash
python Imagine/imagine.py generate "Small puff of smoke, gray and white, game particle effect, transparent background, soft edges." assets/particles/smoke.png --size 1024x1024 --quality high --background transparent
```

## Batch Generation Script

Create `generate_all_assets.py` for batch generation:

```python
import subprocess
import os

assets = [
    # Format: (prompt, output_path, size, background)
    ("BOTA logo prompt...", "assets/ui/bota_logo.png", "1024x1024", "transparent"),
    ("Map prompt...", "assets/map/world_map.png", "8192x8192", "opaque"),
    # Add all assets here
]

for prompt, output, size, bg in assets:
    cmd = [
        "python", "Imagine/imagine.py", "generate",
        prompt, output,
        "--size", size,
        "--background", bg,
        "--quality", "high"
    ]
    print(f"Generating {output}...")
    subprocess.run(cmd)
    print(f"Done: {output}\n")
```

## Asset Organization

```
assets/
├── ships/
│   ├── small_boat.png
│   ├── merchant_ship.png
│   ├── warship.png
│   ├── radiant_ship.png
│   └── dire_ship.png
├── map/
│   └── world_map.png
├── ports/
│   ├── radiant_port.png
│   ├── dire_port.png
│   └── neutral_port.png
├── dice/
│   ├── face_red_sword.png
│   ├── face_green_run.png
│   ├── face_blue_magic.png
│   └── face_blank.png
├── characters/
│   ├── radiant_warrior_portrait.png
│   ├── dire_mage_portrait.png
│   └── [more portraits]
├── ui/
│   ├── bota_logo.png
│   ├── button_wood.png
│   ├── panel_frame.png
│   └── [resource icons]
└── particles/
    ├── wake.png
    └── smoke.png
```

## Tips & Best Practices

1. **Test iterations**: Generate at smaller sizes first to test prompt
2. **Consistent style**: Use similar art style descriptions across all assets
3. **Transparent backgrounds**: Essential for sprites and tokens
4. **Clear silhouettes**: Simple shapes work best for rotated objects
5. **Color coding**: Use distinct colors for easy recognition (dice, factions)
6. **Batch generation**: Run overnight for large asset sets
7. **Version control**: Keep prompt text with assets for regeneration

## AIDEV-NOTE: Asset Loading

All assets are loaded at game start and crash if missing (fail-fast principle):

```javascript
const requiredAssets = [
    'assets/map/world_map.png',
    'assets/ships/small_boat.png',
    'assets/ui/bota_logo.png',
    // ... all required assets
];

async function loadAssets() {
    for (const path of requiredAssets) {
        const img = new Image();
        img.src = path;
        await img.decode();
        if (!img.complete) {
            throw new Error(`Failed to load required asset: ${path}`);
        }
        assets[path] = img;
    }
}
```

## Painterly Shader (Map Rendering)

For the map image, apply a painterly effect via WebGL shader:

```glsl
// Fragment shader for painterly effect
uniform sampler2D uMapTexture;
varying vec2 vTexCoord;

void main() {
    // Sample texture
    vec4 color = texture2D(uMapTexture, vTexCoord);
    
    // Apply brush stroke effect
    // (simplified - actual implementation would be more complex)
    
    gl_FragColor = color;
}
```

Alternatively, generate the map already in painterly style and skip shader complexity.

## Troubleshooting

### Error: "invalid choice" or "argument command: invalid choice"
**Problem:** Missing subcommand (generate, edit, etc.)
```bash
# ❌ WRONG
python imagine.py --prompt "..."
```
**Solution:** Add the subcommand first
```bash
# ✅ CORRECT
python imagine.py generate "..."
```

### Error: "ambiguous option: --output could match --output-format, --output-compression"
**Problem:** Using `--output` flag instead of positional argument
```bash
# ❌ WRONG
python imagine.py generate "..." --output file.png
```
**Solution:** Provide output filename as positional argument
```bash
# ✅ CORRECT
python imagine.py generate "..." file.png
```

### Error: "Cannot find path 'Imagine'" or "can't open file"
**Problem:** Not in the correct directory, or using wrong path to script
```bash
# ❌ WRONG (from project root)
python Imagine/imagine.py generate ...
```
**Solution:** Navigate to Imagine directory first
```bash
# ✅ CORRECT
cd Imagine
python imagine.py generate "..." ../assets/output.png
cd ..
```

### Error: "API key not found" or authentication errors
**Problem:** API key file missing or in wrong location
**Solution:** Ensure `openai_api_key.txt` exists in the `Imagine/` directory with your API key

### PowerShell-specific issues
**Problem:** Command chaining with `&&` doesn't work in PowerShell
```powershell
# ❌ WRONG (bash syntax)
cd Imagine && python imagine.py generate ...
```
**Solution:** Use semicolons or separate commands
```powershell
# ✅ CORRECT
cd Imagine; python imagine.py generate ...; cd ..
# OR use separate commands
cd Imagine
python imagine.py generate ...
cd ..
```

