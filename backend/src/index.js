import express from "express";
import cors from "cors";

import campaignRoutes from "./routes/campaign.js";
import turnRoutes from "./routes/turn.js";
import voiceRoutes from "./routes/voice.js";
import soundEffectsRoutes from "./routes/soundEffects.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Allow all origins for now
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'AI Dungeon Master Backend is running!' });
});

// Routes
app.use(campaignRoutes);
app.use(turnRoutes);
app.use(voiceRoutes);
app.use(soundEffectsRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});