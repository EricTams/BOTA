// BOTA - Sound & Music Volume Configuration
// Volume levels for all game sound effects and music (0.0 = silent, 1.0 = full volume)

const SoundVolumeConfig = {
    masterVolume: 1.0,
    sounds: {
        // Sound effects
        boat_start: 0.2,
        
        // Background music tracks
        steel_drums: 0.2,
        acoustic_guitar: 0.2,
        maracas: 0.2,
        bamboo_flute: 0.2,
        calypso_bass: 0.2,
        
        // Continuous ambient sounds (very subtle, always playing)
        gentle_waves: 0.03,
        wind_breeze: 0.10,
        hull_splash: 0.07,
        rigging_creak: 0.1,
        wood_groan: 0.10,
        sail_flutter: 0.05,
        
        // Occasional ambient sounds (random triggers)
        seagulls: 0.04,
        dolphins: 0.08,
        distant_thunder: 0.10,
        bell_buoy: 0.02,
        
        // Port ambient sounds (5 seconds, fade out over final 4 seconds)
        artifact_traders: 0.35,
        claddish_navy: 0.35,
        free_captains: 0.35,
        keen_folk_engineers: 0.35,
        oglodi_raiders: 0.35,
        revtel: 0.35,
        roseleaf_traders: 0.35,
        slithereen_guard: 0.35,
        stonehall_merchants: 0.35,
        
        // Port action sounds
        anchor_raise: 0.3,
        money_click: 0.4
    }
};

