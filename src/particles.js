// BOTA - Particle System
// Responsibilities:
// - Render individual particles (dust, slice, sparkle, streak, star)
// - Update particle physics (position, lifetime, fade)
// Not responsible for:
// - Effect orchestration (combat_effects.js)
// - Sound effects (combat_effects.js)

// AIDEV-NOTE: Particle structure
// Each particle has: { x, y, vx, vy, life, maxLife, size, color, type, rotation, alpha }

const Particles = {
    // Create dust particles (brown/tan expanding circle with glow)
    createDust(x, y, count = 16) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 40 + Math.random() * 60;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.6 + Math.random() * 0.4,
                maxLife: 0.6 + Math.random() * 0.4,
                size: 6 + Math.random() * 10,
                color: `rgb(${139 + Math.random() * 40}, ${101 + Math.random() * 30}, ${80 + Math.random() * 20})`,
                type: 'dust',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 8,
                alpha: 1.0,
                glowSize: 1.5 + Math.random() * 0.5
            });
        }
        return particles;
    },

    // Create slice particles (red arc/slash with trail)
    createSlice(x, y, count = 10) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = -Math.PI / 4 + (Math.PI / 2) * (i / (count - 1)) + (Math.random() - 0.5) * 0.3;
            const speed = 60 + Math.random() * 80;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.5 + Math.random() * 0.3,
                size: 8 + Math.random() * 12,
                color: `rgb(${200 + Math.random() * 55}, ${30 + Math.random() * 40}, ${30 + Math.random() * 40})`,
                type: 'slice',
                rotation: angle,
                rotationSpeed: (Math.random() - 0.5) * 12,
                alpha: 1.0,
                trailLength: 15 + Math.random() * 20
            });
        }
        return particles;
    },

    // Create sparkle particles (golden twinkle with glow)
    createSparkle(x, y, count = 20) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 50;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.7 + Math.random() * 0.5,
                maxLife: 0.7 + Math.random() * 0.5,
                size: 4 + Math.random() * 8,
                color: `rgb(${255}, ${220 + Math.random() * 35}, ${50 + Math.random() * 50})`,
                type: 'sparkle',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 15,
                alpha: 1.0,
                twinklePhase: Math.random() * Math.PI * 2,
                glowSize: 2.0 + Math.random() * 1.0
            });
        }
        return particles;
    },

    // Create streak particles (grey swirl with motion blur)
    createStreak(x, y, count = 16) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
            const speed = 35 + Math.random() * 50;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.6 + Math.random() * 0.4,
                maxLife: 0.6 + Math.random() * 0.4,
                size: 4 + Math.random() * 8,
                color: `rgb(${120 + Math.random() * 60}, ${120 + Math.random() * 60}, ${120 + Math.random() * 60})`,
                type: 'streak',
                rotation: angle,
                rotationSpeed: (Math.random() - 0.5) * 10,
                alpha: 1.0,
                trailLength: 20 + Math.random() * 30
            });
        }
        return particles;
    },

    // Create star particles (yellow/white fade in/out with glow)
    createStar(x, y, count = 12) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
            const speed = 20 + Math.random() * 35;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0 + Math.random() * 0.5,
                maxLife: 1.0 + Math.random() * 0.5,
                size: 6 + Math.random() * 10,
                color: `rgb(${255}, ${255}, ${180 + Math.random() * 75})`,
                type: 'star',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 6,
                alpha: 0.0, // Start invisible, fade in
                fadeInDuration: 0.3 + Math.random() * 0.3,
                glowSize: 2.0 + Math.random() * 1.5
            });
        }
        return particles;
    },

    // Create chain particles (electric arc traveling from source to target)
    createChain(fromX, fromY, toX, toY, count = 8) {
        const particles = [];
        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const travelTime = 0.3; // Time to travel from source to target
        
        for (let i = 0; i < count; i++) {
            const t = i / count; // Position along chain (0 to 1)
            const offset = (Math.random() - 0.5) * 20; // Perpendicular offset for arc effect
            const perpAngle = angle + Math.PI / 2;
            
            particles.push({
                x: fromX,
                y: fromY,
                targetX: toX,
                targetY: toY,
                startX: fromX,
                startY: fromY,
                progress: 0, // 0 to 1
                life: travelTime + 0.2, // Travel time + fade out
                maxLife: travelTime + 0.2,
                size: 4 + Math.random() * 4,
                color: `rgb(${100 + Math.random() * 50}, ${150 + Math.random() * 105}, ${255})`,
                type: 'chain',
                angle: angle,
                offset: offset,
                perpAngle: perpAngle,
                alpha: 1.0
            });
        }
        return particles;
    },

    // Update a particle
    update(particle, deltaTime) {
        // Chain particles move along a path from source to target
        if (particle.type === 'chain') {
            const travelTime = particle.maxLife - 0.2; // Travel time (excluding fade out)
            particle.progress += deltaTime / travelTime;
            particle.progress = Math.min(1.0, particle.progress);
            
            // Calculate position along arc
            const t = particle.progress;
            const baseX = particle.startX + (particle.targetX - particle.startX) * t;
            const baseY = particle.startY + (particle.targetY - particle.startY) * t;
            
            // Add arc offset (perpendicular to line, with curve)
            const arcCurve = Math.sin(t * Math.PI) * particle.offset;
            particle.x = baseX + Math.cos(particle.perpAngle) * arcCurve;
            particle.y = baseY + Math.sin(particle.perpAngle) * arcCurve;
            
            // Update lifetime
            particle.life -= deltaTime;
            
            // Fade out after reaching target
            if (particle.progress >= 1.0) {
                const fadeTime = particle.maxLife - travelTime;
                const fadeProgress = (particle.maxLife - particle.life) / fadeTime;
                particle.alpha = Math.max(0, 1.0 - fadeProgress);
            }
        } else {
            // Move particle
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Apply gravity/drag for some types
            if (particle.type === 'dust') {
                particle.vy += 50 * deltaTime; // Gravity
                particle.vx *= 0.98; // Drag
            }
            
            // Update rotation
            if (particle.rotationSpeed !== undefined) {
                particle.rotation += particle.rotationSpeed * deltaTime;
            }
            
            // Update lifetime
            particle.life -= deltaTime;
        }
        
        // Update alpha based on lifetime and type
        const lifePercent = particle.life / particle.maxLife;
        
        if (particle.type === 'star') {
            // Fade in then fade out
            if (particle.alpha < 1.0 && particle.life > particle.maxLife - particle.fadeInDuration) {
                const fadeInProgress = (particle.maxLife - particle.life) / particle.fadeInDuration;
                particle.alpha = Math.min(1.0, fadeInProgress);
            } else {
                particle.alpha = lifePercent;
            }
        } else if (particle.type === 'sparkle') {
            // Twinkle effect
            particle.twinklePhase += deltaTime * 10;
            particle.alpha = lifePercent * (0.5 + 0.5 * Math.sin(particle.twinklePhase));
        } else {
            // Standard fade out
            particle.alpha = lifePercent;
        }
        
        return particle.life > 0;
    },

    // Render a particle
    render(ctx, particle) {
        ctx.save();
        
        // Move to particle position
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        
        if (particle.type === 'dust') {
            // Draw circle with glow
            const glowSize = particle.size * (particle.glowSize || 1.5);
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(0.5, particle.color.replace('rgb', 'rgba').replace(')', `, ${particle.alpha * 0.5})`));
            gradient.addColorStop(1, particle.color.replace('rgb', 'rgba').replace(')', `, 0)`));
            
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Core circle
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(0, 0, particle.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        } else if (particle.type === 'slice') {
            // Draw arc/slash with trail
            const trailLen = particle.trailLength || 20;
            ctx.globalAlpha = particle.alpha;
            
            // Trail gradient
            const gradient = ctx.createLinearGradient(-trailLen, 0, 0, 0);
            gradient.addColorStop(0, particle.color.replace('rgb', 'rgba').replace(')', `, 0)`));
            gradient.addColorStop(1, particle.color);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-trailLen, -particle.size * 0.3);
            ctx.lineTo(0, 0);
            ctx.lineTo(particle.size, particle.size * 0.4);
            ctx.stroke();
            
            // Bright core
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-particle.size * 0.3, -particle.size * 0.15);
            ctx.lineTo(particle.size * 0.5, particle.size * 0.25);
            ctx.stroke();
        } else if (particle.type === 'sparkle') {
            // Draw twinkling star shape with glow
            const glowSize = particle.size * (particle.glowSize || 2.0);
            ctx.globalAlpha = particle.alpha;
            
            // Outer glow
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(0.6, particle.color.replace('rgb', 'rgba').replace(')', `, ${particle.alpha * 0.4})`));
            gradient.addColorStop(1, particle.color.replace('rgb', 'rgba').replace(')', `, 0)`));
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Star shape
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * i) / 2;
                const x = Math.cos(angle) * particle.size;
                const y = Math.sin(angle) * particle.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        } else if (particle.type === 'streak') {
            // Draw line streak with motion blur
            const trailLen = particle.trailLength || 25;
            ctx.globalAlpha = particle.alpha;
            
            // Trail gradient
            const gradient = ctx.createLinearGradient(-trailLen, 0, 0, 0);
            gradient.addColorStop(0, particle.color.replace('rgb', 'rgba').replace(')', `, 0)`));
            gradient.addColorStop(0.5, particle.color.replace('rgb', 'rgba').replace(')', `, ${particle.alpha * 0.6})`));
            gradient.addColorStop(1, particle.color);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-trailLen, 0);
            ctx.lineTo(0, 0);
            ctx.stroke();
        } else if (particle.type === 'star') {
            // Draw star shape with glow
            const glowSize = particle.size * (particle.glowSize || 2.0);
            ctx.globalAlpha = particle.alpha;
            
            // Outer glow
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(0.5, particle.color.replace('rgb', 'rgba').replace(')', `, ${particle.alpha * 0.5})`));
            gradient.addColorStop(1, particle.color.replace('rgb', 'rgba').replace(')', `, 0)`));
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Star shape
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * particle.size;
                const y = Math.sin(angle) * particle.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        } else if (particle.type === 'chain') {
            // Draw electric arc chain particle
            ctx.globalAlpha = particle.alpha;
            
            // Draw glowing arc
            const glowSize = particle.size * 2;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(0.5, particle.color.replace('rgb', 'rgba').replace(')', `, ${particle.alpha * 0.6})`));
            gradient.addColorStop(1, particle.color.replace('rgb', 'rgba').replace(')', `, 0)`));
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Bright core
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
};

// Expose globally
window.Particles = Particles;

