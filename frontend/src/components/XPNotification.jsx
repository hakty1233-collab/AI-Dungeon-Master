// frontend/src/components/XPNotification.jsx
import { useEffect, useState } from 'react';

export default function XPNotification({ xpGained, reason, onComplete }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#1a1a1a',
        border: '3px solid #4CAF50',
        borderRadius: '12px',
        padding: '20px 30px',
        minWidth: '300px',
        boxShadow: '0 8px 24px rgba(76,175,80,0.4)',
        zIndex: 8888,
        animation: 'slideInRight 0.3s ease-out',
        transform: visible ? 'translateX(0)' : 'translateX(400px)',
        transition: 'transform 0.3s ease-out',
      }}
    >
      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '10px',
      }}>
        <div style={{
          fontSize: '40px',
          animation: 'pulse 1s ease-in-out infinite',
        }}>
          ⭐
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#4CAF50',
            marginBottom: '5px',
          }}>
            +{xpGained} XP
          </div>
          <div style={{
            fontSize: '14px',
            color: '#aaa',
          }}>
            {reason}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: '#333',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#4CAF50',
          transition: 'width 0.05s linear',
        }} />
      </div>
    </div>
  );
}