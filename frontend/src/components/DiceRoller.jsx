export default function DiceRoller({ onRoll }) {
  const dice = [4, 6, 8, 10, 12, 20];

  const roll = (sides) => {
    const result = Math.floor(Math.random() * sides) + 1;
    onRoll({ sides, result });
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      <strong>Roll Dice:</strong>{" "}
      {dice.map((d) => (
        <button
          key={d}
          onClick={() => roll(d)}
          style={{ marginRight: "5px" }}
        >
          d{d}
        </button>
      ))}
    </div>
  );
}
