// backend/src/routes/soundEffects.js
import express from "express";

const router = express.Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_2d42775d006a9e49bae678d6d8a53f0c036b150e0588dd3c";

// Expanded voice map with better character voices
const SOUND_TRIGGERS = {
  // Nature sounds
  birds: ["birds chirping in a forest", "bird song", "avian calls"],
  wind: ["wind howling through trees", "wind whistling", "breeze rustling leaves"],
  rain: ["rain falling on leaves", "gentle rainfall", "rain on stone"],
  thunder: ["distant thunder rumbling", "thunderclap", "storm approaching"],
  water: ["water flowing over rocks", "river babbling", "stream trickling"],
  fire: ["fire crackling", "flames burning", "campfire"],
  forest: ["forest ambience with rustling leaves", "woodland sounds", "nature sounds"],
  
  // Action sounds
  footsteps: ["footsteps on wooden floor", "boots on stone path", "walking on gravel"],
  door: ["old wooden door creaking", "heavy door opening", "door slamming"],
  sword: ["sword being unsheathed", "metal sword ringing", "blade drawn"],
  battle: ["distant battle sounds", "swords clashing", "combat"],
  magic: ["magical energy crackling", "arcane spell casting", "mystical power"],
  
  // Creature sounds
  dragon: ["dragon roar echoing", "dragon growling", "draconic roar"],
  wolf: ["wolf howling in distance", "wolves growling", "wolf pack"],
  horse: ["horse neighing", "horse galloping", "hooves on ground"],
  crowd: ["crowd of people talking", "busy marketplace chatter", "many voices"],
  
  // Environment sounds
  cave: ["water dripping in cave", "cave echo ambience", "underground sounds"],
  dungeon: ["dungeon ambience with chains", "stone corridor echo", "prison atmosphere"],
  tavern: ["busy tavern atmosphere", "people drinking and talking", "inn ambience"],
  city: ["medieval city sounds", "urban marketplace", "town noises"],
};

// Analyze text for sound effect triggers
function detectSoundEffects(text) {
  const lowerText = text.toLowerCase();
  const detectedSounds = [];

  const keywords = {
    birds: ['bird', 'chirp', 'tweet', 'flying', 'wings', 'flock', 'raven', 'crow', 'feather'],
    wind: ['wind', 'breeze', 'gust', 'howl', 'whistle'],
    rain: ['rain', 'drizzle', 'pour', 'wet', 'storm'],
    thunder: ['thunder', 'lightning', 'storm', 'rumble'],
    water: ['water', 'river', 'stream', 'lake', 'splash', 'ripple'],
    fire: ['fire', 'flame', 'burn', 'crackle', 'ember'],
    forest: ['forest', 'woods', 'trees', 'leaves'],
    footsteps: ['walk', 'step', 'footstep', 'march', 'stride', 'approach'],
    door: ['door', 'gate', 'entrance', 'portal'],
    sword: ['sword', 'blade', 'weapon', 'steel', 'unsheath'],
    battle: ['battle', 'fight', 'combat', 'clash', 'attack'],
    magic: ['magic', 'spell', 'cast', 'enchant', 'arcane', 'mystical'],
    dragon: ['dragon', 'wyrm', 'drake'],
    wolf: ['wolf', 'wolves', 'howl'],
    horse: ['horse', 'steed', 'mount', 'gallop'],
    crowd: ['crowd', 'people', 'group', 'gathering', 'marketplace'],
    cave: ['cave', 'cavern', 'grotto', 'underground'],
    dungeon: ['dungeon', 'prison', 'cell', 'corridor'],
    tavern: ['tavern', 'inn', 'bar', 'alehouse'],
    city: ['city', 'town', 'street', 'urban'],
  };

  for (const [category, keywordList] of Object.entries(keywords)) {
    const hasKeyword = keywordList.some(keyword => lowerText.includes(keyword));
    if (hasKeyword && !detectedSounds.find(s => s.category === category)) {
      const prompts = SOUND_TRIGGERS[category];
      detectedSounds.push({
        category,
        prompt: prompts[0], // Use first prompt as default
        timing: 'during'
      });
    }
  }

  console.log(`🔍 Analyzed text: "${text.substring(0, 100)}..."`);
  console.log(`🎵 Detected ${detectedSounds.length} sound effects:`, detectedSounds.map(s => s.category));

  return detectedSounds;
}

// Generate sound effect using ElevenLabs
async function generateSoundEffect(prompt) {
  try {
    console.log(`🎼 Generating sound: "${prompt}"`);
    
    let fetchFunc = fetch;
    if (typeof fetch === 'undefined') {
      const nodeFetch = await import('node-fetch');
      fetchFunc = nodeFetch.default;
    }

    const response = await fetchFunc(
      "https://api.elevenlabs.io/v1/sound-generation",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: prompt,
          duration_seconds: 3,
          prompt_influence: 0.5,
        }),
      }
    );

    console.log(`📡 Sound generation response status: ${response.status}`);

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Sound effect generation failed:", error);
      return null;
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    
    console.log(`✅ Generated sound effect, size: ${audioBuffer.byteLength} bytes`);
    
    return `data:audio/mpeg;base64,${audioBase64}`;
  } catch (err) {
    console.error("❌ Sound effect error:", err.message);
    return null;
  }
}

// Main endpoint
router.post("/sound-effects", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      console.error("❌ No text provided for sound effects");
      return res.status(400).json({ error: "Text is required" });
    }

    console.log("\n🔊 === SOUND EFFECTS REQUEST ===");
    const detectedSounds = detectSoundEffects(text);
    
    if (detectedSounds.length === 0) {
      console.log("🔇 No sound effects detected in text");
      return res.json({ soundEffects: [] });
    }

    // Generate sound effects (limit to 2 to avoid overload and save quota)
    const soundsToGenerate = detectedSounds.slice(0, 2);
    const soundEffects = [];

    for (const sound of soundsToGenerate) {
      const audio = await generateSoundEffect(sound.prompt);
      
      if (audio) {
        soundEffects.push({
          category: sound.category,
          audio,
          timing: sound.timing,
        });
        console.log(`✅ Successfully generated ${sound.category} sound effect`);
      } else {
        console.warn(`⚠️  Failed to generate ${sound.category} sound effect`);
      }
    }

    console.log(`📦 Returning ${soundEffects.length} sound effects to client`);
    console.log("=== END SOUND EFFECTS REQUEST ===\n");

    res.json({ soundEffects });
  } catch (err) {
    console.error("❌ Sound effects endpoint error:", err);
    res.status(500).json({ error: "Failed to generate sound effects", details: err.message });
  }
});

export default router;