import { useCallback, useRef } from "react";

export type CellPath = {
  iconId: string;
  path: number[];
  color: string;
  isDragging?: boolean;
};

export type CompletedPath = {
  iconId: string;
  points: number[];
  color: string;
};

export type GameState = {
  activePaths: CellPath[];
  completedPaths: CompletedPath[];
};

export type UseGameLogicOptions = {
  levelConfig: { icons: Array<{ id: string; color: string; positions: number[] }> };
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onLevelComplete: () => void;
};

export function useGameLogic({
  levelConfig,
  gameState,
  setGameState,
  onLevelComplete,
}: UseGameLogicOptions) {
  const dragData = useRef({
    dragging: false,
    startIndex: null as number | null,
    currentIcon: null as { id: string; color: string; positions: number[] } | null,
    currentPathIndex: null as number | null,
  });

  const gridSize =
    levelConfig.icons.length < 5
      ? levelConfig.icons.length + 1
      : levelConfig.icons.length;

  const isValidMove = useCallback((currentIndex: number, nextIndex: number, size: number) => {
    const cr = Math.floor(currentIndex / size);
    const cc = currentIndex % size;
    const nr = Math.floor(nextIndex / size);
    const nc = nextIndex % size;
    const horizontal = cr === nr && Math.abs(cc - nc) === 1;
    const vertical = cc === nc && Math.abs(cr - nr) === 1;
    return horizontal || vertical;
  }, []);

  const fillPathBetweenPoints = useCallback((startIndex: number, endIndex: number, size: number) => {
    if (startIndex === endIndex) return [];

    const startRow = Math.floor(startIndex / size);
    const startCol = startIndex % size;
    const endRow = Math.floor(endIndex / size);
    const endCol = endIndex % size;

    if (startRow !== endRow && startCol !== endCol) {
      return [];
    }

    const path: number[] = [];
    let currentRow = startRow;
    let currentCol = startCol;

    while (currentCol !== endCol) {
      currentCol += endCol > currentCol ? 1 : -1;
      path.push(currentRow * size + currentCol);
    }

    while (currentRow !== endRow) {
      currentRow += endRow > currentRow ? 1 : -1;
      path.push(currentRow * size + currentCol);
    }

    return path;
  }, []);

  const isPathComplete = useCallback((path: number[], icon: { positions: number[] }) => {
    return path.includes(icon.positions[0]) && path.includes(icon.positions[1]);
  }, []);

  const checkLevelCompletion = useCallback(
    (completedPaths: CompletedPath[]) => {
      const totalCells = gridSize * gridSize;
      const covered = new Set<number>();
      completedPaths.forEach((p) => p.points.forEach((i) => covered.add(i)));
      return covered.size === totalCells;
    },
    [gridSize]
  );

  const handleCellClick = useCallback(
    (index: number) => {
      const icon = levelConfig.icons.find((ic) => ic.positions.includes(index));

      if (icon) {
        setGameState((prev) => ({
          ...prev,
          activePaths: prev.activePaths.filter((p) => p.iconId !== icon.id),
          completedPaths: prev.completedPaths.filter((p) => p.iconId !== icon.id),
        }));

        dragData.current.dragging = true;
        dragData.current.startIndex = index;
        dragData.current.currentIcon = icon;
        dragData.current.currentPathIndex = gameState.activePaths.filter(
          (p) => p.iconId !== icon.id
        ).length;

        setGameState((prev) => ({
          ...prev,
          activePaths: [
            ...prev.activePaths.filter((p) => p.iconId !== icon.id),
            {
              iconId: icon.id,
              path: [index],
              color: icon.color,
              isDragging: true,
            },
          ],
        }));
      } else {
        const activePathIndex = gameState.activePaths.findIndex((p) => {
          const last = p.path[p.path.length - 1];
          return index === last;
        });

        if (activePathIndex !== -1 && !dragData.current.dragging) {
          const activePath = gameState.activePaths[activePathIndex];
          const pathIcon = levelConfig.icons.find((ic) => ic.id === activePath.iconId);
          if (pathIcon) {
            dragData.current.dragging = true;
            dragData.current.startIndex = index;
            dragData.current.currentIcon = pathIcon;
            dragData.current.currentPathIndex = activePathIndex;

            setGameState((prev) => ({
              ...prev,
              activePaths: prev.activePaths.map((p, i) =>
                i === activePathIndex ? { ...p, isDragging: true } : { ...p, isDragging: false }
              ),
            }));
          }
        }
      }
    },
    [levelConfig.icons, gameState.activePaths, setGameState]
  );

  const handleCellDown = useCallback((index: number) => {
    const icon = levelConfig.icons.find((icon: any) => icon.positions.includes(index));
    if (!icon) return;
  
    setGameState((prev) => ({
      ...prev,
      activePaths: prev.activePaths.filter((p) => p.iconId !== icon.id),
      completedPaths: prev.completedPaths.filter((p) => p.iconId !== icon.id),
    }));
  
    dragData.current.dragging = true;
    dragData.current.startIndex = index;
    dragData.current.currentIcon = icon;
    dragData.current.currentPathIndex = gameState.activePaths.filter(
      (p) => p.iconId !== icon.id
    ).length;
  
    setGameState((prev) => ({
      ...prev,
      activePaths: [
        ...prev.activePaths.filter((p) => p.iconId !== icon.id),
        { iconId: icon.id, path: [index], color: icon.color, isDragging: true },
      ],
    }));
  }, [levelConfig.icons, gameState.activePaths, setGameState]);
  

  const handleCellHover = useCallback(
    (index: number) => {
      const drag = dragData.current;
      if (!drag.dragging || !drag.currentIcon || drag.currentPathIndex === null) return;

      const currentIcon = drag.currentIcon;
      let currentPathIndex = drag.currentPathIndex;
      const currentActivePath = gameState.activePaths[currentPathIndex];
      if (!currentActivePath) return;

      const lastIndex = currentActivePath.path[currentActivePath.path.length - 1];
      const startingIndex = currentActivePath.path[0];
      const activeIconId = currentActivePath.iconId;

      let cellsToProcess = [index];
      if (!isValidMove(lastIndex, index, gridSize)) {
        const pathBetween = fillPathBetweenPoints(lastIndex, index, gridSize);
        if (!pathBetween.length) {
          return;
        }
        cellsToProcess = pathBetween;
      }

      const processedCells: number[] = [];
      let hitTarget = false;

      for (const cellIndex of cellsToProcess) {
        const blockingIcon = levelConfig.icons.find(
          (ic) => ic.id !== activeIconId && ic.positions.includes(cellIndex)
        );
        if (blockingIcon) {
          return;
        }

        const conflictingCompletedPath = gameState.completedPaths.find((p) =>
          p.points.includes(cellIndex)
        );
        const conflictingActivePath = gameState.activePaths.find(
          (p) => p.path.includes(cellIndex) && p.iconId !== activeIconId
        );

        if (conflictingCompletedPath || conflictingActivePath) {
          setGameState((prev) => {
            let nextCompleted = prev.completedPaths;
            let nextActive = prev.activePaths;

            if (conflictingCompletedPath) {
              nextCompleted = prev.completedPaths.filter((p) => p !== conflictingCompletedPath);
            }

            if (conflictingActivePath) {
              const removedIndex = prev.activePaths.findIndex((p) => p === conflictingActivePath);
              nextActive = prev.activePaths.filter((p) => p !== conflictingActivePath);

              if (conflictingActivePath.iconId === activeIconId) {
                dragData.current.dragging = false;
                dragData.current.currentIcon = null;
                dragData.current.currentPathIndex = null;

                return {
                  ...prev,
                  activePaths: nextActive,
                  completedPaths: nextCompleted,
                };
              }

              if (removedIndex > -1 && removedIndex < currentPathIndex) {
                currentPathIndex -= 1;
                dragData.current.currentPathIndex = currentPathIndex;
              }
            }

            return {
              ...prev,
              activePaths: nextActive,
              completedPaths: nextCompleted,
            };
          });

          if (conflictingActivePath && conflictingActivePath.iconId === activeIconId) {
            return;
          }
        }

        processedCells.push(cellIndex);

        if (currentIcon.positions.includes(cellIndex) && cellIndex !== startingIndex) {
          hitTarget = true;
          break;
        }
      }

      if (!processedCells.length) {
        return;
      }

      const pathIndexForCompletion = currentPathIndex;

      setGameState((prev) => {
        const pathEntry = prev.activePaths[pathIndexForCompletion];
        if (!pathEntry) {
          dragData.current.dragging = false;
          dragData.current.currentIcon = null;
          dragData.current.currentPathIndex = null;
          return prev;
        }

        const newCells = processedCells.filter((cellIndex) => !pathEntry.path.includes(cellIndex));
        if (!newCells.length) {
          return prev;
        }

        const nextActivePaths = prev.activePaths.map((p, i) =>
          i === pathIndexForCompletion ? { ...p, path: [...p.path, ...newCells] } : p
        );

        return { ...prev, activePaths: nextActivePaths };
      });

      if (hitTarget) {
        dragData.current.dragging = false;
        dragData.current.startIndex = null;
        dragData.current.currentIcon = null;
        dragData.current.currentPathIndex = null;
      }

      const finalIndex = processedCells[processedCells.length - 1];
      if (hitTarget && currentIcon.positions.includes(finalIndex) && finalIndex !== startingIndex) {
        setTimeout(() => {
          setGameState((prev) => {
            const path = prev.activePaths[pathIndexForCompletion];
            if (!path) {
              return prev;
            }

            const newActive = prev.activePaths.filter((_, i) => i !== pathIndexForCompletion);
            const completedEntry = {
              points: [...path.path],
              color: path.color,
              iconId: path.iconId,
            };
            const newCompleted = [...prev.completedPaths, completedEntry];

            if (checkLevelCompletion(newCompleted)) {
              setTimeout(() => onLevelComplete(), 500);
            }

            return { ...prev, activePaths: newActive, completedPaths: newCompleted };
          });

          dragData.current.dragging = false;
          dragData.current.startIndex = null;
          dragData.current.currentIcon = null;
          dragData.current.currentPathIndex = null;
        }, 100);
      }
    },
    [
      gameState.activePaths,
      gameState.completedPaths,
      gridSize,
      isValidMove,
      checkLevelCompletion,
      fillPathBetweenPoints,
      onLevelComplete,
      setGameState,
      levelConfig.icons,
    ]
  );

  const handleDragEnd = useCallback(() => {
    const drag = dragData.current;
    if (!drag.dragging || drag.currentPathIndex === null || !drag.currentIcon) return;

    const currentActivePath = gameState.activePaths[drag.currentPathIndex];
    if (!currentActivePath) {
      dragData.current.dragging = false;
      dragData.current.startIndex = null;
      dragData.current.currentIcon = null;
      dragData.current.currentPathIndex = null;
      return;
    }

    if (isPathComplete(currentActivePath.path, drag.currentIcon)) {
      setGameState((prev) => ({
        ...prev,
        activePaths: prev.activePaths.filter((_, i) => i !== drag.currentPathIndex),
        completedPaths: [
          ...prev.completedPaths,
          { points: [...currentActivePath.path], color: currentActivePath.color, iconId: currentActivePath.iconId },
        ],
      }));

      const newCompleted = [
        ...gameState.completedPaths,
        { points: [...currentActivePath.path], color: currentActivePath.color, iconId: currentActivePath.iconId },
      ];
      if (checkLevelCompletion(newCompleted)) {
        setTimeout(() => onLevelComplete(), 500);
      }
    } else {
      setGameState((prev) => ({
        ...prev,
        activePaths: prev.activePaths.map((p, i) =>
          i === drag.currentPathIndex ? { ...p, isDragging: false } : p
        ),
      }));
    }

    dragData.current.dragging = false;
    dragData.current.startIndex = null;
    dragData.current.currentIcon = null;
    dragData.current.currentPathIndex = null;
  }, [
    gameState.activePaths,
    gameState.completedPaths,
    isPathComplete,
    checkLevelCompletion,
    onLevelComplete,
    setGameState,
  ]);

  return { handleCellClick, handleCellDown, handleCellHover, handleDragEnd };
}
