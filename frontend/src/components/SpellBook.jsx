// frontend/src/components/SpellBook.jsx
import { useState } from 'react';
import {
  SPELL_DATABASE,
  SPELL_SCHOOLS,
  getSpellsByLevel,
  getSpellSlots,
  canCastSpell,
  castSpell,
  castRitual,
  canRitualCast,
  getRitualSpells,
  RITUAL_CASTER_CLASSES,
  getSpellSaveDC,
  getSpellAttackBonus,
  getAvailableSpellLevels,
  usesPreparedSpells,
  usesKnownSpells,
  getAccessibleSpells,
  prepareSpells,
  learnSpell,
  SPELLCASTING_CLASSES,
  isWarlockPactMagic,
  getWarlockPactSlots,
  isThirdCaster,
  getRestrictedSchools,
  THIRD_CASTER_SUBCLASSES
} from '../utils/spellSystem';

export default function SpellBook({ character, onUpdateCharacter, onClose }) {
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterRitual, setFilterRitual] = useState(false);
  const [viewMode, setViewMode] = useState('available'); // 'available', 'all', 'prepared'
  const [preparingSpells, setPreparingSpells] = useState(false);
  const [selectedForPrep, setSelectedForPrep] = useState([]);

  const isSpellcaster = SPELLCASTING_CLASSES[character.class];
  const isWarlock         = isWarlockPactMagic(character);
  const isThirdCasterChar = isThirdCaster(character);
  const restrictedSchools = getRestrictedSchools(character); // null or ['Abjuration','Evocation'] etc.
  const canRitual         = RITUAL_CASTER_CLASSES.has(character.class);

  if (!isSpellcaster) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 3000
      }}>
        <div style={{
          backgroundColor: '#1a1a1a', padding: '40px', borderRadius: '15px',
          textAlign: 'center', border: '2px solid #444'
        }}>
          <h2 style={{ color: '#888', margin: '0 0 20px 0' }}>
            {character.name} is not a spellcaster
          </h2>
          <button onClick={onClose} className="btn btn-primary">Close</button>
        </div>
      </div>
    );
  }

  const spellSlots       = getSpellSlots(character);
  const currentSlots     = character.spellSlots?.current || spellSlots;
  const spellSaveDC      = getSpellSaveDC(character);
  const spellAttackBonus = getSpellAttackBonus(character);
  const accessibleSpells = getAccessibleSpells(character);
  const cantrips         = character.spells?.cantrips || [];
  const pactSlotInfo     = isWarlock ? getWarlockPactSlots(character) : null;

  // ─── Build display spell list ────────────────────────────────────────────
  let displaySpells = [];

  if (viewMode === 'available') {
    const cantripSpells = cantrips.map(key => ({ key, ...SPELL_DATABASE[key] })).filter(s => s.name);
    const leveledSpells = accessibleSpells
      .map(key => ({ key, ...SPELL_DATABASE[key] }))
      .filter(s => s.name && s.level > 0);
    displaySpells = [...cantripSpells, ...leveledSpells];
  } else if (viewMode === 'all') {
    displaySpells = Object.entries(SPELL_DATABASE).map(([key, spell]) => ({ key, ...spell }));
  } else if (viewMode === 'prepared') {
    const prepared = character.spells?.prepared || [];
    displaySpells = prepared.map(key => ({ key, ...SPELL_DATABASE[key] })).filter(s => s.name);
  } else if (viewMode === 'ritual') {
    displaySpells = getRitualSpells(character);
  }

  // Apply filters
  if (filterLevel !== 'all') {
    displaySpells = displaySpells.filter(spell => spell.level === parseInt(filterLevel));
  }
  if (filterSchool !== 'all') {
    displaySpells = displaySpells.filter(spell => spell.school === filterSchool);
  }
  if (filterRitual) {
    displaySpells = displaySpells.filter(spell => spell.ritual);
  }

  // Sort by level then name
  displaySpells.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.name.localeCompare(b.name);
  });

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleCastSpell = (spell, slotLevel = null) => {
    const result = castSpell(character, spell, slotLevel);
    if (result.success) {
      onUpdateCharacter(result.character);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleCastRitual = (spell) => {
    const result = castRitual(character, spell);
    if (result.success) {
      // No character state change — ritual doesn't consume a slot
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
      '#4CAF50', '#2196F3', '#03A9F4', '#00BCD4', '#009688',
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'
    ];
    return colors[level] || '#888';
  };

  const ritualSpellCount = getRitualSpells(character).length;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 3000, padding: '20px', overflow: 'auto'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a', borderRadius: '15px',
        border: '3px solid #9C27B0',
        maxWidth: '1200px', width: '100%', maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '20px', borderBottom: '2px solid #444',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#9C27B0' }}>📖 Spell Book</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#aaa' }}>
              Spell Save DC: <span style={{ color: '#ffd700' }}>{spellSaveDC}</span> •{' '}
              Spell Attack: <span style={{ color: '#ffd700' }}>+{spellAttackBonus}</span>
              {canRitual && (
                <span style={{ marginLeft: '12px', color: '#4CAF50', fontSize: '12px' }}>
                  📜 Ritual Caster
                </span>
              )}
              {isThirdCasterChar && restrictedSchools && (
                <span style={{ marginLeft: '12px', color: '#FF9800', fontSize: '12px' }}>
                  🔮 {character.subclass}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', backgroundColor: '#666', color: 'white',
              border: 'none', borderRadius: '5px', cursor: 'pointer'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* ── Spell Slots ── */}
        <div style={{ padding: '15px 20px', borderBottom: '2px solid #444', backgroundColor: '#0a0a0a' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: '#aaa', marginRight: '10px' }}>
              {isWarlock ? 'Pact Magic:' : 'Spell Slots:'}
            </span>

            {isWarlock ? (
              // Warlock pact slot display
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 14px', backgroundColor: '#1a0a2e',
                border: '2px solid #9C27B0', borderRadius: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>🔮</span>
                <div>
                  <div style={{ fontSize: '12px', color: '#CE93D8', fontWeight: 'bold' }}>
                    Level {pactSlotInfo.slotLevel} Pact Slots
                  </div>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    {currentSlots[pactSlotInfo.slotLevel - 1] || 0} / {pactSlotInfo.slotCount} remaining
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: pactSlotInfo.slotCount }).map((_, i) => (
                    <div key={i} style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      backgroundColor: i < (currentSlots[pactSlotInfo.slotLevel - 1] || 0) ? '#9C27B0' : '#333',
                      border: '1px solid #555'
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: '#666', marginLeft: '4px' }}>
                  Recovers on short rest
                </span>
              </div>
            ) : (
              spellSlots.map((max, index) => {
                if (max === 0) return null;
                const current = currentSlots[index] || 0;
                const level = index + 1;
                return (
                  <div key={index} style={{
                    padding: '8px 12px', backgroundColor: '#2a2a2a',
                    borderRadius: '5px', border: `2px solid ${getSpellLevelColor(level)}`,
                    minWidth: '60px', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '10px', color: '#888' }}>Level {level}</div>
                    <div style={{
                      fontSize: '16px', fontWeight: 'bold',
                      color: current > 0 ? getSpellLevelColor(level) : '#666'
                    }}>
                      {current}/{max}
                    </div>
                  </div>
                );
              })
            )}

            {usesPreparedSpells(character.class) && (
              <button
                onClick={() => setPreparingSpells(!preparingSpells)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: preparingSpells ? '#f44336' : '#9C27B0',
                  color: 'white', border: 'none', borderRadius: '5px',
                  cursor: 'pointer', marginLeft: 'auto'
                }}
              >
                {preparingSpells ? 'Cancel' : '📝 Prepare Spells'}
              </button>
            )}
          </div>
        </div>

        {/* ── View Mode Tabs + Filters ── */}
        <div style={{ padding: '15px 20px', borderBottom: '2px solid #444', backgroundColor: '#0a0a0a' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <button
              onClick={() => setViewMode('available')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'available' ? '#9C27B0' : '#2a2a2a',
                color: 'white', border: 'none', borderRadius: '5px',
                cursor: 'pointer', fontSize: '14px'
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
                  color: 'white', border: 'none', borderRadius: '5px',
                  cursor: 'pointer', fontSize: '14px'
                }}
              >
                Prepared ({(character.spells?.prepared || []).length})
              </button>
            )}

            {/* Ritual tab — only shown for ritual caster classes */}
            {canRitual && ritualSpellCount > 0 && (
              <button
                onClick={() => setViewMode('ritual')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: viewMode === 'ritual' ? '#2E7D32' : '#1a2a1a',
                  color: viewMode === 'ritual' ? 'white' : '#4CAF50',
                  border: `1px solid ${viewMode === 'ritual' ? '#4CAF50' : '#2a3a2a'}`,
                  borderRadius: '5px', cursor: 'pointer', fontSize: '14px'
                }}
              >
                📜 Rituals ({ritualSpellCount})
              </button>
            )}

            <button
              onClick={() => setViewMode('all')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'all' ? '#9C27B0' : '#2a2a2a',
                color: 'white', border: 'none', borderRadius: '5px',
                cursor: 'pointer', fontSize: '14px'
              }}
            >
              All Spells ({Object.keys(SPELL_DATABASE).length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={{
                padding: '8px 12px', backgroundColor: '#2a2a2a', color: '#eee',
                border: '1px solid #444', borderRadius: '5px', cursor: 'pointer'
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
                padding: '8px 12px', backgroundColor: '#2a2a2a', color: '#eee',
                border: '1px solid #444', borderRadius: '5px', cursor: 'pointer'
              }}
            >
              <option value="all">All Schools</option>
              {Object.values(SPELL_SCHOOLS).map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>

            {/* Ritual filter toggle — only for non-ritual view modes */}
            {canRitual && viewMode !== 'ritual' && (
              <button
                onClick={() => setFilterRitual(r => !r)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: filterRitual ? '#2E7D32' : '#1a2a1a',
                  color: filterRitual ? 'white' : '#4CAF50',
                  border: `1px solid ${filterRitual ? '#4CAF50' : '#2a3a2a'}`,
                  borderRadius: '5px', cursor: 'pointer', fontSize: '13px'
                }}
              >
                📜 {filterRitual ? 'Showing Rituals' : 'Filter: Rituals'}
              </button>
            )}
          </div>

          {/* Restricted school notice for Eldritch Knight / Arcane Trickster */}
          {isThirdCasterChar && restrictedSchools && (
            <div style={{
              marginTop: '10px', padding: '10px 14px',
              backgroundColor: 'rgba(255,152,0,0.08)',
              border: '1px solid #FF9800', borderRadius: '8px',
              fontSize: '13px', color: '#FFB74D',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '18px' }}>🔮</span>
              <div>
                <strong>{character.subclass}</strong> — spell selection is restricted to{' '}
                <strong>{restrictedSchools.join(' and ')}</strong> schools,
                plus 2 spells of any school total.
                {character.level < 3 && (
                  <span style={{ marginLeft: '8px', color: '#888' }}>
                    (Spell slots unlock at level 3)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Main Content ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Spell List */}
          <div style={{
            width: '40%', borderRight: '2px solid #444',
            overflowY: 'auto', padding: '15px'
          }}>
            {displaySpells.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                color: '#888', fontStyle: 'italic'
              }}>
                {viewMode === 'ritual'
                  ? 'No ritual spells available. Learn spells with the [R] tag.'
                  : 'No spells found'}
              </div>
            ) : (
              displaySpells.map((spell) => {
                const isAccessible = cantrips.includes(spell.key) || accessibleSpells.includes(spell.key);
                const canCast      = canCastSpell(character, spell);
                const canRit       = canRitualCast(character, spell);
                const isPreparing  = preparingSpells && usesPreparedSpells(character.class);
                const isSelected   = selectedForPrep.includes(spell.key);

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
                      padding: '15px', marginBottom: '10px',
                      backgroundColor: selectedSpell?.key === spell.key ? '#2a2a2a' : '#1a1a1a',
                      border: isSelected
                        ? '2px solid #ffd700'
                        : selectedSpell?.key === spell.key
                          ? '2px solid #9C27B0'
                          : '2px solid #444',
                      borderRadius: '8px', cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: (() => {
                        if (!isAccessible && viewMode !== 'all' && viewMode !== 'ritual') return 0.5;
                        // Dim spells outside restricted schools for EK/AT (visual hint only, not enforced)
                        if (isThirdCasterChar && restrictedSchools && spell.level > 0 && spell.school) {
                          const allowed = restrictedSchools.map(s => s.toLowerCase());
                          if (!allowed.includes(spell.school.toLowerCase())) return 0.6;
                        }
                        return 1;
                      })()
                    }}
                  >
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'start', marginBottom: '8px'
                    }}>
                      <div style={{
                        fontSize: '16px', fontWeight: 'bold',
                        color: getSpellLevelColor(spell.level)
                      }}>
                        {isPreparing && isSelected && '✓ '}
                        {spell.name}
                        {/* [R] ritual tag */}
                        {spell.ritual && (
                          <span style={{
                            marginLeft: '8px', fontSize: '11px',
                            color: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.15)',
                            padding: '1px 5px', borderRadius: '4px',
                            border: '1px solid #2E7D32', fontWeight: 'normal'
                          }}>R</span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '12px', color: getSpellLevelColor(spell.level),
                        backgroundColor: '#0a0a0a', padding: '2px 8px',
                        borderRadius: '10px', fontWeight: 'bold'
                      }}>
                        {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>
                      {spell.school}
                    </div>
                    {spell.concentration && (
                      <div style={{ fontSize: '11px', color: '#ff9800' }}>⏱️ Concentration</div>
                    )}
                    {!canCast && spell.level > 0 && !canRit && (
                      <div style={{ fontSize: '11px', color: '#f44336', marginTop: '5px' }}>
                        No slots remaining
                      </div>
                    )}
                    {!canCast && spell.level > 0 && canRit && (
                      <div style={{ fontSize: '11px', color: '#4CAF50', marginTop: '5px' }}>
                        📜 Ritual available
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Spell Details */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {preparingSpells ? (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#9C27B0' }}>Preparing Spells</h3>
                <p style={{ color: '#aaa', marginBottom: '20px' }}>
                  Select spells from the list. You can prepare{' '}
                  {Math.max(1, character.level + Math.floor((character.abilities.INT - 10) / 2))} spells.
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
                    color: 'white', border: 'none', borderRadius: '8px',
                    cursor: selectedForPrep.length > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '16px', fontWeight: 'bold'
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
                onCastRitual={canRitualCast(character, selectedSpell) ? handleCastRitual : null}
                onLearn={viewMode === 'all' && usesKnownSpells(character.class) ? handleLearnSpell : null}
                isWarlock={isWarlock}
                pactSlotInfo={pactSlotInfo}
                isThirdCaster={isThirdCasterChar}
                restrictedSchools={restrictedSchools}
              />
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: '#888', fontStyle: 'italic'
              }}>
                {viewMode === 'ritual'
                  ? 'Select a ritual spell to cast it without using a spell slot'
                  : 'Select a spell to view details'}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SpellDetails sub-component
// ─────────────────────────────────────────────────────────────────────────────
function SpellDetails({ spell, character, onCast, onCastRitual, onLearn, isWarlock, pactSlotInfo, isThirdCaster, restrictedSchools }) {
  const [upcastLevel, setUpcastLevel] = useState(spell.level);
  const canCast      = canCastSpell(character, spell);
  const slots        = getSpellSlots(character);
  const currentSlots = character.spellSlots?.current || slots;

  // Available upcasting levels (hidden for Warlocks — they always use pact level)
  const availableLevels = [];
  if (!isWarlock) {
    for (let i = spell.level; i <= 9; i++) {
      if (i === 0) continue;
      if ((currentSlots[i - 1] || 0) > 0) availableLevels.push(i);
    }
  }

  const getSpellLevelColor = (level) => {
    const colors = ['#4CAF50','#2196F3','#03A9F4','#00BCD4','#009688','#8BC34A','#CDDC39','#FFEB3B','#FFC107','#FF9800'];
    return colors[level] || '#888';
  };

  return (
    <div>
      {/* Name + ritual badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <h2 style={{ margin: 0, color: getSpellLevelColor(spell.level) }}>
          {spell.name}
        </h2>
        {spell.ritual && (
          <span style={{
            padding: '3px 10px', backgroundColor: 'rgba(76,175,80,0.15)',
            border: '1px solid #4CAF50', borderRadius: '12px',
            color: '#4CAF50', fontSize: '12px', fontWeight: 'bold'
          }}>
            📜 Ritual
          </span>
        )}
        {spell.concentration && (
          <span style={{
            padding: '3px 10px', backgroundColor: 'rgba(255,152,0,0.15)',
            border: '1px solid #ff9800', borderRadius: '12px',
            color: '#ff9800', fontSize: '12px'
          }}>
            ⏱️ Concentration
          </span>
        )}
      </div>

      <div style={{
        display: 'inline-block', padding: '5px 15px', backgroundColor: '#2a2a2a',
        borderRadius: '15px', marginBottom: '15px', border: '1px solid #444'
      }}>
        <span style={{ color: '#888' }}>
          {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
        </span>
        <span style={{ color: '#888', marginLeft: '10px' }}>• {spell.school}</span>
      </div>

      {/* Stats block */}
      <div style={{
        backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px',
        marginBottom: '20px', border: '1px solid #444'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: '#888' }}>Casting Time: </span>
          <span style={{ color: '#eee' }}>{spell.castingTime}</span>
          {spell.ritual && (
            <span style={{ color: '#4CAF50', marginLeft: '10px', fontSize: '12px' }}>
              (+10 min as ritual)
            </span>
          )}
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
        </div>
      </div>

      <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '20px' }}>
        {spell.description}
      </p>

      {/* Restricted school hint for EK / AT */}
      {isThirdCaster && restrictedSchools && spell.level > 0 && spell.school && (
        (() => {
          const allowed = restrictedSchools.map(s => s.toLowerCase());
          const inSchool = allowed.includes(spell.school.toLowerCase());
          return (
            <div style={{
              marginBottom: '16px', padding: '8px 12px',
              backgroundColor: inSchool ? 'rgba(76,175,80,0.08)' : 'rgba(255,152,0,0.08)',
              border: `1px solid ${inSchool ? '#4CAF50' : '#FF9800'}`,
              borderRadius: '6px', fontSize: '12px',
              color: inSchool ? '#81C784' : '#FFB74D'
            }}>
              {inSchool
                ? `✓ ${spell.school} is one of your restricted schools — you can learn this spell normally.`
                : `⚠️ ${spell.school} is outside your restricted schools. You can only learn this as one of your 2 free-choice spells.`}
            </div>
          );
        })()
      )}

      {/* Damage block */}
      {spell.damage && (
        <div style={{
          backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px',
          marginBottom: '20px', border: '1px solid #444'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#f44336' }}>💥 Damage</h4>
          <div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>
              {spell.damage}
            </span>
            <span style={{ color: '#888', marginLeft: '10px' }}>{spell.damageType}</span>
          </div>
          {spell.upcastBonus && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#aaa' }}>
              Upcast: {spell.upcastBonus}
            </div>
          )}
        </div>
      )}

      {/* Healing block */}
      {spell.healing && (
        <div style={{
          backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px',
          marginBottom: '20px', border: '1px solid #444'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>💚 Healing</h4>
          <div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
              {spell.healing}
            </span>
            <span style={{ color: '#888', marginLeft: '10px' }}>+ spellcasting modifier</span>
          </div>
          {spell.upcastBonus && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#aaa' }}>
              Upcast: {spell.upcastBonus}
            </div>
          )}
        </div>
      )}

      {/* Warlock pact info (no upcast choice) */}
      {isWarlock && spell.level > 0 && (
        <div style={{
          padding: '10px 14px', marginBottom: '16px',
          backgroundColor: 'rgba(156,39,176,0.1)', border: '1px solid #6A1B9A',
          borderRadius: '8px', fontSize: '13px', color: '#CE93D8'
        }}>
          🔮 Pact Magic: always casts at level <strong>{pactSlotInfo.slotLevel}</strong> — no slot level choice
        </div>
      )}

      {/* Upcast selector — non-Warlocks only */}
      {!isWarlock && spell.level > 0 && availableLevels.length > 1 && (
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
                  border: 'none', borderRadius: '5px', cursor: 'pointer',
                  fontWeight: upcastLevel === level ? 'bold' : 'normal'
                }}
              >
                Level {level} ({currentSlots[level - 1]} left)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>

        {/* Normal cast */}
        {spell.level === 0 || canCast ? (
          <button
            onClick={() => onCast(spell, spell.level > 0 ? upcastLevel : null)}
            style={{
              padding: '12px 24px', backgroundColor: '#9C27B0', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '16px', fontWeight: 'bold'
            }}
          >
            ✨ Cast {spell.name}
            {isWarlock && spell.level > 0 && ` (Pact Lvl ${pactSlotInfo.slotLevel})`}
          </button>
        ) : (
          // Out of slots — show disabled cast button, but ritual may still be available below
          !onCastRitual && (
            <div style={{
              padding: '12px 24px', backgroundColor: '#444', color: '#888',
              borderRadius: '8px', textAlign: 'center',
              fontSize: '16px', fontWeight: 'bold'
            }}>
              No Spell Slots Remaining
            </div>
          )
        )}

        {/* Ritual cast button — shown when available regardless of slots */}
        {onCastRitual && spell.ritual && (
          <div>
            <button
              onClick={() => onCastRitual(spell)}
              style={{
                width: '100%', padding: '12px 24px',
                backgroundColor: '#1b3a1b', color: '#4CAF50',
                border: '2px solid #4CAF50', borderRadius: '8px',
                cursor: 'pointer', fontSize: '15px', fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              📜 Cast as Ritual
            </button>
            <div style={{
              marginTop: '8px', padding: '8px 12px',
              backgroundColor: 'rgba(76,175,80,0.08)',
              border: '1px solid #2E7D32', borderRadius: '6px',
              fontSize: '12px', color: '#81C784'
            }}>
              ⏱️ Takes 10 minutes — no spell slot consumed
            </div>
          </div>
        )}

        {/* Learn spell (All Spells view) */}
        {onLearn && (
          <button
            onClick={() => onLearn(spell.key)}
            style={{
              padding: '12px 24px', backgroundColor: '#2196F3', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
            }}
          >
            📚 Learn This Spell
          </button>
        )}
      </div>
    </div>
  );
}