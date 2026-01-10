// frontend/test-parser.js
// Run in browser console to test the parser

import { parseNarrative } from './src/utils/narrativeParser.js';

const testCases = [
  {
    name: "Gravelly voice example",
    text: "The figure's voice remains low and gravelly as it speaks, 'I am called Malakai, and I have been waiting for you, adventurer. I possess knowledge of the forest and its dangers, but it will not come cheaply.'"
  },
  {
    name: "Old wizard",
    text: "You enter a dusty library. An old wizard looks up from his tome and says, 'Ah, visitors! How delightful.' He stands slowly, his ancient voice crackling like dry parchment."
  },
  {
    name: "Young maiden",
    text: "A young maiden's cheerful voice calls out from the tavern, 'Welcome, weary travelers! Come rest by the fire!'"
  },
  {
    name: "Multiple speakers",
    text: "The gruff guard growls, 'State your business.' Behind him, a woman's voice whispers, 'Let them pass, they mean no harm.'"
  },
  {
    name: "Narration only",
    text: "You walk through the dark forest. The trees loom overhead, their branches blocking out the moonlight. An eerie silence fills the air."
  },
  {
    name: "Mixed narration and dialogue",
    text: "You approach the castle gates. The wind howls through the battlements. A dark, sinister voice echoes from above, 'Who dares approach my domain?' Thunder rumbles in the distance."
  }
];

console.log("=== NARRATIVE PARSER TEST SUITE ===\n");

testCases.forEach((test, i) => {
  console.log(`\n📖 Test ${i + 1}: ${test.name}`);
  console.log("Input:", test.text);
  console.log("\nParsed segments:");
  
  const segments = parseNarrative(test.text);
  segments.forEach((seg, j) => {
    console.log(`  ${j + 1}. [${seg.type.toUpperCase()}] Voice: ${seg.voice}`);
    console.log(`     Text: "${seg.text}"`);
    if (seg.character) {
      console.log(`     Character: ${seg.character}`);
    }
  });
  
  console.log("---");
});

console.log("\n✅ All tests complete!");