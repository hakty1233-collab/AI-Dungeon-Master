// frontend/src/utils/combatSystem.js

/**
 * D&D 5e Combat System
 * Initiative tracking, turn order, attacks, damage
 */

import { getModifier } from './characterSystem';

/**
 * Enemy templates
 */
export const ENEMY_TEMPLATES = {
  // CR 1/8
  goblin: {
    name: 'Goblin',
    cr: 0.125,
    hp: 7,
    maxHp: 7,
    ac: 15,
    initiative: 2,
    attacks: [
      { name: 'Scimitar', bonus: 4, damage: '1d6+2', damageType: 'slashing' }
    ],
    xpValue: 25
  },
  
  // CR 1/4
  skeleton: {
    name: 'Skeleton',
    cr: 0.25,
    hp: 13,
    maxHp: 13,
    ac: 13,
    initiative: 2,
    attacks: [
      { name: 'Shortsword', bonus: 4, damage: '1d6+2', damageType: 'piercing' }
    ],
    xpValue: 50
  },
  
  // CR 1/2
  orc: {
    name: 'Orc',
    cr: 0.5,
    hp: 15,
    maxHp: 15,
    ac: 13,
    initiative: 1,
    attacks: [
      { name: 'Greataxe', bonus: 5, damage: '1d12+3', damageType: 'slashing' }
    ],
    xpValue: 100
  },
  
  // CR 1
  bugbear: {
    name: 'Bugbear',
    cr: 1,
    hp: 27,
    maxHp: 27,
    ac: 16,
    initiative: 2,
    attacks: [
      { name: 'Morningstar', bonus: 4, damage: '2d8+2', damageType: 'piercing' }
    ],
    xpValue: 200
  },
  
  // CR 2
  ogre: {
    name: 'Ogre',
    cr: 2,
    hp: 59,
    maxHp: 59,
    ac: 11,
    initiative: -1,
    attacks: [
      { name: 'Greatclub', bonus: 6, damage: '2d8+4', damageType: 'bludgeoning' }
    ],
    xpValue: 450
  },
  
  // CR 5
  troll: {
    name: 'Troll',
    cr: 5,
    hp: 84,
    maxHp: 84,
    ac: 15,
    initiative: 1,
    attacks: [
      { name: 'Claw', bonus: 7, damage: '2d6+4', damageType: 'slashing' },
      { name: 'Bite', bonus: 7, damage: '2d6+4', damageType: 'piercing' }
    ],
    xpValue: 1800,
    special: 'Regeneration: 10 HP per turn (not on fire/acid damage)'
  },
  
  // Boss - CR 10
  young_dragon: {
    name: 'Young Red Dragon',
    cr: 10,
    hp: 178,
    maxHp: 178,
    ac: 18,
    initiative: 0,
    attacks: [
      { name: 'Bite', bonus: 10, damage: '2d10+6', damageType: 'piercing' },
      { name: 'Claw', bonus: 10, damage: '2d6+6', damageType: 'slashing' },
      { name: 'Fire Breath', bonus: 10, damage: '16d6', damageType: 'fire', recharge: 5 }
    ],
    xpValue: 5900,
    special: 'Legendary Resistance (3/day), Frightful Presence'
  }
};

/**
 * Roll initiative for a combatant
 */
export function rollInitiative(initiativeModifier) {
  const roll = Math.floor(Math.random() * 20) + 1;
  return roll + initiativeModifier;
}

/**
 * Create enemy from template
 */
export function createEnemy(templateName, count = 1) {
  const template = ENEMY_TEMPLATES[templateName];
  if (!template) return [];
  
  const enemies = [];
  for (let i = 0; i < count; i++) {
    enemies.push({
      id: `${templateName}_${Date.now()}_${i}`,
      ...JSON.parse(JSON.stringify(template)), // Deep clone
      name: count > 1 ? `${template.name} ${i + 1}` : template.name,
      isEnemy: true,
      initiative: rollInitiative(template.initiative)
    });
  }
  
  return enemies;
}

/**
 * Start combat with party and enemies
 */
export function startCombat(party, enemies) {
  // Roll initiative for all party members
  const partyWithInitiative = party.map(character => ({
    ...character,
    initiative: rollInitiative(character.initiative || getModifier(character.abilities?.DEX || 10)),
    isEnemy: false
  }));
  
  // Combine and sort by initiative (highest first)
  const combatants = [...partyWithInitiative, ...enemies].sort(
    (a, b) => b.initiative - a.initiative
  );
  
  return {
    combatants,
    currentTurn: 0,
    round: 1,
    isActive: true,
    log: []
  };
}

/**
 * Roll dice (e.g., "2d6+3")
 */
export function rollDice(diceString) {
  const match = diceString.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return 0;
  
  const [, numDice, dieSize, modifier] = match;
  let total = 0;
  const rolls = [];
  
  for (let i = 0; i < parseInt(numDice); i++) {
    const roll = Math.floor(Math.random() * parseInt(dieSize)) + 1;
    rolls.push(roll);
    total += roll;
  }
  
  if (modifier) {
    total += parseInt(modifier);
  }
  
  return { total, rolls, modifier: modifier || '+0' };
}

/**
 * Make an attack roll
 */
export function makeAttackRoll(attackBonus, targetAC) {
  const d20Roll = Math.floor(Math.random() * 20) + 1;
  const totalRoll = d20Roll + attackBonus;
  
  const isCritical = d20Roll === 20;
  const isFumble = d20Roll === 1;
  const isHit = isCritical || (!isFumble && totalRoll >= targetAC);
  
  return {
    d20Roll,
    totalRoll,
    isHit,
    isCritical,
    isFumble
  };
}

/**
 * Calculate damage
 */
export function calculateDamage(damageString, isCritical = false) {
  const result = rollDice(damageString);
  
  if (isCritical) {
    // Critical hits double the dice
    const critResult = rollDice(damageString);
    result.total += critResult.total - parseInt(result.modifier.replace('+', ''));
    result.rolls = [...result.rolls, ...critResult.rolls];
    result.isCritical = true;
  }
  
  return result;
}

/**
 * Apply damage to a combatant
 */
export function applyDamage(combatant, damage) {
  const newHp = Math.max(0, combatant.hp - damage);
  
  return {
    ...combatant,
    hp: newHp,
    isDead: newHp === 0
  };
}

/**
 * Execute an attack
 */
export function executeAttack(attacker, target, attackIndex = 0) {
  const attack = attacker.attacks?.[attackIndex];
  if (!attack) return null;
  
  const attackRoll = makeAttackRoll(attack.bonus, target.ac || target.armorClass);
  
  let damage = 0;
  let damageRoll = null;
  
  if (attackRoll.isHit) {
    damageRoll = calculateDamage(attack.damage, attackRoll.isCritical);
    damage = damageRoll.total;
  }
  
  return {
    attacker: attacker.name,
    target: target.name,
    attack: attack.name,
    attackRoll,
    damageRoll,
    damage,
    damageType: attack.damageType
  };
}

/**
 * Next turn
 */
export function nextTurn(combat) {
  const nextIndex = (combat.currentTurn + 1) % combat.combatants.length;
  const newRound = nextIndex === 0 ? combat.round + 1 : combat.round;
  
  return {
    ...combat,
    currentTurn: nextIndex,
    round: newRound
  };
}

/**
 * Check if combat is over
 */
export function checkCombatEnd(combat) {
  const aliveParty = combat.combatants.filter(c => !c.isEnemy && !c.isDead);
  const aliveEnemies = combat.combatants.filter(c => c.isEnemy && !c.isDead);
  
  if (aliveParty.length === 0) {
    return { ended: true, result: 'defeat', message: 'The party has fallen...' };
  }
  
  if (aliveEnemies.length === 0) {
    const totalXP = combat.combatants
      .filter(c => c.isEnemy)
      .reduce((sum, e) => sum + (e.xpValue || 0), 0);
    
    return { 
      ended: true, 
      result: 'victory', 
      message: 'Victory! All enemies defeated!',
      xpReward: totalXP
    };
  }
  
  return { ended: false };
}

/**
 * Get current combatant
 */
export function getCurrentCombatant(combat) {
  return combat.combatants[combat.currentTurn];
}

/**
 * Update combatant in combat
 */
export function updateCombatant(combat, combatantId, updates) {
  return {
    ...combat,
    combatants: combat.combatants.map(c =>
      c.id === combatantId || c.name === combatantId ? { ...c, ...updates } : c
    )
  };
}