import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Simple voice map (expand later)
const VOICES = {
  narrator: "21m00Tcm4TlvDq8ikWAM", // Rachel
  dark: "AZnzlk1XvdvUeBnXmlld",
  gruff: "TxGEqnHWrfWFTfGW9XjX",
  old_wise: "EXAVITQu4vr4xnSDxMaL",
  young: "MF3mGyEYCl7XYWbV9V6O",
  female: "21m00Tcm4TlvDq8ikWAM",
};

router.post("/voice", async (req, res) => {
  try {
    const { text, voice = "narrator" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const voiceId = VOICES[voice] || VOICES.narrator;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    res.json({
      audio: `data:audio/mpeg;base64,${audioBase64}`,
    });
  } catch (err) {
    console.error("ElevenLabs error:", err);
    res.status(500).json({ error: "Voice generation failed" });
  }
});

export default router;
