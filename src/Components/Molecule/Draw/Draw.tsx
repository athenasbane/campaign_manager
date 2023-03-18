import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DownloadIcon from "@mui/icons-material/Download";
import MapIcon from "@mui/icons-material/Map";
import ExploreIcon from "@mui/icons-material/Explore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { EnumModalSlice } from "Store/slices/modals";
import { useNavigate } from "react-router-dom";

export interface IDrawProps {
  open: boolean;
  closeModal: () => void;
  openSingleModal: (modal: EnumModalSlice) => void;
}

export interface IDrawListItem {
  displayText: string;
  path: string;
  icon: React.ReactElement;
}

export default function Draw({
  open,
  openSingleModal,
  closeModal,
}: IDrawProps) {
  const navigate = useNavigate();

  const topListItems: IDrawListItem[] = [
    {
      displayText: "World Map",
      path: "/world_map",
      icon: <ExploreIcon />,
    },
    {
      displayText: "Other Maps",
      path: "/list/maps",
      icon: <MapIcon />,
    },
    {
      displayText: "Session Recap",
      path: "/sessions",
      icon: <VisibilityIcon />,
    },
  ];

  const bottomListItems: IDrawListItem[] = [
    {
      displayText: "Lore",
      path: "/list/content",
      icon: <MenuBookIcon />,
    },
    {
      displayText: "Homebrew Documents",
      path: "/documents",
      icon: <DownloadIcon />,
    },
  ];

  const list = (
    <Box
      sx={{ width: "auto" }}
      role="presentation"
      onClick={closeModal}
      onKeyDown={closeModal}
    >
      <List>
        {topListItems.map((item) => (
          <ListItem key={item.displayText} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.displayText} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {bottomListItems.map((item) => (
          <ListItem key={item.displayText} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.displayText} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      <>
        <SwipeableDrawer
          anchor={"bottom"}
          open={open}
          onClose={closeModal}
          onOpen={() => openSingleModal(EnumModalSlice.Menu)}
        >
          {list}
        </SwipeableDrawer>
      </>
    </div>
  );
}
