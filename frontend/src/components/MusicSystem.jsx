// frontend/src/components/MusicSystem.jsx
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// Music tracks (using royalty-free music URLs)
const MUSIC_TRACKS = {
  main_menu: {
    name: 'Main Menu Theme',
    url: '/public/main_menu.mp3',
    volume: 0.3,
    loop: true
  },
  peaceful_village: {
    name: 'Peaceful Village',
    url: '/public/main_menu.mp3',
    volume: 0.25,
    loop: true
  },
  forest_exploration: {
    name: 'Forest Exploration',
    url: 'https://cdn.pixabay.com/audio/2023/02/28/audio_64a8030714.mp3',
    volume: 0.25,
    loop: true
  },
  dungeon_explore: {
    name: 'Dark Dungeon',
    url: 'https://cdn.pixabay.com/audio/2022/11/28/audio_1e0d3c15e3.mp3',
    volume: 0.3,
    loop: true
  },
  combat_easy: {
    name: 'Battle - Easy',
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_13697b3a7f.mp3',
    volume: 0.35,
    loop: true
  },
  combat_hard: {
    name: 'Battle - Hard',
    url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_57b23c6eb5.mp3',
    volume: 0.4,
    loop: true
  },
  boss_fight: {
    name: 'Boss Battle',
    url: 'https://cdn.pixabay.com/audio/2023/09/04/audio_8b7e764b9c.mp3',
    volume: 0.45,
    loop: true
  },
  tavern: {
    name: 'Tavern',
    url: '/music/Tavern.mp3',
    volume: 0.2,
    loop: true
  },
  victory: {
    name: 'Victory!',
    url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c2c6e01cd2.mp3',
    volume: 0.4,
    loop: false
  },
  defeat: {
    name: 'Defeat',
    url: 'https://cdn.pixabay.com/audio/2022/11/14/audio_6a0e8c0c06.mp3',
    volume: 0.3,
    loop: false
  }
};

// Music System Component with forwardRef for external control
const MusicSystem = forwardRef((props, ref) => {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const [currentTrack, setCurrentTrack] = useState('peaceful_village');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  const handleTrackEnd = () => {
    const track = MUSIC_TRACKS[currentTrack];
    if (!track.loop) {
      setIsPlaying(false);
      // Return to peaceful music after victory/defeat
      setTimeout(() => playTrack('peaceful_village'), 2000);
    }
  };

  const handleError = (e) => {
    console.error('Music playback error:', e);
    setIsPlaying(false);
  };

  // Initialize audio on first play
  useEffect(() => {
    if (enabled && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', handleTrackEnd);
      audioRef.current.addEventListener('error', handleError);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleTrackEnd);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, []);

  const fadeOut = (callback) => {
    if (!audioRef.current) return callback();

    const startVolume = audioRef.current.volume;
    const steps = 20;
    const stepDuration = 1000 / steps;
    const volumeStep = startVolume / steps;

    let currentStep = 0;
    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      if (audioRef.current) {
        audioRef.current.volume = Math.max(0, startVolume - (volumeStep * currentStep));
      }

      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current);
        if (audioRef.current) audioRef.current.pause();
        callback();
      }
    }, stepDuration);
  };

  const fadeIn = (targetVolume) => {
    if (!audioRef.current) return;

    const steps = 20;
    const stepDuration = 1000 / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;
    audioRef.current.volume = 0;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      if (audioRef.current) {
        audioRef.current.volume = Math.min(volumeStep * currentStep, targetVolume);
      }

      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current);
      }
    }, stepDuration);
  };

  const playTrack = (trackKey, fade = true) => {
    if (!enabled) return;

    const track = MUSIC_TRACKS[trackKey];
    if (!track) return;

    // If same track playing, don't restart
    if (currentTrack === trackKey && isPlaying && audioRef.current && !audioRef.current.paused) {
      return;
    }

    console.log(`🎵 Switching to: ${track.name}`);

    const startNewTrack = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener('ended', handleTrackEnd);
        audioRef.current.addEventListener('error', handleError);
      }

      audioRef.current.src = track.url;
      audioRef.current.loop = track.loop;
      audioRef.current.volume = 0;

      audioRef.current.play()
        .then(() => {
          setCurrentTrack(trackKey);
          setIsPlaying(true);
          fadeIn(track.volume * volume);
        })
        .catch(err => {
          console.error('Failed to play music:', err);
          setIsPlaying(false);
        });
    };

    if (audioRef.current && !audioRef.current.paused && fade) {
      fadeOut(startNewTrack);
    } else {
      if (audioRef.current) audioRef.current.pause();
      startNewTrack();
    }
  };

  const stopMusic = () => {
    if (!audioRef.current) return;

    fadeOut(() => {
      setIsPlaying(false);
    });
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      playTrack(currentTrack);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current && isPlaying) {
      const track = MUSIC_TRACKS[currentTrack];
      audioRef.current.volume = track.volume * newVolume;
    }
  };

  const handleToggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    if (!newEnabled && isPlaying) {
      stopMusic();
    }
  };

  // Expose playTrack method to parent via ref
  useImperativeHandle(ref, () => ({
    playTrack: (trackKey) => playTrack(trackKey, true),
    stop: () => stopMusic(),
    getCurrentTrack: () => currentTrack,
    isEnabled: () => enabled,
    isPlaying: () => isPlaying
  }));

  // Auto-start peaceful music on mount
  useEffect(() => {
    if (enabled && !isPlaying) {
      setTimeout(() => playTrack('peaceful_village'), 1000);
    }
  }, []);

  const currentTrackData = MUSIC_TRACKS[currentTrack];

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      backgroundColor: '#1a1a1a',
      border: '2px solid #444',
      borderRadius: '12px',
      padding: showControls ? '20px' : '15px',
      minWidth: showControls ? '300px' : 'auto',
      boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      transition: 'all 0.3s ease'
    }}>
      {/* Compact View */}
      {!showControls && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowControls(true)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffd700',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px'
            }}
            title="Show music controls"
          >
            🎵
          </button>
          {isPlaying && (
            <span style={{
              fontSize: '12px',
              color: '#888',
              animation: 'pulse 2s infinite'
            }}>
              ♪
            </span>
          )}
        </div>
      )}

      {/* Expanded Controls */}
      {showControls && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h4 style={{ margin: 0, color: '#ffd700', fontSize: '16px' }}>
              🎵 Music
            </h4>
            <button
              onClick={() => setShowControls(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#888',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Enable/Disable */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px',
            cursor: 'pointer',
            color: '#eee'
          }}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleToggleEnabled}
              style={{ cursor: 'pointer' }}
            />
            <span>Enable Background Music</span>
          </label>

          {enabled && (
            <>
              {/* Current Track */}
              <div style={{
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                border: '1px solid #444'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '5px'
                }}>
                  {isPlaying ? '♪ Now Playing' : 'Paused'}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#ffd700',
                  fontWeight: 'bold'
                }}>
                  {currentTrackData.name}
                </div>
              </div>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: isPlaying ? '#d32f2f' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '15px'
                }}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>

              {/* Volume Control */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#aaa',
                  marginBottom: '8px'
                }}>
                  Volume: {Math.round(volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                    accentColor: '#ffd700'
                  }}
                />
              </div>

              {/* Track Selection */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#aaa',
                  marginBottom: '8px'
                }}>
                  Change Track:
                </label>
                <div style={{
                  display: 'grid',
                  gap: '5px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {Object.entries(MUSIC_TRACKS).map(([key, track]) => (
                    <button
                      key={key}
                      onClick={() => playTrack(key)}
                      style={{
                        padding: '8px',
                        backgroundColor: currentTrack === key ? '#ffd700' : '#2a2a2a',
                        color: currentTrack === key ? '#000' : '#eee',
                        border: currentTrack === key ? '2px solid #ffd700' : '1px solid #444',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                    >
                      {track.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}
      </style>
    </div>
  );
});

MusicSystem.displayName = 'MusicSystem';

export default MusicSystem;