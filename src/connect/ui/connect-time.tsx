type ConnectTimeProps = {
    time: number;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    className?: string;
    style?: React.CSSProperties;
  };
  
  const posToStyle = (p: NonNullable<ConnectTimeProps["position"]>): React.CSSProperties => {
    const base: React.CSSProperties = { position: "absolute" };
    switch (p) {
      case "top-right": return { ...base, top: "10vh", right: 0 };
      case "bottom-left": return { ...base, bottom: "10vh", left: 0 };
      case "bottom-right": return { ...base, bottom: "10vh", right: 0 };
      default: return { ...base, top: "10vh", left: 0 };
    }
  };
  
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };
  
  export const ConnectTime = ({ time, position = "top-left", className, style }: ConnectTimeProps) => {
    return (
      <div
        style={{
          ...posToStyle(position),
          backgroundColor: "#A7A9AC",
          padding: "1.25vh 1.25vw",
          borderRadius: "1.5vh",
          borderTopLeftRadius: position.includes("left") ? 0 : "1.5vh",
          borderBottomLeftRadius: position.includes("left") ? 0 : "1.5vh",
          borderTopRightRadius: position.includes("right") ? 0 : "1.5vh",
          borderBottomRightRadius: position.includes("right") ? 0 : "1.5vh",
          boxShadow:
            "inset -0.25vh -0.25vh 0.5vh #444, 0.2vh 0.6vh 0.25vh 0.5vh #00000044, inset 0.25vh 0.25vh 0.5vh #eee",
          transform: "translate(-1px, 0)",
          ...style,
        }}
        className={className}
        aria-live="polite"
      >
        <div
          style={{
            backgroundColor: "#939598",
            padding: "1.25vh 2.5vh",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "5vh",
            textShadow: "0.5vh 0.5vh 1vh #444",
            boxShadow: "inset 0.6vh 0.8vh 0.5vh 0.25vh #666, 0.5vh 0.5vh 1vh #ccc",
          }}
        >
          {formatTime(time)}
        </div>
      </div>
    );
  };
  