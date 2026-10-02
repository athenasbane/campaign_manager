import { Link } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import Diversity2OutlinedIcon from "@mui/icons-material/Diversity2Outlined";
import type {
  CampaignEntry,
  EntryType,
} from "../../Types/Interfaces/campaign.interface";

export const entryCategories: {
  type: EntryType;
  label: string;
  icon: typeof PersonOutlineIcon;
}[] = [
  { type: "lore", label: "Lore", icon: AutoStoriesOutlinedIcon },
  { type: "place", label: "Places", icon: PlaceOutlinedIcon },
  { type: "person", label: "People", icon: PersonOutlineIcon },
  { type: "faction", label: "Factions", icon: AccountTreeOutlinedIcon },
  { type: "history", label: "History", icon: HistoryOutlinedIcon },
  { type: "culture", label: "Culture", icon: Diversity2OutlinedIcon },
  { type: "rules", label: "Rules", icon: BalanceOutlinedIcon },
];
export const typeLabel = (type: EntryType) =>
  ({
    person: "Person",
    place: "Place",
    faction: "Faction",
    history: "History",
    culture: "Culture",
    rules: "Rules",
    lore: "Lore",
    session: "Session recap",
    mission: "Mission",
    knowledge: "Knowledge",
    handout: "Handout",
  })[type];
export function EntryCard({ entry }: { entry: CampaignEntry }) {
  const Icon =
    entryCategories.find((category) => category.type === entry.type)?.icon ||
    AutoStoriesOutlinedIcon;
  return (
    <Link to={`/world/${entry.id}`} className="entry-card">
      <div className="entry-card-top">
        <span className="entry-type">
          <Icon fontSize="small" />
          {typeLabel(entry.type)}
        </span>
        <span className="entry-indicators">
          {entry.bookmarked && <BookmarkBorderIcon fontSize="small" />}
          {entry.private && <LockOutlinedIcon fontSize="small" />}
          {entry.unread && <span className="new-label">New</span>}
        </span>
      </div>
      <h3>{entry.title}</h3>
      {entry.summary && <p>{entry.summary}</p>}
      <div className="entry-card-bottom">
        <span>{entry.tags[0]?.replace(/^luxtria\//, "") || "Luxtria"}</span>
        <ArrowForwardIcon fontSize="small" />
      </div>
    </Link>
  );
}
export function EmptyState({
  title,
  children,
  icon: Icon = AutoStoriesOutlinedIcon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: typeof AutoStoriesOutlinedIcon;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon />
      </span>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}
export function LoadingState() {
  return (
    <div
      className="loading-content"
      role="status"
      aria-label="Loading campaign content"
    >
      <span />
      <span />
      <span />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
export function UnavailableState({ retry }: { retry: () => void }) {
  return (
    <div className="unavailable-state" role="alert">
      <h3>The page is taking a little longer.</h3>
      <p>We couldn’t load the campaign content. Please try again.</p>
      <button className="button secondary" onClick={retry} type="button">
        Try again
      </button>
    </div>
  );
}
