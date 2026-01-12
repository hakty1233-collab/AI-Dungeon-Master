// frontend/src/components/DiceRoller.jsx
import { useState } from 'react';

export default function DiceRoller({ onRoll }) {
  const [lastRoll, setLastRoll] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  
  const dice = [4, 6, 8, 10, 12, 20];

  const roll = (sides) => {
    setIsRolling(true);
    
    // Animate the roll
    let count = 0;
    const interval = setInterval(() => {
      const tempResult = Math.floor(Math.random() * sides) + 1;
      setLastRoll({ sides, result: tempResult, temp: true });
      count++;
      
      if (count >= 10) {
        clearInterval(interval);
        const finalResult = Math.floor(Math.random() * sides) + 1;
        setLastRoll({ sides, result: finalResult, temp: false });
        onRoll({ sides, result: finalResult });
        setIsRolling(false);
      }
    }, 50);
  };

  const getDiceEmoji = (sides) => {
    const emojis = {
      4: '🎲',
      6: '🎲',
      8: '🎲',
      10: '🎲',
      12: '🎲',
      20: '🎲'
    };
    return emojis[sides] || '🎲';
  };

  const getResultColor = (sides, result) => {
    if (result === sides) return '#ffd700'; // Max roll
    if (result === 1) return '#f44336'; // Min roll
    if (result >= sides * 0.7) return '#4CAF50'; // Good roll
    if (result <= sides * 0.3) return '#ff9800'; // Poor roll
    return '#2196F3'; // Average roll
  };

  return (
    <div className="card">
      <h4 style={{ margin: '0 0 15px 0' }}>🎲 Roll Dice</h4>
      
      {/* Dice Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '15px',
        flexWrap: 'wrap' 
      }}>
        {dice.map((d) => (
          <button
            key={d}
            onClick={() => roll(d)}
            disabled={isRolling}
            className="btn btn-ghost"
            style={{
              minWidth: '70px',
              padding: '12px 16px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {getDiceEmoji(d)} d{d}
          </button>
        ))}
      </div>

      {/* Last Roll Result */}
      {lastRoll && (
        <div style={{
          backgroundColor: '#0a0a0a',
          border: `3px solid ${lastRoll.temp ? '#666' : getResultColor(lastRoll.sides, lastRoll.result)}`,
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          animation: lastRoll.temp ? 'none' : 'pulse 0.5s ease-out'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#aaa', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {isRolling ? 'Rolling...' : 'Last Roll'}
          </div>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: lastRoll.temp ? '#888' : getResultColor(lastRoll.sides, lastRoll.result),
            marginBottom: '8px',
            textShadow: lastRoll.temp ? 'none' : `0 0 20px ${getResultColor(lastRoll.sides, lastRoll.result)}40`
          }}>
            {lastRoll.result}
          </div>
          <div style={{ 
            fontSize: '16px', 
            color: '#aaa' 
          }}>
            d{lastRoll.sides}
            {!lastRoll.temp && (
              <>
                {lastRoll.result === lastRoll.sides && ' 🎉 CRITICAL!'}
                {lastRoll.result === 1 && ' 💥 FUMBLE!'}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}