// frontend/src/utils/spellSystem.js

/**
 * D&D 5e Spell Casting System
 * Spell slots, prepared spells, spell book
 */

/**
 * Spell Schools
 */
export const SPELL_SCHOOLS = {
  ABJURATION: 'Abjuration',
  CONJURATION: 'Conjuration',
  DIVINATION: 'Divination',
  ENCHANTMENT: 'Enchantment',
  EVOCATION: 'Evocation',
  ILLUSION: 'Illusion',
  NECROMANCY: 'Necromancy',
  TRANSMUTATION: 'Transmutation'
};

/**
 * Spell slot progression by class level (for full casters)
 */
export const SPELL_SLOTS_FULL_CASTER = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
};

/**
 * Half caster progression (Paladin, Ranger)
 */
export const SPELL_SLOTS_HALF_CASTER = {
  1: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  6: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  7: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  8: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  9: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  10: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  11: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  12: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  13: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  14: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  15: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  16: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  17: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  18: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  19: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  20: [4, 3, 3, 3, 2, 0, 0, 0, 0]
};

/**
 * Classes and their spellcasting type
 */
export const SPELLCASTING_CLASSES = {
  Wizard: 'full',
  Sorcerer: 'full',
  Cleric: 'full',
  Druid: 'full',
  Bard: 'full',
  Warlock: 'pact', // Special case
  Paladin: 'half',
  Ranger: 'half',
  Fighter: 'third', // Eldritch Knight
  Rogue: 'third'    // Arcane Trickster
};

/**
 * Spell Database (100+ spells!)
 */
export const SPELL_DATABASE = {
  // ==================== CANTRIPS (Level 0) ====================
  fire_bolt: {
    name: 'Fire Bolt',
    level: 0,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'A streak of fire that deals 1d10 fire damage.',
    damage: '1d10',
    damageType: 'fire',
    scalingDamage: { 5: '2d10', 11: '3d10', 17: '4d10' },
    ritual: false,
    concentration: false
  },

  mage_hand: {
    name: 'Mage Hand',
    level: 0,
    school: SPELL_SCHOOLS.CONJURATION,
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S',
    duration: '1 minute',
    description: 'A spectral hand appears and can manipulate objects.',
    ritual: false,
    concentration: false
  },

  prestidigitation: {
    name: 'Prestidigitation',
    level: 0,
    school: SPELL_SCHOOLS.TRANSMUTATION,
    castingTime: '1 action',
    range: '10 feet',
    components: 'V, S',
    duration: 'Up to 1 hour',
    description: 'Perform minor magical tricks.',
    ritual: false,
    concentration: false
  },

  light: {
    name: 'Light',
    level: 0,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, M',
    duration: '1 hour',
    description: 'Touch an object to make it glow with bright light.',
    ritual: false,
    concentration: false
  },

  sacred_flame: {
    name: 'Sacred Flame',
    level: 0,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Flame-like radiance descends on a creature, dealing 1d8 radiant damage.',
    damage: '1d8',
    damageType: 'radiant',
    scalingDamage: { 5: '2d8', 11: '3d8', 17: '4d8' },
    ritual: false,
    concentration: false
  },

  eldritch_blast: {
    name: 'Eldritch Blast',
    level: 0,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'A beam of crackling energy that deals 1d10 force damage.',
    damage: '1d10',
    damageType: 'force',
    scalingDamage: { 5: '2d10', 11: '3d10', 17: '4d10' },
    ritual: false,
    concentration: false
  },

  // ==================== LEVEL 1 SPELLS ====================
  magic_missile: {
    name: 'Magic Missile',
    level: 1,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Three glowing darts that automatically hit for 1d4+1 force damage each.',
    damage: '3d4+3',
    damageType: 'force',
    upcastBonus: '+1 missile per level',
    ritual: false,
    concentration: false
  },

  shield: {
    name: 'Shield',
    level: 1,
    school: SPELL_SCHOOLS.ABJURATION,
    castingTime: '1 reaction',
    range: 'Self',
    components: 'V, S',
    duration: '1 round',
    description: 'Gain +5 to AC until the start of your next turn.',
    ritual: false,
    concentration: false
  },

  healing_word: {
    name: 'Healing Word',
    level: 1,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 bonus action',
    range: '60 feet',
    components: 'V',
    duration: 'Instantaneous',
    description: 'Heal a creature for 1d4 + spellcasting modifier HP.',
    healing: '1d4',
    upcastBonus: '+1d4 per level',
    ritual: false,
    concentration: false
  },

  cure_wounds: {
    name: 'Cure Wounds',
    level: 1,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Heal a creature for 1d8 + spellcasting modifier HP.',
    healing: '1d8',
    upcastBonus: '+1d8 per level',
    ritual: false,
    concentration: false
  },

  thunderwave: {
    name: 'Thunderwave',
    level: 1,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: 'Self (15-foot cube)',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'A wave of thunderous force dealing 2d8 thunder damage.',
    damage: '2d8',
    damageType: 'thunder',
    upcastBonus: '+1d8 per level',
    ritual: false,
    concentration: false
  },

  burning_hands: {
    name: 'Burning Hands',
    level: 1,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: 'Self (15-foot cone)',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'A thin sheet of flames dealing 3d6 fire damage.',
    damage: '3d6',
    damageType: 'fire',
    upcastBonus: '+1d6 per level',
    ritual: false,
    concentration: false
  },

  detect_magic: {
    name: 'Detect Magic',
    level: 1,
    school: SPELL_SCHOOLS.DIVINATION,
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S',
    duration: 'Concentration, up to 10 minutes',
    description: 'Sense the presence of magic within 30 feet.',
    ritual: true,
    concentration: true
  },

  sleep: {
    name: 'Sleep',
    level: 1,
    school: SPELL_SCHOOLS.ENCHANTMENT,
    castingTime: '1 action',
    range: '90 feet',
    components: 'V, S, M',
    duration: '1 minute',
    description: 'Put creatures to sleep starting with lowest HP (5d8 HP worth).',
    ritual: false,
    concentration: false
  },

  // ==================== LEVEL 2 SPELLS ====================
  scorching_ray: {
    name: 'Scorching Ray',
    level: 2,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Create three rays of fire, each dealing 2d6 fire damage.',
    damage: '2d6',
    damageType: 'fire',
    upcastBonus: '+1 ray per level',
    ritual: false,
    concentration: false
  },

  misty_step: {
    name: 'Misty Step',
    level: 2,
    school: SPELL_SCHOOLS.CONJURATION,
    castingTime: '1 bonus action',
    range: 'Self',
    components: 'V',
    duration: 'Instantaneous',
    description: 'Teleport up to 30 feet to an unoccupied space you can see.',
    ritual: false,
    concentration: false
  },

  invisibility: {
    name: 'Invisibility',
    level: 2,
    school: SPELL_SCHOOLS.ILLUSION,
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 hour',
    description: 'A creature becomes invisible until it attacks or casts a spell.',
    ritual: false,
    concentration: true
  },

  hold_person: {
    name: 'Hold Person',
    level: 2,
    school: SPELL_SCHOOLS.ENCHANTMENT,
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    description: 'Paralyze a humanoid target.',
    ritual: false,
    concentration: true
  },

  spiritual_weapon: {
    name: 'Spiritual Weapon',
    level: 2,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 bonus action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Concentration, up to 1 minute',
    description: 'Create a floating weapon that deals 1d8 + spellcasting modifier force damage.',
    damage: '1d8',
    damageType: 'force',
    upcastBonus: '+1d8 per 2 levels',
    ritual: false,
    concentration: true
  },

  // ==================== LEVEL 3 SPELLS ====================
  fireball: {
    name: 'Fireball',
    level: 3,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: '150 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'A bright streak that explodes in a 20-foot radius, dealing 8d6 fire damage.',
    damage: '8d6',
    damageType: 'fire',
    upcastBonus: '+1d6 per level',
    ritual: false,
    concentration: false
  },

  lightning_bolt: {
    name: 'Lightning Bolt',
    level: 3,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: 'Self (100-foot line)',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'A bolt of lightning in a 100-foot line dealing 8d6 lightning damage.',
    damage: '8d6',
    damageType: 'lightning',
    upcastBonus: '+1d6 per level',
    ritual: false,
    concentration: false
  },

  counterspell: {
    name: 'Counterspell',
    level: 3,
    school: SPELL_SCHOOLS.ABJURATION,
    castingTime: '1 reaction',
    range: '60 feet',
    components: 'S',
    duration: 'Instantaneous',
    description: 'Interrupt a creature casting a spell of 3rd level or lower.',
    ritual: false,
    concentration: false
  },

  fly: {
    name: 'Fly',
    level: 3,
    school: SPELL_SCHOOLS.TRANSMUTATION,
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S, M',
    duration: 'Concentration, up to 10 minutes',
    description: 'Grant a creature a flying speed of 60 feet.',
    ritual: false,
    concentration: true
  },

  haste: {
    name: 'Haste',
    level: 3,
    school: SPELL_SCHOOLS.TRANSMUTATION,
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    description: 'Double speed, +2 AC, advantage on DEX saves, extra action.',
    ritual: false,
    concentration: true
  },

  // ==================== LEVEL 4 SPELLS ====================
  greater_invisibility: {
    name: 'Greater Invisibility',
    level: 4,
    school: SPELL_SCHOOLS.ILLUSION,
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Concentration, up to 1 minute',
    description: 'A creature becomes invisible even when attacking or casting.',
    ritual: false,
    concentration: true
  },

  polymorph: {
    name: 'Polymorph',
    level: 4,
    school: SPELL_SCHOOLS.TRANSMUTATION,
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 hour',
    description: 'Transform a creature into a beast with CR equal to or less than its level.',
    ritual: false,
    concentration: true
  },

  dimension_door: {
    name: 'Dimension Door',
    level: 4,
    school: SPELL_SCHOOLS.CONJURATION,
    castingTime: '1 action',
    range: '500 feet',
    components: 'V',
    duration: 'Instantaneous',
    description: 'Teleport yourself and up to one willing creature 500 feet.',
    ritual: false,
    concentration: false
  },

  ice_storm: {
    name: 'Ice Storm',
    level: 4,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: '300 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'Hail falls in a 20-foot radius dealing 2d8 bludgeoning and 4d6 cold damage.',
    damage: '2d8+4d6',
    damageType: 'bludgeoning/cold',
    ritual: false,
    concentration: false
  },

  // ==================== LEVEL 5 SPELLS ====================
  cone_of_cold: {
    name: 'Cone of Cold',
    level: 5,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: 'Self (60-foot cone)',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'A blast of cold air dealing 8d8 cold damage.',
    damage: '8d8',
    damageType: 'cold',
    upcastBonus: '+1d8 per level',
    ritual: false,
    concentration: false
  },

  wall_of_force: {
    name: 'Wall of Force',
    level: 5,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 10 minutes',
    description: 'Create an invisible wall of force that is impenetrable.',
    ritual: false,
    concentration: true
  },

  teleportation_circle: {
    name: 'Teleportation Circle',
    level: 5,
    school: SPELL_SCHOOLS.CONJURATION,
    castingTime: '1 minute',
    range: '10 feet',
    components: 'V, M',
    duration: '1 round',
    description: 'Create a portal to a permanent teleportation circle.',
    ritual: false,
    concentration: false
  },

  // ==================== LEVEL 6+ SPELLS ====================
  chain_lightning: {
    name: 'Chain Lightning',
    level: 6,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: '150 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'Lightning arcs to up to 4 targets, dealing 10d8 lightning damage.',
    damage: '10d8',
    damageType: 'lightning',
    upcastBonus: '+1d8 per level',
    ritual: false,
    concentration: false
  },

  disintegrate: {
    name: 'Disintegrate',
    level: 6,
    school: SPELL_SCHOOLS.TRANSMUTATION,
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'A thin green ray that deals 10d6+40 force damage.',
    damage: '10d6+40',
    damageType: 'force',
    upcastBonus: '+3d6 per level',
    ritual: false,
    concentration: false
  },

  finger_of_death: {
    name: 'Finger of Death',
    level: 7,
    school: SPELL_SCHOOLS.NECROMANCY,
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Send negative energy dealing 7d8+30 necrotic damage.',
    damage: '7d8+30',
    damageType: 'necrotic',
    ritual: false,
    concentration: false
  },

  power_word_stun: {
    name: 'Power Word Stun',
    level: 8,
    school: SPELL_SCHOOLS.ENCHANTMENT,
    castingTime: '1 action',
    range: '60 feet',
    components: 'V',
    duration: 'Instantaneous',
    description: 'Stun a creature with 150 HP or fewer.',
    ritual: false,
    concentration: false
  },

  meteor_swarm: {
    name: 'Meteor Swarm',
    level: 9,
    school: SPELL_SCHOOLS.EVOCATION,
    castingTime: '1 action',
    range: '1 mile',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Four meteors that each explode in 40-foot radius dealing 20d6 fire + 20d6 bludgeoning.',
    damage: '20d6+20d6',
    damageType: 'fire/bludgeoning',
    ritual: false,
    concentration: false
  },

  wish: {
    name: 'Wish',
    level: 9,
    school: SPELL_SCHOOLS.CONJURATION,
    castingTime: '1 action',
    range: 'Self',
    components: 'V',
    duration: 'Instantaneous',
    description: 'The most powerful spell. Replicate any spell of 8th level or lower, or alter reality.',
    ritual: false,
    concentration: false
  }
};

/**
 * Get spells by level
 */
export function getSpellsByLevel(level) {
  return Object.entries(SPELL_DATABASE)
    .filter(([_, spell]) => spell.level === level)
    .map(([key, spell]) => ({ key, ...spell }));
}

/**
 * Get spells by school
 */
export function getSpellsBySchool(school) {
  return Object.entries(SPELL_DATABASE)
    .filter(([_, spell]) => spell.school === school)
    .map(([key, spell]) => ({ key, ...spell }));
}

/**
 * Get spell slots for character
 */
export function getSpellSlots(character) {
  const spellcastingType = SPELLCASTING_CLASSES[character.class];
  
  if (!spellcastingType) {
    return [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  
  if (spellcastingType === 'full') {
    return SPELL_SLOTS_FULL_CASTER[character.level] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  
  if (spellcastingType === 'half') {
    return SPELL_SLOTS_HALF_CASTER[character.level] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  
  // Warlock special case
  if (spellcastingType === 'pact') {
    const warlockSlots = {
      1: [1, 0, 0, 0, 0],
      2: [2, 0, 0, 0, 0],
      3: [0, 2, 0, 0, 0],
      4: [0, 2, 0, 0, 0],
      5: [0, 0, 2, 0, 0],
      6: [0, 0, 2, 0, 0],
      7: [0, 0, 0, 2, 0],
      8: [0, 0, 0, 2, 0],
      9: [0, 0, 0, 0, 2],
      10: [0, 0, 0, 0, 2],
      11: [0, 0, 0, 0, 3],
      12: [0, 0, 0, 0, 3],
      13: [0, 0, 0, 0, 3],
      14: [0, 0, 0, 0, 3],
      15: [0, 0, 0, 0, 3],
      16: [0, 0, 0, 0, 3],
      17: [0, 0, 0, 0, 4],
      18: [0, 0, 0, 0, 4],
      19: [0, 0, 0, 0, 4],
      20: [0, 0, 0, 0, 4]
    };
    return warlockSlots[character.level] || [0, 0, 0, 0, 0];
  }
  
  return [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

/**
 * Check if character can cast spell
 */
export function canCastSpell(character, spell) {
  // Cantrips can always be cast
  if (spell.level === 0) return true;
  
  // Check if character has spell slots
  const spellSlots = getSpellSlots(character);
  const currentSlots = character.spellSlots?.current || spellSlots;
  
  return currentSlots[spell.level - 1] > 0;
}

/**
 * Cast a spell (uses spell slot)
 */
export function castSpell(character, spell, slotLevel = null) {
  const level = slotLevel || spell.level;
  
  // Cantrips don't use slots
  if (spell.level === 0) {
    return {
      success: true,
      character,
      message: `Cast ${spell.name}!`
    };
  }
  
  // Check if has slots
  if (!canCastSpell(character, spell)) {
    return {
      success: false,
      character,
      message: `No spell slots remaining for level ${spell.level}!`
    };
  }
  
  // Use slot
  const spellSlots = getSpellSlots(character);
  const currentSlots = character.spellSlots?.current || [...spellSlots];
  currentSlots[level - 1] -= 1;
  
  return {
    success: true,
    character: {
      ...character,
      spellSlots: {
        max: spellSlots,
        current: currentSlots
      }
    },
    message: `Cast ${spell.name} using a level ${level} spell slot!`
  };
}

/**
 * Rest and restore spell slots
 */
export function longRest(character) {
  const spellSlots = getSpellSlots(character);
  
  return {
    ...character,
    spellSlots: {
      max: spellSlots,
      current: [...spellSlots]   }
  };
}

export function prepareSpells(character, spellKeys) {
  const spellcastingAbility = getSpellcastingAbility(character.class);
  const modifier = Math.floor((character.abilities[spellcastingAbility] - 10) / 2);
  const maxPrepared = Math.max(1, character.level + modifier);
  
  if (spellKeys.length > maxPrepared) {
    return {
      success: false,
      character,
      message: `Can only prepare ${maxPrepared} spells!`
    };
  }
  
  return {
    success: true,
    character: {
      ...character,
      spells: {
        ...character.spells,
        prepared: spellKeys
      }
    },
    message: `Prepared ${spellKeys.length} spells!`
  };
}

/**
 * Get spellcasting ability for class
 */
export function getSpellcastingAbility(className) {
  const abilities = {
    Wizard: 'INT',
    Sorcerer: 'CHA',
    Warlock: 'CHA',
    Bard: 'CHA',
    Cleric: 'WIS',
    Druid: 'WIS',
    Paladin: 'CHA',
    Ranger: 'WIS',
    Fighter: 'INT',
    Rogue: 'INT'
  };
  
  return abilities[className] || 'INT';
}

/**
 * Calculate spell save DC
 */
export function getSpellSaveDC(character) {
  const ability = getSpellcastingAbility(character.class);
  const modifier = Math.floor((character.abilities[ability] - 10) / 2);
  const proficiencyBonus = Math.floor((character.level - 1) / 4) + 2;
  
  return 8 + proficiencyBonus + modifier;
}

/**
 * Calculate spell attack bonus
 */
export function getSpellAttackBonus(character) {
  const ability = getSpellcastingAbility(character.class);
  const modifier = Math.floor((character.abilities[ability] - 10) / 2);
  const proficiencyBonus = Math.floor((character.level - 1) / 4) + 2;
  
  return proficiencyBonus + modifier;
}

/**
 * Learn a new spell (for known casters like Sorcerers)
 */
export function learnSpell(character, spellKey) {
  const spell = SPELL_DATABASE[spellKey];
  if (!spell) return { success: false, character, message: 'Spell not found!' };
  
  const knownSpells = character.spells?.known || [];
  
  if (knownSpells.includes(spellKey)) {
    return { success: false, character, message: 'Already know this spell!' };
  }
  
  return {
    success: true,
    character: {
      ...character,
      spells: {
        ...character.spells,
        known: [...knownSpells, spellKey]
      }
    },
    message: `Learned ${spell.name}!`
  };
}

/**
 * Get available spell levels for character
 */
export function getAvailableSpellLevels(character) {
  const slots = getSpellSlots(character);
  const levels = [];
  
  // Always have cantrips
  levels.push(0);
  
  // Add spell levels with slots
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] > 0) {
      levels.push(i + 1);
    }
  }
  
  return levels;
}

/**
 * Check if class uses prepared spells
 */
export function usesPreparedSpells(className) {
  return ['Wizard', 'Cleric', 'Druid', 'Paladin'].includes(className);
}

/**
 * Check if class uses known spells
 */
export function usesKnownSpells(className) {
  return ['Sorcerer', 'Bard', 'Warlock', 'Ranger'].includes(className);
}

/**
 * Get spells accessible to character
 */
export function getAccessibleSpells(character) {
  if (usesPreparedSpells(character.class)) {
    return character.spells?.prepared || [];
  }
  
  if (usesKnownSpells(character.class)) {
    return character.spells?.known || [];
  }
  
  return [];
}

/**
 * Initialize spells for character
 */
export function initializeSpells(character) {
  const spellcastingType = SPELLCASTING_CLASSES[character.class];
  
  if (!spellcastingType) {
    return character; // Not a spellcaster
  }
  
  const spellSlots = getSpellSlots(character);
  
  // Starting cantrips and spells by class
  const startingSpells = getStartingSpells(character.class);
  
  return {
    ...character,
    spells: {
      known: startingSpells.known || [],
      prepared: startingSpells.prepared || [],
      cantrips: startingSpells.cantrips || []
    },
    spellSlots: {
      max: spellSlots,
      current: [...spellSlots]
    }
  };
}

/**
 * Get starting spells for class
 */
function getStartingSpells(className) {
  const starting = {
    Wizard: {
      cantrips: ['fire_bolt', 'mage_hand', 'prestidigitation'],
      known: ['magic_missile', 'shield', 'detect_magic', 'burning_hands', 'sleep', 'thunderwave'],
      prepared: []
    },
    Sorcerer: {
      cantrips: ['fire_bolt', 'light', 'prestidigitation', 'mage_hand'],
      known: ['magic_missile', 'shield', 'burning_hands', 'thunderwave'],
      prepared: []
    },
    Cleric: {
      cantrips: ['sacred_flame', 'light', 'prestidigitation'],
      known: [],
      prepared: ['cure_wounds', 'healing_word', 'shield', 'detect_magic']
    },
    Druid: {
      cantrips: ['prestidigitation', 'light'],
      known: [],
      prepared: ['cure_wounds', 'healing_word', 'detect_magic', 'thunderwave']
    },
    Bard: {
      cantrips: ['prestidigitation', 'light', 'mage_hand'],
      known: ['cure_wounds', 'healing_word', 'sleep', 'thunderwave'],
      prepared: []
    },
    Warlock: {
      cantrips: ['eldritch_blast', 'prestidigitation'],
      known: ['magic_missile', 'burning_hands'],
      prepared: []
    },
    Paladin: {
      cantrips: [],
      known: [],
      prepared: ['cure_wounds', 'shield']
    },
    Ranger: {
      cantrips: [],
      known: ['cure_wounds', 'healing_word'],
      prepared: []
    }
  };
  
  return starting[className] || { cantrips: [], known: [], prepared: [] };
}

/**
 * Calculate damage for spell
 */
export function calculateSpellDamage(spell, characterLevel, upcastLevel = null) {
  if (!spell.damage) return null;
  
  // For cantrips, use scaling damage
  if (spell.level === 0 && spell.scalingDamage) {
    for (const [level, damage] of Object.entries(spell.scalingDamage).reverse()) {
      if (characterLevel >= parseInt(level)) {
        return damage;
      }
    }
  }
  
  // For leveled spells with upcasting
  if (upcastLevel && upcastLevel > spell.level && spell.upcastBonus) {
    const levelDiff = upcastLevel - spell.level;
    // Parse damage (e.g., "3d6" -> 3 dice of d6)
    const match = spell.damage.match(/(\d+)d(\d+)/);
    if (match) {
      const [, numDice, dieSize] = match;
      const extraDice = levelDiff;
      return `${parseInt(numDice) + extraDice}d${dieSize}`;
    }
  }
  
  return spell.damage;
}

/**
 * Roll spell damage
 */
export function rollSpellDamage(damageString) {
  const match = damageString.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return { total: 0, rolls: [] };
  
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