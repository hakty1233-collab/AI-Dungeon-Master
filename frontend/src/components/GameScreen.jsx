// frontend/src/components/GameScreen.jsx - WITH QUEST SYSTEM
import { useState, useEffect, useRef } from "react";
import { useCampaignStore } from "../state/campaignStore";
import { playTurn } from "../services/api";
import { generateVoice } from "../services/voiceApi";
import { generateSoundEffects } from "../services/soundEffectsApi";
import { parseNarrative } from "../utils/narrativeParser";
import { autoSave } from "../services/saveLoadService";
import { processXPFromNarration, awardXPToParty } from "../utils/xpSystem";
import { detectScene } from "../utils/musicSceneDetection";
import { detectLootInNarration, addItemToInventory } from "../utils/inventorySystem";
import { detectQuestEvents } from "../utils/questSystem"; // ⭐ NEW
import ChatLog from "./ChatLog";
import DiceRoller from "./DiceRoller";
import SaveLoadModal from "./SaveLoadModal";
import CharacterSheet from "./CharacterSheet";
import LevelUpNotification from "./LevelUpNotification";
import XPNotification from "./XPNotification";
import CombatTracker from "./CombatTracker";
import StartCombatModal from "./StartCombatModal";
import MusicSystem from "./MusicSystem";
import InventoryPanel from "./InventoryPanel";
import QuestJournal from "./QuestJournal"; // ⭐ NEW

/* ============================
   Combat Detection Helper
   ============================ */
function detectCombatInNarration(narration) {
  if (!narration) return null;
  
  if (narration.includes('**COMBAT_START**')) {
    return { type: 'start', marker: '**COMBAT_START**' };
  }
  
  if (narration.includes('**COMBAT_END**')) {
    return { type: 'end', marker: '**COMBAT_END**' };
  }
  
  const lowerText = narration.toLowerCase();
  const combatStartKeywords = [
    'attacks you', 'draws their weapon', 'charges at you', 
    'initiative', 'roll for initiative', 'combat begins',
    'enemies appear', 'ambush', 'surprise attack'
  ];
  
  const hasCombatStart = combatStartKeywords.some(kw => lowerText.includes(kw));
  
  if (hasCombatStart) {
    return { type: 'start', marker: null };
  }
  
  return null;
}

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
  const [showInventory, setShowInventory] = useState(false);
  const [activeCharacterInventory, setActiveCharacterInventory] = useState(null);
  const [lastDiceRoll, setLastDiceRoll] = useState(null);
  const [showQuestJournal, setShowQuestJournal] = useState(false); // ⭐ NEW
  
  // Refs
  const audioRef = useRef(null);
  const audioQueue = useRef([]);
  const isPlaying = useRef(false);
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const musicSystemRef = useRef(null);

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
  
  // ⭐ NEW: Quest state
  const quests = useCampaignStore((state) => state.quests || []);
  const addQuest = useCampaignStore((state) => state.addQuest);
  const completeQuestById = useCampaignStore((state) => state.completeQuestById);
  const updateQuest = useCampaignStore((state) => state.updateQuest);

  useEffect(() => {
    // Speech recognition disabled
  }, [micListening]);

  const playAudioQueue = () => {
    if (isPlaying.current || audioQueue.current.length === 0) return;
    isPlaying.current = true;
    const audioItem = audioQueue.current.shift();
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = audioItem.audio;
    audioRef.current.volume = audioItem.volume || 1.0;
    audioRef.current.onended = () => {
      isPlaying.current = false;
      playAudioQueue();
    };
    audioRef.current.onerror = () => {
      isPlaying.current = false;
      playAudioQueue();
    };
    audioRef.current.play().catch(() => {
      isPlaying.current = false;
      playAudioQueue();
    });
  };

  const playBackgroundSound = (audioData, category) => {
    try {
      const audio = new Audio(audioData);
      audio.volume = 0.3;
      audio.loop = false;
      audio.play().catch(() => {});
    } catch (err) {}
  };

  const playSoundEffects = async (text) => {
    if (!soundEffectsEnabled) return;
    try {
      const soundEffects = await generateSoundEffects(text);
      soundEffects.forEach(sfx => playBackgroundSound(sfx.audio, sfx.category));
    } catch (err) {}
  };

  const speakWithElevenLabs = async (text, voice = "narrator") => {
    if (!voiceMode) return;
    try {
      setIsGeneratingVoice(true);
      const cleanText = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/#{1,6}\s/g, "");
      const audioData = await generateVoice({ text: cleanText, voice });
      audioQueue.current.push({ audio: audioData, type: `narration_${voice}`, volume: 1.0 });
      if (!isPlaying.current) playAudioQueue();
      setIsGeneratingVoice(false);
    } catch (err) {
      setIsGeneratingVoice(false);
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  const speakAIResponse = async (aiResponse) => {
    if (!voiceMode) return;
    const fullText = typeof aiResponse === 'string' ? aiResponse : Array.isArray(aiResponse) ? aiResponse.map(e => e.text).join(' ') : '';
    if (soundEffectsEnabled && fullText) playSoundEffects(fullText);
    if (Array.isArray(aiResponse)) {
      for (const entry of aiResponse) {
        const voice = entry.description?.toLowerCase().includes("dark") ? "dark" : entry.description?.toLowerCase().includes("old") ? "old_wise" : entry.description?.toLowerCase().includes("gruff") ? "gruff" : "narrator";
        await speakWithElevenLabs(entry.text, voice);
      }
      return;
    }
    if (typeof aiResponse === 'string' && aiResponse.trim()) {
      const segments = parseNarrative(aiResponse);
      for (const segment of segments) {
        await speakWithElevenLabs(segment.text, segment.voice);
      }
    }
  };

  const handleDiceRoll = ({ sides, result }) => {
    console.log("🎲 Rolled d" + sides + ":", result);
    setLastDiceRoll({ sides, result, timestamp: Date.now() });
    addDiceRoll({ sides, result });
  };

  const handleOpenInventory = (character) => {
    setActiveCharacterInventory(character);
    setShowInventory(true);
  };

  const handleUpdateCharacterInventory = (updatedChar) => {
    const updatedParty = party.map(c => c.name === updatedChar.name ? updatedChar : c);
    updateParty(updatedParty);
    setActiveCharacterInventory(updatedChar);
  };

  const handleUpdateInventory = (newInventory) => {
    if (activeCharacterInventory) {
      const updatedChar = { ...activeCharacterInventory, inventory: newInventory };
      handleUpdateCharacterInventory(updatedChar);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    let enhancedMessage = input;
    
    // Include dice roll if recent (within 30 seconds)
    if (lastDiceRoll && (Date.now() - lastDiceRoll.timestamp) < 30000) {
      enhancedMessage = `${input} [Player rolled d${lastDiceRoll.sides}: ${lastDiceRoll.result}]`;
      console.log("🎲 Including dice roll:", lastDiceRoll);
      setLastDiceRoll(null);
    }

    try {
      const dmResponse = await playTurn({ message: enhancedMessage, campaign, party });
      updateFromDM(dmResponse);

      if (dmResponse?.aiResponse && party.length > 0) {
        // XP Detection
        const xpResult = processXPFromNarration(dmResponse.aiResponse, party);
        if (xpResult) {
          updateParty(xpResult.partyUpdates);
          setXPNotification({ xpGained: xpResult.totalXP, reason: xpResult.message });
          if (xpResult.levelUps.length > 0) {
            setTimeout(() => setLevelUpData(xpResult.levelUps), 3500);
          }
        }

        // Loot Detection
        const foundLoot = detectLootInNarration(dmResponse.aiResponse);
        if (foundLoot.length > 0) {
          const updatedParty = party.map((char, index) => {
            if (index === 0) {
              let newInventory = char.inventory || [];
              foundLoot.forEach(item => {
                newInventory = addItemToInventory(newInventory, item);
              });
              return { ...char, inventory: newInventory };
            }
            return char;
          });
          updateParty(updatedParty);
          const itemNames = foundLoot.map(i => i.name).join(', ');
          setTimeout(() => alert(`📦 Found: ${itemNames}!`), 1000);
        }

        // ⭐ NEW: Quest Detection
        const questEvents = detectQuestEvents(dmResponse.aiResponse);
        if (questEvents.length > 0) {
          console.log("📜 Quest events detected:", questEvents);
          
          questEvents.forEach(event => {
            if (event.type === 'quest_started' && event.quest) {
              addQuest(event.quest);
              setTimeout(() => {
                alert(`📜 New Quest: ${event.quest.title}!\n\n${event.quest.description}`);
              }, 1000);
            } else if (event.type === 'quest_completed') {
              // Try to match with active quests
              const activeQuest = quests.find(q => q.status === 'active');
              if (activeQuest) {
                completeQuestById(activeQuest.id);
                
                // Award quest rewards
                if (activeQuest.rewards.xp > 0) {
                  const xpResult = awardXPToParty(party, activeQuest.rewards.xp, `Quest: ${activeQuest.title}`);
                  updateParty(xpResult.partyUpdates);
                  setXPNotification({ 
                    xpGained: activeQuest.rewards.xp, 
                    reason: `Quest Complete: ${activeQuest.title}` 
                  });
                  if (xpResult.levelUps.length > 0) {
                    setTimeout(() => setLevelUpData(xpResult.levelUps), 3500);
                  }
                }
                
                setTimeout(() => {
                  alert(`✓ Quest Completed: ${activeQuest.title}!\n\nRewards:\n• ${activeQuest.rewards.xp} XP\n• ${activeQuest.rewards.gold} Gold`);
                }, 1500);
              }
            } else if (event.type === 'quest_updated') {
              console.log("📝 Quest progress updated");
            } else if (event.type === 'quest_failed') {
              const activeQuest = quests.find(q => q.status === 'active');
              if (activeQuest) {
                updateQuest(activeQuest.id, { 
                  status: 'failed',
                  completedAt: new Date().toISOString()
                });
                setTimeout(() => alert(`✗ Quest Failed: ${activeQuest.title}`), 1000);
              }
            }
          });
        }

        // Combat Detection
        const combatDetection = detectCombatInNarration(dmResponse.aiResponse);
        if (combatDetection) {
          console.log("⚔️ Combat detected:", combatDetection.type);
          if (combatDetection.type === 'start' && !combat?.isActive) {
            setTimeout(() => {
              alert("⚔️ Combat begins! Select your enemies.");
              setShowStartCombat(true);
            }, 1500);
          } else if (combatDetection.type === 'end' && combat?.isActive) {
            setTimeout(() => {
              handleEndCombat({ result: 'victory', message: 'Victory! All enemies defeated.', xpReward: 100 });
            }, 1000);
          }
        }
      }

      autoSave(dmResponse.campaignState, party);

      if (dmResponse?.aiResponse) {
        await speakAIResponse(dmResponse.aiResponse);
        if (musicSystemRef.current) {
          const scene = detectScene(dmResponse.aiResponse, combat?.isActive || false);
          if (scene) musicSystemRef.current.playTrack(scene.track);
        }
      }

      setInput("");
    } catch (err) {
      console.error("❌ Turn error:", err);
    }
  };

  const handleLoadCampaign = (loadedCampaign, loadedParty) => {
    setCampaign({ ...loadedCampaign, party: loadedParty });
    alert("Campaign loaded successfully!");
  };

  const handleCharacterUpdate = (updatedCharacter) => {
    const updatedParty = party.map(char => char.name === updatedCharacter.name ? updatedCharacter : char);
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
    if (musicSystemRef.current) musicSystemRef.current.playTrack('combat_easy');
  };

  const handleUpdateCombat = (updatedCombat) => setCombat(updatedCombat);

  const handleEndCombat = (result) => {
    if (musicSystemRef.current) {
      if (result.result === 'victory') {
        musicSystemRef.current.playTrack('victory');
        setTimeout(() => {
          if (musicSystemRef.current) musicSystemRef.current.playTrack('peaceful_village');
        }, 8000);
      } else if (result.result === 'defeat') {
        musicSystemRef.current.playTrack('defeat');
      }
    }
    
    if (result.result === 'victory' && result.xpReward) {
      const xpResult = awardXPToParty(party, result.xpReward, 'Combat Victory');
      updateParty(xpResult.partyUpdates);
      setXPNotification({ xpGained: result.xpReward, reason: 'Combat Victory!' });
      if (xpResult.levelUps.length > 0) {
        setTimeout(() => setLevelUpData(xpResult.levelUps), 3500);
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

  // ⭐ NEW: Count active quests for button badge
  const activeQuestCount = quests.filter(q => q.status === 'active').length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      <div className="container">
        <div className="card mb-lg" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>{campaign.theme} Adventure</h2>
              <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '16px' }}>
                Difficulty: {campaign.difficulty}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {/* ⭐ NEW: Quest Journal Button */}
              <button 
                onClick={() => setShowQuestJournal(true)} 
                className="btn btn-info"
                style={{ position: 'relative' }}
              >
                📖 Quests
                {activeQuestCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#ffd700',
                    color: '#000',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '2px solid #1a1a1a'
                  }}>
                    {activeQuestCount}
                  </span>
                )}
              </button>
              <button onClick={() => setShowStartCombat(true)} className="btn btn-danger">⚔️ Combat</button>
              <button onClick={() => setShowSaveModal(true)} className="btn btn-success">💾 Save</button>
              <button onClick={() => setShowLoadModal(true)} className="btn btn-info">📂 Load</button>
            </div>
          </div>
        </div>

        <div className="card mb-lg">
          <h4 style={{ margin: '0 0 15px 0' }}>🎵 Audio Settings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={voiceMode} onChange={toggleVoice} />
              <span>🎙️ Voice Narration {voiceMode ? "ON" : "OFF"}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={soundEffectsEnabled} onChange={toggleSoundEffects} />
              <span>🔊 Sound Effects {soundEffectsEnabled ? "ON" : "OFF"}</span>
            </label>
            {isGeneratingVoice && <div style={{ marginTop: '5px', color: '#888', fontSize: '14px' }}>⏳ Generating audio...</div>}
          </div>
        </div>

        <div className="mb-lg">
          <h3 style={{ marginBottom: '15px' }}>👥 Your Party</h3>
          <div className="grid grid-auto">
            {party.map((c, i) => {
              const hpPercent = (c.hp / c.maxHp) * 100;
              const hpColor = hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#ff9800' : '#f44336';
              return (
                <div key={i} className="card card-hover" onClick={() => handleViewCharacter(c)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{c.name}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>Lvl {c.level} {c.race} {c.class}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={(e) => { e.stopPropagation(); handleViewCharacter(c); }} className="btn btn-success btn-sm">📋 Sheet</button>
                      <button onClick={(e) => { e.stopPropagation(); handleOpenInventory(c); }} className="btn btn-info btn-sm">🎒 Inventory</button>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>HP: {c.hp} / {c.maxHp}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${hpPercent}%`, backgroundColor: hpColor }} />
                    </div>
                  </div>
                  {c.xp !== undefined && <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>XP: {c.xp}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <DiceRoller onRoll={handleDiceRoll} />
        </div>

        <div className="card mb-lg">
          <h3 style={{ margin: '0 0 15px 0' }}>📜 Adventure Log</h3>
          <ChatLog history={campaign.history} />
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="What do you do?" className="input" disabled={isGeneratingVoice} style={{ flex: 1 }} />
            <button type="submit" disabled={isGeneratingVoice} className="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>

      {/* Existing Modals */}
      {combat && combat.isActive && <CombatTracker combat={combat} onUpdate={handleUpdateCombat} onEnd={handleEndCombat} />}
      {showStartCombat && <StartCombatModal party={party} onStart={handleStartCombat} onClose={() => setShowStartCombat(false)} />}
      {levelUpData && <LevelUpNotification levelUps={levelUpData} onClose={() => setLevelUpData(null)} />}
      {xpNotification && <XPNotification xpGained={xpNotification.xpGained} reason={xpNotification.reason} onComplete={() => setXPNotification(null)} />}
      {showCharacterSheet && selectedCharacter && <CharacterSheet character={selectedCharacter} onUpdate={handleCharacterUpdate} onClose={() => { setShowCharacterSheet(false); setSelectedCharacter(null); }} />}
      {showInventory && activeCharacterInventory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '20px', overflow: 'auto' }}>
          <div style={{ maxWidth: '900px', width: '100%', position: 'relative' }}>
            <button onClick={() => setShowInventory(false)} style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer', zIndex: 1, boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>✕</button>
            <InventoryPanel character={activeCharacterInventory} inventory={activeCharacterInventory.inventory || []} onUpdateCharacter={handleUpdateCharacterInventory} onUpdateInventory={handleUpdateInventory} />
          </div>
        </div>
      )}
      
      {/* ⭐ NEW: Quest Journal Modal */}
      {showQuestJournal && (
        <QuestJournal
          quests={quests}
          onUpdateQuest={updateQuest}
          onCompleteQuest={completeQuestById}
          onClose={() => setShowQuestJournal(false)}
        />
      )}
      
      <SaveLoadModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} mode="save" campaign={campaign} party={party} onLoad={handleLoadCampaign} />
      <SaveLoadModal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} mode="load" campaign={campaign} party={party} onLoad={handleLoadCampaign} />
      <MusicSystem ref={musicSystemRef} />
    </div>
  );
}