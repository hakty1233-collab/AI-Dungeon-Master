// frontend/src/components/RestModal.jsx
import { useState } from 'react';
import { shortRest, longRest, CLASSES } from '../utils/characterSystem';
import { shortRest as spellShortRest, isWarlockPactMagic, getWarlockPactSlots } from '../utils/spellSystem';

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getModifier(score) {
  return Math.floor((score - 10) / 2);
}

/** Roll a single hit die (returns 1–die) */
function rollHitDie(die) {
  return Math.floor(Math.random() * die) + 1;
}

/** Summarise spell slot changes for display */
function getSlotRecovery(before, after) {
  const recovered = [];
  if (!before || !after) return recovered;
  const bSlots = before.spellSlots?.current || [];
  const aSlots = after.spellSlots?.current  || [];
  for (let i = 0; i < aSlots.length; i++) {
    const diff = (aSlots[i] || 0) - (bSlots[i] || 0);
    if (diff > 0) recovered.push({ level: i + 1, amount: diff });
  }
  return recovered;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHORT REST PANEL
// ─────────────────────────────────────────────────────────────────────────────
function ShortRestPanel({ party, onConfirm }) {
  // Per-character hit dice spend: { [charName]: count }
  const [diceToSpend, setDiceToSpend] = useState({});
  const [rolled, setRolled] = useState(null); // results after rolling

  const handleRoll = () => {
    const results = [];
    party.forEach(char => {
      const spend = diceToSpend[char.name] || 0;
      if (spend === 0) {
        results.push({ name: char.name, hpGained: 0, rolls: [], dice: 0 });
        return;
      }
      const classData = CLASSES[char.class];
      const die = classData?.hitDie || 8;
      const conMod = getModifier(char.abilities?.CON || 10);
      const rolls = Array.from({ length: spend }, () => rollHitDie(die));
      const hpGained = Math.max(0, rolls.reduce((s, r) => s + r, 0) + spend * conMod);
      results.push({ name: char.name, hpGained, rolls, die, conMod, dice: spend });
    });
    setRolled(results);
  };

  const handleConfirm = () => {
    if (!rolled) { handleRoll(); return; }

    const updatedParty = party.map(char => {
      const result = rolled.find(r => r.name === char.name);
      if (!result || result.hpGained === 0) return char;

      // Apply HP healing
      let updated = {
        ...char,
        hp: Math.min(char.maxHp, (char.hp || 0) + result.hpGained),
        hitDice: {
          ...char.hitDice,
          current: Math.max(0, (char.hitDice?.current || char.level || 1) - result.dice),
        }
      };

      // Warlocks recover pact magic slots
      if (isWarlockPactMagic(updated)) {
        updated = spellShortRest(updated);
      }

      return updated;
    });

    onConfirm(updatedParty, rolled);
  };

  const totalSpending = Object.values(diceToSpend).reduce((s, v) => s + v, 0);

  return (
    <div>
      <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 16px' }}>
        Spend Hit Dice to recover HP. You recover half your max hit dice on a long rest.
        Warlocks also recover all Pact Magic slots.
      </p>

      {party.map(char => {
        const classData = CLASSES[char.class];
        const die = classData?.hitDie || 8;
        const conMod = getModifier(char.abilities?.CON || 10);
        const available = char.hitDice?.current ?? char.level ?? 1;
        const spending = diceToSpend[char.name] || 0;
        const hpMissing = (char.maxHp || 0) - (char.hp || 0);
        const isWarlock = isWarlockPactMagic(char);
        const pactInfo = isWarlock ? getWarlockPactSlots(char) : null;
        const pactCurrent = isWarlock
          ? ((char.spellSlots?.current || [])[pactInfo.slotLevel - 1] || 0)
          : null;

        return (
          <div key={char.name} style={{
            padding: '12px 14px',
            marginBottom: '10px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '10px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: '#eee', fontSize: '14px' }}>{char.name}</span>
                <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>
                  {char.race} {char.class}
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px' }}>
                <span style={{ color: hpMissing > 0 ? '#f44336' : '#4CAF50' }}>
                  ❤️ {char.hp}/{char.maxHp}
                </span>
                {hpMissing > 0 && (
                  <span style={{ color: '#888', marginLeft: '6px' }}>(−{hpMissing})</span>
                )}
              </div>
            </div>

            {/* Hit dice info */}
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
              Hit Dice: <span style={{ color: '#c9a84c' }}>d{die}</span> &nbsp;|&nbsp;
              Available: <span style={{ color: available > 0 ? '#FFD54F' : '#555' }}>{available}</span>
              &nbsp;|&nbsp; CON mod: {conMod >= 0 ? '+' : ''}{conMod}
            </div>

            {/* Warlock pact slot recovery notice */}
            {isWarlock && (
              <div style={{
                fontSize: '11px',
                color: '#CE93D8',
                backgroundColor: 'rgba(156,39,176,0.1)',
                border: '1px solid #6A1B9A',
                borderRadius: '6px',
                padding: '5px 8px',
                marginBottom: '8px',
              }}>
                🔮 Pact Magic slots will recover: {pactCurrent}/{pactInfo.slotCount} remaining → {pactInfo.slotCount}/{pactInfo.slotCount}
              </div>
            )}

            {/* Spend controls */}
            {available > 0 && hpMissing > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#aaa' }}>Spend:</span>
                <button
                  onClick={() => setDiceToSpend(prev => ({ ...prev, [char.name]: Math.max(0, (prev[char.name] || 0) - 1) }))}
                  disabled={spending === 0}
                  style={{ width: '28px', height: '28px', backgroundColor: spending > 0 ? '#c62828' : '#222', color: spending > 0 ? '#fff' : '#444', border: 'none', borderRadius: '6px', cursor: spending > 0 ? 'pointer' : 'not-allowed', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >−</button>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffd700', minWidth: '24px', textAlign: 'center' }}>{spending}</span>
                <button
                  onClick={() => setDiceToSpend(prev => ({ ...prev, [char.name]: Math.min(available, (prev[char.name] || 0) + 1) }))}
                  disabled={spending >= available}
                  style={{ width: '28px', height: '28px', backgroundColor: spending < available ? '#2e7d32' : '#222', color: spending < available ? '#fff' : '#444', border: 'none', borderRadius: '6px', cursor: spending < available ? 'pointer' : 'not-allowed', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >+</button>
                {spending > 0 && (
                  <span style={{ fontSize: '12px', color: '#81C784' }}>
                    ~{spending * (Math.ceil(die / 2) + conMod)} HP avg
                  </span>
                )}
              </div>
            ) : available === 0 ? (
              <div style={{ fontSize: '12px', color: '#555', fontStyle: 'italic' }}>No hit dice remaining</div>
            ) : (
              <div style={{ fontSize: '12px', color: '#4CAF50', fontStyle: 'italic' }}>Already at full HP</div>
            )}

            {/* Roll results */}
            {rolled && (() => {
              const r = rolled.find(x => x.name === char.name);
              if (!r || r.dice === 0) return null;
              return (
                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#0a1a0a', borderRadius: '6px', fontSize: '12px' }}>
                  <span style={{ color: '#888' }}>Rolled: </span>
                  {r.rolls.map((v, i) => (
                    <span key={i} style={{ color: '#81C784', marginRight: '4px' }}>[{v}]</span>
                  ))}
                  {r.conMod !== 0 && <span style={{ color: '#888' }}>× {r.dice} ({r.conMod >= 0 ? '+' : ''}{r.conMod * r.dice} CON) </span>}
                  <span style={{ color: '#4CAF50', fontWeight: 'bold' }}> = +{r.hpGained} HP</span>
                </div>
              );
            })()}
          </div>
        );
      })}

      <button
        onClick={handleConfirm}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: totalSpending > 0 || !rolled ? '#1a3a1a' : '#c9a84c',
          color: totalSpending > 0 || !rolled ? '#4CAF50' : '#000',
          border: `1px solid ${totalSpending > 0 || !rolled ? '#4CAF50' : '#c9a84c'}`,
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '15px',
          marginTop: '8px',
        }}
      >
        {rolled ? '✅ Confirm Short Rest' : totalSpending > 0 ? '🎲 Roll Hit Dice' : '⛺ Take Short Rest (No Dice)'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  LONG REST PANEL
// ─────────────────────────────────────────────────────────────────────────────
function LongRestPanel({ party, onConfirm }) {
  const preview = party.map(char => {
    const after = longRest(char);
    const hpRestored = after.maxHp - char.hp;
    const hdRestored = after.hitDice.current - (char.hitDice?.current ?? char.level ?? 1);
    const slotRecovery = getSlotRecovery(char, after);
    return { char, after, hpRestored, hdRestored, slotRecovery };
  });

  return (
    <div>
      <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 16px' }}>
        A long rest fully restores HP, recovers half your max Hit Dice, and resets all spell slots.
        Conditions are also cleared.
      </p>

      {/* Preview table */}
      <div style={{ marginBottom: '16px' }}>
        {preview.map(({ char, hpRestored, hdRestored, slotRecovery }) => (
          <div key={char.name} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            marginBottom: '8px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '10px',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#eee', fontSize: '14px' }}>{char.name}</span>
              <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>{char.class}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px' }}>
              {hpRestored > 0 && (
                <span style={{ color: '#4CAF50' }}>
                  ❤️ +{hpRestored} HP → {char.maxHp}/{char.maxHp}
                </span>
              )}
              {hpRestored === 0 && (
                <span style={{ color: '#555' }}>❤️ Full HP</span>
              )}
              {hdRestored > 0 && (
                <span style={{ color: '#FFD54F' }}>🎲 +{hdRestored} HD</span>
              )}
              {slotRecovery.map(s => (
                <span key={s.level} style={{ color: '#9C27B0' }}>
                  ✨ +{s.amount} L{s.level} slots
                </span>
              ))}
              {char.conditions?.length > 0 && (
                <span style={{ color: '#888' }}>🧹 Conditions cleared</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '10px 14px',
        backgroundColor: 'rgba(201,168,76,0.08)',
        border: '1px solid #3a2a00',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#888',
        marginBottom: '16px',
      }}>
        ⚠️ Long rests require 8 hours. Use sparingly — the DM may advance time or trigger events.
      </div>

      <button
        onClick={() => onConfirm(preview.map(p => p.after))}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#1a1200',
          color: '#c9a84c',
          border: '1px solid #c9a84c',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '15px',
        }}
      >
        🌙 Take Long Rest
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN MODAL
// ─────────────────────────────────────────────────────────────────────────────
export default function RestModal({ party, onConfirm, onClose }) {
  const [tab, setTab] = useState('short');
  const [result, setResult] = useState(null); // summary after rest completes

  const handleShortConfirm = (updatedParty, rolls) => {
    const summary = rolls
      .filter(r => r.hpGained > 0)
      .map(r => `${r.name} +${r.hpGained} HP`);

    // Handle Warlock slot recovery summary
    updatedParty.forEach(char => {
      const orig = party.find(p => p.name === char.name);
      if (!orig) return;
      const recovery = getSlotRecovery(orig, char);
      recovery.forEach(s => summary.push(`${char.name} +${s.amount} Pact slot${s.amount > 1 ? 's' : ''}`));
    });

    setResult({
      type: 'short',
      summary: summary.length > 0 ? summary : ['No hit dice spent — rest taken uneventfully.'],
      updatedParty,
    });
  };

  const handleLongConfirm = (updatedParty) => {
    setResult({
      type: 'long',
      summary: ['All HP restored', 'Half Hit Dice recovered', 'All spell slots restored', 'Conditions cleared'],
      updatedParty,
    });
  };

  const handleDone = () => {
    if (result) onConfirm(result.updatedParty, result.type);
    else onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.90)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 6000, padding: '20px',
    }}>
      <style>{`
        @keyframes restFade { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        .rest-card { animation: restFade 0.3s ease-out; }
      `}</style>

      <div className="rest-card" style={{
        backgroundColor: '#0f0f14',
        border: '2px solid #c9a84c',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #222',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1a1200 0%, #0f0f14 100%)',
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#c9a84c', fontSize: '22px' }}>
              {tab === 'short' ? '⛺ Short Rest' : '🌙 Long Rest'}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#666', fontSize: '13px' }}>
              {tab === 'short' ? '~1 hour • Spend hit dice to recover HP' : '~8 hours • Full recovery'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Tab selector */}
        {!result && (
          <div style={{ display: 'flex', borderBottom: '1px solid #222' }}>
            {['short', 'long'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: tab === t ? '#1a1200' : 'transparent',
                  color: tab === t ? '#c9a84c' : '#555',
                  border: 'none',
                  borderBottom: tab === t ? '2px solid #c9a84c' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: tab === t ? 'bold' : 'normal',
                  transition: 'all 0.15s',
                }}
              >
                {t === 'short' ? '⛺ Short Rest' : '🌙 Long Rest'}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Result screen */}
          {result ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {result.type === 'short' ? '⛺' : '🌙'}
              </div>
              <h3 style={{ color: '#c9a84c', margin: '0 0 16px' }}>
                {result.type === 'short' ? 'Short Rest Complete' : 'Long Rest Complete'}
              </h3>
              <div style={{ textAlign: 'left' }}>
                {result.summary.map((s, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    marginBottom: '6px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#aaa',
                    border: '1px solid #2a2a2a',
                  }}>
                    ✓ {s}
                  </div>
                ))}
              </div>
              <button
                onClick={handleDone}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#c9a84c',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '15px',
                }}
              >
                ✅ Continue Adventure
              </button>
            </div>
          ) : tab === 'short' ? (
            <ShortRestPanel party={party} onConfirm={handleShortConfirm} />
          ) : (
            <LongRestPanel party={party} onConfirm={handleLongConfirm} />
          )}

        </div>
      </div>
    </div>
  );
}