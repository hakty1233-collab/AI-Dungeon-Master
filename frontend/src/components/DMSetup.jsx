import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCampaignStore } from "../state/campaignStore";
import { startCampaign } from "../services/api";

export default function DMSetup() {
  const [theme, setTheme] = useState("Dark Fantasy");
  const [difficulty, setDifficulty] = useState("Normal");
  const [party, setParty] = useState([]);
  const { setCampaign } = useCampaignStore();
  const navigate = useNavigate();

  const handleAddCharacter = () => {
    const name = prompt("Enter character name:");
    if (name) setParty([...party, { name, hp: 100, status: "Healthy" }]);
  };

  const handleStart = async () => {
    console.log("Starting campaign...");
    try {
      const campaignState = await startCampaign({ theme, difficulty, party });
      console.log("Backend returned:", campaignState);

      setCampaign(campaignState);

      // ✅ Navigate to GameScreen
      navigate("/play");
    } catch (err) {
      console.error("Failed to start campaign:", err);
      alert("Failed to start campaign. Check console for details.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Start Your Campaign</h2>

      <label>
        Theme:{" "}
        <input value={theme} onChange={(e) => setTheme(e.target.value)} />
      </label>
      <br />

      <label>
        Difficulty:{" "}
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option>Easy</option>
          <option>Normal</option>
          <option>Hard</option>
        </select>
      </label>
      <br />

      <button onClick={handleAddCharacter}>Add Character</button>
      <ul>
        {party.map((c, idx) => (
          <li key={idx}>
            {c.name} — HP: {c.hp} — Status: {c.status}
          </li>
        ))}
      </ul>

      <button onClick={handleStart} style={{ marginTop: "10px" }}>
        Start Campaign
      </button>
    </div>
  );
}
