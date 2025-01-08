import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DownloadIcon from "@mui/icons-material/Download";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MapIcon from "@mui/icons-material/Map";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { EnumModalSlice } from "../../../Store/slices/modals";
import { useNavigate } from "react-router-dom";
import { BookOutlined } from "@mui/icons-material";
import { IDrawListItem } from "../../../Types/Interfaces/DrawListItem";
import DrawItem from "../DrawItem/DrawItem";
import { StyledBox, StyledSwipeableDrawer } from "./DrawStyled";

export interface IDrawProps {
  open: boolean;
  closeModal: () => void;
  openSingleModal: (modal: EnumModalSlice) => void;
}

export default function Draw({
  open,
  openSingleModal,
  closeModal,
}: IDrawProps) {
  const navigate = useNavigate();

  /**
   * [TODO]
   * Move these to contentful
   * Will need to create a icon component that has a
   * Dropdown in contentful that uses the selected Icon
   */
  const topListItems: IDrawListItem[] = [
    {
      displayText: "Maps",
      path: "/list/4bOnoLNoNujSq6sWnG6BEt",
      icon: <MapIcon />,
    },
    {
      displayText: "Session Recap",
      path: "/sessions",
      icon: <VisibilityIcon />,
    },
    {
      displayText: "Missions",
      path: "/missions",
      icon: <AssignmentIcon />,
    },
  ];

  const bottomListItems: IDrawListItem[] = [
    {
      displayText: "Lore",
      path: "/list/6FoUmw8ML88eBJ1fSHO0A8",
      icon: <MenuBookIcon />,
    },
    {
      displayText: "Tales from Teratin",
      path: "/list/1iLinkQTnQ1Q9qqzLGW37v",
      icon: <BookOutlined />,
    },
    {
      displayText: "History",
      path: "/history",
      icon: <HistoryEduIcon />,
    },

    {
      displayText: "Homebrew Documents",
      path: "/documents",
      icon: <DownloadIcon />,
    },
  ];

  return (
    <div>
      <StyledSwipeableDrawer
        anchor={"bottom"}
        open={open}
        onClose={closeModal}
        onOpen={() => openSingleModal(EnumModalSlice.Menu)}
      >
        <StyledBox
          role="presentation"
          onClick={closeModal}
          onKeyDown={closeModal}
        >
          <List>
            {topListItems.map((item) => (
              <DrawItem
                key={item.displayText}
                item={item}
                onClick={() => navigate(item.path)}
              />
            ))}
          </List>
          <Divider />
          <List>
            {bottomListItems.map((item) => (
              <DrawItem
                key={item.displayText}
                item={item}
                onClick={() => navigate(item.path)}
              />
            ))}
          </List>
        </StyledBox>
      </StyledSwipeableDrawer>
    </div>
  );
}
