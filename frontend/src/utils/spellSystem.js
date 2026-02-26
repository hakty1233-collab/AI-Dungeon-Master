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
 * Warlock Pact Magic slot table.
 *
 * Key rules (D&D 5e RAW):
 *   - All slots are the SAME level (pact slot level).
 *   - ALL slots recover on a SHORT rest (not long rest).
 *   - Warlocks cannot downcast — every cast uses the pact slot level.
 *
 * Format: { slotCount, slotLevel }
 * (We also expose a 9-element array via getSpellSlots for display compatibility.)
 */
export const WARLOCK_PACT_MAGIC = {
  1:  { slotCount: 1, slotLevel: 1 },
  2:  { slotCount: 2, slotLevel: 1 },
  3:  { slotCount: 2, slotLevel: 2 },
  4:  { slotCount: 2, slotLevel: 2 },
  5:  { slotCount: 2, slotLevel: 3 },
  6:  { slotCount: 2, slotLevel: 3 },
  7:  { slotCount: 2, slotLevel: 4 },
  8:  { slotCount: 2, slotLevel: 4 },
  9:  { slotCount: 2, slotLevel: 5 },
  10: { slotCount: 2, slotLevel: 5 },
  11: { slotCount: 3, slotLevel: 5 },
  12: { slotCount: 3, slotLevel: 5 },
  13: { slotCount: 3, slotLevel: 5 },
  14: { slotCount: 3, slotLevel: 5 },
  15: { slotCount: 3, slotLevel: 5 },
  16: { slotCount: 3, slotLevel: 5 },
  17: { slotCount: 4, slotLevel: 5 },
  18: { slotCount: 4, slotLevel: 5 },
  19: { slotCount: 4, slotLevel: 5 },
  20: { slotCount: 4, slotLevel: 5 }
};

/**
 * Third-caster progression (Eldritch Knight / Arcane Trickster).
 * Spell slots begin at character level 3. Max spell level is 4.
 * Formula: treat character level as (level-2) / 3 rounded down, then use full-caster table.
 * Per D&D 5e PHB table.
 */
export const SPELL_SLOTS_THIRD_CASTER = {
  1:  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  4:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  5:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  6:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  7:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  8:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  9:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  10: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  11: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  12: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  13: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  14: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  15: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  16: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  17: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  18: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  19: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  20: [4, 3, 3, 1, 0, 0, 0, 0, 0]
};

/**
 * Subclass definitions for third-caster archetypes.
 * key: subclass name as stored on character.subclass
 */
export const THIRD_CASTER_SUBCLASSES = {
  'Eldritch Knight': {
    class: 'Fighter',
    spellList: 'Wizard',
    restrictedSchools: ['Abjuration', 'Evocation'], // Must pick from these (with 2 free choices total)
    description: 'Fighters who supplement their martial training with magic, focused on Abjuration and Evocation.'
  },
  'Arcane Trickster': {
    class: 'Rogue',
    spellList: 'Wizard',
    restrictedSchools: ['Enchantment', 'Illusion'], // Must pick from these (with 2 free choices total)
    description: 'Rogues who enhance their larceny and combat with Enchantment and Illusion magic.'
  }
};

/**
 * Returns true if the character is a third-caster (Eldritch Knight or Arcane Trickster).
 * Requires character.subclass to be set.
 */
export function isThirdCaster(character) {
  return SPELLCASTING_CLASSES[character.class] === 'third' &&
    !!THIRD_CASTER_SUBCLASSES[character.subclass];
}

/**
 * Returns the restricted spell schools for the character's subclass, or null.
 */
export function getRestrictedSchools(character) {
  const sub = THIRD_CASTER_SUBCLASSES[character.subclass];
  return sub ? sub.restrictedSchools : null;
}


/**
 * Classes and their spellcasting type
 */
export const SPELLCASTING_CLASSES = {
  Wizard: 'full',
  Sorcerer: 'full',
  Cleric: 'full',
  Druid: 'full',
  Bard: 'full',
  Warlock: 'pact', // Special case — short rest recovery, same-level slots
  Paladin: 'half',
  Ranger: 'half',
  Fighter: 'third', // Eldritch Knight
  Rogue: 'third'    // Arcane Trickster
};

/**
 * Returns true if the character is a Warlock using Pact Magic.
 */
export function isWarlockPactMagic(character) {
  return SPELLCASTING_CLASSES[character.class] === 'pact';
}

/**
 * Returns the Warlock's current pact slot info: { slotCount, slotLevel }
 * Falls back to level-1 entry if level is out of range.
 */
export function getWarlockPactSlots(character) {
  return WARLOCK_PACT_MAGIC[character.level] || WARLOCK_PACT_MAGIC[1];
}

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

  identify: {
    name: 'Identify',
    level: 1,
    school: SPELL_SCHOOLS.DIVINATION,
    castingTime: '1 minute',
    range: 'Touch',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'Learn the properties of a magic item or the spells affecting a creature.',
    ritual: true,
    concentration: false
  },

  find_familiar: {
    name: 'Find Familiar',
    level: 1,
    school: SPELL_SCHOOLS.CONJURATION,
    castingTime: '1 hour',
    range: '10 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'Summon a fey spirit in the form of an animal to serve as your familiar.',
    ritual: true,
    concentration: false
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
    ritual: true,
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
 * Get spell slots for character.
 *
 * For Warlocks, returns a 9-element array where only the pact slot level
 * index is non-zero (e.g. level-5 Warlock → [0,0,0,0,2,0,0,0,0]).
 * This keeps compatibility with all existing slot display code.
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

  // Warlock Pact Magic — all slots at a single level
  if (spellcastingType === 'pact') {
    const { slotCount, slotLevel } = getWarlockPactSlots(character);
    const slots = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    slots[slotLevel - 1] = slotCount;
    return slots;
  }

  // Third-caster (Eldritch Knight / Arcane Trickster) — needs subclass set
  if (spellcastingType === 'third') {
    if (!isThirdCaster(character)) {
      // No subclass selected yet — not a spellcaster
      return [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    return SPELL_SLOTS_THIRD_CASTER[character.level] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  return [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

/**
 * Check if character can cast a spell.
 *
 * For Warlocks, the spell must be at or below the pact slot level —
 * they cannot cast spells requiring a slot higher than their pact level.
 */
export function canCastSpell(character, spell) {
  // Cantrips can always be cast
  if (spell.level === 0) return true;

  if (isWarlockPactMagic(character)) {
    const { slotLevel } = getWarlockPactSlots(character);
    // Spell level must be ≤ pact slot level AND must have slots remaining
    if (spell.level > slotLevel) return false;
    const currentSlots = character.spellSlots?.current || getSpellSlots(character);
    return (currentSlots[slotLevel - 1] || 0) > 0;
  }

  const spellSlots = getSpellSlots(character);
  const currentSlots = character.spellSlots?.current || spellSlots;
  return (currentSlots[spell.level - 1] || 0) > 0;
}

/**
 * Cast a spell (uses a spell slot).
 *
 * For Warlocks, always consumes one pact slot (at the pact slot level),
 * regardless of the spell's base level. The slotLevel param is ignored
 * for Warlocks — they cannot choose a different slot level.
 */
export function castSpell(character, spell, slotLevel = null) {
  // Cantrips don't use slots
  if (spell.level === 0) {
    return {
      success: true,
      character,
      message: `Cast ${spell.name}!`
    };
  }

  if (!canCastSpell(character, spell)) {
    return {
      success: false,
      character,
      message: isWarlockPactMagic(character)
        ? `No Pact Magic slots remaining! Take a short rest to recover.`
        : `No spell slots remaining for level ${spell.level}!`
    };
  }

  const spellSlots = getSpellSlots(character);
  const currentSlots = character.spellSlots?.current
    ? [...character.spellSlots.current]
    : [...spellSlots];

  let usedLevel;

  if (isWarlockPactMagic(character)) {
    // Always use pact slot level — Warlocks don't choose
    const { slotLevel: pactLevel } = getWarlockPactSlots(character);
    usedLevel = pactLevel;
    currentSlots[pactLevel - 1] -= 1;
  } else {
    // Normal casters: use requested slot level or spell's base level
    usedLevel = slotLevel || spell.level;
    currentSlots[usedLevel - 1] -= 1;
  }

  return {
    success: true,
    character: {
      ...character,
      spellSlots: {
        max: spellSlots,
        current: currentSlots
      }
    },
    message: isWarlockPactMagic(character)
      ? `Cast ${spell.name} using a Pact Magic slot (level ${usedLevel})!`
      : `Cast ${spell.name} using a level ${usedLevel} spell slot!`
  };
}

/**
 * Long rest — restores all spell slots for non-Warlocks.
 * Warlocks do NOT recover pact slots on a long rest via this path
 * (they use shortRest instead), but we still restore them here for
 * convenience since a long rest includes all benefits of a short rest.
 */
export function longRest(character) {
  const spellSlots = getSpellSlots(character);

  return {
    ...character,
    spellSlots: {
      max: spellSlots,
      current: [...spellSlots]
    }
  };
}

/**
 * Short rest — ONLY Warlocks recover spell slots on a short rest.
 * Other classes recover nothing (hit dice use handled elsewhere).
 *
 * Returns the updated character object. Always safe to call on any class —
 * non-Warlocks are returned unchanged.
 */
export function shortRest(character) {
  if (!isWarlockPactMagic(character)) {
    // Non-Warlocks: no spell slot recovery on a short rest
    return character;
  }

  // Warlocks: restore all pact slots
  const spellSlots = getSpellSlots(character);
  console.log(`[shortRest] ${character.name} (Warlock) recovers all Pact Magic slots.`);

  return {
    ...character,
    spellSlots: {
      max: spellSlots,
      current: [...spellSlots]
    }
  };
}

/**
 * Classes that can perform ritual casting.
 * - Wizard: can ritual cast any ritual spell in their spellbook (known list)
 * - Cleric, Druid, Bard: can ritual cast ritual spells they have prepared/known
 * - Warlock, Sorcerer, Paladin, Ranger: NO ritual casting
 */
export const RITUAL_CASTER_CLASSES = new Set(['Wizard', 'Cleric', 'Druid', 'Bard']);

/**
 * Check if a character can ritual cast a specific spell.
 *
 * Rules:
 *  1. Spell must have ritual: true
 *  2. Character's class must be in RITUAL_CASTER_CLASSES
 *  3. Wizards can cast any ritual spell they know (spells.known)
 *     Other ritual casters need the spell prepared or known
 */
export function canRitualCast(character, spell) {
  if (!spell.ritual) return false;
  if (!RITUAL_CASTER_CLASSES.has(character.class)) return false;

  const knownKeys   = character.spells?.known    || [];
  const preparedKeys = character.spells?.prepared || [];
  const cantripKeys  = character.spells?.cantrips || [];
  const allAccessible = [...new Set([...knownKeys, ...preparedKeys, ...cantripKeys])];

  // Wizards: any ritual spell in their spellbook (known list) qualifies
  if (character.class === 'Wizard') {
    return knownKeys.includes(spell.key) || allAccessible.includes(spell.key);
  }

  // Other ritual casters: must have it prepared or known
  return allAccessible.includes(spell.key);
}

/**
 * Cast a spell as a ritual — no spell slot consumed.
 * Returns same shape as castSpell() for easy drop-in use.
 *
 * Note: ritual casting takes 10 extra minutes in real D&D,
 * which we flag in the message but don't block on.
 */
export function castRitual(character, spell) {
  if (!canRitualCast(character, spell)) {
    return {
      success: false,
      character,
      message: `${character.name} cannot ritual cast ${spell.name}.`
    };
  }

  console.log(`[RitualCast] ${character.name} ritual casts ${spell.name} (no slot used).`);

  return {
    success: true,
    character, // No slot consumed — character state unchanged
    message: `${spell.name} cast as a ritual! (10 minutes, no spell slot used)`
  };
}

/**
 * Get all ritual spells accessible to a character (for SpellBook filtering).
 */
export function getRitualSpells(character) {
  if (!RITUAL_CASTER_CLASSES.has(character.class)) return [];

  return Object.entries(SPELL_DATABASE)
    .filter(([key, spell]) => spell.ritual && canRitualCast(character, { ...spell, key }))
    .map(([key, spell]) => ({ key, ...spell }));
}

/**
 * Prepare spells (for prepared casters like Clerics, Wizards)
 */
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