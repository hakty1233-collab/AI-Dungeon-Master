import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

console.log('🎙️ Voice API Base:', API_BASE); // Debug log

export async function generateVoice({ text, voice = "narrator" }) {
  try {
    console.log("🎙️ Requesting voice generation...");
    const response = await axios.post(`${API_BASE}/voice`, {
      text,
      voice,
    });
    console.log("✅ Voice generated successfully");
    return response.data.audio;
  } catch (error) {
    console.error("❌ Voice generation failed:", error);
    throw error;
  }
}