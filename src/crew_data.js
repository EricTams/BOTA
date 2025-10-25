// BOTA - Crew Data
// All crew information for ship management and combat

// AIDEV-NOTE: Crew data structure
// Each crew contains:
// - id: Unique identifier
// - name: Display name (short and snappy)
// - description: Brief flavor text about the crew type
// - health: Health total (30-100)
// - personalDie: Object with faces property (0-6 faces, can have blanks)
// - equipmentDie: Object with equipment name and faces property (0-6 faces, can have blanks, optional)
// - faction: Faction that can hire this crew (null = available to all factions)
//
// AIDEV-NOTE: Crew dice design rules
// - Can have 0, 1, or 2 dice total
// - Personal die represents crew's innate abilities
// - Equipment die represents their gear/weapons (optional)
// - Faces can be blank (null color and icon)
// - Maximum 2 colors per die
// - Red = combat, Green = defense, Blue = magic
//
// AIDEV-NOTE: Crew Usage in Game
// - Ship management: Assign crew to ships
// - Combat: Crew dice are rolled alongside captain and ship dice
// - Health: Crew can be wounded/killed in combat
// - Equipment: Some crew come with their own gear

const CrewData = [
    // Basic crew that mans the ship
    {
        id: "crew",
        name: "Crew",
        description: "Basic sailors and deckhands who operate the ship's equipment.",
        health: 50,
        personalDie: null, // Uses ship equipment
        equipmentDie: null, // Uses ship equipment
        faction: null // Available to all factions
    },

    // Combat specialists
    {
        id: "marines",
        name: "Marines",
        description: "Professional soldiers trained for ship-to-ship combat.",
        health: 80,
        personalDie: {
            faces: "3 red, 3 green"
        },
        equipmentDie: {
            equipment: "Marine Gear",
            faces: "3 red, 3 green"
        },
        faction: null // Available to all factions
    },

    // Ranged specialists
    {
        id: "sharpshooters",
        name: "Sharpshooters",
        description: "Elite marksmen with precision weapons and keen eyes.",
        health: 60,
        personalDie: {
            faces: "3 green, 3 blue"
        },
        equipmentDie: {
            equipment: "Precision Rifles",
            faces: "6 green"
        },
        faction: null // Available to all factions
    },

    // Heavy combat troops
    {
        id: "grunts",
        name: "Grunts",
        description: "Tough fighters who rely on brute strength and determination.",
        health: 90,
        personalDie: {
            faces: "6 red"
        },
        equipmentDie: null, // No equipment die
        faction: null // Available to all factions
    },

    // Magic specialists
    {
        id: "apprentices",
        name: "Apprentices",
        description: "Young mages learning the arcane arts under experienced masters.",
        health: 40,
        personalDie: {
            faces: "6 blue"
        },
        equipmentDie: null, // No equipment die
        faction: null // Available to all factions
    }
];

// AIDEV-NOTE: Helper function to get crew by ID
function getCrewById(crewId) {
    const crew = CrewData.find(c => c.id === crewId);
    if (!crew) {
        throw new Error(`Crew with id "${crewId}" not found`);
    }
    return crew;
}

// AIDEV-NOTE: Helper function to get all crew
function getAllCrew() {
    return CrewData;
}

// AIDEV-NOTE: Helper function to get crew by faction
function getCrewByFaction(faction) {
    return CrewData.filter(c => c.faction === faction || c.faction === null);
}

// AIDEV-NOTE: Helper function to get crew with equipment dice
function getCrewWithEquipment() {
    return CrewData.filter(c => c.equipmentDie !== null);
}

// AIDEV-NOTE: Export for use in other modules
// (In browser context without modules, these are available globally)
