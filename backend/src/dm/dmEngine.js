// backend/src/dm/dmEngine.js - Enhanced with inventory tracking and combat detection
import OpenAI from "openai";

const groqClient = new OpenAI({
  apiKey: "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", // Replace with your key
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Build enhanced system prompt with inventory and combat awareness
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

  // Format party with inventory
  const partyInfo = party.map(p => {
    const inventory = p.inventory || [];
    const equippedItems = p.equippedItems || {};
    
    let charInfo = `- ${p.name} (Level ${p.level} ${p.race} ${p.class})
  HP: ${p.hp}/${p.maxHp}
  AC: ${p.armorClass || 10}`;

    if (equippedItems.weapon) {
      charInfo += `\n  Weapon: ${equippedItems.weapon.name} (${equippedItems.weapon.damage})`;
    }
    if (equippedItems.armor) {
      charInfo += `\n  Armor: ${equippedItems.armor.name} (AC ${equippedItems.armor.ac})`;
    }
    if (inventory.length > 0) {
      const items = inventory.slice(0, 10).map(item => 
        item.quantity > 1 ? `${item.name} (x${item.quantity})` : item.name
      ).join(', ');
      charInfo += `\n  Inventory: ${items}${inventory.length > 10 ? '...' : ''}`;
    }

    return charInfo;
  }).join("\n\n");

  return `
You are a master Dungeon Master running a tabletop RPG with VOICE NARRATION.

CAMPAIGN
Theme: ${theme}
Difficulty: ${difficulty}

PARTY STATUS
${partyInfo}

WORLD MEMORY (persistent facts only):
${worldMemory.length ? worldMemory.map(m => `- ${m}`).join("\n") : "- None"}

COMBAT STATE:
${combatState ? JSON.stringify(combatState) : "No active combat"}

RECENT EVENTS (context only):
${history.slice(-6).map(h => `${h.role.toUpperCase()}: ${h.content}`).join("\n")}

VOICE NARRATION GUIDELINES:
- When characters speak, describe their voice BEFORE the dialogue
- Use descriptive words like: gravelly, gruff, raspy, old, young, dark, sinister, cheerful, booming
- Format dialogue clearly with quotation marks
- Example: "The old wizard's voice trembles as he speaks, 'You must find the crystal.'"

COMBAT DETECTION:
- When enemies appear or combat begins, include "**COMBAT_START**" in your narration
- When all enemies are defeated, include "**COMBAT_END**" in your narration
- Examples:
  * "Three goblins emerge from the shadows! **COMBAT_START**"
  * "The bandits draw their weapons and attack! **COMBAT_START**"
  * "The last orc falls to the ground. **COMBAT_END**"

ITEM AWARENESS:
- The party's inventory is listed above - remember what they have
- When they use items, acknowledge their effects
- Example: If they have a healing potion and use it, narrate its effect
- If they find treasure, describe what they discover (the system will auto-add items)

DICE ROLL INTEGRATION:
- When the player mentions rolling dice (e.g., "I rolled a 15"), incorporate the result
- Example: "With a roll of 15, you successfully pick the lock..."
- Higher rolls = better outcomes, lower rolls = worse outcomes

ABSOLUTE RULES:
- Respond ONLY in valid JSON
- NO markdown backticks
- NO extra text before or after JSON
- NO explanations outside the JSON
- JSON MUST match this exact schema:

{
  "narration": "Your narrative text here (include **COMBAT_START** or **COMBAT_END** when appropriate)",
  "worldMemoryUpdates": [],
  "combatState": null,
  "partyUpdates": []
}

CRITICAL: Your ENTIRE response must be ONLY the JSON object. Nothing else.
`;
}

/**
 * Safe JSON parser
 */
function safeParseDMResponse(text) {
  try {
    console.log("📥 Raw DM response length:", text?.length);
    
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    }
    
    // Find JSON object
    const start = cleanText.indexOf("{");
    const end = cleanText.lastIndexOf("}");
    
    if (start === -1 || end === -1) {
      console.error("❌ No JSON found in response");
      throw new Error("No JSON object found");
    }

    const jsonStr = cleanText.slice(start, end + 1);
    const parsed = JSON.parse(jsonStr);
    
    // Validate required fields
    if (!parsed.narration) {
      console.error("❌ Missing narration field");
      throw new Error("Missing narration field");
    }
    
    console.log("✅ Parsed DM response successfully");
    
    return parsed;
  } catch (err) {
    console.error("❌ DM JSON parse failed:", err.message);

    return {
      narration: "The world shimmers uncertainly. The Dungeon Master gathers their thoughts...",
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
  console.log("\n🎮 === DM ENGINE START ===");
  console.log("Player message:", playerMessage);
  
  const systemPrompt = buildDMPrompt(campaign);

  try {
    console.log("🤖 Calling Groq API...");
    
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      max_tokens: 1000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: playerMessage },
      ],
    });

    console.log("📡 Groq API response received");

    const rawText = response.choices?.[0]?.message?.content || "";
    
    if (!rawText) {
      console.error("❌ Empty response from Groq");
      throw new Error("Empty response from API");
    }
    
    console.log("📥 Response length:", rawText.length);
    
    const parsed = safeParseDMResponse(rawText);

    // 🧠 Merge world memory
    const updatedWorldMemory = [
      ...(campaign.worldMemory || []),
      ...(parsed.worldMemoryUpdates || []),
    ];

    // 🧍 Apply party updates
    const updatedParty = campaign.party.map((p) => {
      const update = parsed.partyUpdates?.find(u => u.name === p.name);
      if (!update) return p;

      return {
        ...p,
        hp: Math.max(0, p.hp + (update.hp || 0)),
        status: update.status || p.status,
      };
    });

    const result = {
      aiResponse: parsed.narration,
      campaignState: {
        ...campaign,
        party: updatedParty,
        worldMemory: updatedWorldMemory,
        combatState: parsed.combatState,
      },
    };

    console.log("✅ DM Engine complete");
    console.log("🎮 === DM ENGINE END ===\n");

    return result;

  } catch (err) {
    console.error("❌ Groq DM error:", err);
    console.error("Error message:", err.message);

    return {
      aiResponse: "The world shimmers uncertainly. The Dungeon Master gathers their thoughts... (An error occurred: " + err.message + ")",
      campaignState: campaign,
    };
  }
}