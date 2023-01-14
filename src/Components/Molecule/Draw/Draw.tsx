import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MapIcon from "@mui/icons-material/Map";
import MailIcon from "@mui/icons-material/Mail";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { EnumModalSlice } from "Store/slices/modals";
import { useNavigate } from "react-router-dom";

interface IDrawProps {
  open: boolean;
  closeModal: () => void;
  openSingleModal: (modal: EnumModalSlice) => void;
}

interface IDrawListItem {
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

  const listItems: IDrawListItem[] = [
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

  const list = (
    <Box
      sx={{ width: "auto" }}
      role="presentation"
      onClick={closeModal}
      onKeyDown={closeModal}
    >
      <List>
        {listItems.map((item) => (
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
        {["Tools & Rules"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
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
