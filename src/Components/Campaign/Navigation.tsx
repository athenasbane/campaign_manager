import { NavLink } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";

export const campaignNavigation = [
  { to: "/", label: "Home", icon: HomeOutlinedIcon },
  { to: "/journal", label: "Journal", icon: AutoStoriesOutlinedIcon },
  { to: "/world", label: "World", icon: PublicOutlinedIcon },
  { to: "/character", label: "Character", icon: PersonOutlineIcon },
];
export function CampaignNavigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      className={mobile ? "mobile-navigation" : "campaign-navigation"}
      aria-label={mobile ? "Mobile navigation" : "Campaign navigation"}
    >
      {campaignNavigation.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === "/"}>
          <Icon fontSize="small" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
export function CampaignSidebar() {
  return (
    <aside className="campaign-sidebar">
      <div className="sidebar-campaign">
        <span className="eyebrow">Your campaign</span>
        <span className="sidebar-campaign-name">Luxtria</span>
        <span className="status-dot">A new chapter</span>
      </div>
      <CampaignNavigation />
      <div className="sidebar-divider" />
      <NavLink className="archive-nav" to="/archive">
        <Inventory2OutlinedIcon fontSize="small" />
        <span>Campaign archive</span>
        <ArrowOutwardIcon fontSize="inherit" />
      </NavLink>
      <div className="sidebar-footer">
        <span className="small-seal" aria-hidden="true">
          L
        </span>
        <p>
          A world to discover.
          <br />A story to remember.
        </p>
        <span className="eyebrow">The Teratin chronicles</span>
      </div>
    </aside>
  );
}
