// frontend/src/components/ApplyStatusEffectModal.jsx
import { useState } from 'react';
import {
  STATUS_EFFECTS,
  STATUS_EFFECT_DEFINITIONS,
  DURATION_TYPES,
  createStatusEffect,
  applyStatusEffect
} from '../utils/statusEffectSystem';

export default function ApplyStatusEffectModal({ character, onApply, onClose }) {
  const [selectedEffect, setSelectedEffect] = useState(STATUS_EFFECTS.POISONED);
  const [duration, setDuration] = useState(1);
  const [durationType, setDurationType] = useState(DURATION_TYPES.ROUNDS);
  const [stackCount, setStackCount] = useState(1);
  const [saveDC, setSaveDC] = useState(null);
  const [saveAbility, setSaveAbility] = useState('CON');
  const [source, setSource] = useState('');

  const effectDef = STATUS_EFFECT_DEFINITIONS[selectedEffect];

  const handleApply = () => {
    const statusEffect = createStatusEffect({
      type: selectedEffect,
      duration,
      durationType,
      source: source || null,
      saveDC: saveDC || null,
      saveAbility: saveDC ? saveAbility : null,
      stackCount: effectDef?.canStack ? stackCount : 1
    });

    if (statusEffect) {
      const updated = applyStatusEffect(character, statusEffect);
      onApply(updated);
    }
  };

  // Group effects by category
  const conditions = Object.entries(STATUS_EFFECT_DEFINITIONS)
    .filter(([key]) => [
      STATUS_EFFECTS.BLINDED,
      STATUS_EFFECTS.CHARMED,
      STATUS_EFFECTS.DEAFENED,
      STATUS_EFFECTS.FRIGHTENED,
      STATUS_EFFECTS.GRAPPLED,
      STATUS_EFFECTS.INCAPACITATED,
      STATUS_EFFECTS.PARALYZED,
      STATUS_EFFECTS.PETRIFIED,
      STATUS_EFFECTS.POISONED,
      STATUS_EFFECTS.PRONE,
      STATUS_EFFECTS.RESTRAINED,
      STATUS_EFFECTS.STUNNED,
      STATUS_EFFECTS.UNCONSCIOUS,
    ].includes(key));

  const spellEffects = Object.entries(STATUS_EFFECT_DEFINITIONS)
    .filter(([key]) => [
      STATUS_EFFECTS.BLESSED,
      STATUS_EFFECTS.BANED,
      STATUS_EFFECTS.HASTED,
      STATUS_EFFECTS.SLOWED,
      STATUS_EFFECTS.CONCENTRATING,
      STATUS_EFFECTS.INVISIBLE,
    ].includes(key));

  const combatEffects = Object.entries(STATUS_EFFECT_DEFINITIONS)
    .filter(([key]) => [
      STATUS_EFFECTS.RAGING,
      STATUS_EFFECTS.DODGING,
      STATUS_EFFECTS.BURNING,
      STATUS_EFFECTS.BLEEDING,
    ].includes(key));

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
      padding: '20px',
      overflow: 'auto'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '15px',
        border: '3px solid #ffd700',
        maxWidth: '800px',
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
          <h2 style={{ margin: 0, color: '#ffd700' }}>
            🎭 Apply Status Effect to {character.name}
          </h2>
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

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}>
          {/* Effect Selection */}
          <h3 style={{ color: '#ffd700', marginTop: 0 }}>D&D 5e Conditions</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '10px',
            marginBottom: '20px'
          }}>
            {conditions.map(([key, effect]) => (
              <button
                key={key}
                onClick={() => setSelectedEffect(key)}
                style={{
                  padding: '12px',
                  backgroundColor: selectedEffect === key ? effect.color : '#2a2a2a',
                  color: selectedEffect === key ? '#fff' : '#eee',
                  border: selectedEffect === key ? `2px solid ${effect.color}` : '2px solid #444',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                  {effect.icon}
                </div>
                {effect.name}
              </button>
            ))}
          </div>

          <h3 style={{ color: '#ffd700' }}>Spell Effects</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '10px',
            marginBottom: '20px'
          }}>
            {spellEffects.map(([key, effect]) => (
              <button
                key={key}
                onClick={() => setSelectedEffect(key)}
                style={{
                  padding: '12px',
                  backgroundColor: selectedEffect === key ? effect.color : '#2a2a2a',
                  color: selectedEffect === key ? '#fff' : '#eee',
                  border: selectedEffect === key ? `2px solid ${effect.color}` : '2px solid #444',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                  {effect.icon}
                </div>
                {effect.name}
              </button>
            ))}
          </div>

          <h3 style={{ color: '#ffd700' }}>Combat Effects</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '10px',
            marginBottom: '20px'
          }}>
            {combatEffects.map(([key, effect]) => (
              <button
                key={key}
                onClick={() => setSelectedEffect(key)}
                style={{
                  padding: '12px',
                  backgroundColor: selectedEffect === key ? effect.color : '#2a2a2a',
                  color: selectedEffect === key ? '#fff' : '#eee',
                  border: selectedEffect === key ? `2px solid ${effect.color}` : '2px solid #444',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                  {effect.icon}
                </div>
                {effect.name}
              </button>
            ))}
          </div>

          {/* Selected Effect Details */}
          {effectDef && (
            <div style={{
              padding: '15px',
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              border: `2px solid ${effectDef.color}`,
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '32px' }}>{effectDef.icon}</span>
                <h3 style={{ margin: 0, color: effectDef.color }}>
                  {effectDef.name}
                </h3>
              </div>
              <p style={{ margin: '0 0 10px 0', color: '#ccc', fontSize: '14px' }}>
                {effectDef.description}
              </p>
            </div>
          )}

          {/* Duration Settings */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffd700' }}>
                Duration Type
              </label>
              <select
                value={durationType}
                onChange={(e) => setDurationType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#2a2a2a',
                  color: '#eee',
                  border: '2px solid #444',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value={DURATION_TYPES.ROUNDS}>Rounds</option>
                <option value={DURATION_TYPES.MINUTES}>Minutes</option>
                <option value={DURATION_TYPES.HOURS}>Hours</option>
                <option value={DURATION_TYPES.SAVE_ENDS}>Until Save</option>
                <option value={DURATION_TYPES.CONCENTRATION}>Concentration</option>
                <option value={DURATION_TYPES.PERMANENT}>Permanent</option>
                <option value={DURATION_TYPES.END_OF_TURN}>End of Turn</option>
              </select>
            </div>

            {durationType !== DURATION_TYPES.PERMANENT && 
             durationType !== DURATION_TYPES.SAVE_ENDS &&
             durationType !== DURATION_TYPES.CONCENTRATION && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffd700' }}>
                  Duration
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    color: '#eee',
                    border: '2px solid #444',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            )}
          </div>

          {/* Additional Settings */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: effectDef?.canStack ? '1fr 1fr 1fr' : '1fr 1fr',
            gap: '15px',
            marginBottom: '15px'
          }}>
            {effectDef?.canStack && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ffd700' }}>
                  Stacks
                </label>
                <input
                  type="number"
                  min="1"
                  max={effectDef.effects?.maxStacks || 10}
                  value={stackCount}
                  onChange={(e) => setStackCount(parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    color: '#eee',
                    border: '2px solid #444',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffd700' }}>
                Source (optional)
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., Spell, Monster"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#2a2a2a',
                  color: '#eee',
                  border: '2px solid #444',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffd700' }}>
                Save DC (optional)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={saveDC || ''}
                onChange={(e) => setSaveDC(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="e.g., 15"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#2a2a2a',
                  color: '#eee',
                  border: '2px solid #444',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {saveDC && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ffd700' }}>
                Save Ability
              </label>
              <select
                value={saveAbility}
                onChange={(e) => setSaveAbility(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#2a2a2a',
                  color: '#eee',
                  border: '2px solid #444',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="STR">Strength</option>
                <option value="DEX">Dexterity</option>
                <option value="CON">Constitution</option>
                <option value="INT">Intelligence</option>
                <option value="WIS">Wisdom</option>
                <option value="CHA">Charisma</option>
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px',
          borderTop: '2px solid #444',
          display: 'flex',
          justifyContent: 'space-between'
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
            onClick={handleApply}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ✓ Apply Effect
          </button>
        </div>
      </div>
    </div>
  );
}