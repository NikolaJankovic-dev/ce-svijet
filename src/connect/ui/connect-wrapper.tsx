import { useEffect, useRef, useState } from "react";
import { ConnectTime } from "./connect-time";

type ConnectWrapperProps = {
  children: React.ReactNode;
  timeLimitSeconds?: number;
  onGameEnd: () => void;
  style?: React.CSSProperties;
};

export const ConnectWrapper = ({
  children,
  timeLimitSeconds = 60,
  onGameEnd,
  style,
}: ConnectWrapperProps) => {
  const [currentTime, setCurrentTime] = useState(timeLimitSeconds);
  const gameOverCalled = useRef(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentTime(timeLimitSeconds);
    gameOverCalled.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [timeLimitSeconds]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setCurrentTime((prev: number) => {
        const next = Math.max(prev - 1, 0);

        if (next === 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (!gameOverCalled.current) {
            gameOverCalled.current = true;
            onGameEnd();
          }
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [onGameEnd]);

  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, #f58a00 0%, #ffb400 40%, #ffc300 100%)",
        minHeight: "100vh",
        position: "relative",
        ...style,
      }}
    >
      <ConnectTime time={currentTime} />
      {children}
    </div>
  );
};
