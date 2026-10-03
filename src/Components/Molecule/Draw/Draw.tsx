import { NavLink } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import BookOutlinedIcon from "@mui/icons-material/BookOutlined";
import { EnumModalSlice } from "../../../Store/slices/modals";
import { campaignNavigation } from "../../Campaign/Navigation";
import { StyledBox, StyledSwipeableDrawer } from "./DrawStyled";

export interface IDrawProps {
  open: boolean;
  closeModal: () => void;
  openSingleModal: (modal: EnumModalSlice) => void;
}
const archiveShortcuts = [
  { label: "Maps", to: "/list/4bOnoLNoNujSq6sWnG6BEt", icon: MapOutlinedIcon },
  { label: "Session recaps", to: "/sessions", icon: VisibilityOutlinedIcon },
  { label: "Missions", to: "/missions", icon: AssignmentOutlinedIcon },
  { label: "Earlier character pages", to: "/me", icon: PersonOutlineIcon },
  {
    label: "Lore",
    to: "/list/6FoUmw8ML88eBJ1fSHO0A8",
    icon: MenuBookOutlinedIcon,
  },
  {
    label: "Tales from Teratin",
    to: "/list/1iLinkQTnQ1Q9qqzLGW37v",
    icon: BookOutlinedIcon,
  },
  { label: "History", to: "/history", icon: HistoryEduOutlinedIcon },
  { label: "Homebrew documents", to: "/documents", icon: DownloadOutlinedIcon },
];
export default function Draw({
  open,
  openSingleModal,
  closeModal,
}: IDrawProps) {
  return (
    <StyledSwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={closeModal}
      onOpen={() => openSingleModal(EnumModalSlice.Menu)}
      disableSwipeToOpen
      slotProps={{
        paper: {
          role: "dialog",
          "aria-modal": true,
          "aria-labelledby": "campaign-menu-heading",
        },
      }}
    >
      <StyledBox>
        <div className="menu-handle" aria-hidden="true" />
        <header className="menu-heading">
          <div>
            <span className="eyebrow">Your campaign</span>
            <h2 id="campaign-menu-heading">
              Luxtria<span>Campaign menu</span>
            </h2>
          </div>
          <button
            type="button"
            className="icon-button menu-close"
            aria-label="Close campaign menu"
            onClick={closeModal}
          >
            <CloseIcon />
          </button>
        </header>
        <nav className="menu-primary" aria-label="Campaign pages">
          {campaignNavigation.map(({ to, label, icon: Icon }) => (
            <NavLink to={to} key={to} end={to === "/"} onClick={closeModal}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <NavLink to="/world/map" className="menu-feature" onClick={closeModal}>
          <MapOutlinedIcon />
          <span>
            <strong>City atlas</strong>
            <small>Find your way through Luxtria</small>
          </span>
          <ArrowForwardIcon />
        </NavLink>
        <section className="menu-archive" aria-label="Earlier chapters">
          <span className="eyebrow">The Teratin chronicles</span>
          <NavLink to="/archive" className="menu-feature" onClick={closeModal}>
            <Inventory2OutlinedIcon />
            <span>
              <strong>Earlier chapters</strong>
              <small>Stories, maps, and campaign references</small>
            </span>
            <ArrowForwardIcon />
          </NavLink>
          <details className="menu-shortcuts">
            <summary>
              Archive shortcuts
              <ExpandMoreIcon />
            </summary>
            <nav aria-label="Earlier campaign links">
              {archiveShortcuts.map(({ to, label, icon: Icon }) => (
                <NavLink to={to} key={to} onClick={closeModal}>
                  <Icon fontSize="small" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </details>
        </section>
      </StyledBox>
    </StyledSwipeableDrawer>
  );
}
