import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function generateSoundEffects(text) {
  try {
    const response = await axios.post(`${API_BASE}/sound-effects`, {
      text,
    });
    return response.data.soundEffects;
  } catch (error) {
    return [];
  }
}