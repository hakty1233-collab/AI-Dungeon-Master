// frontend/src/utils/musicSceneDetection.js

/**
 * Auto Scene Detection for Background Music
 * Analyzes DM narration and suggests appropriate music tracks
 */

const SCENE_PATTERNS = {
  combat: {
    keywords: ['battle', 'fight', 'combat', 'attack', 'weapon', 'sword', 'enemy', 'foe', 'charge', 'strike'],
  },
  tavern: {
    keywords: ['tavern', 'inn', 'alehouse', 'pub', 'bar', 'drink', 'ale', 'beer'],
    track: 'tavern'
  },
  dungeon: {
    keywords: ['dungeon', 'cave', 'crypt', 'tomb', 'underground', 'dark corridor', 'chamber', 'vault'],
    track: 'dungeon_explore'
  },
  forest: {
    keywords: ['forest', 'woods', 'trees', 'grove', 'woodland', 'jungle', 'foliage'],
    track: 'forest_exploration'
  },
  village: {
    keywords: ['village', 'town', 'city', 'settlement', 'marketplace', 'square', 'peaceful', 'street'],
    track: 'peaceful_village'
  },
  victory: {
    keywords: ['victory', 'triumph', 'defeated all', 'won the battle', 'enemies fall', 'victorious'],
    track: 'victory'
  },
  defeat: {
    keywords: ['defeat', 'fallen', 'death', 'party falls', 'overwhelmed', 'last breath'],
    track: 'defeat'
  },
  boss: {
    keywords: ['boss', 'dragon', 'ancient', 'lord', 'king', 'queen', 'master', 'overlord', 'legendary', 'powerful being']
  }
};

function hasKeywords(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}

export function detectScene(narration, inCombat = false) {
  if (!narration) return null;
  
  const lowerText = narration.toLowerCase();
  
  // Victory/defeat
  if (hasKeywords(lowerText, SCENE_PATTERNS.victory.keywords)) {
    return { type: 'victory', track: 'victory', reason: 'Victory celebration' };
  }
  
  if (hasKeywords(lowerText, SCENE_PATTERNS.defeat.keywords)) {
    return { type: 'defeat', track: 'defeat', reason: 'Defeat theme' };
  }
  
  // Combat
  if (inCombat) {
    if (hasKeywords(lowerText, SCENE_PATTERNS.boss.keywords)) {
      return { type: 'boss_combat', track: 'boss_fight', reason: 'Boss battle music' };
    }
    
    if (hasKeywords(lowerText, ['fierce', 'deadly', 'overwhelming', 'powerful', 'dangerous'])) {
      return { type: 'hard_combat', track: 'combat_hard', reason: 'Intense battle music' };
    }
    
    return { type: 'easy_combat', track: 'combat_easy', reason: 'Combat music' };
  }
  
  if (hasKeywords(lowerText, SCENE_PATTERNS.combat.keywords)) {
    if (hasKeywords(lowerText, SCENE_PATTERNS.boss.keywords)) {
      return { type: 'boss_combat', track: 'boss_fight', reason: 'Boss encounter' };
    }
    return { type: 'combat', track: 'combat_easy', reason: 'Battle begins' };
  }
  
  // Locations
  if (hasKeywords(lowerText, SCENE_PATTERNS.tavern.keywords)) {
    return { type: 'tavern', track: 'tavern', reason: 'Tavern ambience' };
  }
  
  if (hasKeywords(lowerText, SCENE_PATTERNS.dungeon.keywords)) {
    return { type: 'dungeon', track: 'dungeon_explore', reason: 'Dark dungeon exploration' };
  }
  
  if (hasKeywords(lowerText, SCENE_PATTERNS.forest.keywords)) {
    return { type: 'forest', track: 'forest_exploration', reason: 'Forest exploration' };
  }
  
  if (hasKeywords(lowerText, SCENE_PATTERNS.village.keywords)) {
    return { type: 'village', track: 'peaceful_village', reason: 'Village exploration' };
  }
  
  return null;
}