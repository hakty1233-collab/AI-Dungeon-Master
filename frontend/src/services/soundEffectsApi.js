// frontend/src/services/soundEffectsApi.js
import axios from "axios";

export async function generateSoundEffects(text) {
  try {
    console.log("🔊 Requesting sound effects...");
    const response = await axios.post("http://localhost:3001/sound-effects", {
      text,
    });
    console.log("✅ Sound effects received:", response.data.soundEffects.length);
    return response.data.soundEffects;
  } catch (error) {
    console.error("❌ Sound effects generation failed:", error);
    return [];
  }
}