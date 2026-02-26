// backend/src/dm/dmEngine.js
import OpenAI from "openai";

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ─────────────────────────────────────────────────────────────────────────────
//  WORLD MEMORY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialise or migrate worldMemory to structured format.
 * Old format: string[]
 * New format: { npcs: [], locations: [], events: [], facts: [], sessionSummary: '' }
 */
function normaliseWorldMemory(worldMemory) {
  if (!worldMemory) {
    return { npcs: [], locations: [], events: [], facts: [], sessionSummary: '' };
  }
  // Already structured
  if (typeof worldMemory === 'object' && !Array.isArray(worldMemory)) {
    return {
      npcs:           worldMemory.npcs           || [],
      locations:      worldMemory.locations       || [],
      events:         worldMemory.events          || [],
      facts:          worldMemory.facts           || [],
      sessionSummary: worldMemory.sessionSummary  || ''
    };
  }
  // Legacy flat array — migrate to facts bucket
  if (Array.isArray(worldMemory)) {
    return {
      npcs: [], locations: [], events: [],
      facts: worldMemory.filter(Boolean).slice(0, 30),
      sessionSummary: ''
    };
  }
  return { npcs: [], locations: [], events: [], facts: [], sessionSummary: '' };
}

/**
 * Merge AI-supplied worldMemoryUpdates into structured memory.
 * Deduplicates by name/content. Caps each bucket to prevent unbounded growth.
 */
function mergeWorldMemory(existing, updates) {
  if (!updates) return existing;

  const mem = { ...existing };

  // NPCs: deduplicate by name
  if (updates.npcs?.length) {
    updates.npcs.forEach(npc => {
      if (!npc?.name) return;
      const idx = mem.npcs.findIndex(n => n.name?.toLowerCase() === npc.name.toLowerCase());
      if (idx !== -1) {
        mem.npcs[idx] = { ...mem.npcs[idx], ...npc }; // Update existing
      } else {
        mem.npcs.push(npc);
      }
    });
    mem.npcs = mem.npcs.slice(-20); // Keep latest 20
  }

  // Locations: deduplicate by name
  if (updates.locations?.length) {
    updates.locations.forEach(loc => {
      if (!loc?.name) return;
      const idx = mem.locations.findIndex(l => l.name?.toLowerCase() === loc.name.toLowerCase());
      if (idx !== -1) {
        mem.locations[idx] = { ...mem.locations[idx], ...loc };
      } else {
        mem.locations.push(loc);
      }
    });
    mem.locations = mem.locations.slice(-15);
  }

  // Events: append-only, keep latest 20
  if (updates.events?.length) {
    updates.events.forEach(ev => {
      if (ev && !mem.events.includes(ev)) mem.events.push(ev);
    });
    mem.events = mem.events.slice(-20);
  }

  // Facts: append-only, deduplicate, keep latest 30
  if (updates.facts?.length) {
    updates.facts.forEach(f => {
      if (f && !mem.facts.includes(f)) mem.facts.push(f);
    });
    mem.facts = mem.facts.slice(-30);
  }

  return mem;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PARTY STATE FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

function formatPartyForPrompt(party) {
  if (!party?.length) return 'No party members.';

  return party.map(p => {
    const lines = [];
    lines.push(`### ${p.name} — Level ${p.level} ${p.race} ${p.class}${p.subclass ? ` (${p.subclass})` : ''}`);
    lines.push(`HP: ${p.hp}/${p.maxHp} | AC: ${p.armorClass || 10} | XP: ${p.xp || 0}`);

    // Ability scores
    if (p.abilities || p.abilityScores) {
      const ab = p.abilities || p.abilityScores;
      const mods = Object.entries(ab).map(([k, v]) => {
        const mod = Math.floor((v - 10) / 2);
        return `${k} ${v}(${mod >= 0 ? '+' : ''}${mod})`;
      }).join(', ');
      lines.push(`Stats: ${mods}`);
    }

    // Equipped items
    const eq = p.equippedItems || {};
    const equipped = [];
    if (eq.weapon) equipped.push(`Weapon: ${eq.weapon.name} (${eq.weapon.damage})`);
    if (eq.armor)  equipped.push(`Armor: ${eq.armor.name} (AC ${eq.armor.ac})`);
    if (eq.shield) equipped.push(`Shield: ${eq.shield.name}`);
    if (equipped.length) lines.push(equipped.join(' | '));

    // Spell slots
    if (p.spellSlots?.current) {
      const slots = p.spellSlots.current
        .map((n, i) => n > 0 ? `L${i + 1}:${n}` : null)
        .filter(Boolean);
      if (slots.length) {
        lines.push(`Spell Slots: ${slots.join(', ')}`);
      }
      if (p.concentrationSpell) {
        lines.push(`Concentrating on: ${p.concentrationSpell}`);
      }
    }

    // Pact magic (Warlock)
    if (p.pactSlots) {
      lines.push(`Pact Slots: ${p.pactSlots.current}/${p.pactSlots.max} (Level ${p.pactSlots.level})`);
    }

    // Status effects / conditions
    const conditions = p.conditions || p.statusEffects || [];
    if (conditions.length) {
      const condNames = conditions.map(c =>
        typeof c === 'string' ? c : (c.name || c.type || JSON.stringify(c))
      ).join(', ');
      lines.push(`⚠️ Conditions: ${condNames}`);
    }

    // Gold
    const gold = (p.inventory || []).find(i => i.id === 'gold');
    if (gold?.quantity > 0) lines.push(`Gold: ${gold.quantity} gp`);

    // Key inventory items (skip gold)
    const items = (p.inventory || [])
      .filter(i => i.id !== 'gold')
      .slice(0, 8)
      .map(i => i.quantity > 1 ? `${i.name} ×${i.quantity}` : i.name)
      .join(', ');
    if (items) lines.push(`Inventory: ${items}`);

    return lines.join('\n');
  }).join('\n\n');
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────────────

function buildDMPrompt(campaign) {
  const {
    theme       = 'Fantasy',
    difficulty  = 'Normal',
    party       = [],
    worldMemory,
    combatState = null,
    history     = [],
    sessionSummary = ''
  } = campaign;

  const mem = normaliseWorldMemory(worldMemory);

  // Format structured world memory
  const npcBlock = mem.npcs.length
    ? mem.npcs.map(n => `- ${n.name}${n.race ? ` (${n.race})` : ''}${n.disposition ? ` [${n.disposition}]` : ''}${n.notes ? `: ${n.notes}` : ''}`).join('\n')
    : '- None yet';

  const locationBlock = mem.locations.length
    ? mem.locations.map(l => `- ${l.name}${l.description ? `: ${l.description}` : ''}`).join('\n')
    : '- None yet';

  const eventBlock = mem.events.length
    ? mem.events.slice(-8).map(e => `- ${e}`).join('\n')
    : '- None yet';

  const factBlock = mem.facts.length
    ? mem.facts.slice(-10).map(f => `- ${f}`).join('\n')
    : '- None yet';

  // Recent conversation (last 12 turns verbatim)
  const recentHistory = history.slice(-12)
    .map(h => `${h.role === 'user' ? '🧑 PLAYER' : h.role === 'assistant' ? '🎲 DM' : 'SYSTEM'}: ${h.content}`)
    .join('\n\n');

  // Older session summary (if any)
  const summaryBlock = (mem.sessionSummary || sessionSummary)
    ? `SESSION SUMMARY (earlier events):\n${mem.sessionSummary || sessionSummary}`
    : '';

  return `You are an expert, immersive Dungeon Master running a ${theme} tabletop RPG campaign with VOICE NARRATION.

CAMPAIGN
Theme: ${theme}
Difficulty: ${difficulty} — ${difficultyGuidance(difficulty)}

════════════════════════════════════
PARTY — CURRENT STATE
════════════════════════════════════
${formatPartyForPrompt(party)}

════════════════════════════════════
WORLD MEMORY
════════════════════════════════════
KNOWN NPCs:
${npcBlock}

KNOWN LOCATIONS:
${locationBlock}

KEY EVENTS (recent first):
${eventBlock}

WORLD FACTS:
${factBlock}

════════════════════════════════════
COMBAT STATE
════════════════════════════════════
${combatState ? JSON.stringify(combatState, null, 2) : 'No active combat.'}

════════════════════════════════════
CONVERSATION HISTORY
════════════════════════════════════
${summaryBlock}

RECENT TURNS:
${recentHistory || 'Campaign is just beginning.'}

════════════════════════════════════
DUNGEON MASTER INSTRUCTIONS
════════════════════════════════════
PARTY AWARENESS — You MUST:
- Reference character names, not "you" alone — "Thorin swings his axe..." not just "you attack"
- Acknowledge HP levels: characters near death should feel it in the narration
- Reference equipped weapons/armor in combat descriptions
- Acknowledge active conditions (poisoned, frightened, etc.) and their effects
- Reference spell slots when characters cast — note when they're running low
- Mention gold when relevant (purchases, rewards, bribes)
- Remember what items the party has and reference them naturally

WORLD CONTINUITY — You MUST:
- Reference established NPCs by name and personality
- Remember locations the party has visited
- Build on past events in your narration
- Keep NPC dispositions consistent (a hostile merchant stays hostile)

VOICE NARRATION — Format dialogue for voice:
- Describe character voice BEFORE their dialogue
- Use voice descriptors: gravelly, lilting, trembling, booming, raspy, cheerful, sinister
- Example: "The old innkeeper's voice cracks with fear, 'They came in the night...'"

COMBAT DETECTION:
- When enemies appear/combat begins → include "**COMBAT_START**" in narration
- When all enemies defeated → include "**COMBAT_END**" in narration

MERCHANT DETECTION:
- When the party enters a shop or meets a merchant → include "**SHOP**" in narration

DICE ROLLS:
- When player mentions a dice roll result, incorporate it meaningfully
- High rolls (15+) = success with flair; Low rolls (1-5) = failure with consequence; Mid rolls = partial success

RESPONSE LENGTH:
- Normal exploration: 3-5 sentences of vivid narration
- Combat turns: 2-3 sentences, punchy and immediate
- Major story moments: up to 8 sentences
- Never pad with filler — every sentence should advance the scene

════════════════════════════════════
JSON RESPONSE SCHEMA
════════════════════════════════════
Respond ONLY with valid JSON. No markdown, no backticks, no text outside the JSON.

{
  "narration": "Your narrative text here. Include **COMBAT_START**, **COMBAT_END**, or **SHOP** markers when appropriate.",
  "worldMemoryUpdates": {
    "npcs": [
      { "name": "NPC Name", "race": "Human", "disposition": "friendly|neutral|hostile|unknown", "notes": "brief description" }
    ],
    "locations": [
      { "name": "Location Name", "description": "brief description" }
    ],
    "events": [
      "One-sentence description of a significant event that just occurred"
    ],
    "facts": [
      "A persistent world fact worth remembering"
    ]
  },
  "partyUpdates": [
    {
      "name": "Character Name",
      "hpDelta": 0,
      "conditions": [],
      "goldDelta": 0,
      "notes": "optional DM note about this character"
    }
  ],
  "combatState": null
}

RULES:
- worldMemoryUpdates: only include things that are NEW or CHANGED — omit unchanged npcs/locations
- partyUpdates: only include characters who changed this turn — use hpDelta (+ heal, - damage), goldDelta
- conditions: full list of current conditions for this character if changed, otherwise omit the field
- combatState: null unless you are managing a specific combat state object
- ENTIRE response must be ONLY the JSON object. Nothing else.
`;
}

function difficultyGuidance(difficulty) {
  const guides = {
    'Easy':     'Enemies are weak, traps are obvious, NPCs are helpful. Reward creative solutions generously.',
    'Normal':   'Balanced challenge. Standard D&D 5e difficulty. Fair but consequential.',
    'Hard':     'Enemies are tactical, traps are deadly, resources matter. Players should feel real danger.',
    'Deadly':   'Ruthless. Permadeath possible. Every decision has weight. No mercy.'
  };
  return guides[difficulty] || guides['Normal'];
}

// ─────────────────────────────────────────────────────────────────────────────
//  JSON PARSER
// ─────────────────────────────────────────────────────────────────────────────

function safeParseDMResponse(text) {
  try {
    console.log("📥 Raw DM response length:", text?.length);

    let cleanText = text.trim();
    // Strip markdown code fences
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    }

    const start = cleanText.indexOf("{");
    const end   = cleanText.lastIndexOf("}");

    if (start === -1 || end === -1) throw new Error("No JSON object found");

    const parsed = JSON.parse(cleanText.slice(start, end + 1));

    if (!parsed.narration) throw new Error("Missing narration field");

    console.log("✅ Parsed DM response successfully");
    return parsed;
  } catch (err) {
    console.error("❌ DM JSON parse failed:", err.message);
    return {
      narration: "The world shimmers uncertainly. The Dungeon Master gathers their thoughts...",
      worldMemoryUpdates: {},
      partyUpdates: [],
      combatState: null
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PARTY UPDATE APPLICATION
// ─────────────────────────────────────────────────────────────────────────────

function applyPartyUpdates(party, updates) {
  if (!updates?.length) return party;

  return party.map(char => {
    const update = updates.find(u => u.name?.toLowerCase() === char.name?.toLowerCase());
    if (!update) return char;

    let updated = { ...char };

    // HP delta
    if (update.hpDelta && update.hpDelta !== 0) {
      updated.hp = Math.max(0, Math.min(char.maxHp, char.hp + update.hpDelta));
      console.log(`[DM] ${char.name} HP: ${char.hp} → ${updated.hp} (delta: ${update.hpDelta})`);
    }

    // Gold delta
    if (update.goldDelta && update.goldDelta !== 0) {
      const inventory = updated.inventory || [];
      const goldIdx   = inventory.findIndex(i => i.id === 'gold');
      if (goldIdx !== -1) {
        const newQty = Math.max(0, inventory[goldIdx].quantity + update.goldDelta);
        updated.inventory = inventory.map((item, i) =>
          i === goldIdx ? { ...item, quantity: newQty } : item
        );
      } else if (update.goldDelta > 0) {
        updated.inventory = [...inventory, {
          id: 'gold', name: 'Gold Coins', type: 'misc',
          weight: 0, value: 1, stackable: true,
          instanceId: `gold_${Date.now()}`,
          quantity: update.goldDelta, equipped: false
        }];
      }
      console.log(`[DM] ${char.name} gold delta: ${update.goldDelta}`);
    }

    // Conditions (full replacement if provided)
    if (Array.isArray(update.conditions)) {
      updated.conditions = update.conditions;
    }

    // DM note (for debugging/display)
    if (update.notes) {
      console.log(`[DM] Note for ${char.name}: ${update.notes}`);
    }

    return updated;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN DM ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export async function runDM({ campaign, playerMessage }) {
  console.log("\n🎮 === DM ENGINE START ===");
  console.log("Player message:", playerMessage?.substring(0, 80));

  const systemPrompt = buildDMPrompt(campaign);

  try {
    console.log("🤖 Calling Groq API (llama-3.3-70b-versatile)...");

    const response = await groqClient.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      temperature: 0.85,
      max_tokens:  1200,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: playerMessage }
      ]
    });

    console.log("📡 Groq API response received");

    const rawText = response.choices?.[0]?.message?.content || "";
    if (!rawText) throw new Error("Empty response from API");

    console.log("📥 Response length:", rawText.length);

    const parsed = safeParseDMResponse(rawText);

    // Merge world memory
    const existingMem    = normaliseWorldMemory(campaign.worldMemory);
    const updatedMem     = mergeWorldMemory(existingMem, parsed.worldMemoryUpdates);

    // Apply party updates
    const updatedParty   = applyPartyUpdates(campaign.party || [], parsed.partyUpdates);

    const result = {
      aiResponse: parsed.narration,
      campaignState: {
        ...campaign,
        party:       updatedParty,
        worldMemory: updatedMem,
        combatState: parsed.combatState !== undefined ? parsed.combatState : campaign.combatState
      }
    };

    console.log("✅ DM Engine complete");
    console.log("📚 World memory — NPCs:", updatedMem.npcs.length, "| Locations:", updatedMem.locations.length, "| Events:", updatedMem.events.length);
    console.log("🎮 === DM ENGINE END ===\n");

    return result;

  } catch (err) {
    console.error("❌ Groq DM error:", err.message);
    return {
      aiResponse: `The world shimmers uncertainly... (${err.message})`,
      campaignState: campaign
    };
  }
}