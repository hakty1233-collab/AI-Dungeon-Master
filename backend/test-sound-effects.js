// backend/test-sound-effects.js
// Run this to test if sound effects work: node test-sound-effects.js

import fetch from "node-fetch";

const ELEVENLABS_API_KEY = "sk_8b508aa9cf4346db31a259ad9bc5bce9dfe18f0b9342f223";

async function testSoundEffects() {
  try {
    console.log("🧪 Testing ElevenLabs Sound Generation API...");
    console.log("🔑 API Key:", ELEVENLABS_API_KEY.substring(0, 10) + "...");

    const response = await fetch(
      "https://api.elevenlabs.io/v1/sound-generation",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "birds chirping in a forest",
          duration_seconds: 3,
          prompt_influence: 0.5,
        }),
      }
    );

    console.log("📡 Response status:", response.status);
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Sound Effects API Error:");
      console.error(errorText);
      
      // Parse error to see if it's a plan limitation
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail?.status === "quota_exceeded" || 
            errorJson.detail?.message?.includes("not available")) {
          console.log("\n⚠️  SOUND EFFECTS REQUIRE A PAID PLAN");
          console.log("The sound generation API is not available on the free tier.");
          console.log("Options:");
          console.log("1. Upgrade to a paid ElevenLabs plan");
          console.log("2. Use pre-recorded sound effects instead");
          console.log("3. Disable sound effects and use voice narration only");
        }
      } catch (e) {
        // Not JSON error
      }
      return;
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("✅ Success! Audio size:", audioBuffer.byteLength, "bytes");
    console.log("✅ Sound effects are working!");

  } catch (err) {
    console.error("❌ Test failed:", err.message);
    console.error(err);
  }
}

testSoundEffects();