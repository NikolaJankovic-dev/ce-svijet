import React, { useState, useMemo, useEffect } from "react";
import { Stage, Layer, Rect, Line, Circle, Image as KonvaImage } from "react-konva";
import { useGameLogic, type GameState } from "../hooks/useGameLogic";
import { ConnectCell } from "./connect-cell";
import { useLevelConfig } from "../hooks/useLevelConfig";
import type { IconAsset } from "../lib/types";
import gameBg from "../assets/ui/game-bg.png";
import ram from "../assets/ui/ram.png";
import useImage from "use-image";

export type ConnectGridProps = {
  level: number;
  assets: IconAsset[];
  onLevelComplete: () => void;
};

export const ConnectGrid: React.FC<ConnectGridProps> = ({
  level,
  assets,
  onLevelComplete,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    activePaths: [],
    completedPaths: [],
  });

  useEffect(() => {
    setGameState({ activePaths: [], completedPaths: [] });
  }, [level]);

  const levelConfig = useLevelConfig(level, assets);
  const { handleCellDown, handleCellHover, handleDragEnd } = useGameLogic({
    levelConfig,
    gameState,
    setGameState,
    onLevelComplete,
  });

  const boardSize = useMemo(() => {
    const screenSize = Math.min(window.innerHeight, window.innerWidth);
    return screenSize - screenSize / 5;
  }, []);

  const gridSize =
    levelConfig.icons.length < 5
      ? levelConfig.icons.length + 1
      : levelConfig.icons.length;

  const cellSize = useMemo(
    () => (boardSize - boardSize / 7.54) / gridSize,
    [boardSize, gridSize]
  );

  if (!levelConfig.icons.length) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: boardSize,
          height: boardSize,
          border: "2px solid #743c00",
        }}
      >
        <p>No level configuration found</p>
      </div>
    );
  }

  const boardPadding = boardSize / 7.54 / 2;
  const innerBoardSize = boardSize - boardSize / 7.54;

  const [frameImage] = useImage(ram);
  const [boardBgImage] = useImage(gameBg);
  const getCellCoords = (index: number) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const x = boardPadding + col * cellSize;
    const y = boardPadding + row * cellSize;
    return { x, y };
  };

  const getCellCenter = (index: number) => {
    const { x, y } = getCellCoords(index);
    return { cx: x + cellSize / 2, cy: y + cellSize / 2 };
  };

  const renderPipeline = (
    cells: number[],
    color: string,
    opacity: number,
    key: string
  ) => {
    if (!cells.length) return null;

    const pipeWidth = cellSize * 0.45;
    const startRadius = pipeWidth / 2;

    const points = cells.flatMap((idx) => {
      const { cx, cy } = getCellCenter(idx);
      return [cx, cy];
    });

    const startCenter = getCellCenter(cells[0]);

    return (
      <React.Fragment key={key}>
        {cells.length > 1 && (
          <Line
            points={points}
            stroke={color}
            strokeWidth={pipeWidth}
            lineCap="round"
            lineJoin="round"
            opacity={opacity}
            listening={false}
          />
        )}
        <Circle
          x={startCenter.cx}
          y={startCenter.cy}
          radius={startRadius}
          fill={color}
          opacity={opacity}
          listening={false}
        />
      </React.Fragment>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Stage
        width={boardSize}
        height={boardSize}
        onMouseUp={handleDragEnd}
        onMouseMove={(e) => {
          if (gameState.activePaths.some((p) => p.isDragging)) {
            const pos = e.target.getStage()?.getPointerPosition();
            if (!pos) return;

            const x = pos.x - boardSize / 7.54 / 2;
            const y = pos.y - boardSize / 7.54 / 2;
            const col = Math.floor(x / cellSize);
            const row = Math.floor(y / cellSize);
            const index = row * gridSize + col;

            if (index >= 0 && index < gridSize * gridSize) {
              handleCellHover(index);
            }
          }
        }}
        style={{
          borderRadius: "60px",
        }}
      >
        <Layer listening={false}>
          {boardBgImage && (
            <KonvaImage
              image={boardBgImage}
              x={boardPadding}
              y={boardPadding}
              width={innerBoardSize}
              height={innerBoardSize}
            />
          )}
        </Layer>

        <Layer
          clipX={boardPadding}
          clipY={boardPadding}
          clipWidth={innerBoardSize}
          clipHeight={innerBoardSize}
        >
          <Rect
            x={boardPadding}
            y={boardPadding}
            width={innerBoardSize}
            height={innerBoardSize}
            fill={"rgba(0,0,0,0)"}
          />

          {gameState.completedPaths.map((path, pathIdx) => (
            <React.Fragment key={`path-${pathIdx}`}>
              {path.points.map((index, i) => {
                const { x, y } = getCellCoords(index);

                return (
                  <Rect
                    key={`completed-${pathIdx}-${i}`}
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={path.color}
                    opacity={0.3}
                  />
                );
              })}
              {renderPipeline(path.points, path.color, 0.9, `completed-pipe-${pathIdx}`)}
            </React.Fragment>
          ))}

          {gameState.activePaths.map((path, pathIdx) => (
            <React.Fragment key={`active-${pathIdx}`}>
              {path.path.map((index, i) => {
                const { x, y } = getCellCoords(index);

                return (
                  <Rect
                    key={`active-${pathIdx}-${i}`}
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={path.color}
                    opacity={path.isDragging ? 0.25 : 0.15}
                  />
                );
              })}
              {renderPipeline(
                path.path,
                path.color,
                path.isDragging ? 0.9 : 0.7,
                `active-pipe-${pathIdx}`
              )}
            </React.Fragment>
          ))}
        </Layer>

        <Layer>
          {Array.from({ length: gridSize * gridSize }, (_, index) => {
            const { x, y } = getCellCoords(index);

            const icon = levelConfig.icons.find((icon) =>
              icon.positions.includes(index)
            );

            return (
              <ConnectCell
                key={index as number}
                x={x as number}
                y={y as number}
                size={cellSize as number}
                index={index as number}
                icon={icon as any}
                onClick={() => handleCellDown(index as number)}
              />
            );
          })}
        </Layer>

        <Layer listening={false}>
          {frameImage && (
            <KonvaImage image={frameImage} width={boardSize} height={boardSize} />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
