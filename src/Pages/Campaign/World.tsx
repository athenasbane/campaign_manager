import { FormEvent, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import { useSearchCampaignQuery } from "../../Store/slices/campaignApi";
import { useAppSelector } from "../../hooks/store.hooks";
import {
  EmptyState,
  EntryCard,
  LoadingState,
  UnavailableState,
  entryCategories,
} from "../../Components/Campaign/Content";

export default function World() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const type = params.get("type") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const bookmarked = params.get("bookmarked") === "true";
  const searchInput = useRef<HTMLInputElement>(null);
  const focusSearch = params.get("search") === "1";
  useEffect(() => {
    if (focusSearch) searchInput.current?.focus();
  }, [focusSearch]);
  const token = useAppSelector((state) => state.auth.token);
  const { data, isLoading, isFetching, error, refetch } =
    useSearchCampaignQuery(
      { q, type, page, ...(bookmarked ? { bookmarked: "true" } : {}) },
      { refetchOnMountOrArgChange: true },
    );
  function change(values: Record<string, string>) {
    const next = new URLSearchParams(params);
    next.delete("page");
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    change({
      q: String(new FormData(event.currentTarget).get("q") || "").trim(),
    });
  }
  return (
    <div className="world-page">
      <div className="page-heading-row">
        <span className="eyebrow">The world library</span>
        <span className="quiet-label">Luxtria / Explore</span>
      </div>
      <header className="page-introduction">
        <h1>A world worth knowing.</h1>
        <p>
          Follow a name, a place, a thread. Find the details that bring Luxtria
          to life.
        </p>
      </header>
      <Link className="world-atlas-link" to="/world/map">
        <MapOutlinedIcon />
        <span>
          <strong>Explore Luxtria on the map</strong>
          <small>Places, districts, and the stories connected to them.</small>
        </span>
        <ArrowForwardIcon />
      </Link>
      <form className="world-search" onSubmit={submit} role="search">
        <SearchIcon />
        <input
          ref={searchInput}
          key={q}
          defaultValue={q}
          name="q"
          type="search"
          maxLength={200}
          aria-label="Search Luxtria lore"
          placeholder="Search names, places, factions, and lore…"
        />
        <button className="button primary" type="submit">
          Search
        </button>
      </form>
      <nav className="category-filters" aria-label="Filter world entries">
        <button
          type="button"
          className={!type ? "active" : ""}
          onClick={() => change({ type: "" })}
          aria-pressed={!type}
        >
          All entries
        </button>
        {entryCategories.map(({ type: value, label, icon: Icon }) => (
          <button
            type="button"
            key={value}
            className={type === value ? "active" : ""}
            onClick={() => change({ type: value })}
            aria-pressed={type === value}
          >
            <Icon fontSize="small" />
            {label}
          </button>
        ))}
      </nav>
      <div className="results-heading">
        <span aria-live="polite">
          {q
            ? `Results for “${q}”`
            : bookmarked
              ? "Your saved entries"
              : "Discover Luxtria"}
          {data && (
            <span className="result-count">
              {data.total} {data.total === 1 ? "entry" : "entries"}
            </span>
          )}
        </span>
        {token && (
          <button
            className={`text-link ${bookmarked ? "selected" : ""}`}
            type="button"
            onClick={() => change({ bookmarked: bookmarked ? "" : "true" })}
            aria-pressed={bookmarked}
          >
            <BookmarkBorderIcon fontSize="small" />
            Saved
          </button>
        )}
      </div>
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <UnavailableState retry={refetch} />
      ) : (
        <div aria-busy={isFetching}>
          {data?.items.length ? (
            <div className={`entry-grid ${isFetching ? "refreshing" : ""}`}>
              {data.items.map((entry) => (
                <EntryCard entry={entry} key={entry.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                q || type || bookmarked
                  ? "No entries found."
                  : "The world is waiting to unfold."
              }
            >
              <p>
                {q || type || bookmarked
                  ? "Try another name or explore a different category."
                  : token
                    ? "The lore shared with your character will appear here as it is published."
                    : "Sign in to explore your campaign’s lore. Public entries will appear here when available."}
              </p>
              {q || type || bookmarked ? (
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setParams({})}
                >
                  Explore all entries
                </button>
              ) : (
                !token && (
                  <Link
                    to="/login"
                    state={{ from: { pathname: "/world" } }}
                    className="button secondary"
                  >
                    Sign in to your campaign
                  </Link>
                )
              )}
            </EmptyState>
          )}
          {data && data.pages > 1 && (
            <nav className="pagination" aria-label="Result pages">
              <button
                className="button secondary"
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setParams({
                    ...Object.fromEntries(params),
                    page: String(page - 1),
                  })
                }
              >
                <ArrowBackIcon fontSize="small" />
                Previous
              </button>
              <span>
                Page {page} of {data.pages}
              </span>
              <button
                className="button secondary"
                type="button"
                disabled={page >= data.pages}
                onClick={() =>
                  setParams({
                    ...Object.fromEntries(params),
                    page: String(page + 1),
                  })
                }
              >
                Next
                <ArrowForwardIcon fontSize="small" />
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
