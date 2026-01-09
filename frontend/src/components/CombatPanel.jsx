// frontend/src/components/CombatPanel.jsx
import { useCampaignStore } from "../state/campaignStore";

export default function CombatPanel() {
  const { campaign, nextTurn, damageEnemy, endCombat } =
    useCampaignStore();

  const combat = campaign.combat;
  if (!combat) return null;

  const active = combat.order[combat.turnIndex];

  return (
    <div style={{ border: "1px solid red", padding: "10px", marginTop: "10px" }}>
      <h3>⚔️ Combat — Round {combat.round}</h3>
      <p>
        Turn: <strong>{active.name}</strong> ({active.type})
      </p>

      <h4>Enemies</h4>
      <ul>
        {combat.enemies.map((e) => (
          <li key={e.id}>
            {e.name} — HP: {e.hp}/{e.maxHp}
            {e.alive && (
              <button
                style={{ marginLeft: "5px" }}
                onClick={() =>
                  damageEnemy(e.id, Math.floor(Math.random() * 8) + 1)
                }
              >
                Attack
              </button>
            )}
          </li>
        ))}
      </ul>

      <button onClick={nextTurn}>Next Turn</button>
      <button onClick={endCombat} style={{ marginLeft: "5px" }}>
        End Combat
      </button>
    </div>
  );
}
