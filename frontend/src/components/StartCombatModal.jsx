// frontend/src/components/StartCombatModal.jsx
import { useState } from 'react';
import { createEnemy, ENEMY_TEMPLATES, startCombat } from '../utils/combatSystem';

export default function StartCombatModal({ party, onStart, onClose }) {
  const [selectedEnemies, setSelectedEnemies] = useState([]);

  const handleAddEnemy = (templateName) => {
    setSelectedEnemies([...selectedEnemies, { template: templateName, count: 1 }]);
  };

  const handleUpdateCount = (index, count) => {
    const updated = [...selectedEnemies];
    updated[index].count = Math.max(1, Math.min(10, parseInt(count) || 1));
    setSelectedEnemies(updated);
  };

  const handleRemoveEnemy = (index) => {
    setSelectedEnemies(selectedEnemies.filter((_, i) => i !== index));
  };

  const handleStartCombat = () => {
    if (selectedEnemies.length === 0) {
      alert('Add at least one enemy!');
      return;
    }

    // Create all enemies
    const allEnemies = [];
    selectedEnemies.forEach(({ template, count }) => {
      allEnemies.push(...createEnemy(template, count));
    });

    // Start combat
    const combat = startCombat(party, allEnemies);
    onStart(combat);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5000,
      overflow: 'auto',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        color: '#eee',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '3px solid #d32f2f'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#d32f2f' }}>⚔️ Start Combat</h2>

        {/* Enemy Templates */}
        <h3 style={{ color: '#ffd700' }}>Add Enemies</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '10px',
          marginBottom: '30px'
        }}>
          {Object.entries(ENEMY_TEMPLATES).map(([key, enemy]) => (
            <button
              key={key}
              onClick={() => handleAddEnemy(key)}
              style={{
                padding: '15px',
                backgroundColor: '#2a2a2a',
                color: '#eee',
                border: '2px solid #444',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d32f2f'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#444'}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {enemy.name}
              </div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                CR {enemy.cr} | HP: {enemy.hp} | AC: {enemy.ac}
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                XP: {enemy.xpValue}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Enemies */}
        {selectedEnemies.length > 0 && (
          <>
            <h3 style={{ color: '#ffd700' }}>Selected Enemies</h3>
            <div style={{ marginBottom: '20px' }}>
              {selectedEnemies.map((selection, index) => {
                const template = ENEMY_TEMPLATES[selection.template];
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#2a2a2a',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '2px solid #444'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {template.name} x {selection.count}
                      </div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>
                        Total XP: {template.xpValue * selection.count}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <label style={{ fontSize: '14px' }}>
                        Count:
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={selection.count}
                          onChange={(e) => handleUpdateCount(index, e.target.value)}
                          style={{
                            width: '60px',
                            marginLeft: '8px',
                            padding: '5px',
                            backgroundColor: '#1a1a1a',
                            color: '#eee',
                            border: '1px solid #444',
                            borderRadius: '4px'
                          }}
                        />
                      </label>

                      <button
                        onClick={() => handleRemoveEnemy(index)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          paddingTop: '20px',
          borderTop: '2px solid #444'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleStartCombat}
            disabled={selectedEnemies.length === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: selectedEnemies.length > 0 ? '#d32f2f' : '#444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: selectedEnemies.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: selectedEnemies.length > 0 ? 1 : 0.5
            }}
          >
            ⚔️ Start Combat!
          </button>
        </div>
      </div>
    </div>
  );
}