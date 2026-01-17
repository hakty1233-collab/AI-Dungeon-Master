// frontend/src/utils/inventorySystem.js

/**
 * D&D 5e Inventory System
 * Items, equipment, potions, loot detection
 */

// Item types
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

// Item rarity
export const ITEM_RARITY = {
  COMMON: { name: 'Common', color: '#888' },
  UNCOMMON: { name: 'Uncommon', color: '#4CAF50' },
  RARE: { name: 'Rare', color: '#2196F3' },
  EPIC: { name: 'Epic', color: '#9C27B0' },
  LEGENDARY: { name: 'Legendary', color: '#ffd700' }
};

// Weapon templates
export const WEAPON_TEMPLATES = {
  shortsword: {
    id: 'shortsword',
    name: 'Shortsword',
    type: ITEM_TYPES.WEAPON,
    rarity: ITEM_RARITY.COMMON,
    damage: '1d6',
    damageType: 'piercing',
    properties: ['light', 'finesse'],
    weight: 2,
    value: 10,
    description: 'A simple but effective blade.'
  },
  longsword: {
    id: 'longsword',
    name: 'Longsword',
    type: ITEM_TYPES.WEAPON,
    rarity: ITEM_RARITY.COMMON,
    damage: '1d8',
    damageType: 'slashing',
    properties: ['versatile (1d10)'],
    weight: 3,
    value: 15,
    description: 'A versatile weapon favored by knights.'
  },
  greataxe: {
    id: 'greataxe',
    name: 'Greataxe',
    type: ITEM_TYPES.WEAPON,
    rarity: ITEM_RARITY.COMMON,
    damage: '1d12',
    damageType: 'slashing',
    properties: ['heavy', 'two-handed'],
    weight: 7,
    value: 30,
    description: 'A massive axe that cleaves through foes.'
  },
  dagger: {
    id: 'dagger',
    name: 'Dagger',
    type: ITEM_TYPES.WEAPON,
    rarity: ITEM_RARITY.COMMON,
    damage: '1d4',
    damageType: 'piercing',
    properties: ['light', 'finesse', 'thrown (20/60)'],
    weight: 1,
    value: 2,
    description: 'A small blade useful in close quarters.'
  },
  staff: {
    id: 'staff',
    name: 'Quarterstaff',
    type: ITEM_TYPES.WEAPON,
    rarity: ITEM_RARITY.COMMON,
    damage: '1d6',
    damageType: 'bludgeoning',
    properties: ['versatile (1d8)'],
    weight: 4,
    value: 2,
    description: 'A simple wooden staff.'
  },
  bow: {
    id: 'bow',
    name: 'Longbow',
    type: ITEM_TYPES.WEAPON,
    rarity: ITEM_RARITY.COMMON,
    damage: '1d8',
    damageType: 'piercing',
    properties: ['ammunition (80/320)', 'heavy', 'two-handed'],
    weight: 2,
    value: 50,
    description: 'A powerful ranged weapon.'
  }
};

// Armor templates
export const ARMOR_TEMPLATES = {
  leather: {
    id: 'leather',
    name: 'Leather Armor',
    type: ITEM_TYPES.ARMOR,
    rarity: ITEM_RARITY.COMMON,
    ac: 11,
    acBonus: 'DEX',
    weight: 10,
    value: 10,
    description: 'Light and flexible protection.'
  },
  chainmail: {
    id: 'chainmail',
    name: 'Chainmail',
    type: ITEM_TYPES.ARMOR,
    rarity: ITEM_RARITY.COMMON,
    ac: 16,
    acBonus: null,
    weight: 55,
    value: 75,
    description: 'Heavy metal armor that clinks with each step.'
  },
  plate: {
    id: 'plate',
    name: 'Plate Armor',
    type: ITEM_TYPES.ARMOR,
    rarity: ITEM_RARITY.UNCOMMON,
    ac: 18,
    acBonus: null,
    weight: 65,
    value: 1500,
    description: 'The finest protection money can buy.'
  }
};

// Potion templates
export const POTION_TEMPLATES = {
  healing: {
    id: 'healing',
    name: 'Potion of Healing',
    type: ITEM_TYPES.POTION,
    rarity: ITEM_RARITY.COMMON,
    effect: 'heal',
    power: '2d4+2',
    weight: 0.5,
    value: 50,
    description: 'A red liquid that restores vitality.',
    consumable: true
  },
  greater_healing: {
    id: 'greater_healing',
    name: 'Potion of Greater Healing',
    type: ITEM_TYPES.POTION,
    rarity: ITEM_RARITY.UNCOMMON,
    effect: 'heal',
    power: '4d4+4',
    weight: 0.5,
    value: 150,
    description: 'A vibrant red potion of exceptional quality.',
    consumable: true
  },
  mana: {
    id: 'mana',
    name: 'Potion of Magic',
    type: ITEM_TYPES.POTION,
    rarity: ITEM_RARITY.UNCOMMON,
    effect: 'restore_spell_slot',
    power: 1,
    weight: 0.5,
    value: 100,
    description: 'A shimmering blue liquid that restores magical energy.',
    consumable: true
  }
};

// Misc item templates
export const MISC_TEMPLATES = {
  gold: {
    id: 'gold',
    name: 'Gold Coins',
    type: ITEM_TYPES.MISC,
    rarity: ITEM_RARITY.COMMON,
    weight: 0,
    value: 1,
    description: 'Shiny gold coins.',
    stackable: true
  },
  rope: {
    id: 'rope',
    name: 'Rope (50 ft)',
    type: ITEM_TYPES.MISC,
    rarity: ITEM_RARITY.COMMON,
    weight: 10,
    value: 1,
    description: 'Hempen rope, useful for climbing.'
  },
  torch: {
    id: 'torch',
    name: 'Torch',
    type: ITEM_TYPES.MISC,
    rarity: ITEM_RARITY.COMMON,
    weight: 1,
    value: 1,
    description: 'Provides light in darkness.',
    stackable: true
  }
};

// All item templates combined
export const ALL_ITEMS = {
  ...WEAPON_TEMPLATES,
  ...ARMOR_TEMPLATES,
  ...POTION_TEMPLATES,
  ...MISC_TEMPLATES
};

/**
 * Create an item instance from template
 */
export function createItem(templateId, quantity = 1) {
  const template = ALL_ITEMS[templateId];
  if (!template) {
    console.error('Unknown item template:', templateId);
    return null;
  }

  return {
    ...template,
    instanceId: `${templateId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    quantity: template.stackable ? quantity : 1,
    equipped: false
  };
}

/**
 * Add item to inventory
 */
export function addItemToInventory(inventory, item) {
  if (!item) return inventory;

  // Check if stackable item already exists
  if (item.stackable) {
    const existingIndex = inventory.findIndex(i => i.id === item.id);
    if (existingIndex !== -1) {
      const updated = [...inventory];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + item.quantity
      };
      return updated;
    }
  }

  return [...inventory, item];
}

/**
 * Remove item from inventory
 */
export function removeItemFromInventory(inventory, instanceId, quantity = 1) {
  const itemIndex = inventory.findIndex(i => i.instanceId === instanceId);
  if (itemIndex === -1) return inventory;

  const item = inventory[itemIndex];
  
  if (item.stackable && item.quantity > quantity) {
    const updated = [...inventory];
    updated[itemIndex] = {
      ...item,
      quantity: item.quantity - quantity
    };
    return updated;
  }

  return inventory.filter(i => i.instanceId !== instanceId);
}

/**
 * Use/consume an item
 */
export function useItem(item, character) {
  if (item.type === ITEM_TYPES.POTION && item.effect === 'heal') {
    // Roll healing dice
    const diceMatch = item.power.match(/(\d+)d(\d+)\+(\d+)/);
    if (diceMatch) {
      const [, numDice, dieSize, bonus] = diceMatch;
      let healing = parseInt(bonus);
      for (let i = 0; i < parseInt(numDice); i++) {
        healing += Math.floor(Math.random() * parseInt(dieSize)) + 1;
      }
      
      const newHp = Math.min(character.maxHp, character.hp + healing);
      return {
        success: true,
        message: `${character.name} heals for ${healing} HP!`,
        healing,
        newHp
      };
    }
  }

  return {
    success: false,
    message: 'Cannot use this item.'
  };
}

/**
 * Equip an item
 */
export function equipItem(character, item) {
  if (item.type === ITEM_TYPES.WEAPON) {
    return {
      ...character,
      equippedItems: {
        ...character.equippedItems,
        weapon: item
      }
    };
  }

  if (item.type === ITEM_TYPES.ARMOR) {
    return {
      ...character,
      equippedItems: {
        ...character.equippedItems,
        armor: item
      },
      armorClass: item.ac + (item.acBonus === 'DEX' ? Math.floor((character.abilities.DEX - 10) / 2) : 0)
    };
  }

  if (item.type === ITEM_TYPES.SHIELD) {
    return {
      ...character,
      equippedItems: {
        ...character.equippedItems,
        shield: item
      },
      armorClass: character.armorClass + 2
    };
  }

  return character;
}

/**
 * Unequip an item
 */
export function unequipItem(character, slot) {
  const newEquipped = { ...character.equippedItems };
  const item = newEquipped[slot];
  newEquipped[slot] = null;

  let newAC = character.armorClass;
  if (slot === 'shield' && item) {
    newAC -= 2;
  }

  return {
    ...character,
    equippedItems: newEquipped,
    armorClass: newAC
  };
}

/**
 * Calculate total inventory weight
 */
export function getTotalWeight(inventory) {
  return inventory.reduce((total, item) => {
    return total + (item.weight * item.quantity);
  }, 0);
}

/**
 * Get carrying capacity based on STR
 */
export function getCarryingCapacity(character) {
  return character.abilities.STR * 15; // D&D 5e rule
}

/**
 * Check if over encumbered
 */
export function isEncumbered(character, inventory) {
  const weight = getTotalWeight(inventory);
  const capacity = getCarryingCapacity(character);
  return weight > capacity;
}

/**
 * Detect items in DM narration
 */
export function detectLootInNarration(narration) {
  const lowerText = narration.toLowerCase();
  const foundItems = [];

  // Weapon detection
  const weaponKeywords = {
    sword: ['sword', 'blade', 'longsword', 'shortsword'],
    dagger: ['dagger', 'knife'],
    axe: ['axe', 'greataxe'],
    bow: ['bow', 'longbow'],
    staff: ['staff', 'quarterstaff']
  };

  Object.entries(weaponKeywords).forEach(([weapon, keywords]) => {
    if (keywords.some(kw => lowerText.includes(kw))) {
      foundItems.push(weapon);
    }
  });

  // Potion detection
  if (lowerText.includes('potion') || lowerText.includes('healing')) {
    foundItems.push('healing');
  }

  // Gold detection
  const goldMatch = lowerText.match(/(\d+)\s*gold/);
  if (goldMatch) {
    foundItems.push({ type: 'gold', amount: parseInt(goldMatch[1]) });
  }

  // Armor detection
  if (lowerText.includes('armor') || lowerText.includes('armour')) {
    if (lowerText.includes('leather')) foundItems.push('leather');
    if (lowerText.includes('chain')) foundItems.push('chainmail');
    if (lowerText.includes('plate')) foundItems.push('plate');
  }

  return foundItems.map(item => {
    if (typeof item === 'object') {
      return createItem('gold', item.amount);
    }
    return createItem(item);
  }).filter(Boolean);
}