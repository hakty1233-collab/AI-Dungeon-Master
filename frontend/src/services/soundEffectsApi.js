import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

console.log('🔊 Sound API Base:', API_BASE); // Debug log

export async function generateSoundEffects(text) {
  try {
    console.log("🔊 Requesting sound effects...");
    const response = await axios.post(`${API_BASE}/sound-effects`, {
      text,
    });
    console.log("✅ Sound effects received:", response.data.soundEffects.length);
    return response.data.soundEffects;
  } catch (error) {
    console.error("❌ Sound effects generation failed:", error);
    return [];
  }
}