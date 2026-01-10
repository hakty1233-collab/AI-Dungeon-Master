// backend/src/index.js
import express from "express";
import cors from "cors";

import campaignRoutes from "./routes/campaign.js";
import turnRoutes from "./routes/turn.js";
import voiceRoutes from "./routes/voice.js";
import soundEffectsRoutes from "./routes/soundEffects.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for audio data

// ✅ Routes
app.use(campaignRoutes);
app.use(turnRoutes);
app.use(voiceRoutes);
app.use(soundEffectsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`🎙️ ElevenLabs voice generation enabled`);
});