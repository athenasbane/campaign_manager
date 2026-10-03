import PersonalNotes from "../../Components/Campaign/PersonalNotes";
import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  useGetCampaignEntryQuery,
  useGetCampaignOverviewQuery,
  useSaveReaderStateMutation,
} from "../../Store/slices/campaignApi";
import { useAppSelector } from "../../hooks/store.hooks";
import {
  EmptyState,
  LoadingState,
  UnavailableState,
  typeLabel,
} from "../../Components/Campaign/Content";

export const headingSlug = (text: string) =>
  text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || "section";
export function articleHeadings(body: string) {
  const counts = new Map<string, number>();
  let fenced = false;
  return body.split("\n").flatMap((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return [];
    }
    const match = !fenced && /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) return [];
    const label = match[2]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "");
    const base = headingSlug(label);
    const count = counts.get(base) || 0;
    counts.set(base, count + 1);
    return [
      {
        label,
        id: count ? `${base}-${count + 1}` : base,
        level: match[1].length,
        line: index + 1,
      },
    ];
  });
}
function ArticleBody({ body }: { body: string }) {
  const headings = articleHeadings(body);
  const headingIds = new Map(
    headings.map((heading) => [heading.line, heading.id]),
  );
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children, node }) => (
          <h2 id={headingIds.get(node?.position?.start.line || 0)}>
            {children}
          </h2>
        ),
        h2: ({ children, node }) => (
          <h2 id={headingIds.get(node?.position?.start.line || 0)}>
            {children}
          </h2>
        ),
        h3: ({ children, node }) => (
          <h3 id={headingIds.get(node?.position?.start.line || 0)}>
            {children}
          </h3>
        ),
        a: ({ href, children }) =>
          href?.startsWith("/world/") ? (
            <Link to={href}>{children}</Link>
          ) : (
            <a
              href={href}
              {...(href?.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {children}
            </a>
          ),
        img: ({ alt }) => (
          <span className="attachment-note">{alt || "Image"} · attachment</span>
        ),
        table: ({ children }) => (
          <div className="article-table">
            <table>{children}</table>
          </div>
        ),
      }}
    >
      {body}
    </Markdown>
  );
}
export default function Reader() {
  const { entryId = "" } = useParams();
  const token = useAppSelector((state) => state.auth.token);
  const { data: campaign } = useGetCampaignOverviewQuery();
  const { data, isLoading, error, refetch } = useGetCampaignEntryQuery(
    entryId,
    { refetchOnMountOrArgChange: true },
  );
  const [save, { isLoading: saving, error: saveError }] =
    useSaveReaderStateMutation();
  const marked = useRef("");
  useEffect(() => {
    const key = `${token}:${data?.id}:${data?.version}`;
    if (data && campaign?.member && key !== marked.current) {
      marked.current = key;
      void save({ id: data.id, read: true });
    }
  }, [data, campaign?.member, save, token]);
  useEffect(() => {
    if (!data || !window.location.hash) return;
    try {
      document
        .getElementById(decodeURIComponent(window.location.hash.slice(1)))
        ?.scrollIntoView();
    } catch {
      /* Ignore malformed pasted anchors. */
    }
  }, [data]);
  if (isLoading) return <LoadingState />;
  if (error) {
    if ("status" in error && error.status === 404)
      return (
        <EmptyState title="This page isn’t available.">
          <p>
            The entry may not have been published, or it isn’t part of your
            character’s knowledge.
          </p>
          <Link className="button secondary" to="/world">
            Return to the world
          </Link>
        </EmptyState>
      );
    return <UnavailableState retry={refetch} />;
  }
  if (!data) return null;
  const headings = articleHeadings(data.body);
  return (
    <div className="reader-page">
      <Link
        to={
          data.type === "session" || data.type === "mission"
            ? "/journal"
            : data.private
              ? "/character"
              : "/world"
        }
        className="text-link reader-back"
      >
        <ArrowBackIcon fontSize="small" />
        {data.private
          ? "Your dossier"
          : data.type === "session" || data.type === "mission"
            ? "Campaign journal"
            : "World library"}
      </Link>
      <header
        className={`article-header ${data.type === "rumour" || data.type === "secret" ? `intelligence-article intelligence-${data.type}` : ""}`}
      >
        <div className="article-meta">
          <span className="eyebrow">Luxtria / {typeLabel(data.type)}</span>
          {data.private && (
            <span className="private-label">
              <LockOutlinedIcon fontSize="inherit" />
              Your character’s knowledge
            </span>
          )}
        </div>
        {(data.type === "rumour" || data.type === "secret") && (
          <span className="intelligence-certainty">
            {data.type === "rumour" ? "You have heard…" : "You know…"}
          </span>
        )}
        <h1>{data.title}</h1>
        {(data.type === "rumour" || data.type === "secret") && (
          <p className="intelligence-guidance">
            {data.type === "rumour"
              ? "A claim to investigate. It may be incomplete, mistaken, or outdated."
              : "Your character is certain of this fact. There may still be more to discover."}
          </p>
        )}
        {data.summary && <p className="article-summary">{data.summary}</p>}
        {data.intelligence &&
          (data.intelligence.learnedFrom || data.intelligence.acquired) && (
            <dl className="intelligence-provenance">
              {data.intelligence.learnedFrom && (
                <div>
                  <dt>
                    {data.type === "rumour" ? "Heard from" : "Learned from"}
                  </dt>
                  <dd>{data.intelligence.learnedFrom}</dd>
                </div>
              )}
              {data.intelligence.acquired && (
                <div>
                  <dt>Acquired</dt>
                  <dd>{data.intelligence.acquired}</dd>
                </div>
              )}
            </dl>
          )}
        <div className="article-details">
          <span>
            {Math.max(1, Math.ceil(data.body.split(/\s+/).length / 200))} min
            read
          </span>
          <span>
            Updated{" "}
            {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
              new Date(data.updatedAt),
            )}
          </span>
          {campaign?.member && (
            <button
              type="button"
              disabled={saving}
              className="text-link"
              onClick={() =>
                void save({ id: data.id, bookmarked: !data.bookmarked })
              }
              aria-pressed={data.bookmarked}
            >
              {data.bookmarked ? (
                <BookmarkIcon fontSize="small" />
              ) : (
                <BookmarkBorderIcon fontSize="small" />
              )}
              {data.bookmarked ? "Saved" : "Save entry"}
            </button>
          )}
        </div>
        {data.mapFeature?.mapId === "luxtria" && (
          <Link
            className="text-link article-map-link"
            to={`/world/map?place=${encodeURIComponent(data.mapFeature.key)}`}
          >
            <MapOutlinedIcon fontSize="small" />
            View this place on the map
          </Link>
        )}
        {saveError && (
          <p role="alert">
            Your reading progress or bookmark couldn’t be saved. Please try
            again.
          </p>
        )}
      </header>
      <div className="reader-layout">
        <article className="article-body">
          {data.intelligence?.evidence && (
            <section className="intelligence-evidence">
              <span className="eyebrow">Evidence you possess</span>
              <p>{data.intelligence.evidence}</p>
            </section>
          )}
          <ArticleBody body={data.body} />
          {campaign?.member && (
            <PersonalNotes
              key={`${token}:${data.id}`}
              entryId={data.id}
              initialNotes={data.personalNotes || ""}
            />
          )}
        </article>
        {headings.length > 2 && (
          <>
            <nav className="article-contents" aria-label="On this page">
              <span className="eyebrow">On this page</span>
              {headings.map((heading) => (
                <a
                  href={`#${heading.id}`}
                  key={heading.id}
                  className={heading.level === 3 ? "subheading" : ""}
                >
                  {heading.label}
                </a>
              ))}
            </nav>
            <details className="mobile-contents">
              <summary>
                On this page <span>{headings.length} sections</span>
              </summary>
              <nav
                className="mobile-contents-links"
                aria-label="Article sections"
              >
                {headings.map((heading) => (
                  <a
                    href={`#${heading.id}`}
                    key={heading.id}
                    className={heading.level === 3 ? "subheading" : ""}
                  >
                    {heading.label}
                  </a>
                ))}
              </nav>
            </details>
          </>
        )}
      </div>
      {(data.related.length > 0 || data.backlinks.length > 0) && (
        <section className="article-related">
          <span className="eyebrow">Follow the thread</span>
          <h2>Connected stories</h2>
          {Array.from(
            new Map(
              [...data.related, ...data.backlinks].map((entry) => [
                entry.id,
                entry,
              ]),
            ).values(),
          ).map((entry) => (
            <Link to={`/world/${entry.id}`} key={entry.id}>
              <span>{typeLabel(entry.type)}</span>
              {entry.title}
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
