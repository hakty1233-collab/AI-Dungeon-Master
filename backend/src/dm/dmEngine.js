import OpenAI from "openai";

/**
 * ⚠️ IMPORTANT
 * Move this key to an env variable ASAP:
 * process.env.GROQ_API_KEY
 */
const groqClient = new OpenAI({
  apiKey: "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",
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Build a HARD-CONSTRAINED system prompt
 */
function buildDMPrompt(campaign) {
  const {
    theme,
    difficulty,
    party = [],
    worldMemory = [],
    combatState = null,
    history = [],
  } = campaign;

  return `
You are a master Dungeon Master running a tabletop RPG.

CAMPAIGN
Theme: ${theme}
Difficulty: ${difficulty}

PARTY
${party.map(p => `- ${p.name} (HP: ${p.hp}, Status: ${p.status})`).join("\n")}

WORLD MEMORY (persistent facts only):
${worldMemory.length ? worldMemory.map(m => `- ${m}`).join("\n") : "- None"}

COMBAT STATE:
${combatState ? JSON.stringify(combatState) : "No active combat"}

RECENT EVENTS (context only):
${history.slice(-6).map(h => `${h.role.toUpperCase()}: ${h.content}`).join("\n")}

ABSOLUTE RULES:
- Respond ONLY in valid JSON
- NO markdown
- NO extra text
- NO explanations
- JSON MUST match this exact schema:

{
  "narration": string,
  "worldMemoryUpdates": string[],
  "combatState": object | null,
  "partyUpdates": { "name": string, "hp": number, "status": string }[]
}
`;
}

/**
 * Safe JSON parser (never crashes)
 */
function safeParseDMResponse(text) {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON found");

    return JSON.parse(text.slice(start, end + 1));
  } catch (err) {
    console.error("❌ DM JSON parse failed");
    console.error(text);

    return {
      narration: "The world stutters, as if reality itself hesitates...",
      worldMemoryUpdates: [],
      combatState: null,
      partyUpdates: [],
    };
  }
}

/**
 * MAIN DM ENGINE
 */
export async function runDM({ campaign, playerMessage }) {
  const systemPrompt = buildDMPrompt(campaign);

  try {
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: playerMessage },
      ],
    });

    const rawText = response.choices?.[0]?.message?.content || "";
    const parsed = safeParseDMResponse(rawText);

    // 🧠 Merge world memory
    const updatedWorldMemory = [
      ...(campaign.worldMemory || []),
      ...(parsed.worldMemoryUpdates || []),
    ];

    // 🧍 Apply party updates
    const updatedParty = campaign.party.map((p) => {
      const update = parsed.partyUpdates.find(u => u.name === p.name);
      if (!update) return p;

      return {
        ...p,
        hp: Math.max(0, p.hp + (update.hp || 0)),
        status: update.status || p.status,
      };
    });

    return {
      aiResponse: parsed.narration,
      campaignState: {
        ...campaign,
        party: updatedParty,
        worldMemory: updatedWorldMemory,
        combatState: parsed.combatState,
      },
    };

  } catch (err) {
    console.error("Groq DM error:", err);

    return {
      aiResponse: "A cold silence falls. Something has gone wrong in the fabric of fate.",
      campaignState: campaign,
    };
  }
}
