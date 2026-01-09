// Initialize campaign state
export function initCampaign({ theme, difficulty, party }) {
  return {
    theme,
    difficulty,
    party: party.map((p) => ({
      ...p,
      hp: p.hp || 100,
      status: p.status || "Healthy",
    })),
    history: [],
    systemPrompt: `
      You are a master Dungeon Master.
      Campaign Theme: ${theme}, Difficulty: ${difficulty}.
      Describe the adventure vividly and react to players' actions.
      Include HP/status changes if combat occurs.
    `,
    gameState: {
      turn: 0,
      enemies: [],
      environment: "Starting area",
    },
  };
}
