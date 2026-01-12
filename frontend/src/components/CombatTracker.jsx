// frontend/src/components/CombatTracker.jsx
import { useState } from 'react';
import { 
  executeAttack, 
  nextTurn, 
  checkCombatEnd,
  getCurrentCombatant,
  updateCombatant,
  applyDamage
} from '../utils/combatSystem';

export default function CombatTracker({ combat, onUpdate, onEnd }) {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [actionType, setActionType] = useState('attack'); // attack, dodge, help

  if (!combat || !combat.isActive) return null;

  const currentCombatant = getCurrentCombatant(combat);
  const isPlayerTurn = !currentCombatant.isEnemy;

  const handleAttack = (attackIndex = 0) => {
    if (!selectedTarget) {
      alert('Select a target first!');
      return;
    }

    const result = executeAttack(currentCombatant, selectedTarget, attackIndex);
    
    // Log the attack
    const logEntry = result.attackRoll.isCritical ? 
      `💥 CRITICAL HIT! ${result.attacker} hits ${result.target} with ${result.attack} for ${result.damage} ${result.damageType} damage!` :
      result.attackRoll.isFumble ?
      `❌ FUMBLE! ${result.attacker} misses ${result.target} with ${result.attack}!` :
      result.attackRoll.isHit ?
      `⚔️ ${result.attacker} hits ${result.target} with ${result.attack} for ${result.damage} ${result.damageType} damage!` :
      `🛡️ ${result.attacker} misses ${result.target} with ${result.attack}!`;
    
    setCombatLog([logEntry, ...combatLog]);

    // Apply damage
    if (result.attackRoll.isHit) {
      const damagedTarget = applyDamage(selectedTarget, result.damage);
      const updatedCombat = updateCombatant(combat, selectedTarget.id || selectedTarget.name, damagedTarget);
      
      // Check if target died
      if (damagedTarget.isDead) {
        setCombatLog([`💀 ${damagedTarget.name} has been defeated!`, ...combatLog]);
      }
      
      onUpdate(updatedCombat);
      
      // Check combat end
      const endCheck = checkCombatEnd(updatedCombat);
      if (endCheck.ended) {
        setTimeout(() => onEnd(endCheck), 1000);
        return;
      }
    }

    handleEndTurn();
  };

  const handleEndTurn = () => {
    setSelectedTarget(null);
    const newCombat = nextTurn(combat);
    onUpdate(newCombat);

    // Auto enemy turn
    setTimeout(() => {
      if (newCombat.combatants[newCombat.currentTurn]?.isEnemy) {
        handleEnemyTurn(newCombat);
      }
    }, 500);
  };

  const handleEnemyTurn = (currentCombat) => {
    const enemy = getCurrentCombatant(currentCombat);
    if (enemy.isDead) {
      handleEndTurn();
      return;
    }

    // Pick random alive party member
    const aliveParty = currentCombat.combatants.filter(c => !c.isEnemy && !c.isDead);
    if (aliveParty.length === 0) return;

    const target = aliveParty[Math.floor(Math.random() * aliveParty.length)];
    const result = executeAttack(enemy, target, 0);

    const logEntry = result.attackRoll.isCritical ? 
      `💥 CRITICAL! ${result.attacker} critically hits ${result.target} for ${result.damage} damage!` :
      result.attackRoll.isHit ?
      `⚔️ ${result.attacker} hits ${result.target} for ${result.damage} damage!` :
      `🛡️ ${result.attacker} misses ${result.target}!`;
    
    setCombatLog([logEntry, ...combatLog]);

    if (result.attackRoll.isHit) {
      const damagedTarget = applyDamage(target, result.damage);
      let updatedCombat = updateCombatant(currentCombat, target.id || target.name, damagedTarget);
      
      if (damagedTarget.isDead) {
        setCombatLog([`💀 ${damagedTarget.name} has fallen!`, ...combatLog]);
      }

      onUpdate(updatedCombat);

      const endCheck = checkCombatEnd(updatedCombat);
      if (endCheck.ended) {
        setTimeout(() => onEnd(endCheck), 1000);
        return;
      }
    }

    setTimeout(() => handleEndTurn(), 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#1a1a1a',
      border: '3px solid #d32f2f',
      borderBottom: 'none',
      padding: '20px',
      maxHeight: '60vh',
      overflowY: 'auto',
      zIndex: 1000,
      boxShadow: '0 -4px 20px rgba(211,47,47,0.4)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        paddingBottom: '15px',
        borderBottom: '2px solid #444'
      }}>
        <h2 style={{ margin: 0, color: '#d32f2f', fontSize: '24px' }}>
          ⚔️ Combat - Round {combat.round}
        </h2>
        <button
          onClick={() => onEnd({ ended: true, result: 'flee', message: 'Combat ended' })}
          style={{
            padding: '8px 16px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          End Combat
        </button>
      </div>

      {/* Initiative Order */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '15px',
        overflowX: 'auto',
        paddingBottom: '10px'
      }}>
        {combat.combatants.map((combatant, index) => (
          <div
            key={combatant.id || combatant.name}
            style={{
              minWidth: '120px',
              padding: '10px',
              backgroundColor: index === combat.currentTurn ? '#d32f2f' : '#2a2a2a',
              border: index === combat.currentTurn ? '3px solid #ffd700' : '2px solid #444',
              borderRadius: '8px',
              opacity: combatant.isDead ? 0.3 : 1,
              position: 'relative'
            }}
          >
            {index === combat.currentTurn && (
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '24px'
              }}>
                ⬇️
              </div>
            )}
            
            <div style={{
              fontSize: '12px',
              color: combatant.isEnemy ? '#ff6b6b' : '#4CAF50',
              marginBottom: '5px'
            }}>
              {combatant.isEnemy ? '👹' : '🛡️'} Initiative: {combatant.initiative}
            </div>
            
            <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>
              {combatant.name}
            </div>
            
            <div style={{ fontSize: '12px' }}>
              HP: {combatant.hp}/{combatant.maxHp}
            </div>
            
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#1a1a1a',
              borderRadius: '3px',
              marginTop: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(combatant.hp / combatant.maxHp) * 100}%`,
                height: '100%',
                backgroundColor: combatant.hp > combatant.maxHp * 0.5 ? '#4CAF50' : 
                                combatant.hp > combatant.maxHp * 0.25 ? '#ff9800' : '#f44336',
                transition: 'width 0.3s'
              }} />
            </div>

            {combatant.isDead && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                💀
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Combat Log */}
      <div style={{
        backgroundColor: '#0a0a0a',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '15px',
        maxHeight: '100px',
        overflowY: 'auto',
        border: '1px solid #444'
      }}>
        {combatLog.length === 0 ? (
          <p style={{ margin: 0, color: '#888', fontStyle: 'italic' }}>
            Combat begins...
          </p>
        ) : (
          combatLog.map((log, i) => (
            <div key={i} style={{
              padding: '5px',
              marginBottom: '3px',
              color: '#eee',
              fontSize: '14px'
            }}>
              {log}
            </div>
          ))
        )}
      </div>

      {/* Current Turn Actions */}
      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '15px',
        borderRadius: '8px',
        border: '2px solid #ffd700'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#ffd700' }}>
          {currentCombatant.name}'s Turn
        </h3>

        {isPlayerTurn && !currentCombatant.isDead && (
          <div>
            {/* Target Selection */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Select Target:
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {combat.combatants.filter(c => c.isEnemy && !c.isDead).map(enemy => (
                  <button
                    key={enemy.id || enemy.name}
                    onClick={() => setSelectedTarget(enemy)}
                    style={{
                      padding: '10px 15px',
                      backgroundColor: selectedTarget?.name === enemy.name ? '#d32f2f' : '#444',
                      color: 'white',
                      border: selectedTarget?.name === enemy.name ? '2px solid #ffd700' : 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: selectedTarget?.name === enemy.name ? 'bold' : 'normal'
                    }}
                  >
                    {enemy.name} (HP: {enemy.hp}/{enemy.maxHp})
                  </button>
                ))}
              </div>
            </div>

            {/* Attack Buttons */}
            {currentCombatant.attacks && currentCombatant.attacks.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Attack:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {currentCombatant.attacks.map((attack, index) => (
                    <button
                      key={index}
                      onClick={() => handleAttack(index)}
                      disabled={!selectedTarget}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: selectedTarget ? '#4CAF50' : '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: selectedTarget ? 'pointer' : 'not-allowed',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        opacity: selectedTarget ? 1 : 0.5
                      }}
                    >
                      ⚔️ {attack.name} (+{attack.bonus}, {attack.damage})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleEndTurn}
              style={{
                padding: '10px 20px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              End Turn
            </button>
          </div>
        )}

        {!isPlayerTurn && (
          <p style={{ margin: 0, color: '#ff6b6b', fontStyle: 'italic' }}>
            Enemy is thinking...
          </p>
        )}

        {currentCombatant.isDead && (
          <p style={{ margin: 0, color: '#888' }}>
            This combatant is defeated.
          </p>
        )}
      </div>
    </div>
  );
}