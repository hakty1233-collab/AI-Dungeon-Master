import axios from "axios";

// Use environment variable or fallback to localhost
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

console.log('🔗 API Base URL:', API_BASE); // Debug log

export async function startCampaign({ theme, difficulty, party }) {
  const response = await axios.post(`${API_BASE}/start-campaign`, {
    theme,
    difficulty,
    party,
  });
  return response.data.campaignState;
}

export async function playTurn({ message, campaign, party }) {
  const response = await axios.post(`${API_BASE}/turn`, {
    message,
    campaign,
    party,
  });
  return response.data;
}