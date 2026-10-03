import { Link } from "react-router-dom";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
const archives = [
  {
    label: "Session recaps",
    description: "Tordenhelm, Dros’kara, Noktblast, and Eldoria.",
    to: "/sessions",
  },
  {
    label: "Lore & stories",
    description: "The histories and stories of earlier campaigns.",
    to: "/list/6FoUmw8ML88eBJ1fSHO0A8",
  },
  {
    label: "Maps",
    description: "Explore the world beyond this chapter.",
    to: "/list/4bOnoLNoNujSq6sWnG6BEt",
  },
  {
    label: "Homebrew documents",
    description: "Campaign rules and reference material.",
    to: "/documents",
  },
  {
    label: "History of Teratin",
    description: "The events that shaped the world.",
    to: "/history",
  },
  {
    label: "Earlier character pages",
    description: "Your private content from the existing campaigns.",
    to: "/me",
  },
  {
    label: "Tordenhelm introduction",
    description: "Return to the previous campaign’s welcome page.",
    to: "/archive/home",
  },
];
export default function Archive() {
  return (
    <div>
      <span className="eyebrow">The Teratin chronicles</span>
      <header className="page-introduction">
        <h1>Earlier chapters.</h1>
        <p>
          The stories that came before Luxtria, and the world they helped shape.
        </p>
      </header>
      <div className="archive-grid">
        {archives.map((item) => (
          <Link className="archive-card" to={item.to} key={item.to}>
            <div>
              <h2>{item.label}</h2>
              <p>{item.description}</p>
            </div>
            <ArrowOutwardIcon />
          </Link>
        ))}
      </div>
    </div>
  );
}
