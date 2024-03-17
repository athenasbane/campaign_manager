import Tooltip from "@mui/material/Tooltip";
import FmdGoodIcon from "@mui/icons-material/FmdGood";

export interface PinProps {
  top: number;
  left: number;
  isVisable: boolean;
  color?:
    | "inherit"
    | "disabled"
    | "action"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
}

export default function Pin({ top, left, isVisable, color }: PinProps) {
  return (
    <Tooltip
      title={`x: ${top}, y: ${left}`}
      style={{
        visibility: isVisable ? undefined : "hidden",
      }}
    >
      <FmdGoodIcon
        color={color}
        style={{
          position: "absolute",
          top: top - 20,
          left: left - 10,
          height: 20,
          width: 20,
          zIndex: 1001,
          visibility: isVisable ? undefined : "hidden",
        }}
      />
    </Tooltip>
  );
}
