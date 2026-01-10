// backend/test-elevenlabs.js
// Run this to test if ElevenLabs is working: node test-elevenlabs.js

import fetch from "node-fetch";

const ELEVENLABS_API_KEY = "sk_8b508aa9cf4346db31a259ad9bc5bce9dfe18f0b9342f223";

async function testElevenLabs() {
  try {
    console.log("🧪 Testing ElevenLabs API...");
    console.log("🔑 API Key:", ELEVENLABS_API_KEY.substring(0, 10) + "...");

    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "This is a test of the ElevenLabs voice system.",
          model_id: "eleven_turbo_v2_5", // ✅ FREE TIER MODEL (was eleven_monolingual_v1)
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    console.log("📡 Response status:", response.status);
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ ElevenLabs API Error:");
      console.error(errorText);
      return;
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("✅ Success! Audio size:", audioBuffer.byteLength, "bytes");
    console.log("✅ ElevenLabs is working correctly!");

  } catch (err) {
    console.error("❌ Test failed:", err.message);
    console.error(err);
  }
}

testElevenLabs();