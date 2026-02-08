// backend/src/index.js
import express from "express";
import cors from "cors";
import campaignRoutes from "./routes/campaign.js";
import turnRoutes from "./routes/turn.js";
import voiceRoutes from "./routes/voice.js";
import soundEffectsRoutes from "./routes/soundEffects.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CRITICAL FIX: Proper CORS configuration for Railway + Vercel
const corsOptions = {
  origin: [
    'http://localhost:3000',  // Local development
    /^https:\/\/.*-hakty1233-collabs-projects\.vercel\.app$/  // All Vercel preview URLs
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ✅ FIX for Express 5: Use middleware instead of app.options('*', ...)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'AI Dungeon Master Backend is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/start-campaign', campaignRoutes);
app.use('/turn', turnRoutes);
app.use('/voice', voiceRoutes);
app.use('/sound-effects', soundEffectsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server - MUST listen on 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ AI Dungeon Master Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Groq API Key: ${process.env.GROQ_API_KEY ? 'Configured ✅' : 'MISSING ❌'}`);
  console.log(`🎤 ElevenLabs API Key: ${process.env.ELEVENLABS_API_KEY ? 'Configured ✅' : 'MISSING ❌'}`);
});