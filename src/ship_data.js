// BOTA - Ship Data
// All ship information for the game world

// AIDEV-NOTE: Ship data structure
// Each ship contains:
// - id: Unique identifier
// - name: Display name
// - faction: Faction name or null for neutral ships
// - factionTierRequired: Relationship tier (1-3) needed to purchase, or null for neutral
// - shipyardLevelRequired: Port tier (1-3) required to purchase
// - speed: Movement speed in pixels per second
// - cargoCapacity: Maximum cargo units
// - cabins: Number of crew cabins (0-3)
// - durability: Ship durability (50-500, same scale as cargo)
// - extraDice: Array of dice objects provided by ship equipment
// - image: Path to ship sprite asset

// AIDEV-NOTE: Stat tier mappings for ship balance
// Ships are balanced using tier system to ensure variety
// Point system: lowest=-3, low=-2, medium low=-1, medium=0, medium high=+1, high=+2, highest=+3
// Tier 0 starters target -8 to -6 points total

const STAT_TIERS = {
    speed: {
        lowest: 80,
        low: 100,
        mediumLow: 120,
        medium: 140,
        mediumHigh: 160,
        high: 180,
        highest: 200
    },
    cargo: {
        lowest: 40,
        low: 50,
        mediumLow: 65,
        medium: 100,
        mediumHigh: 165,
        high: 290,
        highest: 500
    },
    cabins: {
        lowest: 0,
        low: 1,
        mediumLow: 1,
        medium: 2,
        mediumHigh: 2,
        high: 3,
        highest: 3
    },
    durability: {
        lowest: 50,
        low: 100,
        mediumLow: 150,
        medium: 200,
        mediumHigh: 300,
        high: 400,
        highest: 500
    }
};

const ShipData = [
    // NEUTRAL SHIPS
    {
        id: "ship_neutral_barge",
        name: "Merchant Barge",
        faction: null,
        factionTierRequired: null,
        shipyardLevelRequired: 1,
        speed: STAT_TIERS.speed.low,                    // 100
        cargoCapacity: STAT_TIERS.cargo.mediumHigh,     // 300
        cabins: STAT_TIERS.cabins.lowest,               // 0
        durability: STAT_TIERS.durability.low,          // 100
        extraDice: [],
        image: "assets/ships/merchant_barge.png"
    },

    // CLADDISH NAVY
    {
        id: "ship_claddish_cutter",
        name: "Patrol Cutter",
        faction: "Claddish Navy",
        factionTierRequired: 1,
        shipyardLevelRequired: 1,
        speed: STAT_TIERS.speed.mediumLow,              // 120
        cargoCapacity: STAT_TIERS.cargo.lowest,         // 40
        cabins: STAT_TIERS.cabins.low,                  // 1
        durability: STAT_TIERS.durability.mediumLow,    // 150
        extraDice: [
            { equipment: "Deck Cannons", faces: "3 red, 1 green, 2 blank" }
        ],
        image: "assets/ships/patrol_cutter.png"
    },

    // ARTIFACT TRADERS
    {
        id: "ship_artifact_skiff",
        name: "Mystic Skiff",
        faction: "Artifact Traders",
        factionTierRequired: 1,
        shipyardLevelRequired: 1,
        speed: STAT_TIERS.speed.low,                    // 100
        cargoCapacity: STAT_TIERS.cargo.lowest,         // 50
        cabins: STAT_TIERS.cabins.low,                  // 1
        durability: STAT_TIERS.durability.low,          // 100
        extraDice: [
            { equipment: "Arcane Staff", faces: "5 blue, 1 blank" },
            { equipment: "Crystal Array", faces: "4 blue, 2 blank" }
        ],
        image: "assets/ships/mystic_skiff.png"
    },

    // STONEHALL MERCHANTS
    {
        id: "ship_stonehall_trader",
        name: "Granite Trader",
        faction: "Stonehall Merchants",
        factionTierRequired: 1,
        shipyardLevelRequired: 1,
        speed: STAT_TIERS.speed.lowest,                 // 80
        cargoCapacity: STAT_TIERS.cargo.mediumHigh,     // 165
        cabins: STAT_TIERS.cabins.low,                  // 1
        durability: STAT_TIERS.durability.low,          // 100
        extraDice: [],
        image: "assets/ships/granite_trader.png"
    },

    // SLITHEREEN GUARD
    {
        id: "ship_slithereen_runner",
        name: "Tide Runner",
        faction: "Slithereen Guard",
        factionTierRequired: 1,
        shipyardLevelRequired: 1,
        speed: STAT_TIERS.speed.mediumHigh,             // 160
        cargoCapacity: STAT_TIERS.cargo.lowest,         // 50
        cabins: STAT_TIERS.cabins.low,                  // 1
        durability: STAT_TIERS.durability.low,          // 100
        extraDice: [
            { equipment: "Harpoon Launcher", faces: "3 red, 2 green, 1 blank" }
        ],
        image: "assets/ships/tide_runner.png"
    },

    // REVTEL
    {
        id: "ship_revtel_skiff",
        name: "Coral Skiff",
        faction: "Revtel",
        factionTierRequired: 1,
        shipyardLevelRequired: 1,
        speed: STAT_TIERS.speed.medium,                 // 140
        cargoCapacity: STAT_TIERS.cargo.mediumLow,      // 150
        cabins: STAT_TIERS.cabins.low,                  // 1
        durability: STAT_TIERS.durability.lowest,       // 50
        extraDice: [
            { equipment: "Coral Spikes", faces: "3 green, 2 blue, 1 blank" }
        ],
        image: "assets/ships/coral_skiff.png"
    },

    // FREE CAPTAINS
    {
        id: "ship_pirate_sloop",
        name: "Rogue's Sloop",
        faction: "Free Captains",
        factionTierRequired: 1,
        shipyardLevelRequired: 1,
        speed: STAT_TIERS.speed.highest,                // 200
        cargoCapacity: STAT_TIERS.cargo.lowest,         // 40
        cabins: STAT_TIERS.cabins.lowest,               // 0
        durability: STAT_TIERS.durability.lowest,       // 50
        extraDice: [
            { equipment: "Swivel Guns", faces: "3 red, 1 green, 2 blank" }
        ],
        image: "assets/ships/rogues_sloop.png"
    },

    // ROSELEAF TRADERS
    {
        id: "ship_roseleaf_trader",
        name: "Willowbark Trader",
        faction: "Roseleaf Traders",
        factionTierRequired: 1,
        shipyardLevelRequired: 1,
        speed: STAT_TIERS.speed.lowest,                 // 80
        cargoCapacity: STAT_TIERS.cargo.lowest,         // 40
        cabins: STAT_TIERS.cabins.medium,               // 2
        durability: STAT_TIERS.durability.low,          // 100
        extraDice: [],
        image: "assets/ships/willowbark_trader.png"
    },

    // OGLODI RAIDERS
    {
        id: "ship_oglodi_longboat",
        name: "Longboat",
        faction: "Oglodi Raiders",
        factionTierRequired: 1,
        shipyardLevelRequired: 1,
        speed: STAT_TIERS.speed.lowest,                 // 80
        cargoCapacity: STAT_TIERS.cargo.lowest,         // 40
        cabins: STAT_TIERS.cabins.mediumHigh,           // 2
        durability: STAT_TIERS.durability.low,          // 100
        extraDice: [
            { equipment: "Ram", faces: "4 red, 2 blank" }
        ],
        image: "assets/ships/oglodi_longboat.png"
    },

    // KEEN FOLK ENGINEERS
    {
        id: "ship_keenfolk_barge",
        name: "Tinker's Barge",
        faction: "Keen Folk Engineers",
        factionTierRequired: 1,
        shipyardLevelRequired: 1,
        speed: STAT_TIERS.speed.low,                    // 100
        cargoCapacity: STAT_TIERS.cargo.mediumHigh,     // 300
        cabins: STAT_TIERS.cabins.low,                  // 1
        durability: STAT_TIERS.durability.lowest,       // 50
        extraDice: [
            { equipment: "Steam Engine", faces: "3 green, 2 red, 1 blank" }
        ],
        image: "assets/ships/tinkers_barge.png"
    }
];

// AIDEV-NOTE: Helper function to get ship by ID
function getShipById(shipId) {
    return ShipData.find(ship => ship.id === shipId);
}

// AIDEV-NOTE: Helper function to get all ships
function getAllShips() {
    return ShipData;
}

// AIDEV-NOTE: Helper function to get all ships by faction
function getShipsByFaction(faction) {
    if (faction === null) {
        return ShipData.filter(ship => ship.faction === null);
    }
    return ShipData.filter(ship => ship.faction === faction);
}

// AIDEV-NOTE: Helper function to get available ships at a port
// Returns ships that player can purchase based on:
// - Port tier (shipyard level)
// - Player's faction relationships
function getAvailableShipsAtPort(portTier, playerFactionReps = {}) {
    return ShipData.filter(ship => {
        // Check if port has high enough tier shipyard
        if (ship.shipyardLevelRequired > portTier) {
            return false;
        }

        // Neutral ships are always available
        if (ship.faction === null) {
            return true;
        }

        // Check faction relationship requirement
        const playerRep = playerFactionReps[ship.faction] || 0;
        const repRequired = ship.factionTierRequired || 0;
        
        // Simple tier check (can be expanded to reputation points later)
        // For now, assume tier 1 = any positive rep, tier 2 = 30+, tier 3 = 60+
        const repThresholds = { 1: 0, 2: 30, 3: 60 };
        return playerRep >= (repThresholds[repRequired] || 0);
    });
}

// AIDEV-NOTE: Export for use in other modules
// (In browser context without modules, these are available globally)

