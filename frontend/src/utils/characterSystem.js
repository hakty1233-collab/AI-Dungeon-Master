// frontend/src/utils/characterSystem.js

/**
 * D&D 5e Character System
 * Complete character creation, stats, leveling, and progression
 */

import { getFeaturesForLevelRange } from './classFeatures';

// Available classes with their hit dice
export const CLASSES = {
  Barbarian: { hitDie: 12, primaryAbility: 'STR', savingThrows: ['STR', 'CON'] },
  Bard:      { hitDie: 8,  primaryAbility: 'CHA', savingThrows: ['DEX', 'CHA'] },
  Cleric:    { hitDie: 8,  primaryAbility: 'WIS', savingThrows: ['WIS', 'CHA'] },
  Druid:     { hitDie: 8,  primaryAbility: 'WIS', savingThrows: ['INT', 'WIS'] },
  Fighter:   { hitDie: 10, primaryAbility: 'STR', savingThrows: ['STR', 'CON'] },
  Monk:      { hitDie: 8,  primaryAbility: 'DEX', savingThrows: ['STR', 'DEX'] },
  Paladin:   { hitDie: 10, primaryAbility: 'STR', savingThrows: ['WIS', 'CHA'] },
  Ranger:    { hitDie: 10, primaryAbility: 'DEX', savingThrows: ['STR', 'DEX'] },
  Rogue:     { hitDie: 8,  primaryAbility: 'DEX', savingThrows: ['DEX', 'INT'] },
  Sorcerer:  { hitDie: 6,  primaryAbility: 'CHA', savingThrows: ['CON', 'CHA'] },
  Warlock:   { hitDie: 8,  primaryAbility: 'CHA', savingThrows: ['WIS', 'CHA'] },
  Wizard:    { hitDie: 6,  primaryAbility: 'INT', savingThrows: ['INT', 'WIS'] },
};

// Available races with ability bonuses
export const RACES = {
  Human:      { abilityBonus: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 }, speed: 30 },
  Elf:        { abilityBonus: { DEX: 2 }, speed: 30 },
  Dwarf:      { abilityBonus: { CON: 2 }, speed: 25 },
  Halfling:   { abilityBonus: { DEX: 2 }, speed: 25 },
  Dragonborn: { abilityBonus: { STR: 2, CHA: 1 }, speed: 30 },
  Gnome:      { abilityBonus: { INT: 2 }, speed: 25 },
  'Half-Elf': { abilityBonus: { CHA: 2 }, speed: 30 },
  'Half-Orc': { abilityBonus: { STR: 2, CON: 1 }, speed: 30 },
  Tiefling:   { abilityBonus: { INT: 1, CHA: 2 }, speed: 30 },
};

// Skills and their associated abilities
export const SKILLS = {
  Acrobatics:       'DEX',
  'Animal Handling':'WIS',
  Arcana:           'INT',
  Athletics:        'STR',
  Deception:        'CHA',
  History:          'INT',
  Insight:          'WIS',
  Intimidation:     'CHA',
  Investigation:    'INT',
  Medicine:         'WIS',
  Nature:           'INT',
  Perception:       'WIS',
  Performance:      'CHA',
  Persuasion:       'CHA',
  Religion:         'INT',
  'Sleight of Hand':'DEX',
  Stealth:          'DEX',
  Survival:         'WIS',
};

// XP required for each level (index 0 = level 1)
export const XP_TABLE = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
];

// Proficiency bonus by level (index 0 = level 1)
export const PROFICIENCY_BONUS = [
  2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6
];

export const ABILITY_NAMES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
export const MAX_ABILITY_SCORE = 20;

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
  const raceData  = RACES[race];

  // Apply racial bonuses
  const finalAbilities = { ...abilityScores };
  Object.entries(raceData.abilityBonus).forEach(([ability, bonus]) => {
    finalAbilities[ability] = (finalAbilities[ability] || 10) + bonus;
  });

  const conModifier = getModifier(finalAbilities.CON);
  const maxHp       = classData.hitDie + conModifier;

  return {
    name,
    race,
    class: className,
    background,
    level: 1,
    xp: 0,
    abilities: finalAbilities,
    hp: maxHp,
    maxHp,
    tempHp: 0,
    hitDice: { current: 1, max: 1, die: classData.hitDie },
    armorClass: 10 + getModifier(finalAbilities.DEX),
    speed: raceData.speed,
    initiative: getModifier(finalAbilities.DEX),
    proficiencies: {
      armor: [], weapons: [], tools: [],
      savingThrows: classData.savingThrows,
      skills: [],
    },
    inventory: [],
    equippedItems: { weapon: null, armor: null, shield: null, accessories: [] },
    gold: 0,
    spells: { known: [], prepared: [], slots: {}, slotsUsed: {} },
    features: [],
    traits: [],
    conditions: [],
    exhaustion: 0,
    deathSaves: { successes: 0, failures: 0 },
    subclass: null,
  };
}

/**
 * Calculate skill modifier
 */
export function getSkillModifier(character, skill) {
  const ability         = SKILLS[skill];
  const abilityModifier = getModifier(character.abilities[ability]);
  const proficiencyBonus = PROFICIENCY_BONUS[character.level - 1];
  const isProficient    = character.proficiencies.skills.includes(skill);
  return abilityModifier + (isProficient ? proficiencyBonus : 0);
}

/**
 * Calculate saving throw modifier
 */
export function getSavingThrowModifier(character, ability) {
  const abilityModifier  = getModifier(character.abilities[ability]);
  const proficiencyBonus = PROFICIENCY_BONUS[character.level - 1];
  const isProficient     = character.proficiencies.savingThrows.includes(ability);
  return abilityModifier + (isProficient ? proficiencyBonus : 0);
}

/**
 * Add XP — returns the character with new XP plus pendingLevelUp data if
 * they crossed a level threshold. Does NOT immediately apply level-up
 * stats — that happens after player makes choices in LevelUpModal.
 */
export function addExperience(character, xpGained) {
  const newXp      = character.xp + xpGained;
  const oldLevel   = character.level;

  // Find new level
  let newLevel = oldLevel;
  for (let i = 0; i < XP_TABLE.length; i++) {
    if (newXp >= XP_TABLE[i]) newLevel = i + 1;
  }
  newLevel = Math.min(newLevel, 20);

  const levelsGained = newLevel - oldLevel;

  if (levelsGained > 0) {
    // Return character with updated XP and a pendingLevelUp payload
    // The actual stats are NOT applied yet — LevelUpModal does that
    return {
      ...character,
      xp: newXp,
      pendingLevelUp: {
        oldLevel,
        newLevel,
        levelsGained,
        // Pre-calculate HP increase so it can be shown in the modal
        hpIncrease: calculateHPIncrease(character, levelsGained),
      },
      levelsGained, // kept for backwards compat with xpSystem
    };
  }

  return { ...character, xp: newXp, levelsGained: 0 };
}

/**
 * Calculate HP increase for levelling (average roll + CON mod per level).
 */
function calculateHPIncrease(character, levels) {
  const classData    = CLASSES[character.class];
  const conModifier  = getModifier(character.abilities.CON);
  const avgRoll      = Math.ceil(classData.hitDie / 2) + 1;
  return Math.max(1, levels * (avgRoll + conModifier));
}

/**
 * Apply a completed level-up with player choices.
 *
 * choices: {
 *   asi: { [abilityName]: increaseAmount }  // e.g. { STR: 2 } or { DEX: 1, CON: 1 }
 *   subclass: 'subclass_id'                 // if subclass was chosen this level
 *   featuresAcknowledged: true
 * }
 */
export function applyLevelUpChoices(character, choices = {}) {
  if (!character.pendingLevelUp) return character;

  const { oldLevel, newLevel, levelsGained, hpIncrease } = character.pendingLevelUp;
  const classData = CLASSES[character.class];

  // --- Ability scores ---
  let newAbilities = { ...character.abilities };
  if (choices.asi && Object.keys(choices.asi).length > 0) {
    Object.entries(choices.asi).forEach(([ability, amount]) => {
      newAbilities[ability] = Math.min(
        MAX_ABILITY_SCORE,
        (newAbilities[ability] || 10) + amount
      );
    });
    console.log('[LevelUp] ASI applied:', choices.asi);
  }

  // Recalculate derived stats from new ability scores
  const newConMod = getModifier(newAbilities.CON);
  const oldConMod = getModifier(character.abilities.CON);
  // If CON changed, adjust max HP accordingly (beyond the level-up HP)
  const conHpBonus = (newConMod - oldConMod) * newLevel;

  const newMaxHp = character.maxHp + hpIncrease + conHpBonus;
  const newHp    = character.hp + hpIncrease + Math.max(0, conHpBonus);

  // --- Subclass ---
  const newSubclass = choices.subclass || character.subclass;

  // --- Collect new features ---
  const gainedFeatures = getFeaturesForLevelRange(character.class, oldLevel, newLevel)
    .flatMap(({ level, features }) =>
      features
        .filter(f => f.type === 'passive') // ASI and subclass are tracked separately
        .map(f => ({ ...f, gainedAtLevel: level }))
    );

  const updatedFeatures = [
    ...(character.features || []),
    ...gainedFeatures,
  ];

  // --- Hit Dice ---
  const newHitDice = {
    ...character.hitDice,
    max:     newLevel,
    current: Math.min(character.hitDice.current + levelsGained, newLevel),
    die:     classData.hitDie,
  };

  const updatedCharacter = {
    ...character,
    level:      newLevel,
    maxHp:      newMaxHp,
    hp:         Math.min(newHp, newMaxHp),
    abilities:  newAbilities,
    subclass:   newSubclass,
    features:   updatedFeatures,
    hitDice:    newHitDice,
    // Clear pending state
    pendingLevelUp: null,
    levelsGained:   0,
  };

  // Recalculate AC if DEX changed and character is unarmored
  if (choices.asi?.DEX && !character.equippedItems?.armor) {
    updatedCharacter.armorClass = 10 + getModifier(newAbilities.DEX);
  }

  console.log(`[LevelUp] ${character.name}: ${oldLevel} → ${newLevel} | HP: ${character.hp}/${character.maxHp} → ${updatedCharacter.hp}/${updatedCharacter.maxHp}`);
  return updatedCharacter;
}

/**
 * Legacy levelUp — still used in a few places, kept for compatibility.
 * Does an immediate level-up without choices (no ASI applied).
 */
export function levelUp(character, levels = 1, newXp = null) {
  const classData    = CLASSES[character.class];
  const conModifier  = getModifier(character.abilities.CON);
  const avgHitDieRoll = Math.ceil(classData.hitDie / 2) + 1;
  const hpIncrease   = levels * (avgHitDieRoll + conModifier);
  const newLevel     = Math.min(20, character.level + levels);

  return {
    ...character,
    level:  newLevel,
    xp:     newXp !== null ? newXp : character.xp,
    maxHp:  character.maxHp + hpIncrease,
    hp:     character.hp    + hpIncrease,
    hitDice: {
      ...character.hitDice,
      current: newLevel,
      max:     newLevel,
    },
    levelsGained: levels,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  REST, DAMAGE, HEAL  (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export function takeDamage(character, damage) {
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

  return { ...character, hp: Math.max(0, character.hp - remainingDamage), tempHp: newTempHp };
}

export function heal(character, healing) {
  return { ...character, hp: Math.min(character.maxHp, character.hp + healing) };
}

export function shortRest(character, hitDiceUsed = 1) {
  if (character.hitDice.current < hitDiceUsed) return character;

  const classData   = CLASSES[character.class];
  const conModifier = getModifier(character.abilities.CON);
  const healing     = hitDiceUsed * (Math.ceil(classData.hitDie / 2) + conModifier);

  return {
    ...heal(character, healing),
    hitDice: { ...character.hitDice, current: character.hitDice.current - hitDiceUsed }
  };
}

export function longRest(character) {
  const hitDiceRecovered = Math.max(1, Math.floor(character.hitDice.max / 2));
  return {
    ...character,
    hp:     character.maxHp,
    tempHp: 0,
    hitDice: {
      ...character.hitDice,
      current: Math.min(character.hitDice.max, character.hitDice.current + hitDiceRecovered)
    },
    conditions:  [],
    deathSaves:  { successes: 0, failures: 0 },
  };
}