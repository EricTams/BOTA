// BOTA - Captain Data
// All captain information for the faction select screen

// AIDEV-NOTE: Captain data structure
// Each captain contains:
// - id: Unique identifier
// - name: Display name (Dota hero name)
// - faction: Faction name (must match port_data.js factions)
// - description: 1-2 sentence flavor text about the captain
// - personalDie: Object with faces property (all 6 faces filled, no blanks)
// - equipmentDie: Object with equipment name and faces property (all 6 faces filled, no blanks)
// - image: Path to captain portrait (1024x1024 bust shot, painterly opaque background)
// - startingPort: Port ID where captain begins their voyage (from port_data.js)
//
// AIDEV-NOTE: Dice design rules
// - All 6 faces must be filled (no blanks allowed on captain dice)
// - Maximum 2 colors per die
// - Red = combat, Green = defense, Blue = magic
// - Personal die represents captain's innate abilities
// - Equipment die represents their signature item/weapon
//
// AIDEV-NOTE: Captain + Starting Ship Dice Totals (for balance verification)
// Each faction's total dice pool is unique to encourage different playstyles
//
// AIDEV-NOTE: Captain Usage in UI
// - Captain Select Screen: Grid of small captain portraits for selection
// - Faction Details Panel: Large captain portrait display with dice info when selected
// - Choosing a captain determines starting faction and starting ship

const CaptainData = [
    // CLADDISH NAVY
    {
        id: "captain_kunkka",
        name: "Kunkka",
        faction: "Claddish Navy",
        description: "Legendary Admiral of the Claddish Fleet. Commands the seas with his enchanted blade and tactical brilliance.",
        personalDie: {
            faces: "4 red, 2 green"
        },
        equipmentDie: {
            equipment: "Tidebringer",
            faces: "5 red, 1 green"
        },
        image: "assets/characters/captain_kunkka.png",
        startingPort: "port_claddish_02" // Naval Command
    },

    // ARTIFACT TRADERS
    {
        id: "captain_rubick",
        name: "Rubick",
        faction: "Artifact Traders",
        description: "Grand Magus of the Artifact Traders. Master of arcane knowledge and magical manipulation.",
        personalDie: {
            faces: "4 blue, 2 green"
        },
        equipmentDie: {
            equipment: "Arcane Supremacy",
            faces: "6 blue"
        },
        image: "assets/characters/captain_rubick.png",
        startingPort: "port_artifact_02" // Arcane Crossroads
    },

    // STONEHALL MERCHANTS
    {
        id: "captain_alchemist",
        name: "Alchemist",
        faction: "Stonehall Merchants",
        description: "Shrewd merchant and master of transmutation. Turns base metals into gold and risk into profit.",
        personalDie: {
            faces: "3 green, 3 blue"
        },
        equipmentDie: {
            equipment: "Alchemical Apparatus",
            faces: "4 green, 2 blue"
        },
        image: "assets/characters/captain_alchemist.png",
        startingPort: "port_stonehall_02" // Merchant's District
    },

    // SLITHEREEN GUARD
    {
        id: "captain_slardar",
        name: "Slardar",
        faction: "Slithereen Guard",
        description: "Elite guardian of the deep. Patrols the seas with strength and unwavering vigilance.",
        personalDie: {
            faces: "3 red, 3 green"
        },
        equipmentDie: {
            equipment: "Trident of the Deep",
            faces: "4 red, 2 green"
        },
        image: "assets/characters/captain_slardar.png",
        startingPort: "port_slithereen_02" // Guard Outpost
    },

    // REVTEL
    {
        id: "captain_naga_siren",
        name: "Naga Siren",
        faction: "Revtel",
        description: "Enchanting queen of the coral reefs. Commands the tides and mesmerizes all who hear her song.",
        personalDie: {
            faces: "2 green, 4 blue"
        },
        equipmentDie: {
            equipment: "Song of the Siren",
            faces: "4 blue, 2 green"
        },
        image: "assets/characters/captain_naga_siren.png",
        startingPort: "port_revtel_02" // Reef Sanctuary
    },

    // FREE CAPTAINS
    {
        id: "captain_tidehunter",
        name: "Tidehunter",
        faction: "Free Captains",
        description: "Fearsome pirate lord of the Free Captains. Brings devastation with the power of the ocean's fury.",
        personalDie: {
            faces: "2 red, 4 green"
        },
        equipmentDie: {
            equipment: "Ravage",
            faces: "3 red, 3 green"
        },
        image: "assets/characters/captain_tidehunter.png",
        startingPort: "port_freecaptains_02" // Smuggler's Cove
    },

    // ROSELEAF TRADERS
    {
        id: "captain_enchantress",
        name: "Enchantress",
        faction: "Roseleaf Traders",
        description: "Nature's protector and peaceful trader. Her cheerful demeanor hides formidable wilderness magic.",
        personalDie: {
            faces: "1 red, 5 green"
        },
        equipmentDie: {
            equipment: "Nature's Attendants",
            faces: "2 green, 4 blue"
        },
        image: "assets/characters/captain_enchantress.png",
        startingPort: "port_roseleaf_02" // Leafwhisper Trading Post
    },

    // OGLODI RAIDERS
    {
        id: "captain_axe",
        name: "Axe",
        faction: "Oglodi Raiders",
        description: "Brutal warlord of the Oglodi Raiders. Leads from the front with overwhelming strength and bloodlust.",
        personalDie: {
            faces: "5 red, 1 green"
        },
        equipmentDie: {
            equipment: "Berserker's Call",
            faces: "4 red, 2 green"
        },
        image: "assets/characters/captain_axe.png",
        startingPort: "port_oglodi_02" // Warblade Fortress
    },

    // KEEN FOLK ENGINEERS
    {
        id: "captain_tinker",
        name: "Tinker",
        faction: "Keen Folk Engineers",
        description: "Brilliant inventor of experimental gadgets and weaponry. Every voyage is a field test for new contraptions.",
        personalDie: {
            faces: "3 red, 3 green"
        },
        equipmentDie: {
            equipment: "Laser Array",
            faces: "4 red, 2 blue"
        },
        image: "assets/characters/captain_tinker.png",
        startingPort: "port_keenfolk_01" // Cogwheel Port
    }
];

// AIDEV-NOTE: Helper function to get captain by ID
function getCaptainById(captainId) {
    const captain = CaptainData.find(c => c.id === captainId);
    if (!captain) {
        throw new Error(`Captain with id "${captainId}" not found`);
    }
    return captain;
}

// AIDEV-NOTE: Helper function to get captain by faction
function getCaptainByFaction(faction) {
    const captain = CaptainData.find(c => c.faction === faction);
    if (!captain) {
        throw new Error(`Captain for faction "${faction}" not found`);
    }
    return captain;
}

// AIDEV-NOTE: Helper function to get all captains
function getAllCaptains() {
    return CaptainData;
}

// AIDEV-NOTE: Export for use in other modules
// (In browser context without modules, these are available globally)

