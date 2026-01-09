import { useState, useEffect } from "react";
import { useCampaignStore } from "../state/campaignStore";
import { playTurn } from "../services/api";

export default function PlayerInput() {
  const [input, setInput] = useState("");
  const { campaign, party, updateFromDM, voiceMode, micListening, toggleMic } = useCampaignStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const dmResponse = await playTurn({ message: input, campaign, party });
      updateFromDM(dmResponse);

      if (voiceMode && dmResponse.aiResponse) {
        const utterance = new SpeechSynthesisUtterance(dmResponse.aiResponse);
        speechSynthesis.speak(utterance);
      }

      setInput("");
    } catch (err) {
      console.error("Error during turn:", err);
    }
  };

  useEffect(() => {
    if (!micListening) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const spoken = event.results[event.results.length - 1][0].transcript;
      setInput(spoken);
    };
    recognition.start();

    return () => recognition.stop();
  }, [micListening]);

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="What do you do?"
        style={{ width: "300px" }}
      />
      <button type="submit">Submit</button>
      <button type="button" onClick={toggleMic}>
        {micListening ? "Stop Listening" : "Listen"}
      </button>
    </form>
  );
}
