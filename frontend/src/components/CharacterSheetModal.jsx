// frontend/src/components/CharacterSheetModal.jsx
import { useState } from "react";

export default function CharacterSheetModal({ player, onSave, onClose }) {
  const [char, setChar] = useState(player);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-full max-w-lg">
        <h3 className="text-xl font-bold mb-2">Character Sheet</h3>

        <input
          placeholder="Name"
          value={char.name}
          onChange={(e) => setChar({ ...char, name: e.target.value })}
        />

        <input
          placeholder="Race"
          value={char.race}
          onChange={(e) => setChar({ ...char, race: e.target.value })}
        />

        <input
          placeholder="Class"
          value={char.class}
          onChange={(e) => setChar({ ...char, class: e.target.value })}
        />

        <textarea
          placeholder="Background / Backstory"
          value={char.background}
          onChange={(e) => setChar({ ...char, background: e.target.value })}
        />

        <button onClick={() => onSave(char)}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}