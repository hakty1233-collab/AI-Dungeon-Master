// frontend/src/components/LevelUpNotification.jsx
import { useEffect, useState } from 'react';

export default function LevelUpNotification({ levelUps, onClose }) {
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!levelUps || levelUps.length === 0) {
      onClose();
      return;
    }

    // Auto-advance through multiple level-ups
    if (currentIndex < levelUps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Close after showing last one
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, levelUps, onClose]);

  if (!levelUps || levelUps.length === 0 || !visible) return null;

  const levelUp = levelUps[currentIndex];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: visible ? 'fadeIn 0.5s ease-in' : 'fadeOut 0.5s ease-out',
      }}
      onClick={onClose}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(255,215,0,0.5); }
            50% { box-shadow: 0 0 40px rgba(255,215,0,0.9), 0 0 60px rgba(255,215,0,0.6); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>

      <div
        style={{
          backgroundColor: '#1a1a1a',
          padding: '60px',
          borderRadius: '20px',
          border: '4px solid #ffd700',
          textAlign: 'center',
          maxWidth: '600px',
          animation: 'scaleIn 0.5s ease-out, glow 2s ease-in-out infinite',
          position: 'relative',
        }}
      >
        {/* Sparkles */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '60px',
          animation: 'float 2s ease-in-out infinite',
        }}>
          ✨
        </div>

        <h1 style={{
          margin: '0 0 20px 0',
          fontSize: '72px',
          color: '#ffd700',
          textShadow: '0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.4)',
          fontWeight: 'bold',
          letterSpacing: '4px',
        }}>
          LEVEL UP!
        </h1>

        <div style={{
          margin: '30px 0',
          padding: '30px',
          backgroundColor: '#2a2a2a',
          borderRadius: '15px',
          border: '2px solid #444',
        }}>
          <h2 style={{
            margin: '0 0 15px 0',
            fontSize: '36px',
            color: '#fff',
          }}>
            {levelUp.name}
          </h2>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '30px',
            fontSize: '48px',
            fontWeight: 'bold',
            margin: '20px 0',
          }}>
            <div style={{
              color: '#888',
              fontSize: '64px',
            }}>
              {levelUp.oldLevel}
            </div>

            <div style={{
              color: '#4CAF50',
              fontSize: '40px',
            }}>
              →
            </div>

            <div style={{
              color: '#ffd700',
              fontSize: '96px',
              textShadow: '0 0 20px rgba(255,215,0,0.6)',
            }}>
              {levelUp.newLevel}
            </div>
          </div>

          {levelUp.levelsGained > 1 && (
            <p style={{
              margin: '15px 0 0 0',
              fontSize: '20px',
              color: '#4CAF50',
              fontWeight: 'bold',
            }}>
              🎉 Gained {levelUp.levelsGained} levels!
            </p>
          )}
        </div>

        <div style={{
          marginTop: '30px',
          fontSize: '18px',
          color: '#aaa',
        }}>
          {currentIndex < levelUps.length - 1 ? (
            <p>More level-ups coming... ({currentIndex + 1}/{levelUps.length})</p>
          ) : (
            <p>Click anywhere to continue</p>
          )}
        </div>

        {/* Particle effects */}
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          right: '-20px',
          fontSize: '40px',
          animation: 'float 2.5s ease-in-out infinite',
          animationDelay: '0.5s',
        }}>
          ⭐
        </div>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '20%',
          fontSize: '30px',
          animation: 'float 3s ease-in-out infinite',
          animationDelay: '1s',
        }}>
          💫
        </div>
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          left: '10%',
          fontSize: '35px',
          animation: 'float 2.2s ease-in-out infinite',
          animationDelay: '0.3s',
        }}>
          🌟
        </div>
      </div>
    </div>
  );
}