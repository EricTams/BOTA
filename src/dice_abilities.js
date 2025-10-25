// BOTA - Dice Abilities
// Responsibilities:
// - Define metadata for all dice face abilities/icons (values, slots, effects)
// - Provide helpers to lookup abilities and compute formatted values/descriptions
// Not responsible for:
// - Rendering icons (DiceIcons)
// - Applying effects (Combat)
// - Dice face layout (Die/CombatUI)

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
// - effectType: 'instant', 'damage', 'heal', 'shield', 'dot', 'hot', 'buff', 'debuff'
// - duration: turns for DoT/HoT/buffs/debuffs (optional)
// - stackable: boolean for poison-like effects (optional)
// - targetingRestriction: 'melee' (front row only), 'ranged' (any), null (default)
// - aoeType: null, 'cleave' (adjacent), 'chain' (bounce), 'all' (everyone) (optional)

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
        effectType: "damage",
        targetingRestriction: "melee",
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
        targeting: "self",
        effectType: "buff",
        duration: 3,
        aoeType: "all",
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
        targeting: "self",
        effectType: "shield",
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
        effectType: "damage",
        targetingRestriction: "melee",
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
        effectType: "damage",
        targetingRestriction: "melee",
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
        targeting: "self",
        effectType: "buff",
        duration: 2,
        powerUpSlots: 1,
        powerUpColors: ["Green"]
    },

    // New abilities for combat testing
    slash: {
        icon: "slash",
        displayName: "Slash",
        description: "Deal {base} + {perSlot}*{X} damage",
        baseDamage: 8,
        damagePerSlot: 4,
        color: "Red",
        targeting: "enemy",
        effectType: "damage",
        targetingRestriction: "ranged",
        powerUpSlots: 1,
        powerUpColors: ["Red"]
    },

    heal: {
        icon: "heal",
        displayName: "Heal",
        description: "Restore {base} + {perSlot}*{X} HP",
        baseHeal: 10,
        healPerSlot: 5,
        color: "Blue",
        targeting: "self",
        effectType: "heal",
        powerUpSlots: 1,
        powerUpColors: ["Blue"]
    },

    bleed: {
        icon: "bleed",
        displayName: "Bleed",
        description: "Inflict {base} + {perSlot}*{X} damage per turn for 3 turns",
        baseDamage: 3,
        damagePerSlot: 2,
        color: "Green",
        targeting: "enemy",
        effectType: "dot",
        duration: 3,
        stackable: false,
        powerUpSlots: 1,
        powerUpColors: ["Green"]
    },

    poison: {
        icon: "poison",
        displayName: "Poison",
        description: "Inflict {base} stacking poison damage per turn for 4 turns",
        baseDamage: 2,
        damagePerSlot: 1,
        color: "Green",
        targeting: "enemy",
        effectType: "dot",
        duration: 4,
        stackable: true,
        powerUpSlots: 1,
        powerUpColors: ["Green"]
    },

    regenerate: {
        icon: "regenerate",
        displayName: "Regenerate",
        description: "Restore {base} + {perSlot}*{X} HP per turn for 3 turns",
        baseHeal: 4,
        healPerSlot: 2,
        color: "Blue",
        targeting: "self",
        effectType: "hot",
        duration: 3,
        powerUpSlots: 1,
        powerUpColors: ["Blue"]
    },

    // Blue offense for mage kits
    arcane_burst: {
        icon: "arcane_burst",
        displayName: "Arcane Burst",
        description: "Deal {base} + {perSlot}*{X} magic damage",
        baseDamage: 7,
        damagePerSlot: 5,
        color: "Blue",
        targeting: "enemy",
        effectType: "damage",
        powerUpSlots: 2,
        powerUpColors: ["Blue", "Blue"]
    },

    arcane_chain: {
        icon: "arcane_chain",
        displayName: "Arcane Chain",
        description: "Deal {base} + {perSlot}*{X} damage (chains)",
        baseDamage: 5,
        damagePerSlot: 4,
        color: "Blue",
        targeting: "enemies",
        effectType: "damage",
        aoeType: "chain",
        powerUpSlots: 2,
        powerUpColors: ["Blue", "Green"]
    },

    // Red ship impact ability
    slam: {
        icon: "slam",
        displayName: "Slam",
        description: "Deal {base} + {perSlot}*{X} damage",
        baseDamage: 9,
        damagePerSlot: 5,
        color: "Red",
        targeting: "enemy",
        effectType: "damage",
        powerUpSlots: 1,
        powerUpColors: ["Red"]
    },

    // Small ranged zap
    zap: {
        icon: "zap",
        displayName: "Zap",
        description: "Deal {base} + {perSlot}*{X} damage",
        baseDamage: 4,
        damagePerSlot: 2,
        color: "Blue",
        targeting: "enemy",
        effectType: "damage",
        targetingRestriction: "ranged",
        powerUpSlots: 1,
        powerUpColors: ["Blue"]
    },

    // Telekinesis: disable a random enemy die next roll (status effect)
    telekenesis: {
        icon: "telekenesis",
        displayName: "Telekinesis",
        description: "Disable 1 enemy die next roll",
        color: "Blue",
        targeting: "enemy",
        effectType: "debuff",
        debuffType: "disable_die",
        disableCount: 1,
        duration: 1,
        powerUpSlots: 0,
        powerUpColors: []
    },

    shield: {
        icon: "shield",
        displayName: "Shield",
        description: "Gain {base} + {perSlot}*{X} armor",
        baseArmor: 8,
        armorPerSlot: 4,
        color: "Red",
        targeting: "self",
        effectType: "shield",
        powerUpSlots: 1,
        powerUpColors: ["Red"]
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

