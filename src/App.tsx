import { useState } from "react";
import BackgroundImage from "./falling-sachets/assets/ui/falling-background.png";
import cocktaBlondie from "./falling-sachets/assets/bottles/cockta_blondie.png";
import cocktaFree from "./falling-sachets/assets/bottles/cockta_free.png";
import cocktaOriginal from "./falling-sachets/assets/bottles/cockta_original.png";
import FallingSachets from "./falling-sachets/components/falling-game";
import type { FallingSachetsState } from "./falling-sachets/components/falling-types";

function App() {
  const [finalScore, setFinalScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  const handleGameEnd = (state: FallingSachetsState) => {
    console.log("Score:", state.score);
    console.log("Time:", state.elapsedTime);
    setFinalScore(state.score);
    setFinalTime(state.elapsedTime);
    setGameEnded(true);
  };

  return (
    <>
      <FallingSachets
        backgroundImageUrl={BackgroundImage}
        sachetAssetConfigs={[
          { url: cocktaOriginal, weight: 4 },
          { url: cocktaFree, weight: 3 },
          { url: cocktaBlondie, weight: 3 },
        ]}
        onScoreChange={(score) => {
          console.log("Score:", score);
        }}
        onGameEnd={handleGameEnd}
        lanes={4}
        initialSpeed={2500}
      />

      {/* Prikaži rezultate nakon završetka igre */}
      {gameEnded && (
        <div
          style={{
            position: "absolute",
            top: "0%",
            left: "0%",
            right: "0%",
            bottom: "0%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div style={{
            backgroundColor: "white",
            padding: "20px 40px",
            borderRadius: "8px",
            zIndex: 2000,
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}>
            <h2>Igra završena!</h2>
            <p>Rezultat: {finalScore}</p>
            <p>Vreme: {finalTime}s</p>
            <button
              onClick={() => {
                setGameEnded(false);
                setFinalScore(0);
                setFinalTime(0);
                window.location.reload();
              }}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                backgroundColor: "#00A6C6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Igraj ponovo
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
