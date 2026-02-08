// backend/src/routes/voice.js
import express from "express";

const router = express.Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_f8ad078c63b6ff78d3117101c2ac1731c55ff6a301450fa8";

// Expanded voice map with better character voices
const VOICES = {
  narrator: "21m00Tcm4TlvDq8ikWAM", // Rachel - warm, clear narrator
  dark: "AZnzlk1XvdvUeBnXmlld", // Domi - dark, mysterious
  gruff: "TxGEqnHWrfWFTfGW9XjX", // Josh - deep, gruff warrior
  old_wise: "EXAVITQu4vr4xnSDxMaL", // Bella - wise elder
  young: "MF3mGyEYCl7XYWbV9V6O", // Elli - young, energetic
  female: "21m00Tcm4TlvDq8ikWAM", // Rachel
  male: "TxGEqnHWrfWFTfGW9XjX", // Josh
  epic: "pNInz6obpgDQGcFmaJgB", // Adam - epic narrator
};

router.post("/", async (req, res) => {
  try {
    const { text, voice = "narrator" } = req.body;

    if (!text) {
      console.error("❌ No text provided");
      return res.status(400).json({ error: "Text is required" });
    }

    console.log("🎙️ Generating voice for:", text.substring(0, 50) + "...");
    console.log("🎭 Using voice:", voice);
    console.log("🔑 API Key exists:", !!ELEVENLABS_API_KEY);

    const voiceId = VOICES[voice] || VOICES.narrator;

    // Using native fetch (Node 18+) or dynamic import for node-fetch
    let fetchFunc = fetch;
    if (typeof fetch === 'undefined') {
      console.log("📦 Using node-fetch...");
      const nodeFetch = await import('node-fetch');
      fetchFunc = nodeFetch.default;
    }

    const response = await fetchFunc(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          },
        }),
      }
    );

    console.log("📡 ElevenLabs response status:", response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ ElevenLabs API error:", error);
      return res.status(response.status).json({ 
        error: "ElevenLabs API error", 
        details: error 
      });
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    console.log("✅ Voice generated, size:", audioBuffer.byteLength, "bytes");

    res.json({
      audio: `data:audio/mpeg;base64,${audioBase64}`,
    });
  } catch (err) {
    console.error("❌ Voice generation failed:");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Stack:", err.stack);
    
    res.status(500).json({ 
      error: "Voice generation failed", 
      details: err.message,
      stack: err.stack 
    });
  }
});

export default router;