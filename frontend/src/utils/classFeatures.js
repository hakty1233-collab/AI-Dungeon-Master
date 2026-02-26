// frontend/src/utils/classFeatures.js
/**
 * D&D 5e Class Feature Tables
 * Defines what each class gains at each level 1-20.
 *
 * Feature types:
 *   'passive'   — auto-applied, just shown to player
 *   'asi'       — Ability Score Improvement (player picks)
 *   'subclass'  — player picks a subclass
 *   'choice'    — player makes a choice (tracked but not enforced here)
 */

// ─────────────────────────────────────────────────────────────────────────────
//  ASI LEVELS (shared pattern — most classes get ASI at 4,8,12,16,19)
// ─────────────────────────────────────────────────────────────────────────────
const STANDARD_ASI_LEVELS = [4, 8, 12, 16, 19];
const FIGHTER_ASI_LEVELS   = [4, 6, 8, 12, 14, 16, 19]; // Fighter gets extra
const ROGUE_ASI_LEVELS     = [4, 8, 10, 12, 16, 19];    // Rogue gets extra at 10

// ─────────────────────────────────────────────────────────────────────────────
//  SUBCLASS DEFINITIONS
//  Each class key maps to an array of subclass options.
// ─────────────────────────────────────────────────────────────────────────────
export const SUBCLASS_OPTIONS = {
  Barbarian: [
    { id: 'berserker',      name: 'Path of the Berserker',      description: 'Channel your rage into frenzied, relentless attacks.' },
    { id: 'totem_warrior',  name: 'Path of the Totem Warrior',  description: 'Draw power from the spirits of animals.' },
    { id: 'zealot',         name: 'Path of the Zealot',         description: 'Channel divine fury, fighting for your deity.' },
    { id: 'storm_herald',   name: 'Path of the Storm Herald',   description: 'Surround yourself with a storm of elemental energy.' }
  ],
  Bard: [
    { id: 'lore',           name: 'College of Lore',            description: 'Accumulate knowledge of all things.' },
    { id: 'valor',          name: 'College of Valor',           description: 'Inspire others in battle.' },
    { id: 'glamour',        name: 'College of Glamour',         description: 'Weave fey magic into your performance.' },
    { id: 'swords',         name: 'College of Swords',          description: 'Use your weapon as your instrument.' }
  ],
  Cleric: [
    { id: 'life',           name: 'Life Domain',                description: 'Channel divine energy to heal and protect.' },
    { id: 'light',          name: 'Light Domain',               description: 'Wield the power of radiance and fire.' },
    { id: 'war',            name: 'War Domain',                 description: 'Grant martial power to your allies.' },
    { id: 'trickery',       name: 'Trickery Domain',            description: 'Sow discord using deception and illusion.' },
    { id: 'knowledge',      name: 'Knowledge Domain',           description: 'Pursue the mysteries of arcane knowledge.' },
    { id: 'tempest',        name: 'Tempest Domain',             description: 'Command the power of storms.' },
    { id: 'death',          name: 'Death Domain',               description: 'Channel the power of death itself.' }
  ],
  Druid: [
    { id: 'land',           name: 'Circle of the Land',         description: 'Draw power from the terrain around you.' },
    { id: 'moon',           name: 'Circle of the Moon',         description: 'Wild Shape into more powerful beasts.' },
    { id: 'spores',         name: 'Circle of Spores',           description: 'Animate the dead and spread fungal growth.' },
    { id: 'stars',          name: 'Circle of Stars',            description: 'Draw power from constellations.' }
  ],
  Fighter: [
    { id: 'champion',       name: 'Champion',                   description: 'Improved critical hits and athletic ability.' },
    { id: 'battle_master',  name: 'Battle Master',              description: 'Learn combat maneuvers to outmaneuver foes.' },
    { id: 'eldritch_knight',name: 'Eldritch Knight',            description: 'Supplement martial prowess with Abjuration and Evocation magic.' },
    { id: 'arcane_archer',  name: 'Arcane Archer',              description: 'Imbue your arrows with magical power.' },
    { id: 'cavalier',       name: 'Cavalier',                   description: 'Master mounted combat and protection.' }
  ],
  Monk: [
    { id: 'open_hand',      name: 'Way of the Open Hand',       description: 'Master the ultimate form of unarmed combat.' },
    { id: 'shadow',         name: 'Way of Shadow',              description: 'Use shadow magic to empower your abilities.' },
    { id: 'four_elements',  name: 'Way of the Four Elements',   description: 'Bend the four elements to your will.' },
    { id: 'mercy',          name: 'Way of Mercy',               description: 'Heal allies and harm foes with your hands.' }
  ],
  Paladin: [
    { id: 'devotion',       name: 'Oath of Devotion',           description: 'The classic knight in shining armor.' },
    { id: 'ancients',       name: 'Oath of the Ancients',       description: 'Protect the light and life of the world.' },
    { id: 'vengeance',      name: 'Oath of Vengeance',          description: 'Punish those who commit great evil.' },
    { id: 'conquest',       name: 'Oath of Conquest',           description: 'Crush your enemies and rule through fear.' },
    { id: 'glory',          name: 'Oath of Glory',              description: 'Inspire others through your heroic deeds.' }
  ],
  Ranger: [
    { id: 'hunter',         name: 'Hunter',                     description: 'Learn specialized techniques for hunting monsters.' },
    { id: 'beast_master',   name: 'Beast Master',               description: 'Bond with a beast companion.' },
    { id: 'gloom_stalker',  name: 'Gloom Stalker',              description: 'Become a terror of the Underdark.' },
    { id: 'horizon_walker', name: 'Horizon Walker',             description: 'Guard against threats from other planes.' }
  ],
  Rogue: [
    { id: 'thief',          name: 'Thief',                      description: 'Master the art of larceny and burglary.' },
    { id: 'assassin',       name: 'Assassin',                   description: 'Become a master of disguise and deadly ambush.' },
    { id: 'arcane_trickster',name: 'Arcane Trickster',          description: 'Enhance your roguish skills with Enchantment and Illusion magic.' },
    { id: 'inquisitive',    name: 'Inquisitive',                description: 'Master the art of investigation and detection.' },
    { id: 'swashbuckler',   name: 'Swashbuckler',               description: 'Blend charm and swordplay into a dazzling style.' }
  ],
  Sorcerer: [
    { id: 'draconic',       name: 'Draconic Bloodline',         description: 'Magic from a dragon ancestor flows through you.' },
    { id: 'wild_magic',     name: 'Wild Magic',                 description: 'Your magic is unpredictable and powerful.' },
    { id: 'divine_soul',    name: 'Divine Soul',                description: 'A blessing from a deity suffuses you with magic.' },
    { id: 'shadow_magic',   name: 'Shadow Magic',               description: 'Draw power from the Shadowfell.' }
  ],
  Warlock: [
    { id: 'archfey',        name: 'The Archfey',                description: 'Your patron is a lord of the fey.' },
    { id: 'fiend',          name: 'The Fiend',                  description: 'Your patron is a powerful fiend.' },
    { id: 'great_old_one',  name: 'The Great Old One',          description: 'Your patron is an unfathomable cosmic entity.' },
    { id: 'celestial',      name: 'The Celestial',              description: 'Your patron is a powerful celestial being.' },
    { id: 'hexblade',       name: 'The Hexblade',               description: 'Your patron is a shadowy entity from the Shadowfell.' }
  ],
  Wizard: [
    { id: 'abjuration',     name: 'School of Abjuration',       description: 'Specialise in protective and warding magic.' },
    { id: 'conjuration',    name: 'School of Conjuration',      description: 'Specialise in summoning and teleportation.' },
    { id: 'divination',     name: 'School of Divination',       description: 'Peer into the future and learn hidden truths.' },
    { id: 'enchantment',    name: 'School of Enchantment',      description: 'Specialise in beguiling the minds of others.' },
    { id: 'evocation',      name: 'School of Evocation',        description: 'Specialise in destructive elemental magic.' },
    { id: 'illusion',       name: 'School of Illusion',         description: 'Specialise in deceiving the senses.' },
    { id: 'necromancy',     name: 'School of Necromancy',       description: 'Specialise in life, death, and undeath.' },
    { id: 'transmutation',  name: 'School of Transmutation',    description: 'Specialise in transforming matter and energy.' }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
//  CLASS FEATURES BY LEVEL
// ─────────────────────────────────────────────────────────────────────────────

export const CLASS_FEATURES = {

  Barbarian: {
    1:  [{ type: 'passive', name: 'Rage', description: 'Enter a rage for bonus damage, resistance to physical damage, and advantage on STR checks. Uses per day: 2.' },
         { type: 'passive', name: 'Unarmored Defense', description: 'While not wearing armor, AC = 10 + DEX mod + CON mod.' }],
    2:  [{ type: 'passive', name: 'Reckless Attack', description: 'Attack with advantage, but attacks against you also have advantage until your next turn.' },
         { type: 'passive', name: 'Danger Sense', description: 'Advantage on DEX saving throws against effects you can see.' }],
    3:  [{ type: 'subclass', name: 'Primal Path', description: 'Choose your Primal Path — this defines your barbarian archetype.' },
         { type: 'passive', name: 'Rage Uses +1', description: 'Rage uses increased to 3 per day.' }],
    4:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    5:  [{ type: 'passive', name: 'Extra Attack', description: 'You can attack twice when you take the Attack action.' },
         { type: 'passive', name: 'Fast Movement', description: 'Speed increases by 10 ft while not wearing heavy armor.' }],
    6:  [{ type: 'passive', name: 'Rage Uses +1', description: 'Rage uses increased to 4 per day.' }],
    7:  [{ type: 'passive', name: 'Feral Instinct', description: 'Advantage on initiative rolls. Can enter rage to act normally if surprised.' }],
    8:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    9:  [{ type: 'passive', name: 'Brutal Critical', description: 'Roll one additional weapon damage die on a critical hit.' }],
    10: [{ type: 'passive', name: 'Rage Uses +1', description: 'Rage uses increased to 5 per day.' }],
    11: [{ type: 'passive', name: 'Relentless Rage', description: 'If you drop to 0 HP while raging, make a DC 10 CON save to drop to 1 HP instead.' }],
    12: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' },
         { type: 'passive', name: 'Rage Uses +1', description: 'Rage uses increased to 6 per day.' }],
    13: [{ type: 'passive', name: 'Brutal Critical +1', description: 'Roll two additional weapon damage dice on a critical hit.' }],
    15: [{ type: 'passive', name: 'Persistent Rage', description: 'Rage only ends early if you fall unconscious or choose to end it.' }],
    16: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' },
         { type: 'passive', name: 'Rage Uses +1', description: 'Rage uses increased to unlimited.' }],
    17: [{ type: 'passive', name: 'Brutal Critical +1', description: 'Roll three additional weapon damage dice on a critical hit.' }],
    18: [{ type: 'passive', name: 'Indomitable Might', description: 'STR checks use your STR score if it\'s lower than the roll.' }],
    19: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    20: [{ type: 'passive', name: 'Primal Champion', description: 'STR and CON each increase by 4, up to a maximum of 24.' }]
  },

  Bard: {
    1:  [{ type: 'passive', name: 'Spellcasting', description: 'You can cast bard spells using CHA as your spellcasting ability.' },
         { type: 'passive', name: 'Bardic Inspiration', description: 'Bonus action: grant a d6 Bardic Inspiration die to a creature within 60 ft. Uses = CHA modifier.' }],
    2:  [{ type: 'passive', name: 'Jack of All Trades', description: 'Add half your proficiency bonus to ability checks you\'re not proficient in.' },
         { type: 'passive', name: 'Song of Rest', description: 'You and friendly creatures regain extra 1d6 HP when spending Hit Dice during a short rest.' }],
    3:  [{ type: 'subclass', name: 'Bard College', description: 'Choose your Bard College archetype.' },
         { type: 'passive', name: 'Expertise', description: 'Double your proficiency bonus for two skills of your choice.' },
         { type: 'passive', name: 'Bardic Inspiration d8', description: 'Bardic Inspiration die increases to d8.' }],
    4:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    5:  [{ type: 'passive', name: 'Font of Inspiration', description: 'Regain all Bardic Inspiration uses on a short or long rest.' }],
    6:  [{ type: 'passive', name: 'Countercharm', description: 'Use your action to perform music that gives nearby allies advantage vs. being frightened or charmed.' }],
    8:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    10: [{ type: 'passive', name: 'Bardic Inspiration d10', description: 'Bardic Inspiration die increases to d10.' },
         { type: 'passive', name: 'Expertise (2 more)', description: 'Double your proficiency bonus for two more skills of your choice.' },
         { type: 'passive', name: 'Magical Secrets', description: 'Learn two spells from any class spell list.' }],
    12: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    14: [{ type: 'passive', name: 'Magical Secrets', description: 'Learn two more spells from any class spell list.' }],
    15: [{ type: 'passive', name: 'Bardic Inspiration d12', description: 'Bardic Inspiration die increases to d12.' }],
    16: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    18: [{ type: 'passive', name: 'Magical Secrets', description: 'Learn two more spells from any class spell list.' }],
    19: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    20: [{ type: 'passive', name: 'Superior Inspiration', description: 'If you have no Bardic Inspiration when rolling initiative, you regain one use.' }]
  },

  Cleric: {
    1:  [{ type: 'subclass', name: 'Divine Domain', description: 'Choose your Divine Domain — the source and nature of your divine power.' },
         { type: 'passive', name: 'Spellcasting', description: 'You can cast cleric spells using WIS as your spellcasting ability.' },
         { type: 'passive', name: 'Divine Domain Feature', description: 'You gain a feature based on your chosen Divine Domain.' }],
    2:  [{ type: 'passive', name: 'Channel Divinity (1/rest)', description: 'Channel divine energy to fuel magical effects. Gain Turn Undead and your domain\'s Channel Divinity option.' }],
    3:  [{ type: 'passive', name: 'Channel Divinity (2/rest)', description: 'You can use Channel Divinity twice between rests.' }],
    4:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    5:  [{ type: 'passive', name: 'Destroy Undead CR 1/2', description: 'When you use Turn Undead, undead of CR 1/2 or lower are instantly destroyed.' }],
    6:  [{ type: 'passive', name: 'Channel Divinity (3/rest)', description: 'You can use Channel Divinity three times between rests.' }],
    7:  [{ type: 'passive', name: 'Divine Domain Feature', description: 'You gain an additional feature from your Divine Domain.' }],
    8:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' },
         { type: 'passive', name: 'Destroy Undead CR 1', description: 'When you use Turn Undead, undead of CR 1 or lower are instantly destroyed.' }],
    10: [{ type: 'passive', name: 'Divine Intervention', description: 'Implore your deity to intervene. Roll d100 — if you roll ≤ your cleric level, it works.' }],
    11: [{ type: 'passive', name: 'Destroy Undead CR 2', description: 'When you use Turn Undead, undead of CR 2 or lower are instantly destroyed.' }],
    12: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    14: [{ type: 'passive', name: 'Destroy Undead CR 3', description: 'When you use Turn Undead, undead of CR 3 or lower are instantly destroyed.' }],
    16: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    17: [{ type: 'passive', name: 'Destroy Undead CR 4', description: 'When you use Turn Undead, undead of CR 4 or lower are instantly destroyed.' },
         { type: 'passive', name: 'Divine Domain Feature', description: 'You gain a powerful capstone feature from your Divine Domain.' }],
    19: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    20: [{ type: 'passive', name: 'Divine Intervention Improved', description: 'Your Divine Intervention call automatically succeeds.' }]
  },

  Druid: {
    1:  [{ type: 'passive', name: 'Druidic', description: 'You know Druidic, a secret language known only by druids.' },
         { type: 'passive', name: 'Spellcasting', description: 'You can cast druid spells using WIS as your spellcasting ability.' }],
    2:  [{ type: 'passive', name: 'Wild Shape', description: 'Transform into a beast you have seen. CR limit: 1/4 (no fly/swim speed). Uses: 2. Recover on short/long rest.' },
         { type: 'subclass', name: 'Druid Circle', description: 'Choose your Druid Circle archetype.' }],
    4:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' },
         { type: 'passive', name: 'Wild Shape CR 1/2', description: 'Wild Shape CR limit increases to 1/2 (no fly speed).' }],
    6:  [{ type: 'passive', name: 'Wild Shape Improvement', description: 'Wild Shape CR limit increases to 1 (no fly speed).' }],
    8:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    10: [{ type: 'passive', name: 'Wild Shape CR 2', description: 'Wild Shape CR limit increases to CR 2.' }],
    12: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    16: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    18: [{ type: 'passive', name: 'Timeless Body', description: 'You age only 1 year for every 10 years that pass.' },
         { type: 'passive', name: 'Beast Spells', description: 'You can cast spells while in Wild Shape form.' }],
    19: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    20: [{ type: 'passive', name: 'Archdruid', description: 'Unlimited Wild Shape uses. Ignore verbal and somatic spell components.' }]
  },

  Fighter: {
    1:  [{ type: 'passive', name: 'Fighting Style', description: 'Choose a fighting style: Archery (+2 ranged attacks), Defense (+1 AC), Dueling (+2 damage with one-handed weapon), Great Weapon Fighting, or Two-Weapon Fighting.' },
         { type: 'passive', name: 'Second Wind', description: 'Bonus action: regain 1d10 + fighter level HP. Recover on short/long rest.' }],
    2:  [{ type: 'passive', name: 'Action Surge', description: 'Take one additional action on your turn. Recover on short/long rest.' }],
    3:  [{ type: 'subclass', name: 'Martial Archetype', description: 'Choose your Martial Archetype.' }],
    4:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    5:  [{ type: 'passive', name: 'Extra Attack', description: 'You can attack twice when you take the Attack action.' }],
    6:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    7:  [{ type: 'passive', name: 'Martial Archetype Feature', description: 'You gain a feature from your Martial Archetype.' }],
    8:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    9:  [{ type: 'passive', name: 'Indomitable (1/rest)', description: 'Reroll a saving throw you fail. You must use the new result.' }],
    10: [{ type: 'passive', name: 'Martial Archetype Feature', description: 'You gain another feature from your Martial Archetype.' }],
    11: [{ type: 'passive', name: 'Extra Attack (2)', description: 'You can now attack three times when you take the Attack action.' }],
    12: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    13: [{ type: 'passive', name: 'Indomitable (2/rest)', description: 'You can use Indomitable twice between rests.' }],
    14: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    15: [{ type: 'passive', name: 'Martial Archetype Feature', description: 'You gain another feature from your Martial Archetype.' }],
    16: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    17: [{ type: 'passive', name: 'Action Surge (2/rest)', description: 'You can use Action Surge twice between rests.' },
         { type: 'passive', name: 'Indomitable (3/rest)', description: 'You can use Indomitable three times between rests.' }],
    18: [{ type: 'passive', name: 'Martial Archetype Feature', description: 'You gain another feature from your Martial Archetype.' }],
    19: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    20: [{ type: 'passive', name: 'Extra Attack (3)', description: 'You can now attack four times when you take the Attack action.' }]
  },

  Monk: {
    1:  [{ type: 'passive', name: 'Unarmored Defense', description: 'While not wearing armor or shield, AC = 10 + DEX mod + WIS mod.' },
         { type: 'passive', name: 'Martial Arts', description: 'Use DEX instead of STR for unarmed strikes and monk weapons. Unarmed strike damage: d4.' }],
    2:  [{ type: 'passive', name: 'Ki (2 points)', description: 'Spend Ki points to fuel special abilities. Recharge on short/long rest.' },
         { type: 'passive', name: 'Unarmored Movement +10ft', description: 'Speed increases by 10 ft while not wearing armor.' },
         { type: 'passive', name: 'Flurry of Blows', description: 'After Attack action, spend 1 Ki to make two unarmed strikes as a bonus action.' }],
    3:  [{ type: 'subclass', name: 'Monastic Tradition', description: 'Choose your Monastic Tradition.' },
         { type: 'passive', name: 'Deflect Missiles', description: 'Reduce ranged weapon damage by 1d10 + DEX mod + monk level. If reduced to 0, catch and throw it back.' }],
    4:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' },
         { type: 'passive', name: 'Slow Fall', description: 'Reduce falling damage by 5 × monk level.' }],
    5:  [{ type: 'passive', name: 'Extra Attack', description: 'You can attack twice when you take the Attack action.' },
         { type: 'passive', name: 'Stunning Strike', description: 'Spend 1 Ki after hitting to force a CON save or stun target until end of your next turn.' }],
    6:  [{ type: 'passive', name: 'Ki-Empowered Strikes', description: 'Unarmed strikes count as magical for overcoming resistance.' },
         { type: 'passive', name: 'Unarmored Movement +15ft', description: 'Speed increases by 15 ft while not wearing armor.' }],
    7:  [{ type: 'passive', name: 'Evasion', description: 'On a successful DEX save against an area effect, take no damage. On failure, take half.' },
         { type: 'passive', name: 'Stillness of Mind', description: 'Use your action to end one charm or frighten effect on yourself.' }],
    8:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    9:  [{ type: 'passive', name: 'Unarmored Movement +15ft (walls)', description: 'You can run up walls and across liquids.' }],
    10: [{ type: 'passive', name: 'Purity of Body', description: 'You are immune to disease and poison.' }],
    12: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    13: [{ type: 'passive', name: 'Tongue of the Sun and Moon', description: 'You can communicate with any creature that can understand a language.' }],
    14: [{ type: 'passive', name: 'Diamond Soul', description: 'Proficiency in all saving throws. Spend 1 Ki to reroll a failed save.' }],
    15: [{ type: 'passive', name: 'Timeless Body', description: 'You no longer need food or water and age slowly.' }],
    16: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    18: [{ type: 'passive', name: 'Empty Body', description: 'Spend 4 Ki to become invisible for 1 minute, with resistance to all damage except force.' }],
    19: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    20: [{ type: 'passive', name: 'Perfect Self', description: 'When you roll initiative with 0 Ki points, you regain 4 Ki points.' }]
  },

  Paladin: {
    1:  [{ type: 'passive', name: 'Divine Sense', description: 'Detect celestials, fiends, and undead within 60 ft. Uses: 1 + CHA mod per day.' },
         { type: 'passive', name: 'Lay on Hands', description: 'Heal a total of paladin level × 5 HP per long rest. Can also cure disease/poison (5 HP).' }],
    2:  [{ type: 'passive', name: 'Fighting Style', description: 'Choose a fighting style: Defense, Dueling, Great Weapon Fighting, or Protection.' },
         { type: 'passive', name: 'Spellcasting', description: 'You can cast paladin spells using CHA as your spellcasting ability.' },
         { type: 'passive', name: 'Divine Smite', description: 'Spend a spell slot on a melee hit: deal extra 2d8 radiant damage (+1d8 per slot level above 1st). +1d8 vs undead/fiends.' }],
    3:  [{ type: 'subclass', name: 'Sacred Oath', description: 'Choose your Sacred Oath — the tenets you swear to uphold.' },
         { type: 'passive', name: 'Divine Health', description: 'You are immune to disease.' }],
    4:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    5:  [{ type: 'passive', name: 'Extra Attack', description: 'You can attack twice when you take the Attack action.' }],
    6:  [{ type: 'passive', name: 'Aura of Protection', description: 'Allies within 10 ft add your CHA modifier to saving throws (min +1).' }],
    7:  [{ type: 'passive', name: 'Sacred Oath Feature', description: 'You gain a feature from your Sacred Oath.' }],
    8:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    10: [{ type: 'passive', name: 'Aura of Courage', description: 'Allies within 10 ft can\'t be frightened while you are conscious.' }],
    11: [{ type: 'passive', name: 'Improved Divine Smite', description: 'Melee weapon attacks deal an extra 1d8 radiant damage.' }],
    12: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    14: [{ type: 'passive', name: 'Cleansing Touch', description: 'Use your action to end one spell on yourself or a willing creature. Uses: CHA mod per long rest.' }],
    15: [{ type: 'passive', name: 'Sacred Oath Feature', description: 'You gain another feature from your Sacred Oath.' }],
    16: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    18: [{ type: 'passive', name: 'Aura Improvements', description: 'Aura of Protection and Aura of Courage radius increases to 30 ft.' }],
    19: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    20: [{ type: 'passive', name: 'Sacred Oath Capstone', description: 'You gain your Sacred Oath\'s most powerful feature.' }]
  },

  Ranger: {
    1:  [{ type: 'passive', name: 'Favored Enemy', description: 'Choose a type of enemy. You have advantage on tracking them and recall information about them.' },
         { type: 'passive', name: 'Natural Explorer', description: 'Choose a favored terrain. You gain several benefits when traveling through it.' }],
    2:  [{ type: 'passive', name: 'Fighting Style', description: 'Choose a fighting style: Archery, Defense, Dueling, or Two-Weapon Fighting.' },
         { type: 'passive', name: 'Spellcasting', description: 'You can cast ranger spells using WIS as your spellcasting ability.' }],
    3:  [{ type: 'subclass', name: 'Ranger Archetype', description: 'Choose your Ranger Archetype.' },
         { type: 'passive', name: 'Primeval Awareness', description: 'Spend a spell slot to sense the types of favored enemies within 1 mile (or 6 miles in favored terrain).' }],
    4:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    5:  [{ type: 'passive', name: 'Extra Attack', description: 'You can attack twice when you take the Attack action.' }],
    6:  [{ type: 'passive', name: 'Favored Enemy +1', description: 'Choose one more favored enemy type.' },
         { type: 'passive', name: 'Natural Explorer +1', description: 'Choose one more favored terrain.' }],
    7:  [{ type: 'passive', name: 'Ranger Archetype Feature', description: 'You gain a feature from your Ranger Archetype.' }],
    8:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' },
         { type: 'passive', name: 'Land\'s Stride', description: 'Moving through difficult terrain costs no extra movement. Pass through nonmagical plants without slowing.' }],
    10: [{ type: 'passive', name: 'Natural Explorer +1', description: 'Choose one more favored terrain.' },
         { type: 'passive', name: 'Hide in Plain Sight', description: 'Spend 1 minute creating camouflage. +10 to Stealth while motionless.' }],
    11: [{ type: 'passive', name: 'Ranger Archetype Feature', description: 'You gain another feature from your Ranger Archetype.' }],
    12: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    14: [{ type: 'passive', name: 'Favored Enemy +1', description: 'Choose one more favored enemy type.' },
         { type: 'passive', name: 'Vanish', description: 'Use Hide as a bonus action. You can\'t be tracked by nonmagical means.' }],
    15: [{ type: 'passive', name: 'Ranger Archetype Feature', description: 'You gain another feature from your Ranger Archetype.' }],
    16: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    18: [{ type: 'passive', name: 'Feral Senses', description: 'You don\'t have disadvantage on attacks against invisible creatures you can detect. Aware of invisible creatures within 30 ft.' }],
    19: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    20: [{ type: 'passive', name: 'Foe Slayer', description: 'Once per turn, add your WIS mod to an attack or damage roll against a favored enemy.' }]
  },

  Rogue: {
    1:  [{ type: 'passive', name: 'Expertise', description: 'Double your proficiency bonus for two skills you\'re proficient in.' },
         { type: 'passive', name: 'Sneak Attack (1d6)', description: 'Deal extra 1d6 damage when you have advantage or an ally adjacent to the target.' },
         { type: 'passive', name: 'Thieves\' Cant', description: 'You know the secret language of rogues, usable to pass hidden messages.' }],
    2:  [{ type: 'passive', name: 'Cunning Action', description: 'Bonus action: Dash, Disengage, or Hide.' }],
    3:  [{ type: 'subclass', name: 'Roguish Archetype', description: 'Choose your Roguish Archetype.' },
         { type: 'passive', name: 'Sneak Attack (2d6)', description: 'Sneak Attack damage increases to 2d6.' }],
    4:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    5:  [{ type: 'passive', name: 'Uncanny Dodge', description: 'Use your reaction to halve an attacker\'s damage against you.' },
         { type: 'passive', name: 'Sneak Attack (3d6)', description: 'Sneak Attack damage increases to 3d6.' }],
    6:  [{ type: 'passive', name: 'Expertise (2 more)', description: 'Double your proficiency bonus for two more skills.' }],
    7:  [{ type: 'passive', name: 'Evasion', description: 'On a successful DEX save against an area effect, take no damage.' },
         { type: 'passive', name: 'Sneak Attack (4d6)', description: 'Sneak Attack damage increases to 4d6.' }],
    8:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    9:  [{ type: 'passive', name: 'Sneak Attack (5d6)', description: 'Sneak Attack damage increases to 5d6.' }],
    10: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    11: [{ type: 'passive', name: 'Reliable Talent', description: 'Treat any roll of 9 or lower as a 10 on skills you\'re proficient in.' },
         { type: 'passive', name: 'Sneak Attack (6d6)', description: 'Sneak Attack damage increases to 6d6.' }],
    12: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    14: [{ type: 'passive', name: 'Blindsense', description: 'If you can hear, you know the location of any hidden or invisible creature within 10 ft.' }],
    15: [{ type: 'passive', name: 'Slippery Mind', description: 'You gain proficiency in WIS saving throws.' }],
    16: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    18: [{ type: 'passive', name: 'Elusive', description: 'No attack roll has advantage against you while you\'re not incapacitated.' }],
    19: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    20: [{ type: 'passive', name: 'Stroke of Luck', description: 'Turn a miss into a hit, or a failed ability check into a 20. Recover on short/long rest.' }]
  },

  Sorcerer: {
    1:  [{ type: 'subclass', name: 'Sorcerous Origin', description: 'Choose your Sorcerous Origin — the source of your innate magic.' },
         { type: 'passive', name: 'Spellcasting', description: 'You can cast sorcerer spells using CHA as your spellcasting ability.' }],
    2:  [{ type: 'passive', name: 'Font of Magic', description: 'You gain 2 Sorcery Points per long rest. Use them to create spell slots or fuel metamagic.' }],
    3:  [{ type: 'passive', name: 'Metamagic (2 options)', description: 'Choose 2 Metamagic options: Careful, Distant, Empowered, Extended, Heightened, Quickened, Subtle, or Twinned Spell.' }],
    4:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    6:  [{ type: 'passive', name: 'Sorcerous Origin Feature', description: 'You gain a feature from your Sorcerous Origin.' }],
    8:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    10: [{ type: 'passive', name: 'Metamagic +1', description: 'Learn one additional Metamagic option.' }],
    12: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    14: [{ type: 'passive', name: 'Sorcerous Origin Feature', description: 'You gain another feature from your Sorcerous Origin.' }],
    16: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    17: [{ type: 'passive', name: 'Metamagic +1', description: 'Learn one more Metamagic option.' }],
    18: [{ type: 'passive', name: 'Sorcerous Origin Feature', description: 'You gain the capstone feature from your Sorcerous Origin.' }],
    19: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    20: [{ type: 'passive', name: 'Sorcerous Restoration', description: 'Regain 4 Sorcery Points on a short rest.' }]
  },

  Warlock: {
    1:  [{ type: 'subclass', name: 'Otherworldly Patron', description: 'Choose your Otherworldly Patron — the entity that grants you your power.' },
         { type: 'passive', name: 'Pact Magic', description: 'Cast warlock spells using CHA. Spell slots recharge on short or long rest.' }],
    2:  [{ type: 'passive', name: 'Eldritch Invocations (2)', description: 'Choose 2 Eldritch Invocations to enhance your abilities.' }],
    3:  [{ type: 'passive', name: 'Pact Boon', description: 'Choose a Pact Boon: Pact of the Blade (summon weapon), Pact of the Chain (familiar), or Pact of the Tome (spellbook).' },
         { type: 'passive', name: 'Eldritch Invocations +1', description: 'Learn one additional Eldritch Invocation.' }],
    4:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    5:  [{ type: 'passive', name: 'Eldritch Invocations +1', description: 'Learn one additional Eldritch Invocation.' }],
    6:  [{ type: 'passive', name: 'Patron Feature', description: 'You gain a feature from your Otherworldly Patron.' }],
    7:  [{ type: 'passive', name: 'Eldritch Invocations +1', description: 'Learn one additional Eldritch Invocation.' }],
    8:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    9:  [{ type: 'passive', name: 'Eldritch Invocations +1', description: 'Learn one additional Eldritch Invocation.' }],
    10: [{ type: 'passive', name: 'Patron Feature', description: 'You gain another feature from your Otherworldly Patron.' }],
    11: [{ type: 'passive', name: 'Mystic Arcanum (6th)', description: 'Cast one 6th-level spell once per long rest without a spell slot.' }],
    12: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' },
         { type: 'passive', name: 'Eldritch Invocations +1', description: 'Learn one additional Eldritch Invocation.' }],
    13: [{ type: 'passive', name: 'Mystic Arcanum (7th)', description: 'Cast one 7th-level spell once per long rest without a spell slot.' }],
    15: [{ type: 'passive', name: 'Mystic Arcanum (8th)', description: 'Cast one 8th-level spell once per long rest without a spell slot.' },
         { type: 'passive', name: 'Eldritch Invocations +1', description: 'Learn one additional Eldritch Invocation.' }],
    16: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    17: [{ type: 'passive', name: 'Mystic Arcanum (9th)', description: 'Cast one 9th-level spell once per long rest without a spell slot.' }],
    18: [{ type: 'passive', name: 'Eldritch Invocations +1', description: 'Learn one additional Eldritch Invocation.' },
         { type: 'passive', name: 'Patron Feature', description: 'You gain the capstone feature from your Otherworldly Patron.' }],
    19: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    20: [{ type: 'passive', name: 'Eldritch Master', description: 'Spend 1 minute entreating your patron to regain all Pact Magic spell slots.' }]
  },

  Wizard: {
    1:  [{ type: 'passive', name: 'Spellcasting', description: 'You can cast wizard spells using INT as your spellcasting ability. You have a spellbook containing 6 spells.' },
         { type: 'passive', name: 'Arcane Recovery', description: 'Once per day after a short rest, recover spell slots totalling up to half your wizard level (rounded up).' }],
    2:  [{ type: 'subclass', name: 'Arcane Tradition', description: 'Choose your Arcane Tradition — a school of magic to specialise in.' }],
    4:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    6:  [{ type: 'passive', name: 'Arcane Tradition Feature', description: 'You gain a feature from your Arcane Tradition.' }],
    8:  [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    10: [{ type: 'passive', name: 'Arcane Tradition Feature', description: 'You gain another feature from your Arcane Tradition.' }],
    12: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    14: [{ type: 'passive', name: 'Arcane Tradition Feature', description: 'You gain another feature from your Arcane Tradition.' }],
    16: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    18: [{ type: 'passive', name: 'Spell Mastery', description: 'Choose a 1st and 2nd-level spell. Cast them at their lowest level without expending a spell slot.' }],
    19: [{ type: 'asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each.' }],
    20: [{ type: 'passive', name: 'Signature Spells', description: 'Choose two 3rd-level spells. You always have them prepared and can cast each once per short rest at 3rd level for free.' }]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all features gained when levelling from oldLevel to newLevel.
 * Returns array of { level, features[] }
 */
export function getFeaturesForLevelRange(className, oldLevel, newLevel) {
  const classTable = CLASS_FEATURES[className];
  if (!classTable) return [];

  const gained = [];
  for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
    if (classTable[lvl]?.length) {
      gained.push({ level: lvl, features: classTable[lvl] });
    }
  }
  return gained;
}

/**
 * Get features gained at exactly one level.
 */
export function getFeaturesAtLevel(className, level) {
  return CLASS_FEATURES[className]?.[level] || [];
}

/**
 * Does this level-up require player interaction?
 * (ASI or subclass selection)
 */
export function requiresPlayerChoice(className, oldLevel, newLevel) {
  const gained = getFeaturesForLevelRange(className, oldLevel, newLevel);
  return gained.some(({ features }) =>
    features.some(f => f.type === 'asi' || f.type === 'subclass')
  );
}

/**
 * Get subclass options for a class.
 */
export function getSubclassOptions(className) {
  return SUBCLASS_OPTIONS[className] || [];
}