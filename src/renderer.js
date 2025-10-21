// BOTA - Renderer Module
// Handles all Canvas rendering

const Renderer = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    
    // Assets
    assets: {
        logo: null,
        map: null,
        parchmentBg: null,
        smallBoat: null,
        greenXMarker: null,
        sunMoonCircle: null
    },

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element '${canvasId}' not found!`);
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Failed to get 2D context from canvas!');
        }

        // AIDEV-NOTE: Configure image smoothing to prevent twinkling when zoomed out
        // Use high quality smoothing to reduce aliasing artifacts
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        // Set canvas to full window size
        this.resize();
        window.addEventListener('resize', () => this.resize());

        console.log('Renderer initialized:', this.width, 'x', this.height);
    },

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Reapply image smoothing settings (canvas resize can reset context properties)
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    },

    clear(color = '#0a0e1a') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    },

    // AIDEV-NOTE: Draw BOTA logo
    // Uses actual logo image (DOTA style with planks over D, red B)
    drawLogo(x, y, scale = 1) {
        const ctx = this.ctx;
        ctx.save();

        if (this.assets.logo && this.assets.logo.complete) {
            // Draw actual logo image
            const logoWidth = 400 * scale;
            const logoHeight = (this.assets.logo.height / this.assets.logo.width) * logoWidth;
            
            ctx.drawImage(
                this.assets.logo,
                x - logoWidth / 2,
                y - logoHeight / 2,
                logoWidth,
                logoHeight
            );
        } else {
            // Fallback: Draw text placeholder if logo not loaded
            ctx.font = `bold ${72 * scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Shadow for depth
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;

            // Gold gradient for text
            const gradient = ctx.createLinearGradient(
                x - 150 * scale, 
                y - 36 * scale,
                x + 150 * scale, 
                y + 36 * scale
            );
            gradient.addColorStop(0, '#d4af37');
            gradient.addColorStop(0.5, '#ffd700');
            gradient.addColorStop(1, '#d4af37');

            ctx.fillStyle = gradient;
            ctx.fillText('BOTA', x, y);

            // Outline
            ctx.strokeStyle = '#8b7355';
            ctx.lineWidth = 3;
            ctx.strokeText('BOTA', x, y);
        }

        ctx.restore();
    },

    // Load assets
    async loadAssets() {
        console.log('Loading assets...');
        
        // Load logo
        this.assets.logo = new Image();
        this.assets.logo.src = 'assets/ui/bota_logo.png';
        
        // Load map
        this.assets.map = new Image();
        this.assets.map.src = 'assets/map/world_map.png';
        
        // Load parchment background
        this.assets.parchmentBg = new Image();
        this.assets.parchmentBg.src = 'assets/ui/parchment_bg.png';
        
        // Load small boat sprite (legacy)
        this.assets.smallBoat = new Image();
        this.assets.smallBoat.src = 'assets/ships/small_boat.png';
        
        // Load all starter ship sprites
        this.assets.ships = {};
        this.assets.ships.merchant_barge = new Image();
        this.assets.ships.merchant_barge.src = 'assets/ships/merchant_barge.png';
        this.assets.ships.patrol_cutter = new Image();
        this.assets.ships.patrol_cutter.src = 'assets/ships/patrol_cutter.png';
        this.assets.ships.mystic_skiff = new Image();
        this.assets.ships.mystic_skiff.src = 'assets/ships/mystic_skiff.png';
        this.assets.ships.granite_trader = new Image();
        this.assets.ships.granite_trader.src = 'assets/ships/granite_trader.png';
        this.assets.ships.tide_runner = new Image();
        this.assets.ships.tide_runner.src = 'assets/ships/tide_runner.png';
        this.assets.ships.coral_skiff = new Image();
        this.assets.ships.coral_skiff.src = 'assets/ships/coral_skiff.png';
        this.assets.ships.rogues_sloop = new Image();
        this.assets.ships.rogues_sloop.src = 'assets/ships/rogues_sloop.png';
        this.assets.ships.willowbark_trader = new Image();
        this.assets.ships.willowbark_trader.src = 'assets/ships/willowbark_trader.png';
        this.assets.ships.oglodi_longboat = new Image();
        this.assets.ships.oglodi_longboat.src = 'assets/ships/oglodi_longboat.png';
        this.assets.ships.tinkers_barge = new Image();
        this.assets.ships.tinkers_barge.src = 'assets/ships/tinkers_barge.png';
        
        // Load green X marker
        this.assets.greenXMarker = new Image();
        this.assets.greenXMarker.src = 'assets/ui/green_x_marker.png';
        
        // Load sun/moon circle
        this.assets.sunMoonCircle = new Image();
        this.assets.sunMoonCircle.src = 'assets/ui/sun_moon_circle.png';
        
        // Load captain portraits
        this.assets.captains = {};
        this.assets.captains.captain_kunkka = new Image();
        this.assets.captains.captain_kunkka.src = 'assets/characters/captain_kunkka.png';
        this.assets.captains.captain_rubick = new Image();
        this.assets.captains.captain_rubick.src = 'assets/characters/captain_rubick.png';
        this.assets.captains.captain_alchemist = new Image();
        this.assets.captains.captain_alchemist.src = 'assets/characters/captain_alchemist.png';
        this.assets.captains.captain_slardar = new Image();
        this.assets.captains.captain_slardar.src = 'assets/characters/captain_slardar.png';
        this.assets.captains.captain_naga_siren = new Image();
        this.assets.captains.captain_naga_siren.src = 'assets/characters/captain_naga_siren.png';
        this.assets.captains.captain_tidehunter = new Image();
        this.assets.captains.captain_tidehunter.src = 'assets/characters/captain_tidehunter.png';
        this.assets.captains.captain_enchantress = new Image();
        this.assets.captains.captain_enchantress.src = 'assets/characters/captain_enchantress.png';
        this.assets.captains.captain_axe = new Image();
        this.assets.captains.captain_axe.src = 'assets/characters/captain_axe.png';
        this.assets.captains.captain_tinker = new Image();
        this.assets.captains.captain_tinker.src = 'assets/characters/captain_tinker.png';
        
        // Load goods icons
        this.assets.goods = {};
        const goodsList = [
            'grain', 'corn', 'fish', 'wood', 'clay', 'salt', 'herbs',
            'cotton', 'sugar', 'meat', 'fruit', 'coal', 'iron_ore', 'mana_crystals',
            'beer', 'dye', 'pottery', 'flux', 'planks',
            'cloth', 'rum', 'wine', 'iron_ingots', 'coke',
            'weapons', 'armor', 'furniture', 'potions', 'fine_clothing',
            'magic_items', 'enchanted_armor', 'artifacts', 'elixirs'
        ];
        
        for (const good of goodsList) {
            const img = new Image();
            img.src = `assets/goods/${good}.png`;
            this.assets.goods[good] = img;
        }
        
        // Port images by faction and tier (all 9 factions, 3 tiers each)
        this.assets.ports = {};
        
        // Claddish Navy
        this.assets.ports.claddish_navy_tier1 = new Image();
        this.assets.ports.claddish_navy_tier1.src = 'assets/ports/claddish_navy_port_tier1.png';
        this.assets.ports.claddish_navy_tier2 = new Image();
        this.assets.ports.claddish_navy_tier2.src = 'assets/ports/claddish_navy_port_tier2.png';
        this.assets.ports.claddish_navy_tier3 = new Image();
        this.assets.ports.claddish_navy_tier3.src = 'assets/ports/claddish_navy_port_tier3.png';
        
        // Stonehall Merchants
        this.assets.ports.stonehall_merchants_tier1 = new Image();
        this.assets.ports.stonehall_merchants_tier1.src = 'assets/ports/stonehall_merchants_port_tier1.png';
        this.assets.ports.stonehall_merchants_tier2 = new Image();
        this.assets.ports.stonehall_merchants_tier2.src = 'assets/ports/stonehall_merchants_port_tier2.png';
        this.assets.ports.stonehall_merchants_tier3 = new Image();
        this.assets.ports.stonehall_merchants_tier3.src = 'assets/ports/stonehall_merchants_port_tier3.png';
        
        // Keen Folk Engineers
        this.assets.ports.keen_folk_engineers_tier1 = new Image();
        this.assets.ports.keen_folk_engineers_tier1.src = 'assets/ports/keen_folk_engineers_port_tier1.png';
        this.assets.ports.keen_folk_engineers_tier2 = new Image();
        this.assets.ports.keen_folk_engineers_tier2.src = 'assets/ports/keen_folk_engineers_port_tier2.png';
        
        // Roseleaf Traders
        this.assets.ports.roseleaf_traders_tier1 = new Image();
        this.assets.ports.roseleaf_traders_tier1.src = 'assets/ports/roseleaf_traders_port_tier1.png';
        this.assets.ports.roseleaf_traders_tier2 = new Image();
        this.assets.ports.roseleaf_traders_tier2.src = 'assets/ports/roseleaf_traders_port_tier2.png';
        this.assets.ports.roseleaf_traders_tier3 = new Image();
        this.assets.ports.roseleaf_traders_tier3.src = 'assets/ports/roseleaf_traders_port_tier3.png';
        
        // Artifact Traders
        this.assets.ports.artifact_traders_tier1 = new Image();
        this.assets.ports.artifact_traders_tier1.src = 'assets/ports/artifact_traders_port_tier1.png';
        this.assets.ports.artifact_traders_tier2 = new Image();
        this.assets.ports.artifact_traders_tier2.src = 'assets/ports/artifact_traders_port_tier2.png';
        this.assets.ports.artifact_traders_tier3 = new Image();
        this.assets.ports.artifact_traders_tier3.src = 'assets/ports/artifact_traders_port_tier3.png';
        
        // Slithereen Guard
        this.assets.ports.slithereen_guard_tier1 = new Image();
        this.assets.ports.slithereen_guard_tier1.src = 'assets/ports/slithereen_guard_port_tier1.png';
        this.assets.ports.slithereen_guard_tier2 = new Image();
        this.assets.ports.slithereen_guard_tier2.src = 'assets/ports/slithereen_guard_port_tier2.png';
        this.assets.ports.slithereen_guard_tier3 = new Image();
        this.assets.ports.slithereen_guard_tier3.src = 'assets/ports/slithereen_guard_port_tier3.png';
        
        // Revtel
        this.assets.ports.revtel_tier1 = new Image();
        this.assets.ports.revtel_tier1.src = 'assets/ports/revtel_port_tier1.png';
        this.assets.ports.revtel_tier2 = new Image();
        this.assets.ports.revtel_tier2.src = 'assets/ports/revtel_port_tier2.png';
        this.assets.ports.revtel_tier3 = new Image();
        this.assets.ports.revtel_tier3.src = 'assets/ports/revtel_port_tier3.png';
        
        // Free Captains
        this.assets.ports.free_captains_tier1 = new Image();
        this.assets.ports.free_captains_tier1.src = 'assets/ports/free_captains_port_tier1.png';
        this.assets.ports.free_captains_tier2 = new Image();
        this.assets.ports.free_captains_tier2.src = 'assets/ports/free_captains_port_tier2.png';
        this.assets.ports.free_captains_tier3 = new Image();
        this.assets.ports.free_captains_tier3.src = 'assets/ports/free_captains_port_tier3.png';
        
        // Oglodi Raiders
        this.assets.ports.oglodi_raiders_tier1 = new Image();
        this.assets.ports.oglodi_raiders_tier1.src = 'assets/ports/oglodi_raiders_port_tier1.png';
        this.assets.ports.oglodi_raiders_tier2 = new Image();
        this.assets.ports.oglodi_raiders_tier2.src = 'assets/ports/oglodi_raiders_port_tier2.png';
        this.assets.ports.oglodi_raiders_tier3 = new Image();
        this.assets.ports.oglodi_raiders_tier3.src = 'assets/ports/oglodi_raiders_port_tier3.png';
        
        // Wait for assets to load
        const logoPromise = new Promise((resolve) => {
            this.assets.logo.onload = () => {
                console.log('Logo loaded successfully');
                resolve();
            };
            this.assets.logo.onerror = () => {
                console.warn('Logo failed to load, using text fallback');
                resolve(); // Don't reject, just use fallback
            };
        });

        const mapPromise = new Promise((resolve, reject) => {
            this.assets.map.onload = () => {
                console.log('Map loaded successfully');
                resolve();
            };
            this.assets.map.onerror = () => {
                reject(new Error('Failed to load world map!'));
            };
        });

        const parchmentPromise = new Promise((resolve) => {
            this.assets.parchmentBg.onload = () => {
                console.log('Parchment background loaded successfully');
                resolve();
            };
            this.assets.parchmentBg.onerror = () => {
                console.warn('Parchment background failed to load');
                resolve(); // Don't reject, just skip background
            };
        });

        const boatPromise = new Promise((resolve, reject) => {
            this.assets.smallBoat.onload = () => {
                console.log('Small boat sprite loaded successfully');
                resolve();
            };
            this.assets.smallBoat.onerror = () => {
                reject(new Error('Failed to load small boat sprite!'));
            };
        });

        const markerPromise = new Promise((resolve, reject) => {
            this.assets.greenXMarker.onload = () => {
                console.log('Green X marker loaded successfully');
                resolve();
            };
            this.assets.greenXMarker.onerror = () => {
                reject(new Error('Failed to load green X marker!'));
            };
        });

        const sunMoonPromise = new Promise((resolve) => {
            this.assets.sunMoonCircle.onload = () => {
                console.log('Sun/moon circle loaded successfully');
                resolve();
            };
            this.assets.sunMoonCircle.onerror = () => {
                console.warn('Sun/moon circle failed to load');
                resolve(); // Don't reject, just skip
            };
        });

        // Load all captain portraits
        const captainPromises = Object.values(this.assets.captains).map((captainImg, index) => {
            return new Promise((resolve) => {
                captainImg.onload = () => {
                    console.log(`Captain portrait ${index + 1} loaded successfully`);
                    resolve();
                };
                captainImg.onerror = () => {
                    console.warn(`Captain portrait ${index + 1} failed to load`);
                    resolve(); // Don't reject, just warn
                };
            });
        });

        // Load all port images
        const portPromises = Object.values(this.assets.ports).map((portImg, index) => {
            return new Promise((resolve, reject) => {
                portImg.onload = () => {
                    console.log(`Port image ${index + 1} loaded successfully`);
                    resolve();
                };
                portImg.onerror = () => {
                    reject(new Error(`Failed to load port image ${index + 1}!`));
                };
            });
        });

        // Load faction settlement backgrounds (for port screens)
        this.portBackgrounds = {};
        
        const factions = [
            'Artifact Traders',
            'Claddish Navy',
            'Free Captains',
            'Keen Folk Engineers',
            'Oglodi Raiders',
            'Revtel',
            'Roseleaf Traders',
            'Slithereen Guard',
            'Stonehall Merchants'
        ];
        
        const portBgPromises = factions.map(faction => {
            const img = new Image();
            const key = faction.toLowerCase().replace(/\s+/g, '_');
            img.src = `assets/ports/backgrounds/${key}_settlement.png`;
            this.portBackgrounds[faction] = img;
            
            return new Promise((resolve) => {
                img.onload = () => {
                    console.log(`Port background loaded: ${faction}`);
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Port background failed to load: ${faction}`);
                    resolve(); // Don't reject, just warn
                };
            });
        });
        
        // Load location backgrounds (for sub-screens)
        this.locationBackgrounds = {};
        
        const locations = [
            'location_marketplace',
            'location_shipyard',
            'location_tavern',
            'location_town_square',
            'location_construction'
        ];
        
        const locationBgPromises = locations.map(location => {
            const img = new Image();
            img.src = `assets/ports/backgrounds/${location}.png`;
            this.locationBackgrounds[location] = img;
            
            return new Promise((resolve) => {
                img.onload = () => {
                    console.log(`Location background loaded: ${location}`);
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Location background failed to load: ${location}`);
                    resolve(); // Don't reject, just warn
                };
            });
        });

        // Load all goods icons
        const goodsPromises = Object.values(this.assets.goods).map((goodImg, index) => {
            return new Promise((resolve) => {
                goodImg.onload = () => {
                    resolve();
                };
                goodImg.onerror = () => {
                    console.warn(`Goods icon ${index + 1} failed to load`);
                    resolve(); // Don't reject, just warn
                };
            });
        });

        await Promise.all([
            logoPromise, 
            mapPromise, 
            parchmentPromise, 
            boatPromise, 
            markerPromise, 
            sunMoonPromise, 
            ...captainPromises,
            ...portPromises,
            ...portBgPromises,
            ...locationBgPromises,
            ...goodsPromises
        ]);
    },

    // Draw background (for menu screens)
    drawBackground() {
        // Simple gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0e1a');
        gradient.addColorStop(0.5, '#1a2332');
        gradient.addColorStop(1, '#0a0e1a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Add some decorative elements
        this.drawStars();
    },

    drawStars() {
        const ctx = this.ctx;
        ctx.save();
        
        // Draw simple stars as background decoration
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        
        // Deterministic random for consistent star positions
        const seed = 12345;
        let random = seed;
        const pseudoRandom = () => {
            random = (random * 9301 + 49297) % 233280;
            return random / 233280;
        };

        for (let i = 0; i < 100; i++) {
            const x = pseudoRandom() * this.width;
            const y = pseudoRandom() * this.height;
            const size = pseudoRandom() * 2;
            ctx.fillRect(x, y, size, size);
        }

        ctx.restore();
    },

    // Main menu rendering
    renderMainMenu() {
        this.clear();
        this.drawBackground();
        this.drawLogo(this.width / 2, this.height / 3);
    },

    // AIDEV-NOTE: Draw tiled parchment background
    // Tiles across entire screen, doesn't zoom with map
    drawParchmentBackground() {
        if (!this.assets.parchmentBg || !this.assets.parchmentBg.complete) {
            return; // Skip if not loaded
        }

        const ctx = this.ctx;
        const parchment = this.assets.parchmentBg;
        const tileWidth = parchment.width;
        const tileHeight = parchment.height;

        // Calculate how many tiles we need to cover screen
        const tilesX = Math.ceil(this.width / tileWidth) + 1;
        const tilesY = Math.ceil(this.height / tileHeight) + 1;

        // Draw tiles
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                ctx.drawImage(
                    parchment,
                    x * tileWidth,
                    y * tileHeight,
                    tileWidth,
                    tileHeight
                );
            }
        }
    },

    // AIDEV-NOTE: Draw boat trail (wake)
    // Draws a fading dashed line showing path over last 5 seconds
    drawBoatTrail(trail, ctx) {
        if (!trail || trail.length < 2) return;
        
        // Calculate total trail length to check if worth drawing
        let totalLength = 0;
        for (let i = 1; i < trail.length; i++) {
            const dx = trail[i].x - trail[i-1].x;
            const dy = trail[i].y - trail[i-1].y;
            totalLength += Math.sqrt(dx * dx + dy * dy);
        }
        
        // Don't draw if trail is too short
        if (totalLength < 5) return;
        
        ctx.save();
        
        const currentTime = performance.now() / 1000;
        const TRAIL_DURATION = 5.0; // Match game constant
        
        // Draw dashed line
        ctx.strokeStyle = 'rgba(240, 240, 255, 0.4)'; // Near white, mostly transparent
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([5, 5]); // Dashed pattern
        
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        
        for (let i = 1; i < trail.length; i++) {
            // Calculate fade based on age
            const age = currentTime - trail[i].time;
            const fadeProgress = age / TRAIL_DURATION;
            const alpha = 0.4 * (1 - fadeProgress); // Fade from 0.4 to 0
            
            ctx.strokeStyle = `rgba(240, 240, 255, ${alpha})`;
            ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
            
            // Start new path segment for next alpha
            ctx.beginPath();
            ctx.moveTo(trail[i].x, trail[i].y);
        }
        
        ctx.restore();
    },

    // AIDEV-NOTE: Draw player boat on canvas
    // Boat is drawn in world space (affected by camera transform)
    // Rotation is in radians (sprite has bow pointing UP, 0 = north)
    drawBoat(boat, ctx) {
        // Get ship image based on shipId
        const shipKey = this.getShipImageKey(boat.shipId);
        const shipImage = this.assets.ships[shipKey] || this.assets.smallBoat;
        
        if (!shipImage || !shipImage.complete) {
            return; // Boat sprite not loaded
        }

        ctx.save();

        // Translate to boat position
        ctx.translate(boat.x, boat.y);
        
        // Rotate to face movement direction
        ctx.rotate(boat.rotation);

        // Get tier-based size (tier 0 = smaller, tier 1+ = larger)
        const shipTier = this.getShipTier(boat.shipId);
        const baseSize = 21; // Base size in world pixels
        const tierScaleMap = {
            0: 0.85,  // Tier 0 starters are smaller (85%)
            1: 1.0,   // Tier 1 is base size
            2: 1.15,  // Tier 2 is larger (115%)
            3: 1.3    // Tier 3 is largest (130%)
        };
        const scale = tierScaleMap[shipTier] || 1.0;
        const boatSize = baseSize * scale;

        // Draw boat sprite centered on position
        ctx.drawImage(
            shipImage,
            -boatSize / 2,
            -boatSize / 2,
            boatSize,
            boatSize
        );

        ctx.restore();
    },
    
    // AIDEV-NOTE: Get ship image key from shipId
    // Converts ship IDs like "ship_neutral_barge" to image keys like "merchant_barge"
    getShipImageKey(shipId) {
        if (!shipId) return 'small_boat';
        
        // Map ship IDs to image keys
        const shipIdToImageKey = {
            'ship_neutral_barge': 'merchant_barge',
            'ship_claddish_cutter': 'patrol_cutter',
            'ship_artifact_skiff': 'mystic_skiff',
            'ship_stonehall_trader': 'granite_trader',
            'ship_slithereen_runner': 'tide_runner',
            'ship_revtel_skiff': 'coral_skiff',
            'ship_pirate_sloop': 'rogues_sloop',
            'ship_roseleaf_trader': 'willowbark_trader',
            'ship_oglodi_longboat': 'oglodi_longboat',
            'ship_keenfolk_barge': 'tinkers_barge'
        };
        
        return shipIdToImageKey[shipId] || 'small_boat';
    },
    
    // AIDEV-NOTE: Get ship tier for size scaling
    // All current ships are tier 0 (starters), returns 0 for all
    // Future: lookup shipyardLevelRequired from ShipData
    getShipTier(shipId) {
        // All starter ships are tier 0
        // Future: could look up from ShipData.find(s => s.id === shipId).shipyardLevelRequired - 1
        return 0;
    },

    // AIDEV-NOTE: Draw port
    // Port is drawn in world space (affected by camera transform)
    // AIDEV-NOTE: Get port image asset key from faction and tier
    // Maps faction name + tier to asset key for port images
    getPortImageKey(faction, tier) {
        // Convert faction name to snake_case
        const factionKey = faction.toLowerCase().replace(/\s+/g, '_');
        
        // Handle numeric tiers (1, 2, 3) or legacy tier names
        let tierNum = tier;
        if (typeof tier === 'string') {
            if (tier === 'City') tierNum = 2;
            else if (tier === 'Capital' || tier === 'Metropolis') tierNum = 3;
            else tierNum = 1; // Town or default
        }
        
        return `${factionKey}_tier${tierNum}`;
    },

    drawPort(port, ctx, editMode = false, isHovered = false, isDragged = false) {
        ctx.save();

        // Translate to port position
        ctx.translate(port.x, port.y);

        const portSize = port.size || 30;

        // Draw highlight ring if in edit mode (before flipping)
        if (editMode) {
            if (isDragged) {
                // Yellow ring for dragged port
                ctx.beginPath();
                ctx.arc(0, 0, portSize / 2 + 6, 0, Math.PI * 2);
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.stroke();
            } else if (isHovered) {
                // Cyan ring for hovered port
                ctx.beginPath();
                ctx.arc(0, 0, portSize / 2 + 4, 0, Math.PI * 2);
                ctx.strokeStyle = '#00FFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        } else if (isHovered) {
            // In normal gameplay mode, highlight hovered port
            // Draw faint glow/outline
            ctx.beginPath();
            ctx.arc(0, 0, portSize / 2 + 3, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 200, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Save context before flipping
        ctx.save();
        
        // Flip horizontally if port is marked as flipped (only affects image)
        if (port.flipped) {
            ctx.scale(-1, 1);
        }

        // Get port image based on faction and tier
        const imageKey = this.getPortImageKey(port.faction, port.tier);
        const portImage = this.assets.ports[imageKey];

        // Apply brightness increase for hovered ports (non-edit mode)
        if (isHovered && !editMode) {
            ctx.globalAlpha = 1.0;
            ctx.filter = 'brightness(1.3)';
        }

        if (portImage && portImage.complete) {
            // Draw port image centered on position
            const drawSize = portSize; // Scale based on port size
            ctx.drawImage(
                portImage,
                -drawSize / 2,
                -drawSize / 2,
                drawSize,
                drawSize
            );
        } else {
            // Fallback: draw colored circle if image not loaded
            console.warn(`Port image not found for ${port.faction} ${port.tier} (key: ${imageKey})`);
            
            // Get faction color for fallback
            let factionColor = '#888888';
            let accentColor = '#aaaaaa';
            
            if (port.faction === 'Claddish Navy') {
                factionColor = '#4169E1';
                accentColor = '#C0C0C0';
            } else if (port.faction === 'Artifact Traders') {
                factionColor = '#9370DB';
                accentColor = '#FFD700';
            } else if (port.faction === 'Stonehall Merchants') {
                factionColor = '#708090';
                accentColor = '#CD7F32';
            } else if (port.faction === 'Slithereen Guard') {
                factionColor = '#00008B';
                accentColor = '#2E8B57';
            } else if (port.faction === 'Revtel') {
                factionColor = '#FF7F50';
                accentColor = '#40E0D0';
            } else if (port.faction === 'Free Captains') {
                factionColor = '#000000';
                accentColor = '#DC143C';
            } else if (port.faction === 'Roseleaf Traders') {
                factionColor = '#228B22';
                accentColor = '#FFD700';
            } else if (port.faction === 'Oglodi Raiders') {
                factionColor = '#8B0000';
                accentColor = '#F5F5DC';
            }

            // Draw circle fallback
            ctx.beginPath();
            ctx.arc(0, 0, portSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = accentColor;
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, portSize / 2 - 3, 0, Math.PI * 2);
            ctx.fillStyle = factionColor;
            ctx.fill();
        }

        // Restore context (remove flip transform before drawing text)
        ctx.restore();
        
        // Reset filter if it was applied
        if (isHovered && !editMode) {
            ctx.filter = 'none';
        }

        // Draw port name (not affected by flip)
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(port.name, 0, portSize / 2 + 4);

        // Draw coordinates in edit mode (not affected by flip)
        if (editMode) {
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#000000';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.lineWidth = 2;
            
            // Show flipped indicator if port is flipped
            const coordText = port.flipped ? `(${port.x}, ${port.y}) ↔` : `(${port.x}, ${port.y})`;
            ctx.strokeText(coordText, 0, -portSize / 2 - 4);
            ctx.fillText(coordText, 0, -portSize / 2 - 4);
        }

        ctx.restore();
    },

    // AIDEV-NOTE: Draw port entry position (green X) in edit mode
    drawPortEntryPosition(port, ctx) {
        if (!port.entryX || !port.entryY) return;
        
        ctx.save();
        
        // Draw line from entry position to port
        ctx.beginPath();
        ctx.moveTo(port.entryX, port.entryY);
        ctx.lineTo(port.x, port.y);
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2 / ctx.getTransform().a; // Adjust for zoom
        ctx.setLineDash([5, 5]); // Dashed line
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash
        
        // Draw green X at entry position
        ctx.translate(port.entryX, port.entryY);
        
        const xSize = 10 / ctx.getTransform().a; // Scale with zoom
        const lineWidth = 3 / ctx.getTransform().a;
        
        // Draw green X
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = lineWidth;
        
        ctx.beginPath();
        ctx.moveTo(-xSize, -xSize);
        ctx.lineTo(xSize, xSize);
        ctx.moveTo(xSize, -xSize);
        ctx.lineTo(-xSize, xSize);
        ctx.stroke();
        
        // Draw circle background for better visibility
        ctx.beginPath();
        ctx.arc(0, 0, xSize * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = lineWidth * 0.5;
        ctx.stroke();
        
        ctx.restore();
    },

    // AIDEV-NOTE: Draw target marker (green X)
    // Marker is drawn in world space at the target position
    drawTargetMarker(marker, ctx) {
        if (!this.assets.greenXMarker || !this.assets.greenXMarker.complete) {
            return; // Marker not loaded
        }

        ctx.save();

        // Translate to marker position
        ctx.translate(marker.x, marker.y);

        // Draw marker centered on position
        const markerSize = 32; // Size in world pixels
        ctx.drawImage(
            this.assets.greenXMarker,
            -markerSize / 2,
            -markerSize / 2,
            markerSize,
            markerSize
        );

        ctx.restore();
    },

    // AIDEV-NOTE: Draw captain portrait and cabin slots
    // Shows in top-left corner of screen, not affected by camera
    drawCaptainAndCabins(captain, cabinCount) {
        if (!captain) return;
        
        const ctx = this.ctx;
        ctx.save();
        
        // Position in top-left corner
        const padding = 20;
        const portraitSize = 100;
        const cabinSize = 60;
        const spacing = 10;
        
        const startX = padding;
        const startY = padding;
        
        // Draw captain portrait frame
        ctx.save();
        
        // Frame background
        ctx.fillStyle = 'rgba(139, 90, 43, 0.9)'; // Brown wood
        ctx.strokeStyle = '#5C3317'; // Dark brown outline
        ctx.lineWidth = 3;
        ctx.fillRect(startX - 5, startY - 5, portraitSize + 10, portraitSize + 10);
        ctx.strokeRect(startX - 5, startY - 5, portraitSize + 10, portraitSize + 10);
        
        // Get captain portrait image
        const captainImg = this.assets.captains?.[captain.id];
        if (captainImg && captainImg.complete) {
            // Clip to square
            ctx.save();
            ctx.beginPath();
            ctx.rect(startX, startY, portraitSize, portraitSize);
            ctx.clip();
            
            // Draw captain portrait
            ctx.drawImage(
                captainImg,
                startX,
                startY,
                portraitSize,
                portraitSize
            );
            
            ctx.restore();
        } else {
            // Fallback: draw placeholder
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(startX, startY, portraitSize, portraitSize);
            
            ctx.fillStyle = '#f0e6d2';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Captain', startX + portraitSize / 2, startY + portraitSize / 2);
        }
        
        ctx.restore();
        
        // Draw cabin slots to the right of captain
        for (let i = 0; i < cabinCount; i++) {
            const cabinX = startX + portraitSize + spacing + (i * (cabinSize + spacing));
            const cabinY = startY + (portraitSize - cabinSize) / 2; // Center vertically with portrait
            
            // Cabin frame background
            ctx.fillStyle = 'rgba(90, 75, 60, 0.8)'; // Darker brown
            ctx.strokeStyle = '#3E2A1C'; // Very dark brown
            ctx.lineWidth = 2;
            ctx.fillRect(cabinX - 3, cabinY - 3, cabinSize + 6, cabinSize + 6);
            ctx.strokeRect(cabinX - 3, cabinY - 3, cabinSize + 6, cabinSize + 6);
            
            // Empty cabin slot
            ctx.fillStyle = 'rgba(50, 50, 50, 0.6)'; // Dark gray for empty
            ctx.fillRect(cabinX, cabinY, cabinSize, cabinSize);
            
            // "Empty" text
            ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Empty', cabinX + cabinSize / 2, cabinY + cabinSize / 2);
        }
        
        ctx.restore();
    },

    // AIDEV-NOTE: Draw ship stats panel below captain
    // Shows speed, cargo, durability, status effects
    drawShipStats(playerBoat) {
        if (!playerBoat) return;
        
        const ctx = this.ctx;
        ctx.save();
        
        // Position below captain/cabin area
        const padding = 20;
        const portraitSize = 100;
        const panelY = padding + portraitSize + 20; // Below captain
        const panelX = padding;
        const panelWidth = 320;
        const panelHeight = 160; // Increased for Free Cabins line
        
        // Panel background
        ctx.fillStyle = 'rgba(60, 50, 40, 0.85)'; // Dark brown
        ctx.strokeStyle = '#3E2A1C'; // Very dark brown
        ctx.lineWidth = 3;
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Title
        ctx.fillStyle = '#f0e6d2';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(playerBoat.shipName || 'Ship', panelX + 10, panelY + 8);
        
        // Stats area
        const statsY = panelY + 30;
        ctx.font = '13px Arial';
        
        // Speed
        ctx.fillText(`Speed: ${(playerBoat.speed * 10).toFixed(0)} px/s`, panelX + 10, statsY);
        
        // Cargo
        const cargoUsed = Object.values(playerBoat.cargo || {}).reduce((sum, qty) => sum + qty, 0);
        ctx.fillText(`Cargo: ${cargoUsed} / ${playerBoat.cargoCapacity}`, panelX + 10, statsY + 20);
        
        // Free Cabins
        const crewCount = (playerBoat.crew || []).length;
        const freeCabins = playerBoat.crewCapacity - crewCount;
        ctx.fillText(`Free Cabins: ${freeCabins} / ${playerBoat.crewCapacity}`, panelX + 10, statsY + 40);
        
        // Durability
        ctx.fillText(`Durability: ${playerBoat.durability} / ${playerBoat.maxDurability}`, panelX + 10, statsY + 60);
        
        // Status Effects
        ctx.fillText('Status:', panelX + 10, statsY + 80);
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.fillText('NONE', panelX + 70, statsY + 80);
        
        ctx.restore();
        
        // Return panel bounds for button placement
        return {
            x: panelX,
            y: panelY,
            width: panelWidth,
            height: panelHeight
        };
    },

    // AIDEV-NOTE: Draw player stats panel below ship stats
    // Shows gold and other player resources
    drawPlayerStats(player) {
        if (!player) return;
        
        const ctx = this.ctx;
        ctx.save();
        
        // Position below ship stats panel
        const padding = 20;
        const portraitSize = 100;
        const shipPanelY = padding + portraitSize + 20;
        const shipPanelHeight = 160; // Updated to match new ship panel height
        const panelY = shipPanelY + shipPanelHeight + 10; // Below ship panel with gap
        const panelX = padding;
        const panelWidth = 320;
        const panelHeight = 80;
        
        // Panel background
        ctx.fillStyle = 'rgba(60, 50, 40, 0.85)'; // Dark brown
        ctx.strokeStyle = '#3E2A1C'; // Very dark brown
        ctx.lineWidth = 3;
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Title
        ctx.fillStyle = '#f0e6d2';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Player Resources', panelX + 10, panelY + 8);
        
        // Gold
        const statsY = panelY + 35;
        ctx.font = '16px Arial';
        ctx.fillText(`💰 Gold: ${player.gold}`, panelX + 10, statsY);
        
        ctx.restore();
        
        // Return panel bounds for button placement
        return {
            x: panelX,
            y: panelY,
            width: panelWidth,
            height: panelHeight
        };
    },

    // AIDEV-NOTE: Draw production icons above port
    // Shows when Shift key is held
    // Icons have tier-colored borders based on good tier: tier 1-2 = bronze, tier 3-4 = silver, tier 5-6 = gold
    // Displays in two rows
    drawPortProductionIcons(port, ctx) {
        if (!port.buildings || port.buildings.length === 0) return;
        
        // Get unique goods produced by this port
        const producedGoods = [];
        const seenGoods = new Set();
        for (const building of port.buildings) {
            if (!seenGoods.has(building.goodId)) {
                producedGoods.push(building.goodId);
                seenGoods.add(building.goodId);
            }
        }
        
        if (producedGoods.length === 0) return;
        
        ctx.save();
        ctx.translate(port.x, port.y);
        
        // Icon settings (50% smaller = 10x10)
        const iconSize = 10;
        const iconSpacing = 3;
        const borderWidth = 1.5;
        const rowSpacing = 3;
        
        // Calculate layout for two rows
        const iconsPerRow = Math.ceil(producedGoods.length / 2);
        const rowWidth = iconsPerRow * (iconSize + iconSpacing) - iconSpacing;
        const startX = -rowWidth / 2;
        const baseYOffset = -(port.size / 2) - (iconSize * 2 + rowSpacing) - 8; // Above the port
        
        // Draw each goods icon
        for (let i = 0; i < producedGoods.length; i++) {
            const goodId = producedGoods[i];
            
            // Determine row and column
            const row = Math.floor(i / iconsPerRow);
            const col = i % iconsPerRow;
            
            const x = startX + col * (iconSize + iconSpacing);
            const y = baseYOffset + row * (iconSize + rowSpacing);
            
            // Get good tier from GoodsData (access global from economy.js)
            let goodTier = 1;
            if (typeof GoodsData !== 'undefined' && GoodsData[goodId]) {
                goodTier = GoodsData[goodId].tier;
            }
            
            // Determine border color based on good tier
            let borderColor;
            if (goodTier <= 2) {
                borderColor = '#8B5A2B'; // Dark brownish bronze
            } else if (goodTier <= 4) {
                borderColor = '#C0C0C0'; // Silver
            } else {
                borderColor = '#FFD700'; // Gold
            }
            
            // Convert good name to asset key (e.g., "Iron Ore" -> "iron_ore")
            const goodKey = goodId.toLowerCase().replace(/\s+/g, '_');
            const goodImg = this.assets.goods[goodKey];
            
            // Draw border
            ctx.fillStyle = borderColor;
            ctx.fillRect(x - borderWidth, y - borderWidth, iconSize + borderWidth * 2, iconSize + borderWidth * 2);
            
            // Draw background
            ctx.fillStyle = '#2c2416'; // Dark brown background
            ctx.fillRect(x, y, iconSize, iconSize);
            
            // Draw good icon if loaded
            if (goodImg && goodImg.complete) {
                ctx.drawImage(goodImg, x, y, iconSize, iconSize);
            } else {
                // Fallback: draw placeholder
                ctx.fillStyle = '#666';
                ctx.fillRect(x + 1, y + 1, iconSize - 2, iconSize - 2);
            }
        }
        
        ctx.restore();
    },

    // AIDEV-NOTE: Draw time display (sun/moon dial with week/day text)
    // Shows in top-right corner of screen, not affected by camera
    drawTimeDisplay(gameTime) {
        if (!gameTime) return;
        
        const ctx = this.ctx;
        ctx.save();
        
        // Position in top-right corner
        const displaySize = 80;
        const padding = 20;
        const centerX = this.width - padding - displaySize / 2;
        const centerY = padding + displaySize / 2;
        
        // Draw sun/moon circle background
        if (this.assets.sunMoonCircle && this.assets.sunMoonCircle.complete) {
            ctx.drawImage(
                this.assets.sunMoonCircle,
                centerX - displaySize / 2,
                centerY - displaySize / 2,
                displaySize,
                displaySize
            );
        } else {
            // Fallback: draw simple circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, displaySize / 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Draw rotating dial pointer (simple canvas drawing)
        ctx.save();
        ctx.translate(centerX, centerY);
        // Rotate based on time of day (0.0 = top/midnight, 0.5 = bottom/noon)
        const rotation = gameTime.timeOfDay * Math.PI * 2 - Math.PI / 2; // -90 deg offset so 0 is at top
        ctx.rotate(rotation);
        
        // Draw a simple wooden pointer
        const pointerLength = displaySize / 2 - 8;
        const pointerWidth = 6;
        
        // Pointer shaft
        ctx.fillStyle = '#8B5A2B'; // Brown wood color
        ctx.strokeStyle = '#5C3317'; // Dark brown outline
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.moveTo(-pointerWidth / 2, 5); // Start slightly below center
        ctx.lineTo(-pointerWidth / 2, -pointerLength + 10); // Left side
        ctx.lineTo(0, -pointerLength); // Point at top
        ctx.lineTo(pointerWidth / 2, -pointerLength + 10); // Right side
        ctx.lineTo(pointerWidth / 2, 5); // Back to start
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Golden tip for visibility
        ctx.fillStyle = '#DAA520'; // Goldenrod
        ctx.beginPath();
        ctx.moveTo(-pointerWidth / 2, -pointerLength + 10);
        ctx.lineTo(0, -pointerLength);
        ctx.lineTo(pointerWidth / 2, -pointerLength + 10);
        ctx.closePath();
        ctx.fill();
        
        // Center dot to anchor the pointer
        ctx.fillStyle = '#8B5A2B';
        ctx.strokeStyle = '#5C3317';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
        
        // Draw week and day text below the circle
        const textY = centerY + displaySize / 2 + 15;
        
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Shadow for readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = '#f0e6d2'; // Parchment color
        ctx.fillText(`Week ${gameTime.week}, Day ${gameTime.day}`, centerX, textY);
        
        ctx.restore();
    },

    // AIDEV-NOTE: Render game world with map
    // Uses camera position and zoom for pan/zoom control
    renderGameWorld(cameraX = 0, cameraY = 0, cameraZoom = 1, debug = {}, playerBoat = null, targetMarker = null, ports = [], gameTime = null, hoveredPort = null, draggedPort = null, captain = null, player = null, shiftPressed = false, waypointPath = null, waypointPathIndex = 0, finalDestination = null) {
        this.clear('#1a4d6d'); // Ocean color

        // Draw parchment background (at screen coordinates, no zoom)
        this.drawParchmentBackground();

        if (!this.assets.map || !this.assets.map.complete) {
            // Map not loaded yet
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading map...', this.width / 2, this.height / 2);
            return;
        }

        const ctx = this.ctx;
        ctx.save();

        const mapWidth = this.assets.map.width;
        const mapHeight = this.assets.map.height;
        
        // Apply camera transform
        // Center view on screen, then apply zoom and pan
        ctx.translate(this.width / 2, this.height / 2);
        ctx.scale(cameraZoom, cameraZoom);
        ctx.translate(-cameraX, -cameraY);

        // Draw map centered at origin
        ctx.drawImage(
            this.assets.map,
            -mapWidth / 2,
            -mapHeight / 2,
            mapWidth,
            mapHeight
        );

        // Draw ports (in world space, before markers and boats)
        if (ports && ports.length > 0) {
            ports.forEach(port => {
                const isHovered = hoveredPort && port.id === hoveredPort.id;
                const isDragged = draggedPort && port.id === draggedPort.id;
                this.drawPort(port, ctx, debug.portEditMode, isHovered, isDragged);
                
                // Draw entry position in edit mode
                if (debug.portEditMode) {
                    this.drawPortEntryPosition(port, ctx);
                }
                
                // Draw production icons if Shift is pressed (only in normal play mode)
                if (shiftPressed && !debug.portEditMode) {
                    this.drawPortProductionIcons(port, ctx);
                }
            });
        }

        // Draw target marker (in world space, before boat so boat is on top)
        if (targetMarker) {
            this.drawTargetMarker(targetMarker, ctx);
        }

        // Draw boat trail (in world space, before boat)
        if (playerBoat && playerBoat.trail) {
            this.drawBoatTrail(playerBoat.trail, ctx);
        }

        // Draw player boat (in world space, affected by camera)
        if (playerBoat) {
            this.drawBoat(playerBoat, ctx);
        }

        // Draw debug visualizations (in map space, affected by camera)
        if (debug.showCoastlines || debug.showBounds || debug.showIslandIds) {
            this.drawDebugCollision(ctx, mapWidth, mapHeight, debug);
        }

        // Draw waypoints (in map space, affected by camera)
        if (debug.showWaypoints) {
            this.drawWaypoints(ctx);
        }

        // Draw active path (in map space, affected by camera)
        if (debug.showActivePath && playerBoat && waypointPath && finalDestination) {
            this.drawActivePath(ctx, playerBoat, waypointPath, waypointPathIndex, finalDestination, targetMarker);
        }

        ctx.restore();

        // Draw captain and cabin slots (in screen space, not affected by camera)
        if (captain && playerBoat) {
            this.drawCaptainAndCabins(captain, playerBoat.crewCapacity);
            this.drawShipStats(playerBoat);
        }
        
        // Draw player stats (in screen space, not affected by camera)
        if (player) {
            this.drawPlayerStats(player);
        }

        // Draw time display (in screen space, not affected by camera)
        this.drawTimeDisplay(gameTime);

        // Draw debug info (in screen space, not affected by camera)
        if (debug.showDebugInfo) {
            this.drawDebugInfo(mapWidth, mapHeight, cameraX, cameraY, cameraZoom);
        }
    },

    // AIDEV-NOTE: Draw collision debug visualization
    drawDebugCollision(ctx, mapWidth, mapHeight, debug) {
        if (!Collision.loaded) return;

        ctx.save();

        for (const island of Collision.data.islands) {
            // Draw bounding box
            if (debug.showBounds) {
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                ctx.lineWidth = 2 / ctx.getTransform().a; // Adjust for zoom
                ctx.strokeRect(
                    island.bounds.minX,
                    island.bounds.minY,
                    island.bounds.maxX - island.bounds.minX,
                    island.bounds.maxY - island.bounds.minY
                );
            }

            // Draw coastline polygon
            if (debug.showCoastlines && island.polygon.length > 0) {
                ctx.beginPath();
                const firstPoint = island.polygon[0];
                ctx.moveTo(
                    firstPoint[0],
                    firstPoint[1]
                );
                
                for (let i = 1; i < island.polygon.length; i++) {
                    const point = island.polygon[i];
                    ctx.lineTo(
                        point[0],
                        point[1]
                    );
                }
                ctx.closePath();
                
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
                ctx.lineWidth = 2 / ctx.getTransform().a; // Adjust for zoom
                ctx.stroke();
            }

            // Draw island ID
            if (debug.showIslandIds) {
                const centerX = (island.bounds.minX + island.bounds.maxX) / 2;
                const centerY = (island.bounds.minY + island.bounds.maxY) / 2;
                
                ctx.save();
                
                // Get current transform to convert map space to screen space
                const transform = ctx.getTransform();
                const screenX = transform.a * centerX + transform.c * centerY + transform.e;
                const screenY = transform.b * centerX + transform.d * centerY + transform.f;
                
                // Reset transform for text rendering (so text is not scaled/rotated)
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                
                ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.lineWidth = 3;
                
                const text = `#${island.id}`;
                ctx.strokeText(text, screenX, screenY);
                ctx.fillText(text, screenX, screenY);
                
                ctx.restore();
            }
        }

        ctx.restore();
    },

    // AIDEV-NOTE: Draw waypoint navigation graph for debugging
    drawWaypoints(ctx) {
        const waypoints = Collision.getAllWaypoints();
        if (!waypoints || waypoints.length === 0) return;

        ctx.save();

        const zoom = ctx.getTransform().a; // Get current zoom level

        // Draw connections first (so they appear behind waypoints)
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.lineWidth = 1 / zoom; // Adjust for zoom

        for (const wp of waypoints) {
            for (const connId of wp.connections) {
                // Only draw each connection once (from lower ID to higher ID)
                if (connId > wp.id) {
                    const connWp = Collision.getWaypoint(connId);
                    if (connWp) {
                        ctx.beginPath();
                        ctx.moveTo(wp.x, wp.y);
                        ctx.lineTo(connWp.x, connWp.y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Draw waypoints as circles
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        const radius = 4 / zoom; // Adjust for zoom

        for (const wp of waypoints) {
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },

    // AIDEV-NOTE: Draw active pathfinding route
    // Shows original path in dim line, current segment in bright yellow
    drawActivePath(ctx, playerBoat, waypointPath, waypointPathIndex, finalDestination, targetMarker) {
        if (!waypointPath || !finalDestination) return;

        const currentIndex = waypointPathIndex || 0;
        const finalDest = finalDestination;

        ctx.save();

        const zoom = ctx.getTransform().a; // Get current zoom level

        // Draw the full planned path in dim dashed gray (for reference)
        ctx.strokeStyle = 'rgba(180, 180, 180, 0.3)';
        ctx.lineWidth = 1 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]); // Dashed line

        ctx.beginPath();
        ctx.moveTo(playerBoat.x, playerBoat.y);

        for (let i = currentIndex; i < waypointPath.length; i++) {
            const wp = Collision.getWaypoint(waypointPath[i]);
            if (wp) {
                ctx.lineTo(wp.x, wp.y);
            }
        }

        // Line to final destination
        ctx.lineTo(finalDest.x, finalDest.y);
        ctx.stroke();

        // Draw current segment (boat to current target) in bright yellow
        if (targetMarker) {
            ctx.setLineDash([]); // Solid line
            ctx.strokeStyle = 'rgba(255, 220, 0, 0.9)';
            ctx.lineWidth = 3 / zoom;

            ctx.beginPath();
            ctx.moveTo(playerBoat.x, playerBoat.y);
            ctx.lineTo(targetMarker.x, targetMarker.y);
            ctx.stroke();

            // Draw small circle at current target
            ctx.fillStyle = 'rgba(255, 220, 0, 0.9)';
            ctx.beginPath();
            ctx.arc(targetMarker.x, targetMarker.y, 6 / zoom, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw remaining waypoints as small orange dots
        ctx.fillStyle = 'rgba(255, 150, 0, 0.6)';
        for (let i = currentIndex; i < waypointPath.length; i++) {
            const wp = Collision.getWaypoint(waypointPath[i]);
            if (wp) {
                ctx.beginPath();
                ctx.arc(wp.x, wp.y, 4 / zoom, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw final destination as large bright yellow circle
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
        ctx.strokeStyle = 'rgba(255, 150, 0, 1.0)';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        ctx.arc(finalDest.x, finalDest.y, 8 / zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw corridor check debug points (if any)
        if (typeof Pathfinding !== 'undefined' && Pathfinding.debugCorridorPoints) {
            for (const point of Pathfinding.debugCorridorPoints) {
                ctx.fillStyle = point.isLand ? 'rgba(255, 0, 0, 0.6)' : 'rgba(0, 255, 0, 0.4)';
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3 / zoom, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    },

    // Draw debug info overlay
    drawDebugInfo(mapWidth, mapHeight, cameraX, cameraY, cameraZoom) {
        const ctx = this.ctx;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.lineWidth = 3;
        
        const info = [
            `Map: ${mapWidth}x${mapHeight}`,
            `Zoom: ${(cameraZoom * 100).toFixed(1)}%`,
            `Position: ${Math.round(cameraX)}, ${Math.round(cameraY)}`,
            `Controls: WASD = Pan, Mouse Wheel = Zoom`
        ];

        if (Collision.loaded) {
            info.push(`Islands: ${Collision.data.islands.length}`);
        }

        for (let i = 0; i < info.length; i++) {
            const y = 20 + i * 20;
            ctx.strokeText(info[i], 10, y);
            ctx.fillText(info[i], 10, y);
        }
    }
};

