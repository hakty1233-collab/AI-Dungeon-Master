// frontend/src/utils/merchantSystem.js

/**
 * D&D 5e Merchant / Shop System
 *
 * Integrates with inventorySystem.js — gold is stored as a stackable
 * inventory item (id: 'gold') on the character, not a separate field.
 */

import {
  ITEM_TYPES,
  ITEM_RARITY,
  WEAPON_TEMPLATES,
  ARMOR_TEMPLATES,
  POTION_TEMPLATES,
  MISC_TEMPLATES,
  createItem,
  addItemToInventory,
  removeItemFromInventory
} from './inventorySystem';

// ─────────────────────────────────────────────────────────────────────────────
//  MERCHANT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export const MERCHANT_TYPES = {
  GENERAL:    'general',
  BLACKSMITH: 'blacksmith',
  ALCHEMIST:  'alchemist',
  MAGIC:      'magic',
  FENCE:      'fence'
};

export const MERCHANT_DEFINITIONS = {
  [MERCHANT_TYPES.GENERAL]: {
    name: 'General Store', icon: '🏪',
    description: 'A well-stocked shop with everyday adventuring supplies.',
    buyMultiplier: 1.0, sellMultiplier: 0.5,
    stockCategories: [ITEM_TYPES.MISC, ITEM_TYPES.POTION, ITEM_TYPES.WEAPON]
  },
  [MERCHANT_TYPES.BLACKSMITH]: {
    name: 'Blacksmith', icon: '⚒️',
    description: 'A skilled smith who crafts and sells quality weapons and armor.',
    buyMultiplier: 1.0, sellMultiplier: 0.6,
    stockCategories: [ITEM_TYPES.WEAPON, ITEM_TYPES.ARMOR, ITEM_TYPES.SHIELD]
  },
  [MERCHANT_TYPES.ALCHEMIST]: {
    name: 'Alchemist', icon: '⚗️',
    description: 'A master of potions and elixirs.',
    buyMultiplier: 1.0, sellMultiplier: 0.4,
    stockCategories: [ITEM_TYPES.POTION, ITEM_TYPES.SCROLL]
  },
  [MERCHANT_TYPES.MAGIC]: {
    name: 'Arcane Emporium', icon: '🔮',
    description: 'Rare and magical items for those who know their worth.',
    buyMultiplier: 1.2, sellMultiplier: 0.6,
    stockCategories: [ITEM_TYPES.SCROLL, ITEM_TYPES.ACCESSORY, ITEM_TYPES.POTION]
  },
  [MERCHANT_TYPES.FENCE]: {
    name: 'Shady Dealer', icon: '🕵️',
    description: 'Asks no questions. Pays poorly. Sells cheap.',
    buyMultiplier: 0.7, sellMultiplier: 0.7,
    stockCategories: [ITEM_TYPES.WEAPON, ITEM_TYPES.MISC, ITEM_TYPES.ARMOR]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  SHOP ITEM CATALOG
// ─────────────────────────────────────────────────────────────────────────────

export const SHOP_ITEMS = {
  ...WEAPON_TEMPLATES,
  ...ARMOR_TEMPLATES,
  ...POTION_TEMPLATES,
  ...MISC_TEMPLATES,

  // Extra weapons
  handaxe: { id: 'handaxe', name: 'Handaxe', type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.COMMON, damage: '1d6', damageType: 'slashing', properties: ['light', 'thrown (20/60)'], weight: 2, value: 5, description: 'A light axe that can be thrown.' },
  mace: { id: 'mace', name: 'Mace', type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.COMMON, damage: '1d6', damageType: 'bludgeoning', properties: [], weight: 4, value: 5, description: 'A heavy flanged club.' },
  rapier: { id: 'rapier', name: 'Rapier', type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.COMMON, damage: '1d8', damageType: 'piercing', properties: ['finesse'], weight: 2, value: 25, description: 'An elegant blade for the skilled duelist.' },
  flail: { id: 'flail', name: 'Flail', type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.COMMON, damage: '1d8', damageType: 'bludgeoning', properties: [], weight: 2, value: 10, description: 'A spiked ball on a chain.' },
  greatsword: { id: 'greatsword', name: 'Greatsword', type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.COMMON, damage: '2d6', damageType: 'slashing', properties: ['heavy', 'two-handed'], weight: 6, value: 50, description: 'A massive two-handed blade.' },
  hand_crossbow: { id: 'hand_crossbow', name: 'Hand Crossbow', type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.COMMON, damage: '1d6', damageType: 'piercing', properties: ['ammunition (30/120)', 'light'], weight: 3, value: 75, description: 'A compact crossbow, easily concealed.' },
  plus1_sword: { id: 'plus1_sword', name: '+1 Longsword', type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.UNCOMMON, damage: '1d8+1', damageType: 'slashing', properties: ['versatile (1d10+1)', 'magical'], weight: 3, value: 500, description: 'A magically enhanced longsword.', magical: true },
  flame_tongue_dagger: { id: 'flame_tongue_dagger', name: 'Flame Tongue Dagger', type: ITEM_TYPES.WEAPON, rarity: ITEM_RARITY.RARE, damage: '1d4+2d6', damageType: 'piercing + fire', properties: ['light', 'finesse', 'magical'], weight: 1, value: 2500, description: 'A dagger wreathed in magical flames.', magical: true },

  // Extra armor
  padded: { id: 'padded', name: 'Padded Armor', type: ITEM_TYPES.ARMOR, rarity: ITEM_RARITY.COMMON, ac: 11, acBonus: 'DEX', weight: 8, value: 5, description: 'Quilted layers of cloth.' },
  hide: { id: 'hide', name: 'Hide Armor', type: ITEM_TYPES.ARMOR, rarity: ITEM_RARITY.COMMON, ac: 12, acBonus: 'DEX_MAX2', weight: 12, value: 10, description: 'Crude armor from thick hides.' },
  scale_mail: { id: 'scale_mail', name: 'Scale Mail', type: ITEM_TYPES.ARMOR, rarity: ITEM_RARITY.COMMON, ac: 14, acBonus: 'DEX_MAX2', weight: 45, value: 50, description: 'Overlapping metal scales on leather.' },
  breastplate: { id: 'breastplate', name: 'Breastplate', type: ITEM_TYPES.ARMOR, rarity: ITEM_RARITY.UNCOMMON, ac: 14, acBonus: 'DEX_MAX2', weight: 20, value: 400, description: 'A fitted metal chest piece.' },
  shield_basic: { id: 'shield_basic', name: 'Shield', type: ITEM_TYPES.SHIELD, rarity: ITEM_RARITY.COMMON, acBonus: 2, weight: 6, value: 10, description: 'A wooden or metal shield. +2 AC.' },

  // Extra potions
  superior_healing: { id: 'superior_healing', name: 'Potion of Superior Healing', type: ITEM_TYPES.POTION, rarity: ITEM_RARITY.RARE, effect: 'heal', power: '8d4+8', weight: 0.5, value: 500, description: 'Surges with healing energy.', consumable: true },
  potion_of_speed: { id: 'potion_of_speed', name: 'Potion of Speed', type: ITEM_TYPES.POTION, rarity: ITEM_RARITY.RARE, effect: 'haste', power: 1, weight: 0.5, value: 400, description: 'Grants Haste for 1 minute.', consumable: true },
  potion_of_invisibility: { id: 'potion_of_invisibility', name: 'Potion of Invisibility', type: ITEM_TYPES.POTION, rarity: ITEM_RARITY.RARE, effect: 'invisibility', power: 1, weight: 0.5, value: 180, description: 'Invisible for 1 hour.', consumable: true },
  antitoxin: { id: 'antitoxin', name: 'Antitoxin', type: ITEM_TYPES.POTION, rarity: ITEM_RARITY.COMMON, effect: 'cure_poison', power: 1, weight: 0.5, value: 50, description: 'Advantage on poison saves for 1 hour.', consumable: true },

  // Scrolls
  scroll_fireball: { id: 'scroll_fireball', name: 'Scroll of Fireball', type: ITEM_TYPES.SCROLL, rarity: ITEM_RARITY.UNCOMMON, spellId: 'fireball', weight: 0, value: 300, description: 'Cast Fireball once.', consumable: true },
  scroll_healing: { id: 'scroll_healing', name: 'Scroll of Cure Wounds', type: ITEM_TYPES.SCROLL, rarity: ITEM_RARITY.COMMON, spellId: 'cure_wounds', weight: 0, value: 60, description: 'Cast Cure Wounds once.', consumable: true },
  scroll_identify: { id: 'scroll_identify', name: 'Scroll of Identify', type: ITEM_TYPES.SCROLL, rarity: ITEM_RARITY.COMMON, spellId: 'identify', weight: 0, value: 60, description: 'Identify a magic item instantly.', consumable: true },
  scroll_misty_step: { id: 'scroll_misty_step', name: 'Scroll of Misty Step', type: ITEM_TYPES.SCROLL, rarity: ITEM_RARITY.UNCOMMON, spellId: 'misty_step', weight: 0, value: 150, description: 'Cast Misty Step once.', consumable: true },

  // Accessories
  cloak_of_protection: { id: 'cloak_of_protection', name: 'Cloak of Protection', type: ITEM_TYPES.ACCESSORY, rarity: ITEM_RARITY.UNCOMMON, acBonus: 1, saveBonus: 1, weight: 1, value: 750, description: '+1 AC and saves. Attunement.', magical: true },
  ring_of_protection: { id: 'ring_of_protection', name: 'Ring of Protection', type: ITEM_TYPES.ACCESSORY, rarity: ITEM_RARITY.RARE, acBonus: 1, saveBonus: 1, weight: 0, value: 3500, description: '+1 AC and saves. Attunement.', magical: true },
  amulet_of_health: { id: 'amulet_of_health', name: 'Amulet of Health', type: ITEM_TYPES.ACCESSORY, rarity: ITEM_RARITY.RARE, effect: 'set_con_19', weight: 0, value: 8000, description: 'Sets CON to 19. Attunement.', magical: true },

  // Extra misc
  tinderbox: { id: 'tinderbox', name: 'Tinderbox', type: ITEM_TYPES.MISC, rarity: ITEM_RARITY.COMMON, weight: 1, value: 5, description: 'Light torches and campfires.' },
  bedroll: { id: 'bedroll', name: 'Bedroll', type: ITEM_TYPES.MISC, rarity: ITEM_RARITY.COMMON, weight: 7, value: 1, description: 'For sleeping outdoors.' },
  rations: { id: 'rations', name: 'Rations (1 day)', type: ITEM_TYPES.MISC, rarity: ITEM_RARITY.COMMON, weight: 2, value: 5, description: 'Dried food for travel.', stackable: true },
  arrows: { id: 'arrows', name: 'Arrows (20)', type: ITEM_TYPES.MISC, rarity: ITEM_RARITY.COMMON, weight: 1, value: 1, description: 'A quiver of 20 arrows.', stackable: true },
  thieves_tools: { id: 'thieves_tools', name: "Thieves' Tools", type: ITEM_TYPES.MISC, rarity: ITEM_RARITY.COMMON, weight: 1, value: 25, description: 'Pick locks and disarm traps.' },
  healers_kit: { id: 'healers_kit', name: "Healer's Kit", type: ITEM_TYPES.MISC, rarity: ITEM_RARITY.COMMON, weight: 3, value: 5, description: 'Stabilize dying creatures (10 uses).', stackable: true }
};

// ─────────────────────────────────────────────────────────────────────────────
//  MERCHANT STOCK TABLES
// ─────────────────────────────────────────────────────────────────────────────

export const MERCHANT_STOCK = {
  [MERCHANT_TYPES.GENERAL]:    ['healing', 'greater_healing', 'antitoxin', 'rope', 'torch', 'tinderbox', 'bedroll', 'rations', 'arrows', 'healers_kit', 'dagger', 'staff'],
  [MERCHANT_TYPES.BLACKSMITH]: ['dagger', 'shortsword', 'longsword', 'greatsword', 'greataxe', 'handaxe', 'mace', 'rapier', 'flail', 'hand_crossbow', 'bow', 'shield_basic', 'leather', 'padded', 'hide', 'scale_mail', 'chainmail', 'breastplate', 'plus1_sword'],
  [MERCHANT_TYPES.ALCHEMIST]:  ['healing', 'greater_healing', 'superior_healing', 'mana', 'antitoxin', 'potion_of_speed', 'potion_of_invisibility', 'scroll_healing', 'scroll_identify'],
  [MERCHANT_TYPES.MAGIC]:      ['scroll_fireball', 'scroll_misty_step', 'scroll_healing', 'scroll_identify', 'mana', 'potion_of_speed', 'potion_of_invisibility', 'plus1_sword', 'flame_tongue_dagger', 'cloak_of_protection', 'ring_of_protection', 'amulet_of_health'],
  [MERCHANT_TYPES.FENCE]:      ['dagger', 'shortsword', 'leather', 'healing', 'rope', 'thieves_tools', 'torch', 'arrows', 'rations']
};

// ─────────────────────────────────────────────────────────────────────────────
//  NARRATION DETECTION
// ─────────────────────────────────────────────────────────────────────────────

export function detectMerchantInNarration(narration) {
  if (!narration) return null;
  const lower = narration.toLowerCase();

  const commerceKeywords = ['shop', 'store', 'merchant', 'vendor', 'trader', 'market', 'bazaar', 'sells', 'for sale', 'available for purchase', 'buy', 'wares', 'inn', 'tavern keeper', 'blacksmith', 'alchemist', 'weapons shop', 'armory', 'general store', 'emporium'];
  if (!commerceKeywords.some(kw => lower.includes(kw))) return null;

  let merchantType = MERCHANT_TYPES.GENERAL;
  let merchantName = 'Local Merchant';

  if (lower.includes('blacksmith') || lower.includes('armory') || (lower.includes('weapon') && lower.includes('shop'))) {
    merchantType = MERCHANT_TYPES.BLACKSMITH; merchantName = 'Blacksmith';
  } else if (lower.includes('alchemist') || (lower.includes('potion') && lower.includes('shop'))) {
    merchantType = MERCHANT_TYPES.ALCHEMIST; merchantName = "Alchemist's Shop";
  } else if (lower.includes('magic') || lower.includes('arcane') || lower.includes('emporium')) {
    merchantType = MERCHANT_TYPES.MAGIC; merchantName = 'Arcane Emporium';
  } else if (lower.includes('fence') || lower.includes('shady') || lower.includes('black market')) {
    merchantType = MERCHANT_TYPES.FENCE; merchantName = 'Shady Dealer';
  } else if (lower.includes('general store') || lower.includes('supply')) {
    merchantType = MERCHANT_TYPES.GENERAL; merchantName = 'General Store';
  }

  console.log(`[MerchantDetect] ${merchantType}: "${merchantName}"`);
  return createMerchant(merchantType, merchantName);
}

// ─────────────────────────────────────────────────────────────────────────────
//  MERCHANT CREATION
// ─────────────────────────────────────────────────────────────────────────────

export function createMerchant(type = MERCHANT_TYPES.GENERAL, name = null) {
  const def = MERCHANT_DEFINITIONS[type];
  const stockKeys = MERCHANT_STOCK[type] || MERCHANT_STOCK[MERCHANT_TYPES.GENERAL];
  const stock = stockKeys.map(key => SHOP_ITEMS[key]).filter(Boolean).map(item => ({ ...item, quantity: getInitialStock(item) }));
  return { id: `merchant_${Date.now()}`, type, name: name || def.name, icon: def.icon, description: def.description, buyMultiplier: def.buyMultiplier, sellMultiplier: def.sellMultiplier, stock };
}

function getInitialStock(item) {
  if (item.rarity === ITEM_RARITY.LEGENDARY || item.rarity === ITEM_RARITY.EPIC || item.rarity === ITEM_RARITY.RARE) return 1;
  if (item.consumable || item.stackable) return Math.floor(Math.random() * 5) + 3;
  return Math.floor(Math.random() * 2) + 1;
}

// ─────────────────────────────────────────────────────────────────────────────
//  GOLD HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getGold(character) {
  const goldItem = (character.inventory || []).find(i => i.id === 'gold');
  return goldItem ? (goldItem.quantity || 0) : 0;
}

export function adjustGold(character, amount) {
  const current = getGold(character);
  const newAmount = current + amount;
  if (newAmount < 0) return { success: false, character, newAmount: current, message: 'Not enough gold!' };

  const inventory = character.inventory || [];
  const goldIndex = inventory.findIndex(i => i.id === 'gold');
  let newInventory;

  if (goldIndex !== -1) {
    newInventory = inventory.map((item, i) => i === goldIndex ? { ...item, quantity: newAmount } : item);
  } else if (amount > 0) {
    newInventory = [...inventory, { id: 'gold', name: 'Gold Coins', type: ITEM_TYPES.MISC, rarity: ITEM_RARITY.COMMON, weight: 0, value: 1, description: 'Shiny gold coins.', stackable: true, instanceId: `gold_${Date.now()}`, quantity: newAmount, equipped: false }];
  } else {
    return { success: false, character, newAmount: 0, message: 'Not enough gold!' };
  }

  return { success: true, character: { ...character, inventory: newInventory }, newAmount, message: amount > 0 ? `+${amount} gold` : `${amount} gold` };
}

// ─────────────────────────────────────────────────────────────────────────────
//  BUY / SELL
// ─────────────────────────────────────────────────────────────────────────────

export function getBuyPrice(item, merchant) {
  return Math.ceil(item.value * merchant.buyMultiplier);
}

export function getSellPrice(item, merchant) {
  return Math.max(1, Math.floor(item.value * merchant.sellMultiplier));
}

export function buyItem(character, merchant, shopItem, quantity = 1) {
  const price = getBuyPrice(shopItem, merchant) * quantity;
  const currentGold = getGold(character);
  if (currentGold < price) return { success: false, character, merchant, message: `Not enough gold! Need ${price} gp, have ${currentGold} gp.` };

  const stockEntry = merchant.stock.find(s => s.id === shopItem.id);
  if (!stockEntry || stockEntry.quantity < quantity) return { success: false, character, merchant, message: 'Not enough stock!' };

  const goldResult = adjustGold(character, -price);
  if (!goldResult.success) return { success: false, character, merchant, message: goldResult.message };

  // Create item instance — falls back to direct instantiation for shop-only items not in ALL_ITEMS
  let newItem = createItem(shopItem.id, quantity);
  if (!newItem) {
    newItem = {
      ...shopItem,
      instanceId: `${shopItem.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      quantity: shopItem.stackable ? quantity : 1,
      equipped: false
    };
  }
  const newInventory = addItemToInventory(goldResult.character.inventory, newItem);
  const updatedCharacter = { ...goldResult.character, inventory: newInventory };
  const updatedStock = merchant.stock.map(s => s.id === shopItem.id ? { ...s, quantity: s.quantity - quantity } : s).filter(s => s.quantity > 0);
  const updatedMerchant = { ...merchant, stock: updatedStock };

  console.log(`[Shop] ${character.name} bought ${quantity}x ${shopItem.name} for ${price} gp`);
  return { success: true, character: updatedCharacter, merchant: updatedMerchant, message: `Bought ${quantity}x ${shopItem.name} for ${price} gp!` };
}

export function sellItem(character, merchant, inventoryItem, quantity = 1) {
  if (inventoryItem.id === 'gold') return { success: false, character, merchant, message: "You can't sell gold coins." };
  if (inventoryItem.type === ITEM_TYPES.QUEST) return { success: false, character, merchant, message: 'Quest items cannot be sold.' };

  const price = getSellPrice(inventoryItem, merchant) * quantity;
  const newInventory = removeItemFromInventory(character.inventory || [], inventoryItem.instanceId, quantity);
  const goldResult = adjustGold({ ...character, inventory: newInventory }, price);

  console.log(`[Shop] ${character.name} sold ${quantity}x ${inventoryItem.name} for ${price} gp`);
  return { success: true, character: goldResult.character, merchant, message: `Sold ${quantity}x ${inventoryItem.name} for ${price} gp!` };
}

export function formatGold(amount) {
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k gp`;
  return `${amount} gp`;
}

export const RARITY_ORDER = {
  [ITEM_RARITY.COMMON.name]: 0,
  [ITEM_RARITY.UNCOMMON.name]: 1,
  [ITEM_RARITY.RARE.name]: 2,
  [ITEM_RARITY.EPIC.name]: 3,
  [ITEM_RARITY.LEGENDARY.name]: 4
};