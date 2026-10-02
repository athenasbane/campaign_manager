import { Link, useSearchParams } from "react-router-dom";
import { useSearchCampaignQuery } from "../../Store/slices/campaignApi";
import {
  EmptyState,
  EntryCard,
  LoadingState,
  UnavailableState,
} from "../../Components/Campaign/Content";

export default function Journal() {
  const [params, setParams] = useSearchParams();
  const missions = params.get("view") === "missions";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const { data, isLoading, error, refetch } = useSearchCampaignQuery({
    type: missions ? "mission" : "session",
    page,
  });
  return (
    <div>
      <div className="page-heading-row">
        <span className="eyebrow">The campaign journal</span>
        <span className="quiet-label">Luxtria / Our story</span>
      </div>
      <header className="page-introduction">
        <h1>Keep hold of the story.</h1>
        <p>
          The moments that brought you here. The threads still waiting to be
          followed.
        </p>
      </header>
      <nav className="journal-tabs" aria-label="Journal sections">
        <button
          type="button"
          className={!missions ? "active" : ""}
          aria-pressed={!missions}
          onClick={() => setParams({})}
        >
          Session recaps
        </button>
        <button
          type="button"
          className={missions ? "active" : ""}
          aria-pressed={missions}
          onClick={() => setParams({ view: "missions" })}
        >
          Missions & threads
        </button>
      </nav>
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <UnavailableState retry={refetch} />
      ) : data?.items.length ? (
        <>
          <div className="entry-grid">
            {data.items.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
          {data.pages > 1 && (
            <nav className="pagination" aria-label="Journal pages">
              <button
                className="button secondary"
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setParams({
                    ...(missions ? { view: "missions" } : {}),
                    page: String(page - 1),
                  })
                }
              >
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
                    ...(missions ? { view: "missions" } : {}),
                    page: String(page + 1),
                  })
                }
              >
                Next
              </button>
            </nav>
          )}
        </>
      ) : (
        <EmptyState
          title={
            missions
              ? "The first threads are yet to be woven."
              : "The first page is still unwritten."
          }
        >
          <p>
            {missions
              ? "Your party’s missions and open questions will appear here."
              : "Your campaign’s session recaps will appear here after the adventure begins."}
          </p>
          <Link to="/world" className="button secondary">
            Get to know Luxtria
          </Link>
        </EmptyState>
      )}
    </div>
  );
}
