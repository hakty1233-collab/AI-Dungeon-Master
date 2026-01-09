// frontend/src/pages/PlayerSheet.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCampaignStore } from "../state/campaignStore";

export default function PlayerSheet() {
  const { playerIndex } = useParams(); // player index from route
  const navigate = useNavigate();
  const { campaignState, updatePlayer } = useCampaignStore();

  // Grab the player object safely
  const initialCharacter =
    campaignState?.players?.[playerIndex] || {
      name: "",
      race: "",
      class: "",
      level: 1,
      maxHp: 10,
      currentHp: 10,
      stats: {},
      personality: "",
      background: "",
    };

  const [character, setCharacter] = useState(initialCharacter);

  // Update store whenever character changes
  const handleChange = (field, value) => {
    const updated = { ...character };
    // handle nested stats object
    if (field.startsWith("stats.")) {
      const statName = field.split(".")[1];
      updated.stats = { ...updated.stats, [statName]: value };
    } else {
      updated[field] = value;
    }
    setCharacter(updated);
    updatePlayer(playerIndex, updated);
  };

  // Generate fields dynamically
  const renderFields = () => {
    if (!character) return null;

    return Object.keys(character).map((key) => {
      if (key === "stats") {
        return (
          <div key={key}>
            <h4 className="mt-2 font-semibold">Stats</h4>
            {Object.keys(character.stats || {}).map((stat) => (
              <div key={stat} className="mb-2">
                <label className="block text-sm">{stat}</label>
                <input
                  type="number"
                  value={character.stats[stat] || 0}
                  onChange={(e) =>
                    handleChange(`stats.${stat}`, Number(e.target.value))
                  }
                  className="border p-1 rounded w-24"
                />
              </div>
            ))}
          </div>
        );
      }

      return (
        <div key={key} className="mb-2">
          <label className="block text-sm">{key}</label>
          <input
            type={typeof character[key] === "number" ? "number" : "text"}
            value={character[key] || ""}
            onChange={(e) => handleChange(key, e.target.value)}
            className="border p-1 rounded w-full"
          />
        </div>
      );
    });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Player {Number(playerIndex) + 1} Sheet</h2>
      {character ? (
        <form className="flex flex-col gap-4">
          {renderFields()}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500"
            >
              Back to Players
            </button>
            <button
              type="button"
              onClick={() => navigate("/play")}
              className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
            >
              Start Adventure
            </button>
          </div>
        </form>
      ) : (
        <div>Loading character...</div>
      )}
    </div>
  );
}
