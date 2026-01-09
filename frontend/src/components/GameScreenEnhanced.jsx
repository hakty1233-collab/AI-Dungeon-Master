// frontend/src/components/GameScreenEnhanced.jsx

import { useState } from "react";
import { playTurn } from "../services/api";

export default function GameScreenEnhanced({ systemPrompt, initialState }) {
  const [gameState, setGameState] = useState(initialState);
  const [playerInput, setPlayerInput] = useState("");
  const [chatLog, setChatLog] = useState([{ type: "dm", text: initialState ? initialState.narration : "The adventure begins..." }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playerInput) return;

    try {
      const response = await playTurn({ playerAction: playerInput, systemPrompt });
      // Add DM narration to chat log
      setChatLog((prev) => [...prev, { type: "player", text: playerInput }, { type: "dm", text: response.narration }]);
      setGameState(response.gameState);
      setPlayerInput("");
    } catch (err) {
      console.error("Error during turn:", err);
      setChatLog((prev) => [...prev, { type: "dm", text: "The DM seems confused. Try again." }]);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      {/* Player Stats Panel */}
      <div className="bg-neutral-900 text-neutral-100 p-4 rounded-xl mb-4">
        <p><strong>HP:</strong> {gameState.player.hp} / {gameState.player.maxHp}</p>
        {gameState.player.conditions.length > 0 && (
          <p><strong>Conditions:</strong> {gameState.player.conditions.join(", ")}</p>
        )}
        {gameState.player.inventory.length > 0 && (
          <p><strong>Inventory:</strong> {gameState.player.inventory.join(", ")}</p>
        )}
      </div>

      {/* Chat Log */}
      <div className="bg-neutral-800 text-white p-4 rounded-xl mb-4 max-h-64 overflow-y-auto">
        {chatLog.map((msg, index) => (
          <p key={index} className={msg.type === "dm" ? "text-indigo-300" : "text-green-300"}>
            {msg.type === "dm" ? "DM: " : "You: "}{msg.text}
          </p>
        ))}
      </div>

      {/* Player Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={playerInput}
          onChange={(e) => setPlayerInput(e.target.value)}
          className="flex-1 p-2 rounded-xl border"
          placeholder="What do you do?"
        />
        <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl">
          Submit
        </button>
      </form>
    </div>
  );
}