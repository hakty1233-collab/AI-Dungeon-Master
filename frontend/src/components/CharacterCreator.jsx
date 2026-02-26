// frontend/src/components/CharacterCreator.jsx
import { useState } from "react";
import { createCharacter, CLASSES, RACES, getModifier } from "../utils/characterSystem";
import { THIRD_CASTER_SUBCLASSES } from "../utils/spellSystem";

// Classes that have a spellcasting subclass requiring selection
const SUBCLASS_OPTIONS = {
  Fighter: [
    {
      key: 'Eldritch Knight',
      label: 'Eldritch Knight',
      icon: '🔮',
      description: 'Supplement your martial prowess with Abjuration and Evocation magic. Gain spell slots starting at level 3.',
      schools: 'Abjuration & Evocation'
    },
    {
      key: null,
      label: 'No Subclass',
      icon: '⚔️',
      description: 'A pure martial Fighter with no magical abilities.',
      schools: null
    }
  ],
  Rogue: [
    {
      key: 'Arcane Trickster',
      label: 'Arcane Trickster',
      icon: '🃏',
      description: 'Enhance your roguish skills with Enchantment and Illusion magic. Gain spell slots starting at level 3.',
      schools: 'Enchantment & Illusion'
    },
    {
      key: null,
      label: 'No Subclass',
      icon: '🗡️',
      description: 'A pure Rogue with no magical abilities.',
      schools: null
    }
  ]
};

// Classes that have a subclass step
const HAS_SUBCLASS_STEP = Object.keys(SUBCLASS_OPTIONS);

export default function CharacterCreator({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [characterData, setCharacterData] = useState({
    name: '',
    race: 'Human',
    className: 'Fighter',
    subclass: null,
    background: '',
    abilityScores: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }
  });

  const [pointBuy, setPointBuy] = useState(27);
  const POINT_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

  // Whether current class has a subclass step
  const hasSubclassStep = HAS_SUBCLASS_STEP.includes(characterData.className);

  // Total steps: 1=Name, 2=Race/Class, [2.5=Subclass], 3=Abilities, 4=Review
  // We map logical steps: 1,2,3(subclass),4(abilities),5(review) when subclass present
  //                       1,2,3(abilities),4(review)               when no subclass
  const totalSteps = hasSubclassStep ? 5 : 4;

  // Convert our internal step (1–5) to display step number
  const displayStep = step;
  const displayTotal = totalSteps;

  // Step labels for progress display
  const STEP_LABELS_WITH_SUB  = ['Name', 'Race & Class', 'Subclass', 'Abilities', 'Review'];
  const STEP_LABELS_WITHOUT   = ['Name', 'Race & Class', 'Abilities', 'Review'];
  const stepLabels = hasSubclassStep ? STEP_LABELS_WITH_SUB : STEP_LABELS_WITHOUT;

  const handleNext = () => {
    // When moving from step 2 (Race/Class) to next:
    // If class changed to one without subclass options but subclass was set, clear it
    if (step === 2 && !hasSubclassStep) {
      setCharacterData(prev => ({ ...prev, subclass: null }));
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step === 1) { onCancel(); return; }
    setStep(s => s - 1);
  };

  // Map step number to actual content when subclass step present or absent
  // step 1 = name, step 2 = race/class
  // hasSubclass: step 3 = subclass, step 4 = abilities, step 5 = review
  // noSubclass:  step 3 = abilities, step 4 = review
  const getContentStep = () => {
    if (hasSubclassStep) return step; // 1=name,2=race/class,3=subclass,4=abilities,5=review
    if (step <= 2) return step;
    return step + 1; // shift: step 3→4(abilities), step 4→5(review)
  };
  const contentStep = getContentStep();

  const handleAbilityChange = (ability, newScore) => {
    const currentScore = characterData.abilityScores[ability];
    const currentCost = POINT_COSTS[currentScore] || 0;
    const newCost = POINT_COSTS[newScore] || 0;
    const costDiff = newCost - currentCost;
    if (pointBuy - costDiff >= 0 && newScore >= 8 && newScore <= 15) {
      setCharacterData({ ...characterData, abilityScores: { ...characterData.abilityScores, [ability]: newScore } });
      setPointBuy(pointBuy - costDiff);
    }
  };

  const handleStandardArray = () => {
    setCharacterData({ ...characterData, abilityScores: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 } });
    setPointBuy(0);
  };

  const handleComplete = () => {
    if (!characterData.name.trim()) { alert("Please enter a character name!"); return; }
    const character = createCharacter({
      ...characterData,
      // Pass subclass through so createCharacter stores it on the character object
      subclass: characterData.subclass || undefined
    });
    onComplete(character);
  };

  const nextDisabled =
    (step === 1 && !characterData.name.trim()) ||
    (contentStep === 3 && hasSubclassStep && characterData.subclass === undefined);
    // Note: subclass: null = "No Subclass" (valid choice), undefined = not yet chosen

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 3000, overflow: 'auto', padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a', color: '#eee', padding: '40px',
        borderRadius: '15px', maxWidth: '800px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        border: '3px solid #ffd700', boxShadow: '0 0 40px rgba(255,215,0,0.4)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#ffd700', textAlign: 'center' }}>
          ⚔️ Create Your Hero
        </h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '8px' }}>
          Step {displayStep} of {displayTotal} — {stepLabels[displayStep - 1]}
        </p>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '10px', marginBottom: '30px', overflow: 'hidden' }}>
          <div style={{
            width: `${(displayStep / displayTotal) * 100}%`,
            height: '100%', backgroundColor: '#ffd700', transition: 'width 0.3s ease'
          }} />
        </div>

        {/* ── Step 1: Name ── */}
        {contentStep === 1 && (
          <div>
            <h2 style={{ color: '#ffd700' }}>What is your name?</h2>
            <input
              type="text"
              value={characterData.name}
              onChange={(e) => setCharacterData({ ...characterData, name: e.target.value })}
              placeholder="Enter character name..."
              style={{
                width: '100%', padding: '15px', fontSize: '20px',
                backgroundColor: '#2a2a2a', color: '#eee',
                border: '2px solid #444', borderRadius: '8px', marginBottom: '20px'
              }}
              autoFocus
            />
            <h3 style={{ color: '#ffd700', marginTop: '30px' }}>Background (Optional)</h3>
            <textarea
              value={characterData.background}
              onChange={(e) => setCharacterData({ ...characterData, background: e.target.value })}
              placeholder="Tell us about your character's past..."
              style={{
                width: '100%', padding: '15px', fontSize: '16px',
                backgroundColor: '#2a2a2a', color: '#eee',
                border: '2px solid #444', borderRadius: '8px',
                minHeight: '100px', fontFamily: 'inherit'
              }}
            />
          </div>
        )}

        {/* ── Step 2: Race & Class ── */}
        {contentStep === 2 && (
          <div>
            <h2 style={{ color: '#ffd700' }}>Choose your Race</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '30px' }}>
              {Object.keys(RACES).map(race => (
                <button
                  key={race}
                  onClick={() => setCharacterData({ ...characterData, race })}
                  style={{
                    padding: '20px',
                    backgroundColor: characterData.race === race ? '#ffd700' : '#2a2a2a',
                    color: characterData.race === race ? '#000' : '#eee',
                    border: characterData.race === race ? '3px solid #ffd700' : '2px solid #444',
                    borderRadius: '10px', cursor: 'pointer', fontSize: '16px',
                    fontWeight: characterData.race === race ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  {race}
                </button>
              ))}
            </div>

            <h2 style={{ color: '#ffd700' }}>Choose your Class</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              {Object.keys(CLASSES).map(className => {
                const hasSub = HAS_SUBCLASS_STEP.includes(className);
                return (
                  <button
                    key={className}
                    onClick={() => setCharacterData({ ...characterData, className, subclass: undefined })}
                    style={{
                      padding: '20px',
                      backgroundColor: characterData.className === className ? '#ffd700' : '#2a2a2a',
                      color: characterData.className === className ? '#000' : '#eee',
                      border: characterData.className === className ? '3px solid #ffd700' : '2px solid #444',
                      borderRadius: '10px', cursor: 'pointer', fontSize: '16px',
                      fontWeight: characterData.className === className ? 'bold' : 'normal',
                      transition: 'all 0.2s', position: 'relative'
                    }}
                  >
                    {className}
                    {hasSub && (
                      <div style={{
                        position: 'absolute', bottom: '4px', right: '6px',
                        fontSize: '10px', color: characterData.className === className ? '#333' : '#9C27B0'
                      }}>
                        subclass ›
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {hasSubclassStep && (
              <div style={{
                marginTop: '20px', padding: '12px 16px',
                backgroundColor: 'rgba(156,39,176,0.1)',
                border: '1px solid #9C27B0', borderRadius: '8px',
                fontSize: '13px', color: '#CE93D8'
              }}>
                ✨ {characterData.className}s can choose a spellcasting subclass on the next step.
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Subclass (Fighter / Rogue only) ── */}
        {contentStep === 3 && hasSubclassStep && (
          <div>
            <h2 style={{ color: '#ffd700' }}>Choose your Subclass</h2>
            <p style={{ color: '#888', marginBottom: '24px' }}>
              Your subclass shapes your specialisation. You can change your mind here — spells only unlock at level 3.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {SUBCLASS_OPTIONS[characterData.className].map(option => {
                const isSelected = characterData.subclass === option.key;
                return (
                  <div
                    key={option.key ?? 'none'}
                    onClick={() => setCharacterData({ ...characterData, subclass: option.key })}
                    style={{
                      padding: '20px',
                      backgroundColor: isSelected ? '#1a0a2e' : '#2a2a2a',
                      border: `2px solid ${isSelected ? '#9C27B0' : '#444'}`,
                      borderRadius: '12px', cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 0 12px rgba(156,39,176,0.4)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '28px' }}>{option.icon}</span>
                      <div>
                        <div style={{
                          fontSize: '20px', fontWeight: 'bold',
                          color: isSelected ? '#CE93D8' : '#eee'
                        }}>
                          {option.label}
                          {isSelected && <span style={{ marginLeft: '10px', fontSize: '14px', color: '#9C27B0' }}>✓ Selected</span>}
                        </div>
                        {option.schools && (
                          <div style={{ fontSize: '12px', color: '#9C27B0', marginTop: '2px' }}>
                            📖 Spell schools: {option.schools}
                          </div>
                        )}
                      </div>
                    </div>
                    <p style={{ margin: 0, color: '#aaa', fontSize: '14px', lineHeight: '1.5' }}>
                      {option.description}
                    </p>
                    {option.key && (
                      <div style={{
                        marginTop: '12px', padding: '8px 12px',
                        backgroundColor: 'rgba(156,39,176,0.08)',
                        border: '1px solid #4a1a6a', borderRadius: '6px',
                        fontSize: '12px', color: '#888'
                      }}>
                        🔮 Gains spell slots at character level 3 · Max spell level 4 · Uses INT modifier
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 4: Ability Scores ── */}
        {contentStep === 4 && (
          <div>
            <h2 style={{ color: '#ffd700' }}>Assign Ability Scores</h2>
            <p style={{ color: '#888', marginBottom: '20px' }}>
              Points remaining: <strong style={{ color: '#ffd700', fontSize: '20px' }}>{pointBuy}</strong> / 27
            </p>

            {/* Hint for EK/AT: INT is their spellcasting stat */}
            {characterData.subclass && THIRD_CASTER_SUBCLASSES[characterData.subclass] && (
              <div style={{
                marginBottom: '16px', padding: '10px 14px',
                backgroundColor: 'rgba(156,39,176,0.1)',
                border: '1px solid #6A1B9A', borderRadius: '8px',
                fontSize: '13px', color: '#CE93D8'
              }}>
                🔮 As an <strong>{characterData.subclass}</strong>, your spellcasting ability is <strong>Intelligence (INT)</strong>. Consider investing in it for better spell save DC and attack bonus.
              </div>
            )}

            <button
              onClick={handleStandardArray}
              style={{
                padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white',
                border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px'
              }}
            >
              📊 Use Standard Array (15, 14, 13, 12, 10, 8)
            </button>

            <div style={{ display: 'grid', gap: '15px' }}>
              {Object.entries(characterData.abilityScores).map(([ability, score]) => {
                const racialBonus = RACES[characterData.race].abilityBonus[ability] || 0;
                const finalScore = score + racialBonus;
                const finalModifier = getModifier(finalScore);
                const isSpellcastingStat = characterData.subclass && ability === 'INT';

                return (
                  <div key={ability} style={{
                    backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '10px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: `2px solid ${isSpellcastingStat ? '#9C27B0' : '#444'}`
                  }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '18px', color: isSpellcastingStat ? '#CE93D8' : '#ffd700' }}>
                        {ability}
                        {isSpellcastingStat && <span style={{ fontSize: '11px', marginLeft: '6px', color: '#9C27B0' }}>✨ spellcasting</span>}
                      </strong>
                      {racialBonus > 0 && (
                        <span style={{ marginLeft: '10px', color: '#4CAF50', fontSize: '14px' }}>
                          +{racialBonus} ({characterData.race})
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <button
                        onClick={() => handleAbilityChange(ability, score - 1)}
                        disabled={score <= 8}
                        style={{
                          width: '40px', height: '40px', fontSize: '20px',
                          backgroundColor: '#444', color: 'white',
                          border: 'none', borderRadius: '5px',
                          cursor: score > 8 ? 'pointer' : 'not-allowed',
                          opacity: score > 8 ? 1 : 0.3
                        }}
                      >−</button>
                      <div style={{ textAlign: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffd700' }}>{finalScore}</div>
                        <div style={{ fontSize: '14px', color: '#888' }}>{finalModifier >= 0 ? '+' : ''}{finalModifier}</div>
                      </div>
                      <button
                        onClick={() => handleAbilityChange(ability, score + 1)}
                        disabled={score >= 15 || pointBuy < (POINT_COSTS[score + 1] - POINT_COSTS[score])}
                        style={{
                          width: '40px', height: '40px', fontSize: '20px',
                          backgroundColor: '#444', color: 'white',
                          border: 'none', borderRadius: '5px',
                          cursor: (score < 15 && pointBuy >= (POINT_COSTS[score + 1] - POINT_COSTS[score])) ? 'pointer' : 'not-allowed',
                          opacity: (score < 15 && pointBuy >= (POINT_COSTS[score + 1] - POINT_COSTS[score])) ? 1 : 0.3
                        }}
                      >+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 5: Review ── */}
        {contentStep === 5 && (
          <div>
            <h2 style={{ color: '#ffd700' }}>Review Your Hero</h2>
            <div style={{
              backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '10px',
              marginBottom: '20px', border: '2px solid #444'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#ffd700', fontSize: '24px' }}>
                {characterData.name}
              </h3>
              <p style={{ margin: '5px 0', fontSize: '18px' }}>
                Level 1 {characterData.race} {characterData.className}
                {characterData.subclass && (
                  <span style={{ color: '#9C27B0', marginLeft: '8px', fontSize: '16px' }}>
                    ({characterData.subclass})
                  </span>
                )}
              </p>
              {characterData.subclass && THIRD_CASTER_SUBCLASSES[characterData.subclass] && (
                <div style={{
                  marginTop: '10px', padding: '8px 12px',
                  backgroundColor: 'rgba(156,39,176,0.1)',
                  border: '1px solid #6A1B9A', borderRadius: '6px',
                  fontSize: '13px', color: '#CE93D8'
                }}>
                  🔮 Spellcasting unlocks at level 3 · Schools: {THIRD_CASTER_SUBCLASSES[characterData.subclass].restrictedSchools.join(' & ')}
                </div>
              )}
              {characterData.background && (
                <p style={{ margin: '10px 0 0 0', color: '#aaa', fontSize: '14px', fontStyle: 'italic' }}>
                  "{characterData.background}"
                </p>
              )}
            </div>

            <h3 style={{ color: '#ffd700' }}>Final Ability Scores</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {Object.entries(characterData.abilityScores).map(([ability, score]) => {
                const racialBonus = RACES[characterData.race].abilityBonus[ability] || 0;
                const finalScore = score + racialBonus;
                const modifier = getModifier(finalScore);
                const isSpellcastingStat = characterData.subclass && ability === 'INT';
                return (
                  <div key={ability} style={{
                    backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px',
                    textAlign: 'center',
                    border: `2px solid ${isSpellcastingStat ? '#9C27B0' : '#444'}`
                  }}>
                    <div style={{ fontSize: '12px', color: isSpellcastingStat ? '#CE93D8' : '#aaa' }}>
                      {ability}{isSpellcastingStat ? ' ✨' : ''}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700' }}>{finalScore}</div>
                    <div style={{ fontSize: '14px', color: '#888' }}>{modifier >= 0 ? '+' : ''}{modifier}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: '30px',
          paddingTop: '20px', borderTop: '2px solid #444'
        }}>
          <button
            onClick={handleBack}
            style={{
              padding: '12px 30px', backgroundColor: '#666', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '16px', fontWeight: 'bold'
            }}
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          <button
            onClick={step < totalSteps ? handleNext : handleComplete}
            disabled={nextDisabled}
            style={{
              padding: '12px 30px',
              backgroundColor: step === totalSteps ? '#4CAF50' : '#ffd700',
              color: step === totalSteps ? 'white' : '#000',
              border: 'none', borderRadius: '8px',
              cursor: nextDisabled ? 'not-allowed' : 'pointer',
              fontSize: '16px', fontWeight: 'bold',
              opacity: nextDisabled ? 0.5 : 1
            }}
          >
            {step === totalSteps ? '✓ Create Hero' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}