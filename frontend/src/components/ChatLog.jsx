// frontend/src/components/ChatLog.jsx
export default function ChatLog({ history }) {
  return (
    <div
      style={{
        border: "2px solid #444",
        borderRadius: "8px",
        padding: "15px",
        maxHeight: "500px",
        overflowY: "auto",
        backgroundColor: "#0a0a0a",
        fontFamily: "monospace",
      }}
    >
      {(!history || history.length === 0) && (
        <p style={{ 
          fontStyle: "italic", 
          color: "#666",
          textAlign: "center",
          padding: "40px 20px"
        }}>
          The adventure is about to begin...
        </p>
      )}

      {history.map((entry, idx) => {
        const isDM = entry.role === "assistant" || entry.role === "system";
        const isSystem = entry.role === "system";

        return (
          <div
            key={idx}
            style={{
              marginBottom: "15px",
              padding: "12px 15px",
              borderRadius: "8px",
              backgroundColor: isDM ? "#1a1a1a" : "#2a2a2a",
              border: `2px solid ${isDM ? "#444" : "#555"}`,
              borderLeft: `4px solid ${
                isSystem ? "#ff9800" : 
                isDM ? "#ffd700" : "#4CAF50"
              }`,
              animation: idx === history.length - 1 ? "slideInDown 0.3s ease" : "none"
            }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center",
              marginBottom: "8px",
              gap: "8px"
            }}>
              <span style={{ 
                fontSize: "18px" 
              }}>
                {isSystem ? "⚙️" : isDM ? "🎭" : "🗣️"}
              </span>
              <strong style={{ 
                color: isSystem ? "#ff9800" : isDM ? "#ffd700" : "#4CAF50",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}>
                {isSystem ? "System" : isDM ? "DM" : "Player"}
              </strong>
            </div>
            <div
              style={{
                color: "#eee",
                lineHeight: "1.6",
                fontSize: "15px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word"
              }}
            >
              {entry.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}