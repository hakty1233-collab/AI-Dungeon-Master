import axios from "axios";

export async function startCampaign({ theme, difficulty, party }) {
  const response = await axios.post("http://localhost:3001/start-campaign", {
    theme,
    difficulty,
    party,
  });
  return response.data.campaignState; // 🔑 unwrap from backend
}

export async function playTurn({ message, campaign, party }) {
  const response = await axios.post("http://localhost:3001/turn", {
    message,
    campaign,
    party,
  });
  return response.data;
}
