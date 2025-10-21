// BOTA - Port Data
// All port information for the game world

// AIDEV-NOTE: Port data structure
// Each port contains:
// - id: Unique identifier
// - name: Display name
// - faction: Claddish Navy, Artifact Traders, Stonehall Merchants, Revtel, Free Captains, Slithereen Guard, etc.
// - x, y: World coordinates (centered, where 0,0 is map center, range approximately -512 to +512)
// - size: Visual size in pixels for rendering (based on tier: tier1=30, tier2=40, tier3=50)
// - tier: Port tier (1, 2, or 3)
// - entryX, entryY: Entry position for boats (for pathfinding to inland ports)

const PortData = [
    // ARTIFACT TRADERS (4 ports)
    { id: "port_artifact_01", name: "Mystic Sanctum", faction: "Artifact Traders", x: 338, y: -132, tier: 3, size: 50, entryX: 319, entryY: -112 },
    { id: "port_artifact_02", name: "Arcane Crossroads", faction: "Artifact Traders", x: 87, y: -8, tier: 2, size: 40, flipped: true, entryX: 100, entryY: 5 },
    { id: "port_artifact_03", name: "Ancient Trading Post", faction: "Artifact Traders", x: -209, y: 95, tier: 1, size: 30, flipped: true, entryX: -195, entryY: 100 },
    { id: "port_artifact_04", name: "Enchanted Outpost", faction: "Artifact Traders", x: 180, y: 156, tier: 1, size: 30, entryX: 166, entryY: 161 },

    // CLADDISH NAVY (6 ports)
    { id: "port_claddish_01", name: "Admiralty Harbor", faction: "Claddish Navy", x: -80, y: 104, tier: 3, size: 50, entryX: -98, entryY: 114 },
    { id: "port_claddish_02", name: "Naval Command", faction: "Claddish Navy", x: 103, y: 102, tier: 2, size: 40, entryX: 103, entryY: 102 },
    { id: "port_claddish_03", name: "West Naval Base", faction: "Claddish Navy", x: -3, y: -167, tier: 2, size: 40, entryX: -18, entryY: -156 },
    { id: "port_claddish_04", name: "Southern Patrol", faction: "Claddish Navy", x: -204, y: -9, tier: 1, size: 30, entryX: -217, entryY: 1 },
    { id: "port_claddish_05", name: "Western Watch", faction: "Claddish Navy", x: -446, y: -66, tier: 1, size: 30, entryX: -457, entryY: -57 },
    { id: "port_claddish_06", name: "Central Watchtower", faction: "Claddish Navy", x: 72, y: 214, tier: 1, size: 30, entryX: 61, entryY: 222 },

    // FREE CAPTAINS (5 ports)
    { id: "port_freecaptains_01", name: "Rogue's Haven", faction: "Free Captains", x: -299, y: 271, tier: 3, size: 50, flipped: true, entryX: -276, entryY: 280 },
    { id: "port_freecaptains_02", name: "Smuggler's Cove", faction: "Free Captains", x: -207, y: 368, tier: 2, size: 40, entryX: -220, entryY: 381 },
    { id: "port_freecaptains_03", name: "Blackwater Bay", faction: "Free Captains", x: -424, y: 245, tier: 2, size: 40, entryX: -437, entryY: 259 },
    { id: "port_freecaptains_04", name: "Hidden Cove", faction: "Free Captains", x: -419, y: 113, tier: 1, size: 30, entryX: -430, entryY: 122 },
    { id: "port_freecaptains_05", name: "Pirate's Rest", faction: "Free Captains", x: -343, y: 416, tier: 1, size: 30, flipped: true, entryX: -331, entryY: 425 },

    // KEEN FOLK ENGINEERS (2 ports)
    { id: "port_keenfolk_01", name: "Cogwheel Port", faction: "Keen Folk Engineers", x: -109, y: -190, tier: 2, size: 40, entryX: -109, entryY: -170 },
    { id: "port_keenfolk_02", name: "Tinker's Landing", faction: "Keen Folk Engineers", x: -45, y: -307, tier: 1, size: 30, flipped: true, entryX: -43, entryY: -293 },

    // OGLODI RAIDERS (3 ports)
    { id: "port_oglodi_01", name: "Bloodstone Keep", faction: "Oglodi Raiders", x: -86, y: 263, tier: 3, size: 50, flipped: true, entryX: -65, entryY: 260 },
    { id: "port_oglodi_02", name: "Warblade Fortress", faction: "Oglodi Raiders", x: 429, y: 285, tier: 2, size: 40, flipped: true, entryX: 442, entryY: 298 },
    { id: "port_oglodi_03", name: "Raider's Landing", faction: "Oglodi Raiders", x: 446, y: -155, tier: 1, size: 30, entryX: 434, entryY: -144 },

    // REVTEL (4 ports)
    { id: "port_revtel_01", name: "Coral Haven", faction: "Revtel", x: 312, y: 99, tier: 3, size: 50, entryX: 295, entryY: 116 },
    { id: "port_revtel_02", name: "Reef Sanctuary", faction: "Revtel", x: 166, y: 440, tier: 2, size: 40, flipped: true, entryX: 184, entryY: 447 },
    { id: "port_revtel_03", name: "Pearl Landing", faction: "Revtel", x: -4, y: 407, tier: 1, size: 30, entryX: -18, entryY: 410 },
    { id: "port_revtel_04", name: "Shallow Waters", faction: "Revtel", x: 46, y: 303, tier: 1, size: 30, entryX: 34, entryY: 306 },

    // ROSELEAF TRADERS (5 ports)
    { id: "port_roseleaf_01", name: "Greenleaf Harbor", faction: "Roseleaf Traders", x: 161, y: -319, tier: 3, size: 50, entryX: 147, entryY: -303 },
    { id: "port_roseleaf_02", name: "Silverwood Port", faction: "Roseleaf Traders", x: 243, y: -123, tier: 2, size: 40, flipped: true, entryX: 257, entryY: -111 },
    { id: "port_roseleaf_03", name: "Elm Grove", faction: "Roseleaf Traders", x: 104, y: -371, tier: 1, size: 30, entryX: 94, entryY: -364 },
    { id: "port_roseleaf_04", name: "Willowbend", faction: "Roseleaf Traders", x: 441, y: -268, tier: 1, size: 30, flipped: true, entryX: 452, entryY: -257 },
    { id: "port_roseleaf_05", name: "Cedar Bay", faction: "Roseleaf Traders", x: 15, y: -256, tier: 1, size: 30, entryX: 7, entryY: -250 },

    // SLITHEREEN GUARD (4 ports)
    { id: "port_slithereen_01", name: "Deep Guard Fortress", faction: "Slithereen Guard", x: 365, y: 444, tier: 3, size: 50, flipped: true, entryX: 381, entryY: 462 },
    { id: "port_slithereen_02", name: "Naga Harbor", faction: "Slithereen Guard", x: 437, y: 368, tier: 2, size: 40, flipped: true, entryX: 452, entryY: 382 },
    { id: "port_slithereen_03", name: "Tidecaller Post", faction: "Slithereen Guard", x: 263, y: 174, tier: 1, size: 30, flipped: true, entryX: 275, entryY: 181 },
    { id: "port_slithereen_04", name: "Wavewarden Cove", faction: "Slithereen Guard", x: 215, y: 19, tier: 1, size: 30, entryX: 205, entryY: 28 },

    // STONEHALL MERCHANTS (7 ports)
    { id: "port_stonehall_01", name: "Ironforge", faction: "Stonehall Merchants", x: -407, y: -314, tier: 3, size: 50, entryX: -426, entryY: -296 },
    { id: "port_stonehall_02", name: "Granite Harbor", faction: "Stonehall Merchants", x: -124, y: -410, tier: 2, size: 40, flipped: true, entryX: -104, entryY: -397 },
    { id: "port_stonehall_03", name: "Stonehall Outpost", faction: "Stonehall Merchants", x: -389, y: -192, tier: 1, size: 30, entryX: -400, entryY: -186 },
    { id: "port_stonehall_04", name: "Copper Bay", faction: "Stonehall Merchants", x: -181, y: -177, tier: 1, size: 30, entryX: -194, entryY: -170 },
    { id: "port_stonehall_05", name: "Southern Forge", faction: "Stonehall Merchants", x: -308, y: -79, tier: 1, size: 30, entryX: -319, entryY: -73 },
    { id: "port_stonehall_06", name: "Mountain Hold", faction: "Stonehall Merchants", x: -8, y: 5, tier: 2, size: 40, entryX: -26, entryY: 16 },
    { id: "port_stonehall_07", name: "Eastern Mine", faction: "Stonehall Merchants", x: 156, y: -48, tier: 1, size: 30, flipped: true, entryX: 168, entryY: -41 }
];

// AIDEV-NOTE: Helper function to get port by ID
function getPortById(portId) {
    return PortData.find(port => port.id === portId);
}

// AIDEV-NOTE: Helper function to get all ports by faction
function getPortsByFaction(faction) {
    return PortData.filter(port => port.faction === faction);
}

// AIDEV-NOTE: Helper function to get port at world position (with radius check)
function getPortAtPosition(worldX, worldY, maxDistance = 50) {
    for (const port of PortData) {
        const dx = worldX - port.x;
        const dy = worldY - port.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= maxDistance) {
            return port;
        }
    }
    return null;
}

