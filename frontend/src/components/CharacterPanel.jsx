import { useCampaignStore } from "../state/campaignStore";

export default function CharacterPanel() {
  const party = useCampaignStore((state) => state.party);

  if (!party.length) return <p>No characters yet.</p>;

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
      <h3>Party</h3>
      <ul>
        {party.map((c, idx) => (
          <li key={idx}>
            {c.name} — HP: {c.hp} — Status: {c.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
