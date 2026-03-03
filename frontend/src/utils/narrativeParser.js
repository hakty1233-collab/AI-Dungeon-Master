// frontend/src/utils/narrativeParser.js

/**
 * Parse narrative text into segments with appropriate voices for ElevenLabs.
 * Handles standard quotes, curly quotes, and multi-sentence narration blocks.
 */

const VOICE_MAP = {
  gravelly: 'gruff', gruff: 'gruff', rough: 'gruff', deep: 'gruff',
  raspy: 'gruff', harsh: 'gruff', hoarse: 'gruff', growling: 'gruff',
  old: 'old_wise', ancient: 'old_wise', wise: 'old_wise',
  elderly: 'old_wise', aged: 'old_wise', weathered: 'old_wise',
  young: 'young', youthful: 'young', child: 'young',
  cheerful: 'young', bright: 'young', excited: 'young',
  dark: 'dark', sinister: 'dark', menacing: 'dark',
  ominous: 'dark', evil: 'dark', cold: 'dark', cruel: 'dark',
  female: 'female', woman: 'female', lady: 'female', girl: 'female',
  male: 'male', man: 'male',
  epic: 'epic', booming: 'epic', powerful: 'epic', commanding: 'epic',
  trembling: 'narrator', fearful: 'narrator', nervous: 'narrator',
};

function detectVoiceFromDescription(text) {
  if (!text) return 'narrator';
  const lower = text.toLowerCase();
  for (const [keyword, voice] of Object.entries(VOICE_MAP)) {
    if (lower.includes(keyword)) return voice;
  }
  return 'narrator';
}

/**
 * Normalise all quote styles to standard ASCII for consistent splitting.
 * Curly quotes are the #1 cause of the parser missing dialogue boundaries.
 */
function normaliseQuotes(text) {
  return text
    .replace(/\u2018|\u2019|\u0060|\u00B4/g, "'")   // curly single → '
    .replace(/\u201C|\u201D/g, '"')                  // curly double → "
    .replace(/\u2014/g, ' — ')                       // em dash → spaced
    .replace(/\u2013/g, '-');                        // en dash → hyphen
}

/**
 * Split text into sentences for clean narration chunking.
 * Keeps the terminator attached so pauses sound natural.
 */
function splitIntoSentences(text) {
  // Split on . ! ? followed by space or end-of-string, but not on abbreviations
  return text.match(/[^.!?]+[.!?]+[\s]*/g)?.map(s => s.trim()).filter(Boolean) || [text.trim()];
}

/**
 * Main parser — returns array of { text, voice, type } segments.
 *
 * Strategy:
 * 1. Normalise all quotes.
 * 2. Split the whole text on dialogue boundaries (quoted sections).
 * 3. For each non-dialogue chunk, keep as narrator narration.
 * 4. For each dialogue chunk, detect the speaker's voice from
 *    the immediately preceding narration sentence.
 * 5. Never return an empty segment.
 */
export function parseNarrative(text) {
  if (!text || !text.trim()) return [];

  const normalised = normaliseQuotes(text);
  const segments   = [];

  // Regex: captures (narration before quote)(the quoted content)
  // Handles both single ' and double " delimiters.
  // Using a non-greedy match to avoid eating multiple quotes in one pass.
  const quoteRe = /([\s\S]*?)(?:"([^"]+?)"|'([^']+?)')/g;

  let lastIndex = 0;
  let match;

  while ((match = quoteRe.exec(normalised)) !== null) {
    const narrationBefore = match[1];          // text before this quote
    const dialogue        = match[2] || match[3]; // the quoted text
    const matchEnd        = quoteRe.lastIndex;

    // ── Narration before dialogue ──
    // Only add the part we haven't already emitted (avoid double-adding)
    const newNarration = narrationBefore.slice(Math.max(0, lastIndex - (match.index)));
    const narrationText = newNarration.trim();

    if (narrationText) {
      // Break long narration into sentences so TTS doesn't get one huge chunk
      const sentences = splitIntoSentences(narrationText);
      sentences.forEach(sentence => {
        if (sentence.trim()) {
          segments.push({ text: sentence.trim(), voice: 'narrator', type: 'narration' });
        }
      });
    }

    // ── Dialogue ──
    // Detect speaker voice from the last sentence of narration before the quote
    const sentences      = splitIntoSentences(narrationBefore);
    const precedingSent  = sentences[sentences.length - 1] || '';
    const voice          = detectVoiceFromDescription(precedingSent);

    if (dialogue.trim()) {
      segments.push({ text: dialogue.trim(), voice, type: 'dialogue', description: precedingSent });
    }

    lastIndex = matchEnd;
  }

  // ── Remaining narration after last quote ──
  const tail = normalised.slice(lastIndex).trim();
  if (tail) {
    splitIntoSentences(tail).forEach(sentence => {
      if (sentence.trim()) {
        segments.push({ text: sentence.trim(), voice: 'narrator', type: 'narration' });
      }
    });
  }

  // ── Fallback: no quotes found at all — split into sentences ──
  if (segments.length === 0) {
    splitIntoSentences(normalised).forEach(sentence => {
      if (sentence.trim()) {
        segments.push({ text: sentence.trim(), voice: 'narrator', type: 'narration' });
      }
    });
  }

  return segments;
}