// BOTA - Music & Atmosphere Manager
// Handles background music playback with random selection, fading, and queueing
// Also manages ambient sound layers (continuous loops and occasional triggers)

const MusicManager = {
    tracks: [],
    currentTrack: null,
    currentAudio: null,
    nextTrack: null,
    enabled: true,
    fadeInDuration: 2000,  // 2 seconds fade in
    fadeOutDuration: 2000, // 2 seconds fade out
    fadingOut: false,
    fadeInterval: null,
    
    // Ambient sound system
    ambientEnabled: true,
    continuousAmbient: [],      // Tracks that loop continuously
    occasionalAmbient: [],      // Tracks that trigger randomly
    activeAmbientSounds: {},    // Currently playing continuous ambient sounds
    activeOccasionalSounds: [], // Currently playing occasional ambient sounds
    occasionalCooldowns: {},    // Cooldown tracking for occasional sounds
    
    // Focus tracking for pause/resume
    wasMusicPlayingBeforeBlur: false,
    wasAmbientPlayingBeforeBlur: false,

    // AIDEV-NOTE: Initialize music manager
    // Set up available tracks and ambient sounds
    init(trackList, continuousAmbient, occasionalAmbient) {
        this.tracks = trackList;
        this.continuousAmbient = continuousAmbient || [];
        this.occasionalAmbient = occasionalAmbient || [];
        
        // Set up window focus/blur listeners to pause/resume music
        this.setupFocusListeners();
    },
    
    // AIDEV-NOTE: Set up focus/blur listeners for pause/resume
    // Pauses music when window loses focus, resumes when regained
    setupFocusListeners() {
        window.addEventListener('blur', () => {
            this.handleBlur();
        });
        
        window.addEventListener('focus', () => {
            this.handleFocus();
        });
    },
    
    // AIDEV-NOTE: Handle window blur (focus lost)
    // Pause music and ambient sounds
    handleBlur() {
        // Track if music was playing
        this.wasMusicPlayingBeforeBlur = this.isPlaying();
        
        // Track if ambient was active
        this.wasAmbientPlayingBeforeBlur = Object.keys(this.activeAmbientSounds).length > 0 || 
                                           this.activeOccasionalSounds.length > 0;
        
        // Pause music
        if (this.currentAudio && !this.currentAudio.paused) {
            this.currentAudio.pause();
        }
        
        // Pause all continuous ambient sounds
        Object.values(this.activeAmbientSounds).forEach(audio => {
            if (audio && !audio.paused) {
                audio.pause();
            }
        });
        
        // Pause all occasional ambient sounds
        this.activeOccasionalSounds.forEach(audio => {
            if (audio && !audio.paused) {
                audio.pause();
            }
        });
    },
    
    // AIDEV-NOTE: Handle window focus (focus regained)
    // Resume music and ambient sounds if they were playing before blur
    handleFocus() {
        // Resume music if it was playing
        if (this.wasMusicPlayingBeforeBlur && this.currentAudio) {
            this.currentAudio.play().catch(error => {
                console.error('Failed to resume music:', error);
            });
        }
        
        // Resume ambient sounds if they were active
        if (this.wasAmbientPlayingBeforeBlur) {
            // Resume continuous ambient sounds
            Object.values(this.activeAmbientSounds).forEach(audio => {
                if (audio) {
                    audio.play().catch(error => {
                        console.error('Failed to resume ambient sound:', error);
                    });
                }
            });
            
            // Resume occasional ambient sounds (if they haven't finished)
            this.activeOccasionalSounds = this.activeOccasionalSounds.filter(audio => {
                if (audio && !audio.ended) {
                    audio.play().catch(error => {
                        console.error('Failed to resume occasional ambient:', error);
                    });
                    return true; // Keep in array
                }
                return false; // Remove from array if ended
            });
        }
        
        // Reset flags
        this.wasMusicPlayingBeforeBlur = false;
        this.wasAmbientPlayingBeforeBlur = false;
    },

    // AIDEV-NOTE: Start playing background music
    // Randomly selects first track and begins playback
    start() {
        if (!this.enabled || this.tracks.length === 0) {
            return;
        }

        if (this.currentTrack) {
            return;
        }

        // Pick random track and start playing
        this.playRandomTrack();
    },

    // AIDEV-NOTE: Stop music playback
    stop() {
        if (this.currentAudio) {
            this.fadeOut(() => {
                if (this.currentAudio) {
                    this.currentAudio.pause();
                    this.currentAudio = null;
                }
                this.currentTrack = null;
                this.nextTrack = null;
            });
        }
    },

    // AIDEV-NOTE: Play a random track from available tracks
    // Avoids playing the same track twice in a row
    playRandomTrack() {
        if (this.tracks.length === 0) return;

        // Pick random track (avoid repeating current track if possible)
        let availableTracks = this.tracks;
        if (this.tracks.length > 1 && this.currentTrack) {
            availableTracks = this.tracks.filter(t => t !== this.currentTrack);
        }

        const randomIndex = Math.floor(Math.random() * availableTracks.length);
        const trackName = availableTracks[randomIndex];

        this.playTrack(trackName);
    },

    // AIDEV-NOTE: Play specific track with fade in
    playTrack(trackName) {
        if (!Audio.sounds[trackName]) {
            console.warn(`Music track not loaded: ${trackName}`);
            return;
        }

        // Stop current track if playing
        if (this.currentAudio) {
            this.fadeOut(() => {
                this.startNewTrack(trackName);
            });
        } else {
            this.startNewTrack(trackName);
        }
    },

    // AIDEV-NOTE: Internal - start playing a new track
    startNewTrack(trackName) {
        // Clone the audio so we can play multiple instances
        this.currentAudio = Audio.sounds[trackName].cloneNode();
        this.currentTrack = trackName;
        this.fadingOut = false;

        // Get volume from config
        const trackVolume = Audio.volumeConfig.sounds[trackName] || 0.3;
        const masterVolume = Audio.volumeConfig.masterVolume || 1.0;
        const targetVolume = trackVolume * masterVolume;

        // Start at 0 volume for fade in
        this.currentAudio.volume = 0;
        this.currentAudio.loop = false; // Don't loop, we'll queue next track

        // Listen for track ending to queue next track
        this.currentAudio.addEventListener('ended', () => {
            this.currentTrack = null;
            this.currentAudio = null;
            
            // Play next random track after brief pause
            if (this.enabled) {
                setTimeout(() => this.playRandomTrack(), 500);
            }
        });

        // Start playing
        this.currentAudio.play().catch(error => {
            console.error(`Failed to play music track ${trackName}:`, error);
        });

        // Fade in
        this.fadeIn(targetVolume);
    },

    // AIDEV-NOTE: Fade in current track
    fadeIn(targetVolume) {
        if (!this.currentAudio) return;

        const steps = 50; // Number of volume steps
        const stepDuration = this.fadeInDuration / steps;
        const volumeStep = targetVolume / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            if (!this.currentAudio || this.fadingOut) {
                clearInterval(fadeInterval);
                return;
            }

            currentStep++;
            this.currentAudio.volume = Math.min(volumeStep * currentStep, targetVolume);

            if (currentStep >= steps) {
                clearInterval(fadeInterval);
            }
        }, stepDuration);
    },

    // AIDEV-NOTE: Fade out current track
    fadeOut(callback) {
        if (!this.currentAudio) {
            if (callback) callback();
            return;
        }

        this.fadingOut = true;
        const startVolume = this.currentAudio.volume;
        const steps = 50;
        const stepDuration = this.fadeOutDuration / steps;
        const volumeStep = startVolume / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            if (!this.currentAudio) {
                clearInterval(fadeInterval);
                if (callback) callback();
                return;
            }

            currentStep++;
            this.currentAudio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);

            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                if (callback) callback();
            }
        }, stepDuration);
    },

    // AIDEV-NOTE: Enable/disable music
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stop();
        } else if (!this.currentTrack) {
            this.start();
        }
    },

    // AIDEV-NOTE: Check if music is currently playing
    isPlaying() {
        return this.currentAudio !== null && !this.currentAudio.paused;
    },

    // ===== AMBIENT SOUND SYSTEM =====

    // AIDEV-NOTE: Start ambient sound system
    // Begins continuous ambient loops and starts occasional sound timer
    startAmbient() {
        if (!this.ambientEnabled) return;
        
        // Start all continuous ambient sounds
        this.continuousAmbient.forEach(soundName => {
            this.playContinuousAmbient(soundName);
        });

        // Start occasional ambient sound system
        this.startOccasionalAmbient();
    },

    // AIDEV-NOTE: Play a continuous ambient sound (loops)
    playContinuousAmbient(soundName) {
        if (!Audio.sounds[soundName]) {
            console.warn(`Ambient sound not loaded: ${soundName}`);
            return;
        }

        const audio = Audio.sounds[soundName].cloneNode();
        
        // Get volume from config
        const soundVolume = Audio.volumeConfig.sounds[soundName] || 0.1;
        const masterVolume = Audio.volumeConfig.masterVolume || 1.0;
        audio.volume = soundVolume * masterVolume;
        
        audio.loop = true; // Continuous sounds loop forever
        
        // Start playing
        audio.play().catch(error => {
            console.error(`Failed to play ambient sound ${soundName}:`, error);
        });

        // Store reference
        this.activeAmbientSounds[soundName] = audio;
    },

    // AIDEV-NOTE: Start occasional ambient sound system
    // Randomly triggers occasional sounds with cooldowns
    startOccasionalAmbient() {
        // Check every 5 seconds for possible occasional sound triggers
        setInterval(() => {
            if (!this.ambientEnabled) return;

            this.occasionalAmbient.forEach(soundName => {
                // Check if sound is on cooldown
                if (this.occasionalCooldowns[soundName]) {
                    return;
                }

                // 20% chance to trigger each check
                if (Math.random() < 0.2) {
                    this.playOccasionalAmbient(soundName);
                }
            });
        }, 5000); // Check every 5 seconds
    },

    // AIDEV-NOTE: Play an occasional ambient sound
    // Plays once, then puts sound on cooldown
    playOccasionalAmbient(soundName) {
        if (!Audio.sounds[soundName]) {
            console.warn(`Ambient sound not loaded: ${soundName}`);
            return;
        }

        const audio = Audio.sounds[soundName].cloneNode();
        
        // Get volume from config
        const soundVolume = Audio.volumeConfig.sounds[soundName] || 0.15;
        const masterVolume = Audio.volumeConfig.masterVolume || 1.0;
        audio.volume = soundVolume * masterVolume;
        
        audio.loop = false;
        
        // Track this occasional sound so we can pause/resume it
        this.activeOccasionalSounds.push(audio);
        
        // Remove from tracking when it ends
        audio.addEventListener('ended', () => {
            const index = this.activeOccasionalSounds.indexOf(audio);
            if (index > -1) {
                this.activeOccasionalSounds.splice(index, 1);
            }
        });
        
        // Start playing
        audio.play().catch(error => {
            console.error(`Failed to play occasional ambient ${soundName}:`, error);
        });

        // Put on cooldown (30-60 seconds)
        const cooldownTime = 30000 + Math.random() * 30000;
        this.occasionalCooldowns[soundName] = true;
        
        setTimeout(() => {
            delete this.occasionalCooldowns[soundName];
        }, cooldownTime);
    },

    // AIDEV-NOTE: Stop all ambient sounds
    stopAmbient() {
        // Stop all continuous ambient sounds
        Object.keys(this.activeAmbientSounds).forEach(soundName => {
            const audio = this.activeAmbientSounds[soundName];
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        
        // Stop all occasional ambient sounds
        this.activeOccasionalSounds.forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        
        this.activeAmbientSounds = {};
        this.activeOccasionalSounds = [];
        this.occasionalCooldowns = {};
    },

    // AIDEV-NOTE: Enable/disable ambient sounds
    setAmbientEnabled(enabled) {
        this.ambientEnabled = enabled;
        if (!enabled) {
            this.stopAmbient();
        } else {
            this.startAmbient();
        }
    }
};

