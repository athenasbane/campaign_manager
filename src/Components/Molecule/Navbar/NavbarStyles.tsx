import Box from "@mui/material/Box";
import styled from "@mui/material/styles/styled";
import { keyframes } from "@mui/material/styles";

const sparkAnimation = keyframes`
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
`;

export const StyledNavbar = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  width: "100vw",
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(4),
  backgroundColor: "#111",
}));

interface SparkProps {
  top: string;
  left: string;
  delay: string;
}

export const Spark = styled("span", {
  shouldForwardProp: (prop) => !["top", "left", "delay"].includes(prop as string),
})<SparkProps>(({ top, left, delay }) => ({
  position: "absolute",
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: "#00d4ff",
  boxShadow: "0 0 8px 4px rgba(0,212,255,0.8)",
  opacity: 0,
  top,
  left,
  animation: `${sparkAnimation} 2s linear infinite`,
  animationDelay: delay,
}));
