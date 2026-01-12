// frontend/src/utils/xpSystem.js

/**
 * XP Award and Level-Up System
 * Integrates with DM responses to award XP and handle leveling
 */

import { addExperience, levelUp } from './characterSystem';

// XP rewards for different encounter types
export const XP_REWARDS = {
  // Combat encounters
  trivial_combat: 25,
  easy_combat: 50,
  medium_combat: 100,
  hard_combat: 200,
  deadly_combat: 400,
  boss_fight: 1000,
  
  // Non-combat achievements
  puzzle_solved: 50,
  social_encounter: 75,
  quest_completed: 150,
  major_milestone: 500,
  discovery: 100,
  
  // Story progression
  chapter_complete: 300,
  save_npc: 100,
  defeat_villain: 500,
};

// Keywords to detect XP-worthy events in narration
export const XP_TRIGGERS = {
  combat: ['defeated', 'slain', 'killed', 'vanquished', 'destroyed', 'battle won', 'victory', 'triumph', 'fell', 'dies', 'dead', 'overcome', 'bested'],
  puzzle: ['solved', 'unlocked', 'discovered the solution', 'figured out', 'cracked', 'deciphered'],
  quest: ['quest complete', 'mission accomplished', 'task finished', 'objective achieved', 'succeeded', 'completed'],
  social: ['persuaded', 'convinced', 'negotiated', 'intimidated', 'charmed', 'befriended'],
  discovery: ['found', 'discovered', 'uncovered', 'revealed', 'located', 'stumbled upon'],
  milestone: ['reached', 'arrived at', 'entered the', 'escaped', 'survived'],
};

/**
 * Analyze DM narration to detect XP-worthy events
 */
export function detectXPEvents(narration) {
  const lowerNarration = narration.toLowerCase();
  const events = [];
  
  console.log("🔍 Analyzing for XP:", lowerNarration.substring(0, 100) + "...");
  
  // Check for combat victories
  if (XP_TRIGGERS.combat.some(trigger => lowerNarration.includes(trigger))) {
    console.log("⚔️ Combat victory detected!");
    
    // Determine difficulty based on context
    if (lowerNarration.includes('boss') || lowerNarration.includes('dragon') || 
        lowerNarration.includes('ancient') || lowerNarration.includes('lord') ||
        lowerNarration.includes('king') || lowerNarration.includes('queen')) {
      events.push({ type: 'boss_fight', xp: XP_REWARDS.boss_fight, reason: 'Defeated a powerful boss' });
      console.log("🐉 BOSS FIGHT XP!");
    } else if (lowerNarration.includes('fierce') || lowerNarration.includes('deadly') || 
               lowerNarration.includes('overwhelming') || lowerNarration.includes('horde')) {
      events.push({ type: 'deadly_combat', xp: XP_REWARDS.deadly_combat, reason: 'Won a deadly battle' });
    } else if (lowerNarration.includes('difficult') || lowerNarration.includes('challenging') ||
               lowerNarration.includes('tough')) {
      events.push({ type: 'hard_combat', xp: XP_REWARDS.hard_combat, reason: 'Overcame a hard combat' });
    } else {
      events.push({ type: 'medium_combat', xp: XP_REWARDS.medium_combat, reason: 'Won the battle' });
    }
  }
  
  // Check for quests
  if (XP_TRIGGERS.quest.some(trigger => lowerNarration.includes(trigger))) {
    console.log("📜 Quest completion detected!");
    events.push({ type: 'quest_completed', xp: XP_REWARDS.quest_completed, reason: 'Completed a quest' });
  }
  
  // Check for puzzles
  if (XP_TRIGGERS.puzzle.some(trigger => lowerNarration.includes(trigger))) {
    console.log("🧩 Puzzle solved!");
    events.push({ type: 'puzzle_solved', xp: XP_REWARDS.puzzle_solved, reason: 'Solved a puzzle' });
  }
  
  // Check for social encounters
  if (XP_TRIGGERS.social.some(trigger => lowerNarration.includes(trigger))) {
    console.log("🗣️ Social encounter success!");
    events.push({ type: 'social_encounter', xp: XP_REWARDS.social_encounter, reason: 'Successful social interaction' });
  }
  
  // Check for discoveries
  if (XP_TRIGGERS.discovery.some(trigger => lowerNarration.includes(trigger))) {
    if (lowerNarration.includes('secret') || lowerNarration.includes('hidden') || 
        lowerNarration.includes('ancient') || lowerNarration.includes('treasure')) {
      console.log("🔍 Important discovery!");
      events.push({ type: 'discovery', xp: XP_REWARDS.discovery, reason: 'Made an important discovery' });
    }
  }
  
  console.log(`✨ Total XP events found: ${events.length}`);
  
  return events;
}

/**
 * Award XP to entire party
 */
export function awardXPToParty(party, xpAmount, reason = 'Adventure progress') {
  const results = {
    partyUpdates: [],
    levelUps: [],
    totalXP: xpAmount
  };
  
  party.forEach(character => {
    const updatedChar = addExperience(character, xpAmount);
    
    results.partyUpdates.push(updatedChar);
    
    // Check if they leveled up
    if (updatedChar.levelsGained && updatedChar.levelsGained > 0) {
      results.levelUps.push({
        name: character.name,
        oldLevel: character.level,
        newLevel: updatedChar.level,
        levelsGained: updatedChar.levelsGained
      });
    }
  });
  
  return results;
}

/**
 * Process XP from DM response
 */
export function processXPFromNarration(narration, party) {
  const xpEvents = detectXPEvents(narration);
  
  if (xpEvents.length === 0) {
    return null;
  }
  
  // Sum all XP from detected events
  const totalXP = xpEvents.reduce((sum, event) => sum + event.xp, 0);
  const reasons = xpEvents.map(e => e.reason).join(', ');
  
  // Award to party
  const results = awardXPToParty(party, totalXP, reasons);
  
  return {
    ...results,
    events: xpEvents,
    message: `+${totalXP} XP: ${reasons}`
  };
}

/**
 * Manual XP award (for DM to call explicitly)
 */
export function manualXPAward(party, xpAmount, reason = 'DM Award') {
  return awardXPToParty(party, xpAmount, reason);
}

/**
 * Calculate party level average
 */
export function getPartyLevel(party) {
  if (party.length === 0) return 1;
  
  const totalLevel = party.reduce((sum, char) => sum + char.level, 0);
  return Math.round(totalLevel / party.length);
}

/**
 * Suggest XP rewards based on party level
 */
export function suggestXPReward(partyLevel, encounterType = 'medium_combat') {
  const baseXP = XP_REWARDS[encounterType] || 100;
  
  // Scale with party level
  const scaledXP = Math.round(baseXP * (1 + (partyLevel - 1) * 0.1));
  
  return scaledXP;
}