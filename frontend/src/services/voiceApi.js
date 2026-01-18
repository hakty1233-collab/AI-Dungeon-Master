import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function generateVoice({ text, voice = "narrator" }) {
  const response = await axios.post(`${API_BASE}/voice`, {
    text,
    voice,
  });
  return response.data.audio;
}