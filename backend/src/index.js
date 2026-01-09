import express from "express";
import cors from "cors";

import campaignRoutes from "./routes/campaign.js";
import turnRoutes from "./routes/turn.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ✅ Routes
app.use(campaignRoutes);
app.use(turnRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
