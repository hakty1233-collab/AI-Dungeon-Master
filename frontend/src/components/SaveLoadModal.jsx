// frontend/src/components/SaveLoadModal.jsx
import { useState, useEffect } from "react";
import { getAllSaves, saveCampaign, loadCampaign, deleteSave, exportSave, importSave } from "../services/saveLoadService";

export default function SaveLoadModal({ isOpen, onClose, mode, campaign, party, onLoad }) {
  const [saves, setSaves] = useState([]);
  const [saveName, setSaveName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (isOpen) {
      refreshSaves();
    }
  }, [isOpen]);

  const refreshSaves = () => {
    setSaves(getAllSaves());
  };

  const handleSave = () => {
    if (!saveName.trim()) {
      alert("Please enter a save name");
      return;
    }

    const slotId = selectedSlot || `save-${Date.now()}`;
    const success = saveCampaign(slotId, campaign, party, saveName);

    if (success) {
      alert("Campaign saved!");
      refreshSaves();
      onClose();
    }
  };

  const handleLoad = (save) => {
    if (window.confirm(`Load "${save.saveName}"? Current progress will be lost if not saved.`)) {
      const data = loadCampaign(save.id);
      if (data) {
        onLoad(data.campaign, data.party);
        onClose();
      }
    }
  };

  const handleDelete = (saveId, saveName) => {
    if (window.confirm(`Delete "${saveName}"? This cannot be undone.`)) {
      deleteSave(saveId);
      refreshSaves();
    }
  };

  const handleExport = (saveId) => {
    exportSave(saveId);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const slotId = `imported-${Date.now()}`;
    importSave(file, slotId)
      .then(() => {
        alert("Save imported successfully!");
        refreshSaves();
      })
      .catch((err) => {
        alert("Failed to import save: " + err.message);
      });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "#1a1a1a",
        color: "#eee",
        padding: "30px",
        borderRadius: "10px",
        maxWidth: "700px",
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto",
        border: "2px solid #444"
      }}>
        <h2 style={{ marginTop: 0, color: "#ffd700" }}>
          {mode === "save" ? "💾 Save Campaign" : "📂 Load Campaign"}
        </h2>

        {mode === "save" && (
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter save name..."
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                marginBottom: "10px",
                backgroundColor: "#2a2a2a",
                color: "#eee",
                border: "1px solid #444",
                borderRadius: "5px"
              }}
            />
            <button
              onClick={handleSave}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              💾 Save Now
            </button>
          </div>
        )}

        <h3 style={{ color: "#ffd700" }}>Saved Campaigns</h3>

        {saves.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "#888" }}>No saved campaigns yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {saves.map((save) => (
              <div
                key={save.id}
                style={{
                  backgroundColor: "#2a2a2a",
                  padding: "15px",
                  borderRadius: "8px",
                  border: selectedSlot === save.id ? "2px solid #ffd700" : "1px solid #444",
                  cursor: mode === "save" ? "pointer" : "default"
                }}
                onClick={() => mode === "save" && setSelectedSlot(save.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#ffd700" }}>
                      {save.saveName}
                    </h4>
                    <p style={{ margin: "4px 0", fontSize: "14px", color: "#aaa" }}>
                      {save.thumbnail}
                    </p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#888" }}>
                      💾 Saved: {new Date(save.lastSaved).toLocaleString()}
                      {" • "}
                      ⏱️ Play Time: {save.playTime}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "5px", flexDirection: "column" }}>
                    {mode === "load" && (
                      <button
                        onClick={() => handleLoad(save)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "14px"
                        }}
                      >
                        📂 Load
                      </button>
                    )}
                    <button
                      onClick={() => handleExport(save.id)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      📤 Export
                    </button>
                    <button
                      onClick={() => handleDelete(save.id, save.saveName)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #444" }}>
          <label
            style={{
              padding: "10px 20px",
              backgroundColor: "#9C27B0",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              display: "inline-block",
              fontWeight: "bold"
            }}
          >
            📥 Import Save File
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#666",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
            fontSize: "16px"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}