// frontend/src/services/voiceApi.js
import axios from "axios";

export async function generateVoice({ text, voice = "narrator" }) {
  try {
    console.log("🎙️ Requesting voice generation...");
    const response = await axios.post("http://localhost:3001/voice", {
      text,
      voice,
    });
    console.log("✅ Voice generated successfully");
    return response.data.audio; // Returns base64 audio data
  } catch (error) {
    console.error("❌ Voice generation failed:", error);
    throw error;
  }
}