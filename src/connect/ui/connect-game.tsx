import React from "react";
import type { ConnectGameProps } from "../lib/types";
import { ConnectWrapper } from "./connect-wrapper";
import { ConnectGrid } from "./connect-grid";
import { defaultAssets } from "../lib/default";



export const ConnectGame: React.FC<ConnectGameProps> = ({
  level,
  assets = defaultAssets,
  onLevelComplete,
  onGameEnd,
  timeLimitSeconds = 60,
}) => {
  return (
    <ConnectWrapper
      timeLimitSeconds={timeLimitSeconds}
      onGameEnd={onGameEnd}
    >
      <ConnectGrid
        level={level}
        assets={assets}
        onLevelComplete={onLevelComplete}
      />
    </ConnectWrapper>
  );
};
