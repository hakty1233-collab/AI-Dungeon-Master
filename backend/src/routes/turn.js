// backend/src/routes/turn.js
import express from "express";
import { runDM } from "../dm/dmEngine.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
//  HISTORY COMPRESSION
//  When history exceeds MAX_HISTORY turns, the oldest chunk is summarised
//  into worldMemory.sessionSummary rather than being discarded entirely.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_HISTORY        = 20; // Total turns kept before compression triggers
const COMPRESS_CHUNK     = 10; // How many old turns to compress at once
const KEEP_RECENT        = 10; // Always keep the most recent N turns verbatim

/**
 * Compress old history entries into a session summary string.
 * We extract player actions and DM responses and reduce them to key events.
 */
function compressHistory(turnsToCompress) {
  const lines = turnsToCompress
    .filter(h => h.role === 'user' || h.role === 'assistant')
    .map(h => {
      if (h.role === 'user') return `Player: ${h.content.substring(0, 120)}`;
      // DM narration — take first sentence
      const firstSentence = h.content.split(/[.!?]/)[0]?.trim();
      return `DM: ${firstSentence || h.content.substring(0, 100)}`;
    });

  return lines.join(' | ');
}

/**
 * Manage history length — compress old turns into sessionSummary.
 * Returns { history, worldMemory } with compression applied if needed.
 */
function manageHistory(campaign) {
  const history     = campaign.history || [];
  const worldMemory = campaign.worldMemory || {};

  if (history.length <= MAX_HISTORY) {
    return { history, worldMemory };
  }

  console.log(`📜 History compression triggered (${history.length} turns → compress ${COMPRESS_CHUNK}, keep ${KEEP_RECENT})`);

  // Split: compress the oldest chunk, keep the recent turns
  const toCompress = history.slice(0, COMPRESS_CHUNK);
  const toKeep     = history.slice(COMPRESS_CHUNK);

  const newSummaryChunk = compressHistory(toCompress);

  // Append to existing session summary
  const existingMem     = typeof worldMemory === 'object' && !Array.isArray(worldMemory)
    ? worldMemory
    : { npcs: [], locations: [], events: [], facts: [], sessionSummary: '' };

  const existingSummary = existingMem.sessionSummary || '';
  const updatedSummary  = existingSummary
    ? `${existingSummary} || ${newSummaryChunk}`
    : newSummaryChunk;

  // Cap the summary so it doesn't grow forever (~2000 chars)
  const cappedSummary = updatedSummary.length > 2000
    ? '...' + updatedSummary.slice(-1800)
    : updatedSummary;

  console.log(`📜 Session summary updated (${cappedSummary.length} chars)`);

  return {
    history:     toKeep,
    worldMemory: {
      ...existingMem,
      sessionSummary: cappedSummary
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTE
// ─────────────────────────────────────────────────────────────────────────────

router.post("/", async (req, res) => {
  try {
    const { message, campaign, party } = req.body;

    console.log("🎮 Player action:", message?.substring(0, 80));

    // Merge party into campaign (frontend sends them separately)
    const campaignWithParty = {
      ...campaign,
      party: party || campaign.party || []
    };

    // Add player message to history
    const campaignWithMsg = {
      ...campaignWithParty,
      history: [
        ...(campaignWithParty.history || []),
        { role: "user", content: message }
      ]
    };

    // Compress history if needed — keeps context lean and fast
    const { history: managedHistory, worldMemory: managedMemory } = manageHistory(campaignWithMsg);

    const campaignForDM = {
      ...campaignWithMsg,
      history:     managedHistory,
      worldMemory: managedMemory
    };

    // Run DM engine
    const dmResponse = await runDM({
      campaign:      campaignForDM,
      playerMessage: message
    });

    console.log("🎭 DM Engine returned:", {
      hasAiResponse:    !!dmResponse.aiResponse,
      preview:          dmResponse.aiResponse?.substring(0, 60),
      hasCampaignState: !!dmResponse.campaignState
    });

    // Add DM response to history
    let updatedCampaign = {
      ...dmResponse.campaignState,
      history: [
        ...(dmResponse.campaignState?.history || managedHistory),
        { role: "assistant", content: dmResponse.aiResponse }
      ]
    };

    console.log("✅ Sending response");

    res.json({
      aiResponse:    dmResponse.aiResponse,
      campaignState: updatedCampaign
    });

  } catch (err) {
    console.error("❌ Failed to play turn:", err);
    res.status(500).json({ error: "Failed to play turn", details: err.message });
  }
});

export default router;