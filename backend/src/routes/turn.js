import express from "express";
import { runDM } from "../dm/dmEngine.js";

const router = express.Router();

// Player takes a turn
router.post("/turn", async (req, res) => {
  try {
    const { message, campaign, party } = req.body;

    const dmResponse = await runDM({
      campaign,
      playerMessage: message,
    });

    // Update campaign history with DM and player
    const updatedHistory = [
      ...(campaign.history || []),
      { role: "user", content: message },
      { role: "assistant", content: dmResponse.narration },
    ];

    const campaignState = { ...campaign, history: updatedHistory };

    res.json({ aiResponse: dmResponse.narration, campaignState });
  } catch (err) {
    console.error("Failed to play turn:", err);
    res.status(500).json({ error: "Failed to play turn" });
  }
});

export default router;
