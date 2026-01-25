// frontend/src/utils/statusEffectSystem.js

/**
 * D&D 5e Status Effects System
 * Handles conditions, durations, and their mechanical effects
 */

// Status effect types
export const STATUS_EFFECTS = {
  // D&D 5e Conditions
  BLINDED: 'blinded',
  CHARMED: 'charmed',
  DEAFENED: 'deafened',
  FRIGHTENED: 'frightened',
  GRAPPLED: 'grappled',
  INCAPACITATED: 'incapacitated',
  INVISIBLE: 'invisible',
  PARALYZED: 'paralyzed',
  PETRIFIED: 'petrified',
  POISONED: 'poisoned',
  PRONE: 'prone',
  RESTRAINED: 'restrained',
  STUNNED: 'stunned',
  UNCONSCIOUS: 'unconscious',
  EXHAUSTION: 'exhaustion',
  
  // Additional common effects
  CONCENTRATING: 'concentrating',
  BLESSED: 'blessed',
  BANED: 'baned',
  HASTED: 'hasted',
  SLOWED: 'slowed',
  RAGING: 'raging',
  DODGING: 'dodging',
  HIDING: 'hiding',
  INVISIBLE: 'invisible',
  FLYING: 'flying',
  BURNING: 'burning',
  BLEEDING: 'bleeding',
};

// Duration types
export const DURATION_TYPES = {
  INSTANT: 'instant',           // Happens immediately, no duration
  ROUNDS: 'rounds',             // Lasts X combat rounds
  MINUTES: 'minutes',           // Lasts X minutes
  HOURS: 'hours',               // Lasts X hours
  SAVE_ENDS: 'save_ends',       // Lasts until successful save
  CONCENTRATION: 'concentration', // Lasts while concentrating
  PERMANENT: 'permanent',        // Lasts until removed
  END_OF_TURN: 'end_of_turn',   // Ends at end of target's turn
  START_OF_TURN: 'start_of_turn', // Ends at start of target's turn
};

// Status effect definitions with mechanical effects
export const STATUS_EFFECT_DEFINITIONS = {
  [STATUS_EFFECTS.BLINDED]: {
    name: 'Blinded',
    icon: '👁️',
    color: '#666',
    description: 'Cannot see. Attacks have disadvantage. Attacks against have advantage.',
    effects: {
      attackDisadvantage: true,
      attackedWithAdvantage: true,
      autoFailAbilityChecks: ['sight-based']
    },
    canStack: false,
    removedBy: ['cure', 'dispel', 'lesser_restoration'],
  },

  [STATUS_EFFECTS.CHARMED]: {
    name: 'Charmed',
    icon: '💖',
    color: '#E91E63',
    description: 'Cannot attack charmer. Charmer has advantage on social checks.',
    effects: {
      cannotAttackCharmer: true,
      charmerHasAdvantage: true
    },
    canStack: false,
    removedBy: ['damage', 'calm_emotions', 'dispel'],
  },

  [STATUS_EFFECTS.FRIGHTENED]: {
    name: 'Frightened',
    icon: '😱',
    color: '#9C27B0',
    description: 'Disadvantage on ability checks and attacks while source is in sight. Cannot move closer to source.',
    effects: {
      attackDisadvantage: true,
      abilityCheckDisadvantage: true,
      cannotApproachSource: true
    },
    canStack: false,
    removedBy: ['calm_emotions', 'dispel'],
  },

  [STATUS_EFFECTS.GRAPPLED]: {
    name: 'Grappled',
    icon: '🤼',
    color: '#FF9800',
    description: 'Speed becomes 0. Cannot benefit from speed bonuses.',
    effects: {
      speedReduction: 'zero',
      noSpeedBonus: true
    },
    canStack: false,
    removedBy: ['escape', 'forced_movement', 'incapacitated'],
  },

  [STATUS_EFFECTS.INCAPACITATED]: {
    name: 'Incapacitated',
    icon: '😵',
    color: '#795548',
    description: 'Cannot take actions or reactions.',
    effects: {
      cannotAct: true,
      cannotReact: true,
      dropsConcentration: true
    },
    canStack: false,
    removedBy: ['cure', 'time'],
  },

  [STATUS_EFFECTS.INVISIBLE]: {
    name: 'Invisible',
    icon: '👻',
    color: '#00BCD4',
    description: 'Impossible to see without special sense. Attacks have advantage. Attacks against have disadvantage.',
    effects: {
      attackAdvantage: true,
      attackedWithDisadvantage: true,
      canHide: true
    },
    canStack: false,
    removedBy: ['dispel', 'attack', 'cast_spell'],
  },

  [STATUS_EFFECTS.PARALYZED]: {
    name: 'Paralyzed',
    icon: '🥶',
    color: '#2196F3',
    description: 'Incapacitated. Cannot move or speak. Auto-fail STR/DEX saves. Attacks have advantage. Hits within 5ft are critical.',
    effects: {
      cannotAct: true,
      cannotMove: true,
      cannotSpeak: true,
      autoFailSaves: ['STR', 'DEX'],
      attackedWithAdvantage: true,
      nearbyHitsAreCritical: true,
      dropsConcentration: true
    },
    canStack: false,
    removedBy: ['lesser_restoration', 'dispel'],
  },

  [STATUS_EFFECTS.PETRIFIED]: {
    name: 'Petrified',
    icon: '🗿',
    color: '#607D8B',
    description: 'Turned to stone. Incapacitated. Cannot move or speak. Resistant to all damage. Immune to poison and disease.',
    effects: {
      cannotAct: true,
      cannotMove: true,
      cannotSpeak: true,
      resistAllDamage: true,
      immunePoison: true,
      immuneDisease: true,
      dropsConcentration: true
    },
    canStack: false,
    removedBy: ['greater_restoration', 'wish'],
  },

  [STATUS_EFFECTS.POISONED]: {
    name: 'Poisoned',
    icon: '🤢',
    color: '#8BC34A',
    description: 'Disadvantage on attack rolls and ability checks.',
    effects: {
      attackDisadvantage: true,
      abilityCheckDisadvantage: true
    },
    canStack: false,
    removedBy: ['lesser_restoration', 'antitoxin', 'time'],
  },

  [STATUS_EFFECTS.PRONE]: {
    name: 'Prone',
    icon: '🤕',
    color: '#795548',
    description: 'Only crawl or stand up. Disadvantage on attacks. Melee attacks against have advantage, ranged have disadvantage.',
    effects: {
      attackDisadvantage: true,
      meleeAttackedWithAdvantage: true,
      rangedAttackedWithDisadvantage: true,
      movementCost: 'half'
    },
    canStack: false,
    removedBy: ['stand_up'],
  },

  [STATUS_EFFECTS.RESTRAINED]: {
    name: 'Restrained',
    icon: '⛓️',
    color: '#9E9E9E',
    description: 'Speed becomes 0. Attacks have disadvantage. Attacks against have advantage. Disadvantage on DEX saves.',
    effects: {
      speedReduction: 'zero',
      attackDisadvantage: true,
      attackedWithAdvantage: true,
      savingThrowDisadvantage: ['DEX']
    },
    canStack: false,
    removedBy: ['escape', 'dispel'],
  },

  [STATUS_EFFECTS.STUNNED]: {
    name: 'Stunned',
    icon: '😵‍💫',
    color: '#FFC107',
    description: 'Incapacitated. Cannot move. Can only speak falteringly. Auto-fail STR/DEX saves. Attacks against have advantage.',
    effects: {
      cannotAct: true,
      cannotMove: true,
      limitedSpeech: true,
      autoFailSaves: ['STR', 'DEX'],
      attackedWithAdvantage: true,
      dropsConcentration: true
    },
    canStack: false,
    removedBy: ['time', 'dispel'],
  },

  [STATUS_EFFECTS.UNCONSCIOUS]: {
    name: 'Unconscious',
    icon: '💤',
    color: '#424242',
    description: 'Incapacitated. Cannot move or speak. Unaware of surroundings. Drop everything. Prone. Auto-fail STR/DEX saves. Attacks have advantage. Hits within 5ft are critical.',
    effects: {
      cannotAct: true,
      cannotMove: true,
      cannotSpeak: true,
      unaware: true,
      dropItems: true,
      prone: true,
      autoFailSaves: ['STR', 'DEX'],
      attackedWithAdvantage: true,
      nearbyHitsAreCritical: true,
      dropsConcentration: true
    },
    canStack: false,
    removedBy: ['damage', 'help_action', 'time'],
  },

  [STATUS_EFFECTS.EXHAUSTION]: {
    name: 'Exhaustion',
    icon: '🥱',
    color: '#616161',
    description: 'Cumulative levels of exhaustion. Level 1: Disadvantage on ability checks. Level 6: Death.',
    effects: {
      stackable: true,
      maxStacks: 6,
      level1: 'Disadvantage on ability checks',
      level2: 'Speed halved',
      level3: 'Disadvantage on attacks and saves',
      level4: 'HP maximum halved',
      level5: 'Speed reduced to 0',
      level6: 'Death'
    },
    canStack: true,
    removedBy: ['long_rest', 'greater_restoration'],
  },

  // Spell effects
  [STATUS_EFFECTS.CONCENTRATING]: {
    name: 'Concentrating',
    icon: '🧘',
    color: '#9C27B0',
    description: 'Maintaining a spell through concentration. Breaks on damage (DC 10 or half damage CON save) or incapacitation.',
    effects: {
      maintainingSpell: true,
      breaksOnDamage: true,
      breaksOnIncapacitated: true
    },
    canStack: false,
    removedBy: ['damage', 'incapacitated', 'death'],
  },

  [STATUS_EFFECTS.BLESSED]: {
    name: 'Blessed',
    icon: '✨',
    color: '#FFD700',
    description: 'Add 1d4 to attack rolls and saving throws.',
    effects: {
      attackBonus: '1d4',
      saveBonus: '1d4'
    },
    canStack: false,
    removedBy: ['dispel', 'duration'],
  },

  [STATUS_EFFECTS.BANED]: {
    name: 'Baned',
    icon: '💀',
    color: '#D32F2F',
    description: 'Subtract 1d4 from attack rolls and saving throws.',
    effects: {
      attackPenalty: '1d4',
      savePenalty: '1d4'
    },
    canStack: false,
    removedBy: ['dispel', 'duration'],
  },

  [STATUS_EFFECTS.HASTED]: {
    name: 'Hasted',
    icon: '⚡',
    color: '#00BCD4',
    description: 'Double speed. +2 AC. Advantage on DEX saves. Extra action each turn.',
    effects: {
      speedMultiplier: 2,
      acBonus: 2,
      savingThrowAdvantage: ['DEX'],
      extraAction: true
    },
    canStack: false,
    removedBy: ['dispel', 'duration'],
  },

  [STATUS_EFFECTS.SLOWED]: {
    name: 'Slowed',
    icon: '🐌',
    color: '#795548',
    description: 'Speed halved. -2 AC. Disadvantage on DEX saves. Cannot take reactions.',
    effects: {
      speedMultiplier: 0.5,
      acPenalty: 2,
      savingThrowDisadvantage: ['DEX'],
      cannotReact: true
    },
    canStack: false,
    removedBy: ['dispel', 'duration'],
  },

  [STATUS_EFFECTS.RAGING]: {
    name: 'Raging',
    icon: '😡',
    color: '#D32F2F',
    description: 'Advantage on STR checks/saves. Bonus damage. Resistance to physical damage.',
    effects: {
      abilityCheckAdvantage: ['STR'],
      savingThrowAdvantage: ['STR'],
      damageBonus: 2,
      resistPhysicalDamage: true,
      cannotCastSpells: true
    },
    canStack: false,
    removedBy: ['duration', 'unconscious'],
  },

  [STATUS_EFFECTS.DODGING]: {
    name: 'Dodging',
    icon: '🤺',
    color: '#4CAF50',
    description: 'Attacks against you have disadvantage. You have advantage on DEX saves.',
    effects: {
      attackedWithDisadvantage: true,
      savingThrowAdvantage: ['DEX']
    },
    canStack: false,
    removedBy: ['end_of_turn'],
  },

  [STATUS_EFFECTS.BURNING]: {
    name: 'Burning',
    icon: '🔥',
    color: '#FF5722',
    description: 'Takes fire damage at the start of each turn.',
    effects: {
      damagePerTurn: '1d6',
      damageType: 'fire'
    },
    canStack: true,
    removedBy: ['water', 'action', 'damage'],
  },

  [STATUS_EFFECTS.BLEEDING]: {
    name: 'Bleeding',
    icon: '🩸',
    color: '#D32F2F',
    description: 'Takes damage at the start of each turn. Disadvantage on CON saves.',
    effects: {
      damagePerTurn: '1d4',
      damageType: 'slashing',
      savingThrowDisadvantage: ['CON']
    },
    canStack: true,
    removedBy: ['healing', 'medicine_check'],
  },
};

/**
 * Create a status effect instance
 */
export function createStatusEffect({
  type,
  duration = 1,
  durationType = DURATION_TYPES.ROUNDS,
  source = null,
  saveDC = null,
  saveAbility = null,
  spellName = null,
  stackCount = 1
}) {
  const definition = STATUS_EFFECT_DEFINITIONS[type];
  
  if (!definition) {
    console.error('Unknown status effect:', type);
    return null;
  }

  return {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    ...definition,
    duration,
    durationType,
    remainingDuration: duration,
    source, // Who/what applied this effect
    saveDC, // DC for saves to end effect
    saveAbility, // Which ability to save with
    spellName, // If from a spell
    stackCount: definition.canStack ? stackCount : 1,
    appliedAt: Date.now(),
  };
}

/**
 * Apply status effect to a combatant/character
 */
export function applyStatusEffect(character, statusEffect) {
  const conditions = character.conditions || [];
  
  // Check if effect already exists
  const existingIndex = conditions.findIndex(c => c.type === statusEffect.type);
  
  if (existingIndex !== -1) {
    const existing = conditions[existingIndex];
    
    // If stackable, increase stack count
    if (existing.canStack) {
      const maxStacks = existing.effects?.maxStacks || 10;
      const newStackCount = Math.min(maxStacks, existing.stackCount + statusEffect.stackCount);
      
      conditions[existingIndex] = {
        ...existing,
        stackCount: newStackCount,
        remainingDuration: Math.max(existing.remainingDuration, statusEffect.remainingDuration)
      };
    } else {
      // Replace with new effect if duration is longer
      if (statusEffect.remainingDuration > existing.remainingDuration) {
        conditions[existingIndex] = statusEffect;
      }
    }
  } else {
    // Add new effect
    conditions.push(statusEffect);
  }

  return {
    ...character,
    conditions: [...conditions]
  };
}

/**
 * Remove status effect from character
 */
export function removeStatusEffect(character, effectId) {
  return {
    ...character,
    conditions: (character.conditions || []).filter(c => c.id !== effectId)
  };
}

/**
 * Remove all status effects of a type
 */
export function removeStatusEffectByType(character, effectType) {
  return {
    ...character,
    conditions: (character.conditions || []).filter(c => c.type !== effectType)
  };
}

/**
 * Process turn-based status effects (damage, duration reduction)
 */
export function processStatusEffectsOnTurnStart(character) {
  let updatedCharacter = { ...character };
  const conditions = [...(character.conditions || [])];
  const toRemove = [];
  let damageLog = [];

  conditions.forEach((effect, index) => {
    // Process damage-over-time effects
    if (effect.effects?.damagePerTurn) {
      const damage = rollDamage(effect.effects.damagePerTurn);
      updatedCharacter = {
        ...updatedCharacter,
        hp: Math.max(0, updatedCharacter.hp - damage)
      };
      damageLog.push({
        effect: effect.name,
        damage,
        damageType: effect.effects.damageType || 'untyped'
      });
    }

    // Reduce duration
    if (effect.durationType === DURATION_TYPES.ROUNDS ||
        effect.durationType === DURATION_TYPES.START_OF_TURN) {
      effect.remainingDuration -= 1;
      
      if (effect.remainingDuration <= 0) {
        toRemove.push(effect.id);
      }
    }
  });

  // Remove expired effects
  updatedCharacter.conditions = conditions.filter(e => !toRemove.includes(e.id));

  return {
    character: updatedCharacter,
    damageLog,
    removedEffects: toRemove
  };
}

/**
 * Check if character has specific status effect
 */
export function hasStatusEffect(character, effectType) {
  return (character.conditions || []).some(c => c.type === effectType);
}

/**
 * Get all active status effects
 */
export function getActiveStatusEffects(character) {
  return character.conditions || [];
}

/**
 * Make saving throw to resist or end status effect
 */
export function makeStatusSave(character, effect, abilityModifier) {
  const d20 = Math.floor(Math.random() * 20) + 1;
  const total = d20 + abilityModifier;
  const success = total >= effect.saveDC;

  return {
    d20,
    total,
    success,
    dc: effect.saveDC,
    ability: effect.saveAbility
  };
}

/**
 * Check concentration when taking damage
 */
export function checkConcentration(character, damage) {
  const concentrationEffect = (character.conditions || []).find(
    c => c.type === STATUS_EFFECTS.CONCENTRATING
  );

  if (!concentrationEffect) {
    return { maintainsConcentration: true };
  }

  // DC is 10 or half damage, whichever is higher
  const dc = Math.max(10, Math.floor(damage / 2));
  
  // CON save
  const conModifier = Math.floor((character.abilities?.CON - 10) / 2) || 0;
  const profBonus = character.level ? Math.floor((character.level - 1) / 4) + 2 : 2;
  const isProficient = character.proficiencies?.savingThrows?.includes('CON');
  
  const saveModifier = conModifier + (isProficient ? profBonus : 0);
  const result = makeStatusSave(character, { saveDC: dc, saveAbility: 'CON' }, saveModifier);

  return {
    ...result,
    maintainsConcentration: result.success,
    concentrationBroken: !result.success,
    spellName: concentrationEffect.spellName
  };
}

/**
 * Helper to roll damage dice
 */
function rollDamage(diceString) {
  const match = diceString.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return parseInt(diceString) || 0;
  
  const [, numDice, dieSize, modifier] = match;
  let total = 0;
  
  for (let i = 0; i < parseInt(numDice); i++) {
    total += Math.floor(Math.random() * parseInt(dieSize)) + 1;
  }
  
  if (modifier) {
    total += parseInt(modifier);
  }
  
  return total;
}

/**
 * Get attack roll advantage/disadvantage based on status effects
 */
export function getAttackModifiers(attacker, defender) {
  const attackerEffects = getActiveStatusEffects(attacker);
  const defenderEffects = getActiveStatusEffects(defender);
  
  let advantage = false;
  let disadvantage = false;
  
  // Attacker effects
  attackerEffects.forEach(effect => {
    if (effect.effects?.attackAdvantage) advantage = true;
    if (effect.effects?.attackDisadvantage) disadvantage = true;
  });
  
  // Defender effects
  defenderEffects.forEach(effect => {
    if (effect.effects?.attackedWithAdvantage) advantage = true;
    if (effect.effects?.attackedWithDisadvantage) disadvantage = true;
  });
  
  // Advantage and disadvantage cancel out
  if (advantage && disadvantage) {
    return { advantage: false, disadvantage: false, normal: true };
  }
  
  return { advantage, disadvantage, normal: !advantage && !disadvantage };
}

/**
 * Apply exhaustion level
 */
export function applyExhaustion(character, levels = 1) {
  const currentExhaustion = character.exhaustion || 0;
  const newExhaustion = Math.min(6, currentExhaustion + levels);
  
  if (newExhaustion >= 6) {
    return {
      ...character,
      exhaustion: 6,
      hp: 0,
      isDead: true
    };
  }
  
  return {
    ...character,
    exhaustion: newExhaustion
  };
}

/**
 * Remove exhaustion level
 */
export function removeExhaustion(character, levels = 1) {
  const currentExhaustion = character.exhaustion || 0;
  const newExhaustion = Math.max(0, currentExhaustion - levels);
  
  return {
    ...character,
    exhaustion: newExhaustion
  };
}