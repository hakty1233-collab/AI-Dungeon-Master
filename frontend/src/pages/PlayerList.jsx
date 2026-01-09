import { useCampaignStore } from "../state/campaignStore";
import { useNavigate } from "react-router-dom";

export default function PlayerList() {
  const players = useCampaignStore((state) => state.players);
  const navigate = useNavigate();

  if (!players || players.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Player Sheets</h2>
        <p>No players added yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Player Sheets</h2>
      <ul className="space-y-2">
        {players.map((player) => (
          <li key={player.id}>
            <button
              className="p-2 border rounded-xl w-full text-left hover:bg-gray-100"
              onClick={() => navigate(`/player/${player.id}`)}
            >
              {player.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
