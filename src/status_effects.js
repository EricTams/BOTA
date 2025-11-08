// BOTA - Status Effects System
// Handles defensive and reactive status effects that trigger on damage

// AIDEV-NOTE: Status Effects Trigger System
// Checks for defensive abilities (evasion) and reactive abilities (counter helix)
// when damage is about to be applied

const StatusEffects = {
    // Check if a unit should dodge an incoming attack
    // Returns: { dodged: boolean, evasionValue: number }
    checkEvasion(unit, ability = null) {
        if (!unit || !unit.statusEffects) {
            return { dodged: false, evasionValue: 0 };
        }
        
        // Find dodge status effect
        const dodgeEffect = unit.statusEffects.find(e => e.type === 'dodge');
        if (!dodgeEffect) {
            return { dodged: false, evasionValue: 0 };
        }
        
        // Evasion value is stored in effect.value
        // For now, treat it as a percentage chance (value = evasion %)
        // TODO: Could be changed to flat evasion rating if needed
        const evasionChance = dodgeEffect.value; // e.g., 2 = 2% chance, 5 = 5% chance
        const roll = Math.random() * 100;
        
        if (roll < evasionChance) {
            return { dodged: true, evasionValue: evasionChance };
        }
        
        return { dodged: false, evasionValue: evasionChance };
    },
    
    // Check if a unit has retribution and should counter-attack
    // Returns: { hasRetribution: boolean, damage: number, ability: object, retributionType: string }
    checkRetribution(unit, attackingAbility = null) {
        if (!unit || !unit.statusEffects) {
            return { hasRetribution: false, damage: 0, ability: null, retributionType: null };
        }
        
        // Retribution only triggers on melee attacks
        if (attackingAbility && attackingAbility.targetingRestriction !== 'melee') {
            return { hasRetribution: false, damage: 0, ability: null, retributionType: null };
        }
        
        // Find any retribution status effects (effects with retributionType in their ability data)
        const abilityData = window.AbilityData || {};
        for (const effect of unit.statusEffects) {
            const effectAbility = abilityData[effect.icon || effect.type];
            if (effectAbility && effectAbility.retributionType) {
                // This is a retribution effect
                const retributionDamage = effect.value || 0;
                
                return {
                    hasRetribution: true,
                    damage: retributionDamage,
                    ability: effectAbility,
                    retributionType: effectAbility.retributionType
                };
            }
        }
        
        return { hasRetribution: false, damage: 0, ability: null, retributionType: null };
    },
    
    // AIDEV-NOTE: Legacy function for backwards compatibility
    // Check if a unit has counter helix and should counter-attack
    // Returns: { hasCounter: boolean, damage: number, ability: object }
    checkCounterHelix(unit, ability = null) {
        const retribution = this.checkRetribution(unit, ability);
        return {
            hasCounter: retribution.hasRetribution,
            damage: retribution.damage,
            ability: retribution.ability
        };
    },
    
    // Check if an attack is melee or ranged based on ability
    // Returns: 'melee' | 'ranged' | 'unknown'
    getAttackType(ability) {
        if (!ability) {
            return 'unknown';
        }
        
        if (ability.targetingRestriction === 'melee') {
            return 'melee';
        }
        
        if (ability.targetingRestriction === 'ranged') {
            return 'ranged';
        }
        
        // Default to melee if not specified (most attacks are melee)
        return 'melee';
    },
    
    // Check if an attack should trigger defensive/reactive effects
    // Returns: { shouldTriggerEvasion: boolean, shouldTriggerCounter: boolean }
    shouldTriggerDefensiveEffects(ability) {
        const attackType = this.getAttackType(ability);
        
        return {
            // Evasion triggers on both melee and ranged
            shouldTriggerEvasion: attackType === 'melee' || attackType === 'ranged',
            // Counter helix only triggers on melee
            shouldTriggerCounter: attackType === 'melee'
        };
    },
    
    // Check if a unit has taunt status effect
    // Returns: boolean
    hasTaunt(unit) {
        if (!unit || !unit.statusEffects) {
            return false;
        }
        return unit.statusEffects.some(e => e.type === 'taunt');
    },
    
    // Find all units with taunt from a list of units
    // Returns: array of units with taunt
    getTauntedUnits(units) {
        if (!units || units.length === 0) {
            return [];
        }
        return units.filter(unitInfo => {
            const unit = unitInfo.unit || unitInfo;
            return this.hasTaunt(unit);
        });
    }
};

window.StatusEffects = StatusEffects;

