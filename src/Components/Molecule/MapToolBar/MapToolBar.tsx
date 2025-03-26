import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import MapIcon from "@mui/icons-material/Map";
import { Typography } from "@mui/material";
import { StyledBox } from "./MapToolBarStyled";
import { Search } from "@mui/icons-material";

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
        <Tab
          value={2}
          label={
            <>
              <Search />
              <Typography>Zoom</Typography>
            </>
          }
        />
      </Tabs>
    </StyledBox>
  );
}
