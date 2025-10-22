// BOTA - Dice Data
// All dice definitions for captains and crew

// AIDEV-NOTE: Dice face structure
// Each die has 6 faces
// Each face has: { color: "Red"/"Green"/"Blue"/null, icon: "icon_name"/null }
// color: null and icon: null = blank face
// All colored faces MUST have an icon

// AIDEV-NOTE: Axe's Dice
// Personal Die: 3 counter_helix (red), 2 berserkers_call (red), 1 jab (green)
// Equipment Die: 2 culling_blade (red), 2 chop (red), 2 dodge (green)

const DiceData = {
    // Axe's Personal Die
    axe_personal: {
        id: "axe_personal",
        name: "Axe's Personal Die",
        owner: "captain_axe",
        faces: [
            { color: "Red", icon: "counter_helix" },
            { color: "Red", icon: "counter_helix" },
            { color: "Red", icon: "counter_helix" },
            { color: "Red", icon: "berserkers_call" },
            { color: "Red", icon: "berserkers_call" },
            { color: "Green", icon: "jab" }
        ]
    },

    // Axe's Equipment Die (Berserker's Call)
    axe_equipment: {
        id: "axe_equipment",
        name: "Berserker's Call Die",
        owner: "captain_axe",
        equipment: "Berserker's Call",
        faces: [
            { color: "Red", icon: "culling_blade" },
            { color: "Red", icon: "culling_blade" },
            { color: "Red", icon: "chop" },
            { color: "Red", icon: "chop" },
            { color: "Green", icon: "dodge" },
            { color: "Green", icon: "dodge" }
        ]
    }
};

// AIDEV-NOTE: Helper function to get die by ID
function getDieByName(dieName) {
    const die = DiceData[dieName];
    if (!die) {
        throw new Error(`Die with name "${dieName}" not found`);
    }
    return die;
}

// AIDEV-NOTE: Helper function to get all dice
function getAllDice() {
    return Object.values(DiceData);
}

// AIDEV-NOTE: Get all dice for a specific captain
function getDiceForCaptain(captainId) {
    return Object.values(DiceData).filter(die => die.owner === captainId);
}

