import Tooltip from "@mui/material/Tooltip";
import FmdGoodIcon from "@mui/icons-material/FmdGood";

export interface PinProps {
  top: number;
  left: number;
  isVisable: boolean;
  name?: string;
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

export default function Pin({ top, left, isVisable, color, name }: PinProps) {
  return (
    <Tooltip
      title={name ? name : `y: ${top}, x: ${left}`}
      style={{
        visibility: isVisable ? undefined : "hidden",
      }}
    >
      <FmdGoodIcon
        color={color}
        style={{
          position: "absolute",
          top: (top || 0) - 20,
          left: (left || 0) - 10,
          height: 20,
          width: 20,
          zIndex: 99,
          visibility: isVisable ? undefined : "hidden",
        }}
      />
    </Tooltip>
  );
}
