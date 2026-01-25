// frontend/src/components/StatusEffectsPanel.jsx
import { useState } from 'react';
import {
  STATUS_EFFECT_DEFINITIONS,
  removeStatusEffect,
  getActiveStatusEffects,
  DURATION_TYPES
} from '../utils/statusEffectSystem';

export default function StatusEffectsPanel({ 
  character, 
  onUpdateCharacter,
  compact = false 
}) {
  const [selectedEffect, setSelectedEffect] = useState(null);
  
  const activeEffects = getActiveStatusEffects(character);

  if (activeEffects.length === 0 && compact) {
    return null;
  }

  const handleRemoveEffect = (effectId) => {
    const updated = removeStatusEffect(character, effectId);
    onUpdateCharacter(updated);
    setSelectedEffect(null);
  };

  const getDurationText = (effect) => {
    if (effect.durationType === DURATION_TYPES.PERMANENT) {
      return 'Permanent';
    }
    if (effect.durationType === DURATION_TYPES.CONCENTRATION) {
      return 'Concentration';
    }
    if (effect.durationType === DURATION_TYPES.SAVE_ENDS) {
      return 'Until save';
    }
    if (effect.durationType === DURATION_TYPES.INSTANT) {
      return 'Instant';
    }
    
    const unit = effect.durationType === DURATION_TYPES.ROUNDS ? 'round' :
                 effect.durationType === DURATION_TYPES.MINUTES ? 'minute' : 'hour';
    const plural = effect.remainingDuration !== 1 ? 's' : '';
    
    return `${effect.remainingDuration} ${unit}${plural}`;
  };

  // Compact view (for combat tracker)
  if (compact) {
    return (
      <div style={{
        display: 'flex',
        gap: '5px',
        flexWrap: 'wrap',
        marginTop: '8px'
      }}>
        {activeEffects.map(effect => (
          <div
            key={effect.id}
            title={`${effect.name}: ${effect.description}`}
            style={{
              fontSize: '20px',
              cursor: 'pointer',
              position: 'relative',
              padding: '2px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0,0,0,0.3)'
            }}
            onClick={() => setSelectedEffect(effect)}
          >
            {effect.icon}
            {effect.stackCount > 1 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#d32f2f',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {effect.stackCount}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Full panel view
  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid #444'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#ffd700' }}>
        🎭 Status Effects
      </h3>

      {activeEffects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#888',
          fontStyle: 'italic'
        }}>
          No active status effects
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '10px'
        }}>
          {activeEffects.map(effect => (
            <div
              key={effect.id}
              onClick={() => setSelectedEffect(effect)}
              style={{
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: selectedEffect?.id === effect.id ? `2px solid ${effect.color}` : '2px solid #444',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{effect.icon}</span>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: effect.color
                    }}>
                      {effect.name}
                      {effect.stackCount > 1 && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '14px',
                          color: '#888'
                        }}>
                          x{effect.stackCount}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {getDurationText(effect)}
                      {effect.spellName && ` • ${effect.spellName}`}
                      {effect.source && ` • from ${effect.source}`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveEffect(effect.id);
                  }}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title="Remove effect"
                >
                  ✕
                </button>
              </div>

              {selectedEffect?.id === effect.id && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #444'
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#ccc',
                    marginBottom: '10px',
                    lineHeight: '1.5'
                  }}>
                    {effect.description}
                  </div>

                  {/* Mechanical Effects */}
                  <div style={{
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    <strong style={{ color: '#ffd700' }}>Effects:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {effect.effects.attackAdvantage && (
                        <li style={{ color: '#4CAF50' }}>Advantage on attacks</li>
                      )}
                      {effect.effects.attackDisadvantage && (
                        <li style={{ color: '#f44336' }}>Disadvantage on attacks</li>
                      )}
                      {effect.effects.attackedWithAdvantage && (
                        <li style={{ color: '#f44336' }}>Attacks against you have advantage</li>
                      )}
                      {effect.effects.attackedWithDisadvantage && (
                        <li style={{ color: '#4CAF50' }}>Attacks against you have disadvantage</li>
                      )}
                      {effect.effects.cannotAct && (
                        <li style={{ color: '#f44336' }}>Cannot take actions</li>
                      )}
                      {effect.effects.cannotMove && (
                        <li style={{ color: '#f44336' }}>Cannot move</li>
                      )}
                      {effect.effects.speedReduction === 'zero' && (
                        <li style={{ color: '#f44336' }}>Speed reduced to 0</li>
                      )}
                      {effect.effects.dropsConcentration && (
                        <li style={{ color: '#ff9800' }}>Breaks concentration</li>
                      )}
                      {effect.effects.damagePerTurn && (
                        <li style={{ color: '#f44336' }}>
                          Takes {effect.effects.damagePerTurn} {effect.effects.damageType} damage per turn
                        </li>
                      )}
                      {effect.effects.acBonus && (
                        <li style={{ color: '#4CAF50' }}>+{effect.effects.acBonus} AC</li>
                      )}
                      {effect.effects.acPenalty && (
                        <li style={{ color: '#f44336' }}>-{effect.effects.acPenalty} AC</li>
                      )}
                    </ul>
                  </div>

                  {/* Removal conditions */}
                  {effect.removedBy && effect.removedBy.length > 0 && (
                    <div style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      color: '#888'
                    }}>
                      <strong style={{ color: '#ffd700' }}>Removed by:</strong> {effect.removedBy.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Special: Exhaustion */}
      {character.exhaustion > 0 && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#2a2a2a',
          border: '2px solid #616161',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '24px' }}>🥱</span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#616161' }}>
                Exhaustion Level {character.exhaustion}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#ccc' }}>
            <strong style={{ color: '#ffd700' }}>Effects:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              {character.exhaustion >= 1 && <li>Disadvantage on ability checks</li>}
              {character.exhaustion >= 2 && <li>Speed halved</li>}
              {character.exhaustion >= 3 && <li>Disadvantage on attacks and saves</li>}
              {character.exhaustion >= 4 && <li>HP maximum halved</li>}
              {character.exhaustion >= 5 && <li>Speed reduced to 0</li>}
              {character.exhaustion >= 6 && <li style={{ color: '#f44336', fontWeight: 'bold' }}>DEATH</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}