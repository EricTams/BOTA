# Captain Portraits

## Overview
All captain portraits are 1024x1024 pixel bust shots with transparent backgrounds, generated using the Imagine tool. Each portrait represents an iconic Dota 2 character themed to their faction.

## Generated Portraits

### 1. Kunkka (Claddish Navy)
**File**: `assets/characters/captain_kunkka.png`
**Description**: Legendary Admiral with tricorn hat, naval uniform with gold epaulettes, holding Tidebringer sword. Heroic and determined expression.
**Color Scheme**: White and gold, dramatic lighting
**Dice**: 4R/2G personal, 5R/1G equipment (Tidebringer)

### 2. Rubick (Artifact Traders)
**File**: `assets/characters/captain_rubick.png`
**Description**: Grand Magus with tall pointed green hood and mask, glowing green eyes, arcane energy swirling around.
**Color Scheme**: Green and gold, magical glow lighting
**Dice**: 4B/2G personal, 6B equipment (Arcane Supremacy)

### 3. Alchemist (Stonehall Merchants)
**File**: `assets/characters/captain_alchemist.png`
**Description**: Small goblin alchemist riding on large ogre's shoulders, wearing goggles and merchant robes, counting gold coins.
**Color Scheme**: Brown and gold, warm lighting
**Dice**: 3G/3B personal, 4G/2B equipment (Alchemical Apparatus)

### 4. Slardar (Slithereen Guard)
**File**: `assets/characters/captain_slardar.png`
**Description**: Powerful Slithereen warrior with purple scaled skin, golden crown and armor, holding trident. Guardian of the deep.
**Color Scheme**: Purple and gold, dramatic underwater lighting
**Dice**: 3R/3G personal, 4R/2G equipment (Trident of the Deep)

### 5. Naga Siren (Revtel)
**File**: `assets/characters/captain_naga_siren.png`
**Description**: Beautiful serpentine warrior queen with scaled teal skin, elegant face with golden jewelry and crown, long flowing hair.
**Color Scheme**: Teal and gold, soft magical lighting
**Dice**: 2G/4B personal, 4B/2G equipment (Song of the Siren)

### 6. Tidehunter (Free Captains)
**File**: `assets/characters/captain_tidehunter.png`
**Description**: Massive intimidating sea creature with wide mouth full of sharp teeth, greenish-teal aquatic skin with blue-green scales, large anchor weapon visible.
**Color Scheme**: Teal and dark blue-green, dramatic harsh lighting
**Dice**: 2R/4G personal, 3R/3G equipment (Ravage)

### 7. Enchantress (Roseleaf Traders)
**File**: `assets/characters/captain_enchantress.png`
**Description**: Cheerful young fawn-like creature with deer features, red hair with flowers, innocent large eyes, gentle smile, nature magic with glowing plants and butterflies.
**Color Scheme**: Green and floral, soft warm lighting
**Dice**: 1R/5G personal, 2G/4B equipment (Nature's Attendants)

### 8. Axe (Oglodi Raiders)
**File**: `assets/characters/captain_axe.png`
**Description**: Massive brutal red-skinned Oglodi warrior with fierce snarling expression, bald head with war paint, enormous muscular build, holding massive axe weapon.
**Color Scheme**: Red and black, dramatic harsh lighting
**Dice**: 5R/1G personal, 4R/2G equipment (Berserker's Call)

### 9. Tinker (Keen Folk Engineers)
**File**: `assets/characters/captain_tinker.png`
**Description**: Small keen folk inventor with goggles pushed up on head, intelligent expression, mechanical armor and gadgets, robotic laser weapon components.
**Color Scheme**: Blue and copper, bright technical lighting
**Dice**: 3R/3G personal, 4R/2B equipment (Laser Array)

## Technical Specifications

- **Resolution**: 1024x1024 pixels
- **Format**: PNG with opaque painterly backgrounds
- **Style**: Epic fantasy game character portrait, painted art style
- **Composition**: Close-up bust shot showing face and shoulders
- **Background**: Painterly themed backgrounds (ocean, magic, forest, etc.)
- **Art Direction**: Dota 2 character designs, thematically matched to factions

## Usage in Game

These portraits are used in:
- **Captain Select Screen**: Grid of small portraits for choosing your starting captain
- **Faction Details Panel**: Large portrait display in the details panel on Captain Select screen
  - Shows captain portrait prominently
  - Displays captain name, faction, and description
  - Shows personal die and equipment die faces
  - Displays starting ship for that faction
- **Game UI**: May appear in character sheets or captain-related features during gameplay

## Data Integration

All portraits are referenced in `src/captain_data.js` with the `image` property pointing to the corresponding PNG file in `assets/characters/`.

Each captain also has a `startingPort` property that determines where the player's boat spawns when beginning a voyage with that captain.

## Dice Pool Balance

Each captain + their faction's starting ship provides a unique dice combination:
- **Claddish Navy (Kunkka)**: 12R, 4G, 0B - Pure combat/defense
- **Artifact Traders (Rubick)**: 0R, 2G, 19B - Heavy magic focus
- **Stonehall Merchants (Alchemist)**: 0R, 7G, 5B - Defensive with magic
- **Slithereen Guard (Slardar)**: 10R, 8G, 0B - Balanced combat/defense
- **Revtel (Naga Siren)**: 0R, 7G, 10B - Defensive with strong magic
- **Free Captains (Tidehunter)**: 8R, 9G, 0B - Balanced tank
- **Roseleaf Traders (Enchantress)**: 1R, 8G, 4B - Defensive nature magic
- **Oglodi Raiders (Axe)**: 13R, 3G, 0B - Pure aggression
- **Keen Folk Engineers (Tinker)**: 9R, 6G, 2B - Combat/defense with tech

## Starting Ports

Each captain begins their voyage at a specific port from their faction:

- **Kunkka** (Claddish Navy): Naval Command (port_claddish_02)
- **Rubick** (Artifact Traders): Arcane Crossroads (port_artifact_02)
- **Alchemist** (Stonehall Merchants): Merchant's District (port_stonehall_02)
- **Slardar** (Slithereen Guard): Guard Outpost (port_slithereen_02)
- **Naga Siren** (Revtel): Reef Sanctuary (port_revtel_02)
- **Tidehunter** (Free Captains): Smuggler's Cove (port_freecaptains_02)
- **Enchantress** (Roseleaf Traders): Leafwhisper Trading Post (port_roseleaf_02)
- **Axe** (Oglodi Raiders): Warblade Fortress (port_oglodi_02)
- **Tinker** (Keen Folk Engineers): Cogwheel Port (port_keenfolk_01)

The player's boat spawns 50 pixels south of the starting port to avoid overlapping with the port icon.

## Regeneration

To regenerate all captain portraits, use the commands in `generate_captain_portraits.txt`. Run from the `Imagine/` directory using PowerShell.

