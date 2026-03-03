// frontend/src/components/SaveLoadModal.jsx
import { useState, useEffect } from "react";
import { getAllSaves, saveCampaign, loadCampaign, deleteSave, exportSave, importSave } from "../services/saveLoadService";
import { useCampaignStore } from "../state/campaignStore";

export default function SaveLoadModal({ isOpen, onClose, mode, campaign, party, onLoad }) {
  const [saves, setSaves] = useState([]);
  const [saveName, setSaveName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Pull quests from store so they're included in every save
  const quests = useCampaignStore((state) => state.quests || []);

  useEffect(() => {
    if (isOpen) refreshSaves();
  }, [isOpen]);

  const refreshSaves = () => setSaves(getAllSaves());

  const handleSave = () => {
    if (!saveName.trim()) {
      alert("Please enter a save name");
      return;
    }

    setIsSaving(true);
    const slotId  = selectedSlot || `save-${Date.now()}`;
    const success = saveCampaign(slotId, campaign, party, saveName, quests);
    setIsSaving(false);

    if (success) {
      alert(`✅ Saved as "${saveName}"!`);
      refreshSaves();
      onClose();
    } else {
      alert("❌ Save failed — check browser storage settings.");
    }
  };

  const handleLoad = (save) => {
    if (window.confirm(`Load "${save.saveName}"? Current unsaved progress will be lost.`)) {
      const data = loadCampaign(save.id);
      if (data) {
        onLoad(data.campaign, data.party, data.quests);
        onClose();
      } else {
        alert("❌ Failed to load save — it may be corrupted.");
      }
    }
  };

  const handleDelete = (saveId, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteSave(saveId);
      refreshSaves();
    }
  };

  const handleExport = (saveId) => exportSave(saveId);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importSave(file, `imported-${Date.now()}`)
      .then(() => { alert("✅ Save imported!"); refreshSaves(); })
      .catch((err) => alert("❌ Import failed: " + err.message));
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 6000, padding: '20px'
    }}>
      <div style={{
        backgroundColor: "#1a1a1a", color: "#eee",
        padding: "30px", borderRadius: "12px",
        maxWidth: "700px", width: "100%",
        maxHeight: "85vh", overflowY: "auto",
        border: "2px solid #c9a84c",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
      }}>
        <h2 style={{ marginTop: 0, color: "#ffd700" }}>
          {mode === "save" ? "💾 Save Campaign" : "📂 Load Campaign"}
        </h2>

        {/* ── Save section ── */}
        {mode === "save" && (
          <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#242424", borderRadius: "8px", border: "1px solid #333" }}>
            <p style={{ margin: "0 0 10px 0", color: "#aaa", fontSize: "14px" }}>
              Enter a name for this save slot:
            </p>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="e.g. Before the Dragon Fight..."
              style={{
                width: "100%", padding: "10px", fontSize: "15px",
                backgroundColor: "#2a2a2a", color: "#eee",
                border: "1px solid #555", borderRadius: "6px",
                marginBottom: "10px", boxSizing: "border-box"
              }}
            />
            <button
              onClick={handleSave}
              disabled={isSaving || !saveName.trim()}
              style={{
                padding: "10px 24px", fontSize: "15px",
                backgroundColor: saveName.trim() ? "#4CAF50" : "#333",
                color: "white", border: "none", borderRadius: "6px",
                cursor: saveName.trim() ? "pointer" : "not-allowed",
                fontWeight: "bold", transition: "background 0.2s"
              }}
            >
              {isSaving ? "Saving..." : "💾 Save Now"}
            </button>
            {selectedSlot && (
              <span style={{ marginLeft: "12px", fontSize: "13px", color: "#888" }}>
                Overwriting existing slot
              </span>
            )}
          </div>
        )}

        {/* ── Existing saves ── */}
        <h3 style={{ color: "#ffd700", marginBottom: "12px" }}>
          {saves.length > 0 ? `Saved Campaigns (${saves.length})` : "Saved Campaigns"}
        </h3>

        {saves.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "#666", padding: "20px 0" }}>
            No saved campaigns yet. Use the Save button above to create your first save.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {saves.map((save) => (
              <div
                key={save.id}
                style={{
                  backgroundColor: "#242424", padding: "14px", borderRadius: "8px",
                  border: selectedSlot === save.id ? "2px solid #ffd700" : "1px solid #3a3a3a",
                  cursor: mode === "save" ? "pointer" : "default",
                  transition: "border 0.15s"
                }}
                onClick={() => mode === "save" && setSelectedSlot(save.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: "0 0 6px 0", color: "#ffd700", fontSize: "15px" }}>
                      {save.saveName}
                      {save.id === 'auto' && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#888', fontWeight: 'normal' }}>(auto-save)</span>}
                    </h4>
                    <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {save.thumbnail}
                    </p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#666" }}>
                      💾 {new Date(save.lastSaved).toLocaleString()} &nbsp;·&nbsp; ⏱️ {save.playTime}
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", flexShrink: 0 }}>
                    {mode === "load" && (
                      <button onClick={() => handleLoad(save)} style={{ padding: "7px 14px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
                        📂 Load
                      </button>
                    )}
                    <button onClick={() => handleExport(save.id)} style={{ padding: "7px 14px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "13px" }}>
                      📤 Export
                    </button>
                    <button onClick={() => handleDelete(save.id, save.saveName)} style={{ padding: "7px 14px", backgroundColor: "#c62828", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "13px" }}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Import ── */}
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #333" }}>
          <label style={{
            padding: "10px 20px", backgroundColor: "#6a1b9a", color: "white",
            borderRadius: "6px", cursor: "pointer", display: "inline-block", fontWeight: "bold", fontSize: "14px"
          }}>
            📥 Import Save File
            <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
          </label>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: "20px", padding: "12px 20px",
            backgroundColor: "#444", color: "white",
            border: "none", borderRadius: "6px",
            cursor: "pointer", width: "100%", fontSize: "15px"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}