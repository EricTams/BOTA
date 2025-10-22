// BOTA - Dice Abilities
// Metadata for all dice face abilities/icons

// AIDEV-NOTE: Ability data structure
// Each ability has:
// - icon: unique identifier
// - displayName: human-readable name
// - description: what the ability does
// - color: primary color (Red/Green/Blue)
// - targeting: Self, ally, allies, enemy, enemies
// - powerUpSlots: number of additional dice that can enhance this ability
// - powerUpColors: array of colors accepted in power-up slots

const AbilityData = {
    // Axe-specific abilities
    culling_blade: {
        icon: "culling_blade",
        displayName: "Culling Blade",
        description: "Execute damaged enemies with a devastating axe strike",
        color: "Red",
        targeting: "enemy",
        powerUpSlots: 2,
        powerUpColors: ["Red", "Red"]
    },

    counter_helix: {
        icon: "counter_helix",
        displayName: "Counter Helix",
        description: "Spin with deadly force, damaging all nearby enemies",
        color: "Red",
        targeting: "enemies",
        powerUpSlots: 2,
        powerUpColors: ["Red", "Red"]
    },

    berserkers_call: {
        icon: "berserkers_call",
        displayName: "Berserker's Call",
        description: "Taunt enemies, forcing them to attack you",
        color: "Red",
        targeting: "enemies",
        powerUpSlots: 2,
        powerUpColors: ["Red", "Red"]
    },

    // Generic combat abilities
    chop: {
        icon: "chop",
        displayName: "Chop",
        description: "A heavy axe swing at a single target",
        color: "Red",
        targeting: "enemy",
        powerUpSlots: 1,
        powerUpColors: ["Red"]
    },

    jab: {
        icon: "jab",
        displayName: "Jab",
        description: "A quick poke attack",
        color: "Green",
        targeting: "enemy",
        powerUpSlots: 1,
        powerUpColors: ["Red"]
    },

    dodge: {
        icon: "dodge",
        displayName: "Dodge",
        description: "Evade incoming attacks",
        color: "Green",
        targeting: "Self",
        powerUpSlots: 1,
        powerUpColors: ["Green"]
    }
};

// AIDEV-NOTE: Helper function to get ability data
function getAbilityData(iconName) {
    const ability = AbilityData[iconName];
    if (!ability) {
        throw new Error(`Ability with icon "${iconName}" not found`);
    }
    return ability;
}

// AIDEV-NOTE: Helper function to get all abilities
function getAllAbilities() {
    return Object.values(AbilityData);
}

// AIDEV-NOTE: Helper function to check if an icon exists
function hasAbility(iconName) {
    return iconName in AbilityData;
}

