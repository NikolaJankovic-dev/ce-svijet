import React from "react";

interface FallingSachetProps {
  x: number;
  onMiss: (id: number) => void;
  onSachetClick: (e: React.MouseEvent) => void;
  id: number;
  isGameOver: boolean;
  imageUrl: string;
  speed: number;
  zindex: number;
  sachetHeight: number;
  widthPercent: number;
}

const FallingSachet: React.FC<FallingSachetProps> = ({
  x,
  onMiss,
  onSachetClick,
  id,
  imageUrl,
  speed,
  zindex,
  sachetHeight,
  widthPercent,
}) => {
  return (
    <img
      src={imageUrl}
      alt="sachet"
      className="bottle"
      style={{
        position: "absolute",
        width: `${widthPercent}%`,
        height: sachetHeight + "px",
        paddingLeft: "5%",
        paddingRight: "5%",
        boxSizing: "border-box",
        objectFit: "contain",
        left: `${x}%`,
        animationName: "fall",
        animationTimingFunction: "linear",
        animationIterationCount: "1",
        animationDuration: speed + "ms",
        animationFillMode: "forwards",
        willChange: "transform",
        zIndex: zindex,
        cursor: "pointer",
      }}
      onAnimationEnd={() => {
        onMiss(id);
      }}
      onMouseDown={(event) => onSachetClick(event)}
    />
  );
};

export default FallingSachet;

