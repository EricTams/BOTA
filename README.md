# BOTA - Boats of the Ancients

A real-time maritime trading simulation game themed by DOTA.

## Game Overview

Navigate your boat across a vast ocean map, trading resources between ports, recruiting crew, engaging in dice-based challenges, and building your fortune over 52 weeks of gameplay. The world is alive with AI-controlled ships, dynamic economies, and faction politics.

## Core Gameplay

### Navigation & World
- **Continuous map**: Navigate freely across a large ocean map (not grid-based)
- **Single map image**: Beautiful painterly-style map rendered with shader effects
- **Collision detection**: Stay on water, avoid land masses
- **Camera system**: Smooth scrolling and zoom following your boat

### Trading Economy
- **6-tier resource system**: From raw materials (Grain, Wood) to luxury goods (Magic Items, Artifacts)
- **Production chains**: Resources processed through multiple tiers
- **Dynamic pricing**: Supply and demand affect prices (±60% variance)
- **City simulation**: Cities produce and consume goods, creating trade opportunities

### Factions & Reputation
- **Multiple factions**: Claddish Navy, Artifact Traders, Stonehall Merchants, Revtel, and more
- **Reputation system**: Track your standing with each faction
- **Faction benefits**: Exclusive boats, special goods, and building permissions at high reputation
- **Inter-faction relations**: Factions have relationships with each other

### Dice Challenges
- **Dual-purpose dice**: Colors for skill challenges, icons for combat
- **Skill colors**: Red (Strength), Green (Agility), Blue (Magic)
- **Crew dice pools**: Characters provide dice for encounters
- **Dice manipulation**: Re-rolls, locks, and modifiers

### Crew & Characters
- **Captain selection**: Choose starting captain with unique stats and starting conditions
- **Crew recruitment**: Hire heroes at taverns to boost your dice pool
- **Character abilities**: Different characters provide different dice types

### Time & Simulation
- **52-week game**: One year of in-game time (default)
- **Time controls**: Pause, 1x, 2x, 4x speed
- **Simulation tick**: World events happen on independent simulation loop
- **Monthly balance sheet**: Track income, expenses, and progress

## Victory Condition

**Highest wealth after 52 weeks wins!**
- Score = Total gold + cargo value + ship value
- Difficulty affects game duration and starting challenges
- No "game over" - just compete for high scores

## Technology Stack

- **Platform**: HTML5 game for web browsers
- **Rendering**: Canvas API with painterly shader for map
- **Deployment**: GitHub Pages
- **Language**: Vanilla JavaScript (no frameworks)
- **Assets**: Generated via Imagine tool (OpenAI DALL-E API)

## File Organization

```
BOTA/
├── index.html              Main game page
├── src/
│   ├── game.js            Main game loop and state
│   ├── renderer.js        Canvas rendering system
│   ├── input.js           User input handling
│   ├── map.js             Map navigation and collision
│   ├── trading.js         Trading system
│   ├── dice.js            Dice mechanics
│   ├── simulation.js      World simulation
│   └── ai.js              AI boat behavior
├── assets/                 Game images and resources
├── css/                    Stylesheets
├── docs/                   Feature documentation
├── Imagine/                Asset generation tool
└── README.md              This file
```

## Feature Documentation

Detailed documentation for each major system:

- [Map Navigation](docs/MAP_NAVIGATION.md) - Continuous map, collision, camera
- [Trading System](docs/TRADING_SYSTEM.md) - Buying, selling, inventory
- [Resources & Economy](docs/RESOURCES_AND_ECONOMY.md) - Resource tiers, production chains
- [Faction System](docs/FACTION_SYSTEM.md) - Reputation, faction relationships
- [Dice System](docs/DICE_SYSTEM.md) - Skill challenges, combat dice
- [Characters & Crew](docs/CHARACTERS_AND_CREW.md) - Recruitment, abilities
- [World Simulation](docs/WORLD_SIMULATION.md) - City production, time controls
- [AI Boats](docs/AI_BOATS.md) - NPC behavior, trading AI
- [Editor Mode](docs/EDITOR_MODE.md) - In-game map editor
- [Game Progression](docs/GAME_PROGRESSION.md) - Victory, difficulty, save system
- [Boats](docs/BOATS.md) - Boat stats, upgrades, acquisition
- [UI Screens](docs/UI_SCREENS.md) - All game screens and navigation
- [Asset Generation](docs/ASSET_GENERATION.md) - Creating game art

## Design Principles

1. **Canvas-only rendering**: All game objects drawn on Canvas, no DOM manipulation
2. **Simple and explicit**: Functions under 20 lines, clear names, no magic
3. **Modular features**: Each system is independent and documented
4. **Crash early**: Fail loudly during development, never hide bugs
5. **YAGNI**: Only implement what's needed right now

## Development

### Running Locally
Simply open `index.html` in a web browser. No build process required.

### Asset Generation
Use the Imagine tool in `Imagine/` folder:
```bash
python Imagine/imagine.py generate "prompt" output.png --background transparent
```

See [Asset Generation](docs/ASSET_GENERATION.md) for detailed prompts.

### GitHub Pages Deployment
Push to GitHub and enable GitHub Pages on the main branch. Game will be live at:
```
https://yourusername.github.io/BOTA/
```

## Credits

- **Game Design**: Inspired by Port Royale 4 and DOTA 2
- **Asset Generation**: OpenAI DALL-E API via Imagine tool
- **Development**: Built with vanilla JavaScript and HTML5 Canvas

## License

TBD

