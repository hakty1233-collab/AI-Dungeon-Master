import express from "express";
import { initCampaign } from "../game/state.js";
import { runDM } from "../dm/dmEngine.js";

const router = express.Router();

// Start a new campaign
router.post("/start-campaign", async (req, res) => {
  try {
    const { theme, difficulty, party } = req.body;

    // Initialize the campaign
    let campaignState = initCampaign({ theme, difficulty, party });

    // DM generates first narration
    const dmIntro = await runDM({
      campaign: campaignState,
      playerMessage: "Begin the adventure.",
    });

    // Add DM narration to history
    campaignState.history = [
      ...(campaignState.history || []),
      { role: "assistant", content: dmIntro.narration },
    ];

    res.json({ campaignState });
  } catch (err) {
    console.error("Failed to start campaign:", err);
    res.status(500).json({ error: "Failed to start campaign" });
  }
});

export default router;
