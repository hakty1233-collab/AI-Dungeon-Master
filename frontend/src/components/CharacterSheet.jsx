// frontend/src/components/CharacterSheet.jsx - FIXED FOR STATUS EFFECTS
import { useState } from "react";
import { 
  getModifier, 
  getSkillModifier, 
  getSavingThrowModifier,
  SKILLS,
  PROFICIENCY_BONUS,
  XP_TABLE
} from "../utils/characterSystem";

export default function CharacterSheet({ character, onUpdate, onClose }) {
  const [activeTab, setActiveTab] = useState('stats');

  if (!character) return null;

  const profBonus = PROFICIENCY_BONUS[character.level - 1];
  const nextLevelXp = XP_TABLE[character.level] || XP_TABLE[XP_TABLE.length - 1];
  const xpProgress = ((character.xp - (XP_TABLE[character.level - 1] || 0)) / 
                      (nextLevelXp - (XP_TABLE[character.level - 1] || 0))) * 100;

  const tabs = [
    { id: 'stats', name: '📊 Stats', icon: '📊' },
    { id: 'skills', name: '🎯 Skills', icon: '🎯' },
    { id: 'combat', name: '⚔️ Combat', icon: '⚔️' },
    { id: 'features', name: '✨ Features', icon: '✨' },
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
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
        border: '3px solid #ffd700',
        boxShadow: '0 0 30px rgba(255,215,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: '2px solid #444'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#ffd700', fontSize: '32px' }}>
              {character.name}
            </h1>
            <p style={{ margin: '5px 0', color: '#aaa', fontSize: '16px' }}>
              Level {character.level} {character.race} {character.class}
            </p>
            {character.background && (
              <p style={{ margin: '5px 0', color: '#888', fontSize: '14px' }}>
                {character.background}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* XP Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>XP: {character.xp} / {nextLevelXp}</span>
            <span>Proficiency: +{profBonus}</span>
          </div>
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #555'
          }}>
            <div style={{
              width: `${Math.min(100, xpProgress)}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* HP Bar */}
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#2a2a2a',
          borderRadius: '10px',
          border: '2px solid #d32f2f'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>❤️ Hit Points</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>
              {character.hp} / {character.maxHp}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '30px',
            backgroundColor: '#1a1a1a',
            borderRadius: '15px',
            overflow: 'hidden',
            border: '2px solid #444'
          }}>
            <div style={{
              width: `${(character.hp / character.maxHp) * 100}%`,
              height: '100%',
              backgroundColor: character.hp > character.maxHp * 0.5 ? '#4CAF50' : 
                              character.hp > character.maxHp * 0.25 ? '#ff9800' : '#f44336',
              transition: 'width 0.3s ease, background-color 0.3s ease'
            }} />
          </div>
          {character.tempHp > 0 && (
            <p style={{ margin: '8px 0 0 0', color: '#64B5F6' }}>
              🛡️ Temp HP: {character.tempHp}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '2px solid #444',
          paddingBottom: '10px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === tab.id ? '#ffd700' : '#333',
                color: activeTab === tab.id ? '#000' : '#eee',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                fontSize: '16px',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.name.split(' ')[1]}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '300px' }}>
          {activeTab === 'stats' && <StatsTab character={character} />}
          {activeTab === 'skills' && <SkillsTab character={character} />}
          {activeTab === 'combat' && <CombatTab character={character} />}
          {activeTab === 'features' && <FeaturesTab character={character} />}
        </div>
      </div>
    </div>
  );
}

// Stats Tab
function StatsTab({ character }) {
  const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  const profBonus = PROFICIENCY_BONUS[character.level - 1];

  return (
    <div>
      <h3 style={{ color: '#ffd700', marginTop: 0 }}>Ability Scores</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        {abilities.map(ability => {
          const score = character.abilities[ability];
          const modifier = getModifier(score);
          const savingThrow = getSavingThrowModifier(character, ability);
          const isProficient = character.proficiencies.savingThrows.includes(ability);

          return (
            <div key={ability} style={{
              backgroundColor: '#2a2a2a',
              padding: '15px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '2px solid #444'
            }}>
              <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>
                {ability}
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#ffd700',
                marginBottom: '5px'
              }}>
                {modifier >= 0 ? '+' : ''}{modifier}
              </div>
              <div style={{ fontSize: '16px', color: '#888' }}>
                ({score})
              </div>
              <div style={{
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid #444',
                fontSize: '12px',
                color: isProficient ? '#4CAF50' : '#888'
              }}>
                Save: {savingThrow >= 0 ? '+' : ''}{savingThrow}
                {isProficient && ' ✓'}
              </div>
            </div>
          );
        })}
      </div>

      <h3 style={{ color: '#ffd700' }}>Hit Dice</h3>
      <p style={{ fontSize: '18px' }}>
        🎲 {character.hitDice.current} / {character.hitDice.max} d{character.hitDice.die}
      </p>
    </div>
  );
}

// Skills Tab
function SkillsTab({ character }) {
  return (
    <div>
      <h3 style={{ color: '#ffd700', marginTop: 0 }}>Skills</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '10px'
      }}>
        {Object.entries(SKILLS).map(([skill, ability]) => {
          const modifier = getSkillModifier(character, skill);
          const isProficient = character.proficiencies.skills.includes(skill);

          return (
            <div
              key={skill}
              style={{
                backgroundColor: '#2a2a2a',
                padding: '12px 15px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: isProficient ? '2px solid #4CAF50' : '1px solid #444'
              }}
            >
              <span style={{ color: isProficient ? '#4CAF50' : '#eee' }}>
                {isProficient && '✓ '}{skill}
                <span style={{ color: '#888', fontSize: '12px', marginLeft: '5px' }}>
                  ({ability})
                </span>
              </span>
              <span style={{
                fontWeight: 'bold',
                color: '#ffd700',
                fontSize: '18px'
              }}>
                {modifier >= 0 ? '+' : ''}{modifier}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Combat Tab - FIXED
function CombatTab({ character }) {
  return (
    <div>
      <h3 style={{ color: '#ffd700', marginTop: 0 }}>Combat Stats</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        <StatBox label="Armor Class" value={character.armorClass} />
        <StatBox label="Initiative" value={`+${character.initiative}`} />
        <StatBox label="Speed" value={`${character.speed} ft`} />
        <StatBox 
          label="Passive Perception" 
          value={10 + getSkillModifier(character, 'Perception')} 
        />
      </div>

      {/* Status Effects - FIXED */}
      {character.conditions && character.conditions.length > 0 && (
        <>
          <h3 style={{ color: '#ffd700', marginTop: '30px' }}>Status Effects</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {character.conditions.map((condition) => (
              <span 
                key={condition.id} 
                style={{
                  backgroundColor: condition.color || '#9C27B0',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {condition.icon} {condition.name}
                {condition.stackCount > 1 && ` x${condition.stackCount}`}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Exhaustion */}
      {character.exhaustion > 0 && (
        <>
          <h3 style={{ color: '#ffd700', marginTop: '30px' }}>Exhaustion</h3>
          <div style={{
            padding: '15px',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            border: '2px solid #616161'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#616161', marginBottom: '10px' }}>
              Level {character.exhaustion}
            </div>
            <div style={{ fontSize: '14px', color: '#ccc' }}>
              {character.exhaustion >= 1 && <div>• Disadvantage on ability checks</div>}
              {character.exhaustion >= 2 && <div>• Speed halved</div>}
              {character.exhaustion >= 3 && <div>• Disadvantage on attacks and saves</div>}
              {character.exhaustion >= 4 && <div>• HP maximum halved</div>}
              {character.exhaustion >= 5 && <div>• Speed reduced to 0</div>}
              {character.exhaustion >= 6 && <div style={{ color: '#f44336' }}>• Death</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Features Tab
function FeaturesTab({ character }) {
  return (
    <div>
      <h3 style={{ color: '#ffd700', marginTop: 0 }}>Features & Traits</h3>
      {character.features.length === 0 && character.traits.length === 0 ? (
        <p style={{ color: '#888', fontStyle: 'italic' }}>
          No features or traits yet. These will be added as you level up!
        </p>
      ) : (
        <>
          {character.features.map((feature, i) => (
            <div key={i} style={{
              backgroundColor: '#2a2a2a',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '10px',
              border: '1px solid #444'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#ffd700' }}>{feature.name}</h4>
              <p style={{ margin: 0, color: '#ccc' }}>{feature.description}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// Helper component
function StatBox({ label, value }) {
  return (
    <div style={{
      backgroundColor: '#2a2a2a',
      padding: '20px',
      borderRadius: '10px',
      textAlign: 'center',
      border: '2px solid #444'
    }}>
      <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffd700' }}>
        {value}
      </div>
    </div>
  );
}