import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MapIcon from "@mui/icons-material/Map";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { EnumModalSlice } from "Store/slices/modals";
import { useNavigate } from "react-router-dom";

export interface IDrawProps {
  open: boolean;
  closeModal: () => void;
  openSingleModal: (modal: EnumModalSlice) => void;
}

export interface IDrawListItem {
  displayLabel: string;
  routePath: string;
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
      displayLabel: "Maps",
      routePath: "/list/maps",
      icon: <MapIcon />,
    },
    {
      displayLabel: "Session Recap",
      routePath: "/sessions",
      icon: <VisibilityIcon />,
    },
  ];

  const bottomListItems: IDrawListItem[] = [
    {
      displayLabel: "Lore",
      routePath: "/list/content",
      icon: <MenuBookIcon />,
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
          <ListItem key={item.displayLabel} disablePadding>
            <ListItemButton onClick={() => navigate(item.routePath)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.displayLabel} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {bottomListItems.map((item) => (
          <ListItem key={item.displayLabel} disablePadding>
            <ListItemButton onClick={() => navigate(item.routePath)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.displayLabel} />
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
