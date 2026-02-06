// frontend/src/components/DMSetup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCampaignStore } from "../state/campaignStore";
import { startCampaign } from "../services/api";
import CharacterCreator from "./CharacterCreator";

export default function DMSetup() {
  const [theme, setTheme] = useState("Dark Fantasy");
  const [difficulty, setDifficulty] = useState("Normal");
  const [party, setParty] = useState([]);
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);
  const { setCampaign } = useCampaignStore();
  const navigate = useNavigate();

  const handleAddCharacter = (character) => {
    setParty([...party, character]);
    setShowCharacterCreator(false);
  };

  const handleRemoveCharacter = (index) => {
    setParty(party.filter((_, i) => i !== index));
  };

  const handleStart = async () => {
  if (party.length === 0) {
    alert("Please create at least one character!");
    return;
  }

  console.log("Starting campaign...");
  try {
    const campaignState = await startCampaign({ theme, difficulty, party });
    console.log("Backend returned:", campaignState);

    if (!campaignState) {
      throw new Error("No campaign state returned from server");
    }

    setCampaign(campaignState);
    navigate("/play");
  } catch (err) {
    console.error("❌ Failed to start campaign:", err);
    
    // More specific error messages
    if (err.message?.includes("401")) {
      alert("⚠️ API Key Error: The Groq API key is invalid or expired. Please update it in Railway settings.");
    } else if (err.message?.includes("Network")) {
      alert("⚠️ Network Error: Cannot connect to backend. Is the server running?");
    } else {
      alert(`Failed to start campaign: ${err.message || "Unknown error"}\n\nCheck console for details.`);
    }
  }
};

  return (
    <div style={{
      padding: "40px",
      maxWidth: "1000px",
      margin: "0 auto",
      minHeight: "100vh",
      backgroundColor: "#0a0a0a"
    }}>
      <h1 style={{
        textAlign: "center",
        color: "#ffd700",
        fontSize: "48px",
        marginBottom: "10px",
        textShadow: "0 0 20px rgba(255,215,0,0.5)"
      }}>
        ⚔️ AI Dungeon Master
      </h1>
      <p style={{
        textAlign: "center",
        color: "#888",
        fontSize: "18px",
        marginBottom: "40px"
      }}>
        Create your adventure and forge your heroes
      </p>

      {/* Campaign Settings */}
      <div style={{
        backgroundColor: "#1a1a1a",
        padding: "30px",
        borderRadius: "15px",
        marginBottom: "30px",
        border: "2px solid #444"
      }}>
        <h2 style={{ color: "#ffd700", marginTop: 0 }}>⚙️ Campaign Settings</h2>

        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            color: "#eee",
            marginBottom: "8px",
            fontSize: "16px",
            fontWeight: "bold"
          }}>
            🎭 Theme:
          </label>
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              backgroundColor: "#2a2a2a",
              color: "#eee",
              border: "2px solid #444",
              borderRadius: "8px"
            }}
            placeholder="e.g., Dark Fantasy, Sci-Fi, Horror..."
          />
        </div>

        <div>
          <label style={{
            display: "block",
            color: "#eee",
            marginBottom: "8px",
            fontSize: "16px",
            fontWeight: "bold"
          }}>
            ⚡ Difficulty:
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              backgroundColor: "#2a2a2a",
              color: "#eee",
              border: "2px solid #444",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            <option>Easy</option>
            <option>Normal</option>
            <option>Hard</option>
            <option>Deadly</option>
          </select>
        </div>
      </div>

      {/* Party */}
      <div style={{
        backgroundColor: "#1a1a1a",
        padding: "30px",
        borderRadius: "15px",
        marginBottom: "30px",
        border: "2px solid #444"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h2 style={{ color: "#ffd700", margin: 0 }}>👥 Your Party</h2>
          <button
            onClick={() => setShowCharacterCreator(true)}
            style={{
              padding: "12px 24px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0 4px 8px rgba(76,175,80,0.3)"
            }}
          >
            ➕ Create Character
          </button>
        </div>

        {party.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#888",
            fontStyle: "italic"
          }}>
            <p style={{ fontSize: "18px", margin: 0 }}>
              No heroes yet. Create your first character to begin!
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px"
          }}>
            {party.map((character, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#2a2a2a",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "2px solid #444",
                  position: "relative"
                }}
              >
                <button
                  onClick={() => handleRemoveCharacter(index)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    cursor: "pointer",
                    fontSize: "18px",
                    lineHeight: "30px",
                    padding: 0
                  }}
                  title="Remove character"
                >
                  ✕
                </button>

                <h3 style={{
                  margin: "0 0 10px 0",
                  color: "#ffd700",
                  fontSize: "24px"
                }}>
                  {character.name}
                </h3>

                <p style={{
                  margin: "5px 0",
                  color: "#aaa",
                  fontSize: "16px"
                }}>
                  Level {character.level} {character.race} {character.class}
                </p>

                {character.background && (
                  <p style={{
                    margin: "10px 0",
                    color: "#888",
                    fontSize: "14px",
                    fontStyle: "italic",
                    borderTop: "1px solid #444",
                    paddingTop: "10px"
                  }}>
                    "{character.background.substring(0, 100)}{character.background.length > 100 ? '...' : ''}"
                  </p>
                )}

                <div style={{
                  marginTop: "15px",
                  display: "flex",
                  justifyContent: "space-around",
                  paddingTop: "15px",
                  borderTop: "1px solid #444"
                }}>
                  {Object.entries(character.abilities).slice(0, 3).map(([ability, score]) => (
                    <div key={ability} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "#888" }}>{ability}</div>
                      <div style={{ fontSize: "20px", fontWeight: "bold", color: "#ffd700" }}>
                        {score}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: "15px",
                  fontSize: "14px",
                  color: "#aaa"
                }}>
                  ❤️ HP: {character.maxHp} | 🛡️ AC: {character.armorClass}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={party.length === 0}
        style={{
          width: "100%",
          padding: "20px",
          fontSize: "24px",
          fontWeight: "bold",
          backgroundColor: party.length > 0 ? "#ffd700" : "#444",
          color: party.length > 0 ? "#000" : "#888",
          border: "none",
          borderRadius: "12px",
          cursor: party.length > 0 ? "pointer" : "not-allowed",
          boxShadow: party.length > 0 ? "0 6px 12px rgba(255,215,0,0.4)" : "none",
          transition: "all 0.3s",
          opacity: party.length > 0 ? 1 : 0.5
        }}
      >
        {party.length === 0 ? "⚠️ Create characters to begin" : "🎮 Begin Adventure!"}
      </button>

      {/* Character Creator Modal */}
      {showCharacterCreator && (
        <CharacterCreator
          onComplete={handleAddCharacter}
          onCancel={() => setShowCharacterCreator(false)}
        />
      )}
    </div>
  );
}