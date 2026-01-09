export default function ChatLog({ history }) {
  return (
    <div
      style={{
        border: "1px solid #888",
        padding: "10px",
        marginBottom: "10px",
        maxHeight: "400px",
        overflowY: "auto",
        backgroundColor: "#1a1a1a",
        color: "#eee",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap", // keep line breaks
      }}
    >
      {(!history || history.length === 0) && (
        <p style={{ fontStyle: "italic", color: "#bbb" }}>
          The adventure is about to begin...
        </p>
      )}

      {history.map((entry, idx) => {
        const isDM = entry.role === "assistant" || entry.role === "system";

        return (
          <div
            key={idx}
            style={{
              marginBottom: "12px",
              padding: "6px",
              borderRadius: "6px",
              backgroundColor: isDM ? "#2c2c2c" : "#333",
              color: isDM ? "#aaf" : "#afa",
            }}
          >
            <strong>{isDM ? "DM" : "Player"}:</strong>{" "}
            <span
              style={{
                display: "block",
                marginTop: "4px",
                lineHeight: "1.5",
              }}
            >
              {entry.content}
            </span>
          </div>
        );
      })}
    </div>
  );
}
