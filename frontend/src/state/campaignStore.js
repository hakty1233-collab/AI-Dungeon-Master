// frontend/src/state/campaignStore.js
import { create } from "zustand";

export const useCampaignStore = create((set) => ({
  campaign: null,
  party: [],
  lastResponse: "",

  // 🧠 MEMORY LAYERS
  worldMemory: [],      // Persistent important facts
  combatState: null,    // Active combat only

  voiceMode: true,
  soundEffectsEnabled: true, // NEW: Sound effects toggle
  micListening: false,

  // 🚀 START / LOAD CAMPAIGN
  setCampaign: (campaign) =>
    set({
      campaign: {
        ...campaign,
        history: campaign.history?.length
          ? campaign.history
          : [
              {
                role: "assistant",
                content: "The air grows still as your adventure begins...",
              },
            ],
      },
      party: campaign.party || [],
      lastResponse: campaign.history?.slice(-1)[0]?.content || "",
      worldMemory: campaign.worldMemory || [],
      combatState: campaign.combatState || null,
    }),

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

      // 🧠 Persist smarter memory
      worldMemory:
        campaignState.worldMemory !== undefined
          ? campaignState.worldMemory
          : state.worldMemory,

      combatState:
        campaignState.combatState !== undefined
          ? campaignState.combatState
          : state.combatState,
    })),

  // 🧍 PLAYER ACTION (kept local for UI + short-term memory)
  addPlayerMessage: (text) =>
    set((state) => ({
      campaign: {
        ...state.campaign,
        history: [
          ...(state.campaign.history || []),
          { role: "user", content: text },
        ],
      },
    })),

  // 🎲 DICE ROLLS (system-visible but DM-aware)
  addDiceRoll: (roll) =>
    set((state) => ({
      campaign: {
        ...state.campaign,
        history: [
          ...(state.campaign.history || []),
          {
            role: "system",
            content: `🎲 Rolled d${roll.sides}: ${roll.result}`,
          },
        ],
      },
    })),

  // 🎤 VOICE CONTROLS
  toggleMic: () =>
    set((s) => ({ micListening: !s.micListening })),

  toggleVoice: () =>
    set((s) => ({ voiceMode: !s.voiceMode })),

  // 🔊 SOUND EFFECTS CONTROL
  toggleSoundEffects: () =>
    set((s) => ({ soundEffectsEnabled: !s.soundEffectsEnabled })),
}));