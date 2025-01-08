import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import MapIcon from "@mui/icons-material/Map";
import { Typography } from "@mui/material";
import { StyledBox } from "./MapToolBarStyled";

interface MapToolBarProps {
  handleToolBarChange: (_: React.SyntheticEvent, newValue: number) => void;
  activeTool: number | null;
}

export default function MapToolBar({
  handleToolBarChange,
  activeTool,
}: MapToolBarProps) {
  return (
    <StyledBox>
      <Tabs value={activeTool} onChange={handleToolBarChange} aria-label="Tabs">
        <Tab
          value={1}
          label={
            <>
              <MapIcon />
              <Typography>Check Distance</Typography>
            </>
          }
        />
      </Tabs>
    </StyledBox>
  );
}
