// frontend/src/utils/xpSystem.js

/**
 * XP Award and Level-Up System
 * Integrates with DM responses to award XP and handle leveling.
 *
 * Key change: when a character levels up, addExperience now returns
 * pendingLevelUp data instead of immediately applying stats.
 * LevelUpModal handles the actual application after player choices.
 */

import { addExperience } from './characterSystem';

// XP rewards for different encounter types
export const XP_REWARDS = {
  trivial_combat:   25,
  easy_combat:      50,
  medium_combat:    100,
  hard_combat:      200,
  deadly_combat:    400,
  boss_fight:       1000,
  puzzle_solved:    50,
  social_encounter: 75,
  quest_completed:  150,
  major_milestone:  500,
  discovery:        100,
  chapter_complete: 300,
  save_npc:         100,
  defeat_villain:   500,
};

// Keywords to detect XP-worthy events in narration
export const XP_TRIGGERS = {
  combat:    ['defeated', 'slain', 'killed', 'vanquished', 'destroyed', 'battle won', 'victory', 'triumph', 'fell', 'dies', 'dead', 'overcome', 'bested'],
  puzzle:    ['solved', 'unlocked', 'discovered the solution', 'figured out', 'cracked', 'deciphered'],
  quest:     ['quest complete', 'mission accomplished', 'task finished', 'objective achieved', 'succeeded', 'completed'],
  social:    ['persuaded', 'convinced', 'negotiated', 'intimidated', 'charmed', 'befriended'],
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

  if (XP_TRIGGERS.combat.some(trigger => lowerNarration.includes(trigger))) {
    console.log("⚔️ Combat victory detected!");
    if (lowerNarration.includes('boss') || lowerNarration.includes('dragon') ||
        lowerNarration.includes('ancient') || lowerNarration.includes('lord') ||
        lowerNarration.includes('king')   || lowerNarration.includes('queen')) {
      events.push({ type: 'boss_fight',      xp: XP_REWARDS.boss_fight,      reason: 'Defeated a powerful boss' });
    } else if (lowerNarration.includes('fierce') || lowerNarration.includes('deadly') ||
               lowerNarration.includes('overwhelming') || lowerNarration.includes('horde')) {
      events.push({ type: 'deadly_combat',   xp: XP_REWARDS.deadly_combat,   reason: 'Won a deadly battle' });
    } else if (lowerNarration.includes('difficult') || lowerNarration.includes('challenging') ||
               lowerNarration.includes('tough')) {
      events.push({ type: 'hard_combat',     xp: XP_REWARDS.hard_combat,     reason: 'Overcame a hard combat' });
    } else {
      events.push({ type: 'medium_combat',   xp: XP_REWARDS.medium_combat,   reason: 'Won the battle' });
    }
  }

  if (XP_TRIGGERS.quest.some(t => lowerNarration.includes(t))) {
    events.push({ type: 'quest_completed',   xp: XP_REWARDS.quest_completed,  reason: 'Completed a quest' });
  }

  if (XP_TRIGGERS.puzzle.some(t => lowerNarration.includes(t))) {
    events.push({ type: 'puzzle_solved',     xp: XP_REWARDS.puzzle_solved,    reason: 'Solved a puzzle' });
  }

  if (XP_TRIGGERS.social.some(t => lowerNarration.includes(t))) {
    events.push({ type: 'social_encounter',  xp: XP_REWARDS.social_encounter, reason: 'Successful social interaction' });
  }

  if (XP_TRIGGERS.discovery.some(t => lowerNarration.includes(t))) {
    if (lowerNarration.includes('secret') || lowerNarration.includes('hidden') ||
        lowerNarration.includes('ancient') || lowerNarration.includes('treasure')) {
      events.push({ type: 'discovery',       xp: XP_REWARDS.discovery,        reason: 'Made an important discovery' });
    }
  }

  console.log(`✨ Total XP events found: ${events.length}`);
  return events;
}

/**
 * Award XP to entire party.
 *
 * Returns:
 *   partyUpdates  — updated character objects (may have pendingLevelUp on them)
 *   levelUps      — array of { name, oldLevel, newLevel, levelsGained, character }
 *                   used by GameScreen to open LevelUpModal for each character
 *   totalXP
 */
export function awardXPToParty(party, xpAmount, reason = 'Adventure progress') {
  const results = {
    partyUpdates: [],
    levelUps:     [],
    totalXP:      xpAmount,
  };

  party.forEach(character => {
    const updatedChar = addExperience(character, xpAmount);
    results.partyUpdates.push(updatedChar);

    if (updatedChar.levelsGained > 0) {
      results.levelUps.push({
        name:         character.name,
        oldLevel:     character.level,
        newLevel:     updatedChar.level,
        levelsGained: updatedChar.levelsGained,
        // Pass the full updated character so LevelUpModal can work with it
        character:    updatedChar,
      });
    }
  });

  return results;
}

/**
 * Process XP from DM narration
 */
export function processXPFromNarration(narration, party) {
  const xpEvents = detectXPEvents(narration);
  if (xpEvents.length === 0) return null;

  const totalXP = xpEvents.reduce((sum, e) => sum + e.xp, 0);
  const reasons = xpEvents.map(e => e.reason).join(', ');
  const results = awardXPToParty(party, totalXP, reasons);

  return {
    ...results,
    events:  xpEvents,
    message: `+${totalXP} XP: ${reasons}`,
  };
}

/**
 * Manual XP award
 */
export function manualXPAward(party, xpAmount, reason = 'DM Award') {
  return awardXPToParty(party, xpAmount, reason);
}

export function getPartyLevel(party) {
  if (!party.length) return 1;
  return Math.round(party.reduce((sum, c) => sum + c.level, 0) / party.length);
}

export function suggestXPReward(partyLevel, encounterType = 'medium_combat') {
  const baseXP = XP_REWARDS[encounterType] || 100;
  return Math.round(baseXP * (1 + (partyLevel - 1) * 0.1));
}