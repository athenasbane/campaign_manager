import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

export const StyledMapContainer = styled(Box)(({ theme }) => ({
  minHeight: 420,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  ".leaflet-container": {
    background: theme.palette.background.default,
  },
  ".leaflet-popup": {
    maxWidth: "min(320px, calc(100vw - 48px))",
  },
  ".leaflet-popup-content-wrapper": {
    maxWidth: "min(320px, calc(100vw - 48px))",
  },
  ".leaflet-popup-content": {
    boxSizing: "border-box",
    maxWidth: "calc(100vw - 80px)",
    margin: theme.spacing(1.5),
    overflowWrap: "break-word",
    whiteSpace: "normal",
  },
  ".leaflet-tooltip": {
    maxWidth: "calc(100vw - 48px)",
    overflowWrap: "break-word",
    whiteSpace: "normal",
  },
  ".interactive-map-street-label-marker": {
    background: "transparent",
    border: 0,
    pointerEvents: "none",
  },
  ".interactive-map-street-label": {
    color: "#fff4d6",
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    left: 0,
    letterSpacing: 0,
    lineHeight: 1,
    maxWidth: 180,
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
    textAlign: "center",
    textOverflow: "ellipsis",
    textShadow:
      "0 1px 2px rgba(0, 0, 0, 0.85), 0 -1px 2px rgba(0, 0, 0, 0.85)",
    top: 0,
    transform:
      "translate(-50%, -50%) rotate(var(--street-label-angle, 0deg))",
    transformOrigin: "center",
    whiteSpace: "nowrap",
  },
}));

export const FeatureSearch = styled(Paper)(({ theme }) => ({
  width: 280,
  maxHeight: 640,
  overflow: "auto",
  padding: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    width: "100%",
    maxHeight: 260,
  },
}));

export const DetailPanel = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
}));

export const DmToolsPanel = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
}));
