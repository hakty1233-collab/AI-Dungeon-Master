// backend/src/routes/campaign.js
import express from "express";
import { initCampaign } from "../game/state.js";
import { runDM } from "../dm/dmEngine.js";

const router = express.Router();

// Start a new campaign
router.post("/", async (req, res) => {
  try {
    const { theme, difficulty, party } = req.body;

    // Initialize the campaign
    let campaignState = initCampaign({ theme, difficulty, party });

    // DM generates first narration
    const dmResult = await runDM({
      campaign: campaignState,
      playerMessage: "Begin the adventure.",
    });

    // Use the updated campaign state from DM
    campaignState = dmResult.campaignState;

    // Add the intro narration to history
    campaignState.history = [
      ...(campaignState.history || []),
      { role: "assistant", content: dmResult.aiResponse },
    ];

    console.log("✅ Campaign started:", {
      theme,
      difficulty,
      partySize: party.length,
      firstNarration: dmResult.aiResponse.substring(0, 50) + "..."
    });

    res.json({ campaignState });
  } catch (err) {
    console.error("❌ Failed to start campaign:", err);
    res.status(500).json({ error: "Failed to start campaign", details: err.message });
  }
});

export default router;