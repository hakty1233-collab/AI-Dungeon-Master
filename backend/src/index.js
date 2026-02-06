import express from "express";
import cors from "cors";

import campaignRoutes from "./routes/campaign.js";
import turnRoutes from "./routes/turn.js";
import voiceRoutes from "./routes/voice.js";
import soundEffectsRoutes from "./routes/soundEffects.js";

const app = express();
const PORT = process.env.PORT || 3001;

// CRITICAL: CORS must come BEFORE routes and body parsing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// CRITICAL: Body parser must come BEFORE routes
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'AI Dungeon Master Backend is running!',
    routes: ['/start-campaign', '/turn', '/voice', '/sound-effects']
  });
});

// Log all incoming requests (for debugging)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Routes
app.use(campaignRoutes);
app.use(turnRoutes);
app.use(voiceRoutes);
app.use(soundEffectsRoutes);

// 404 handler - this will catch if route doesn't exist
app.use((req, res) => {
  console.error(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    availableRoutes: ['/start-campaign', '/turn', '/voice', '/sound-effects']
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📍 Available routes:`);
  console.log(`   POST /start-campaign`);
  console.log(`   POST /turn`);
  console.log(`   POST /voice`);
  console.log(`   POST /sound-effects`);
});