import { useState, useEffect, useRef } from "react";
import { useCampaignStore } from "../state/campaignStore";
import { playTurn } from "../services/api";
import { generateVoice } from "../services/voiceApi";
import { generateSoundEffects } from "../services/soundEffectsApi";
import { parseNarrative } from "../utils/narrativeParser";
import { autoSave } from "../services/saveLoadService";
import { addExperience } from "../utils/characterSystem";
import ChatLog from "./ChatLog";
import DiceRoller from "./DiceRoller";
import SaveLoadModal from "./SaveLoadModal";
import CharacterSheet from "./CharacterSheet";

export default function GameScreen() {
  const [input, setInput] = useState("");
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const audioRef = useRef(null);
  const audioQueue = useRef([]);
  const isPlaying = useRef(false);
  const recognitionRef = useRef(null); // Store recognition instance
  const silenceTimeoutRef = useRef(null);

  const campaign = useCampaignStore((state) => state.campaign);
  const party = useCampaignStore((state) => state.party);
  const updateFromDM = useCampaignStore((state) => state.updateFromDM);
  const setCampaign = useCampaignStore((state) => state.setCampaign);
  const voiceMode = useCampaignStore((state) => state.voiceMode);
  const soundEffectsEnabled = useCampaignStore((state) => state.soundEffectsEnabled || false);
  const micListening = useCampaignStore((state) => state.micListening);
  const toggleMic = useCampaignStore((state) => state.toggleMic);
  const addDiceRoll = useCampaignStore((state) => state.addDiceRoll);
  const toggleVoice = useCampaignStore((state) => state.toggleVoice);
  const toggleSoundEffects = useCampaignStore((state) => state.toggleSoundEffects || (() => {}));

  /* ============================
     Speech Recognition
     ============================ */
  useEffect(() => {
    if (!micListening) {
      console.log("🔇 Mic is off, cleaning up if needed");
      // Stop recognition if it's running
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Recognition already stopped");
        }
        recognitionRef.current = null;
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      return;
    }

    console.log("🎤 Mic listening state changed to: true");

    const startRecognition = async () => {
      // Request mic permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("✅ Microphone permission granted!");
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error("❌ Microphone permission denied:", err);
        alert("Please allow microphone access when prompted by your browser.");
        toggleMic();
        return;
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.error("❌ Speech recognition not supported");
        alert("Speech recognition is not supported in this browser. Try Chrome or Edge.");
        toggleMic();
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        
        recognition.continuous = true;
        recognition.lang = "en-US";
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        let finalTranscript = '';

        recognition.onstart = () => {
          console.log("✅ Microphone ACTUALLY started listening!");
          finalTranscript = '';
        };

        recognition.onaudiostart = () => {
          console.log("🔊 Audio capture started");
        };

        recognition.onsoundstart = () => {
          console.log("🔊 Sound detected!");
        };

        recognition.onspeechstart = () => {
          console.log("🗣️ Speech started!");
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        };

        recognition.onresult = (event) => {
          console.log("📝 Got result!");
          
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              console.log(`✅ Final: "${transcript}"`);
              finalTranscript += transcript + ' ';
            } else {
              console.log(`⏳ Interim: "${transcript}"`);
              interimTranscript += transcript;
            }
          }
          
          setInput((finalTranscript + interimTranscript).trim());
        };

        recognition.onspeechend = () => {
          console.log("🛑 Speech ended (will continue listening)");
        };

        recognition.onerror = (err) => {
          console.error("❌ Recognition error:", err.error);
          
          if (err.error === 'not-allowed') {
            alert("Microphone blocked! Check browser settings.");
          } else if (err.error === 'no-speech') {
            console.log("⚠️ No speech - continuing...");
          }
        };

        recognition.onend = () => {
          console.log("🎤 Recognition ended");
          
          // Don't auto-restart - just notify user
          console.log("Click the STOP button to turn off the microphone");
        };

        console.log("🎤 Starting speech recognition NOW...");
        recognition.start();
        
      } catch (err) {
        console.error("❌ Failed to create recognition:", err);
        alert("Failed to start: " + err.message);
        toggleMic();
      }
    };

    startRecognition();
  }, [micListening]); // Removed toggleMic from dependencies

  /* ============================
     Audio Queue System
     ============================ */
  const playAudioQueue = () => {
    if (isPlaying.current || audioQueue.current.length === 0) return;

    isPlaying.current = true;
    const audioItem = audioQueue.current.shift();

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = audioItem.audio;
    audioRef.current.volume = audioItem.volume || 1.0;
    
    audioRef.current.onended = () => {
      console.log(`✅ Finished playing ${audioItem.type}`);
      isPlaying.current = false;
      playAudioQueue(); // Play next in queue
    };

    audioRef.current.onerror = (err) => {
      console.error("❌ Audio playback error:", err);
      isPlaying.current = false;
      playAudioQueue();
    };

    console.log(`🔊 Playing ${audioItem.type}...`);
    audioRef.current.play().catch(err => {
      console.error("❌ Failed to play audio:", err);
      isPlaying.current = false;
      playAudioQueue();
    });
  };

  /* ============================
     Play Background Sound Effects (simultaneous with narration)
     ============================ */
  const playBackgroundSound = (audioData, category) => {
    try {
      const audio = new Audio(audioData);
      audio.volume = 0.3; // Quiet background sound
      audio.loop = false;
      
      console.log(`🎵 Playing background sound: ${category}`);
      
      audio.play().catch(err => {
        console.error("❌ Failed to play background sound:", err);
      });
      
      // Auto-cleanup after it finishes
      audio.onended = () => {
        console.log(`✅ Background sound finished: ${category}`);
      };
    } catch (err) {
      console.error("❌ Background sound error:", err);
    }
  };

  /* ============================
     Generate and Play Sound Effects
     ============================ */
  const playSoundEffects = async (text) => {
    if (!soundEffectsEnabled) {
      console.log("🔇 Sound effects disabled by user");
      return;
    }

    try {
      console.log("🔊 Requesting sound effects for text...");
      const soundEffects = await generateSoundEffects(text);
      
      console.log(`📦 Received ${soundEffects.length} sound effects from backend`);
      
      if (soundEffects.length === 0) {
        console.log("🔇 No sound effects generated for this text");
        return;
      }

      // Play sound effects immediately in the background (not queued)
      soundEffects.forEach(sfx => {
        console.log(`🎵 Playing background sound: ${sfx.category}`);
        playBackgroundSound(sfx.audio, sfx.category);
      });

    } catch (err) {
      console.error("❌ Failed to play sound effects:", err);
    }
  };

  /* ============================
     ElevenLabs Voice Generation
     ============================ */
  const speakWithElevenLabs = async (text, voice = "narrator") => {
    if (!voiceMode) {
      console.log("🔇 Voice mode is OFF - skipping narration");
      return;
    }

    try {
      setIsGeneratingVoice(true);
      console.log(`🎙️ Generating ${voice} voice with ElevenLabs...`);
      
      // Clean text of markdown
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/#{1,6}\s/g, "");

      // Generate narration
      const audioData = await generateVoice({ text: cleanText, voice });
      
      // Add narration to queue
      audioQueue.current.push({
        audio: audioData,
        type: `narration_${voice}`,
        volume: 1.0
      });

      // If nothing is playing, start the queue
      if (!isPlaying.current) {
        playAudioQueue();
      }
      
      setIsGeneratingVoice(false);
    } catch (err) {
      console.error("❌ Failed to generate voice:", err);
      setIsGeneratingVoice(false);
      // Fallback to browser TTS
      console.log("⚠️ Falling back to browser TTS");
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  const speakAIResponse = async (aiResponse) => {
    console.log("🎙️ Voice mode:", voiceMode);
    console.log("📝 AI Response:", aiResponse);

    if (!voiceMode) {
      console.log("🔇 Voice mode is OFF - skipping narration");
      return;
    }

    // Parse the entire response for dialogue first
    const fullText = typeof aiResponse === 'string' ? aiResponse : 
                     Array.isArray(aiResponse) ? aiResponse.map(e => e.text).join(' ') : '';
    
    // Generate sound effects ONCE for the entire narration (plays in background)
    if (soundEffectsEnabled && fullText) {
      playSoundEffects(fullText);
    }

    // Handle array of structured responses
    if (Array.isArray(aiResponse)) {
      console.log("📚 Speaking array of", aiResponse.length, "entries");
      for (const entry of aiResponse) {
        const voice = entry.description?.toLowerCase().includes("dark") ? "dark" :
                     entry.description?.toLowerCase().includes("old") ? "old_wise" :
                     entry.description?.toLowerCase().includes("gruff") ? "gruff" :
                     "narrator";
        await speakWithElevenLabs(entry.text, voice);
      }
      return;
    }

    // Handle plain text - parse for dialogue
    if (typeof aiResponse === 'string' && aiResponse.trim()) {
      console.log("📖 Parsing narrative for dialogue...");
      const segments = parseNarrative(aiResponse);
      console.log(`🎭 Found ${segments.length} segments`);
      
      // Speak each segment with appropriate voice
      for (const segment of segments) {
        console.log(`  🗣️ ${segment.type} (${segment.voice}): "${segment.text.substring(0, 40)}..."`);
        await speakWithElevenLabs(segment.text, segment.voice);
      }
      return;
    }

    console.warn("⚠️ Unknown AI response format");
  };

  /* ============================
     Dice handler
     ============================ */
  const handleDiceRoll = ({ sides, result }) => {
    console.log("🎲 Rolled d" + sides + ":", result);
    addDiceRoll({ sides, result });
  };

  /* ============================
     Submit player turn
     ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log("🎮 Submitting player action:", input);

    try {
      const dmResponse = await playTurn({ message: input, campaign, party });
      console.log("📨 DM Response received:", dmResponse);
      
      updateFromDM(dmResponse);

      // Auto-save after each turn
      autoSave(dmResponse.campaignState, party);

      // Trigger ElevenLabs narration with sound effects
      if (dmResponse?.aiResponse) {
        console.log("🎤 Attempting to speak response...");
        await speakAIResponse(dmResponse.aiResponse);
      } else {
        console.warn("⚠️ No aiResponse in DM response");
      }

      setInput("");
    } catch (err) {
      console.error("❌ Turn error:", err);
    }
  };

  const handleLoadCampaign = (loadedCampaign, loadedParty) => {
    setCampaign({
      ...loadedCampaign,
      party: loadedParty
    });
    alert("Campaign loaded successfully!");
  };

  const handleCharacterUpdate = (updatedCharacter) => {
    const updatedParty = party.map(char =>
      char.name === updatedCharacter.name ? updatedCharacter : char
    );
    updateParty(updatedParty);
    setSelectedCharacter(updatedCharacter);
  };

  const handleViewCharacter = (character) => {
    setSelectedCharacter(character);
    setShowCharacterSheet(true);
  };

  if (!campaign) return <p>No campaign started.</p>;

  /* ============================
     UI
     ============================ */
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0 }}>{campaign.theme} Adventure</h2>
          <p style={{ margin: "5px 0" }}>Difficulty: {campaign.difficulty}</p>
        </div>
        
        {/* Save/Load Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowSaveModal(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px"
            }}
          >
            💾 Save
          </button>
          <button
            onClick={() => setShowLoadModal(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px"
            }}
          >
            📂 Load
          </button>
        </div>
      </div>

      {/* Audio Controls */}
      <div style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <h4 style={{ marginTop: 0 }}>Audio Settings</h4>
        
        <label style={{ display: "block", marginBottom: "5px" }}>
          <input 
            type="checkbox" 
            checked={voiceMode} 
            onChange={toggleVoice}
          />
          {" "}🎙️ Voice Narration {voiceMode ? "ON" : "OFF"}
        </label>

        <label style={{ display: "block" }}>
          <input 
            type="checkbox" 
            checked={soundEffectsEnabled} 
            onChange={toggleSoundEffects}
          />
          {" "}🔊 Sound Effects {soundEffectsEnabled ? "ON" : "OFF"}
        </label>

        {isGeneratingVoice && (
          <div style={{ marginTop: "5px", color: "#888" }}>
            ⏳ Generating audio...
          </div>
        )}
      </div>

      <h3>Party</h3>
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}>
        {party.map((c, i) => (
          <div
            key={i}
            onClick={() => handleViewCharacter(c)}
            style={{
              backgroundColor: '#2a2a2a',
              padding: '15px',
              borderRadius: '10px',
              border: '2px solid #444',
              cursor: 'pointer',
              minWidth: '200px',
              transition: 'all 0.2s',
              ':hover': {
                borderColor: '#ffd700'
              }
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ffd700'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#444'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#ffd700' }}>{c.name}</h4>
                <p style={{ margin: '3px 0', fontSize: '12px', color: '#aaa' }}>
                  Lvl {c.level} {c.race} {c.class}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewCharacter(c);
                }}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📋 Sheet
              </button>
            </div>
            
            {/* HP Bar */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '12px', marginBottom: '3px', color: '#aaa' }}>
                HP: {c.hp} / {c.maxHp}
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#1a1a1a',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(c.hp / c.maxHp) * 100}%`,
                  height: '100%',
                  backgroundColor: c.hp > c.maxHp * 0.5 ? '#4CAF50' : 
                                  c.hp > c.maxHp * 0.25 ? '#ff9800' : '#f44336',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* XP Progress */}
            {c.xp !== undefined && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>
                  XP: {c.xp}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <DiceRoller onRoll={handleDiceRoll} />

      <h3>Adventure Log</h3>
      <ChatLog history={campaign.history} />

      <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you do?"
          style={{ 
            width: "300px", 
            marginRight: "5px"
          }}
          disabled={isGeneratingVoice}
        />
        <button type="submit" disabled={isGeneratingVoice}>
          Submit
        </button>
        {/* Speech input is optional - typing works great! */}
        <button 
          type="button" 
          onClick={toggleMic} 
          style={{ 
            marginLeft: "5px",
            backgroundColor: micListening ? "#ff4444" : "#666",
            color: "white",
            opacity: 0.5,
            cursor: "not-allowed"
          }}
          disabled={true}
          title="Speech input is currently disabled - just type your actions!"
        >
          🎤 Voice Input (Disabled)
        </button>
      </form>

      {/* Character Sheet Modal */}
      {showCharacterSheet && selectedCharacter && (
        <CharacterSheet
          character={selectedCharacter}
          onUpdate={handleCharacterUpdate}
          onClose={() => {
            setShowCharacterSheet(false);
            setSelectedCharacter(null);
          }}
        />
      )}

      {/* Save/Load Modals */}
      <SaveLoadModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        mode="save"
        campaign={campaign}
        party={party}
        onLoad={handleLoadCampaign}
      />

      <SaveLoadModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        mode="load"
        campaign={campaign}
        party={party}
        onLoad={handleLoadCampaign}
      />
    </div>
  );
}