// frontend/src/components/SpellBook.jsx
import { useState } from 'react';
import { 
  SPELL_DATABASE, 
  SPELL_SCHOOLS,
  getSpellsByLevel,
  getSpellSlots,
  canCastSpell,
  castSpell,
  getSpellSaveDC,
  getSpellAttackBonus,
  getAvailableSpellLevels,
  usesPreparedSpells,
  usesKnownSpells,
  getAccessibleSpells,
  prepareSpells,
  learnSpell,
  SPELLCASTING_CLASSES
} from '../utils/spellSystem';

export default function SpellBook({ character, onUpdateCharacter, onClose }) {
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [viewMode, setViewMode] = useState('available'); // 'available', 'all', 'prepared'
  const [preparingSpells, setPreparingSpells] = useState(false);
  const [selectedForPrep, setSelectedForPrep] = useState([]);

  // Check if character is a spellcaster
  const isSpellcaster = SPELLCASTING_CLASSES[character.class];
  
  if (!isSpellcaster) {
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
        zIndex: 3000
      }}>
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '40px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '2px solid #444'
        }}>
          <h2 style={{ color: '#888', margin: '0 0 20px 0' }}>
            {character.name} is not a spellcaster
          </h2>
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    );
  }

  const spellSlots = getSpellSlots(character);
  const currentSlots = character.spellSlots?.current || spellSlots;
  const spellSaveDC = getSpellSaveDC(character);
  const spellAttackBonus = getSpellAttackBonus(character);
  const accessibleSpells = getAccessibleSpells(character);
  const cantrips = character.spells?.cantrips || [];

  // Get all spells or filtered
  let displaySpells = [];
  
  if (viewMode === 'available') {
    // Show cantrips + accessible spells
    const cantripSpells = cantrips.map(key => ({ key, ...SPELL_DATABASE[key] }));
    const leveledSpells = accessibleSpells
      .map(key => ({ key, ...SPELL_DATABASE[key] }))
      .filter(spell => spell.level > 0);
    displaySpells = [...cantripSpells, ...leveledSpells];
  } else if (viewMode === 'all') {
    // Show all spells in database
    displaySpells = Object.entries(SPELL_DATABASE).map(([key, spell]) => ({ key, ...spell }));
  } else if (viewMode === 'prepared') {
    // Show only prepared spells
    const prepared = character.spells?.prepared || [];
    displaySpells = prepared.map(key => ({ key, ...SPELL_DATABASE[key] }));
  }

  // Apply filters
  if (filterLevel !== 'all') {
    displaySpells = displaySpells.filter(spell => spell.level === parseInt(filterLevel));
  }
  
  if (filterSchool !== 'all') {
    displaySpells = displaySpells.filter(spell => spell.school === filterSchool);
  }

  // Sort by level then name
  displaySpells.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.name.localeCompare(b.name);
  });

  const handleCastSpell = (spell, slotLevel = null) => {
    const result = castSpell(character, spell, slotLevel);
    
    if (result.success) {
      onUpdateCharacter(result.character);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleLearnSpell = (spellKey) => {
    const result = learnSpell(character, spellKey);
    if (result.success) {
      onUpdateCharacter(result.character);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handlePrepareSpells = () => {
    const result = prepareSpells(character, selectedForPrep);
    if (result.success) {
      onUpdateCharacter(result.character);
      setPreparingSpells(false);
      setSelectedForPrep([]);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const getSpellLevelColor = (level) => {
    const colors = [
      '#4CAF50', // 0 - Cantrip (green)
      '#2196F3', // 1 (blue)
      '#03A9F4', // 2 (light blue)
      '#00BCD4', // 3 (cyan)
      '#009688', // 4 (teal)
      '#8BC34A', // 5 (light green)
      '#CDDC39', // 6 (lime)
      '#FFEB3B', // 7 (yellow)
      '#FFC107', // 8 (amber)
      '#FF9800'  // 9 (orange)
    ];
    return colors[level] || '#888';
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
        border: '3px solid #9C27B0',
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
          <div>
            <h2 style={{ margin: 0, color: '#9C27B0' }}>📖 Spell Book</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#aaa' }}>
              Spell Save DC: <span style={{ color: '#ffd700' }}>{spellSaveDC}</span> • 
              Spell Attack: <span style={{ color: '#ffd700' }}>+{spellAttackBonus}</span>
            </p>
          </div>
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

        {/* Spell Slots */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '2px solid #444',
          backgroundColor: '#0a0a0a'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: '#aaa', marginRight: '10px' }}>Spell Slots:</span>
            {spellSlots.map((max, index) => {
              if (max === 0) return null;
              const current = currentSlots[index] || 0;
              const level = index + 1;
              
              return (
                <div key={index} style={{
                  padding: '8px 12px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '5px',
                  border: `2px solid ${getSpellLevelColor(level)}`,
                  minWidth: '60px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: '#888' }}>Level {level}</div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    color: current > 0 ? getSpellLevelColor(level) : '#666'
                  }}>
                    {current}/{max}
                  </div>
                </div>
              );
            })}
            
            {usesPreparedSpells(character.class) && (
              <button
                onClick={() => setPreparingSpells(!preparingSpells)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: preparingSpells ? '#f44336' : '#9C27B0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                {preparingSpells ? 'Cancel' : '📝 Prepare Spells'}
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '2px solid #444',
          backgroundColor: '#0a0a0a'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <button
              onClick={() => setViewMode('available')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'available' ? '#9C27B0' : '#2a2a2a',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              My Spells ({cantrips.length + accessibleSpells.length})
            </button>
            
            {usesPreparedSpells(character.class) && (
              <button
                onClick={() => setViewMode('prepared')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: viewMode === 'prepared' ? '#9C27B0' : '#2a2a2a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Prepared ({(character.spells?.prepared || []).length})
              </button>
            )}
            
            <button
              onClick={() => setViewMode('all')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'all' ? '#9C27B0' : '#2a2a2a',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              All Spells ({Object.keys(SPELL_DATABASE).length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#2a2a2a',
                color: '#eee',
                border: '1px solid #444',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Levels</option>
              <option value="0">Cantrips</option>
              {[1,2,3,4,5,6,7,8,9].map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>

            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#2a2a2a',
                color: '#eee',
                border: '1px solid #444',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Schools</option>
              {Object.values(SPELL_SCHOOLS).map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Spell List */}
          <div style={{
            width: '40%',
            borderRight: '2px solid #444',
            overflowY: 'auto',
            padding: '15px'
          }}>
            {displaySpells.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#888',
                fontStyle: 'italic'
              }}>
                No spells found
              </div>
            ) : (
              displaySpells.map((spell) => {
                const isAccessible = cantrips.includes(spell.key) || accessibleSpells.includes(spell.key);
                const canCast = canCastSpell(character, spell);
                const isPreparing = preparingSpells && usesPreparedSpells(character.class);
                const isSelected = selectedForPrep.includes(spell.key);
                
                return (
                  <div
                    key={spell.key}
                    onClick={() => {
                      if (isPreparing && spell.level > 0) {
                        setSelectedForPrep(prev =>
                          prev.includes(spell.key)
                            ? prev.filter(k => k !== spell.key)
                            : [...prev, spell.key]
                        );
                      } else {
                        setSelectedSpell(spell);
                      }
                    }}
                    style={{
                      padding: '15px',
                      marginBottom: '10px',
                      backgroundColor: selectedSpell?.key === spell.key ? '#2a2a2a' : '#1a1a1a',
                      border: isSelected ? '2px solid #ffd700' : selectedSpell?.key === spell.key ? '2px solid #9C27B0' : '2px solid #444',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: !isAccessible && viewMode !== 'all' ? 0.5 : 1
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
                        color: getSpellLevelColor(spell.level)
                      }}>
                        {isPreparing && isSelected && '✓ '}
                        {spell.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: getSpellLevelColor(spell.level),
                        backgroundColor: '#0a0a0a',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 'bold'
                      }}>
                        {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>
                      {spell.school}
                    </div>
                    {spell.concentration && (
                      <div style={{ fontSize: '11px', color: '#ff9800' }}>
                        ⏱️ Concentration
                      </div>
                    )}
                    {!canCast && spell.level > 0 && (
                      <div style={{ fontSize: '11px', color: '#f44336', marginTop: '5px' }}>
                        No slots remaining
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Spell Details */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px'
          }}>
            {preparingSpells ? (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#9C27B0' }}>Preparing Spells</h3>
                <p style={{ color: '#aaa', marginBottom: '20px' }}>
                  Select spells from the list. You can prepare {Math.max(1, character.level + Math.floor((character.abilities.INT - 10) / 2))} spells.
                </p>
                <p style={{ fontSize: '18px', color: '#ffd700', marginBottom: '20px' }}>
                  Selected: {selectedForPrep.length}
                </p>
                <button
                  onClick={handlePrepareSpells}
                  disabled={selectedForPrep.length === 0}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: selectedForPrep.length > 0 ? '#4CAF50' : '#444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: selectedForPrep.length > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Confirm Preparation
                </button>
              </div>
            ) : selectedSpell ? (
              <SpellDetails 
                spell={selectedSpell} 
                character={character}
                onCast={handleCastSpell}
                onLearn={viewMode === 'all' && usesKnownSpells(character.class) ? handleLearnSpell : null}
              />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Select a spell to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Spell Details Component
function SpellDetails({ spell, character, onCast, onLearn }) {
  const [upcastLevel, setUpcastLevel] = useState(spell.level);
  const canCast = canCastSpell(character, spell);
  const slots = getSpellSlots(character);
  const currentSlots = character.spellSlots?.current || slots;
  
  // Available upcasting levels
  const availableLevels = [];
  for (let i = spell.level; i <= 9; i++) {
    if (i === 0) continue; // Skip cantrips
    if (currentSlots[i - 1] > 0) {
      availableLevels.push(i);
    }
  }

  const getSpellLevelColor = (level) => {
    const colors = ['#4CAF50', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'];
    return colors[level] || '#888';
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 10px 0', color: getSpellLevelColor(spell.level) }}>
        {spell.name}
      </h2>
      
      <div style={{
        display: 'inline-block',
        padding: '5px 15px',
        backgroundColor: '#2a2a2a',
        borderRadius: '15px',
        marginBottom: '15px',
        border: '1px solid #444'
      }}>
        <span style={{ color: '#888' }}>
          {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
        </span>
        <span style={{ color: '#888', marginLeft: '10px' }}>• {spell.school}</span>
      </div>

      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #444'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: '#888' }}>Casting Time: </span>
          <span style={{ color: '#eee' }}>{spell.castingTime}</span>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: '#888' }}>Range: </span>
          <span style={{ color: '#eee' }}>{spell.range}</span>
</div>
<div style={{ marginBottom: '10px' }}>
<span style={{ color: '#888' }}>Components: </span>
<span style={{ color: '#eee' }}>{spell.components}</span>
</div>
<div>
<span style={{ color: '#888' }}>Duration: </span>
<span style={{ color: '#eee' }}>{spell.duration}</span>
{spell.concentration && <span style={{ color: '#ff9800', marginLeft: '10px' }}>⏱️ Concentration</span>}
</div>
</div><p style={{
    color: '#ccc',
    lineHeight: '1.6',
    marginBottom: '20px'
  }}>
    {spell.description}
  </p>

  {spell.damage && (
    <div style={{
      backgroundColor: '#2a2a2a',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #444'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#f44336' }}>💥 Damage</h4>
      <div>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>
          {spell.damage}
        </span>
        <span style={{ color: '#888', marginLeft: '10px' }}>
          {spell.damageType}
        </span>
      </div>
      {spell.upcastBonus && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#aaa' }}>
          Upcast: {spell.upcastBonus}
        </div>
      )}
    </div>
  )}

  {spell.healing && (
    <div style={{
      backgroundColor: '#2a2a2a',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #444'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>💚 Healing</h4>
      <div>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
          {spell.healing}
        </span>
        <span style={{ color: '#888', marginLeft: '10px' }}>
          + spellcasting modifier
        </span>
      </div>
      {spell.upcastBonus && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#aaa' }}>
          Upcast: {spell.upcastBonus}
        </div>
      )}
    </div>
  )}

  {/* Upcasting */}
  {spell.level > 0 && availableLevels.length > 1 && (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '10px', color: '#aaa' }}>
        Cast at level:
      </label>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {availableLevels.map(level => (
          <button
            key={level}
            onClick={() => setUpcastLevel(level)}
            style={{
              padding: '8px 16px',
              backgroundColor: upcastLevel === level ? getSpellLevelColor(level) : '#2a2a2a',
              color: upcastLevel === level ? '#000' : '#eee',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: upcastLevel === level ? 'bold' : 'normal'
            }}
          >
            Level {level} ({currentSlots[level - 1]} left)
          </button>
        ))}
      </div>
    </div>
  )}

  {/* Actions */}
  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
    {spell.level === 0 || canCast ? (
      <button
        onClick={() => onCast(spell, spell.level > 0 ? upcastLevel : null)}
        style={{
          padding: '12px 24px',
          backgroundColor: '#9C27B0',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        ✨ Cast {spell.name}
      </button>
    ) : (
      <div style={{
        padding: '12px 24px',
        backgroundColor: '#444',
        color: '#888',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        No Spell Slots Remaining
      </div>
    )}

    {onLearn && (
      <button
        onClick={() => onLearn(spell.key)}
        style={{
          padding: '12px 24px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        📚 Learn This Spell
      </button>
    )}
  </div>
</div>);
}