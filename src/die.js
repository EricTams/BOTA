// die.js - Single-die rendering and animation helpers
// Responsibilities:
// - Draw a die face (background, border, icon via DiceIcons)
// - Render unwrapped faces for a die (pure drawing, no state mutation)
// - Render a single 3D die cube with face textures and perspective
// - Provide per-die animation helpers (axis-angle application, random axis, face orientation)
// Not responsible for:
// - Combat/state logic (CombatManager)
// - UI layout, panels, buttons (CombatUI)
// - Orchestration/bootstrapping (DiceSystem)
// AIDEV-NOTE: Keep functions small and pass all dependencies explicitly

const Die = {
    // Shared color palette for dice faces and UI accents
    colors: {
        Red: '#CC4444',
        Green: '#44CC44',
        Blue: '#4444CC',
        RedLight: '#EE8888',
        GreenLight: '#88EE88',
        BlueLight: '#8888EE',
        Blank: '#F5F5DC',
        DieOutline: '#333333',
        IconDark: '#222222'
    },
    // Create a fresh per-die animation state (used by bootstraps/tests)
    createInitialDieState() {
        return {
            rolling: false,
            currentFace: 0,
            animationTime: 0,
            targetFace: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            yOffset: 0,
            targetRotationX: 0,
            targetRotationY: 0,
            targetRotationZ: 0,
            startRotationX: 0,
            startRotationY: 0,
            startRotationZ: 0,
            axisRotation: null,
            rollAxis: null
        };
    },
    // Create pre-rendered textures for all 6 faces of a die (offscreen canvases)
    createFaceTextures(die, colors) {
        const textureSize = 256;
        const textures = [];
        for (let i = 0; i < 6; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = textureSize;
            canvas.height = textureSize;
            const ctx = canvas.getContext('2d');
            const faceData = die.faces[i];
            ctx.fillStyle = faceData && faceData.color ? colors[faceData.color] : colors.Blank;
            ctx.fillRect(0, 0, textureSize, textureSize);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 6;
            ctx.strokeRect(0, 0, textureSize, textureSize);
            if (faceData && faceData.icon) {
                const centerX = textureSize / 2;
                const centerY = textureSize / 2;
                const iconSize = textureSize * 0.6;
                DiceIcons.drawIcon(ctx, faceData.icon, centerX, centerY, iconSize);
            }
            textures.push(canvas);
        }
        return textures;
    },
    // Apply rotation around an arbitrary axis, starting from a target orientation
    applyAxisRotation(state, axis, angle, targetX, targetY, targetZ) {
        state.rotationX = targetX;
        state.rotationY = targetY;
        state.rotationZ = targetZ;
        state.axisRotation = { axis, angle };
    },

    // Generate a random normalized axis through the center
    getRandomAxis() {
        let x = Math.random() * 2 - 1;
        let y = Math.random() * 2 - 1;
        let z = Math.random() * 2 - 1;
        const len = Math.sqrt(x * x + y * y + z * z) || 1;
        return { x: x / len, y: y / len, z: z / len };
    },
    // Set rotation to display a specific die face pointing toward the camera
    setTargetRotationForFace(state, dieFaceIndex) {
        const faceRotations = [
            { x: 0, y: 0, z: Math.PI },
            { x: 0, y: -Math.PI / 2, z: 0 },
            { x: Math.PI / 2, y: 0, z: 0 },
            { x: 0, y: Math.PI / 2, z: 0 },
            { x: -Math.PI / 2, y: 0, z: 0 },
            { x: 0, y: Math.PI, z: 0 }
        ];
        const rotation = faceRotations[dieFaceIndex];
        const randomZRotations = [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2];
        const randomZRotation = randomZRotations[Math.floor(Math.random() * 4)];
        state.targetRotationX = rotation.x;
        state.targetRotationY = rotation.y;
        state.targetRotationZ = rotation.z + randomZRotation;
    },
    
    /**
     * Set up a die for reroll animation
     * @param {Object} state - Die state object
     * @returns {number} The target face that will be shown
     */
    setupReroll(state) {
        // Choose random target face
        const targetFace = Math.floor(Math.random() * 6);
        
        // Generate random rotation axis (must be object with x, y, z for rendering)
        state.rollAxis = this.getRandomAxis();
        
        // Set target rotation for the chosen face
        this.setTargetRotationForFace(state, targetFace);
        
        // Set up animation state
        state.rolling = true;
        state.targetFace = targetFace;
        state.animationTime = 0.0;
        
        return targetFace;
    },
    // Draw a single die face (background + border + icon)
    drawDieFace(ctx, face, x, y, size, isSmall, colors) {
        // Background
        ctx.fillStyle = face && face.color ? colors[face.color + 'Light'] : colors.Blank;
        ctx.fillRect(x, y, size, size);

        // Border
        ctx.strokeStyle = colors.DieOutline;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);

        // Icon
        if (face && face.icon) {
            const iconSize = isSmall ? size * 0.5 : size * 0.6;
            const iconX = x + size / 2;
            const iconY = y + size / 2;
            DiceIcons.drawIcon(ctx, face.icon, iconX, iconY, iconSize);
        }
    },

    // Render unwrapped faces for a list of dice
    renderUnwrappedDice(ctx, canvas, dice, diceStates, layout, colors) {
        const centerX = canvas.width / 2;
        for (let dieIdx = 0; dieIdx < dice.length; dieIdx++) {
            const die = dice[dieIdx];
            const dieState = diceStates[dieIdx];
            const totalWidth = 6 * layout.unwrappedFaceSize + 5 * layout.unwrappedSpacing;
            const startX = centerX - totalWidth / 2;
            const y = layout.unwrappedY + dieIdx * 90;

            ctx.fillStyle = '#cccccc';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(die.name, startX, y - 10);

            for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
                const face = die.faces[faceIdx];
                const x = startX + faceIdx * (layout.unwrappedFaceSize + layout.unwrappedSpacing);
                this.drawDieFace(ctx, face, x, y, layout.unwrappedFaceSize, false, colors);
                if (faceIdx === dieState.currentFace && !dieState.rolling) {
                    ctx.strokeStyle = '#ffff00';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, y, layout.unwrappedFaceSize, layout.unwrappedFaceSize);
                }
            }
        }
    },

    // Draw a die as a 3D cube at screen position (x, y)
    drawPerspectiveDie(ctx, die, x, y, size, state, dieIdx, deps) {
        const { faceTextures, diceStates, diePositions } = deps;
        if (!state.rolling) {
            if (diePositions) diePositions[dieIdx] = { x, y, size };
        }
        this.drawCube3D(
            ctx,
            die,
            x,
            y + state.yOffset,
            size,
            state.rotationX,
            state.rotationY,
            state.rotationZ,
            dieIdx,
            faceTextures,
            diceStates
        );
    },

    // 3D cube render with perspective and face textures
    drawCube3D(ctx, die, x, y, size, rotX, rotY, rotZ, dieIdx, faceTextures, diceStates) {
        const halfSize = size / 2;
        const camera = { x: 0, y: 0, z: 400, focalLength: 600 };

        const originalVertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1]
        ];

        const transformedVertices = originalVertices.map(v => {
            let vx = v[0] * halfSize, vy = v[1] * halfSize, vz = v[2] * halfSize;
            let tY = vy * Math.cos(rotX) - vz * Math.sin(rotX);
            let tZ = vy * Math.sin(rotX) + vz * Math.cos(rotX);
            vy = tY; vz = tZ;
            let tX = vx * Math.cos(rotY) + vz * Math.sin(rotY);
            tZ = -vx * Math.sin(rotY) + vz * Math.cos(rotY);
            vx = tX; vz = tZ;
            tX = vx * Math.cos(rotZ) - vy * Math.sin(rotZ);
            tY = vx * Math.sin(rotZ) + vy * Math.cos(rotZ);
            vx = tX; vy = tY;
            return [vx, vy, vz];
        });

        const state = diceStates[dieIdx];
        const finalVertices = transformedVertices.map(v => {
            let [vx, vy, vz] = v;
            if (state && state.axisRotation) {
                const { axis, angle } = state.axisRotation;
                const cosA = Math.cos(angle), sinA = Math.sin(angle), oneMinusCos = 1 - cosA;
                const dot = axis.x * vx + axis.y * vy + axis.z * vz;
                const cx = axis.y * vz - axis.z * vy;
                const cy = axis.z * vx - axis.x * vz;
                const cz = axis.x * vy - axis.y * vx;
                vx = vx * cosA + cx * sinA + axis.x * dot * oneMinusCos;
                vy = vy * cosA + cy * sinA + axis.y * dot * oneMinusCos;
                vz = vz * cosA + cz * sinA + axis.z * dot * oneMinusCos;
            }
            return [vx, vy, vz];
        });

        const projected = finalVertices.map(([vx, vy, vz]) => {
            const d = camera.z - vz;
            const s = camera.focalLength / d;
            return { x: vx * s, y: vy * s, z: vz };
        });

        const faces = [
            { vertices: [4, 5, 6, 7], faceIndex: 0 },
            { vertices: [0, 3, 2, 1], faceIndex: 5 },
            { vertices: [5, 1, 2, 6], faceIndex: 1 },
            { vertices: [4, 7, 3, 0], faceIndex: 3 },
            { vertices: [7, 6, 2, 3], faceIndex: 2 },
            { vertices: [4, 0, 1, 5], faceIndex: 4 }
        ];

        const ordered = faces
            .map(f => ({ ...f, avgZ: f.vertices.reduce((s, i) => s + finalVertices[i][2], 0) / 4 }))
            .sort((a, b) => a.avgZ - b.avgZ);

        ctx.save();
        ctx.translate(x, y);
        let target = null;
        ordered.forEach(f => {
            const verts = f.vertices.map(i => projected[i]);
            const tex = faceTextures[dieIdx][f.faceIndex];
            const isTarget = f.faceIndex === diceStates[dieIdx].targetFace;
            const settled = !diceStates[dieIdx].rolling;
            if (isTarget && settled) target = { tex, verts }; else this.drawTexturedQuad(ctx, tex, verts, false);
        });
        if (target) {
            const c = {
                x: target.verts.reduce((s, v) => s + v.x, 0) / 4,
                y: target.verts.reduce((s, v) => s + v.y, 0) / 4
            };
            const s = 1.05;
            const scaled = target.verts.map(v => ({ x: c.x + (v.x - c.x) * s, y: c.y + (v.y - c.y) * s, z: v.z }));
            this.drawTexturedQuad(ctx, target.tex, scaled, true);
        }
        ctx.restore();
    },

    // Hit-test helper: is the mouse over the on-screen die box? (simple square around center)
    // Note: Uses diePositions populated by drawPerspectiveDie. Returns the die index or null.
    isMouseOverAnyDie(mousePos, diePositions) {
        if (!diePositions) return null;
        for (let i = 0; i < diePositions.length; i++) {
            const pos = diePositions[i];
            if (!pos) continue;
            const hitbox = pos.size * 1.5; // generous hitbox to match UI click tolerance
            if (Math.abs(mousePos.x - pos.x) <= hitbox / 2 && Math.abs(mousePos.y - pos.y) <= hitbox / 2) {
                return i;
            }
        }
        return null;
    },

    // Draw a textured quad (affine for settled, two triangles otherwise)
    drawTexturedQuad(ctx, texture, verts, useSimpleQuad = false) {
        if (useSimpleQuad) {
            ctx.save();
            const x0 = verts[0].x, y0 = verts[0].y;
            const x1 = verts[1].x, y1 = verts[1].y;
            const x3 = verts[3].x, y3 = verts[3].y;
            const tw = texture.width, th = texture.height;
            const u = { x: x1 - x0, y: y1 - y0 };
            const v = { x: x3 - x0, y: y3 - y0 };
            ctx.transform(u.x / tw, u.y / tw, v.x / th, v.y / th, x0, y0);
            ctx.drawImage(texture, 0, 0);
            ctx.restore();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(verts[0].x, verts[0].y);
            ctx.lineTo(verts[1].x, verts[1].y);
            ctx.lineTo(verts[2].x, verts[2].y);
            ctx.lineTo(verts[3].x, verts[3].y);
            ctx.closePath();
            ctx.stroke();
            return;
        }
        this.drawTexturedTriangle(ctx, texture,
            verts[0].x, verts[0].y, 0, 0,
            verts[1].x, verts[1].y, texture.width, 0,
            verts[2].x, verts[2].y, texture.width, texture.height
        );
        this.drawTexturedTriangle(ctx, texture,
            verts[0].x, verts[0].y, 0, 0,
            verts[2].x, verts[2].y, texture.width, texture.height,
            verts[3].x, verts[3].y, 0, texture.height
        );
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(verts[0].x, verts[0].y);
        ctx.lineTo(verts[1].x, verts[1].y);
        ctx.lineTo(verts[2].x, verts[2].y);
        ctx.lineTo(verts[3].x, verts[3].y);
        ctx.closePath();
        ctx.stroke();
    },

    // Draw textured triangle using affine mapping
    drawTexturedTriangle(ctx, texture, x0, y0, u0, v0, x1, y1, u1, v1, x2, y2, u2, v2) {
        ctx.save();
        const dx1 = x1 - x0, dy1 = y1 - y0, dx2 = x2 - x0, dy2 = y2 - y0;
        const du1 = u1 - u0, dv1 = v1 - v0, du2 = u2 - u0, dv2 = v2 - v0;
        const det = du1 * dv2 - du2 * dv1;
        if (Math.abs(det) < 0.001) { ctx.restore(); return; }
        const a = (dx1 * dv2 - dx2 * dv1) / det;
        const b = (dy1 * dv2 - dy2 * dv1) / det;
        const c = (dx2 * du1 - dx1 * du2) / det;
        const d = (dy2 * du1 - dy1 * du2) / det;
        const e = x0 - (a * u0 + c * v0);
        const f = y0 - (b * u0 + d * v0);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.clip();
        ctx.transform(a, b, c, d, e, f);
        ctx.drawImage(texture, 0, 0);
        ctx.restore();
    }
};

// Expose globally
window.Die = Die;


