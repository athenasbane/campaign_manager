import { Link } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import { useGetCampaignOverviewQuery } from "../../Store/slices/campaignApi";
import {
  EntryCard,
  EmptyState,
  LoadingState,
  UnavailableState,
} from "../../Components/Campaign/Content";
import { useAppSelector } from "../../hooks/store.hooks";

function CampaignSeal() {
  return (
    <div className="campaign-seal" aria-hidden="true">
      <div className="seal-ring outer" />
      <div className="seal-ring middle" />
      <div className="seal-ring inner" />
      <div className="seal-line horizontal" />
      <div className="seal-line vertical" />
      <span className="seal-letter">L</span>
      <span className="seal-caption">LUXTRIA · TERATIN</span>
      <span className="seal-star top">✧</span>
      <span className="seal-star bottom">✧</span>
    </div>
  );
}
export default function CampaignHome() {
  const { data, isLoading, error, refetch } = useGetCampaignOverviewQuery();
  const token = useAppSelector((state) => state.auth.token);
  const date = data?.nextSession
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "numeric",
        minute: "2-digit",
        timeZone: data.timezone,
      }).format(new Date(data.nextSession))
    : null;
  return (
    <div className="home-page">
      <div className="page-heading-row">
        <span className="eyebrow">The next chapter</span>
        <span className="quiet-label">
          <span className="tiny-dot" />
          Campaign journal
        </span>
      </div>
      <section className="campaign-hero">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">
            Welcome to your next adventure
          </span>
          <h1>
            Luxtria<span className="title-period">.</span>
          </h1>
          <p>
            A world to discover.
            <br />A story that belongs to you.
          </p>
          <div className="hero-actions">
            <Link to="/world" className="button primary">
              Explore the world
              <ArrowForwardIcon fontSize="small" />
            </Link>
            <Link
              to={data?.primerId ? `/world/${data.primerId}` : "/journal"}
              className="text-link"
            >
              {data?.primerId ? "Start with the primer" : "Open the journal"}
              <ArrowOutwardIcon fontSize="small" />
            </Link>
          </div>
        </div>
        <CampaignSeal />
        <div className="hero-footnote">
          <span>01 / A new beginning</span>
          <span>The Teratin chronicles</span>
        </div>
      </section>
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <UnavailableState retry={refetch} />
      ) : (
        <>
          <div className="briefing-strip">
            <div>
              <EventOutlinedIcon />
              <span>
                <span className="eyebrow">Next session</span>
                <strong>{date || "Our story is yet to begin"}</strong>
                <span className="quiet-label">
                  {date
                    ? data?.timezone
                    : "The next session hasn’t been scheduled yet."}
                </span>
              </span>
            </div>
            <Link to="/journal" className="text-link">
              View journal
              <ArrowForwardIcon fontSize="small" />
            </Link>
          </div>
          <section className="home-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Pick up the thread</span>
                <h2>The story so far</h2>
              </div>
              <Link to="/journal" className="text-link">
                All recaps
                <ArrowForwardIcon fontSize="small" />
              </Link>
            </div>
            {data?.latestSession ? (
              <EntryCard entry={data.latestSession} />
            ) : (
              <div className="story-empty">
                <AutoStoriesOutlinedIcon />
                <div>
                  <h3>Every story starts somewhere.</h3>
                  <p>
                    Your session recaps will live here. Until then, get to know
                    the world and the character you’ll bring to it.
                  </p>
                </div>
                <Link
                  to="/world"
                  className="round-arrow"
                  aria-label="Explore Luxtria"
                >
                  <ArrowForwardIcon />
                </Link>
              </div>
            )}
          </section>
          <div className="home-feature-grid">
            <Link className="home-feature world-feature" to="/world">
              <span className="feature-icon">
                <PublicOutlinedIcon />
              </span>
              <span className="eyebrow">The world of Luxtria</span>
              <h2>
                Know the world.
                <br />
                Find your place in it.
              </h2>
              <p>
                People, places, histories, and the details that make a world
                feel real.
              </p>
              <div className="feature-bottom">
                <span>
                  {data?.total
                    ? `${data.total} entries to explore`
                    : "Explore the world library"}
                </span>
                <ArrowForwardIcon />
              </div>
            </Link>
            <Link className="home-feature character-feature" to="/character">
              <span className="feature-icon">
                <LockOutlinedIcon />
              </span>
              <span className="eyebrow">Your character’s perspective</span>
              <h2>
                Some stories
                <br />
                are yours alone.
              </h2>
              <p>
                {data?.member
                  ? `Knowledge, revelations, and personal handouts for ${data.member.characterName}.`
                  : "Private knowledge, personal revelations, and the things only your character knows."}
              </p>
              <div className="feature-bottom">
                <span>
                  {data?.unreadKnowledge
                    ? `${data.unreadKnowledge} new revelations`
                    : token
                      ? "Open your dossier"
                      : "Your private dossier"}
                </span>
                <ArrowForwardIcon />
              </div>
            </Link>
          </div>
          <section className="home-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">From the world library</span>
                <h2>Recently added</h2>
              </div>
              <Link to="/world" className="text-link">
                Browse the library
                <ArrowForwardIcon fontSize="small" />
              </Link>
            </div>
            {data?.recent.length ? (
              <div className="entry-grid">
                {data.recent.slice(0, 4).map((entry) => (
                  <EntryCard entry={entry} key={entry.id} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  token
                    ? "The library is taking shape."
                    : "There’s more to discover."
                }
              >
                <p>
                  {token
                    ? "Campaign lore will appear here as it is published for you."
                    : "Sign in to discover the lore shared with your campaign. Public entries will appear here when available."}
                </p>
              </EmptyState>
            )}
          </section>
        </>
      )}
    </div>
  );
}
