// backend/src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dmRoutes from "./routes/dm.js";
import voiceRoutes from "./routes/voice.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CRITICAL FIX: Proper CORS configuration for Railway + Vercel
const corsOptions = {
  origin: [
    'http://localhost:3000',  // Local development
    'https://ai-dungeon-master-sepia.vercel.app'  // Production Vercel
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ✅ CRITICAL FIX: Explicit OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

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
app.use('/start-campaign', dmRoutes);
app.use('/dm-action', dmRoutes);
app.use('/voice', voiceRoutes);

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