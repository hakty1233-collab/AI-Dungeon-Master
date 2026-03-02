// frontend/src/utils/inventorySystem.js

/**
 * D&D 5e Inventory System
 * Items, equipment, potions, loot detection
 */

export const ITEM_TYPES = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  SHIELD: 'shield',
  POTION: 'potion',
  SCROLL: 'scroll',
  QUEST: 'quest',
  MISC: 'misc',
  ACCESSORY: 'accessory'
};

export const ITEM_RARITY = {
  COMMON:    { name: 'Common',    color: '#888' },
  UNCOMMON:  { name: 'Uncommon',  color: '#4CAF50' },
  RARE:      { name: 'Rare',      color: '#2196F3' },
  EPIC:      { name: 'Epic',      color: '#9C27B0' },
  LEGENDARY: { name: 'Legendary', color: '#ffd700' }
};

export const WEAPON_TEMPLATES = {
  shortsword: { id: 'shortsword', name: 'Shortsword',   type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.COMMON,   damage: '1d6',  damageType: 'piercing',    properties: ['light', 'finesse'],              weight: 2,  value: 10,   description: 'A simple but effective blade.' },
  longsword:  { id: 'longsword',  name: 'Longsword',    type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.COMMON,   damage: '1d8',  damageType: 'slashing',    properties: ['versatile (1d10)'],              weight: 3,  value: 15,   description: 'A versatile weapon favored by knights.' },
  greataxe:   { id: 'greataxe',   name: 'Greataxe',     type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.COMMON,   damage: '1d12', damageType: 'slashing',    properties: ['heavy', 'two-handed'],           weight: 7,  value: 30,   description: 'A massive axe that cleaves through foes.' },
  dagger:     { id: 'dagger',     name: 'Dagger',       type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.COMMON,   damage: '1d4',  damageType: 'piercing',    properties: ['light', 'finesse', 'thrown'],    weight: 1,  value: 2,    description: 'A small blade useful in close quarters.' },
  staff:      { id: 'staff',      name: 'Quarterstaff', type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.COMMON,   damage: '1d6',  damageType: 'bludgeoning', properties: ['versatile (1d8)'],               weight: 4,  value: 2,    description: 'A simple wooden staff.' },
  bow:        { id: 'bow',        name: 'Longbow',      type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.COMMON,   damage: '1d8',  damageType: 'piercing',    properties: ['ammunition', 'heavy', 'two-handed'], weight: 2, value: 50, description: 'A powerful ranged weapon.' }
};

export const ARMOR_TEMPLATES = {
  leather:   { id: 'leather',   name: 'Leather Armor', type: ITEM_TYPES.ARMOR, rarity: ITEM_RARITY.COMMON,   ac: 11, acBonus: 'DEX', weight: 10, value: 10,   description: 'Light and flexible protection.' },
  chainmail: { id: 'chainmail', name: 'Chainmail',     type: ITEM_TYPES.ARMOR, rarity: ITEM_RARITY.COMMON,   ac: 16, acBonus: null,  weight: 55, value: 75,   description: 'Heavy metal armor that clinks with each step.' },
  plate:     { id: 'plate',     name: 'Plate Armor',   type: ITEM_TYPES.ARMOR, rarity: ITEM_RARITY.UNCOMMON, ac: 18, acBonus: null,  weight: 65, value: 1500, description: 'The finest protection money can buy.' }
};

export const POTION_TEMPLATES = {
  healing:         { id: 'healing',         name: 'Potion of Healing',         type: ITEM_TYPES.POTION, rarity: ITEM_RARITY.COMMON,   effect: 'heal', power: '2d4+2', weight: 0.5, value: 50,  description: 'A red liquid that restores vitality.', consumable: true },
  greater_healing: { id: 'greater_healing', name: 'Potion of Greater Healing', type: ITEM_TYPES.POTION, rarity: ITEM_RARITY.UNCOMMON, effect: 'heal', power: '4d4+4', weight: 0.5, value: 150, description: 'A vibrant red potion of exceptional quality.', consumable: true },
  mana:            { id: 'mana',            name: 'Potion of Magic',            type: ITEM_TYPES.POTION, rarity: ITEM_RARITY.UNCOMMON, effect: 'restore_spell_slot', power: 1, weight: 0.5, value: 100, description: 'A shimmering blue liquid.', consumable: true }
};

export const MISC_TEMPLATES = {
  gold:  { id: 'gold',  name: 'Gold Coins',  type: ITEM_TYPES.MISC, rarity: ITEM_RARITY.COMMON, weight: 0,  value: 1, description: 'Shiny gold coins.',           stackable: true },
  rope:  { id: 'rope',  name: 'Rope (50 ft)', type: ITEM_TYPES.MISC, rarity: ITEM_RARITY.COMMON, weight: 10, value: 1, description: 'Hempen rope, useful for climbing.' },
  torch: { id: 'torch', name: 'Torch',        type: ITEM_TYPES.MISC, rarity: ITEM_RARITY.COMMON, weight: 1,  value: 1, description: 'Provides light in darkness.', stackable: true }
};

export const ALL_ITEMS = {
  ...WEAPON_TEMPLATES,
  ...ARMOR_TEMPLATES,
  ...POTION_TEMPLATES,
  ...MISC_TEMPLATES
};

export function createItem(templateId, quantity = 1) {
  const template = ALL_ITEMS[templateId];
  if (!template) { console.error('Unknown item template:', templateId); return null; }
  return {
    ...template,
    instanceId: `${templateId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    quantity: template.stackable ? quantity : 1,
    equipped: false
  };
}

export function addItemToInventory(inventory, item) {
  if (!item) return inventory;
  if (item.stackable) {
    const existingIndex = inventory.findIndex(i => i.id === item.id);
    if (existingIndex !== -1) {
      const updated = [...inventory];
      updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + item.quantity };
      return updated;
    }
  }
  return [...inventory, item];
}

export function removeItemFromInventory(inventory, instanceId, quantity = 1) {
  const itemIndex = inventory.findIndex(i => i.instanceId === instanceId);
  if (itemIndex === -1) return inventory;
  const item = inventory[itemIndex];
  if (item.stackable && item.quantity > quantity) {
    const updated = [...inventory];
    updated[itemIndex] = { ...item, quantity: item.quantity - quantity };
    return updated;
  }
  return inventory.filter(i => i.instanceId !== instanceId);
}

export function useItem(item, character) {
  if (item.type === ITEM_TYPES.POTION && item.effect === 'heal') {
    const diceMatch = item.power.match(/(\d+)d(\d+)\+(\d+)/);
    if (diceMatch) {
      const [, numDice, dieSize, bonus] = diceMatch;
      let healing = parseInt(bonus);
      for (let i = 0; i < parseInt(numDice); i++) healing += Math.floor(Math.random() * parseInt(dieSize)) + 1;
      const newHp = Math.min(character.maxHp, character.hp + healing);
      return { success: true, message: `${character.name} heals for ${healing} HP!`, healing, newHp };
    }
  }
  return { success: false, message: 'Cannot use this item.' };
}

export function equipItem(character, item) {
  if (item.type === ITEM_TYPES.WEAPON) return { ...character, equippedItems: { ...character.equippedItems, weapon: item } };
  if (item.type === ITEM_TYPES.ARMOR)  return { ...character, equippedItems: { ...character.equippedItems, armor: item }, armorClass: item.ac + (item.acBonus === 'DEX' ? Math.floor((character.abilities.DEX - 10) / 2) : 0) };
  if (item.type === ITEM_TYPES.SHIELD) return { ...character, equippedItems: { ...character.equippedItems, shield: item }, armorClass: character.armorClass + 2 };
  return character;
}

export function unequipItem(character, slot) {
  const newEquipped = { ...character.equippedItems };
  const item = newEquipped[slot];
  newEquipped[slot] = null;
  let newAC = character.armorClass;
  if (slot === 'shield' && item) newAC -= 2;
  return { ...character, equippedItems: newEquipped, armorClass: newAC };
}

export function getTotalWeight(inventory) {
  return inventory.reduce((total, item) => total + (item.weight * item.quantity), 0);
}

export function getCarryingCapacity(character) {
  return character.abilities.STR * 15;
}

export function isEncumbered(character, inventory) {
  return getTotalWeight(inventory) > getCarryingCapacity(character);
}

/**
 * Apply a gold award directly to a character's gold stat AND inventory.
 * Returns the updated character.
 */
export function awardGold(character, amount) {
  if (!amount || amount <= 0) return character;

  // Update top-level gold stat (used by CharacterSheet display)
  const newGoldStat = (character.gold || 0) + amount;

  // Also update/create the gold stack in inventory so InventoryPanel shows it
  const inventory = character.inventory || [];
  const goldIdx   = inventory.findIndex(i => i.id === 'gold');
  let newInventory;
  if (goldIdx !== -1) {
    newInventory = inventory.map((item, i) =>
      i === goldIdx ? { ...item, quantity: item.quantity + amount } : item
    );
  } else {
    newInventory = [...inventory, {
      id: 'gold', name: 'Gold Coins', type: 'misc',
      rarity: ITEM_RARITY.COMMON, weight: 0, value: 1,
      description: 'Shiny gold coins.', stackable: true,
      instanceId: `gold_${Date.now()}`,
      quantity: amount, equipped: false
    }];
  }

  console.log(`[Gold] ${character.name}: +${amount} gp (total: ${newGoldStat})`);
  return { ...character, gold: newGoldStat, inventory: newInventory };
}

/**
 * Detect items AND gold in DM narration.
 *
 * Returns array of item objects (via createItem) plus a special
 * { isGold: true, amount: N } entry for any gold found.
 *
 * TIGHTER matching rules:
 * - Weapons/armor only trigger when phrasing implies the party RECEIVED them
 *   (e.g. "you find a sword", "grants you leather armor") — not just any mention.
 * - Gold matches "X gold" or "X gp" near reward/loot phrasing.
 * - Potions still match on generic mention (they're rarely mentioned otherwise).
 */
export function detectLootInNarration(narration) {
  if (!narration) return [];
  const lower = narration.toLowerCase();
  const found  = [];

  // ── GOLD — match "X gold", "X gp", "X gold coins" near reward context ──
  // Accept patterns like "50 gold", "50 gp", "rewarded with 50 gold", "find 50 gold pieces"
  const goldPatterns = [
    /(?:receive|reward(?:ed)?|find|found|earn|gain|given|grant(?:ed)?|pocket)[^.]{0,40}?(\d+)\s*(?:gold|gp)\b/i,
    /(\d+)\s*(?:gold(?:\s+coins?|\s+pieces?)?|gp)\b/i,
  ];
  for (const pattern of goldPatterns) {
    const match = narration.match(pattern);
    if (match) {
      const amount = parseInt(match[1]);
      if (amount > 0 && amount < 100000) { // sanity cap
        found.push({ isGold: true, amount });
        console.log(`[Loot] Gold detected: ${amount} gp`);
        break; // only count once
      }
    }
  }

  // ── WEAPONS — only when phrasing implies acquisition ──
  const acquisitionContext = /(?:find|found|receive|reward|pick\s*up|loot|given|grant|discover|obtain|equipped?\s+with)/i;

  // Check for acquisition context somewhere in the narration before matching weapons
  if (acquisitionContext.test(narration)) {
    const weaponKeywords = {
      shortsword: ['shortsword', 'short sword'],
      longsword:  ['longsword', 'long sword'],
      dagger:     ['dagger', 'knife'],
      greataxe:   ['greataxe', 'great axe'],
      bow:        ['longbow', 'long bow', 'shortbow'],
      staff:      ['quarterstaff', 'quarter staff'],
    };
    Object.entries(weaponKeywords).forEach(([id, keywords]) => {
      if (keywords.some(kw => lower.includes(kw))) {
        found.push({ isItem: true, id });
        console.log(`[Loot] Weapon detected: ${id}`);
      }
    });

    // ── ARMOR ──
    if (lower.includes('leather armor') || lower.includes('leather armour')) { found.push({ isItem: true, id: 'leather' }); console.log('[Loot] Armor detected: leather'); }
    if (lower.includes('chainmail') || lower.includes('chain mail'))          { found.push({ isItem: true, id: 'chainmail' }); console.log('[Loot] Armor detected: chainmail'); }
    if (lower.includes('plate armor') || lower.includes('plate armour'))      { found.push({ isItem: true, id: 'plate' }); console.log('[Loot] Armor detected: plate'); }
  }

  // ── POTIONS — match on any mention (specific enough on their own) ──
  if (lower.includes('potion of healing') || lower.includes('healing potion')) {
    found.push({ isItem: true, id: 'healing' });
    console.log('[Loot] Potion detected: healing');
  }
  if (lower.includes('greater healing') || lower.includes('superior healing')) {
    found.push({ isItem: true, id: 'greater_healing' });
    console.log('[Loot] Potion detected: greater_healing');
  }

  // Convert to item instances
  return found.map(entry => {
    if (entry.isGold)  return { ...createItem('gold', entry.amount), _goldAmount: entry.amount };
    if (entry.isItem)  return createItem(entry.id);
    return null;
  }).filter(Boolean);
}