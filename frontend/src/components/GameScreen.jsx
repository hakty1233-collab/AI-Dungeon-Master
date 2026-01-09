import { useState, useEffect, useRef } from "react";
import { useCampaignStore } from "../state/campaignStore";
import { playTurn } from "../services/api";
import ChatLog from "./ChatLog";
import DiceRoller from "./DiceRoller";

export default function GameScreen() {
  const [input, setInput] = useState("");
  const voicesRef = useRef([]);
  const speechQueue = useRef([]);
  const isSpeaking = useRef(false);

  const {
    campaign,
    party,
    updateFromDM,
    voiceMode,
    micListening,
    toggleMic,
    addDiceRoll,
  } = useCampaignStore();

  /* ============================
     Load available voices
     ============================ */
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  /* ============================
     Speech Recognition
     ============================ */
  useEffect(() => {
    if (!micListening) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition || typeof SpeechRecognition !== "function") {
      console.warn("Speech recognition not supported.");
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      if (!event.results || !event.results[0]) return;
      setInput(event.results[0][0].transcript);
    };

    recognition.onerror = (err) => console.error("Speech recognition error:", err);

    recognition.start();
    return () => recognition.stop();
  }, [micListening]);

  /* ============================
     Generate voice from description
     ============================ */
  const getVoiceStyle = (description = "") => {
    const desc = description.toLowerCase();
    let rate = 1.0;
    let pitch = 1.0;

    // Age / tone
    if (desc.includes("old") || desc.includes("ancient")) pitch = 0.6;
    if (desc.includes("young") || desc.includes("child")) pitch = 1.3;

    // Mood / style
    if (desc.includes("raspy")) pitch -= 0.1;
    if (desc.includes("gruff")) pitch -= 0.2;
    if (desc.includes("jolly") || desc.includes("cheerful")) pitch += 0.1;
    if (desc.includes("angry") || desc.includes("shout")) rate += 0.2;

    // Clamp values
    pitch = Math.min(Math.max(pitch, 0.5), 2.0);
    rate = Math.min(Math.max(rate, 0.5), 2.0);

    return { pitch, rate };
  };

  /* ============================
     Speak a single line
     ============================ */
  const speakLine = (text, description = "") => {
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
    const { rate, pitch } = getVoiceStyle(description);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Optional: pick a random voice for variety
    const availableVoices = voicesRef.current.filter(v => v.lang.includes("en"));
    if (availableVoices.length) {
      utterance.voice = availableVoices[Math.floor(Math.random() * availableVoices.length)];
    }

    // Queue the speech
    speechQueue.current.push(utterance);
    processSpeechQueue();
  };

  const processSpeechQueue = () => {
    if (isSpeaking.current || !speechQueue.current.length) return;
    isSpeaking.current = true;

    const utterance = speechQueue.current.shift();
    utterance.onend = () => {
      isSpeaking.current = false;
      processSpeechQueue();
    };
    speechSynthesis.speak(utterance);
  };

  /* ============================
     Speak AI response (structured)
     ============================ */
  const speakAIResponse = (aiResponse) => {
    if (!Array.isArray(aiResponse)) {
      speakLine(aiResponse);
      return;
    }
    aiResponse.forEach(entry => speakLine(entry.text, entry.description || ""));
  };

  /* ============================
     Dice handler
     ============================ */
  const handleDiceRoll = ({ sides, result }) => addDiceRoll({ sides, result });

  /* ============================
     Submit player turn
     ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const dmResponse = await playTurn({ message: input, campaign, party });
      updateFromDM(dmResponse);

      if (voiceMode && dmResponse?.aiResponse) speakAIResponse(dmResponse.aiResponse);

      setInput("");
    } catch (err) {
      console.error("Turn error:", err);
    }
  };

  if (!campaign) return <p>No campaign started.</p>;

  /* ============================
     UI
     ============================ */
  return (
    <div style={{ padding: "20px" }}>
      <h2>{campaign.theme} Adventure</h2>
      <p>Difficulty: {campaign.difficulty}</p>

      <h3>Party</h3>
      <ul>
        {party.map((c, i) => (
          <li key={i}>
            {c.name} — HP: {c.hp} — {c.status}
          </li>
        ))}
      </ul>

      <DiceRoller onRoll={handleDiceRoll} />

      <h3>Adventure Log</h3>
      <ChatLog history={campaign.history} />

      <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you do?"
          style={{ width: "300px", marginRight: "5px" }}
        />
        <button type="submit">Submit</button>
        <button type="button" onClick={toggleMic} style={{ marginLeft: "5px" }}>
          {micListening ? "Stop Listening" : "Speak"}
        </button>
      </form>
    </div>
  );
}
