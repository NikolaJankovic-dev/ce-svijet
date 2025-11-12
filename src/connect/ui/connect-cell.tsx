import React, { useMemo } from "react";
import { Rect, Image as KonvaImage } from "react-konva";
import useImage from "use-image";



export type ConnectCellProps = {
  x: number;
  y: number;
  size: number;
  index: number;
  icon?: any;
  onClick: () => void;
};
export const ConnectCell: React.FC<ConnectCellProps> = ({
  x,
  y,
  size,
  icon,
  onClick,
}) => {
  const [image] = useImage(icon?.icon || "", "anonymous");

  const normalizedImage = useMemo(() => {
    if (!image) return null;

    const maxSize = size * 0.8;
    const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;

    const offsetX = x + (size - drawWidth) / 2 + 15;
    const offsetY = y + (size - drawHeight) / 2;

    return { drawWidth, drawHeight, offsetX, offsetY };
  }, [image, size, x, y]);

  return (
    <>
      <Rect
        x={x}
        y={y}
        width={size}
        height={size}
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        stroke="#743c00"
        strokeWidth={0.5}
        onPointerDown={onClick}
      />
   
      {icon && image && (
        <KonvaImage
          image={image}
          x={normalizedImage?.offsetX ?? x + size * 0.1}
          y={normalizedImage?.offsetY ?? y + size * 0.1}
          width={normalizedImage?.drawWidth ?? size * 0.8}
          height={normalizedImage?.drawHeight ?? size * 0.8}
          listening={false}
        />
      )}
    </>
  );
};
