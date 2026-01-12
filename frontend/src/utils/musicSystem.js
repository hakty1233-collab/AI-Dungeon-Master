// frontend/src/utils/musicSystem.js

/**
 * Background Music System
 * Uses free music from various sources
 */

// Music tracks (using royalty-free music URLs)
export const MUSIC_TRACKS = {
  // Main themes
  main_menu: {
    name: 'Main Menu Theme',
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_d1718372d8.mp3', // Epic Fantasy
    volume: 0.3,
    loop: true
  },
  
  // Exploration music
  peaceful_village: {
    name: 'Peaceful Village',
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', // Calm Village
    volume: 0.25,
    loop: true
  },
  
  forest_exploration: {
    name: 'Forest Exploration',
    url: 'https://cdn.pixabay.com/audio/2023/02/28/audio_64a8030714.mp3', // Forest Ambience
    volume: 0.25,
    loop: true
  },
  
  dungeon_explore: {
    name: 'Dark Dungeon',
    url: 'https://cdn.pixabay.com/audio/2022/11/28/audio_1e0d3c15e3.mp3', // Dark Ambience
    volume: 0.3,
    loop: true
  },
  
  // Combat music
  combat_easy: {
    name: 'Battle - Easy',
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_13697b3a7f.mp3', // Action Music
    volume: 0.35,
    loop: true
  },
  
  combat_hard: {
    name: 'Battle - Hard',
    url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_57b23c6eb5.mp3', // Epic Battle
    volume: 0.4,
    loop: true
  },
  
  boss_fight: {
    name: 'Boss Battle',
    url: 'https://cdn.pixabay.com/audio/2023/09/04/audio_8b7e764b9c.mp3', // Boss Theme
    volume: 0.45,
    loop: true
  },
  
  // Special locations
  tavern: {
    name: 'Tavern',
    url: 'https://cdn.pixabay.com/audio/2022/08/02/audio_0625c1539c.mp3', // Tavern Music
    volume: 0.2,
    loop: true
  },
  
  victory: {
    name: 'Victory!',
    url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c2c6e01cd2.mp3', // Victory Fanfare
    volume: 0.4,
    loop: false
  },
  
  defeat: {
    name: 'Defeat',
    url: 'https://cdn.pixabay.com/audio/2022/11/14/audio_6a0e8c0c06.mp3', // Sad Theme
    volume: 0.3,
    loop: false
  }
};

// Music manager class
export class MusicManager {
  constructor() {
    this.currentTrack = null;
    this.audio = null;
    this.volume = 0.3;
    this.enabled = true;
    this.fadeDuration = 2000; // 2 seconds crossfade
  }

  /**
   * Play a track
   */
  play(trackKey, options = {}) {
    if (!this.enabled) return;

    const track = MUSIC_TRACKS[trackKey];
    if (!track) {
      console.warn('Track not found:', trackKey);
      return;
    }

    // If same track is already playing, don't restart
    if (this.currentTrack === trackKey && this.audio && !this.audio.paused) {
      return;
    }

    const fade = options.fade !== false;
    const volume = options.volume || track.volume || this.volume;

    // Stop current track
    if (this.audio) {
      if (fade) {
        this.fadeOut(() => {
          this.startNewTrack(trackKey, track, volume);
        });
      } else {
        this.audio.pause();
        this.startNewTrack(trackKey, track, volume);
      }
    } else {
      this.startNewTrack(trackKey, track, volume);
    }
  }

  /**
   * Start playing a new track
   */
  startNewTrack(trackKey, track, volume) {
    this.audio = new Audio(track.url);
    this.audio.loop = track.loop !== false;
    this.audio.volume = 0;
    this.currentTrack = trackKey;

    this.audio.play().then(() => {
      this.fadeIn(volume);
    }).catch(err => {
      console.error('Failed to play music:', err);
    });

    console.log('🎵 Now playing:', track.name);
  }

  /**
   * Fade in
   */
  fadeIn(targetVolume) {
    if (!this.audio) return;

    const steps = 20;
    const stepDuration = this.fadeDuration / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      if (!this.audio) {
        clearInterval(interval);
        return;
      }

      currentStep++;
      this.audio.volume = Math.min(volumeStep * currentStep, targetVolume);

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);
  }

  /**
   * Fade out
   */
  fadeOut(callback) {
    if (!this.audio) {
      if (callback) callback();
      return;
    }

    const startVolume = this.audio.volume;
    const steps = 20;
    const stepDuration = this.fadeDuration / steps;
    const volumeStep = startVolume / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      if (!this.audio) {
        clearInterval(interval);
        if (callback) callback();
        return;
      }

      currentStep++;
      this.audio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);

      if (currentStep >= steps) {
        clearInterval(interval);
        this.audio.pause();
        if (callback) callback();
      }
    }, stepDuration);
  }

  /**
   * Stop music
   */
  stop(fade = true) {
    if (!this.audio) return;

    if (fade) {
      this.fadeOut(() => {
        this.audio = null;
        this.currentTrack = null;
      });
    } else {
      this.audio.pause();
      this.audio = null;
      this.currentTrack = null;
    }
  }

  /**
   * Set volume
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  /**
   * Toggle enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled && this.audio) {
      this.stop();
    }
  }

  /**
   * Get current track info
   */
  getCurrentTrack() {
    if (!this.currentTrack) return null;
    return {
      key: this.currentTrack,
      ...MUSIC_TRACKS[this.currentTrack]
    };
  }
}

// Singleton instance
export const musicManager = new MusicManager();

/**
 * Detect scene type from narration and play appropriate music
 */
export function detectAndPlayMusic(narration, inCombat = false) {
  const lower = narration.toLowerCase();

  // Combat takes priority
  if (inCombat) {
    if (lower.includes('boss') || lower.includes('dragon') || lower.includes('ancient')) {
      musicManager.play('boss_fight');
    } else if (lower.includes('fierce') || lower.includes('deadly') || lower.includes('overwhelming')) {
      musicManager.play('combat_hard');
    } else {
      musicManager.play('combat_easy');
    }
    return;
  }

  // Victory/Defeat
  if (lower.includes('victory') || lower.includes('defeated all') || lower.includes('triumph')) {
    musicManager.play('victory');
    // Return to exploration after victory music
    setTimeout(() => {
      musicManager.play('peaceful_village');
    }, 10000);
    return;
  }

  if (lower.includes('defeat') || lower.includes('fallen') || lower.includes('death')) {
    musicManager.play('defeat');
    return;
  }

  // Locations
  if (lower.includes('tavern') || lower.includes('inn') || lower.includes('alehouse')) {
    musicManager.play('tavern');
    return;
  }

  if (lower.includes('dungeon') || lower.includes('cave') || lower.includes('crypt') || lower.includes('tomb')) {
    musicManager.play('dungeon_explore');
    return;
  }

  if (lower.includes('forest') || lower.includes('woods') || lower.includes('grove')) {
    musicManager.play('forest_exploration');
    return;
  }

  if (lower.includes('village') || lower.includes('town') || lower.includes('city') || lower.includes('peaceful')) {
    musicManager.play('peaceful_village');
    return;
  }

  // Default to peaceful exploration if no music is playing
  if (!musicManager.currentTrack) {
    musicManager.play('peaceful_village');
  }
}