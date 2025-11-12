import { useMemo } from "react";
import type { IconAsset } from "../lib/types";

export type LevelIcon = {
  id: string;
  icon: string;
  color: string;
  positions: number[];
  name: string;
  index: number;
};

export type LevelConfigResult = { icons: LevelIcon[] };

const createIcon =
  (assets: IconAsset[]) =>
  (iconIdx: number, positions: number[], index = iconIdx): LevelIcon => {
    const a = assets[iconIdx];
    return {
      id: `${a.color}-${index}`,
      icon: a.icon,
      color: a.color,
      positions,
      name: a.color,
      index,
    };
  };

function makeLevelTable(assets: IconAsset[]) {
  const C = createIcon(assets);
  return {
    1: [
      [C(0, [0, 1], 0), C(1, [2, 8], 1)],
      [C(0, [0, 4], 0), C(1, [1, 6], 1)],
    ],
    2: [
      [C(0, [0, 7], 0), C(1, [10, 12], 1), C(2, [9, 11], 2)],
      [C(0, [6, 9], 0), C(1, [4, 10], 1), C(2, [0, 7], 2)],
    ],
    3: [
      [C(0, [3, 12], 0), C(1, [4, 6], 1), C(2, [13, 16], 2), C(3, [14, 15], 3)],
      [C(0, [8, 20], 0), C(1, [13, 24], 1), C(2, [0, 14], 2), C(3, [17, 19], 3)],
    ],
    4: [C(0, [1, 12], 0), C(1, [4, 13], 1), C(2, [16, 18], 2), C(3, [3, 6], 3), C(4, [14, 15], 4)],
    5: [C(0, [7, 21], 0), C(1, [3, 29], 1), C(2, [22, 25], 2), C(3, [24, 35], 3), C(4, [0, 10], 4), C(5, [13, 16], 5)],
    6: [C(0, [26, 30], 0), C(1, [2, 15], 1), C(2, [1, 13], 2), C(3, [12, 31], 3), C(4, [4, 35], 4), C(5, [3, 34], 5)],
    7: [C(0, [7, 28], 0), C(1, [0, 34], 1), C(2, [1, 35], 2), C(3, [8, 22], 3), C(4, [15, 21], 4), C(5, [14, 20], 5)],
    8: [C(0, [0, 1], 0), C(1, [16, 34], 1), C(2, [2, 5], 2), C(3, [8, 23], 3), C(4, [15, 33], 4), C(5, [14, 20], 5)],
    9: [C(0, [14, 28], 0), C(1, [6, 32], 1), C(2, [19, 22], 2), C(3, [25, 35], 3), C(4, [0, 11], 4), C(5, [10, 13], 5)],
    10:[C(0, [0, 13], 0), C(1, [17, 21], 1), C(2, [9, 11], 2), C(3, [3, 6], 3), C(4, [23, 24], 4), C(5, [29, 30], 5)],
  } as const;
}

export function useLevelConfig(level: number, assets: IconAsset[]): LevelConfigResult {
  return useMemo(() => {
    if (!assets?.length) return { icons: [] };
    const table = makeLevelTable(assets);
    const config = (table as any)[level];
    if (!config) throw new Error(`Level ${level} not found`);
    if (Array.isArray(config[0])) {
      const idx = Math.floor(Math.random() * config.length);
      return { icons: config[idx] as LevelIcon[] };
    }
    return { icons: config as LevelIcon[] };
  }, [level, assets]);
}
