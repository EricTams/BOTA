# AI Boats System

## Overview

AI-controlled boats populate the world, creating a living economy. They trade goods, follow routes, and can be interacted with through encounters.

## AI Boat Types

### Merchant Traders
- **Behavior**: Buy low, sell high on common goods
- **Cargo**: Tier 1-3 resources (bulk goods)
- **Speed**: Medium
- **Combat**: Avoid conflict, flee from pirates
- **Routes**: Predictable, profitable routes between ports

### Luxury Traders
- **Behavior**: Trade high-value goods
- **Cargo**: Tier 4-6 resources (low volume, high value)
- **Speed**: Fast
- **Combat**: Armed escorts, will defend
- **Routes**: Less frequent, longer distances

### Faction Supply Ships
- **Behavior**: Supply faction ports with needed goods
- **Cargo**: Whatever faction needs
- **Speed**: Slow (heavy cargo)
- **Combat**: Heavily defended
- **Routes**: Between faction-controlled ports

### Pirates
- **Behavior**: Attack weak ships, steal cargo
- **Cargo**: Stolen goods, weapons
- **Speed**: Fast (chase down targets)
- **Combat**: Aggressive, initiate attacks
- **Routes**: Patrol trade lanes, ambush points

### Fishing Boats
- **Behavior**: Gather fish, sell at ports
- **Cargo**: Fish only
- **Speed**: Slow
- **Combat**: Defenseless, flee immediately
- **Routes**: Coastal waters near fishing grounds

## AI Decision Making

### Decision Cycle
Every X simulation ticks, AI boats make decisions:

1. **Assess state**: Where am I? What cargo do I have?
2. **Scan environment**: Nearby ports, other boats, threats
3. **Calculate options**: Possible actions and outcomes
4. **Choose action**: Best option based on AI type
5. **Execute**: Set destination, initiate trade, attack, etc.

### Trading Logic

**For Merchant AI**:
```
1. If cargo is empty:
   - Find port with low-price goods
   - Buy goods to fill cargo
   
2. If cargo is full:
   - Find port with high prices for my goods
   - Navigate to that port
   - Sell goods
   
3. Calculate profit potential:
   - (Sell price - Buy price) × Cargo amount
   - Factor in distance (time = money)
   - Choose best option
```

### Combat Logic

**For Pirate AI**:
```
1. Scan for targets nearby
2. Evaluate target strength:
   - Ship size (bigger = stronger)
   - Armed vs unarmed
   - Faction (military = dangerous)
   
3. If target is weak:
   - Chase and attack
   
4. If target is strong:
   - Avoid and find easier prey
```

**For Merchant AI**:
```
1. If pirate nearby:
   - Calculate distance to safety (port or patrol)
   - Flee at maximum speed
   - Drop cargo if necessary (future feature)
   
2. If cannot escape:
   - Surrender (lose cargo)
   - Or fight (if armed)
```

## AI Movement

### Pathfinding
- **Straight line**: Direct route to destination (if clear water)
- **Obstacle avoidance**: Navigate around land
- **A* pathfinding**: For complex routes (optional, if needed)
- **Current following**: Slight speed boost in certain areas (future)

### Movement Speed
- **Base speed**: Determined by boat type
- **Simulation multiplier**: Affected by time control
- **Hazards**: Slow down in dangerous waters
- **Wind** (future): Speed affected by wind direction

### Collision Avoidance
- **Keep distance**: AI boats avoid each other
- **Give way rules**: Larger ships have priority
- **Emergency stops**: Prevent crashes

## AI-Player Interactions

### Encounter Types

**Trade Offer**:
- AI boat flags you down
- Offers to buy/sell specific goods
- Prices may be better or worse than ports
- Opportunity for quick trade

**Distress Call**:
- AI boat requests help
- May need repairs, supplies, or escort
- Reward: Gold, reputation, or goods

**Pirate Attack**:
- Pirate boat chases player
- Triggers combat encounter
- Escape or fight

**Escort Request**:
- AI boat offers gold for protection
- Follow and defend for duration
- Payment on successful delivery

**Faction Patrol**:
- Military boat inspects cargo
- If smuggling contraband: Fine or confiscation
- If clean: Minor reputation boost

### Hailing System
Player can initiate interaction:
1. Get close to AI boat
2. Press hail button
3. See options: Trade, Ignore, Attack (if hostile)
4. AI responds based on faction, relationship

## AI Boat Spawning

### Spawn Points
- **Ports**: Boats spawn at faction ports
- **Trade lanes**: Appear along major routes
- **Open ocean**: Random encounters

### Spawn Rules
- **Population cap**: Maximum number of AI boats in world
- **Faction balance**: Each faction has proportional representation
- **Dynamic spawning**: More boats in active trade areas
- **Despawn**: Boats that reach destination may despawn

### Spawn Frequency
- **Simulation-based**: Spawn every X ticks
- **Demand-driven**: More spawns when economy needs trade
- **Event-driven**: Wars increase military ships, piracy increases

## AI Behaviors by Faction

### Claddish Navy Boats
- **Behavior**: Patrol trade routes, hunt pirates
- **Interaction**: Friendly to allies, inspect for contraband
- **Combat**: Strong, well-armed
- **Trade**: Rarely trade, mostly patrol

### Artifact Trader Boats
- **Behavior**: Transport magical goods
- **Interaction**: Neutral, cautious
- **Combat**: Moderate defenses, magic-enhanced
- **Trade**: Rare goods, expensive

### Stonehall Boats
- **Behavior**: Transport metal goods and coal
- **Interaction**: Friendly to traders
- **Combat**: Heavily armored, slow
- **Trade**: Industrial goods, fair prices

### Slithereen/Revtel Boats
- **Behavior**: Coastal trading, underwater access
- **Interaction**: Cautious with surface dwellers
- **Combat**: Amphibious advantages
- **Trade**: Exotic aquatic goods

### Free Captain (Pirate) Boats
- **Behavior**: Hunt weak targets, avoid military
- **Interaction**: Hostile unless bribed
- **Combat**: Fast, aggressive
- **Trade**: Stolen goods, black market

## AI Boat Visuals

### Ship Tokens
- **Faction colors**: Match controlling faction
- **Size variation**: Visual difference between types
- **Direction indicator**: Arrow or orientation
- **Status indicator**: Trading, fleeing, attacking (color glow/icon)

### Movement Animation
- **Smooth interpolation**: Between simulation positions
- **Wake trails**: Particle effects behind boats
- **Rotation**: Smoothly turn toward destination
- **Speed variation**: Visual difference between fast/slow boats

## AIDEV-NOTE: AI Data Structures

```javascript
// AI boat definition
{
    boatId: "ai_merchant_claddish_01",
    type: "merchant_trader",
    faction: "CladdishNavy",
    
    position: { x: 1500, y: 2000 },
    velocity: { vx: 2.5, vy: 1.2 },
    destination: { x: 3000, y: 2500, portId: "port_stonehall" },
    
    stats: {
        speed: 100,
        cargoCapacity: 200,
        crewCapacity: 6,
        armed: false
    },
    
    cargo: {
        "Grain": 50,
        "Wood": 80,
        "Beer": 30
    },
    
    gold: 1500,
    
    state: "traveling",  // traveling, docked, trading, fleeing, attacking
    lastDecisionTick: 1250,
    decisionCooldown: 30,  // ticks between decisions
    
    aiPersonality: {
        riskTolerance: 0.3,    // 0-1, willingness to take risks
        profitMinimum: 0.15,   // Minimum 15% profit to trade
        fleeThreshold: 0.7     // Flee if threat level > 70%
    }
}

// AI decision result
{
    action: "navigate_to_port",
    target: { portId: "port_stonehall", x: 3000, y: 2500 },
    reasoning: "High price for Grain (180g vs 40g buy price)",
    expectedProfit: 7000
}
```

## AI Difficulty

### Easy (Fewer AI Boats)
- Less competition for resources
- Easier to find profitable routes
- Pirates less common

### Normal
- Balanced AI population
- Competitive but fair
- Standard pirate threat

### Hard (More AI Boats)
- High competition for goods
- Prices equilibrate quickly (less profit margin)
- Frequent pirate encounters
- Smarter AI (better decisions)

## Performance Optimization

### Spatial Partitioning
- Divide map into grid sectors
- Only calculate AI for nearby sectors
- Distant boats use simplified simulation

### Update Frequency
- Nearby boats: Every tick
- Medium distance: Every 5 ticks
- Far away: Every 10 ticks
- Off-screen: Every 30 ticks

### LOD (Level of Detail)
- Close: Full simulation, pathfinding, animations
- Medium: Basic simulation, straight-line movement
- Far: Position updates only
- Very far: No updates (frozen until player approaches)

## Future Enhancements (TBD)

- AI personalities (aggressive, cautious, greedy)
- AI alliances (travel in convoys)
- AI learning (adapt to player strategies)
- AI diplomacy (form trade agreements)
- Named AI captains with reputations
- AI quests (recurring characters)
- AI bounties (hunt specific pirates)
- Dynamic AI economies (AI can go bankrupt)

