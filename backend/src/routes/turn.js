// backend/src/routes/turn.js
import express from "express";
import { runDM } from "../dm/dmEngine.js";

const router = express.Router();

// Player takes a turn
router.post("/turn", async (req, res) => {
  try {
    const { message, campaign, party } = req.body;

    console.log("🎮 Player action:", message);

    // Add player message to history first
    const campaignWithPlayerMsg = {
      ...campaign,
      history: [
        ...(campaign.history || []),
        { role: "user", content: message }
      ]
    };

    // Run DM with updated campaign
    const dmResponse = await runDM({
      campaign: campaignWithPlayerMsg,
      playerMessage: message,
    });

    console.log("🎭 DM Engine returned:", {
      hasAiResponse: !!dmResponse.aiResponse,
      aiResponsePreview: dmResponse.aiResponse?.substring(0, 50),
      hasCampaignState: !!dmResponse.campaignState
    });

    // Use the campaign state returned by DM
    let updatedCampaign = dmResponse.campaignState;

    // Add DM response to history
    updatedCampaign.history = [
      ...(updatedCampaign.history || []),
      { role: "assistant", content: dmResponse.aiResponse }
    ];

    console.log("✅ Sending response with aiResponse:", dmResponse.aiResponse.substring(0, 50) + "...");

    // ⚠️ CRITICAL: Must return BOTH aiResponse AND campaignState
    res.json({ 
      aiResponse: dmResponse.aiResponse,  // <-- This is what was missing!
      campaignState: updatedCampaign 
    });
  } catch (err) {
    console.error("❌ Failed to play turn:", err);
    res.status(500).json({ error: "Failed to play turn", details: err.message });
  }
});

export default router;