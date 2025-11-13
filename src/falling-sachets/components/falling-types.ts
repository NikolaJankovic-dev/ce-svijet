export type SachetAssetConfig = {
  url: string;
  weight: number;
};

export type FallingSachetsState = {
  score: number;
  elapsedTime: number;
};

export type FallingSachetsProps = {
  backgroundImageUrl: string;
  sachetAssetConfigs: SachetAssetConfig[];
  onGameEnd: (state: FallingSachetsState) => void;
  initialSpeed?: number; // default: 10
  speedIncreaseRate?: number; // default: 0.2 (smanjuje se svakih 5 boca)
  spawnIntervalMs?: number; // default: dinamički izračunato
  lanes?: number; // default: 4
  onScoreChange?: (score: number) => void; // callback pri hvatanju
};

