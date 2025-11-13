import { useCallback, useEffect, useRef, useState } from "react";
import FallingSachet from "./falling-sachet";
import type { FallingSachetsProps, SachetAssetConfig } from "./falling-types";

// Helper function za weighted random izbor
const getWeightedRandomSachet = (configs: SachetAssetConfig[]): string => {
  const totalWeight = configs.reduce((sum, config) => sum + config.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const config of configs) {
    random -= config.weight;
    if (random <= 0) {
      return config.url;
    }
  }
  
  // Fallback na prvi (ne bi trebalo da se desi)
  return configs[0].url;
};

const screenHeight = typeof window !== "undefined" ? window.innerHeight : 800;
const DEFAULT_BOTTLE_HEIGHT = screenHeight / 4;
const DEFAULT_LANES = 4;
const DEFAULT_INITIAL_SPEED = 2500;
const DEFAULT_SPEED_DECREASE = 150;
const DEFAULT_MINIMUM_SPEED = 500;
const DEFAULT_SPEED_INCREASE_RATE = 0.2;
const DEFAULT_LEVEL_UP_RATE = 5000;
const DEFAULT_LIVES = 1;

interface GameState {
  sachets: {
    id: number;
    x: number;
    speed: number;
    zindex: number;
    imageUrl: string;
  }[];
  lives: number;
}

const FallingSachets = ({
  backgroundImageUrl,
  sachetAssetConfigs,
  onGameEnd,
  initialSpeed = DEFAULT_INITIAL_SPEED,
  speedIncreaseRate = DEFAULT_SPEED_INCREASE_RATE,
  spawnIntervalMs,
  lanes = DEFAULT_LANES,
  onScoreChange,
}: FallingSachetsProps) => {
  const [score, setScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(initialSpeed);
  const [gameState, setGameState] = useState<GameState>({
    sachets: [],
    lives: DEFAULT_LIVES,
  });
  const totalSachetsRef = useRef<number>(0);
  
  const gameArea = useRef<HTMLDivElement>(null);
  const prevLaneRef = useRef<number>(-1);
  const sachetHeight = DEFAULT_BOTTLE_HEIGHT;

  // Preload slike
  useEffect(() => {
    sachetAssetConfigs.forEach((config) => {
      const img = new Image();
      img.src = config.url;
    });
  }, [sachetAssetConfigs]);

  // Kreiranje lane array-a
  const laneWidth = 100 / lanes;

  const spawnSachet = useCallback((sachetCount: number, currentGameSpeed: number, currentTotalSachets: number) => {
    // Ubrzavanje svakih 5 sacheta
    if (sachetCount % 5 === 0 && sachetCount !== 0) {
      setGameSpeed((prev) => {
        const newSpeed = prev - DEFAULT_SPEED_DECREASE;
        return Math.max(newSpeed, DEFAULT_MINIMUM_SPEED);
      });
    }

    // Kreiranje lane array-a
    const laneArray = Array.from({ length: lanes }, (_, i) => i);
    // Izbor lane-a (ne sme biti isti kao prethodni)
    const availableLanes = laneArray.filter((lane) => lane !== prevLaneRef.current);
    const randomLane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    prevLaneRef.current = randomLane;

    // Weighted random izbor slike
    const selectedImageUrl = getWeightedRandomSachet(sachetAssetConfigs);

    const newSachet = {
      id: Date.now() + Math.random(),
      x: randomLane * laneWidth,
      speed: currentGameSpeed,
      zindex: 999 - currentTotalSachets,
      imageUrl: selectedImageUrl,
    };

    setGameState((prevState) => ({
      ...prevState,
      sachets: [...prevState.sachets, newSachet],
    }));
  }, [lanes, laneWidth, sachetAssetConfigs]);

  const onMissedSachet = (id: number) => {
    setGameState((prevState) => {
      const updatedSachets = prevState.sachets.filter((sachet) => sachet.id !== id);
      const newLives = prevState.lives - 1;
      
      if (newLives <= 0) {
        setIsGameOver(true);
      }
      
      return {
        ...prevState,
        lives: newLives,
        sachets: updatedSachets,
      };
    });
  };

  const onCaughtSachet = (event: React.MouseEvent, id: number) => {
    event.stopPropagation();
    const newScore = score + 1;
    setScore(newScore);
    
    if (onScoreChange) {
      onScoreChange(newScore);
    }

    setGameState((prevState) => ({
      ...prevState,
      sachets: prevState.sachets.filter((sachet) => sachet.id !== id),
    }));
  };

  const handleMissedClick = (event: React.MouseEvent) => {
    if (isGameOver) return;

    const target = event.target as HTMLElement;
    if (target.className.includes("bottle") || target.closest(".bottle")) {
      return;
    }

    setIsGameOver(true);
  };

  // Callback za game end
  useEffect(() => {
    if (isGameOver) {
      onGameEnd({ score, elapsedTime });
    }
  }, [isGameOver, score, elapsedTime, onGameEnd]);

  // Timer za spawnovanje sacheta
  useEffect(() => {
    if (isGameOver) return;

    const calculatedInterval =
      spawnIntervalMs ||
      (sachetHeight / (screenHeight + sachetHeight)) * gameSpeed;

    const interval = setInterval(() => {
      totalSachetsRef.current += 1;
      const currentCount = totalSachetsRef.current;
      spawnSachet(currentCount, gameSpeed, currentCount);
    }, calculatedInterval);

    return () => {
      clearInterval(interval);
    };
  }, [isGameOver, gameSpeed, spawnIntervalMs, sachetHeight, spawnSachet]);

  // Timer za elapsed time
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isGameOver]);

  // Timer za level up (ubrzavanje)
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      if (isGameOver) {
        clearInterval(interval);
        return;
      }

      setGameSpeed((prevSpeed) => {
        const decrease = DEFAULT_SPEED_DECREASE * speedIncreaseRate;
        const newSpeed = prevSpeed - decrease;
        return Math.max(newSpeed, DEFAULT_MINIMUM_SPEED);
      });
    }, DEFAULT_LEVEL_UP_RATE);

    return () => {
      clearInterval(interval);
    };
  }, [isGameOver]);

  return (
    <div
      onClick={handleMissedClick}
      style={{
        width: "100%",
        height: "100vh",
        margin: "0 auto",
        padding: 0,
        overflow: "hidden",
        position: "relative",
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        ref={gameArea}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <style>
          {`
            @keyframes fall {
              0% {
                transform: translateY(-${sachetHeight}px);
              }
              100% {
                transform: translateY(100vh);
              }
            }
          `}
        </style>

        {gameState.sachets.map((sachet) => (
          <FallingSachet
            key={sachet.id}
            id={sachet.id}
            x={sachet.x}
            speed={sachet.speed}
            onMiss={onMissedSachet}
            onSachetClick={(e) => onCaughtSachet(e, sachet.id)}
            isGameOver={isGameOver}
            imageUrl={sachet.imageUrl}
            zindex={sachet.zindex}
            sachetHeight={sachetHeight}
            widthPercent={laneWidth}
          />
        ))}

        {/* Score display */}
        <div
          style={{
            position: "fixed",
            top: "1vh",
            right: "1vh",
            backgroundColor: "#fff",
            padding: "5px 10px",
            borderRadius: "4px",
            zIndex: 1000,
          }}
        >
          <span
            style={{
              fontSize: "2vh",
              color: "#00A6C6",
              fontWeight: "bold",
            }}
          >
            {score}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FallingSachets;
export type { FallingSachetsProps, SachetAssetConfig, FallingSachetsState } from "./falling-types";

