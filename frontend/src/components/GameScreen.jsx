// frontend/src/components/GameScreen.jsx
import { useState, useEffect, useRef } from "react";
import { useCampaignStore } from "../state/campaignStore";
import { playTurn } from "../services/api";
import { generateVoice } from "../services/voiceApi";
import { generateSoundEffects } from "../services/soundEffectsApi";
import { parseNarrative } from "../utils/narrativeParser";
import { autoSave } from "../services/saveLoadService";
import { processXPFromNarration, awardXPToParty } from "../utils/xpSystem";
import ChatLog from "./ChatLog";
import DiceRoller from "./DiceRoller";
import SaveLoadModal from "./SaveLoadModal";
import CharacterSheet from "./CharacterSheet";
import LevelUpNotification from "./LevelUpNotification";
import XPNotification from "./XPNotification";
import CombatTracker from "./CombatTracker";
import StartCombatModal from "./StartCombatModal";

export default function GameScreen() {
  // Local state
  const [input, setInput] = useState("");
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [xpNotification, setXPNotification] = useState(null);
  const [combat, setCombat] = useState(null);
  const [showStartCombat, setShowStartCombat] = useState(false);
  
  // Refs
  const audioRef = useRef(null);
  const audioQueue = useRef([]);
  const isPlaying = useRef(false);
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  // Store state
  const campaign = useCampaignStore((state) => state.campaign);
  const party = useCampaignStore((state) => state.party);
  const updateFromDM = useCampaignStore((state) => state.updateFromDM);
  const setCampaign = useCampaignStore((state) => state.setCampaign);
  const updateParty = useCampaignStore((state) => state.updateParty);
  const voiceMode = useCampaignStore((state) => state.voiceMode);
  const soundEffectsEnabled = useCampaignStore((state) => state.soundEffectsEnabled || false);
  const micListening = useCampaignStore((state) => state.micListening);
  const toggleMic = useCampaignStore((state) => state.toggleMic);
  const addDiceRoll = useCampaignStore((state) => state.addDiceRoll);
  const toggleVoice = useCampaignStore((state) => state.toggleVoice);
  const toggleSoundEffects = useCampaignStore((state) => state.toggleSoundEffects || (() => {}));

  /* ============================
     Speech Recognition (Disabled)
     ============================ */
  useEffect(() => {
    // Speech recognition disabled
  }, [micListening]);

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
      playAudioQueue();
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
     Play Background Sound Effects
     ============================ */
  const playBackgroundSound = (audioData, category) => {
    try {
      const audio = new Audio(audioData);
      audio.volume = 0.3;
      audio.loop = false;
      
      console.log(`🎵 Playing background sound: ${category}`);
      
      audio.play().catch(err => {
        console.error("❌ Failed to play background sound:", err);
      });
      
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
      
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/#{1,6}\s/g, "");

      const audioData = await generateVoice({ text: cleanText, voice });
      
      audioQueue.current.push({
        audio: audioData,
        type: `narration_${voice}`,
        volume: 1.0
      });

      if (!isPlaying.current) {
        playAudioQueue();
      }
      
      setIsGeneratingVoice(false);
    } catch (err) {
      console.error("❌ Failed to generate voice:", err);
      setIsGeneratingVoice(false);
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

    const fullText = typeof aiResponse === 'string' ? aiResponse : 
                     Array.isArray(aiResponse) ? aiResponse.map(e => e.text).join(' ') : '';
    
    if (soundEffectsEnabled && fullText) {
      playSoundEffects(fullText);
    }

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

    if (typeof aiResponse === 'string' && aiResponse.trim()) {
      console.log("📖 Parsing narrative for dialogue...");
      const segments = parseNarrative(aiResponse);
      console.log(`🎭 Found ${segments.length} segments`);
      
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

      if (dmResponse?.aiResponse && party.length > 0) {
        const xpResult = processXPFromNarration(dmResponse.aiResponse, party);
        
        if (xpResult) {
          console.log("🎉 XP Awarded:", xpResult);
          
          updateParty(xpResult.partyUpdates);
          
          setXPNotification({
            xpGained: xpResult.totalXP,
            reason: xpResult.message
          });
          
          if (xpResult.levelUps.length > 0) {
            setTimeout(() => {
              setLevelUpData(xpResult.levelUps);
            }, 3500);
          }
        }
      }

      autoSave(dmResponse.campaignState, party);

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

  const handleStartCombat = (newCombat) => {
    setCombat(newCombat);
    setShowStartCombat(false);
    console.log("⚔️ Combat started!", newCombat);
  };

  const handleUpdateCombat = (updatedCombat) => {
    setCombat(updatedCombat);
  };

  const handleEndCombat = (result) => {
    console.log("Combat ended:", result);
    
    if (result.result === 'victory' && result.xpReward) {
      const xpResult = awardXPToParty(party, result.xpReward, 'Combat Victory');
      updateParty(xpResult.partyUpdates);
      
      setXPNotification({
        xpGained: result.xpReward,
        reason: 'Combat Victory!'
      });
      
      if (xpResult.levelUps.length > 0) {
        setTimeout(() => {
          setLevelUpData(xpResult.levelUps);
        }, 3500);
      }
    }
    
    setCombat(null);
    alert(result.message);
  };

  if (!campaign) return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <h1>No Campaign Started</h1>
      <p style={{ color: '#888', fontSize: '18px' }}>Please start a campaign from the setup screen.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      <div className="container">
        {/* Header */}
        <div className="card mb-lg" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>{campaign.theme} Adventure</h2>
              <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '16px' }}>
                Difficulty: {campaign.difficulty}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowStartCombat(true)} className="btn btn-danger">
                ⚔️ Combat
              </button>
              <button onClick={() => setShowSaveModal(true)} className="btn btn-success">
                💾 Save
              </button>
              <button onClick={() => setShowLoadModal(true)} className="btn btn-info">
                📂 Load
              </button>
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="card mb-lg">
          <h4 style={{ margin: '0 0 15px 0' }}>🎵 Audio Settings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={voiceMode} 
                onChange={toggleVoice}
              />
              <span>🎙️ Voice Narration {voiceMode ? "ON" : "OFF"}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={soundEffectsEnabled} 
                onChange={toggleSoundEffects}
              />
              <span>🔊 Sound Effects {soundEffectsEnabled ? "ON" : "OFF"}</span>
            </label>
            {isGeneratingVoice && (
              <div style={{ marginTop: '5px', color: '#888', fontSize: '14px' }}>
                ⏳ Generating audio...
              </div>
            )}
          </div>
        </div>

        {/* Party */}
        <div className="mb-lg">
          <h3 style={{ marginBottom: '15px' }}>👥 Your Party</h3>
          <div className="grid grid-auto">
            {party.map((c, i) => {
              const hpPercent = (c.hp / c.maxHp) * 100;
              const hpColor = hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#ff9800' : '#f44336';
              
              return (
                <div
                  key={i}
                  className="card card-hover"
                  onClick={() => handleViewCharacter(c)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{c.name}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>
                        Lvl {c.level} {c.race} {c.class}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewCharacter(c);
                      }}
                      className="btn btn-success btn-sm"
                    >
                      📋 Sheet
                    </button>
                  </div>
                  
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
                      HP: {c.hp} / {c.maxHp}
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${hpPercent}%`, backgroundColor: hpColor }}
                      />
                    </div>
                  </div>

                  {c.xp !== undefined && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                      XP: {c.xp}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <DiceRoller onRoll={handleDiceRoll} />
        </div>

        {/* Adventure Log */}
        <div className="card mb-lg">
          <h3 style={{ margin: '0 0 15px 0' }}>📜 Adventure Log</h3>
          <ChatLog history={campaign.history} />
        </div>

        {/* Input */}
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What do you do?"
              className="input"
              disabled={isGeneratingVoice}
              style={{ flex: 1 }}
            />
            <button 
              type="submit" 
              disabled={isGeneratingVoice} 
              className="btn btn-primary"
            >
              Submit
            </button>
            <button 
              type="button"
              className="btn btn-ghost"
              disabled={true}
              title="Speech input is currently disabled"
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              🎤 Voice
            </button>
          </form>
        </div>
      </div>

      {/* Combat Tracker */}
      {combat && combat.isActive && (
        <CombatTracker
          combat={combat}
          onUpdate={handleUpdateCombat}
          onEnd={handleEndCombat}
        />
      )}

      {/* Start Combat Modal */}
      {showStartCombat && (
        <StartCombatModal
          party={party}
          onStart={handleStartCombat}
          onClose={() => setShowStartCombat(false)}
        />
      )}

      {/* Level-Up Notification */}
      {levelUpData && (
        <LevelUpNotification
          levelUps={levelUpData}
          onClose={() => setLevelUpData(null)}
        />
      )}

      {/* XP Notification */}
      {xpNotification && (
        <XPNotification
          xpGained={xpNotification.xpGained}
          reason={xpNotification.reason}
          onComplete={() => setXPNotification(null)}
        />
      )}

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