// frontend/src/components/LevelUpModal.jsx
import { useState, useMemo } from 'react';
import { getFeaturesForLevelRange, getSubclassOptions } from '../utils/classFeatures';
import { applyLevelUpChoices, ABILITY_NAMES, MAX_ABILITY_SCORE } from '../utils/characterSystem';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const ABILITY_FULL_NAMES = {
  STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution',
  INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma'
};

const STEP_ICONS = { features: '⭐', asi: '💪', subclass: '🎭', confirm: '✅' };

const FEATURE_TYPE_STYLES = {
  passive:  { bg: 'rgba(33,150,243,0.1)',  border: '#2196F3', badge: '#2196F3', label: 'Passive' },
  asi:      { bg: 'rgba(76,175,80,0.1)',   border: '#4CAF50', badge: '#4CAF50', label: 'Choice'  },
  subclass: { bg: 'rgba(156,39,176,0.1)',  border: '#9C27B0', badge: '#9C27B0', label: 'Choice'  },
  choice:   { bg: 'rgba(255,152,0,0.1)',   border: '#FF9800', badge: '#FF9800', label: 'Choice'  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LevelUpModal({ levelUpData, character, onComplete, onClose }) {
  const { oldLevel, newLevel, levelsGained } = levelUpData;

  // Gather all features gained across all levels in this advancement
  const gainedByLevel = useMemo(
    () => getFeaturesForLevelRange(character.class, oldLevel, newLevel),
    [character.class, oldLevel, newLevel]
  );

  const allFeatures = gainedByLevel.flatMap(({ features }) => features);
  const hasASI      = allFeatures.some(f => f.type === 'asi');
  const hasSubclass = allFeatures.some(f => f.type === 'subclass') && !character.subclass;

  // Build step list dynamically
  const steps = ['features'];
  if (hasASI)      steps.push('asi');
  if (hasSubclass) steps.push('subclass');
  steps.push('confirm');

  const [stepIndex, setStepIndex]   = useState(0);
  const currentStep                  = steps[stepIndex];

  // ASI state — player has 2 points to distribute
  const [asiPoints, setAsiPoints]   = useState(2);
  const [asiChoices, setAsiChoices] = useState({}); // { STR: 1, DEX: 1 } etc.

  // Subclass state
  const [subclassChoice, setSubclassChoice] = useState(null);
  const subclassOptions = getSubclassOptions(character.class);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const canAdvance = () => {
    if (currentStep === 'asi')      return asiPoints === 0;
    if (currentStep === 'subclass') return subclassChoice !== null;
    return true;
  };

  const advance = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  };

  const back = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  // ── ASI handlers ───────────────────────────────────────────────────────────
  const handleASIIncrease = (ability) => {
    if (asiPoints <= 0) return;
    const current = asiChoices[ability] || 0;
    const score   = character.abilities[ability] + current;
    if (score >= MAX_ABILITY_SCORE) return;
    setAsiChoices(prev => ({ ...prev, [ability]: current + 1 }));
    setAsiPoints(prev => prev - 1);
  };

  const handleASIDecrease = (ability) => {
    const current = asiChoices[ability] || 0;
    if (current <= 0) return;
    setAsiChoices(prev => ({ ...prev, [ability]: current - 1 }));
    setAsiPoints(prev => prev + 1);
  };

  // ── Confirm & apply ────────────────────────────────────────────────────────
  const handleConfirm = () => {
    const choices = {
      asi:                   asiChoices,
      subclass:              subclassChoice,
      featuresAcknowledged:  true,
    };
    const updatedCharacter = applyLevelUpChoices(character, choices);
    console.log('[LevelUpModal] Choices confirmed:', choices);
    onComplete(updatedCharacter);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px'
    }}>
      <style>{`
        @keyframes levelGlow {
          0%,100% { box-shadow: 0 0 20px rgba(255,215,0,0.4); }
          50%      { box-shadow: 0 0 50px rgba(255,215,0,0.9), 0 0 80px rgba(255,215,0,0.4); }
        }
        @keyframes floatUp {
          0%,100% { transform: translateY(0);   }
          50%      { transform: translateY(-8px); }
        }
        @keyframes slideIn {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0);    }
        }
        .levelup-card { animation: slideIn 0.35s ease-out; }
        .asi-btn:hover { filter: brightness(1.2); }
      `}</style>

      <div style={{
        backgroundColor: '#0f0f14',
        border: '2px solid #c9a84c',
        borderRadius: '20px',
        width: '100%', maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        animation: 'levelGlow 2.5s ease-in-out infinite',
        overflow: 'hidden',
      }}>

        {/* ── Top banner ──────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1200 0%, #2a1f00 50%, #1a1200 100%)',
          padding: '24px 28px 20px',
          textAlign: 'center',
          borderBottom: '1px solid #333',
          position: 'relative',
        }}>
          <div style={{ fontSize: '42px', animation: 'floatUp 2s ease-in-out infinite' }}>✨</div>
          <h1 style={{
            margin: '8px 0 4px',
            fontSize: '32px', fontWeight: 'bold',
            color: '#ffd700',
            textShadow: '0 0 20px rgba(255,215,0,0.6)',
            letterSpacing: '3px',
          }}>LEVEL UP!</h1>
          <div style={{ color: '#aaa', fontSize: '15px' }}>
            <span style={{ color: '#888', fontSize: '20px' }}>{oldLevel}</span>
            <span style={{ color: '#555', margin: '0 10px' }}>→</span>
            <span style={{ color: '#ffd700', fontSize: '28px', fontWeight: 'bold',
              textShadow: '0 0 12px rgba(255,215,0,0.5)' }}>{newLevel}</span>
            {levelsGained > 1 && (
              <span style={{ marginLeft: '10px', color: '#4CAF50', fontSize: '13px' }}>
                (+{levelsGained} levels!)
              </span>
            )}
          </div>
          <div style={{ marginTop: '6px', color: '#c9a84c', fontSize: '14px', fontWeight: 'bold' }}>
            {character.name} — {character.race} {character.class}
          </div>

          {/* Step indicator */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {steps.map((step, i) => (
              <div key={step} style={{
                width: '32px', height: '6px',
                borderRadius: '3px',
                backgroundColor: i <= stepIndex ? '#c9a84c' : '#333',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* ── Step content ────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* FEATURES STEP */}
          {currentStep === 'features' && (
            <div className="levelup-card">
              <h3 style={{ margin: '0 0 16px', color: '#c9a84c', fontSize: '18px' }}>
                ⭐ New Features Gained
              </h3>
              {gainedByLevel.length === 0 ? (
                <p style={{ color: '#666' }}>No new features at this level.</p>
              ) : (
                gainedByLevel.map(({ level, features }) => (
                  <div key={level} style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px',
                      textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Level {level}
                    </div>
                    {features.map((feature, i) => {
                      const style = FEATURE_TYPE_STYLES[feature.type] || FEATURE_TYPE_STYLES.passive;
                      return (
                        <div key={i} style={{
                          padding: '12px 14px',
                          marginBottom: '8px',
                          backgroundColor: style.bg,
                          border: `1px solid ${style.border}`,
                          borderRadius: '10px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 'bold', color: '#eee', fontSize: '14px' }}>
                              {feature.name}
                            </span>
                            <span style={{
                              fontSize: '10px', padding: '1px 6px',
                              backgroundColor: style.badge,
                              color: '#000', borderRadius: '8px', fontWeight: 'bold',
                            }}>
                              {style.label}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '13px', color: '#aaa', lineHeight: '1.5' }}>
                            {feature.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}

              {/* HP preview */}
              <div style={{
                marginTop: '16px', padding: '12px 16px',
                backgroundColor: 'rgba(76,175,80,0.1)',
                border: '1px solid #4CAF50',
                borderRadius: '10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ color: '#81C784', fontSize: '14px' }}>❤️ Hit Points</span>
                <span style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '16px' }}>
                  {character.hp}/{character.maxHp}
                  <span style={{ color: '#81C784', marginLeft: '8px' }}>
                    +{character.pendingLevelUp?.hpIncrease || 0}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* ASI STEP */}
          {currentStep === 'asi' && (
            <div className="levelup-card">
              <h3 style={{ margin: '0 0 6px', color: '#c9a84c', fontSize: '18px' }}>
                💪 Ability Score Improvement
              </h3>
              <p style={{ margin: '0 0 20px', color: '#888', fontSize: '13px' }}>
                Distribute <strong style={{ color: '#ffd700' }}>{asiPoints} point{asiPoints !== 1 ? 's' : ''}</strong> remaining.
                Max score per ability: 20.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ABILITY_NAMES.map(ability => {
                  const baseScore    = character.abilities[ability];
                  const added        = asiChoices[ability] || 0;
                  const currentScore = baseScore + added;
                  const atMax        = currentScore >= MAX_ABILITY_SCORE;
                  const mod          = Math.floor((currentScore - 10) / 2);

                  return (
                    <div key={ability} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px',
                      backgroundColor: added > 0 ? 'rgba(76,175,80,0.1)' : '#1a1a1a',
                      border: `1px solid ${added > 0 ? '#4CAF50' : '#2a2a2a'}`,
                      borderRadius: '10px', transition: 'all 0.2s',
                    }}>
                      {/* Ability name */}
                      <div style={{ width: '130px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#eee' }}>
                          {ABILITY_FULL_NAMES[ability]}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{ability}</div>
                      </div>

                      {/* Score display */}
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#555' }}>{baseScore}</span>
                        {added > 0 && (
                          <span style={{ fontSize: '11px', color: '#4CAF50' }}> +{added}</span>
                        )}
                        <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#eee', margin: '0 8px' }}>
                          {currentScore}
                        </span>
                        <span style={{ fontSize: '14px', color: mod >= 0 ? '#4CAF50' : '#f44336' }}>
                          ({mod >= 0 ? '+' : ''}{mod})
                        </span>
                        {atMax && <span style={{ fontSize: '10px', color: '#ffd700', marginLeft: '6px' }}>MAX</span>}
                      </div>

                      {/* Buttons */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="asi-btn"
                          onClick={() => handleASIDecrease(ability)}
                          disabled={!added}
                          style={{
                            width: '32px', height: '32px',
                            backgroundColor: added > 0 ? '#c62828' : '#222',
                            color: added > 0 ? '#fff' : '#444',
                            border: 'none', borderRadius: '6px',
                            cursor: added > 0 ? 'pointer' : 'not-allowed',
                            fontSize: '18px', fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >−</button>
                        <button
                          className="asi-btn"
                          onClick={() => handleASIIncrease(ability)}
                          disabled={asiPoints <= 0 || atMax}
                          style={{
                            width: '32px', height: '32px',
                            backgroundColor: asiPoints > 0 && !atMax ? '#2e7d32' : '#222',
                            color: asiPoints > 0 && !atMax ? '#fff' : '#444',
                            border: 'none', borderRadius: '6px',
                            cursor: asiPoints > 0 && !atMax ? 'pointer' : 'not-allowed',
                            fontSize: '18px', fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >+</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {asiPoints > 0 && (
                <p style={{ marginTop: '14px', color: '#ff9800', fontSize: '13px', textAlign: 'center' }}>
                  ⚠️ You still have {asiPoints} point{asiPoints !== 1 ? 's' : ''} to spend.
                </p>
              )}
            </div>
          )}

          {/* SUBCLASS STEP */}
          {currentStep === 'subclass' && (
            <div className="levelup-card">
              <h3 style={{ margin: '0 0 6px', color: '#c9a84c', fontSize: '18px' }}>
                🎭 Choose Your {character.class} Archetype
              </h3>
              <p style={{ margin: '0 0 20px', color: '#888', fontSize: '13px' }}>
                This choice defines your {character.class}'s specialisation. Choose carefully — it cannot be changed.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {subclassOptions.map(option => (
                  <div
                    key={option.id}
                    onClick={() => setSubclassChoice(option.id)}
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      backgroundColor: subclassChoice === option.id
                        ? 'rgba(156,39,176,0.2)' : '#1a1a1a',
                      border: `2px solid ${subclassChoice === option.id ? '#9C27B0' : '#2a2a2a'}`,
                      borderRadius: '12px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        border: `2px solid ${subclassChoice === option.id ? '#9C27B0' : '#444'}`,
                        backgroundColor: subclassChoice === option.id ? '#9C27B0' : 'transparent',
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {subclassChoice === option.id && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fff' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#eee', fontSize: '15px' }}>
                          {option.name}
                        </div>
                        <div style={{ color: '#888', fontSize: '13px', marginTop: '3px' }}>
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONFIRM STEP */}
          {currentStep === 'confirm' && (
            <div className="levelup-card">
              <h3 style={{ margin: '0 0 20px', color: '#c9a84c', fontSize: '18px' }}>
                ✅ Confirm Level Up
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {/* Level */}
                <SummaryRow icon="⚔️" label="Level" value={`${oldLevel} → ${newLevel}`} valueColor="#ffd700" />

                {/* HP */}
                <SummaryRow
                  icon="❤️" label="Hit Points"
                  value={`${character.hp}/${character.maxHp} → ${character.hp + (character.pendingLevelUp?.hpIncrease || 0)}/${character.maxHp + (character.pendingLevelUp?.hpIncrease || 0)}`}
                  valueColor="#4CAF50"
                />

                {/* ASI summary */}
                {Object.keys(asiChoices).filter(k => asiChoices[k] > 0).length > 0 && (
                  <SummaryRow
                    icon="💪" label="Ability Scores"
                    value={Object.entries(asiChoices)
                      .filter(([, v]) => v > 0)
                      .map(([k, v]) => `${k} +${v}`)
                      .join(', ')}
                    valueColor="#81C784"
                  />
                )}

                {/* Subclass */}
                {subclassChoice && (
                  <SummaryRow
                    icon="🎭" label="Archetype"
                    value={subclassOptions.find(s => s.id === subclassChoice)?.name || subclassChoice}
                    valueColor="#CE93D8"
                  />
                )}

                {/* Features count */}
                {allFeatures.filter(f => f.type === 'passive').length > 0 && (
                  <SummaryRow
                    icon="⭐" label="New Features"
                    value={`${allFeatures.filter(f => f.type === 'passive').length} abilities unlocked`}
                    valueColor="#FFD54F"
                  />
                )}
              </div>

              <p style={{
                marginTop: '20px', color: '#666', fontSize: '12px', textAlign: 'center'
              }}>
                These changes will be applied permanently to {character.name}.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer navigation ───────────────────────────────────────────── */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #222',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: '#0f0f14',
        }}>
          <button
            onClick={stepIndex === 0 ? onClose : back}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2a2a2a', color: '#aaa',
              border: '1px solid #444', borderRadius: '8px',
              cursor: 'pointer', fontSize: '14px',
            }}
          >
            {stepIndex === 0 ? 'Skip for now' : '← Back'}
          </button>

          <div style={{ color: '#555', fontSize: '13px' }}>
            {stepIndex + 1} / {steps.length}
          </div>

          {currentStep === 'confirm' ? (
            <button
              onClick={handleConfirm}
              style={{
                padding: '12px 28px',
                backgroundColor: '#c9a84c', color: '#000',
                border: 'none', borderRadius: '10px',
                cursor: 'pointer', fontSize: '15px', fontWeight: 'bold',
              }}
            >
              ✨ Apply Level Up!
            </button>
          ) : (
            <button
              onClick={advance}
              disabled={!canAdvance()}
              style={{
                padding: '10px 22px',
                backgroundColor: canAdvance() ? '#1a3a1a' : '#1a1a1a',
                color: canAdvance() ? '#4CAF50' : '#444',
                border: `1px solid ${canAdvance() ? '#4CAF50' : '#333'}`,
                borderRadius: '8px',
                cursor: canAdvance() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
              }}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-component
// ─────────────────────────────────────────────────────────────────────────────

function SummaryRow({ icon, label, value, valueColor }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px',
      backgroundColor: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: '8px',
    }}>
      <span style={{ color: '#888', fontSize: '14px' }}>{icon} {label}</span>
      <span style={{ color: valueColor || '#eee', fontWeight: 'bold', fontSize: '14px' }}>{value}</span>
    </div>
  );
}