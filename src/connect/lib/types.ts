export type IconAsset = {
    icon: string;
    color: string;
  };
  
  export type ConnectGameProps = {
    level: number;
    assets?: IconAsset[];
    onLevelComplete: () => void;
    onGameEnd: () => void;
    timeLimitSeconds?: number;
  };
  
  