// BOTA - Dice Abilities
// Metadata for all dice face abilities/icons

// AIDEV-NOTE: Ability data structure
// Each ability has:
// - icon: unique identifier
// - displayName: human-readable name
// - description: what the ability does (can use {base}, {perSlot}, {X}, {result} variables)
// - baseDamage/baseHeal/baseArmor/baseEvasion: starting value
// - damagePerSlot/healPerSlot/armorPerSlot/evasionPerSlot: value added per filled power-up slot
// - color: primary color (Red/Green/Blue) - used for die face background
// - targeting: Self, ally, allies, enemy, enemies
// - powerUpSlots: number of additional dice that can enhance this ability
// - powerUpColors: array of colors accepted in power-up slots

const AbilityData = {
    // Axe-specific abilities
    culling_blade: {
        icon: "culling_blade",
        displayName: "Culling Blade",
        description: "Deal {base} + {perSlot}*{X} damage",
        baseDamage: 15,
        damagePerSlot: 10,
        color: "Red",
        targeting: "enemy",
        powerUpSlots: 2,
        powerUpColors: ["Red", "Red"]
    },

    counter_helix: {
        icon: "counter_helix",
        displayName: "Counter Helix",
        description: "Deal {base} + {perSlot}*{X} damage to all nearby enemies when hit",
        baseDamage: 8,
        damagePerSlot: 4,
        color: "Red",
        targeting: "enemies",
        powerUpSlots: 2,
        powerUpColors: ["Red", "Red"]
    },

    berserkers_call: {
        icon: "berserkers_call",
        displayName: "Berserker's Call",
        description: "Taunt enemies, gain {base} + {perSlot}*{X} armor",
        baseArmor: 10,
        armorPerSlot: 5,
        color: "Red",
        targeting: "enemies",
        powerUpSlots: 2,
        powerUpColors: ["Red", "Red"]
    },

    // Generic combat abilities
    chop: {
        icon: "chop",
        displayName: "Chop",
        description: "Deal {base} + {perSlot}*{X} damage",
        baseDamage: 6,
        damagePerSlot: 3,
        color: "Red",
        targeting: "enemy",
        powerUpSlots: 1,
        powerUpColors: ["Red"]
    },

    jab: {
        icon: "jab",
        displayName: "Jab",
        description: "Deal {base} + {perSlot}*{X} damage",
        baseDamage: 4,
        damagePerSlot: 2,
        color: "Green",
        targeting: "enemy",
        powerUpSlots: 1,
        powerUpColors: ["Red"]
    },

    dodge: {
        icon: "dodge",
        displayName: "Dodge",
        description: "Gain {base} + {perSlot}*{X} evasion",
        baseEvasion: 5,
        evasionPerSlot: 3,
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

// AIDEV-NOTE: Calculate ability result based on filled slots
function calculateAbilityValue(ability, filledSlots = 0) {
    // Determine the base and per-slot values
    let base = 0;
    let perSlot = 0;
    let valueType = '';
    
    if (ability.baseDamage !== undefined) {
        base = ability.baseDamage;
        perSlot = ability.damagePerSlot || 0;
        valueType = 'damage';
    } else if (ability.baseHeal !== undefined) {
        base = ability.baseHeal;
        perSlot = ability.healPerSlot || 0;
        valueType = 'healing';
    } else if (ability.baseArmor !== undefined) {
        base = ability.baseArmor;
        perSlot = ability.armorPerSlot || 0;
        valueType = 'armor';
    } else if (ability.baseEvasion !== undefined) {
        base = ability.baseEvasion;
        perSlot = ability.evasionPerSlot || 0;
        valueType = 'evasion';
    }
    
    const result = base + perSlot * filledSlots;
    
    return {
        base,
        perSlot,
        filledSlots,
        result,
        valueType,
        formula: perSlot > 0 ? `${base} + ${perSlot}*${filledSlots}` : `${base}`,
        hasSlots: ability.powerUpSlots > 0
    };
}

// AIDEV-NOTE: Format ability description with current values
function formatAbilityDescription(ability, filledSlots = 0) {
    const calc = calculateAbilityValue(ability, filledSlots);
    let desc = ability.description;
    
    // Replace variables in description
    desc = desc.replace('{base}', calc.base);
    desc = desc.replace('{perSlot}', calc.perSlot);
    desc = desc.replace('{X}', calc.filledSlots);
    desc = desc.replace('{result}', calc.result);
    
    return {
        description: desc,
        calculation: calc
    };
}

// AIDEV-NOTE: Helper function to get all abilities
function getAllAbilities() {
    return Object.values(AbilityData);
}

// AIDEV-NOTE: Helper function to check if an icon exists
function hasAbility(iconName) {
    return iconName in AbilityData;
}

