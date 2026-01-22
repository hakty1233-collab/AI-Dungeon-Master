// frontend/src/components/Bestiary.jsx
import { useState } from 'react';
import { ENEMY_TEMPLATES, ENEMY_CATEGORIES, getEnemiesByCategory } from '../utils/combatSystem';

export default function Bestiary({ encounteredEnemies = [], onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEnemy, setSelectedEnemy] = useState(null);
  const [showOnlyEncountered, setShowOnlyEncountered] = useState(false);

  // Get all enemies or filter by category
  const allEnemies = selectedCategory === 'all' 
    ? Object.entries(ENEMY_TEMPLATES).map(([key, enemy]) => ({ key, ...enemy }))
    : getEnemiesByCategory(selectedCategory);

  // Filter by encountered if toggled
  const displayEnemies = showOnlyEncountered
    ? allEnemies.filter(enemy => encounteredEnemies.includes(enemy.key))
    : allEnemies;

  // Sort by CR
  const sortedEnemies = displayEnemies.sort((a, b) => a.cr - b.cr);

  const getCRColor = (cr) => {
    if (cr < 1) return '#4CAF50'; // Green
    if (cr < 5) return '#2196F3'; // Blue
    if (cr < 10) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getCRLabel = (cr) => {
    if (cr < 1) return `${cr} (Easy)`;
    if (cr < 5) return `${cr} (Medium)`;
    if (cr < 10) return `${cr} (Hard)`;
    return `${cr} (Deadly)`;
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
      zIndex: 3000,
      padding: '20px',
      overflow: 'auto'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '15px',
        border: '3px solid #d32f2f',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '2px solid #444',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#d32f2f' }}>📖 Bestiary</h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Filters */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '2px solid #444',
          backgroundColor: '#0a0a0a'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedCategory === 'all' ? '#d32f2f' : '#2a2a2a',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              All ({allEnemies.length})
            </button>
            {Object.values(ENEMY_CATEGORIES).map(category => {
              const count = getEnemiesByCategory(category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: selectedCategory === category ? '#d32f2f' : '#2a2a2a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            color: '#aaa',
            fontSize: '14px'
          }}>
            <input
              type="checkbox"
              checked={showOnlyEncountered}
              onChange={(e) => setShowOnlyEncountered(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Show only encountered enemies ({encounteredEnemies.length})</span>
          </label>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Enemy List */}
          <div style={{
            width: '40%',
            borderRight: '2px solid #444',
            overflowY: 'auto',
            padding: '15px'
          }}>
            {sortedEnemies.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#888',
                fontStyle: 'italic'
              }}>
                No enemies found
              </div>
            ) : (
              sortedEnemies.map((enemy) => {
                const encountered = encounteredEnemies.includes(enemy.key);
                
                return (
                  <div
                    key={enemy.key}
                    onClick={() => setSelectedEnemy(enemy)}
                    style={{
                      padding: '15px',
                      marginBottom: '10px',
                      backgroundColor: selectedEnemy?.key === enemy.key ? '#2a2a2a' : '#1a1a1a',
                      border: selectedEnemy?.key === enemy.key ? '2px solid #d32f2f' : '2px solid #444',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: encountered || !showOnlyEncountered ? 1 : 0.6
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#fff'
                      }}>
                        {encountered && '👁️ '}{enemy.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: getCRColor(enemy.cr),
                        backgroundColor: '#0a0a0a',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 'bold'
                      }}>
                        CR {enemy.cr}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {enemy.category}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#aaa' }}>
                      HP: {enemy.maxHp} | AC: {enemy.ac} | XP: {enemy.xpValue}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Enemy Details */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px'
          }}>
            {selectedEnemy ? (
              <div>
                <h2 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>
                  {selectedEnemy.name}
                </h2>
                
                <div style={{
                  display: 'inline-block',
                  padding: '5px 15px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '15px',
                  marginBottom: '15px',
                  border: '1px solid #444'
                }}>
                  <span style={{ color: '#888' }}>CR </span>
                  <span style={{ color: getCRColor(selectedEnemy.cr), fontWeight: 'bold' }}>
                    {getCRLabel(selectedEnemy.cr)}
                  </span>
                  <span style={{ color: '#888', marginLeft: '10px' }}>• XP: </span>
                  <span style={{ color: '#ffd700', fontWeight: 'bold' }}>
                    {selectedEnemy.xpValue}
                  </span>
                </div>

                <p style={{
                  color: '#aaa',
                  fontStyle: 'italic',
                  marginBottom: '20px',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {selectedEnemy.description}
                </p>

                {/* Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <StatBox label="Hit Points" value={selectedEnemy.maxHp} color="#f44336" />
                  <StatBox label="Armor Class" value={selectedEnemy.ac} color="#2196F3" />
                  <StatBox label="Initiative" value={selectedEnemy.initiative >= 0 ? `+${selectedEnemy.initiative}` : selectedEnemy.initiative} color="#ff9800" />
                </div>

                {/* Attacks */}
                <h3 style={{ color: '#d32f2f', marginBottom: '10px' }}>⚔️ Attacks</h3>
                <div style={{ marginBottom: '20px' }}>
                  {selectedEnemy.attacks.map((attack, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #444',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '5px'
                      }}>
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>
                          {attack.name}
                        </span>
                        <span style={{ color: '#ffd700' }}>
                          +{attack.bonus} to hit
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#aaa' }}>
                        {attack.damage} {attack.damageType} damage
                        {attack.recharge && <span style={{ marginLeft: '10px', color: '#ff9800' }}>
                          (Recharge {attack.recharge}-6)
                        </span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Defenses */}
                {(selectedEnemy.resistances?.length > 0 || 
                  selectedEnemy.vulnerabilities?.length > 0 || 
                  selectedEnemy.immunities?.length > 0) && (
                  <>
                    <h3 style={{ color: '#d32f2f', marginBottom: '10px' }}>🛡️ Defenses</h3>
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#2a2a2a',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid #444'
                    }}>
                      {selectedEnemy.vulnerabilities?.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <span style={{ color: '#888' }}>Vulnerabilities: </span>
                          <span style={{ color: '#f44336' }}>
                            {selectedEnemy.vulnerabilities.join(', ')}
                          </span>
                        </div>
                      )}
                      {selectedEnemy.resistances?.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <span style={{ color: '#888' }}>Resistances: </span>
                          <span style={{ color: '#2196F3' }}>
                            {selectedEnemy.resistances.join(', ')}
                          </span>
                        </div>
                      )}
                      {selectedEnemy.immunities?.length > 0 && (
                        <div>
                          <span style={{ color: '#888' }}>Immunities: </span>
                          <span style={{ color: '#4CAF50' }}>
                            {selectedEnemy.immunities.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Special Abilities */}
                {selectedEnemy.special && (
                  <>
                    <h3 style={{ color: '#d32f2f', marginBottom: '10px' }}>✨ Special Abilities</h3>
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#2a2a2a',
                      borderRadius: '8px',
                      border: '1px solid #444',
                      color: '#ccc',
                      lineHeight: '1.6'
                    }}>
                      {selectedEnemy.special}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Select an enemy to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{
      backgroundColor: '#2a2a2a',
      padding: '15px',
      borderRadius: '8px',
      textAlign: 'center',
      border: '2px solid #444'
    }}>
      <div style={{
        fontSize: '12px',
        color: '#aaa',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: color
      }}>
        {value}
      </div>
    </div>
  );
}