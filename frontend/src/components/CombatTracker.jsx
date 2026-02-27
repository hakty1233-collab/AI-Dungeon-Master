// frontend/src/components/CombatTracker.jsx - WITH SPELL DAMAGE + CONCENTRATION TRACKING + REST SYSTEM
import { useState } from 'react';
import {
  executeAttack,
  nextTurn,
  checkCombatEnd,
  getCurrentCombatant,
  updateCombatant,
  applyDamage
} from '../utils/combatSystem';
import {
  SPELL_DATABASE,
  getSpellSlots,
  canCastSpell,
  castSpell,
  shortRest,
  getSpellAttackBonus,
  getSpellSaveDC,
  calculateSpellDamage,
  rollSpellDamage,
  SPELLCASTING_CLASSES,
  isWarlockPactMagic,
  getWarlockPactSlots
} from '../utils/spellSystem';
import {
  createStatusEffect,
  applyStatusEffect,
  STATUS_EFFECTS,
  DURATION_TYPES
} from '../utils/statusEffectSystem';
import { shortRest as characterShortRest } from '../utils/characterSystem';

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

const CONCENTRATION_SPELLS = new Set([
  'bless','bane','faerie_fire','fog_cloud','guiding_bolt','hold_person',
  'invisibility','magic_weapon','mirror_image','misty_step','prayer_of_healing',
  'silence','spider_climb','spiritual_weapon','arcane_eye','banishment',
  'black_tentacles','confusion','conjure_animals','conjure_woodland_beings',
  'control_water','dimension_door','dominate_beast','evards_black_tentacles',
  'faithful_hound','fire_shield','freedom_of_movement','giant_insect',
  'greater_invisibility','guardian_of_faith','hallucinatory_terrain','ice_storm',
  'locate_creature','phantasmal_killer','polymorph','resilient_sphere',
  'stone_skin','wall_of_fire','animate_objects','antilife_shell',
  'arcane_hand','cloudkill','conjure_elemental','contact_other_plane',
  'control_winds','danse_macabre','dawn','destructive_wave','dominate_person',
  'far_step','grappling_vine','haste','hold_monster','insect_plague',
  'legend_lore','maelstrom','mass_cure_wounds','mislead','modify_memory',
  'passwall','planar_binding','seeming','synaptic_static','teleportation_circle',
  'wall_of_force','wall_of_stone','wind_walk','witch_bolt','call_lightning',
  'conjure_barrage','conjure_volley','sleet_storm','slow','speak_with_dead',
  'summon_lesser_demons','thunder_step','tidal_wave','vitriolic_sphere',
  'web','wind_wall','wrathful_smite','locate_object','darkvision',
  'enhance_ability','enlarge_reduce','flame_blade','heat_metal',
  'levitate','melf_acid_arrow','mind_spike','moonbeam','pass_without_trace',
  'protection_from_energy','rope_trick','see_invisibility','shatter',
  'blindness_deafness','blur','crown_of_madness','darkness','detect_thoughts',
  'enthrall','flaming_sphere','gust_of_wind','magic_mouth',
  'maximilian_earthen_grasp','nystul_magic_aura',
  'phantasmal_force','ray_of_enfeeblement','shadow_blade',
]);

const CONCENTRATION_BREAKING_CONDITIONS = new Set([
  STATUS_EFFECTS.INCAPACITATED,
  STATUS_EFFECTS.STUNNED,
  STATUS_EFFECTS.PARALYZED,
  STATUS_EFFECTS.UNCONSCIOUS,
  STATUS_EFFECTS.PETRIFIED,
]);

const SPELL_STATUS_EFFECTS = {
  hold_person:          { type: STATUS_EFFECTS.PARALYZED,   duration: 10, durationType: DURATION_TYPES.SAVE_ENDS, saveDC: null },
  sleep:                { type: STATUS_EFFECTS.UNCONSCIOUS,  duration: 1,  durationType: DURATION_TYPES.MINUTES },
  haste:                { type: STATUS_EFFECTS.HASTED,       duration: 10, durationType: DURATION_TYPES.ROUNDS },
  invisibility:         { type: STATUS_EFFECTS.INVISIBLE,    duration: 60, durationType: DURATION_TYPES.MINUTES },
  greater_invisibility: { type: STATUS_EFFECTS.INVISIBLE,    duration: 10, durationType: DURATION_TYPES.ROUNDS },
};

function spellLevelColor(level) {
  const c = ['#4CAF50','#2196F3','#03A9F4','#00BCD4','#009688','#8BC34A','#CDDC39','#FFEB3B','#FFC107','#FF9800'];
  return c[level] || '#888';
}

function getCombatSpells(character) {
  const cantrips = (character.spells?.cantrips || []).map(k => ({ key: k, ...SPELL_DATABASE[k] })).filter(s => s.name);
  const prepared = (character.spells?.prepared || []).map(k => ({ key: k, ...SPELL_DATABASE[k] })).filter(s => s.name);
  const known    = (character.spells?.known    || []).map(k => ({ key: k, ...SPELL_DATABASE[k] })).filter(s => s.name);
  const all = [...cantrips];
  [...prepared, ...known].forEach(s => { if (!all.find(a => a.key === s.key)) all.push(s); });
  return all.filter(s =>
    s.damage || s.healing || SPELL_STATUS_EFFECTS[s.key] ||
    ['shield','misty_step','counterspell','fly','haste','hold_person','sleep',
     'invisibility','greater_invisibility','spiritual_weapon'].includes(s.key)
  );
}

function isConcentrationSpell(spell) {
  return spell.concentration === true || CONCENTRATION_SPELLS.has(spell.key);
}

function rollConcentrationCheck(damageTaken) {
  const dc = Math.max(10, Math.floor(damageTaken / 2));
  const roll = rollD20();
  return { passed: roll >= dc, roll, dc };
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONCENTRATION WARNING MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ConcentrationWarningModal({ currentSpell, newSpell, onDropAndCast, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ backgroundColor: '#1a0a2e', border: '2px solid #9C27B0', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%', boxShadow: '0 0 30px rgba(156,39,176,0.5)' }}>
        <div style={{ fontSize: '24px', textAlign: 'center', marginBottom: '12px' }}>🔮</div>
        <h3 style={{ margin: '0 0 12px 0', color: '#CE93D8', textAlign: 'center' }}>Concentration Conflict</h3>
        <p style={{ color: '#ccc', fontSize: '14px', textAlign: 'center', marginBottom: '8px' }}>
          You are already concentrating on <strong style={{ color: '#CE93D8' }}>{currentSpell}</strong>.
        </p>
        <p style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
          Casting <strong style={{ color: '#CE93D8' }}>{newSpell}</strong> will end your current concentration.
          Do you want to drop <strong>{currentSpell}</strong> and cast <strong>{newSpell}</strong>?
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onDropAndCast} style={{ flex: 1, padding: '10px', backgroundColor: '#6A1B9A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Drop & Cast</button>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', backgroundColor: '#333', color: '#aaa', border: '1px solid #555', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SPELL CAST PANEL
// ─────────────────────────────────────────────────────────────────────────────
function SpellCastPanel({ caster, combatSpells, selectedTarget, onSpellResult, onClose }) {
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [upcastLevel,   setUpcastLevel]   = useState(null);
  const [castResult,    setCastResult]    = useState(null);
  const [concWarning,   setConcWarning]   = useState(null);

  const currentSlots  = caster.spellSlots?.current || getSpellSlots(caster);
  const spellAttack   = getSpellAttackBonus(caster);
  const spellSaveDC   = getSpellSaveDC(caster);
  const isWarlock     = isWarlockPactMagic(caster);
  const pactSlotInfo  = isWarlock ? getWarlockPactSlots(caster) : null;
  const pactSlotsLeft = isWarlock ? (currentSlots[pactSlotInfo.slotLevel - 1] || 0) : null;
  const activeConc    = caster.concentrationSpell || null;

  const executeCast = (spell, slotLevel) => {
    const castOutcome = castSpell(caster, spell, slotLevel > 0 ? slotLevel : null);
    if (!castOutcome.success) { alert(castOutcome.message); return; }
    const updatedCaster = castOutcome.character;
    const isConc = isConcentrationSpell(spell);
    if (isConc) updatedCaster.concentrationSpell = spell.name;

    let result = {
      spellName: spell.name, casterName: caster.name,
      targetName: selectedTarget?.name || 'ally', slotLevel, updatedCaster,
      damage: 0, healing: 0, hit: null, critical: false, statusApplied: null,
      isConcentration: isConc, droppedConcentration: activeConc, log: ''
    };

    if (spell.damage && selectedTarget) {
      if (spell.key === 'magic_missile') {
        const rolled = rollSpellDamage(calculateSpellDamage(spell, caster.level, slotLevel > 0 ? slotLevel : null) || spell.damage);
        result.damage = rolled.total; result.hit = true;
        result.log = `✨ ${caster.name} fires Magic Missile at ${selectedTarget.name} for ${rolled.total} force damage! (auto-hit)`;
      } else if (spell.key === 'sacred_flame') {
        const saveRoll = rollD20();
        const targetSave = selectedTarget.dex ? Math.floor((selectedTarget.dex - 10) / 2) : 0;
        const saved = (saveRoll + targetSave) >= spellSaveDC;
        if (!saved) {
          const rolled = rollSpellDamage(calculateSpellDamage(spell, caster.level) || spell.damage);
          result.damage = rolled.total; result.hit = true;
          result.log = `🔥 Sacred Flame hits ${selectedTarget.name} for ${rolled.total} radiant damage! (DEX save ${saveRoll} failed vs DC ${spellSaveDC})`;
        } else {
          result.hit = false;
          result.log = `🔥 ${selectedTarget.name} saves against Sacred Flame! (rolled ${saveRoll} vs DC ${spellSaveDC})`;
        }
      } else if (['fireball','lightning_bolt','thunderwave','burning_hands','ice_storm','cone_of_cold','chain_lightning','disintegrate','finger_of_death','meteor_swarm'].includes(spell.key)) {
        const saveRoll = rollD20();
        const targetDex = selectedTarget.dex ? Math.floor((selectedTarget.dex - 10) / 2) : 0;
        const saved = (saveRoll + targetDex) >= spellSaveDC;
        const rolled = rollSpellDamage(calculateSpellDamage(spell, caster.level, slotLevel > 0 ? slotLevel : null) || spell.damage);
        result.damage = saved ? Math.floor(rolled.total / 2) : rolled.total; result.hit = true;
        result.log = saved
          ? `💥 ${caster.name} casts ${spell.name}! ${selectedTarget.name} saves (${saveRoll} vs DC ${spellSaveDC}) — takes ${result.damage} ${spell.damageType} damage (half).`
          : `💥 ${caster.name} casts ${spell.name}! ${selectedTarget.name} fails save (${saveRoll} vs DC ${spellSaveDC}) — takes ${result.damage} ${spell.damageType} damage!`;
      } else {
        const d20 = rollD20(); const total = d20 + spellAttack; const crit = d20 === 20;
        const hit = crit || total >= (selectedTarget.ac || selectedTarget.armorClass || 12);
        if (hit) {
          const dmgStr = calculateSpellDamage(spell, caster.level, slotLevel > 0 ? slotLevel : null) || spell.damage;
          const rolled = rollSpellDamage(crit ? dmgStr.replace(/(\d+)d/, (_, n) => `${parseInt(n)*2}d`) : dmgStr);
          result.damage = rolled.total; result.hit = true; result.critical = crit;
          result.log = crit
            ? `💥 CRITICAL! ${caster.name}'s ${spell.name} hits ${selectedTarget.name} for ${rolled.total} ${spell.damageType} damage!`
            : `✨ ${caster.name}'s ${spell.name} hits ${selectedTarget.name} for ${rolled.total} ${spell.damageType} damage! (rolled ${total} vs AC ${selectedTarget.ac || selectedTarget.armorClass || '?'})`;
        } else {
          result.hit = false;
          result.log = `❌ ${caster.name}'s ${spell.name} misses ${selectedTarget.name}! (rolled ${total} vs AC ${selectedTarget.ac || selectedTarget.armorClass || '?'})`;
        }
      }
    } else if (spell.healing) {
      const rolled = rollSpellDamage(calculateSpellDamage(spell, caster.level, slotLevel > 0 ? slotLevel : null) || spell.healing);
      const scAbil = { Cleric:'WIS', Druid:'WIS', Paladin:'CHA', Bard:'CHA', Ranger:'WIS' };
      const mod = caster.abilities ? Math.floor((caster.abilities[scAbil[caster.class] || 'INT'] - 10) / 2) : 0;
      result.healing = rolled.total + mod;
      result.log = `💚 ${caster.name} casts ${spell.name} and heals for ${result.healing} HP!`;
    } else if (SPELL_STATUS_EFFECTS[spell.key]) {
      const effectDef = SPELL_STATUS_EFFECTS[spell.key];
      result.statusApplied = { ...effectDef, saveDC: effectDef.saveDC ?? spellSaveDC, spellName: spell.name };
      result.log = `🌀 ${caster.name} casts ${spell.name}${selectedTarget ? ` on ${selectedTarget.name}` : ''}!`;
    } else {
      result.log = `✨ ${caster.name} casts ${spell.name}!`;
    }

    if (isConc) {
      result.log += ` [Concentrating]`;
      if (activeConc) result.log = `[Dropped ${activeConc}] ` + result.log;
    }

    setCastResult(result);
    onSpellResult(result);
  };

  const handleCast = () => {
    if (!selectedSpell) return;
    const spell = selectedSpell;
    const slotLevel = upcastLevel ?? (spell.level || 0);
    if (isConcentrationSpell(spell) && activeConc && activeConc !== spell.name) {
      setConcWarning({ currentSpell: activeConc, newSpell: spell.name, pendingCast: () => executeCast(spell, slotLevel) });
      return;
    }
    executeCast(spell, slotLevel);
  };

  return (
    <>
      {concWarning && (
        <ConcentrationWarningModal
          currentSpell={concWarning.currentSpell} newSpell={concWarning.newSpell}
          onDropAndCast={() => { concWarning.pendingCast(); setConcWarning(null); }}
          onCancel={() => setConcWarning(null)}
        />
      )}
      <div style={{ backgroundColor: '#12012a', border: '2px solid #9C27B0', borderRadius: '10px', padding: '15px', marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, color: '#CE93D8' }}>✨ Cast a Spell</h4>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px' }}>✕</button>
        </div>

        {activeConc && (
          <div style={{ padding: '6px 10px', backgroundColor: 'rgba(156,39,176,0.15)', border: '1px solid #9C27B0', borderRadius: '6px', marginBottom: '10px', fontSize: '12px', color: '#CE93D8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔮</span><span>Concentrating on <strong>{activeConc}</strong> — casting another concentration spell will end this.</span>
          </div>
        )}

        <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
          Spell Attack: <span style={{ color: '#CE93D8' }}>+{spellAttack}</span> &nbsp;|&nbsp; Save DC: <span style={{ color: '#CE93D8' }}>{spellSaveDC}</span>
        </div>

        {isWarlock ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '8px 12px', backgroundColor: pactSlotsLeft > 0 ? '#1a0a2e' : '#1a1a1a', border: `2px solid ${pactSlotsLeft > 0 ? '#9C27B0' : '#333'}`, borderRadius: '8px' }}>
            <span style={{ fontSize: '18px' }}>🔮</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: pactSlotsLeft > 0 ? '#CE93D8' : '#555' }}>Pact Magic Slots — Level {pactSlotInfo.slotLevel}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>{pactSlotsLeft} / {pactSlotInfo.slotCount} remaining{pactSlotsLeft === 0 && ' — Short rest to recover!'}</div>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
              {Array.from({ length: pactSlotInfo.slotCount }).map((_, i) => (
                <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: i < pactSlotsLeft ? '#9C27B0' : '#333', border: '1px solid #555' }} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {getSpellSlots(caster).map((max, i) => {
              if (max === 0) return null;
              const cur = currentSlots[i] || 0;
              return <div key={i} style={{ padding: '4px 8px', backgroundColor: cur > 0 ? '#1a0a2e' : '#1a1a1a', border: `1px solid ${cur > 0 ? spellLevelColor(i+1) : '#333'}`, borderRadius: '4px', fontSize: '11px', color: cur > 0 ? spellLevelColor(i+1) : '#555' }}>L{i+1}: {cur}/{max}</div>;
            })}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', marginBottom: '12px', maxHeight: '200px', overflowY: 'auto' }}>
          {combatSpells.length === 0 && <div style={{ color: '#666', fontStyle: 'italic', padding: '10px', gridColumn: '1/-1' }}>No combat spells available. Open SpellBook to learn spells.</div>}
          {combatSpells.map(spell => {
            const hasSlotsOrCantrip = spell.level === 0 || (isWarlock ? canCastSpell(caster, spell) : (currentSlots[spell.level - 1] || 0) > 0);
            const isSelected = selectedSpell?.key === spell.key;
            const isConc = isConcentrationSpell(spell);
            const isActiveConc = activeConc === spell.name;
            return (
              <button key={spell.key} onClick={() => { setSelectedSpell(spell); setUpcastLevel(spell.level); setCastResult(null); }} disabled={!hasSlotsOrCantrip}
                style={{ padding: '8px 10px', backgroundColor: isSelected ? '#3a0a5a' : '#1a0a2e', border: `2px solid ${isActiveConc ? '#9C27B0' : isSelected ? '#CE93D8' : hasSlotsOrCantrip ? spellLevelColor(spell.level) : '#333'}`, borderRadius: '6px', cursor: hasSlotsOrCantrip ? 'pointer' : 'not-allowed', opacity: hasSlotsOrCantrip ? 1 : 0.4, textAlign: 'left', transition: 'all 0.15s', boxShadow: isActiveConc ? '0 0 8px rgba(156,39,176,0.6)' : 'none' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: spellLevelColor(spell.level), marginBottom: '3px' }}>{spell.name}</div>
                <div style={{ fontSize: '10px', color: '#888' }}>
                  {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
                  {spell.damage && ` • ${spell.damage} ${spell.damageType}`}
                  {spell.healing && ` • Heals ${spell.healing}`}
                  {isConc && <span style={{ color: '#9C27B0' }}> • 🔮 Conc.</span>}
                </div>
              </button>
            );
          })}
        </div>

        {selectedSpell && (
          <div style={{ backgroundColor: '#0a0018', borderRadius: '8px', padding: '12px', border: `1px solid ${spellLevelColor(selectedSpell.level)}` }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', color: spellLevelColor(selectedSpell.level) }}>{selectedSpell.name}</span>
              {isConcentrationSpell(selectedSpell) && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#CE93D8', backgroundColor: 'rgba(156,39,176,0.2)', padding: '2px 6px', borderRadius: '4px', border: '1px solid #6A1B9A' }}>🔮 Concentration</span>}
              <span style={{ color: '#888', fontSize: '12px', marginLeft: '10px' }}>{selectedSpell.castingTime} • {selectedSpell.range}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '10px' }}>{selectedSpell.description}</div>

            {isConcentrationSpell(selectedSpell) && activeConc && activeConc !== selectedSpell.name && (
              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(255,152,0,0.1)', border: '1px solid #ff9800', borderRadius: '6px', marginBottom: '10px', fontSize: '12px', color: '#ffb74d' }}>
                ⚠️ Casting this will drop <strong>{activeConc}</strong>
              </div>
            )}

            {!isWarlock && selectedSpell.level > 0 && selectedSpell.upcastBonus && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>Cast at level:</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {Array.from({ length: 10 - selectedSpell.level }, (_, i) => selectedSpell.level + i).map(lvl => {
                    const slotsLeft = currentSlots[lvl - 1] || 0;
                    if (getSpellSlots(caster)[lvl - 1] === 0) return null;
                    return <button key={lvl} onClick={() => setUpcastLevel(lvl)} disabled={slotsLeft === 0} style={{ padding: '4px 10px', backgroundColor: upcastLevel === lvl ? spellLevelColor(lvl) : '#1a0a2e', color: upcastLevel === lvl ? '#000' : slotsLeft > 0 ? '#eee' : '#555', border: 'none', borderRadius: '4px', cursor: slotsLeft > 0 ? 'pointer' : 'not-allowed', fontSize: '12px', opacity: slotsLeft > 0 ? 1 : 0.4 }}>L{lvl} ({slotsLeft})</button>;
                  })}
                </div>
              </div>
            )}

            {isWarlock && selectedSpell.level > 0 && (
              <div style={{ marginBottom: '10px', padding: '6px 10px', backgroundColor: 'rgba(156,39,176,0.1)', border: '1px solid #6A1B9A', borderRadius: '6px', fontSize: '11px', color: '#CE93D8' }}>
                🔮 Pact Magic: always casts at level <strong>{pactSlotInfo.slotLevel}</strong> — no slot choice needed
              </div>
            )}

            {!selectedTarget && selectedSpell.damage && <div style={{ color: '#ff9800', fontSize: '12px', marginBottom: '8px' }}>⚠️ Select a target enemy above before casting this spell</div>}

            <button onClick={handleCast} disabled={!!(selectedSpell.damage && !selectedTarget)}
              style={{ width: '100%', padding: '10px', backgroundColor: (selectedSpell.damage && !selectedTarget) ? '#333' : '#7B1FA2', color: 'white', border: 'none', borderRadius: '6px', cursor: (selectedSpell.damage && !selectedTarget) ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'background 0.2s' }}>
              ✨ Cast {selectedSpell.name}{isWarlock && selectedSpell.level > 0 ? ` (Pact Lvl ${pactSlotInfo.slotLevel})` : upcastLevel && upcastLevel > selectedSpell.level ? ` (Lvl ${upcastLevel})` : ''}
            </button>
          </div>
        )}

        {castResult && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: castResult.hit === false ? '#1a0a0a' : '#0a1a0a', borderRadius: '6px', border: `1px solid ${castResult.hit === false ? '#f44336' : '#4CAF50'}`, fontSize: '13px', color: '#eee' }}>
            {castResult.log}
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMBAT TRACKER
// ─────────────────────────────────────────────────────────────────────────────
export default function CombatTracker({ combat, onUpdate, onEnd, party = [], updateParty }) {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [combatLog,      setCombatLog]      = useState([]);
  const [showSpellPanel, setShowSpellPanel] = useState(false);

  if (!combat || !combat.isActive) return null;

  const currentCombatant = getCurrentCombatant(combat);
  const isPlayerTurn     = !currentCombatant?.isEnemy;
  const partyCharacter   = party.find(p => p.name === currentCombatant?.name) || currentCombatant;
  const isSpellcaster    = SPELLCASTING_CLASSES[partyCharacter?.class];
  const combatSpells     = isSpellcaster ? getCombatSpells(partyCharacter) : [];

  const addLog = (entry, prevLog = combatLog) => {
    setCombatLog([entry, ...prevLog]);
    return [entry, ...prevLog];
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  SHORT REST — all classes recover 1 hit die; Warlocks also get pact slots
  // ─────────────────────────────────────────────────────────────────────────
  const handleShortRest = () => {
    if (!updateParty) return;
    const logs = [];

    const updatedParty = party.map(p => {
      // All classes: spend 1 hit die via characterSystem.shortRest()
      let updated = characterShortRest(p, 1);
      const hpGained = updated.hp - p.hp;
      if (hpGained > 0) {
        logs.push(`⛺ ${p.name} rests and recovers ${hpGained} HP (1 hit die).`);
      }

      // Warlocks additionally recover all Pact Magic slots via spellSystem.shortRest()
      if (isWarlockPactMagic(updated)) {
        updated = shortRest(updated);
        const pact = getWarlockPactSlots(updated);
        logs.push(`🔮 ${p.name} recovers ${pact.slotCount} Pact Magic slot${pact.slotCount > 1 ? 's' : ''} (level ${pact.slotLevel})!`);
      }

      return updated;
    });

    if (logs.length === 0) {
      logs.push('⛺ Short rest taken — no hit dice spent.');
    }
    logs.forEach(l => addLog(l));
    updateParty(updatedParty);
    console.log('[ShortRest] Party updated after short rest.');
  };

  const clearConcentration = (character, reason = '') => {
    if (!character.concentrationSpell) return character;
    console.log(`[Concentration] ${character.name} lost concentration on ${character.concentrationSpell}${reason ? ': ' + reason : ''}`);
    return { ...character, concentrationSpell: null };
  };

  const handleConcentrationCheck = (character, damageTaken) => {
    if (!character.concentrationSpell) return { character, logEntry: null };
    const check = rollConcentrationCheck(damageTaken);
    if (check.passed) {
      return { character, logEntry: `🔮 ${character.name} passes concentration check (rolled ${check.roll} vs DC ${check.dc}) — still concentrating on ${character.concentrationSpell}.` };
    } else {
      const cleared = clearConcentration(character, 'failed concentration check');
      return { character: cleared, logEntry: `💔 ${character.name} FAILS concentration check (rolled ${check.roll} vs DC ${check.dc}) — ${character.concentrationSpell} ends!` };
    }
  };

  const handleAttack = (attackIndex = 0) => {
    if (!selectedTarget) { alert('Select a target first!'); return; }
    const result = executeAttack(currentCombatant, selectedTarget, attackIndex);
    const logEntry = result.attackRoll.isCritical
      ? `💥 CRITICAL HIT! ${result.attacker} hits ${result.target} with ${result.attack} for ${result.damage} ${result.damageType} damage!`
      : result.attackRoll.isFumble ? `❌ FUMBLE! ${result.attacker} misses ${result.target}!`
      : result.attackRoll.isHit    ? `⚔️ ${result.attacker} hits ${result.target} with ${result.attack} for ${result.damage} ${result.damageType} damage!`
      :                              `🛡️ ${result.attacker} misses ${result.target}!`;
    let newLog = addLog(logEntry);

    if (result.attackRoll.isHit && result.damage > 0) {
      const damagedTarget = applyDamage(selectedTarget, result.damage);
      const updatedCombat = updateCombatant(combat, selectedTarget.id || selectedTarget.name, damagedTarget);
      if (damagedTarget.isDead) addLog(`💀 ${damagedTarget.name} has been defeated!`, newLog);
      onUpdate(updatedCombat);
      if (updateParty) {
        const partyTarget = party.find(p => p.name === selectedTarget.name);
        if (partyTarget?.concentrationSpell) {
          const { character: afterCheck, logEntry: checkLog } = handleConcentrationCheck(partyTarget, result.damage);
          if (checkLog) addLog(checkLog);
          updateParty(party.map(p => p.name === afterCheck.name ? afterCheck : p));
        }
      }
      const endCheck = checkCombatEnd(updatedCombat);
      if (endCheck.ended) { setTimeout(() => onEnd(endCheck), 1000); return; }
    }
    handleEndTurn();
  };

  const handleSpellResult = (result) => {
    setShowSpellPanel(false);
    addLog(result.log);
    let currentCombatState = { ...combat };

    if (updateParty && result.updatedCaster) {
      updateParty(party.map(p => p.name === result.updatedCaster.name ? result.updatedCaster : p));
    }

    if (result.damage > 0 && result.hit && selectedTarget) {
      const damagedTarget = applyDamage(selectedTarget, result.damage, result.damageType);
      currentCombatState = updateCombatant(currentCombatState, selectedTarget.id || selectedTarget.name, damagedTarget);
      if (damagedTarget.isDead) addLog(`💀 ${damagedTarget.name} has been defeated!`);
      onUpdate(currentCombatState);
      if (updateParty) {
        const partyTarget = party.find(p => p.name === selectedTarget.name);
        if (partyTarget?.concentrationSpell) {
          const { character: afterCheck, logEntry: checkLog } = handleConcentrationCheck(partyTarget, result.damage);
          if (checkLog) addLog(checkLog);
          updateParty(party.map(p => p.name === afterCheck.name ? afterCheck : p));
        }
      }
      const endCheck = checkCombatEnd(currentCombatState);
      if (endCheck.ended) { setTimeout(() => onEnd(endCheck), 1000); return; }
    }

    if (result.healing > 0 && updateParty) {
      const healedCaster = { ...result.updatedCaster, hp: Math.min(result.updatedCaster.maxHp, (result.updatedCaster.hp || 0) + result.healing) };
      updateParty(party.map(p => p.name === healedCaster.name ? healedCaster : p));
    }

    if (result.statusApplied && selectedTarget && updateParty) {
      const effect = createStatusEffect({
        type: result.statusApplied.type, duration: result.statusApplied.duration || 1,
        durationType: result.statusApplied.durationType || DURATION_TYPES.ROUNDS,
        saveDC: result.statusApplied.saveDC, spellName: result.statusApplied.spellName, source: result.casterName
      });
      if (effect) {
        const partyTarget = party.find(p => p.name === selectedTarget.name);
        if (partyTarget) {
          let withEffect = applyStatusEffect(partyTarget, effect);
          if (CONCENTRATION_BREAKING_CONDITIONS.has(result.statusApplied.type) && withEffect.concentrationSpell) {
            const dropped = withEffect.concentrationSpell;
            withEffect = clearConcentration(withEffect, `gained ${effect.name} condition`);
            addLog(`💔 ${selectedTarget.name} loses concentration on ${dropped} (gained ${effect.name})!`);
          }
          updateParty(party.map(p => p.name === withEffect.name ? withEffect : p));
          addLog(`🌀 ${selectedTarget.name} is now ${effect.name}!`);
        }
      }
    }
    handleEndTurn();
  };

  const handleEndTurn = () => {
    setSelectedTarget(null);
    setShowSpellPanel(false);
    const newCombat = nextTurn(combat);
    onUpdate(newCombat);
    setTimeout(() => {
      if (newCombat.combatants[newCombat.currentTurn]?.isEnemy) handleEnemyTurn(newCombat);
    }, 500);
  };

  const handleEnemyTurn = (currentCombat) => {
    const enemy = getCurrentCombatant(currentCombat);
    if (!enemy || enemy.isDead) { handleEndTurn(); return; }
    const aliveParty = currentCombat.combatants.filter(c => !c.isEnemy && !c.isDead);
    if (aliveParty.length === 0) return;
    const target = aliveParty[Math.floor(Math.random() * aliveParty.length)];
    const result = executeAttack(enemy, target, 0);
    const logEntry = result.attackRoll.isCritical
      ? `💥 CRITICAL! ${result.attacker} critically hits ${result.target} for ${result.damage} damage!`
      : result.attackRoll.isHit ? `⚔️ ${result.attacker} hits ${result.target} for ${result.damage} damage!`
      :                           `🛡️ ${result.attacker} misses ${result.target}!`;
    addLog(logEntry);

    if (result.attackRoll.isHit && result.damage > 0) {
      const damagedTarget = applyDamage(target, result.damage);
      let updatedCombat = updateCombatant(currentCombat, target.id || target.name, damagedTarget);
      if (damagedTarget.isDead) addLog(`💀 ${damagedTarget.name} has fallen!`);
      onUpdate(updatedCombat);
      if (updateParty) {
        const partyTarget = party.find(p => p.name === target.name);
        if (partyTarget?.concentrationSpell) {
          const { character: afterCheck, logEntry: checkLog } = handleConcentrationCheck(partyTarget, result.damage);
          if (checkLog) addLog(checkLog);
          updateParty(party.map(p => p.name === afterCheck.name ? afterCheck : p));
        }
      }
      const endCheck = checkCombatEnd(updatedCombat);
      if (endCheck.ended) { setTimeout(() => onEnd(endCheck), 1000); return; }
    }
    setTimeout(() => handleEndTurn(), 1500);
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#120808', border: '3px solid #d32f2f', borderBottom: 'none', padding: '20px', maxHeight: '65vh', overflowY: 'auto', zIndex: 1000, boxShadow: '0 -4px 20px rgba(211,47,47,0.4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '15px', borderBottom: '2px solid #2a2a2a' }}>
        <h2 style={{ margin: 0, color: '#d32f2f', fontSize: '24px' }}>⚔️ Combat — Round {combat.round}</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={handleShortRest} title="Short Rest: recover 1 hit die HP; Warlocks also recover Pact Magic slots"
            style={{ padding: '8px 14px', backgroundColor: '#1a0a2e', color: '#9C27B0', border: '1px solid #6A1B9A', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>
            ⛺ Short Rest
          </button>
          <button onClick={() => onEnd({ ended: true, result: 'flee', message: 'Combat ended' })}
            style={{ padding: '8px 16px', backgroundColor: '#333', color: '#aaa', border: '1px solid #555', borderRadius: '5px', cursor: 'pointer' }}>
            End Combat
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
        {combat.combatants.map((combatant, index) => {
          const partyEntry = party.find(p => p.name === combatant.name);
          const isConcentrating = partyEntry?.concentrationSpell;
          const isActive = index === combat.currentTurn;
          return (
            <div key={combatant.id || combatant.name} style={{ minWidth: '120px', padding: '10px', backgroundColor: isActive ? '#2a0000' : '#1a1a1a', border: isActive ? '2px solid #ffd700' : '2px solid #333', borderRadius: '8px', opacity: combatant.isDead ? 0.3 : 1, position: 'relative', flexShrink: 0, boxShadow: isConcentrating ? '0 0 12px rgba(156,39,176,0.7), inset 0 0 8px rgba(156,39,176,0.2)' : 'none' }}>
              {isActive && <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '18px' }}>⬇️</div>}
              <div style={{ fontSize: '11px', color: combatant.isEnemy ? '#ff6b6b' : '#4CAF50', marginBottom: '4px' }}>{combatant.isEnemy ? '👹' : '🛡️'} Init: {combatant.initiative}</div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{combatant.name}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>{combatant.hp}/{combatant.maxHp} HP</div>
              <div style={{ width: '100%', height: '5px', backgroundColor: '#0a0a0a', borderRadius: '3px', marginTop: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(0, (combatant.hp / combatant.maxHp) * 100)}%`, height: '100%', backgroundColor: combatant.hp > combatant.maxHp * 0.5 ? '#4CAF50' : combatant.hp > combatant.maxHp * 0.25 ? '#ff9800' : '#f44336', transition: 'width 0.3s' }} />
              </div>
              {isConcentrating && (
                <div style={{ marginTop: '5px', fontSize: '10px', color: '#CE93D8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>🔮</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85px' }}>{isConcentrating}</span>
                </div>
              )}
              {combatant.conditions?.length > 0 && (
                <div style={{ marginTop: '4px', fontSize: '12px', display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                  {combatant.conditions.slice(0, 3).map(c => <span key={c.id} title={c.name}>{c.icon}</span>)}
                  {combatant.conditions.length > 3 && <span style={{ color: '#888' }}>+{combatant.conditions.length - 3}</span>}
                </div>
              )}
              {combatant.isDead && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '8px' }}>💀</div>}
            </div>
          );
        })}
      </div>

      <div style={{ backgroundColor: '#0a0a0a', padding: '10px', borderRadius: '8px', marginBottom: '15px', maxHeight: '100px', overflowY: 'auto', border: '1px solid #222' }}>
        {combatLog.length === 0
          ? <p style={{ margin: 0, color: '#444', fontStyle: 'italic', fontSize: '13px' }}>Combat begins…</p>
          : combatLog.map((log, i) => <div key={i} style={{ padding: '3px 5px', color: i === 0 ? '#eee' : '#777', fontSize: '13px', borderBottom: i < combatLog.length - 1 ? '1px solid #111' : 'none' }}>{log}</div>)
        }
      </div>

      <div style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '8px', border: '2px solid #333' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#ffd700', fontSize: '16px' }}>
          {currentCombatant?.name}'s Turn
          {isPlayerTurn && isSpellcaster && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#CE93D8' }}>✨ Spellcaster</span>}
          {isPlayerTurn && partyCharacter?.concentrationSpell && (
            <span style={{ marginLeft: '10px', fontSize: '11px', color: '#CE93D8', backgroundColor: 'rgba(156,39,176,0.2)', padding: '2px 8px', borderRadius: '10px', border: '1px solid #6A1B9A' }}>
              🔮 {partyCharacter.concentrationSpell}
            </span>
          )}
        </h3>

        {isPlayerTurn && !currentCombatant?.isDead && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Target</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {combat.combatants.filter(c => c.isEnemy && !c.isDead).map(enemy => (
                  <button key={enemy.id || enemy.name} onClick={() => setSelectedTarget(enemy)}
                    style={{ padding: '8px 14px', backgroundColor: selectedTarget?.name === enemy.name ? '#3a0000' : '#2a1010', color: selectedTarget?.name === enemy.name ? '#ff6b6b' : '#ccc', border: `2px solid ${selectedTarget?.name === enemy.name ? '#d32f2f' : '#333'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s' }}>
                    👹 {enemy.name}<span style={{ color: '#666', marginLeft: '6px', fontSize: '11px' }}>{enemy.hp}/{enemy.maxHp} HP</span>
                  </button>
                ))}
                {combat.combatants.filter(c => c.isEnemy && !c.isDead).length === 0 && <span style={{ color: '#888', fontStyle: 'italic', fontSize: '13px' }}>No living enemies</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'flex-start' }}>
              {currentCombatant.attacks?.map((attack, index) => (
                <button key={index} onClick={() => handleAttack(index)} disabled={!selectedTarget}
                  style={{ padding: '10px 18px', backgroundColor: selectedTarget ? '#1a3a1a' : '#1a1a1a', color: selectedTarget ? '#4CAF50' : '#555', border: `2px solid ${selectedTarget ? '#4CAF50' : '#333'}`, borderRadius: '8px', cursor: selectedTarget ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.15s' }}>
                  ⚔️ {attack.name}
                  <span style={{ display: 'block', fontSize: '10px', color: selectedTarget ? '#81C784' : '#444', fontWeight: 'normal' }}>+{attack.bonus} to hit • {attack.damage}</span>
                </button>
              ))}

              {isSpellcaster && (
                <button onClick={() => setShowSpellPanel(p => !p)}
                  style={{ padding: '10px 18px', backgroundColor: showSpellPanel ? '#2a0a3a' : '#1a0a2a', color: showSpellPanel ? '#CE93D8' : '#9C27B0', border: `2px solid ${showSpellPanel ? '#CE93D8' : '#6A1B9A'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.15s', position: 'relative' }}>
                  ✨ Cast Spell
                  <span style={{ display: 'block', fontSize: '10px', color: '#888', fontWeight: 'normal' }}>{combatSpells.length} available</span>
                  {partyCharacter?.concentrationSpell && (
                    <span style={{ position: 'absolute', top: '-8px', right: '-8px', width: '16px', height: '16px', backgroundColor: '#9C27B0', borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔮</span>
                  )}
                </button>
              )}

              <button onClick={handleEndTurn} style={{ padding: '10px 18px', backgroundColor: '#1a1a1a', color: '#888', border: '2px solid #333', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginLeft: 'auto', transition: 'all 0.15s' }}>
                End Turn →
              </button>
            </div>

            {showSpellPanel && isSpellcaster && (
              <SpellCastPanel caster={partyCharacter} combatSpells={combatSpells} selectedTarget={selectedTarget} onSpellResult={handleSpellResult} onClose={() => setShowSpellPanel(false)} />
            )}
          </div>
        )}

        {!isPlayerTurn && <p style={{ margin: 0, color: '#ff6b6b', fontStyle: 'italic', fontSize: '14px' }}>⚔️ Enemy is acting…</p>}
        {currentCombatant?.isDead && <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>This combatant has been defeated. Advance the turn.</p>}
      </div>
    </div>
  );
}