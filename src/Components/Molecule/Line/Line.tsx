interface LineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  divHeight: number;
  divWidth: number;
}

export default function Line({
  x1,
  y1,
  x2,
  y2,
  divHeight,
  divWidth,
}: LineProps) {
  return (
    <svg
      style={{ position: "absolute", zIndex: 98 }}
      height={divHeight}
      width={divWidth}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        style={{ stroke: "red", strokeWidth: 2 }}
      />
    </svg>
  );
}
