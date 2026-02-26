// frontend/src/state/campaignStore.js
import { create } from "zustand";

import { 
  createQuest, 
  detectQuestEvents, 
  completeQuest,
  updateQuestObjective,
  addQuestNote,
  QUEST_STATUS 
} from "../utils/questSystem";

export const useCampaignStore = create((set) => ({
  campaign: null,
  party: [],
  lastResponse: "",

  // ⭐ QUEST TRACKER
  quests: [],

  // 🏪 ACTIVE MERCHANT (null when no shop is open)
  activeMerchant: null,

  // 🧠 MEMORY LAYERS
  worldMemory: [],
  combatState: null,

  voiceMode: true,
  soundEffectsEnabled: true,
  micListening: false,

  // 🚀 START / LOAD CAMPAIGN
  setCampaign: (campaign) =>
    set({
      campaign: {
        ...campaign,
        history: campaign.history?.length
          ? campaign.history
          : [{ role: "assistant", content: "The air grows still as your adventure begins..." }],
      },
      party: campaign.party || [],
      lastResponse: campaign.history?.slice(-1)[0]?.content || "",
      worldMemory: campaign.worldMemory || [],
      combatState: campaign.combatState || null,
      quests: campaign.quests || [],
      activeMerchant: null,
    }),

  // 👥 UPDATE PARTY
  updateParty: (updatedParty) =>
    set((state) => ({
      party: updatedParty,
      campaign: state.campaign ? { ...state.campaign, party: updatedParty } : null,
    })),

  // 🎭 DM RESPONSE UPDATE
  updateFromDM: ({ aiResponse, campaignState }) =>
    set((state) => ({
      campaign: {
        ...campaignState,
        history: [
          ...(state.campaign?.history || []),
          { role: "assistant", content: aiResponse },
        ],
      },
      lastResponse: aiResponse,
      party: campaignState.party || state.party,
      worldMemory: campaignState.worldMemory !== undefined ? campaignState.worldMemory : state.worldMemory,
      combatState: campaignState.combatState !== undefined ? campaignState.combatState : state.combatState,
      quests: campaignState.quests !== undefined ? campaignState.quests : state.quests,
    })),

  // 🧍 PLAYER ACTION
  addPlayerMessage: (text) =>
    set((state) => ({
      campaign: {
        ...state.campaign,
        history: [
          ...(state.campaign?.history || []),
          { role: "user", content: text },
        ],
      },
    })),

  // 🎲 DICE ROLLS
  addDiceRoll: (roll) =>
    set((state) => ({
      campaign: {
        ...state.campaign,
        history: [
          ...(state.campaign?.history || []),
          { role: "system", content: `🎲 Rolled d${roll.sides}: ${roll.result}` },
        ],
      },
    })),

  // ⭐ QUEST MANAGEMENT
  addQuest: (questData) =>
    set((state) => ({
      quests: [...state.quests, createQuest(questData)],
    })),

  updateQuest: (questId, updates) =>
    set((state) => ({
      quests: state.quests.map((q) => q.id === questId ? { ...q, ...updates } : q),
    })),

  completeQuestById: (questId) =>
    set((state) => ({
      quests: state.quests.map((q) => q.id === questId ? completeQuest(q) : q),
    })),

  addQuestNoteById: (questId, note) =>
    set((state) => ({
      quests: state.quests.map((q) => q.id === questId ? addQuestNote(q, note) : q),
    })),

  // 🏪 MERCHANT MANAGEMENT
  setActiveMerchant: (merchant) =>
    set({ activeMerchant: merchant }),

  updateActiveMerchant: (merchant) =>
    set({ activeMerchant: merchant }),

  clearActiveMerchant: () =>
    set({ activeMerchant: null }),

  // 🎤 VOICE CONTROLS
  toggleMic: () => set((s) => ({ micListening: !s.micListening })),
  toggleVoice: () => set((s) => ({ voiceMode: !s.voiceMode })),
  toggleSoundEffects: () => set((s) => ({ soundEffectsEnabled: !s.soundEffectsEnabled })),
}));