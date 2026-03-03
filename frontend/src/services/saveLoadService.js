// frontend/src/services/saveLoadService.js

/**
 * Save/Load Campaign System
 * Stores campaigns in localStorage with multiple save slots
 */

const SAVE_KEY_PREFIX = 'ai-dm-save-';

/**
 * Get all saved campaigns
 */
export function getAllSaves() {
  const saves = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(SAVE_KEY_PREFIX)) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        saves.push({ id: key.replace(SAVE_KEY_PREFIX, ''), ...data });
      } catch (err) {
        console.error('Failed to parse save:', key, err);
      }
    }
  }

  saves.sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved));
  return saves;
}

/**
 * Save campaign to a slot.
 * quests is optional — defaults to [] so auto-save never crashes.
 */
export function saveCampaign(slotId, campaign, party, saveName = null, quests = []) {
  try {
    const saveData = {
      saveName: saveName || `${campaign?.theme || 'Campaign'} - ${campaign?.difficulty || 'Normal'}`,
      campaign,
      party,
      quests: quests || [],
      lastSaved: new Date().toISOString(),
      playTime: calculatePlayTime(campaign),
      thumbnail: generateThumbnail(campaign),
    };

    const key = SAVE_KEY_PREFIX + slotId;
    localStorage.setItem(key, JSON.stringify(saveData));

    console.log('✅ Campaign saved to slot:', slotId);
    return true;
  } catch (err) {
    console.error('❌ Failed to save campaign:', err);
    if (err.name === 'QuotaExceededError') {
      alert('Storage full! Please delete old saves.');
    }
    return false;
  }
}

/**
 * Load campaign from a slot
 */
export function loadCampaign(slotId) {
  try {
    const key = SAVE_KEY_PREFIX + slotId;
    const data = localStorage.getItem(key);

    if (!data) {
      console.error('No save found in slot:', slotId);
      return null;
    }

    const saveData = JSON.parse(data);
    console.log('✅ Campaign loaded from slot:', slotId);

    return {
      campaign: saveData.campaign,
      party:    saveData.party,
      quests:   saveData.quests || []
    };
  } catch (err) {
    console.error('❌ Failed to load campaign:', err);
    return null;
  }
}

/**
 * Delete a save
 */
export function deleteSave(slotId) {
  try {
    localStorage.removeItem(SAVE_KEY_PREFIX + slotId);
    console.log('✅ Save deleted:', slotId);
    return true;
  } catch (err) {
    console.error('❌ Failed to delete save:', err);
    return false;
  }
}

/**
 * Auto-save (saves to slot 'auto').
 * Accepts optional quests array so nothing is lost.
 */
export function autoSave(campaign, party, quests = []) {
  return saveCampaign('auto', campaign, party, 'Auto-Save', quests);
}

/**
 * Calculate total play time from history
 */
function calculatePlayTime(campaign) {
  const turnCount = campaign?.history?.length || 0;
  const minutes = Math.floor(turnCount * 2);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Generate thumbnail description from recent events
 */
function generateThumbnail(campaign) {
  const history = campaign?.history || [];
  const lastAssistant = [...history].reverse().find(h => h.role === 'assistant');
  if (lastAssistant?.content) {
    const firstSentence = lastAssistant.content.split(/[.!?]/)[0];
    return firstSentence.substring(0, 100) + '...';
  }
  return 'Adventure in progress...';
}

/**
 * Export save to JSON file
 */
export function exportSave(slotId) {
  const saveData = loadCampaign(slotId);
  if (!saveData) return;

  const json = JSON.stringify(saveData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-dm-save-${slotId}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import save from JSON file
 */
export function importSave(file, slotId) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target.result);

        if (!saveData.campaign || !saveData.party) {
          throw new Error('Invalid save file format');
        }

        const success = saveCampaign(
          slotId,
          saveData.campaign,
          saveData.party,
          saveData.saveName || 'Imported Save',
          saveData.quests || []
        );

        if (success) resolve(saveData);
        else reject(new Error('Failed to save imported data'));
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}