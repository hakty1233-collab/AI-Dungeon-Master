// frontend/src/utils/narrativeParser.js

/**
 * Parse narrative text to detect dialogue and assign appropriate voices
 */

// Voice descriptors mapped to ElevenLabs voice IDs
const VOICE_MAP = {
  // Character traits
  'gravelly': 'gruff',
  'gruff': 'gruff',
  'rough': 'gruff',
  'deep': 'gruff',
  'raspy': 'gruff',
  'harsh': 'gruff',
  
  'old': 'old_wise',
  'ancient': 'old_wise',
  'wise': 'old_wise',
  'elderly': 'old_wise',
  'aged': 'old_wise',
  
  'young': 'young',
  'youthful': 'young',
  'child': 'young',
  'cheerful': 'young',
  
  'dark': 'dark',
  'sinister': 'dark',
  'menacing': 'dark',
  'ominous': 'dark',
  'evil': 'dark',
  
  'female': 'female',
  'woman': 'female',
  'lady': 'female',
  
  'male': 'male',
  'man': 'male',
  
  'epic': 'epic',
  'booming': 'epic',
  'powerful': 'epic',
  'commanding': 'epic',
};

/**
 * Detect voice characteristics from descriptive text
 */
function detectVoiceFromDescription(text) {
  const lowerText = text.toLowerCase();
  
  for (const [keyword, voice] of Object.entries(VOICE_MAP)) {
    if (lowerText.includes(keyword)) {
      return voice;
    }
  }
  
  return 'narrator';
}

/**
 * Parse narrative text into segments with appropriate voices
 * Format: Narrator leads up to quote, then character voice speaks the quote
 */
export function parseNarrative(text) {
  const segments = [];
  
  // Enhanced regex to capture dialogue with context
  // Matches: "...description, 'dialogue'" or "...description: 'dialogue'"
  const dialoguePattern = /([^'"]*?[,:])\s*['"'"](.*?)['"'"]/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = dialoguePattern.exec(text)) !== null) {
    const beforeDialogue = match[1].trim(); // Everything before the quote
    const dialogue = match[2].trim(); // The actual quote
    const fullMatchStart = match.index;
    const fullMatchEnd = dialoguePattern.lastIndex;
    
    // Add any pure narration before this match
    if (fullMatchStart > lastIndex) {
      const pureNarration = text.slice(lastIndex, fullMatchStart).trim();
      if (pureNarration) {
        segments.push({
          text: pureNarration,
          voice: 'narrator',
          type: 'narration',
        });
      }
    }
    
    // Add the setup narration (the part leading to the dialogue)
    if (beforeDialogue) {
      segments.push({
        text: beforeDialogue + ',',
        voice: 'narrator',
        type: 'narration',
      });
    }
    
    // Add the dialogue with detected voice
    const voice = detectVoiceFromDescription(beforeDialogue);
    segments.push({
      text: dialogue,
      voice: voice,
      type: 'dialogue',
      description: beforeDialogue,
    });
    
    lastIndex = fullMatchEnd;
  }
  
  // Add any remaining narration after the last dialogue
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex).trim();
    if (remainingText) {
      segments.push({
        text: remainingText,
        voice: 'narrator',
        type: 'narration',
      });
    }
  }
  
  // If no dialogue was detected, return entire text as narration
  if (segments.length === 0) {
    segments.push({
      text: text,
      voice: 'narrator',
      type: 'narration',
    });
  }
  
  return segments;
}

/**
 * Example usage and test
 */
export function testParser() {
  const examples = [
    "A raspy voice calls out from the doorway of the local tavern, 'Welcome to the Crimson Griffin, where the ale is warm and the company is... questionable.' As you enter, the warm glow of the fire pit and the murmur of hushed conversations envelop you.",
    
    "The figure's voice remains low and gravelly as it speaks, 'I am called Malakai, and I have been waiting for you, adventurer.'",
    
    "The old wizard says, 'You must find the crystal before nightfall.' He turns away with a sigh.",
    
    "The tavernkeeper, a gruff old man with a thick beard, eyes you from behind the bar, 'What can I get for you, stranger?'",
  ];
  
  console.log("=== Narrative Parser Tests ===");
  examples.forEach((example, i) => {
    console.log(`\n📖 Example ${i + 1}:`);
    console.log(`Input: "${example}"`);
    const segments = parseNarrative(example);
    console.log(`\nParsed into ${segments.length} segments:`);
    segments.forEach((seg, j) => {
      console.log(`  ${j + 1}. [${seg.type}] (${seg.voice}): "${seg.text}"`);
    });
  });
}