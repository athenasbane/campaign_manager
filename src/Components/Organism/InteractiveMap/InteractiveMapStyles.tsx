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
