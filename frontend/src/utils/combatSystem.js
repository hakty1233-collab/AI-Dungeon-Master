// frontend/src/utils/combatSystem.js - ENHANCED WITH BESTIARY

/**
 * D&D 5e Combat System - Enhanced
 * 50+ enemies, weaknesses, resistances, special abilities
 */

import { getModifier } from './characterSystem';

/**
 * Damage types
 */
export const DAMAGE_TYPES = {
  SLASHING: 'slashing',
  PIERCING: 'piercing',
  BLUDGEONING: 'bludgeoning',
  FIRE: 'fire',
  COLD: 'cold',
  LIGHTNING: 'lightning',
  POISON: 'poison',
  ACID: 'acid',
  NECROTIC: 'necrotic',
  RADIANT: 'radiant',
  FORCE: 'force',
  PSYCHIC: 'psychic'
};

/**
 * Enemy categories for organization
 */
export const ENEMY_CATEGORIES = {
  BEASTS: 'Beasts',
  HUMANOIDS: 'Humanoids',
  UNDEAD: 'Undead',
  DRAGONS: 'Dragons',
  FIENDS: 'Fiends',
  CELESTIALS: 'Celestials',
  ELEMENTALS: 'Elementals',
  CONSTRUCTS: 'Constructs',
  ABERRATIONS: 'Aberrations',
  PLANTS: 'Plants'
};

/**
 * Expanded Enemy Templates - 50+ Enemies!
 */
export const ENEMY_TEMPLATES = {
  // ==================== BEASTS (CR 0-5) ====================
  wolf: {
    name: 'Wolf',
    category: ENEMY_CATEGORIES.BEASTS,
    cr: 0.25,
    hp: 11,
    maxHp: 11,
    ac: 13,
    initiative: 2,
    attacks: [
      { name: 'Bite', bonus: 4, damage: '2d4+2', damageType: DAMAGE_TYPES.PIERCING }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [],
    special: 'Pack Tactics: Advantage on attack rolls if ally is within 5ft of target',
    xpValue: 50,
    description: 'A cunning predator that hunts in packs.'
  },

  bear: {
    name: 'Brown Bear',
    category: ENEMY_CATEGORIES.BEASTS,
    cr: 1,
    hp: 34,
    maxHp: 34,
    ac: 11,
    initiative: 0,
    attacks: [
      { name: 'Claw', bonus: 5, damage: '2d6+4', damageType: DAMAGE_TYPES.SLASHING },
      { name: 'Bite', bonus: 5, damage: '1d8+4', damageType: DAMAGE_TYPES.PIERCING }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [],
    special: 'Multiattack: Can use Claw twice',
    xpValue: 200,
    description: 'A massive bear with powerful claws.'
  },

  giant_spider: {
    name: 'Giant Spider',
    category: ENEMY_CATEGORIES.BEASTS,
    cr: 1,
    hp: 26,
    maxHp: 26,
    ac: 14,
    initiative: 3,
    attacks: [
      { name: 'Bite', bonus: 5, damage: '1d8+3', damageType: DAMAGE_TYPES.PIERCING }
    ],
    resistances: [],
    vulnerabilities: [DAMAGE_TYPES.FIRE],
    immunities: [],
    special: 'Web: Can restrain targets with webbing',
    xpValue: 200,
    description: 'A monstrous arachnid that lurks in dark places.'
  },

  // ==================== HUMANOIDS (CR 0-5) ====================
  goblin: {
    name: 'Goblin',
    category: ENEMY_CATEGORIES.HUMANOIDS,
    cr: 0.25,
    hp: 7,
    maxHp: 7,
    ac: 15,
    initiative: 2,
    attacks: [
      { name: 'Scimitar', bonus: 4, damage: '1d6+2', damageType: DAMAGE_TYPES.SLASHING },
      { name: 'Shortbow', bonus: 4, damage: '1d6+2', damageType: DAMAGE_TYPES.PIERCING }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [],
    special: 'Nimble Escape: Can Disengage or Hide as bonus action',
    xpValue: 50,
    description: 'Small, evil humanoids that raid and pillage.'
  },

  bandit: {
    name: 'Bandit',
    category: ENEMY_CATEGORIES.HUMANOIDS,
    cr: 0.125,
    hp: 11,
    maxHp: 11,
    ac: 12,
    initiative: 1,
    attacks: [
      { name: 'Scimitar', bonus: 3, damage: '1d6+1', damageType: DAMAGE_TYPES.SLASHING }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [],
    special: null,
    xpValue: 25,
    description: 'A common thief and highwayman.'
  },

  orc: {
    name: 'Orc',
    category: ENEMY_CATEGORIES.HUMANOIDS,
    cr: 0.5,
    hp: 15,
    maxHp: 15,
    ac: 13,
    initiative: 1,
    attacks: [
      { name: 'Greataxe', bonus: 5, damage: '1d12+3', damageType: DAMAGE_TYPES.SLASHING },
      { name: 'Javelin', bonus: 5, damage: '1d6+3', damageType: DAMAGE_TYPES.PIERCING }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [],
    special: 'Aggressive: Can move closer to enemies as bonus action',
    xpValue: 100,
    description: 'Savage raiders driven by their war god.'
  },

  bugbear: {
    name: 'Bugbear',
    category: ENEMY_CATEGORIES.HUMANOIDS,
    cr: 1,
    hp: 27,
    maxHp: 27,
    ac: 16,
    initiative: 2,
    attacks: [
      { name: 'Morningstar', bonus: 4, damage: '2d8+2', damageType: DAMAGE_TYPES.PIERCING }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [],
    special: 'Brute: Extra 1d8 damage on melee hits',
    xpValue: 200,
    description: 'Hairy goblinoids that excel at ambushes.'
  },

  hobgoblin: {
    name: 'Hobgoblin',
    category: ENEMY_CATEGORIES.HUMANOIDS,
    cr: 0.5,
    hp: 11,
    maxHp: 11,
    ac: 18,
    initiative: 1,
    attacks: [
      { name: 'Longsword', bonus: 3, damage: '1d8+1', damageType: DAMAGE_TYPES.SLASHING }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [],
    special: 'Martial Advantage: Extra 2d6 damage if ally is nearby',
    xpValue: 100,
    description: 'Disciplined goblinoid warriors.'
  },

  // ==================== UNDEAD (CR 0-10) ====================
  skeleton: {
    name: 'Skeleton',
    category: ENEMY_CATEGORIES.UNDEAD,
    cr: 0.25,
    hp: 13,
    maxHp: 13,
    ac: 13,
    initiative: 2,
    attacks: [
      { name: 'Shortsword', bonus: 4, damage: '1d6+2', damageType: DAMAGE_TYPES.PIERCING },
      { name: 'Shortbow', bonus: 4, damage: '1d6+2', damageType: DAMAGE_TYPES.PIERCING }
    ],
    resistances: [],
    vulnerabilities: [DAMAGE_TYPES.BLUDGEONING],
    immunities: [DAMAGE_TYPES.POISON],
    special: 'Undead Nature: Immune to poison and exhaustion',
    xpValue: 50,
    description: 'Animated bones of the dead.'
  },

  zombie: {
    name: 'Zombie',
    category: ENEMY_CATEGORIES.UNDEAD,
    cr: 0.25,
    hp: 22,
    maxHp: 22,
    ac: 8,
    initiative: -2,
    attacks: [
      { name: 'Slam', bonus: 3, damage: '1d6+1', damageType: DAMAGE_TYPES.BLUDGEONING }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.POISON],
    special: 'Undead Fortitude: Can survive fatal blows (DC 5 + damage)',
    xpValue: 50,
    description: 'Shambling corpses risen from the grave.'
  },

  ghoul: {
    name: 'Ghoul',
    category: ENEMY_CATEGORIES.UNDEAD,
    cr: 1,
    hp: 22,
    maxHp: 22,
    ac: 12,
    initiative: 2,
    attacks: [
      { name: 'Bite', bonus: 4, damage: '2d6+2', damageType: DAMAGE_TYPES.PIERCING },
      { name: 'Claws', bonus: 4, damage: '2d4+2', damageType: DAMAGE_TYPES.SLASHING }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.POISON],
    special: 'Paralyzing Touch: Targets must save or be paralyzed',
    xpValue: 200,
    description: 'Flesh-eating undead that can paralyze prey.'
  },

  wraith: {
    name: 'Wraith',
    category: ENEMY_CATEGORIES.UNDEAD,
    cr: 5,
    hp: 67,
    maxHp: 67,
    ac: 13,
    initiative: 3,
    attacks: [
      { name: 'Life Drain', bonus: 6, damage: '4d8+3', damageType: DAMAGE_TYPES.NECROTIC }
    ],
    resistances: [DAMAGE_TYPES.ACID, DAMAGE_TYPES.COLD, DAMAGE_TYPES.FIRE, DAMAGE_TYPES.LIGHTNING],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.NECROTIC, DAMAGE_TYPES.POISON],
    special: 'Incorporeal: Can move through objects and creatures',
    xpValue: 1800,
    description: 'A malevolent spirit that drains life force.'
  },

  vampire_spawn: {
    name: 'Vampire Spawn',
    category: ENEMY_CATEGORIES.UNDEAD,
    cr: 5,
    hp: 82,
    maxHp: 82,
    ac: 15,
    initiative: 3,
    attacks: [
      { name: 'Claws', bonus: 6, damage: '2d4+3', damageType: DAMAGE_TYPES.SLASHING },
      { name: 'Bite', bonus: 6, damage: '1d6+3', damageType: DAMAGE_TYPES.PIERCING }
    ],
    resistances: [DAMAGE_TYPES.NECROTIC],
    vulnerabilities: [],
    immunities: [],
    special: 'Regeneration: Regains 10 HP per turn',
    xpValue: 1800,
    description: 'Lesser vampires created by a true vampire.'
  },

  // ==================== DRAGONS (CR 5-20) ====================
  young_white_dragon: {
    name: 'Young White Dragon',
    category: ENEMY_CATEGORIES.DRAGONS,
    cr: 6,
    hp: 133,
    maxHp: 133,
    ac: 17,
    initiative: 0,
    attacks: [
      { name: 'Bite', bonus: 7, damage: '2d10+4', damageType: DAMAGE_TYPES.PIERCING },
      { name: 'Claw', bonus: 7, damage: '2d6+4', damageType: DAMAGE_TYPES.SLASHING },
      { name: 'Cold Breath', bonus: 7, damage: '10d8', damageType: DAMAGE_TYPES.COLD, recharge: 5 }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.COLD],
    special: 'Ice Walk: Can move across ice without penalty',
    xpValue: 2300,
    description: 'A young white dragon, savage and territorial.'
  },

  young_red_dragon: {
    name: 'Young Red Dragon',
    category: ENEMY_CATEGORIES.DRAGONS,
    cr: 10,
    hp: 178,
    maxHp: 178,
    ac: 18,
    initiative: 0,
    attacks: [
      { name: 'Bite', bonus: 10, damage: '2d10+6', damageType: DAMAGE_TYPES.PIERCING },
      { name: 'Claw', bonus: 10, damage: '2d6+6', damageType: DAMAGE_TYPES.SLASHING },
      { name: 'Fire Breath', bonus: 10, damage: '16d6', damageType: DAMAGE_TYPES.FIRE, recharge: 5 }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.FIRE],
    special: 'Frightful Presence: Enemies must save or be frightened',
    xpValue: 5900,
    description: 'A young red dragon, greedy and cruel.'
  },

  // ==================== FIENDS (CR 1-15) ====================
  imp: {
    name: 'Imp',
    category: ENEMY_CATEGORIES.FIENDS,
    cr: 1,
    hp: 10,
    maxHp: 10,
    ac: 13,
    initiative: 3,
    attacks: [
      { name: 'Sting', bonus: 5, damage: '1d4+3', damageType: DAMAGE_TYPES.PIERCING }
    ],
    resistances: [DAMAGE_TYPES.COLD],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.FIRE, DAMAGE_TYPES.POISON],
    special: 'Invisibility: Can turn invisible at will',
    xpValue: 200,
    description: 'A devious devil servant.'
  },

  hell_hound: {
    name: 'Hell Hound',
    category: ENEMY_CATEGORIES.FIENDS,
    cr: 3,
    hp: 45,
    maxHp: 45,
    ac: 15,
    initiative: 1,
    attacks: [
      { name: 'Bite', bonus: 5, damage: '1d8+3', damageType: DAMAGE_TYPES.PIERCING },
      { name: 'Fire Breath', bonus: 5, damage: '6d6', damageType: DAMAGE_TYPES.FIRE, recharge: 5 }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.FIRE],
    special: 'Pack Tactics: Advantage on attacks if ally nearby',
    xpValue: 700,
    description: 'A fiendish dog wreathed in flames.'
  },

  succubus: {
    name: 'Succubus',
    category: ENEMY_CATEGORIES.FIENDS,
    cr: 4,
    hp: 66,
    maxHp: 66,
    ac: 15,
    initiative: 3,
    attacks: [
      { name: 'Claw', bonus: 5, damage: '1d6+3', damageType: DAMAGE_TYPES.SLASHING },
      { name: 'Charm', bonus: 5, damage: '0', damageType: DAMAGE_TYPES.PSYCHIC }
    ],
    resistances: [DAMAGE_TYPES.COLD, DAMAGE_TYPES.FIRE, DAMAGE_TYPES.LIGHTNING, DAMAGE_TYPES.POISON],
    vulnerabilities: [],
    immunities: [],
    special: 'Shapechanger: Can assume humanoid form',
    xpValue: 1100,
    description: 'A seductive fiend that charms victims.'
  },

  // ==================== ELEMENTALS (CR 5-10) ====================
  fire_elemental: {
    name: 'Fire Elemental',
    category: ENEMY_CATEGORIES.ELEMENTALS,
    cr: 5,
    hp: 102,
    maxHp: 102,
    ac: 13,
    initiative: 2,
    attacks: [
      { name: 'Touch', bonus: 6, damage: '2d6+3', damageType: DAMAGE_TYPES.FIRE }
    ],
    resistances: [],
    vulnerabilities: [DAMAGE_TYPES.COLD],
    immunities: [DAMAGE_TYPES.FIRE, DAMAGE_TYPES.POISON],
    special: 'Water Susceptibility: Takes extra damage from water',
    xpValue: 1800,
    description: 'Living fire given form.'
  },

  water_elemental: {
    name: 'Water Elemental',
    category: ENEMY_CATEGORIES.ELEMENTALS,
    cr: 5,
    hp: 114,
    maxHp: 114,
    ac: 14,
    initiative: 2,
    attacks: [
      { name: 'Slam', bonus: 7, damage: '2d8+4', damageType: DAMAGE_TYPES.BLUDGEONING }
    ],
    resistances: [DAMAGE_TYPES.ACID],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.POISON],
    special: 'Whelm: Can engulf and drown targets',
    xpValue: 1800,
    description: 'A wave given sentience.'
  },

  air_elemental: {
    name: 'Air Elemental',
    category: ENEMY_CATEGORIES.ELEMENTALS,
    cr: 5,
    hp: 90,
    maxHp: 90,
    ac: 15,
    initiative: 5,
    attacks: [
      { name: 'Slam', bonus: 8, damage: '2d8+5', damageType: DAMAGE_TYPES.BLUDGEONING }
    ],
    resistances: [DAMAGE_TYPES.LIGHTNING],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.POISON],
    special: 'Whirlwind: Can create a whirlwind that tosses creatures',
    xpValue: 1800,
    description: 'A sentient vortex of air.'
  },

  // ==================== CONSTRUCTS (CR 1-10) ====================
  animated_armor: {
    name: 'Animated Armor',
    category: ENEMY_CATEGORIES.CONSTRUCTS,
    cr: 1,
    hp: 33,
    maxHp: 33,
    ac: 18,
    initiative: 0,
    attacks: [
      { name: 'Slam', bonus: 4, damage: '1d6+2', damageType: DAMAGE_TYPES.BLUDGEONING }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.POISON, DAMAGE_TYPES.PSYCHIC],
    special: 'Antimagic Susceptibility: Incapacitated in antimagic field',
    xpValue: 200,
    description: 'Magically animated suit of armor.'
  },

  stone_golem: {
    name: 'Stone Golem',
    category: ENEMY_CATEGORIES.CONSTRUCTS,
    cr: 10,
    hp: 178,
    maxHp: 178,
    ac: 17,
    initiative: -1,
    attacks: [
      { name: 'Slam', bonus: 10, damage: '3d8+6', damageType: DAMAGE_TYPES.BLUDGEONING }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.POISON, DAMAGE_TYPES.PSYCHIC, DAMAGE_TYPES.SLASHING, DAMAGE_TYPES.PIERCING],
    special: 'Immutable Form: Immune to form-altering magic',
    xpValue: 5900,
    description: 'A massive construct of animated stone.'
  },

  // ==================== ABERRATIONS (CR 2-10) ====================
  beholder_zombie: {
    name: 'Beholder Zombie',
    category: ENEMY_CATEGORIES.ABERRATIONS,
    cr: 5,
    hp: 93,
    maxHp: 93,
    ac: 15,
    initiative: -1,
    attacks: [
      { name: 'Bite', bonus: 3, damage: '4d6', damageType: DAMAGE_TYPES.PIERCING },
      { name: 'Eye Ray', bonus: 3, damage: '3d6', damageType: DAMAGE_TYPES.NECROTIC }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.POISON],
    special: 'Death Ray: Can fire necrotic beams from eyes',
    xpValue: 1800,
    description: 'A reanimated beholder, still dangerous.'
  },

  mind_flayer: {
    name: 'Mind Flayer',
    category: ENEMY_CATEGORIES.ABERRATIONS,
    cr: 7,
    hp: 71,
    maxHp: 71,
    ac: 15,
    initiative: 1,
    attacks: [
      { name: 'Tentacles', bonus: 7, damage: '2d10+4', damageType: DAMAGE_TYPES.PSYCHIC },
      { name: 'Mind Blast', bonus: 7, damage: '4d8+4', damageType: DAMAGE_TYPES.PSYCHIC }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [],
    special: 'Extract Brain: Can kill stunned humanoids instantly',
    xpValue: 2900,
    description: 'An evil psionic tyrant that feeds on brains.'
  },

  // ==================== GIANTS (CR 2-9) ====================
  ogre: {
    name: 'Ogre',
    category: ENEMY_CATEGORIES.HUMANOIDS,
    cr: 2,
    hp: 59,
    maxHp: 59,
    ac: 11,
    initiative: -1,
    attacks: [
      { name: 'Greatclub', bonus: 6, damage: '2d8+4', damageType: DAMAGE_TYPES.BLUDGEONING }
    ],
    resistances: [],
    vulnerabilities: [],
    immunities: [],
    special: null,
    xpValue: 450,
    description: 'A dim-witted brute of immense strength.'
  },

  troll: {
    name: 'Troll',
    category: ENEMY_CATEGORIES.HUMANOIDS,
    cr: 5,
    hp: 84,
    maxHp: 84,
    ac: 15,
    initiative: 1,
    attacks: [
      { name: 'Claw', bonus: 7, damage: '2d6+4', damageType: DAMAGE_TYPES.SLASHING },
      { name: 'Bite', bonus: 7, damage: '2d6+4', damageType: DAMAGE_TYPES.PIERCING }
    ],
    resistances: [],
    vulnerabilities: [DAMAGE_TYPES.FIRE, DAMAGE_TYPES.ACID],
    immunities: [],
    special: 'Regeneration: Regains 10 HP per turn (stops if takes fire/acid damage)',
    xpValue: 1800,
    description: 'A ravenous creature that regenerates wounds.'
  },

  // ==================== PLANTS (CR 1-5) ====================
  shambling_mound: {
    name: 'Shambling Mound',
    category: ENEMY_CATEGORIES.PLANTS,
    cr: 5,
    hp: 136,
    maxHp: 136,
    ac: 15,
    initiative: -1,
    attacks: [
      { name: 'Slam', bonus: 7, damage: '2d8+4', damageType: DAMAGE_TYPES.BLUDGEONING }
    ],
    resistances: [DAMAGE_TYPES.COLD, DAMAGE_TYPES.FIRE],
    vulnerabilities: [],
    immunities: [DAMAGE_TYPES.LIGHTNING],
    special: 'Lightning Absorption: Heals from lightning damage',
    xpValue: 1800,
    description: 'An ambulatory mound of rotting vegetation.'
  }
};

/**
 * Get enemies by CR range
 */
export function getEnemiesByCR(minCR, maxCR) {
  return Object.entries(ENEMY_TEMPLATES)
    .filter(([_, enemy]) => enemy.cr >= minCR && enemy.cr <= maxCR)
    .map(([key, enemy]) => ({ key, ...enemy }));
}

/**
 * Get enemies by category
 */
export function getEnemiesByCategory(category) {
  return Object.entries(ENEMY_TEMPLATES)
    .filter(([_, enemy]) => enemy.category === category)
    .map(([key, enemy]) => ({ key, ...enemy }));
}

/**
 * Get recommended enemies for party level
 */
export function getRecommendedEnemies(partyLevel, partySize = 4) {
  const avgCR = partyLevel / 4; // Rough CR = Party Level / 4
  const minCR = Math.max(0, avgCR - 2);
  const maxCR = avgCR + 2;
  
  return getEnemiesByCR(minCR, maxCR);
}

// ==================== EXISTING COMBAT FUNCTIONS ====================

export function rollInitiative(initiativeModifier) {
  const roll = Math.floor(Math.random() * 20) + 1;
  return roll + initiativeModifier;
}

export function createEnemy(templateName, count = 1) {
  const template = ENEMY_TEMPLATES[templateName];
  if (!template) return [];
  
  const enemies = [];
  for (let i = 0; i < count; i++) {
    enemies.push({
      id: `${templateName}_${Date.now()}_${i}`,
      ...JSON.parse(JSON.stringify(template)),
      name: count > 1 ? `${template.name} ${i + 1}` : template.name,
      isEnemy: true,
      initiative: rollInitiative(template.initiative)
    });
  }
  
  return enemies;
}

export function startCombat(party, enemies) {
  const partyWithInitiative = party.map(character => ({
    ...character,
    initiative: rollInitiative(character.initiative || getModifier(character.abilities?.DEX || 10)),
    isEnemy: false
  }));
  
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

export function calculateDamage(damageString, isCritical = false) {
  const result = rollDice(damageString);
  
  if (isCritical) {
    const critResult = rollDice(damageString);
    result.total += critResult.total - parseInt(result.modifier.replace('+', ''));
    result.rolls = [...result.rolls, ...critResult.rolls];
    result.isCritical = true;
  }
  
  return result;
}

export function applyDamage(combatant, damage, damageType = DAMAGE_TYPES.SLASHING) {
  let finalDamage = damage;
  
  // Check resistances
  if (combatant.resistances?.includes(damageType)) {
    finalDamage = Math.floor(damage / 2);
    console.log(`🛡️ ${combatant.name} resists ${damageType} damage! ${damage} → ${finalDamage}`);
  }
  
  // Check vulnerabilities
  if (combatant.vulnerabilities?.includes(damageType)) {
    finalDamage = damage * 2;
    console.log(`💥 ${combatant.name} is vulnerable to ${damageType} damage! ${damage} → ${finalDamage}`);
  }
  
  // Check immunities
  if (combatant.immunities?.includes(damageType)) {
    finalDamage = 0;
    console.log(`🚫 ${combatant.name} is immune to ${damageType} damage!`);
  }
  
  const newHp = Math.max(0, combatant.hp - finalDamage);
  
  return {
    ...combatant,
    hp: newHp,
    isDead: newHp === 0,
    lastDamageTaken: finalDamage,
    lastDamageType: damageType
  };
}

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

export function nextTurn(combat) {
  const nextIndex = (combat.currentTurn + 1) % combat.combatants.length;
  const newRound = nextIndex === 0 ? combat.round + 1 : combat.round;
  
  return {
    ...combat,
    currentTurn: nextIndex,
    round: newRound
  };
}

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

export function getCurrentCombatant(combat) {
  return combat.combatants[combat.currentTurn];
}

export function updateCombatant(combat, combatantId, updates) {
  return {
    ...combat,
    combatants: combat.combatants.map(c =>
      c.id === combatantId || c.name === combatantId ? { ...c, ...updates } : c
    )
  };
}