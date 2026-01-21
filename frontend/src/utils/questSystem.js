// frontend/src/utils/questSystem.js

/**
 * Quest Tracker System
 * Detects, tracks, and manages quests
 */

// Quest status types
export const QUEST_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ABANDONED: 'abandoned'
};

// Quest types
export const QUEST_TYPES = {
  MAIN: 'main',        // Main story quests
  SIDE: 'side',        // Side quests
  PERSONAL: 'personal', // Character-specific
  FACTION: 'faction',   // Faction-related
  BOUNTY: 'bounty'     // Bounties/contracts
};

/**
 * Create a new quest
 */
export function createQuest({
  title,
  description,
  giver = 'Unknown',
  type = QUEST_TYPES.SIDE,
  objectives = [],
  rewards = {},
  level = 1
}) {
  return {
    id: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    giver,
    type,
    objectives: objectives.map((obj, index) => ({
      id: `obj_${index}`,
      description: obj,
      completed: false,
      progress: 0,
      required: 1
    })),
    rewards: {
      xp: rewards.xp || 100,
      gold: rewards.gold || 0,
      items: rewards.items || [],
      ...rewards
    },
    status: QUEST_STATUS.ACTIVE,
    level,
    startedAt: new Date().toISOString(),
    completedAt: null,
    notes: []
  };
}

/**
 * Detect quest keywords in narration
 */
const QUEST_TRIGGERS = {
  start: [
    'i need you to', 'i have a task', 'can you help', 'will you',
    'quest for you', 'job for you', 'mission', 'seek out',
    'retrieve', 'find', 'deliver', 'investigate', 'defeat',
    'protect', 'escort', 'gather', 'collect'
  ],
  complete: [
    'quest complete', 'well done', 'you succeeded', 'task accomplished',
    'mission accomplished', 'you\'ve done it', 'excellent work',
    'you have completed', 'objective achieved'
  ],
  update: [
    'you found', 'you collected', 'you defeated', 'progress',
    'objective updated', 'one down', 'that\'s one'
  ],
  fail: [
    'quest failed', 'you failed', 'too late', 'mission failed',
    'lost forever', 'can no longer'
  ]
};

/**
 * Detect quest events in DM narration
 */
export function detectQuestEvents(narration) {
  const lowerText = narration.toLowerCase();
  const events = [];

  // Check for quest start
  if (QUEST_TRIGGERS.start.some(trigger => lowerText.includes(trigger))) {
    const questData = extractQuestFromNarration(narration);
    if (questData) {
      events.push({
        type: 'quest_started',
        quest: questData
      });
    }
  }

  // Check for quest completion
  if (QUEST_TRIGGERS.complete.some(trigger => lowerText.includes(trigger))) {
    events.push({
      type: 'quest_completed',
      keywords: QUEST_TRIGGERS.complete.filter(t => lowerText.includes(t))
    });
  }

  // Check for quest updates
  if (QUEST_TRIGGERS.update.some(trigger => lowerText.includes(trigger))) {
    events.push({
      type: 'quest_updated',
      keywords: QUEST_TRIGGERS.update.filter(t => lowerText.includes(t))
    });
  }

  // Check for quest failure
  if (QUEST_TRIGGERS.fail.some(trigger => lowerText.includes(trigger))) {
    events.push({
      type: 'quest_failed',
      keywords: QUEST_TRIGGERS.fail.filter(t => lowerText.includes(t))
    });
  }

  return events;
}

/**
 * Extract quest details from narration (basic implementation)
 */
function extractQuestFromNarration(narration) {
  // Look for quest-like sentences
  const sentences = narration.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    
    // Try to find quest title and objective
    if (QUEST_TRIGGERS.start.some(trigger => lower.includes(trigger))) {
      // Extract what comes after the trigger
      let title = 'New Quest';
      let description = sentence;
      let objectives = [];
      
      // Try to extract objectives
      if (lower.includes('find')) {
        const match = sentence.match(/find\s+(?:the\s+)?([^,.!?]+)/i);
        if (match) {
          title = `Find ${match[1]}`;
          objectives.push(`Find ${match[1]}`);
        }
      } else if (lower.includes('defeat') || lower.includes('kill')) {
        const match = sentence.match(/(?:defeat|kill)\s+(?:the\s+)?([^,.!?]+)/i);
        if (match) {
          title = `Defeat ${match[1]}`;
          objectives.push(`Defeat ${match[1]}`);
        }
      } else if (lower.includes('retrieve') || lower.includes('collect')) {
        const match = sentence.match(/(?:retrieve|collect)\s+(?:the\s+)?([^,.!?]+)/i);
        if (match) {
          title = `Retrieve ${match[1]}`;
          objectives.push(`Retrieve ${match[1]}`);
        }
      } else if (lower.includes('deliver')) {
        const match = sentence.match(/deliver\s+(?:the\s+)?([^,.!?]+)/i);
        if (match) {
          title = `Deliver ${match[1]}`;
          objectives.push(`Deliver ${match[1]}`);
        }
      }
      
      if (objectives.length > 0) {
        return {
          title,
          description,
          objectives,
          type: QUEST_TYPES.SIDE,
          giver: 'Quest Giver',
          rewards: { xp: 150, gold: 50 }
        };
      }
    }
  }
  
  return null;
}

/**
 * Update quest objective
 */
export function updateQuestObjective(quest, objectiveId, progress = 1) {
  const objectives = quest.objectives.map(obj => {
    if (obj.id === objectiveId) {
      const newProgress = Math.min(obj.required, obj.progress + progress);
      return {
        ...obj,
        progress: newProgress,
        completed: newProgress >= obj.required
      };
    }
    return obj;
  });

  // Check if all objectives completed
  const allCompleted = objectives.every(obj => obj.completed);
  
  return {
    ...quest,
    objectives,
    status: allCompleted ? QUEST_STATUS.COMPLETED : quest.status,
    completedAt: allCompleted ? new Date().toISOString() : null
  };
}

/**
 * Complete a quest
 */
export function completeQuest(quest) {
  return {
    ...quest,
    status: QUEST_STATUS.COMPLETED,
    completedAt: new Date().toISOString(),
    objectives: quest.objectives.map(obj => ({
      ...obj,
      completed: true,
      progress: obj.required
    }))
  };
}

/**
 * Fail a quest
 */
export function failQuest(quest, reason = '') {
  return {
    ...quest,
    status: QUEST_STATUS.FAILED,
    completedAt: new Date().toISOString(),
    notes: [...quest.notes, `Failed: ${reason}`]
  };
}

/**
 * Add note to quest
 */
export function addQuestNote(quest, note) {
  return {
    ...quest,
    notes: [...quest.notes, {
      text: note,
      timestamp: new Date().toISOString()
    }]
  };
}

/**
 * Get active quests
 */
export function getActiveQuests(quests) {
  return quests.filter(q => q.status === QUEST_STATUS.ACTIVE);
}

/**
 * Get completed quests
 */
export function getCompletedQuests(quests) {
  return quests.filter(q => q.status === QUEST_STATUS.COMPLETED);
}

/**
 * Find quest by title (fuzzy match)
 */
export function findQuestByTitle(quests, title) {
  const lowerTitle = title.toLowerCase();
  return quests.find(q => 
    q.title.toLowerCase().includes(lowerTitle) ||
    lowerTitle.includes(q.title.toLowerCase())
  );
}