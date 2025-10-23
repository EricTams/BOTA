// BOTA - Dice System
// Rendering, animation, and interaction for dice mechanics

// AIDEV-NOTE: Dice Test Screen
// This module handles the dice test screen for development and testing
// Shows unwrapped dice, rolling animations, and reroll functionality

const DiceSystem = {
    // Test screen state
    testState: {
        dice: [], // Array of die objects from dice_data.js
        diceStates: [], // Animation states for each die
        rerollTray: [], // Indices of dice in reroll tray
        draggedDieIndex: null, // Currently dragged die
        dragOffset: { x: 0, y: 0 }, // Offset for drag rendering
        rollsAvailable: 1, // Number of rerolls remaining
        hoveredButton: null, // Which button is hovered
        tooltip: { // Tooltip state
            visible: false,
            dieIndex: null, // Which die is being hovered
            faceIndex: null, // Which face (0-5) is being hovered
            x: 0,
            y: 0,
            filledSlots: [] // Array of booleans for each power-up slot
        },
        combatMode: true, // AIDEV-NOTE: Combat mode enabled for testing
        selectedDieForAbility: null, // Index of die face selected to execute as ability
        // AIDEV-NOTE: New dice selection system
        rolledDice: [], // Pool of rolled dice: { dieIndex, faceIndex, face, ability, selected, assigned }
        savedDice: [], // Dice saved from pool (won't be rerolled)
        assignedDice: {}, // Dice assigned to abilities: { abilityKey: [dieIndices] }
        activeAbility: null, // Currently selected ability to assign dice to
        dragState: null // Drag state: { dieIndex, startX, startY }
    },

    // Color palette
    colors: {
        Red: '#CC4444',      // Face color for red faces
        Green: '#44CC44',    // Face color for green faces
        Blue: '#4444CC',     // Face color for blue faces
        RedLight: '#EE8888',    // Background for red faces (lighter)
        GreenLight: '#88EE88',  // Background for green faces (lighter)
        BlueLight: '#8888EE',   // Background for blue faces (lighter)
        Blank: '#F5F5DC',    // Offwhite for blank faces
        DieOutline: '#333333',
        IconDark: '#222222'
    },

    // Layout constants
    layout: {
        unwrappedY: 100,
        unwrappedFaceSize: 60,
        unwrappedSpacing: 10,
        rollingBoxY: 250,
        rollingBoxWidth: 500,
        rollingBoxHeight: 200,
        dieSize: 53,  // Reduced to 1/3 of 160 (was 160)
        dieSpacing: 240,  // Doubled from 120
        rerollTrayY: 500,
        rerollTrayWidth: 300,
        rerollTrayHeight: 100,
        buttonY: 520,
        buttonWidth: 160,
        buttonHeight: 50
    },

    // Initialize dice test screen
    init() {
        console.log('DiceSystem - Initializing dice test screen...');
        
        // Load both of Axe's dice
        this.testState.dice = [
            getDieByName('axe_personal'),
            getDieByName('axe_equipment')
        ];

        // Initialize animation states with real 3D orientation
        this.testState.diceStates = this.testState.dice.map(() => {
            return {
                rolling: false,
                currentFace: 0,
                animationTime: 0,
                targetFace: 0,
                // Real 3D orientation (always maintained)
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0,
                yOffset: 0,
                // Target orientation for animation
                targetRotationX: 0,
                targetRotationY: 0,
                targetRotationZ: 0,
                // Animation start orientation
                startRotationX: 0,
                startRotationY: 0,
                startRotationZ: 0,
                // Axis-angle rotation (for proper axis spinning)
                axisRotation: null,
                // Random axis for this die's roll
                rollAxis: null
            };
        });
        
        // Interactive die state (disabled - no longer used for dragging)
        this.interactiveDie = {
            baseX: 0,
            baseY: 0
        };

        // Pre-render face textures for all dice
        this.faceTextures = this.testState.dice.map(die => this.createFaceTextures(die));

        // Load captain portraits for combat UI
        this.portraits = {};
        this.loadPortrait('captain_axe', 'assets/characters/captain_axe.png');

        // Initialize combat if in combat mode
        if (this.testState.combatMode) {
            // Create mock captain objects for Axe vs Axe testing
            const playerCaptain = {
                id: 'captain_axe',
                name: 'Player Axe',
                hp: 100,
                maxHp: 100,
                dice: ['axe_personal', 'axe_equipment'],
                portrait: 'assets/characters/captain_axe.png'
            };
            const enemyCaptain = {
                id: 'captain_axe',
                name: 'Enemy Axe',
                hp: 100,
                maxHp: 100,
                dice: ['axe_personal', 'axe_equipment'],
                portrait: 'assets/characters/captain_axe.png'
            };
            
            Combat.init(playerCaptain, enemyCaptain);
            Combat.startTurn();
        }

        console.log('DiceSystem - Initialized with', this.testState.dice.length, 'die');
    },

    // Load captain portrait image
    loadPortrait(captainId, imagePath) {
        const img = new Image();
        img.onload = () => {
            this.portraits[captainId] = img;
            console.log('DiceSystem - Loaded portrait for', captainId);
        };
        img.onerror = () => {
            console.warn('DiceSystem - Failed to load portrait:', imagePath);
        };
        img.src = imagePath;
    },

    // Create pre-rendered textures for all 6 faces of a die
    createFaceTextures(die) {
        const textureSize = 256; // High-res texture for each face
        const textures = [];
        
        for (let i = 0; i < 6; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = textureSize;
            canvas.height = textureSize;
            const ctx = canvas.getContext('2d');
            
            const faceData = die.faces[i];
            
            // Fill background with face color
            if (faceData.color) {
                ctx.fillStyle = this.colors[faceData.color];
            } else {
                ctx.fillStyle = this.colors.Blank;
            }
            ctx.fillRect(0, 0, textureSize, textureSize);
            
            // Draw border
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 6;
            ctx.strokeRect(0, 0, textureSize, textureSize);
            
            // Draw icon if present
            if (faceData.icon) {
                const centerX = textureSize / 2;
                const centerY = textureSize / 2;
                const iconSize = textureSize * 0.6; // Icon is 60% of face size
                this.drawIcon(ctx, faceData.icon, centerX, centerY, iconSize, '#000000');
            }
            
            textures.push(canvas);
        }
        
        return textures;
    },

    // Update animations
    update(deltaTime) {
        // Track if any dice just finished rolling
        let anyJustFinished = false;
        
        // Update each die's animation
        for (let i = 0; i < this.testState.diceStates.length; i++) {
            const state = this.testState.diceStates[i];
            
            if (state.rolling) {
                state.animationTime += deltaTime;
                const t = state.animationTime;

                const animationDuration = 0.7; // Total animation time (playing backwards from 0.7s to 0.0s)
                
                if (t < animationDuration) {
                    // Calculate backwards time: we start at t=0.7 and move towards t=0.0
                    const backwardsTime = animationDuration - t;
                    const progress = backwardsTime / animationDuration; // 1.0 -> 0.0 as animation plays
                    
                    // Pop up and down (sine wave) - starts high, ends at ground
                    state.yOffset = -40 * Math.sin(progress * Math.PI);
                    
                    // Rotate around the random axis - unwind from spinning to final orientation
                    const angle = progress * Math.PI * 4; // Starts at 2 full rotations, ends at 0
                    this.applyAxisRotation(state, state.rollAxis, angle, state.targetRotationX, state.targetRotationY, state.targetRotationZ);
                    
                    // On the very last frame before completion, snap to exact target to avoid any visual drift
                    if (t >= animationDuration - 0.016) { // Within one frame (60fps = ~16ms)
                        state.rotationX = state.targetRotationX;
                        state.rotationY = state.targetRotationY;
                        state.rotationZ = state.targetRotationZ;
                        state.yOffset = 0;
                        state.axisRotation = null; // Clear axis rotation
                    }
                    
                } else {
                    // Animation complete - lock to target orientation
                    state.rolling = false;
                    state.animationTime = 0;
                    state.rotationX = state.targetRotationX;
                    state.rotationY = state.targetRotationY;
                    state.rotationZ = state.targetRotationZ;
                    state.yOffset = 0;
                    state.axisRotation = null; // Clear axis rotation
                    state.currentFace = state.targetFace;
                    console.log(`Die landed on face ${state.targetFace}`);
                    anyJustFinished = true;
                }
            }
        }
        
        // Populate rolled dice pool when all dice finish rolling
        if (anyJustFinished && !this.isAnyRolling()) {
            this.populateRolledDicePool();
        }
    },

    // Render dice test screen
    render(ctx, canvas) {
        // Clear background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dice Test - Axe', canvas.width / 2, 50);

        // Draw unwrapped dice
        this.renderUnwrappedDice(ctx, canvas);

        // Draw rolling box
        this.renderRollingBox(ctx, canvas);

        // Draw reroll tray
        this.renderRerollTray(ctx, canvas);

        // Draw buttons
        this.renderButtons(ctx, canvas);

        // Draw dragged die if any
        if (this.testState.draggedDieIndex !== null) {
            this.renderDraggedDie(ctx);
        }

        // Draw tooltip (must be last to appear on top)
        this.renderTooltip(ctx, canvas);

        // Draw combat UI if in combat mode
        if (this.testState.combatMode && Combat.state.active) {
            this.renderCombatUI(ctx, canvas);
            
            // Draw rolled dice pool
            if (this.testState.rolledDice.length > 0) {
                this.renderRolledDicePool(ctx, canvas);
            }
        }
    },

    // Render unwrapped dice (all 6 faces in a row)
    renderUnwrappedDice(ctx, canvas) {
        const centerX = canvas.width / 2;
        
        for (let dieIdx = 0; dieIdx < this.testState.dice.length; dieIdx++) {
            const die = this.testState.dice[dieIdx];
            const dieState = this.testState.diceStates[dieIdx];
            const totalWidth = 6 * this.layout.unwrappedFaceSize + 5 * this.layout.unwrappedSpacing;
            const startX = centerX - totalWidth / 2;
            const y = this.layout.unwrappedY + dieIdx * 90;

            // Draw die name
            ctx.fillStyle = '#cccccc';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(die.name, startX, y - 10);

            // Draw each face
            for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
                const face = die.faces[faceIdx];
                const x = startX + faceIdx * (this.layout.unwrappedFaceSize + this.layout.unwrappedSpacing);
                
                this.drawDieFace(ctx, face, x, y, this.layout.unwrappedFaceSize, false);

                // Highlight current face
                if (faceIdx === dieState.currentFace && !dieState.rolling) {
                    ctx.strokeStyle = '#ffff00';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, y, this.layout.unwrappedFaceSize, this.layout.unwrappedFaceSize);
                }
            }
        }
    },

    // Render rolling box with perspective dice
    renderRollingBox(ctx, canvas) {
        const centerX = canvas.width / 2;
        const boxX = centerX - this.layout.rollingBoxWidth / 2;
        const boxY = this.layout.rollingBoxY;

        // Draw box background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(boxX, boxY, this.layout.rollingBoxWidth, this.layout.rollingBoxHeight);
        
        // Draw box border
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, this.layout.rollingBoxWidth, this.layout.rollingBoxHeight);

        // Draw label
        ctx.fillStyle = '#999999';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dice roll around a random axis through their center', centerX, boxY - 8);

        // Draw both dice side by side
        const numDice = this.testState.dice.length;
        const totalWidth = numDice * this.layout.dieSize + (numDice - 1) * this.layout.dieSpacing;
        const startX = centerX - totalWidth / 2 + this.layout.dieSize / 2;
        
        for (let i = 0; i < numDice; i++) {
            const die = this.testState.dice[i];
            const state = this.testState.diceStates[i];
            const dieX = startX + i * (this.layout.dieSize + this.layout.dieSpacing);
            const diceY = boxY + this.layout.rollingBoxHeight / 2;
            
            this.drawPerspectiveDie(ctx, die, dieX, diceY + state.yOffset, 
                                    this.layout.dieSize, state, i);
        }
    },

    // Render reroll tray
    renderRerollTray(ctx, canvas) {
        const centerX = canvas.width / 2;
        const trayX = centerX - this.layout.rollingBoxWidth / 2;
        const trayY = this.layout.rerollTrayY;

        // Draw tray background
        ctx.fillStyle = '#3a3a2a';
        ctx.fillRect(trayX, trayY, this.layout.rerollTrayWidth, this.layout.rerollTrayHeight);
        
        // Draw tray border
        ctx.strokeStyle = '#777755';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(trayX, trayY, this.layout.rerollTrayWidth, this.layout.rerollTrayHeight);
        ctx.setLineDash([]);

        // Draw label
        ctx.fillStyle = '#999977';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Reroll Tray', trayX + this.layout.rerollTrayWidth / 2, trayY - 8);

        // Draw dice in tray (small)
        const trayDiceSize = 50;
        const trayDiceSpacing = 60;
        for (let i = 0; i < this.testState.rerollTray.length; i++) {
            const dieIdx = this.testState.rerollTray[i];
            const die = this.testState.dice[dieIdx];
            const state = this.testState.diceStates[dieIdx];
            const x = trayX + 30 + i * trayDiceSpacing;
            const y = trayY + this.layout.rerollTrayHeight / 2;
            
            this.drawPerspectiveDie(ctx, die, x, y, trayDiceSize, state, dieIdx);
        }
    },

    // Render buttons
    renderButtons(ctx, canvas) {
        const centerX = canvas.width / 2;
        const buttonY = this.layout.buttonY;

        // Roll button
        const rollButtonX = centerX + 50;
        this.drawButton(ctx, rollButtonX, buttonY, this.layout.buttonWidth, 
                       this.layout.buttonHeight, 'Roll Dice', 'roll',
                       !this.isAnyRolling());

        // Reroll button
        const rerollButtonX = centerX + 50 + this.layout.buttonWidth + 20;
        this.drawButton(ctx, rerollButtonX, buttonY, this.layout.buttonWidth,
                       this.layout.buttonHeight, 'Reroll Selected', 'reroll',
                       this.testState.rerollTray.length > 0 && this.testState.rollsAvailable > 0 && !this.isAnyRolling());
    },

    // Draw a button
    drawButton(ctx, x, y, width, height, text, id, enabled) {
        const isHovered = this.testState.hoveredButton === id;
        
        // Background
        if (enabled) {
            ctx.fillStyle = isHovered ? '#557755' : '#446644';
        } else {
            ctx.fillStyle = '#333333';
        }
        ctx.fillRect(x, y, width, height);

        // Border
        ctx.strokeStyle = enabled ? '#88aa88' : '#555555';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Text
        ctx.fillStyle = enabled ? '#ffffff' : '#666666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + width / 2, y + height / 2);
    },

    // Draw a single die face
    drawDieFace(ctx, face, x, y, size, isSmall) {
        // Draw face background
        if (face.color === null) {
            // Blank face
            ctx.fillStyle = this.colors.Blank;
        } else {
            // Colored face with lighter shade
            ctx.fillStyle = this.colors[face.color + 'Light'];
        }
        ctx.fillRect(x, y, size, size);

        // Draw face border
        ctx.strokeStyle = this.colors.DieOutline;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);

        // Draw icon if present
        if (face.icon) {
            const iconSize = isSmall ? size * 0.5 : size * 0.6;
            const iconX = x + size / 2;
            const iconY = y + size / 2;
            this.drawIcon(ctx, face.icon, iconX, iconY, iconSize);
        }
    },

    // Draw a die as a 3D cube
    drawPerspectiveDie(ctx, die, x, y, size, state, dieIdx) {
        // Store die position for click detection
        if (!state.rolling) {
            if (!this.testState.diePositions) this.testState.diePositions = [];
            this.testState.diePositions[dieIdx] = { x, y, size };
        }

        // Draw 3D cube with proper rotation
        this.drawCube3D(ctx, die, x, y + state.yOffset, size, 
                       state.rotationX, state.rotationY, state.rotationZ, dieIdx);
    },

    // Draw a simple wireframe cube with proper perspective
    drawCube3D(ctx, die, x, y, size, rotX, rotY, rotZ, dieIdx) {
        const halfSize = size / 2;
        
        // Camera setup - FIXED POSITION (never moves)
        const camera = {
            x: 0,
            y: 0,
            z: 400,    // Out from screen
            focalLength: 600  // Increased from 300 to reduce perspective distortion
        };
        
        // Original cube vertices (constant - never modified)
        const originalVertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // Back vertices (0-3)
            [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1]  // Front vertices (4-7)
        ];

        // Transform pipeline for THIS die:
        // 1. Scale to size
        // 2. Apply rotation
        // 3. Translate to position on table (x, y)
        // Then project with fixed camera
        
        const transformedVertices = originalVertices.map(v => {
            // Step 1: Scale to die size
            let vx = v[0] * halfSize;
            let vy = v[1] * halfSize;
            let vz = v[2] * halfSize;
            
            // Step 2a: Apply target Euler rotation (rotX, rotY, rotZ)
            // Rotate around X axis (pitch)
            let tempY = vy * Math.cos(rotX) - vz * Math.sin(rotX);
            let tempZ = vy * Math.sin(rotX) + vz * Math.cos(rotX);
            vy = tempY;
            vz = tempZ;
            
            // Rotate around Y axis (yaw)
            let tempX = vx * Math.cos(rotY) + vz * Math.sin(rotY);
            tempZ = -vx * Math.sin(rotY) + vz * Math.cos(rotY);
            vx = tempX;
            vz = tempZ;
            
            // Rotate around Z axis (roll)
            tempX = vx * Math.cos(rotZ) - vy * Math.sin(rotZ);
            tempY = vx * Math.sin(rotZ) + vy * Math.cos(rotZ);
            vx = tempX;
            vy = tempY;
            
            return [vx, vy, vz];
        });
        
        // Step 2b: Apply axis-angle rotation if present (for spinning animation)
        const finalVertices = transformedVertices.map(v => {
            let vx = v[0];
            let vy = v[1];
            let vz = v[2];
            
            // Check if there's an axis rotation to apply (during animation)
            const state = this.testState.diceStates[dieIdx];
            if (state && state.axisRotation) {
                const axis = state.axisRotation.axis;
                const angle = state.axisRotation.angle;
                
                // Rodrigues' rotation formula: v' = v*cos(θ) + (k×v)*sin(θ) + k*(k·v)*(1-cos(θ))
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);
                const oneMinusCos = 1 - cosA;
                
                // k · v (dot product)
                const dotProduct = axis.x * vx + axis.y * vy + axis.z * vz;
                
                // k × v (cross product)
                const crossX = axis.y * vz - axis.z * vy;
                const crossY = axis.z * vx - axis.x * vz;
                const crossZ = axis.x * vy - axis.y * vx;
                
                // Apply Rodrigues' formula
                vx = vx * cosA + crossX * sinA + axis.x * dotProduct * oneMinusCos;
                vy = vy * cosA + crossY * sinA + axis.y * dotProduct * oneMinusCos;
                vz = vz * cosA + crossZ * sinA + axis.z * dotProduct * oneMinusCos;
            }
            
            return [vx, vy, vz];
        });
        
        // Step 4: Apply perspective projection with fixed camera
        const projectedVertices = finalVertices.map(v => {
            // Vertex position in world space (relative to camera)
            const worldX = v[0];
            const worldY = v[1];
            const worldZ = v[2];
            
            // Distance from camera
            const distanceFromCamera = camera.z - worldZ;
            
            // Perspective scale
            const scale = camera.focalLength / distanceFromCamera;
            
            return {
                x: worldX * scale,
                y: worldY * scale,
                z: worldZ
            };
        });
        
        // Define cube faces (vertex indices and face data)
        // Vertices must be in order: top-left, top-right, bottom-right, bottom-left (CCW from front view)
        const faces = [
            { vertices: [4, 5, 6, 7], faceIndex: 0 }, // Front face (+Z) - Face 0: bottom-left, bottom-right, top-right, top-left
            { vertices: [0, 3, 2, 1], faceIndex: 5 }, // Back face (-Z) - Face 5
            { vertices: [5, 1, 2, 6], faceIndex: 1 }, // Right face (+X) - Face 1
            { vertices: [4, 7, 3, 0], faceIndex: 3 }, // Left face (-X) - Face 3
            { vertices: [7, 6, 2, 3], faceIndex: 2 }, // Top face (+Y) - Face 2
            { vertices: [4, 0, 1, 5], faceIndex: 4 }  // Bottom face (-Y) - Face 4
        ];
        
        // Calculate face depths and sort by distance (painter's algorithm)
        const facesWithDepth = faces.map(face => {
            const avgZ = face.vertices.reduce((sum, vi) => sum + finalVertices[vi][2], 0) / 4;
            return { ...face, avgZ };
        });
        facesWithDepth.sort((a, b) => a.avgZ - b.avgZ); // Draw furthest first
        
        // Step 5: Draw at screen position (x, y passed to this function)
        ctx.save();
        ctx.translate(x, y); // Die's position on screen
        
        // Draw all faces sorted by depth
        let targetFaceData = null;
        
        facesWithDepth.forEach(face => {
            const verts = face.vertices.map(vi => projectedVertices[vi]);
            
            // Get pre-rendered texture for this face
            const texture = this.faceTextures[dieIdx][face.faceIndex];
            
            // Check if this is the chosen target face and die is settled
            const state = this.testState.diceStates[dieIdx];
            const isTargetFace = face.faceIndex === state.targetFace;
            const isSettled = !state.rolling;
            
            if (isTargetFace && isSettled) {
                // Save this face to draw last as a quad
                targetFaceData = { texture, verts };
            } else {
                // Draw other faces as triangles
                this.drawTexturedQuad(ctx, texture, verts, false);
            }
        });
        
        // Draw the target face last as a slightly larger quad so it's on top
        if (targetFaceData) {
            // Scale up the vertices slightly from their center
            const center = {
                x: targetFaceData.verts.reduce((sum, v) => sum + v.x, 0) / 4,
                y: targetFaceData.verts.reduce((sum, v) => sum + v.y, 0) / 4
            };
            
            const scaleFactor = 1.05; // 5% larger
            const scaledVerts = targetFaceData.verts.map(v => ({
                x: center.x + (v.x - center.x) * scaleFactor,
                y: center.y + (v.y - center.y) * scaleFactor,
                z: v.z
            }));
            
            this.drawTexturedQuad(ctx, targetFaceData.texture, scaledVerts, true);
        }
        
        ctx.restore();
    },

    // Draw a texture mapped to a quad defined by 4 vertices with proper perspective
    // Uses triangle subdivision and interpolation
    drawTexturedQuad(ctx, texture, verts, useSimpleQuad = false) {
        // If die is settled and not rolling, draw as a simple quad instead of triangles
        if (useSimpleQuad) {
            // Simple affine quad mapping (faster, no triangle split)
            ctx.save();
            
            const x0 = verts[0].x, y0 = verts[0].y;
            const x1 = verts[1].x, y1 = verts[1].y;
            const x3 = verts[3].x, y3 = verts[3].y;
            
            const tw = texture.width;
            const th = texture.height;
            
            // Calculate basis vectors for the quad
            const u = { x: x1 - x0, y: y1 - y0 }; // Right edge
            const v = { x: x3 - x0, y: y3 - y0 }; // Bottom edge
            
            // Transform to map texture to quad
            ctx.transform(
                u.x / tw, u.y / tw,  // Transform for X basis
                v.x / th, v.y / th,  // Transform for Y basis
                x0, y0               // Translation (origin)
            );
            
            ctx.drawImage(texture, 0, 0);
            ctx.restore();
            
            // Debug: Draw wireframe outline
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
        
        // Split quad into two triangles and render each with perspective-correct texture mapping
        // Triangle 1: verts[0], verts[1], verts[2]
        // Triangle 2: verts[0], verts[2], verts[3]
        
        this.drawTexturedTriangle(ctx, texture, 
            verts[0].x, verts[0].y, 0, 0,           // top-left corner
            verts[1].x, verts[1].y, texture.width, 0,  // top-right corner
            verts[2].x, verts[2].y, texture.width, texture.height  // bottom-right corner
        );
        
        this.drawTexturedTriangle(ctx, texture,
            verts[0].x, verts[0].y, 0, 0,           // top-left corner
            verts[2].x, verts[2].y, texture.width, texture.height,  // bottom-right corner
            verts[3].x, verts[3].y, 0, texture.height  // bottom-left corner
        );
        
        // Debug: Draw wireframe outline of the quad
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

    // Draw a textured triangle using affine texture mapping
    // This is an approximation but works reasonably well for small triangles
    drawTexturedTriangle(ctx, texture, x0, y0, u0, v0, x1, y1, u1, v1, x2, y2, u2, v2) {
        ctx.save();
        
        // Calculate transform from texture space to screen space
        // Using the first three vertices of the quad
        const texWidth = texture.width;
        const texHeight = texture.height;
        
        // Vectors in screen space
        const dx1 = x1 - x0;
        const dy1 = y1 - y0;
        const dx2 = x2 - x0;
        const dy2 = y2 - y0;
        
        // Vectors in texture space
        const du1 = u1 - u0;
        const dv1 = v1 - v0;
        const du2 = u2 - u0;
        const dv2 = v2 - v0;
        
        // Calculate determinant for inverse
        const det = du1 * dv2 - du2 * dv1;
        
        if (Math.abs(det) < 0.001) {
            // Degenerate triangle, skip
            ctx.restore();
            return;
        }
        
        // Calculate affine transform matrix
        const a = (dx1 * dv2 - dx2 * dv1) / det;
        const b = (dy1 * dv2 - dy2 * dv1) / det;
        const c = (dx2 * du1 - dx1 * du2) / det;
        const d = (dy2 * du1 - dy1 * du2) / det;
        const e = x0 - (a * u0 + c * v0);
        const f = y0 - (b * u0 + d * v0);
        
        // Clip to triangle
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.clip();
        
        // Apply transform and draw texture
        ctx.transform(a, b, c, d, e, f);
        ctx.drawImage(texture, 0, 0);
        
        ctx.restore();
    },

    // Draw dragged die
    renderDraggedDie(ctx) {
        const dieIdx = this.testState.draggedDieIndex;
        const die = this.testState.dice[dieIdx];
        const state = this.testState.diceStates[dieIdx];
        const mousePos = Input.getMousePosition();
        
        if (mousePos) {
            const x = mousePos.x + this.testState.dragOffset.x;
            const y = mousePos.y + this.testState.dragOffset.y;
            
            ctx.save();
            ctx.globalAlpha = 0.7;
            this.drawPerspectiveDie(ctx, die, x, y, this.layout.dieSize, state, dieIdx);
            ctx.restore();
        }
    },

    // Draw an icon (vector art)
    drawIcon(ctx, iconName, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = this.colors.IconDark;
        ctx.fillStyle = this.colors.IconDark;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const s = size / 2; // Half size for easier drawing

        switch (iconName) {
            case 'culling_blade':
                this.drawCullingBladeIcon(ctx, s);
                break;
            case 'chop':
                this.drawChopIcon(ctx, s);
                break;
            case 'dodge':
                this.drawDodgeIcon(ctx, s);
                break;
            case 'counter_helix':
                this.drawCounterHelixIcon(ctx, s);
                break;
            case 'berserkers_call':
                this.drawBerserkersCallIcon(ctx, s);
                break;
            case 'jab':
                this.drawJabIcon(ctx, s);
                break;
            default:
                // Unknown icon - draw question mark
                ctx.font = `${size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', 0, 0);
        }

        ctx.restore();
    },

    // Icon drawing functions - simple vector art
    drawCullingBladeIcon(ctx, s) {
        // Heavy executioner's axe
        ctx.beginPath();
        // Handle
        ctx.moveTo(0, s * 0.5);
        ctx.lineTo(0, s);
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Large curved blade
        ctx.beginPath();
        ctx.moveTo(-s * 0.8, -s * 0.3);
        ctx.quadraticCurveTo(-s * 0.5, -s * 0.8, s * 0.3, -s * 0.5);
        ctx.quadraticCurveTo(s * 0.5, -s * 0.3, s * 0.2, 0);
        ctx.lineTo(-s * 0.3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    },

    drawChopIcon(ctx, s) {
        // Generic axe swing
        ctx.beginPath();
        // Handle
        ctx.moveTo(-s * 0.3, s * 0.7);
        ctx.lineTo(s * 0.3, -s * 0.7);
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Blade
        ctx.beginPath();
        ctx.moveTo(s * 0.1, -s * 0.9);
        ctx.lineTo(s * 0.9, -s * 0.5);
        ctx.lineTo(s * 0.5, -s * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    },

    drawDodgeIcon(ctx, s) {
        // Motion lines indicating evasion
        ctx.lineWidth = 3;
        
        // Swoosh lines
        ctx.beginPath();
        ctx.moveTo(-s * 0.8, -s * 0.5);
        ctx.quadraticCurveTo(-s * 0.3, -s * 0.3, s * 0.2, -s * 0.6);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-s * 0.7, 0);
        ctx.quadraticCurveTo(-s * 0.2, 0.2, s * 0.3, -0.1);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-s * 0.6, s * 0.5);
        ctx.quadraticCurveTo(-s * 0.1, s * 0.7, s * 0.4, s * 0.4);
        ctx.stroke();
    },

    drawCounterHelixIcon(ctx, s) {
        // Spinning blade spiral
        ctx.lineWidth = 3;
        
        // Draw spiral with blade
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(cos * s * 0.9, sin * s * 0.9);
            ctx.stroke();
            
            // Blade tip
            ctx.beginPath();
            ctx.arc(cos * s * 0.9, sin * s * 0.9, s * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Center circle
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
    },

    drawBerserkersCallIcon(ctx, s) {
        // Taunt/shout symbol - sound waves from mouth
        // Head silhouette
        ctx.beginPath();
        ctx.arc(-s * 0.3, 0, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Sound waves
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            const offset = i * s * 0.3;
            ctx.beginPath();
            ctx.arc(s * 0.2 + offset, 0, s * 0.3 + offset, -Math.PI / 4, Math.PI / 4, false);
            ctx.stroke();
        }
    },

    drawJabIcon(ctx, s) {
        // Quick thrust - spear or fist
        ctx.lineWidth = 4;
        
        // Arm/shaft
        ctx.beginPath();
        ctx.moveTo(-s * 0.8, s * 0.3);
        ctx.lineTo(s * 0.5, -s * 0.5);
        ctx.stroke();
        
        // Fist/point
        ctx.beginPath();
        ctx.arc(s * 0.6, -s * 0.6, s * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Motion lines
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s * 0.8, -s * 0.7);
        ctx.lineTo(s, -s * 0.9);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(s * 0.7, -s * 0.3);
        ctx.lineTo(s * 0.9, -s * 0.5);
        ctx.stroke();
    },

    // Apply rotation around an arbitrary axis, starting from a target orientation
    // Uses Rodrigues' rotation formula to properly rotate around the given axis
    applyAxisRotation(state, axis, angle, targetX, targetY, targetZ) {
        // We want to: start at target orientation, then rotate by 'angle' around 'axis'
        // This is proper axis-angle rotation!
        
        // For the backwards animation:
        // - At angle = 0: we're at the target orientation
        // - At angle = Math.PI * 4: we've rotated 2 full turns around the random axis from target
        
        // Convert axis-angle to Euler angles by composing the rotations
        // This is complex, so let's use a simpler approach:
        // Store the axis-angle rotation and apply it in the vertex transformation
        
        // For now, store both the target Euler angles AND the axis-angle offset
        state.rotationX = targetX;
        state.rotationY = targetY;
        state.rotationZ = targetZ;
        
        // Store the additional axis-angle rotation to apply
        state.axisRotation = {
            axis: axis,
            angle: angle
        };
    },

    // Generate a random normalized axis through the center
    getRandomAxis() {
        // Generate random direction
        let x = Math.random() * 2 - 1;
        let y = Math.random() * 2 - 1;
        let z = Math.random() * 2 - 1;
        
        // Normalize to unit length
        const length = Math.sqrt(x * x + y * y + z * z);
        if (length > 0) {
            x /= length;
            y /= length;
            z /= length;
        }
        
        return { x, y, z };
    },

    // Roll all dice
    rollAllDice() {
        if (this.isAnyRolling()) return;
        
        console.log('Rolling all dice...');
        
        // Clear previous roll data
        this.testState.rolledDice = [];
        this.testState.savedDice = [];
        this.testState.assignedDice = {};
        this.testState.activeAbility = null;
        
        for (let i = 0; i < this.testState.diceStates.length; i++) {
            const state = this.testState.diceStates[i];
            
            // Generate a unique random axis for THIS die
            state.rollAxis = this.getRandomAxis();
            console.log(`Die ${i} roll axis:`, state.rollAxis);
            
            // Step 1: Choose the final face randomly for THIS die
            state.targetFace = Math.floor(Math.random() * 6);
            console.log(`Die ${i} will land on face ${state.targetFace}`);
            
            // Step 2: Set target rotation for that face (where we'll be at t=0.0)
            this.setTargetRotationForFace(state, state.targetFace);
            
            // Step 3: Start the backwards animation
            state.rolling = true;
            state.animationTime = 0;
        }
        
        // Populate rolled dice pool after animation completes
        // (will be done in update() when rolling finishes)
        
        // Clear reroll tray
        this.testState.rerollTray = [];
        this.testState.rollsAvailable = 1;
    },

    // Populate the rolled dice pool after dice finish rolling
    populateRolledDicePool() {
        this.testState.rolledDice = [];
        
        for (let i = 0; i < this.testState.dice.length; i++) {
            const die = this.testState.dice[i];
            const state = this.testState.diceStates[i];
            const face = die.faces[state.targetFace];
            
            if (face && face.icon) {
                const ability = getAbilityData(face.icon);
                this.testState.rolledDice.push({
                    poolIndex: this.testState.rolledDice.length, // Unique index in pool
                    dieIndex: i,
                    faceIndex: state.targetFace,
                    face: face,
                    ability: ability,
                    selected: false, // Whether it's been clicked/saved
                    assigned: false, // Whether it's been assigned to an ability
                    color: face.color
                });
            }
        }
        
        console.log('Rolled dice pool:', this.testState.rolledDice);
    },

    // Toggle die selection in the pool
    toggleDieSelection(poolIndex) {
        const rolledDie = this.testState.rolledDice[poolIndex];
        if (!rolledDie || rolledDie.assigned) return;
        
        rolledDie.selected = !rolledDie.selected;
        
        if (rolledDie.selected) {
            // Add to saved dice
            if (!this.testState.savedDice.includes(poolIndex)) {
                this.testState.savedDice.push(poolIndex);
            }
        } else {
            // Remove from saved dice
            const idx = this.testState.savedDice.indexOf(poolIndex);
            if (idx !== -1) {
                this.testState.savedDice.splice(idx, 1);
            }
        }
    },

    // Assign a die to an ability slot
    assignDieToAbility(poolIndex, abilityKey) {
        const rolledDie = this.testState.rolledDice[poolIndex];
        if (!rolledDie) return;
        
        // Mark as assigned
        rolledDie.assigned = true;
        rolledDie.selected = true;
        
        // Add to assigned dice for this ability
        if (!this.testState.assignedDice[abilityKey]) {
            this.testState.assignedDice[abilityKey] = [];
        }
        this.testState.assignedDice[abilityKey].push(poolIndex);
        
        // Remove from saved dice if it was there
        const idx = this.testState.savedDice.indexOf(poolIndex);
        if (idx !== -1) {
            this.testState.savedDice.splice(idx, 1);
        }
        
        console.log(`Assigned die ${poolIndex} to ability ${abilityKey}`);
    },

    // Unassign a die from an ability
    unassignDieFromAbility(poolIndex, abilityKey) {
        const rolledDie = this.testState.rolledDice[poolIndex];
        if (!rolledDie) return;
        
        // Mark as not assigned
        rolledDie.assigned = false;
        rolledDie.selected = false;
        
        // Remove from assigned dice
        if (this.testState.assignedDice[abilityKey]) {
            const idx = this.testState.assignedDice[abilityKey].indexOf(poolIndex);
            if (idx !== -1) {
                this.testState.assignedDice[abilityKey].splice(idx, 1);
            }
        }
        
        console.log(`Unassigned die ${poolIndex} from ability ${abilityKey}`);
    },

    // Calculate power-up bonus from burned dice
    calculatePowerUpBonus(abilityKey) {
        const assignedDice = this.testState.assignedDice[abilityKey] || [];
        if (assignedDice.length === 0) return { primaryDie: null, burnedCount: 0 };
        
        // First die is the primary (executes the ability)
        const primaryPoolIndex = assignedDice[0];
        const primaryDie = this.testState.rolledDice[primaryPoolIndex];
        
        // Count matching colored dice as burned (power-up)
        let burnedCount = 0;
        for (let i = 1; i < assignedDice.length; i++) {
            const poolIndex = assignedDice[i];
            const die = this.testState.rolledDice[poolIndex];
            if (die && die.color === primaryDie.color) {
                burnedCount++;
            }
        }
        
        return {
            primaryDie: primaryDie,
            burnedCount: burnedCount
        };
    },

    // Set rotation to display a specific die face pointing toward the camera
    // AIDEV-NOTE: "top" means "facing the camera" - the face pointing at the viewer
    setTargetRotationForFace(state, dieFaceIndex) {
        // Camera is at (0, 0, 400) looking toward origin along -Z axis
        // In initial orientation (0,0,0): Back face (-Z) points toward camera, Front face (+Z) points away
        
        // Die face mapping to geometric faces:
        // die face 0 -> Front (+Z) - points away from camera initially
        // die face 5 -> Back (-Z) - points toward camera initially
        
        // To make each die face point toward the camera (-Z direction):
        const faceRotations = [
            { x: 0, y: 0, z: Math.PI },              // Die face 0 (Front) -> rotate 180° around Z to flip to face camera
            { x: 0, y: -Math.PI / 2, z: 0 },         // Die face 1 (Right) -> rotate -90° around Y to face camera
            { x: Math.PI / 2, y: 0, z: 0 },          // Die face 2 (geometric Top) -> rotate 90° around X (was -90°, flipped!)
            { x: 0, y: Math.PI / 2, z: 0 },          // Die face 3 (Left) -> rotate 90° around Y to face camera
            { x: -Math.PI / 2, y: 0, z: 0 },         // Die face 4 (geometric Bottom) -> rotate -90° around X (was 90°, flipped!)
            { x: 0, y: Math.PI, z: 0 }               // Die face 5 (Back) -> rotate 180° around Y (was 0, now flipped!)
        ];
        
        const rotation = faceRotations[dieFaceIndex];
        
        // Add random Z-axis rotation (0°, 90°, 180°, or 270°) to randomize face orientation
        const randomZRotations = [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2];
        const randomZRotation = randomZRotations[Math.floor(Math.random() * 4)];
        
        state.targetRotationX = rotation.x;
        state.targetRotationY = rotation.y;
        state.targetRotationZ = rotation.z + randomZRotation; // Add random spin around viewing axis
        
        console.log(`Die face ${dieFaceIndex} will face camera with ${(randomZRotation * 180 / Math.PI).toFixed(0)}° Z rotation -> (${rotation.x.toFixed(2)}, ${rotation.y.toFixed(2)}, ${(rotation.z + randomZRotation).toFixed(2)})`);
    },

    // Reroll selected dice
    rerollSelected() {
        if (this.testState.rerollTray.length === 0) return;
        if (this.testState.rollsAvailable <= 0) return;
        if (this.isAnyRolling()) return;
        
        console.log('Rerolling selected dice:', this.testState.rerollTray);
        for (const dieIdx of this.testState.rerollTray) {
            const state = this.testState.diceStates[dieIdx];
            
            // Save current orientation as start position
            state.startRotationX = state.rotationX;
            state.startRotationY = state.rotationY;
            state.startRotationZ = state.rotationZ;
            
            state.rolling = true;
            state.animationTime = 0;
            state.targetFace = Math.floor(Math.random() * 6);
            
            // Set target rotation for new face
            this.setTargetRotationForFace(state, state.targetFace);
        }
        
        this.testState.rollsAvailable--;
        this.testState.rerollTray = [];
    },

    // Check if any die is rolling
    isAnyRolling() {
        return this.testState.diceStates.some(state => state.rolling);
    },

    // Handle mouse down
    onMouseDown(mousePos, canvas) {
        // Only handle button clicks now - no drag controls
        this.checkButtonClick(mousePos, canvas);
    },

    // Handle mouse up
    onMouseUp(mousePos, canvas) {
        // No drag to end
    },

    // Handle mouse move
    onMouseMove(mousePos, canvas) {
        // Check for face hover (for tooltip)
        this.updateTooltip(mousePos, canvas);
        
        this.testState.hoveredButton = null;

        // Check combat button hovers if in combat mode
        if (this.testState.combatMode && Combat.state.active) {
            // Check rolled dice pool hovers
            if (this.testState.rolledDice.length > 0) {
                this.checkDicePoolHover(mousePos, canvas);
            }
            
            const centerX = canvas.width / 2;
            const buttonY = canvas.height - 80;
            const buttonWidth = 150;
            const buttonHeight = 40;
            const buttonSpacing = 20;

            const executeX = centerX - buttonWidth - buttonSpacing / 2;
            const endTurnX = centerX + buttonSpacing / 2;

            if (mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
                if (mousePos.x >= executeX && mousePos.x <= executeX + buttonWidth) {
                    this.testState.hoveredButton = 'execute';
                } else if (mousePos.x >= endTurnX && mousePos.x <= endTurnX + buttonWidth) {
                    this.testState.hoveredButton = 'end_turn';
                }
            }
            return; // Skip normal button checks in combat mode
        }
        
        // Check normal button hovers
        const centerX = canvas.width / 2;
        const buttonY = this.layout.buttonY;
        
        const rollButtonX = centerX + 50;
        const rerollButtonX = centerX + 50 + this.layout.buttonWidth + 20;
        
        if (mousePos.y >= buttonY && mousePos.y <= buttonY + this.layout.buttonHeight) {
            if (mousePos.x >= rollButtonX && mousePos.x <= rollButtonX + this.layout.buttonWidth) {
                this.testState.hoveredButton = 'roll';
            } else if (mousePos.x >= rerollButtonX && mousePos.x <= rerollButtonX + this.layout.buttonWidth) {
                this.testState.hoveredButton = 'reroll';
            }
        }
    },

    // Check if mouse is over a die in the pool
    checkDicePoolHover(mousePos, canvas) {
        const poolX = canvas.width / 2 - 200;
        const poolY = canvas.height - 250;
        const dieSize = 50;
        const dieSpacing = 10;
        const startX = poolX + 20;
        const startY = poolY + 55;
        
        this.testState.hoveredDieIndex = null;
        
        for (let i = 0; i < this.testState.rolledDice.length; i++) {
            const x = startX + i * (dieSize + dieSpacing);
            const y = startY;
            
            if (mousePos.x >= x && mousePos.x <= x + dieSize &&
                mousePos.y >= y && mousePos.y <= y + dieSize) {
                this.testState.hoveredDieIndex = i;
                break;
            }
        }
    },

    // Check if a button was clicked
    checkButtonClick(mousePos, canvas) {
        // Handle combat button clicks if in combat mode
        if (this.testState.combatMode && Combat.state.active) {
            // Check if clicking on a die in the pool
            if (this.testState.rolledDice.length > 0) {
                const dieClicked = this.checkDicePoolClick(mousePos, canvas);
                if (dieClicked !== null) {
                    this.toggleDieSelection(dieClicked);
                    return;
                }
            }
            
            const centerX = canvas.width / 2;
            const buttonY = canvas.height - 80;
            const buttonWidth = 150;
            const buttonHeight = 40;
            const buttonSpacing = 20;

            const executeX = centerX - buttonWidth - buttonSpacing / 2;
            const endTurnX = centerX + buttonSpacing / 2;

            // Execute Ability button
            if (mousePos.x >= executeX && mousePos.x <= executeX + buttonWidth &&
                mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
                this.executeCombatAbility();
                return;
            }

            // End Turn button
            if (mousePos.x >= endTurnX && mousePos.x <= endTurnX + buttonWidth &&
                mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
                Combat.endTurn();
                return;
            }
            return; // Skip normal button checks in combat mode
        }

        // Normal button clicks
        const centerX = canvas.width / 2;
        const buttonY = this.layout.buttonY;
        
        const rollButtonX = centerX + 50;
        const rerollButtonX = centerX + 50 + this.layout.buttonWidth + 20;
        
        // Roll button
        if (mousePos.x >= rollButtonX && mousePos.x <= rollButtonX + this.layout.buttonWidth &&
            mousePos.y >= buttonY && mousePos.y <= buttonY + this.layout.buttonHeight) {
            this.rollAllDice();
            return;
        }
        
        // Reroll button
        if (mousePos.x >= rerollButtonX && mousePos.x <= rerollButtonX + this.layout.buttonWidth &&
            mousePos.y >= buttonY && mousePos.y <= buttonY + this.layout.buttonHeight) {
            this.rerollSelected();
            return;
        }
    },

    // Check if a die in the pool was clicked, return poolIndex or null
    checkDicePoolClick(mousePos, canvas) {
        const poolX = canvas.width / 2 - 200;
        const poolY = canvas.height - 250;
        const dieSize = 50;
        const dieSpacing = 10;
        const startX = poolX + 20;
        const startY = poolY + 55;
        
        for (let i = 0; i < this.testState.rolledDice.length; i++) {
            const x = startX + i * (dieSize + dieSpacing);
            const y = startY;
            
            if (mousePos.x >= x && mousePos.x <= x + dieSize &&
                mousePos.y >= y && mousePos.y <= y + dieSize) {
                return i;
            }
        }
        
        return null;
    },

    // Execute ability from rolled dice
    executeCombatAbility() {
        if (!Combat.state.active) return;

        // Find first selected die that hasn't been assigned yet
        const selectedDie = this.testState.rolledDice.find(d => d.selected && !d.assigned);
        
        if (!selectedDie) {
            console.log('No selected dice to execute');
            return;
        }

        // For now, simple execution: use the selected die
        // Count any other selected dice of matching color as power-ups
        const matchingColor = selectedDie.color;
        let burnedCount = 0;
        
        for (let rolledDie of this.testState.rolledDice) {
            if (rolledDie !== selectedDie && 
                rolledDie.selected && 
                !rolledDie.assigned && 
                rolledDie.color === matchingColor) {
                burnedCount++;
                rolledDie.assigned = true; // Mark as burned
            }
        }
        
        // Mark primary die as assigned
        selectedDie.assigned = true;
        
        // Execute the ability with power-up bonus
        const caster = Combat.getCurrentUnit();
        const target = Combat.getOpponentUnit();
        
        Combat.executeAbility(selectedDie.ability, caster, target, burnedCount);
        
        console.log(`Executed ${selectedDie.ability.displayName} with ${burnedCount} burned dice`);
    },

    // AIDEV-NOTE: Tooltip system
    // Updates tooltip state based on mouse position
    updateTooltip(mousePos, canvas) {
        const tooltip = this.testState.tooltip;
        tooltip.visible = false;
        tooltip.dieIndex = null;
        tooltip.faceIndex = null;
        
        // TODO: In the future, also check unwrapped dice faces
        // For now, only check the camera-facing die face in the rolling box
        
        const centerX = canvas.width / 2;
        const rollingBoxY = this.layout.rollingBoxY;
        const dieSize = this.layout.dieSize;
        const dieSpacing = this.layout.dieSpacing;
        
        // Check each die in the rolling box
        for (let i = 0; i < this.testState.dice.length; i++) {
            const dieX = centerX - (this.testState.dice.length - 1) * dieSpacing / 2 + i * dieSpacing;
            const dieY = rollingBoxY + this.layout.rollingBoxHeight / 2;
            
            // Simple box check around the die
            const hitboxSize = dieSize * 1.5;
            if (Math.abs(mousePos.x - dieX) < hitboxSize / 2 && 
                Math.abs(mousePos.y - dieY) < hitboxSize / 2) {
                
                const state = this.testState.diceStates[i];
                tooltip.visible = true;
                tooltip.dieIndex = i;
                tooltip.faceIndex = state.targetFace;
                tooltip.x = mousePos.x + 15; // Offset from cursor
                tooltip.y = mousePos.y + 15;
                tooltip.filledSlots = []; // Start with empty slots
                break;
            }
        }
    },

    // Render tooltip if visible
    renderTooltip(ctx, canvas) {
        const tooltip = this.testState.tooltip;
        if (!tooltip.visible || tooltip.dieIndex === null) {
            return;
        }
        
        const die = this.testState.dice[tooltip.dieIndex];
        const face = die.faces[tooltip.faceIndex];
        
        // Skip blank faces
        if (!face.icon) {
            return;
        }
        
        // Get ability data
        const ability = getAbilityData(face.icon);
        if (!ability) {
            return;
        }
        
        // Calculate filled slots
        const filledCount = tooltip.filledSlots.filter(f => f).length;
        const formatted = formatAbilityDescription(ability, filledCount);
        const calc = formatted.calculation;
        
        // Measure tooltip dimensions
        ctx.font = 'bold 16px Arial';
        const titleWidth = ctx.measureText(ability.displayName).width;
        ctx.font = '14px Arial';
        const descWidth = ctx.measureText(formatted.description).width;
        const formulaText = calc.hasSlots ? `${calc.formula} = ${calc.result} ${calc.valueType}` : `${calc.result} ${calc.valueType}`;
        const formulaWidth = ctx.measureText(formulaText).width;
        
        const tooltipWidth = Math.max(titleWidth, descWidth, formulaWidth, 200) + 40;
        const slotRowHeight = ability.powerUpSlots > 0 ? 30 : 0;
        const tooltipHeight = 100 + slotRowHeight;
        
        // Keep tooltip on screen
        let x = tooltip.x;
        let y = tooltip.y;
        if (x + tooltipWidth > canvas.width) {
            x = canvas.width - tooltipWidth - 10;
        }
        if (y + tooltipHeight > canvas.height) {
            y = canvas.height - tooltipHeight - 10;
        }
        
        // Draw tooltip background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, tooltipWidth, tooltipHeight);
        ctx.strokeRect(x, y, tooltipWidth, tooltipHeight);
        
        // Draw title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(ability.displayName, x + 20, y + 25);
        
        // Draw description
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.fillText(formatted.description, x + 20, y + 50);
        
        // Draw formula and result
        ctx.fillStyle = '#AAFFAA';
        ctx.fillText(formulaText, x + 20, y + 70);
        
        // Draw power-up slots if ability has them
        if (ability.powerUpSlots > 0) {
            ctx.fillStyle = '#CCCCCC';
            ctx.font = '12px Arial';
            ctx.fillText(`Power-up slots (X = ${filledCount}):`, x + 20, y + 90);
            
            const slotSize = 20;
            const slotSpacing = 5;
            for (let i = 0; i < ability.powerUpSlots; i++) {
                const slotX = x + 20 + i * (slotSize + slotSpacing);
                const slotY = y + 95;
                
                const slotColor = ability.powerUpColors[i];
                const isFilled = tooltip.filledSlots[i] === true;
                
                // Draw slot border
                ctx.strokeStyle = this.colors[slotColor] || '#888888';
                ctx.lineWidth = 2;
                ctx.strokeRect(slotX, slotY, slotSize, slotSize);
                
                // Fill if filled
                if (isFilled) {
                    ctx.fillStyle = this.colors[slotColor] || '#888888';
                    ctx.fillRect(slotX + 2, slotY + 2, slotSize - 4, slotSize - 4);
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.fillRect(slotX + 2, slotY + 2, slotSize - 4, slotSize - 4);
                }
            }
        }
    },

    // AIDEV-NOTE: Combat UI rendering
    renderCombatUI(ctx, canvas) {
        if (!Combat.state.active) return;

        const playerUnit = Combat.state.playerUnit;
        const enemyUnit = Combat.state.enemyUnit;

        // Draw player unit on the left
        const leftPanelX = 20;
        const leftPanelY = 20;
        const panelWidth = 280;
        const panelHeight = 250;

        // Player panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeStyle = '#44CCFF';
        ctx.lineWidth = 2;
        ctx.fillRect(leftPanelX, leftPanelY, panelWidth, panelHeight);
        ctx.strokeRect(leftPanelX, leftPanelY, panelWidth, panelHeight);

        // Player unit info
        this.renderUnitInfo(ctx, playerUnit, leftPanelX + 20, leftPanelY + 20, true);

        // Draw enemy unit on the right
        const rightPanelX = canvas.width - panelWidth - 20;
        const rightPanelY = 20;

        // Enemy panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeStyle = '#FF8844';
        ctx.lineWidth = 2;
        ctx.fillRect(rightPanelX, rightPanelY, panelWidth, panelHeight);
        ctx.strokeRect(rightPanelX, rightPanelY, panelWidth, panelHeight);

        // Enemy unit info
        this.renderUnitInfo(ctx, enemyUnit, rightPanelX + 20, rightPanelY + 20, false);

        // Draw turn indicator in top center
        const turnBoxWidth = 300;
        const turnBoxHeight = 60;
        const turnBoxX = canvas.width / 2 - turnBoxWidth / 2;
        const turnBoxY = 20;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.fillRect(turnBoxX, turnBoxY, turnBoxWidth, turnBoxHeight);
        ctx.strokeRect(turnBoxX, turnBoxY, turnBoxWidth, turnBoxHeight);

        const currentTurnText = Combat.state.currentTurn === 'player' ? 'Your Turn' : 'Enemy Turn';
        ctx.fillStyle = Combat.state.currentTurn === 'player' ? '#44FF44' : '#FF4444';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Turn ${Combat.state.turnNumber}`, turnBoxX + turnBoxWidth / 2, turnBoxY + 28);
        ctx.font = 'bold 18px Arial';
        ctx.fillText(currentTurnText, turnBoxX + turnBoxWidth / 2, turnBoxY + 50);
        ctx.textAlign = 'left';

        // Combat log at bottom left
        const logX = 20;
        const logY = canvas.height - 180;
        const logWidth = 320;
        const logHeight = 100;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 2;
        ctx.fillRect(logX, logY, logWidth, logHeight);
        ctx.strokeRect(logX, logY, logWidth, logHeight);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Combat Log:', logX + 10, logY + 20);
        
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '12px Arial';
        const logEntries = Combat.state.combatLog.slice(-4);
        logEntries.forEach((entry, i) => {
            const truncated = entry.message.length > 38 ? entry.message.substring(0, 35) + '...' : entry.message;
            ctx.fillText(truncated, logX + 10, logY + 40 + i * 15);
        });

        // Action buttons (bottom center)
        this.renderCombatButtons(ctx, canvas);
    },

    // Render unit info (HP, armor, status effects)
    renderUnitInfo(ctx, unit, x, y, isPlayer) {
        const width = 240;
        
        // Draw portrait if available
        const portraitSize = 80;
        const portraitX = x;
        const portraitY = y;
        
        if (unit.portrait && this.portraits && this.portraits[unit.id]) {
            // Draw portrait with border
            ctx.save();
            ctx.strokeStyle = isPlayer ? '#44CCFF' : '#FF8844';
            ctx.lineWidth = 3;
            ctx.strokeRect(portraitX, portraitY, portraitSize, portraitSize);
            ctx.drawImage(this.portraits[unit.id], portraitX, portraitY, portraitSize, portraitSize);
            ctx.restore();
        } else {
            // Draw placeholder if no portrait
            ctx.fillStyle = '#222222';
            ctx.fillRect(portraitX, portraitY, portraitSize, portraitSize);
            ctx.strokeStyle = isPlayer ? '#44CCFF' : '#FF8844';
            ctx.lineWidth = 2;
            ctx.strokeRect(portraitX, portraitY, portraitSize, portraitSize);
            
            // Draw first letter of name as placeholder
            ctx.fillStyle = isPlayer ? '#44CCFF' : '#FF8844';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(unit.name.charAt(0), portraitX + portraitSize / 2, portraitY + portraitSize / 2 + 16);
            ctx.textAlign = 'left';
        }
        
        // Unit name (to the right of portrait)
        const nameX = x + portraitSize + 10;
        ctx.fillStyle = isPlayer ? '#44CCFF' : '#FF8844';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(unit.name, nameX, y + 16);

        // HP bar (to the right of portrait)
        const hpBarX = nameX;
        const hpBarY = y + 30;
        const hpBarWidth = width - portraitSize - 10;
        const hpBarHeight = 30;
        const hpPercent = unit.hp / unit.maxHp;
        
        // Dark red background
        ctx.fillStyle = '#3D0000';
        ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        
        // HP fill (gradient red)
        const gradient = ctx.createLinearGradient(hpBarX, hpBarY, hpBarX + hpBarWidth * hpPercent, hpBarY);
        if (hpPercent > 0.5) {
            gradient.addColorStop(0, '#8B0000');
            gradient.addColorStop(1, '#B22222');
        } else if (hpPercent > 0.25) {
            gradient.addColorStop(0, '#8B0000');
            gradient.addColorStop(1, '#DC143C');
        } else {
            gradient.addColorStop(0, '#B22222');
            gradient.addColorStop(1, '#FF0000');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
        
        // HP bar border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        
        // HP text (white)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${unit.hp} / ${unit.maxHp}`, hpBarX + hpBarWidth / 2, hpBarY + 20);
        ctx.textAlign = 'left';

        // Armor (below portrait)
        const infoY = y + portraitSize + 10;
        if (unit.armor > 0) {
            ctx.fillStyle = '#AAAAFF';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(`🛡 Armor: ${unit.armor}`, x, infoY);
        }

        // Status effects (below armor)
        if (unit.statusEffects && unit.statusEffects.length > 0) {
            let statusY = infoY + (unit.armor > 0 ? 18 : 0);
            unit.statusEffects.forEach((effect) => {
                let statusText = effect.type;
                let statusColor = '#FFAA44';
                
                // Color code by effect type
                if (effect.type === 'poison') {
                    statusColor = '#66FF66';
                    if (effect.stacks > 1) {
                        statusText += ` (${effect.stacks}x)`;
                    }
                } else if (effect.type === 'bleed') {
                    statusColor = '#FF6666';
                } else if (effect.type === 'regen') {
                    statusColor = '#66FFAA';
                }
                
                statusText += ` [${effect.duration}]`;
                ctx.fillStyle = statusColor;
                ctx.font = 'bold 11px Arial';
                ctx.fillText(statusText, x, statusY);
                statusY += 16;
            });
        }
    },

    // AIDEV-NOTE: Render rolled dice pool for selection
    renderRolledDicePool(ctx, canvas) {
        const poolX = canvas.width / 2 - 200;
        const poolY = canvas.height - 250;
        const poolWidth = 400;
        const poolHeight = 140;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.fillRect(poolX, poolY, poolWidth, poolHeight);
        ctx.strokeRect(poolX, poolY, poolWidth, poolHeight);
        
        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Rolled Dice Pool', poolX + poolWidth / 2, poolY + 20);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText('Click to select • Drag to ability slots', poolX + poolWidth / 2, poolY + 38);
        ctx.textAlign = 'left';
        
        // Render each die in the pool
        const dieSize = 50;
        const dieSpacing = 10;
        const startX = poolX + 20;
        const startY = poolY + 55;
        
        this.testState.rolledDice.forEach((rolledDie, i) => {
            const x = startX + i * (dieSize + dieSpacing);
            const y = startY;
            
            // Skip if off-screen
            if (x + dieSize > poolX + poolWidth - 20) return;
            
            // Die background color based on state
            let bgColor = this.colors[rolledDie.color + 'Light'] || '#888888';
            let borderColor = this.colors[rolledDie.color] || '#666666';
            let borderWidth = 2;
            
            if (rolledDie.assigned) {
                // Assigned dice are semi-transparent
                ctx.globalAlpha = 0.4;
            } else if (rolledDie.selected) {
                // Selected dice have thicker gold border
                borderColor = '#FFD700';
                borderWidth = 4;
            }
            
            // Draw die background
            ctx.fillStyle = bgColor;
            ctx.fillRect(x, y, dieSize, dieSize);
            
            // Draw border
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(x, y, dieSize, dieSize);
            
            // Draw icon (simplified - just show first letter of ability name)
            ctx.fillStyle = this.colors[rolledDie.color] || '#666666';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            const iconText = rolledDie.ability.displayName.substring(0, 2).toUpperCase();
            ctx.fillText(iconText, x + dieSize / 2, y + dieSize / 2 + 8);
            
            // Reset alpha
            ctx.globalAlpha = 1.0;
        });
        
        ctx.textAlign = 'left';
    },

    // Render combat action buttons
    renderCombatButtons(ctx, canvas) {
        const centerX = canvas.width / 2;
        const buttonY = canvas.height - 80;
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonSpacing = 20;

        // Execute Ability button (for rolled dice)
        const executeX = centerX - buttonWidth - buttonSpacing / 2;
        const executeHovered = this.testState.hoveredButton === 'execute';
        
        ctx.fillStyle = executeHovered ? '#44AA44' : '#336633';
        ctx.fillRect(executeX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#88FF88';
        ctx.lineWidth = 2;
        ctx.strokeRect(executeX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Execute Ability', executeX + buttonWidth / 2, buttonY + 25);

        // End Turn button
        const endTurnX = centerX + buttonSpacing / 2;
        const endTurnHovered = this.testState.hoveredButton === 'end_turn';
        
        ctx.fillStyle = endTurnHovered ? '#AA4444' : '#663333';
        ctx.fillRect(endTurnX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#FF8888';
        ctx.lineWidth = 2;
        ctx.strokeRect(endTurnX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('End Turn', endTurnX + buttonWidth / 2, buttonY + 25);

        ctx.textAlign = 'left'; // Reset alignment
    }
};

