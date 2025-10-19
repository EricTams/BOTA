// BOTA - Audio Module
// Handles sound effect loading and playback with volume control

const Audio = {
    sounds: {},
    volumeConfig: null,
    initialized: false,

    // AIDEV-NOTE: Initialize audio system
    // Load volume configuration from JavaScript config file
    init() {
        // Use volume config from loaded JavaScript file
        if (typeof SoundVolumeConfig !== 'undefined') {
            this.volumeConfig = SoundVolumeConfig;
        } else {
            console.warn('SoundVolumeConfig not found, using defaults');
            // Set default config if not loaded
            this.volumeConfig = {
                masterVolume: 1.0,
                sounds: {}
            };
        }
        
        this.initialized = true;
    },

    // AIDEV-NOTE: Load a sound file
    // Preloads audio file and caches it for later playback
    loadSound(soundName, filePath) {
        if (this.sounds[soundName]) {
            return; // Already loaded
        }

        const audio = document.createElement('audio');
        audio.src = filePath;
        audio.preload = 'auto';
        this.sounds[soundName] = audio;
    },

    // AIDEV-NOTE: Play a sound effect
    // Uses volume from config, multiplied by master volume
    // Creates a clone so same sound can overlap if played multiple times
    play(soundName) {
        if (!this.initialized) {
            console.warn('Audio system not initialized');
            return;
        }

        if (!this.sounds[soundName]) {
            console.warn(`Sound not loaded: ${soundName}`);
            return;
        }

        try {
            // Clone the audio so we can play multiple instances
            const audio = this.sounds[soundName].cloneNode();
            
            // Get volume from config (default to 1.0 if not specified)
            const soundVolume = this.volumeConfig.sounds[soundName] || 1.0;
            const masterVolume = this.volumeConfig.masterVolume || 1.0;
            const finalVolume = soundVolume * masterVolume;
            
            // Set volume
            audio.volume = finalVolume;
            
            // Play the sound
            audio.play().catch(error => {
                console.error(`Failed to play sound ${soundName}:`, error);
            });
        } catch (error) {
            console.error(`Error playing sound ${soundName}:`, error);
        }
    },

    // AIDEV-NOTE: Stop a sound if it's playing
    stop(soundName) {
        if (!this.sounds[soundName]) {
            return;
        }

        const audio = this.sounds[soundName];
        audio.pause();
        audio.currentTime = 0;
    },

    // AIDEV-NOTE: Set master volume (0.0 to 1.0)
    setMasterVolume(volume) {
        if (this.volumeConfig) {
            this.volumeConfig.masterVolume = Math.max(0, Math.min(1, volume));
        }
    },

    // AIDEV-NOTE: Set volume for specific sound (0.0 to 1.0)
    setSoundVolume(soundName, volume) {
        if (this.volumeConfig && this.volumeConfig.sounds) {
            this.volumeConfig.sounds[soundName] = Math.max(0, Math.min(1, volume));
        }
    },

    // AIDEV-NOTE: Play port ambient sound with automatic 4-second fade out
    // Total duration: 5 seconds (1 second normal, 4 seconds fade out)
    playPortAmbient(soundName) {
        if (!this.initialized) {
            console.warn('Audio system not initialized');
            return;
        }

        if (!this.sounds[soundName]) {
            console.warn(`Port ambient sound not loaded: ${soundName}`);
            return;
        }

        try {
            const audio = this.sounds[soundName].cloneNode();
            
            // Get volume from config
            const soundVolume = this.volumeConfig.sounds[soundName] || 0.35;
            const masterVolume = this.volumeConfig.masterVolume || 1.0;
            const targetVolume = soundVolume * masterVolume;
            
            audio.volume = targetVolume;
            
            // Play the sound
            audio.play().catch(error => {
                console.error(`Failed to play port ambient ${soundName}:`, error);
            });

            // Start fade out after 1 second (fade out over 4 seconds)
            setTimeout(() => {
                const fadeSteps = 80; // 50ms per step = 4 seconds total
                const fadeStepDuration = 50;
                const volumeDecrement = targetVolume / fadeSteps;
                let currentStep = 0;

                const fadeInterval = setInterval(() => {
                    if (!audio || audio.paused) {
                        clearInterval(fadeInterval);
                        return;
                    }

                    currentStep++;
                    audio.volume = Math.max(0, targetVolume - (volumeDecrement * currentStep));

                    if (currentStep >= fadeSteps) {
                        clearInterval(fadeInterval);
                        audio.pause();
                    }
                }, fadeStepDuration);
            }, 1000); // Wait 1 second before starting fade

        } catch (error) {
            console.error(`Error playing port ambient ${soundName}:`, error);
        }
    }
};

