import { useState } from "react";
import DMSetup from "../components/DMSetup.jsx";
import Play from "./Play.jsx";
import { useCampaignStore } from "../state/campaignStore";

export default function Setup() {
  const [started, setStarted] = useState(false);
  const campaign = useCampaignStore((state) => state.campaign);

  // 🔥 Force onStart always exists
  const handleStartCampaign = () => setStarted(true);

  return (
    <div>
      {!started || !campaign ? (
        <DMSetup onStart={handleStartCampaign} />
      ) : (
        <Play />
      )}
    </div>
  );
}
