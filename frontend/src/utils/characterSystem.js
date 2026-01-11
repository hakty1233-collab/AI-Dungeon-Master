// frontend/src/utils/characterSystem.js

/**
 * D&D 5e Character System
 * Complete character creation, stats, leveling, and progression
 */

// Available classes with their hit dice
export const CLASSES = {
  Barbarian: { hitDie: 12, primaryAbility: 'STR', savingThrows: ['STR', 'CON'] },
  Bard: { hitDie: 8, primaryAbility: 'CHA', savingThrows: ['DEX', 'CHA'] },
  Cleric: { hitDie: 8, primaryAbility: 'WIS', savingThrows: ['WIS', 'CHA'] },
  Druid: { hitDie: 8, primaryAbility: 'WIS', savingThrows: ['INT', 'WIS'] },
  Fighter: { hitDie: 10, primaryAbility: 'STR', savingThrows: ['STR', 'CON'] },
  Monk: { hitDie: 8, primaryAbility: 'DEX', savingThrows: ['STR', 'DEX'] },
  Paladin: { hitDie: 10, primaryAbility: 'STR', savingThrows: ['WIS', 'CHA'] },
  Ranger: { hitDie: 10, primaryAbility: 'DEX', savingThrows: ['STR', 'DEX'] },
  Rogue: { hitDie: 8, primaryAbility: 'DEX', savingThrows: ['DEX', 'INT'] },
  Sorcerer: { hitDie: 6, primaryAbility: 'CHA', savingThrows: ['CON', 'CHA'] },
  Warlock: { hitDie: 8, primaryAbility: 'CHA', savingThrows: ['WIS', 'CHA'] },
  Wizard: { hitDie: 6, primaryAbility: 'INT', savingThrows: ['INT', 'WIS'] },
};

// Available races with ability bonuses
export const RACES = {
  Human: { abilityBonus: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 }, speed: 30 },
  Elf: { abilityBonus: { DEX: 2 }, speed: 30 },
  Dwarf: { abilityBonus: { CON: 2 }, speed: 25 },
  Halfling: { abilityBonus: { DEX: 2 }, speed: 25 },
  Dragonborn: { abilityBonus: { STR: 2, CHA: 1 }, speed: 30 },
  Gnome: { abilityBonus: { INT: 2 }, speed: 25 },
  'Half-Elf': { abilityBonus: { CHA: 2 }, speed: 30 },
  'Half-Orc': { abilityBonus: { STR: 2, CON: 1 }, speed: 30 },
  Tiefling: { abilityBonus: { INT: 1, CHA: 2 }, speed: 30 },
};

// Skills and their associated abilities
export const SKILLS = {
  Acrobatics: 'DEX',
  'Animal Handling': 'WIS',
  Arcana: 'INT',
  Athletics: 'STR',
  Deception: 'CHA',
  History: 'INT',
  Insight: 'WIS',
  Intimidation: 'CHA',
  Investigation: 'INT',
  Medicine: 'WIS',
  Nature: 'INT',
  Perception: 'WIS',
  Performance: 'CHA',
  Persuasion: 'CHA',
  Religion: 'INT',
  'Sleight of Hand': 'DEX',
  Stealth: 'DEX',
  Survival: 'WIS',
};

// XP required for each level
export const XP_TABLE = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
];

// Proficiency bonus by level
export const PROFICIENCY_BONUS = [
  2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6
];

/**
 * Calculate ability modifier from ability score
 */
export function getModifier(score) {
  return Math.floor((score - 10) / 2);
}

/**
 * Create a new character
 */
export function createCharacter({
  name,
  race,
  className,
  background = '',
  abilityScores = { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }
}) {
  const classData = CLASSES[className];
  const raceData = RACES[race];
  
  // Apply racial bonuses
  const finalAbilities = { ...abilityScores };
  Object.entries(raceData.abilityBonus).forEach(([ability, bonus]) => {
    finalAbilities[ability] = (finalAbilities[ability] || 10) + bonus;
  });
  
  // Calculate max HP (max hit die + CON modifier at level 1)
  const conModifier = getModifier(finalAbilities.CON);
  const maxHp = classData.hitDie + conModifier;
  
  return {
    name,
    race,
    class: className,
    background,
    level: 1,
    xp: 0,
    
    // Ability scores
    abilities: finalAbilities,
    
    // Hit points
    hp: maxHp,
    maxHp: maxHp,
    tempHp: 0,
    hitDice: { current: 1, max: 1, die: classData.hitDie },
    
    // Combat stats
    armorClass: 10 + getModifier(finalAbilities.DEX),
    speed: raceData.speed,
    initiative: getModifier(finalAbilities.DEX),
    
    // Proficiencies
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      savingThrows: classData.savingThrows,
      skills: [],
    },
    
    // Equipment
    inventory: [],
    equippedItems: {
      weapon: null,
      armor: null,
      shield: null,
      accessories: []
    },
    gold: 0,
    
    // Spells (if applicable)
    spells: {
      known: [],
      prepared: [],
      slots: {},
      slotsUsed: {}
    },
    
    // Features and traits
    features: [],
    traits: [],
    
    // Status
    conditions: [],
    exhaustion: 0,
    
    // Death saves
    deathSaves: { successes: 0, failures: 0 },
  };
}

/**
 * Calculate skill modifier
 */
export function getSkillModifier(character, skill) {
  const ability = SKILLS[skill];
  const abilityModifier = getModifier(character.abilities[ability]);
  const proficiencyBonus = PROFICIENCY_BONUS[character.level - 1];
  const isProficient = character.proficiencies.skills.includes(skill);
  
  return abilityModifier + (isProficient ? proficiencyBonus : 0);
}

/**
 * Calculate saving throw modifier
 */
export function getSavingThrowModifier(character, ability) {
  const abilityModifier = getModifier(character.abilities[ability]);
  const proficiencyBonus = PROFICIENCY_BONUS[character.level - 1];
  const isProficient = character.proficiencies.savingThrows.includes(ability);
  
  return abilityModifier + (isProficient ? proficiencyBonus : 0);
}

/**
 * Add XP and check for level up
 */
export function addExperience(character, xpGained) {
  const newXp = character.xp + xpGained;
  const currentLevel = character.level;
  
  // Find new level based on XP
  let newLevel = currentLevel;
  for (let i = 0; i < XP_TABLE.length; i++) {
    if (newXp >= XP_TABLE[i]) {
      newLevel = i + 1;
    }
  }
  
  const levelsGained = newLevel - currentLevel;
  
  if (levelsGained > 0) {
    return levelUp(character, levelsGained, newXp);
  }
  
  return {
    ...character,
    xp: newXp,
    levelsGained: 0
  };
}

/**
 * Level up character
 */
export function levelUp(character, levels = 1, newXp = null) {
  const classData = CLASSES[character.class];
  const conModifier = getModifier(character.abilities.CON);
  
  // Calculate HP increase (average of hit die + CON modifier per level)
  const avgHitDieRoll = Math.ceil(classData.hitDie / 2) + 1;
  const hpIncrease = levels * (avgHitDieRoll + conModifier);
  
  const newLevel = character.level + levels;
  
  return {
    ...character,
    level: newLevel,
    xp: newXp !== null ? newXp : character.xp,
    maxHp: character.maxHp + hpIncrease,
    hp: character.hp + hpIncrease,
    hitDice: {
      ...character.hitDice,
      current: newLevel,
      max: newLevel
    },
    levelsGained: levels
  };
}

/**
 * Take damage
 */
export function takeDamage(character, damage) {
  // Temp HP absorbs damage first
  let remainingDamage = damage;
  let newTempHp = character.tempHp;
  
  if (newTempHp > 0) {
    if (damage >= newTempHp) {
      remainingDamage -= newTempHp;
      newTempHp = 0;
    } else {
      newTempHp -= damage;
      remainingDamage = 0;
    }
  }
  
  const newHp = Math.max(0, character.hp - remainingDamage);
  
  return {
    ...character,
    hp: newHp,
    tempHp: newTempHp
  };
}

/**
 * Heal character
 */
export function heal(character, healing) {
  const newHp = Math.min(character.maxHp, character.hp + healing);
  
  return {
    ...character,
    hp: newHp
  };
}

/**
 * Short rest (recover some HP and resources)
 */
export function shortRest(character, hitDiceUsed = 1) {
  if (character.hitDice.current < hitDiceUsed) {
    return character;
  }
  
  const classData = CLASSES[character.class];
  const conModifier = getModifier(character.abilities.CON);
  
  // Roll hit dice for healing
  const healing = hitDiceUsed * (Math.ceil(classData.hitDie / 2) + conModifier);
  
  return {
    ...heal(character, healing),
    hitDice: {
      ...character.hitDice,
      current: character.hitDice.current - hitDiceUsed
    }
  };
}

/**
 * Long rest (recover all HP and resources)
 */
export function longRest(character) {
  const hitDiceRecovered = Math.max(1, Math.floor(character.hitDice.max / 2));
  
  return {
    ...character,
    hp: character.maxHp,
    tempHp: 0,
    hitDice: {
      ...character.hitDice,
      current: Math.min(
        character.hitDice.max,
        character.hitDice.current + hitDiceRecovered
      )
    },
    conditions: [],
    deathSaves: { successes: 0, failures: 0 }
  };
}