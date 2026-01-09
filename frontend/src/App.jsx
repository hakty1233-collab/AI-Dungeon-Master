import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DMSetup from "./components/DMSetup";
import GameScreen from "./components/GameScreen";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DMSetup />} />
        <Route path="/play" element={<GameScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
