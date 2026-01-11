// frontend/src/components/CharacterCreator.jsx
import { useState } from "react";
import { createCharacter, CLASSES, RACES, getModifier } from "../utils/characterSystem";

export default function CharacterCreator({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [characterData, setCharacterData] = useState({
    name: '',
    race: 'Human',
    className: 'Fighter',
    background: '',
    abilityScores: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }
  });

  const [pointBuy, setPointBuy] = useState(27); // Standard point buy
  const POINT_COSTS = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
  };

  const handleAbilityChange = (ability, newScore) => {
    const currentScore = characterData.abilityScores[ability];
    const currentCost = POINT_COSTS[currentScore] || 0;
    const newCost = POINT_COSTS[newScore] || 0;
    const costDiff = newCost - currentCost;

    if (pointBuy - costDiff >= 0 && newScore >= 8 && newScore <= 15) {
      setCharacterData({
        ...characterData,
        abilityScores: {
          ...characterData.abilityScores,
          [ability]: newScore
        }
      });
      setPointBuy(pointBuy - costDiff);
    }
  };

  const handleStandardArray = () => {
    setCharacterData({
      ...characterData,
      abilityScores: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
    });
    setPointBuy(0);
  };

  const handleComplete = () => {
    if (!characterData.name.trim()) {
      alert("Please enter a character name!");
      return;
    }

    const character = createCharacter(characterData);
    onComplete(character);
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
      overflow: 'auto',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        color: '#eee',
        padding: '40px',
        borderRadius: '15px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '3px solid #ffd700',
        boxShadow: '0 0 40px rgba(255,215,0,0.4)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#ffd700', textAlign: 'center' }}>
          ⚔️ Create Your Hero
        </h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px' }}>
          Step {step} of 4
        </p>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#333',
          borderRadius: '10px',
          marginBottom: '30px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(step / 4) * 100}%`,
            height: '100%',
            backgroundColor: '#ffd700',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div>
            <h2 style={{ color: '#ffd700' }}>What is your name?</h2>
            <input
              type="text"
              value={characterData.name}
              onChange={(e) => setCharacterData({ ...characterData, name: e.target.value })}
              placeholder="Enter character name..."
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '20px',
                backgroundColor: '#2a2a2a',
                color: '#eee',
                border: '2px solid #444',
                borderRadius: '8px',
                marginBottom: '20px'
              }}
              autoFocus
            />

            <h3 style={{ color: '#ffd700', marginTop: '30px' }}>Background (Optional)</h3>
            <textarea
              value={characterData.background}
              onChange={(e) => setCharacterData({ ...characterData, background: e.target.value })}
              placeholder="Tell us about your character's past..."
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '16px',
                backgroundColor: '#2a2a2a',
                color: '#eee',
                border: '2px solid #444',
                borderRadius: '8px',
                minHeight: '100px',
                fontFamily: 'inherit'
              }}
            />
          </div>
        )}

        {/* Step 2: Race & Class */}
        {step === 2 && (
          <div>
            <h2 style={{ color: '#ffd700' }}>Choose your Race</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '10px',
              marginBottom: '30px'
            }}>
              {Object.keys(RACES).map(race => (
                <button
                  key={race}
                  onClick={() => setCharacterData({ ...characterData, race })}
                  style={{
                    padding: '20px',
                    backgroundColor: characterData.race === race ? '#ffd700' : '#2a2a2a',
                    color: characterData.race === race ? '#000' : '#eee',
                    border: characterData.race === race ? '3px solid #ffd700' : '2px solid #444',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: characterData.race === race ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  {race}
                </button>
              ))}
            </div>

            <h2 style={{ color: '#ffd700' }}>Choose your Class</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '10px'
            }}>
              {Object.keys(CLASSES).map(className => (
                <button
                  key={className}
                  onClick={() => setCharacterData({ ...characterData, className })}
                  style={{
                    padding: '20px',
                    backgroundColor: characterData.className === className ? '#ffd700' : '#2a2a2a',
                    color: characterData.className === className ? '#000' : '#eee',
                    border: characterData.className === className ? '3px solid #ffd700' : '2px solid #444',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: characterData.className === className ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  {className}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Ability Scores */}
        {step === 3 && (
          <div>
            <h2 style={{ color: '#ffd700' }}>Assign Ability Scores</h2>
            <p style={{ color: '#888', marginBottom: '20px' }}>
              Points remaining: <strong style={{ color: '#ffd700', fontSize: '20px' }}>{pointBuy}</strong> / 27
            </p>

            <button
              onClick={handleStandardArray}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              📊 Use Standard Array (15, 14, 13, 12, 10, 8)
            </button>

            <div style={{ display: 'grid', gap: '15px' }}>
              {Object.entries(characterData.abilityScores).map(([ability, score]) => {
                const modifier = getModifier(score);
                const racialBonus = RACES[characterData.race].abilityBonus[ability] || 0;
                const finalScore = score + racialBonus;
                const finalModifier = getModifier(finalScore);

                return (
                  <div key={ability} style={{
                    backgroundColor: '#2a2a2a',
                    padding: '15px',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '2px solid #444'
                  }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '18px', color: '#ffd700' }}>{ability}</strong>
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
                          width: '40px',
                          height: '40px',
                          fontSize: '20px',
                          backgroundColor: '#444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: score > 8 ? 'pointer' : 'not-allowed',
                          opacity: score > 8 ? 1 : 0.3
                        }}
                      >
                        −
                      </button>

                      <div style={{ textAlign: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffd700' }}>
                          {finalScore}
                        </div>
                        <div style={{ fontSize: '14px', color: '#888' }}>
                          {finalModifier >= 0 ? '+' : ''}{finalModifier}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAbilityChange(ability, score + 1)}
                        disabled={score >= 15 || pointBuy < (POINT_COSTS[score + 1] - POINT_COSTS[score])}
                        style={{
                          width: '40px',
                          height: '40px',
                          fontSize: '20px',
                          backgroundColor: '#444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: (score < 15 && pointBuy >= (POINT_COSTS[score + 1] - POINT_COSTS[score])) ? 'pointer' : 'not-allowed',
                          opacity: (score < 15 && pointBuy >= (POINT_COSTS[score + 1] - POINT_COSTS[score])) ? 1 : 0.3
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 style={{ color: '#ffd700' }}>Review Your Hero</h2>
            <div style={{
              backgroundColor: '#2a2a2a',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '20px',
              border: '2px solid #444'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#ffd700', fontSize: '24px' }}>
                {characterData.name}
              </h3>
              <p style={{ margin: '5px 0', fontSize: '18px' }}>
                Level 1 {characterData.race} {characterData.className}
              </p>
              {characterData.background && (
                <p style={{ margin: '10px 0 0 0', color: '#aaa', fontSize: '14px', fontStyle: 'italic' }}>
                  "{characterData.background}"
                </p>
              )}
            </div>

            <h3 style={{ color: '#ffd700' }}>Final Ability Scores</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px'
            }}>
              {Object.entries(characterData.abilityScores).map(([ability, score]) => {
                const racialBonus = RACES[characterData.race].abilityBonus[ability] || 0;
                const finalScore = score + racialBonus;
                const modifier = getModifier(finalScore);

                return (
                  <div key={ability} style={{
                    backgroundColor: '#2a2a2a',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '2px solid #444'
                  }}>
                    <div style={{ fontSize: '12px', color: '#aaa' }}>{ability}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700' }}>
                      {finalScore}
                    </div>
                    <div style={{ fontSize: '14px', color: '#888' }}>
                      {modifier >= 0 ? '+' : ''}{modifier}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '2px solid #444'
        }}>
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
            style={{
              padding: '12px 30px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          <button
            onClick={() => step < 4 ? setStep(step + 1) : handleComplete()}
            disabled={step === 1 && !characterData.name.trim()}
            style={{
              padding: '12px 30px',
              backgroundColor: step === 4 ? '#4CAF50' : '#ffd700',
              color: step === 4 ? 'white' : '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: (step === 1 && !characterData.name.trim()) ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: (step === 1 && !characterData.name.trim()) ? 0.5 : 1
            }}
          >
            {step === 4 ? '✓ Create Hero' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}