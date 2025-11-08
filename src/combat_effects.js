// BOTA - Combat Effects System
// Responsibilities:
// - Orchestrate visual effects (status text, particles, sounds)
// - Queue and manage multiple simultaneous effects
// - Map abilities to effect configurations
// Not responsible for:
// - Particle rendering (particles.js)
// - Sound playback (audio.js)

// AIDEV-NOTE: Effect structure
// Each effect has: { type, unit, value, ability, timestamp, text, particles, sound }

const CombatEffects = {
    // Active effects queue
    activeEffects: [],
    
    // Active particles
    particles: [],
    
    // Unit positions cache (updated by renderer)
    unitPositions: {},
    
    // Initialize effects system
    init() {
        this.activeEffects = [];
        this.particles = [];
        this.unitPositions = {};
    },
    
    // Clear all effects (called when combat ends)
    clear() {
        this.activeEffects = [];
        this.particles = [];
        this.unitPositions = {};
    },
    
    // Update unit position for rendering
    setUnitPosition(unitId, x, y, portraitSize = 80) {
        this.unitPositions[unitId] = {
            x: x + portraitSize / 2, // Portrait center X (for particles)
            y: y + portraitSize / 2, // Portrait center Y (for particles)
            textX: x + 120, // Text position (center of unit card, to the right of portrait)
            textY: y + 40   // Text position (middle of unit card)
        };
    },
    
    // Get unit position (portrait center) - use cached position or calculate from panel bounds
    getUnitPosition(unit) {
        // Try cached position first
        const cached = this.unitPositions[unit.id];
        if (cached) {
            return { x: cached.x, y: cached.y };
        }
        
        // Fallback: calculate from panel bounds if available
        if (unit._panelBounds) {
            const portraitSize = 80;
            return {
                x: unit._panelBounds.x + portraitSize / 2,
                y: unit._panelBounds.y + portraitSize / 2
            };
        }
        
        // Last resort: return center of screen (shouldn't happen)
        return { x: 400, y: 300 };
    },
    
    // Trigger damage effect
    triggerDamage(unit, amount, ability = null) {
        if (amount <= 0) return;
        
        const pos = this.getUnitPosition(unit);
        const abilityName = ability ? ability.displayName : 'Attack';
        console.log(`CombatEffects: ${abilityName} deals ${Math.round(amount)} damage to ${unit.name}`);
        
        const effect = {
            type: 'damage',
            unit: unit,
            value: amount,
            ability: ability,
            timestamp: Date.now(),
            text: {
                text: `-${Math.round(amount)}`,
                color: '#FF0000',
                x: 0,
                y: 0,
                life: 1.0,
                maxLife: 1.0,
                alpha: 1.0,
                offsetY: 0
            },
            particles: null,
            sound: this.getSoundForAbility(ability)
        };
        
        // Create particles based on ability
        if (ability) {
            const icon = ability.icon || '';
            if (icon === 'slam') {
                effect.particles = Particles.createDust(pos.x, pos.y);
            } else if (icon === 'chop' || icon === 'culling_blade') {
                effect.particles = Particles.createSlice(pos.x, pos.y);
            }
        }
        
        // If no ability-specific particles, use default damage particles
        if (!effect.particles) {
            effect.particles = Particles.createSlice(pos.x, pos.y);
        }
        
        this.activeEffects.push(effect);
        if (effect.particles && effect.particles.length > 0) {
            this.particles.push(...effect.particles);
        }
        
        // Play sound
        if (effect.sound) {
            console.log(`CombatEffects: Attempting to play sound: ${effect.sound}`);
            Audio.play(effect.sound);
        }
    },
    
    // Trigger heal effect
    triggerHeal(unit, amount, ability = null) {
        if (amount <= 0) return;
        
        const pos = this.getUnitPosition(unit);
        const abilityName = ability ? ability.displayName : 'Heal';
        console.log(`CombatEffects: ${abilityName} heals ${Math.round(amount)} HP for ${unit.name}`);
        
        const effect = {
            type: 'heal',
            unit: unit,
            value: amount,
            ability: ability,
            timestamp: Date.now(),
            text: {
                text: `+${Math.round(amount)}`,
                color: '#00FF00',
                x: 0,
                y: 0,
                life: 1.0,
                maxLife: 1.0,
                alpha: 1.0,
                offsetY: 0
            },
            particles: Particles.createSparkle(pos.x, pos.y),
            sound: 'combat_heal'
        };
        
        this.activeEffects.push(effect);
        if (effect.particles && effect.particles.length > 0) {
            this.particles.push(...effect.particles);
        }
        
        // Play sound
        if (effect.sound) {
            console.log(`CombatEffects: Attempting to play sound: ${effect.sound}`);
            Audio.play(effect.sound);
        }
    },
    
    // Trigger dodge effect
    triggerDodge(unit, ability = null) {
        const pos = this.getUnitPosition(unit);
        const abilityName = ability ? ability.displayName : 'Dodge';
        console.log(`CombatEffects: ${unit.name} gains ${abilityName}`);
        
        const effect = {
            type: 'dodge',
            unit: unit,
            value: null,
            ability: ability,
            timestamp: Date.now(),
            text: {
                text: 'Evasion!',
                color: '#4488FF',
                x: 0,
                y: 0,
                life: 1.5,
                maxLife: 1.5,
                alpha: 1.0,
                offsetY: 0
            },
            particles: Particles.createStreak(pos.x, pos.y),
            sound: 'combat_powerup'
        };
        
        this.activeEffects.push(effect);
        if (effect.particles && effect.particles.length > 0) {
            this.particles.push(...effect.particles);
        }
        
        // Play sound
        if (effect.sound) {
            console.log(`CombatEffects: Attempting to play sound: ${effect.sound}`);
            Audio.play(effect.sound);
        }
    },
    
    // Trigger telekinesis effect
    triggerTelekinesis(unit, ability = null) {
        if (!unit) {
            console.warn('CombatEffects: triggerTelekinesis called with null unit');
            return;
        }
        
        // Ensure we have the correct unit position
        const pos = this.getUnitPosition(unit);
        const abilityName = ability ? ability.displayName : 'Telekinesis';
        console.log(`CombatEffects: ${abilityName} affects ${unit.name} (id: ${unit.id}, side: ${unit.side}) at (${pos.x}, ${pos.y})`);
        
        // Verify position is reasonable (not default fallback)
        if (pos.x === 400 && pos.y === 300) {
            console.warn(`CombatEffects: Using fallback position for ${unit.name} - unit position may not be set correctly`);
        }
        
        const effect = {
            type: 'telekinesis',
            unit: unit,
            value: null,
            ability: ability,
            timestamp: Date.now(),
            text: {
                text: 'Locked!',
                color: '#FFFF00',
                x: 0,
                y: 0,
                life: 1.5,
                maxLife: 1.5,
                alpha: 1.0,
                offsetY: 0
            },
            particles: Particles.createStar(pos.x, pos.y),
            sound: 'combat_twinkle'
        };
        
        this.activeEffects.push(effect);
        if (effect.particles && effect.particles.length > 0) {
            this.particles.push(...effect.particles);
        }
        
        // Play sound
        if (effect.sound) {
            console.log(`CombatEffects: Attempting to play sound: ${effect.sound}`);
            Audio.play(effect.sound);
        }
    },
    
    // Trigger chain effect (visual connection between two units)
    triggerChain(fromUnit, toUnit, ability = null) {
        if (!fromUnit || !toUnit) {
            console.warn(`CombatEffects: triggerChain called with null unit - from: ${fromUnit ? fromUnit.name : 'null'}, to: ${toUnit ? toUnit.name : 'null'}`);
            return;
        }
        
        const fromPos = this.getUnitPosition(fromUnit);
        const toPos = this.getUnitPosition(toUnit);
        
        console.log(`CombatEffects: Chain from ${fromUnit.name} (${fromUnit.side}, id: ${fromUnit.id}) at (${fromPos.x}, ${fromPos.y}) to ${toUnit.name} (${toUnit.side}, id: ${toUnit.id}) at (${toPos.x}, ${toPos.y})`);
        
        // Verify positions are reasonable
        if (fromPos.x === 400 && fromPos.y === 300) {
            console.warn(`CombatEffects: Using fallback position for ${fromUnit.name} - position may not be set correctly`);
        }
        if (toPos.x === 400 && toPos.y === 300) {
            console.warn(`CombatEffects: Using fallback position for ${toUnit.name} - position may not be set correctly`);
        }
        
        // Create chain particles traveling from source to target
        const chainParticles = Particles.createChain(fromPos.x, fromPos.y, toPos.x, toPos.y);
        this.particles.push(...chainParticles);
    },
    
    // Trigger generic effect (for buffs/debuffs)
    triggerEffect(unit, effectType, ability = null) {
        if (effectType === 'dodge' || (ability && ability.icon === 'dodge')) {
            this.triggerDodge(unit, ability);
        } else if (effectType === 'telekenesis' || (ability && ability.icon === 'telekenesis')) {
            this.triggerTelekinesis(unit, ability);
        }
        // Add more effect types as needed
    },
    
    // Get sound name for ability
    getSoundForAbility(ability) {
        if (!ability || !ability.icon) return null;
        
        const icon = ability.icon;
        if (icon === 'slam') return 'combat_thud';
        if (icon === 'chop' || icon === 'culling_blade') return 'combat_slice';
        if (icon === 'heal') return 'combat_heal';
        if (icon === 'dodge') return 'combat_powerup';
        if (icon === 'telekenesis') return 'combat_twinkle';
        
        return null;
    },
    
    // Update effects and particles
    update(deltaTime) {
        // Update text effects
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            
            // Update text position and alpha
            if (effect.text) {
                effect.text.life -= deltaTime;
                effect.text.offsetY -= 30 * deltaTime; // Drift upward
                
                if (effect.text.life > 0) {
                    const lifePercent = effect.text.life / effect.text.maxLife;
                    effect.text.alpha = lifePercent;
                } else {
                    effect.text.alpha = 0;
                }
                
                // Set text position from unit position
                const pos = this.unitPositions[effect.unit.id];
                if (pos) {
                    effect.text.x = pos.textX;
                    effect.text.y = pos.textY + effect.text.offsetY;
                }
            }
            
            // Remove effect if expired
            if (effect.text && effect.text.life <= 0) {
                this.activeEffects.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const alive = Particles.update(particle, deltaTime);
            if (!alive) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    // Render all effects
    render(ctx) {
        // Render particles
        for (const particle of this.particles) {
            Particles.render(ctx, particle);
        }
        
        // Render text effects
        for (const effect of this.activeEffects) {
            if (effect.text && effect.text.alpha > 0) {
                ctx.save();
                ctx.globalAlpha = effect.text.alpha;
                ctx.fillStyle = effect.text.color;
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Add text shadow for visibility
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                ctx.fillText(effect.text.text, effect.text.x, effect.text.y);
                
                ctx.restore();
            }
        }
    }
};

// Expose globally
window.CombatEffects = CombatEffects;

