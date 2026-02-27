// frontend/src/components/GameScreen.jsx - WITH QUEST SYSTEM, BESTIARY, SPELLS, STATUS EFFECTS, AND SHOP
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
import { detectQuestEvents } from "../utils/questSystem";
import { SPELLCASTING_CLASSES, isThirdCaster } from "../utils/spellSystem";
import { detectMerchantInNarration, createMerchant, MERCHANT_TYPES } from '../utils/merchantSystem';
import { 
  createStatusEffect, 
  applyStatusEffect, 
  STATUS_EFFECTS,
  DURATION_TYPES 
} from "../utils/statusEffectSystem";
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
import QuestJournal from "./QuestJournal";
import Bestiary from './Bestiary';
import SpellBook from './SpellBook';
import StatusEffectsPanel from './StatusEffectsPanel';
import ApplyStatusEffectModal from './ApplyStatusEffectModal';
import PatreonButton from "./PatreonButton";
import ShopModal from './ShopModal';

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
  if (hasCombatStart) return { type: 'start', marker: null };
  return null;
}

/* ============================
   Status Effect Detection
   ============================ */
function detectStatusEffectsInNarration(narration) {
  const lowerText = narration.toLowerCase();
  const detectedEffects = [];

  const effectKeywords = {
    [STATUS_EFFECTS.POISONED]: ['poisoned', 'poison', 'venom', 'toxic'],
    [STATUS_EFFECTS.PARALYZED]: ['paralyzed', 'paralysis', 'cannot move'],
    [STATUS_EFFECTS.STUNNED]: ['stunned', 'dazed', 'disoriented'],
    [STATUS_EFFECTS.FRIGHTENED]: ['frightened', 'terrified', 'scared', 'fear'],
    [STATUS_EFFECTS.CHARMED]: ['charmed', 'enchanted', 'beguiled'],
    [STATUS_EFFECTS.BLINDED]: ['blinded', 'blind', 'cannot see'],
    [STATUS_EFFECTS.PRONE]: ['knocked prone', 'falls prone', 'knocked down'],
    [STATUS_EFFECTS.RESTRAINED]: ['restrained', 'grappled', 'held', 'entangled'],
    [STATUS_EFFECTS.UNCONSCIOUS]: ['unconscious', 'knocked out', 'falls unconscious'],
    [STATUS_EFFECTS.BURNING]: ['on fire', 'burning', 'catches fire', 'ignites'],
    [STATUS_EFFECTS.BLEEDING]: ['bleeding', 'blood', 'wounded'],
    [STATUS_EFFECTS.BLESSED]: ['blessed', 'divine favor', 'bless'],
    [STATUS_EFFECTS.HASTED]: ['hasted', 'speed increased', 'quickened'],
    [STATUS_EFFECTS.SLOWED]: ['slowed', 'sluggish', 'speed reduced'],
  };

  Object.entries(effectKeywords).forEach(([effectType, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      console.log(`✨ Detected status effect: ${effectType}`);
      let duration = 1;
      let durationType = DURATION_TYPES.ROUNDS;
      if (effectType === STATUS_EFFECTS.BURNING || effectType === STATUS_EFFECTS.BLEEDING) {
        duration = 3;
      }
      detectedEffects.push({ type: effectType, duration, durationType, source: 'Combat', saveDC: null });
    }
  });

  return detectedEffects;
}

export default function GameScreen() {
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
  const [showQuestJournal, setShowQuestJournal] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [encounteredEnemies, setEncounteredEnemies] = useState([]);
  const [showSpellBook, setShowSpellBook] = useState(false);
  const [activeSpellcaster, setActiveSpellcaster] = useState(null);
  const [showApplyStatusEffect, setShowApplyStatusEffect] = useState(false);
  const [statusEffectTarget, setStatusEffectTarget] = useState(null);
  const [showShop, setShowShop] = useState(false);
  
  const audioRef = useRef(null);
  const audioQueue = useRef([]);
  const isPlaying = useRef(false);
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const musicSystemRef = useRef(null);

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
  const quests = useCampaignStore((state) => state.quests || []);
  const addQuest = useCampaignStore((state) => state.addQuest);
  const completeQuestById = useCampaignStore((state) => state.completeQuestById);
  const updateQuest = useCampaignStore((state) => state.updateQuest);
  const activeMerchant       = useCampaignStore((state) => state.activeMerchant);
  const setActiveMerchant    = useCampaignStore((state) => state.setActiveMerchant);
  const updateActiveMerchant = useCampaignStore((state) => state.updateActiveMerchant);
  const clearActiveMerchant  = useCampaignStore((state) => state.clearActiveMerchant);

  useEffect(() => {}, [micListening]);

  const playAudioQueue = () => {
    if (isPlaying.current || audioQueue.current.length === 0) return;
    isPlaying.current = true;
    const audioItem = audioQueue.current.shift();
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = audioItem.audio;
    audioRef.current.volume = audioItem.volume || 1.0;
    audioRef.current.onended = () => { isPlaying.current = false; playAudioQueue(); };
    audioRef.current.onerror = () => { isPlaying.current = false; playAudioQueue(); };
    audioRef.current.play().catch(() => { isPlaying.current = false; playAudioQueue(); });
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

  const handleOpenSpellBook = (character) => {
    setActiveSpellcaster(character);
    setShowSpellBook(true);
  };

  const handleUpdateSpellcaster = (updatedChar) => {
    const updatedParty = party.map(c => c.name === updatedChar.name ? updatedChar : c);
    updateParty(updatedParty);
    setActiveSpellcaster(updatedChar);
  };

  const handleOpenStatusEffects = (character) => {
    setStatusEffectTarget(character);
    setShowApplyStatusEffect(true);
  };

  const handleApplyStatusEffect = (updatedChar) => {
    const updatedParty = party.map(c => c.name === updatedChar.name ? updatedChar : c);
    updateParty(updatedParty);
    setShowApplyStatusEffect(false);
    setStatusEffectTarget(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    let enhancedMessage = input;
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
              foundLoot.forEach(item => { newInventory = addItemToInventory(newInventory, item); });
              return { ...char, inventory: newInventory };
            }
            return char;
          });
          updateParty(updatedParty);
          const itemNames = foundLoot.map(i => i.name).join(', ');
          setTimeout(() => alert(`📦 Found: ${itemNames}!`), 1000);
        }

        // Status Effect Detection
        const detectedEffects = detectStatusEffectsInNarration(dmResponse.aiResponse);
        if (detectedEffects.length > 0) {
          console.log("✨ Status effects detected:", detectedEffects);
          const updatedParty = party.map((char, index) => {
            if (index === 0) {
              let updatedChar = { ...char };
              detectedEffects.forEach(effectData => {
                const effect = createStatusEffect(effectData);
                if (effect) updatedChar = applyStatusEffect(updatedChar, effect);
              });
              return updatedChar;
            }
            return char;
          });
          updateParty(updatedParty);
          const effectNames = detectedEffects.map(e => {
            const effectDef = require('../utils/statusEffectSystem').STATUS_EFFECT_DEFINITIONS[e.type];
            return effectDef ? effectDef.name : e.type;
          }).join(', ');
          setTimeout(() => { alert(`✨ Status Effect Applied: ${effectNames}!`); }, 1500);
        }

        // Quest Detection
        const questEvents = detectQuestEvents(dmResponse.aiResponse);
        if (questEvents.length > 0) {
          console.log("📜 Quest events detected:", questEvents);
          questEvents.forEach(event => {
            if (event.type === 'quest_started' && event.quest) {
              addQuest(event.quest);
              setTimeout(() => { alert(`📜 New Quest: ${event.quest.title}!\n\n${event.quest.description}`); }, 1000);
            } else if (event.type === 'quest_completed') {
              const activeQuest = quests.find(q => q.status === 'active');
              if (activeQuest) {
                completeQuestById(activeQuest.id);
                if (activeQuest.rewards.xp > 0) {
                  const xpResult = awardXPToParty(party, activeQuest.rewards.xp, `Quest: ${activeQuest.title}`);
                  updateParty(xpResult.partyUpdates);
                  setXPNotification({ xpGained: activeQuest.rewards.xp, reason: `Quest Complete: ${activeQuest.title}` });
                  if (xpResult.levelUps.length > 0) {
                    setTimeout(() => setLevelUpData(xpResult.levelUps), 3500);
                  }
                }
                setTimeout(() => { alert(`✓ Quest Completed: ${activeQuest.title}!\n\nRewards:\n• ${activeQuest.rewards.xp} XP\n• ${activeQuest.rewards.gold} Gold`); }, 1500);
              }
            } else if (event.type === 'quest_updated') {
              console.log("📝 Quest progress updated");
            } else if (event.type === 'quest_failed') {
              const activeQuest = quests.find(q => q.status === 'active');
              if (activeQuest) {
                updateQuest(activeQuest.id, { status: 'failed', completedAt: new Date().toISOString() });
                setTimeout(() => alert(`✗ Quest Failed: ${activeQuest.title}`), 1000);
              }
            }
          });
        }

        // Merchant Detection
        const detectedMerchant = detectMerchantInNarration(dmResponse.aiResponse);
        if (detectedMerchant && !activeMerchant) {
          console.log('🏪 Merchant detected:', detectedMerchant.name);
          setActiveMerchant(detectedMerchant);
          setShowShop(true);
          setTimeout(() => {
            alert(`🏪 ${detectedMerchant.icon} ${detectedMerchant.name} is open for business!`);
          }, 1200);
        }

        // Combat Detection
        const combatDetection = detectCombatInNarration(dmResponse.aiResponse);
        if (combatDetection) {
          console.log("⚔️ Combat detected:", combatDetection.type);
          if (combatDetection.type === 'start' && !combat?.isActive) {
            setTimeout(() => { alert("⚔️ Combat begins! Select your enemies."); setShowStartCombat(true); }, 1500);
          } else if (combatDetection.type === 'end' && combat?.isActive) {
            setTimeout(() => { handleEndCombat({ result: 'victory', message: 'Victory! All enemies defeated.', xpReward: 100 }); }, 1000);
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
    const newEnemies = newCombat.combatants.filter(c => c.isEnemy).map(e => e.id.split('_')[0]);
    setEncounteredEnemies(prev => {
      const unique = [...new Set([...prev, ...newEnemies])];
      console.log("📖 Encountered enemies:", unique);
      return unique;
    });
    if (musicSystemRef.current) musicSystemRef.current.playTrack('combat_easy');
  };

  const handleUpdateCombat = (updatedCombat) => setCombat(updatedCombat);

  const handleEndCombat = (result) => {
    if (musicSystemRef.current) {
      if (result.result === 'victory') {
        musicSystemRef.current.playTrack('victory');
        setTimeout(() => { if (musicSystemRef.current) musicSystemRef.current.playTrack('peaceful_village'); }, 8000);
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

  const activeQuestCount = quests.filter(q => q.status === 'active').length;

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
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowQuestJournal(true)} className="btn btn-info" style={{ position: 'relative' }}>
                📖 Quests
                {activeQuestCount > 0 && (
                  <span style={{position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ffd700', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '2px solid #1a1a1a'}}>
                    {activeQuestCount}
                  </span>
                )}
              </button>

              <button onClick={() => setShowBestiary(true)} className="btn btn-danger" style={{ position: 'relative' }}>
                📚 Bestiary
                {encounteredEnemies.length > 0 && (
                  <span style={{position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ffd700', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '2px solid #1a1a1a'}}>
                    {encounteredEnemies.length}
                  </span>
                )}
              </button>

              {/* 🏪 Shop Button — always visible, opens last detected merchant or a travelling merchant */}
              <button
                onClick={() => {
                  if (!activeMerchant) setActiveMerchant(createMerchant(MERCHANT_TYPES.GENERAL, 'Travelling Merchant'));
                  setShowShop(true);
                }}
                className="btn"
                style={{
                  backgroundColor: activeMerchant ? '#c9a84c' : '#3a3000',
                  color: activeMerchant ? '#000' : '#c9a84c',
                  border: '1px solid #c9a84c',
                  position: 'relative'
                }}
              >
                🏪 {activeMerchant ? activeMerchant.name : 'Shop'}
              </button>

              <button onClick={() => setShowStartCombat(true)} className="btn btn-danger">⚔️ Combat</button>
              <button onClick={() => setShowSaveModal(true)} className="btn btn-success">💾 Save</button>
              <button onClick={() => setShowLoadModal(true)} className="btn btn-info">📂 Load</button>
            </div>
          </div>
        </div>

        {/* Audio Settings */}
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

        {/* Party */}
        <div className="mb-lg">
          <h3 style={{ marginBottom: '15px' }}>👥 Your Party</h3>
          <div className="grid grid-auto">
            {party.map((c, i) => {
              const hpPercent = (c.hp / c.maxHp) * 100;
              const hpColor = hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#ff9800' : '#f44336';
              const isSpellcaster = SPELLCASTING_CLASSES[c.class] &&
                (SPELLCASTING_CLASSES[c.class] !== 'third' || isThirdCaster(c));
              const activeEffects = c.conditions?.length || 0;
              
              return (
                <div key={i} className="card card-hover" onClick={() => handleViewCharacter(c)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{c.name}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>
                        Lvl {c.level} {c.race} {c.class}
                        {isSpellcaster && <span style={{ marginLeft: '5px', color: '#9C27B0' }}>✨</span>}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button onClick={(e) => { e.stopPropagation(); handleViewCharacter(c); }} className="btn btn-success btn-sm">📋 Sheet</button>
                      <button onClick={(e) => { e.stopPropagation(); handleOpenInventory(c); }} className="btn btn-info btn-sm">🎒 Bag</button>
                      {isSpellcaster && (
                        <button onClick={(e) => { e.stopPropagation(); handleOpenSpellBook(c); }} className="btn btn-sm" style={{backgroundColor: '#9C27B0', color: 'white', padding: '4px 8px', fontSize: '12px'}}>
                          ✨ Spells
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenStatusEffects(c); }}
                        className="btn btn-sm"
                        style={{backgroundColor: '#FF9800', color: 'white', padding: '4px 8px', fontSize: '12px', position: 'relative'}}
                      >
                        🎭 Effects
                        {activeEffects > 0 && (
                          <span style={{position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#f44336', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                            {activeEffects}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>HP: {c.hp} / {c.maxHp}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${hpPercent}%`, backgroundColor: hpColor }} />
                    </div>
                  </div>
                  {c.xp !== undefined && <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>XP: {c.xp}</div>}
                  {isSpellcaster && c.spellSlots?.current && (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#9C27B0' }}>
                      Spell Slots: {c.spellSlots.current.filter(s => s > 0).length > 0 ?
                        c.spellSlots.current.slice(0, 5).map((slots, i) => slots > 0 ? `${i+1}:${slots} ` : '').join('').trim()
                        : 'None'}
                    </div>
                  )}
                  <StatusEffectsPanel
                    character={c}
                    onUpdateCharacter={(updated) => {
                      const updatedParty = party.map(char => char.name === updated.name ? updated : char);
                      updateParty(updatedParty);
                    }}
                    compact={true}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Dice Roller */}
        <div style={{ marginBottom: '20px' }}>
          <DiceRoller onRoll={handleDiceRoll} />
        </div>

        {/* Chat Log */}
        <div className="card mb-lg">
          <h3 style={{ margin: '0 0 15px 0' }}>📜 Adventure Log</h3>
          <ChatLog history={campaign.history} />
        </div>

        {/* Input */}
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="What do you do?" className="input" disabled={isGeneratingVoice} style={{ flex: 1 }} />
            <button type="submit" disabled={isGeneratingVoice} className="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>

      {/* ── Modals ── */}
      {combat && combat.isActive && <CombatTracker combat={combat} onUpdate={handleUpdateCombat} onEnd={handleEndCombat} party={party} updateParty={updateParty} />}
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

      {showQuestJournal && (
        <QuestJournal quests={quests} onUpdateQuest={updateQuest} onCompleteQuest={completeQuestById} onClose={() => setShowQuestJournal(false)} />
      )}

      {showBestiary && (
        <Bestiary encounteredEnemies={encounteredEnemies} onClose={() => setShowBestiary(false)} />
      )}

      {showSpellBook && activeSpellcaster && (
        <SpellBook character={activeSpellcaster} onUpdateCharacter={handleUpdateSpellcaster} onClose={() => { setShowSpellBook(false); setActiveSpellcaster(null); }} />
      )}

      {showApplyStatusEffect && statusEffectTarget && (
        <ApplyStatusEffectModal character={statusEffectTarget} onApply={handleApplyStatusEffect} onClose={() => { setShowApplyStatusEffect(false); setStatusEffectTarget(null); }} />
      )}

      {/* 🏪 Shop Modal */}
      {showShop && activeMerchant && (
        <ShopModal
          merchant={activeMerchant}
          party={party}
          onUpdateParty={updateParty}
          onUpdateMerchant={updateActiveMerchant}
          onClose={() => {
            setShowShop(false);
            clearActiveMerchant();
          }}
        />
      )}

      <SaveLoadModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} mode="save" campaign={campaign} party={party} onLoad={handleLoadCampaign} />
      <SaveLoadModal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} mode="load" campaign={campaign} party={party} onLoad={handleLoadCampaign} />
      <MusicSystem ref={musicSystemRef} />
      <PatreonButton position="fixed" />
    </div>
  );
}