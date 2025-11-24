import { useState } from "react";
import "./App.css";
import { ConnectGame } from "./connect";
// import { ConnectGame } from "@/components/connect-game";

function App() {
  const [level, setLevel] = useState(1);

  return (
    <>
      <ConnectGame
        level={level}
        onLevelComplete={() => setLevel(level + 1)}
        onGameEnd={() => {
          console.log("Game ended");
        }}
      />
    </>
  );
}

export default App;