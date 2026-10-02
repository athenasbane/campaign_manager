import { Link } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  useGetCampaignOverviewQuery,
  useSearchCampaignQuery,
} from "../../Store/slices/campaignApi";
import { useAppDispatch, useAppSelector } from "../../hooks/store.hooks";
import { logout } from "../../Store/slices/auth";
import {
  EmptyState,
  EntryCard,
  LoadingState,
  UnavailableState,
} from "../../Components/Campaign/Content";
import { useSearchParams } from "react-router-dom";

export default function Character() {
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const { data, isLoading, error, refetch } = useGetCampaignOverviewQuery(
    undefined,
    { skip: !token },
  );
  const knowledge = useSearchCampaignQuery(
    { privateOnly: "true", page },
    { skip: !token || !data?.member, refetchOnMountOrArgChange: true },
  );
  return (
    <div>
      <div className="page-heading-row">
        <span className="eyebrow">Your private dossier</span>
        <span className="quiet-label">
          <LockOutlinedIcon fontSize="inherit" />
          Character knowledge
        </span>
      </div>
      {!token ? (
        <section className="dossier-introduction">
          <span className="dossier-seal" aria-hidden="true">
            <LockOutlinedIcon />
          </span>
          <span className="eyebrow">A story only you can tell</span>
          <h1>
            Some knowledge
            <br />
            is yours alone.
          </h1>
          <p>
            Your character’s secrets, personal revelations, and private
            handouts. Sign in to see the world from your own perspective.
          </p>
          <Link
            to="/login"
            state={{ from: { pathname: "/character" } }}
            className="button primary"
          >
            Open your dossier
          </Link>
          <span className="dossier-note">
            Knowledge shared with your character stays in your character’s view.
          </span>
        </section>
      ) : isLoading ? (
        <LoadingState />
      ) : error ? (
        <UnavailableState retry={refetch} />
      ) : (
        <>
          <header className="page-introduction character-heading">
            <div>
              <span className="eyebrow">
                {data?.member
                  ? "Luxtria / Your character"
                  : "Welcome to Luxtria"}
              </span>
              <h1>
                {data?.member?.characterName || "Your story is taking shape."}
              </h1>
              <p>
                {data?.member
                  ? `Your knowledge and personal revelations${data.member.displayName ? `, ${data.member.displayName}` : ""}.`
                  : "Your account hasn’t been assigned a Luxtria character yet. Your GM can connect your character to this account."}
              </p>
            </div>
            <button
              className="button secondary"
              type="button"
              onClick={() => dispatch(logout())}
            >
              <LogoutIcon fontSize="small" />
              Sign out
            </button>
          </header>
          {data?.member && (
            <>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Through your eyes</span>
                  <h2>Your knowledge</h2>
                </div>
                {knowledge.data?.unreadTotal ? (
                  <span className="new-label">
                    {knowledge.data.unreadTotal} unread
                  </span>
                ) : null}
              </div>
              {knowledge.isLoading ? (
                <LoadingState />
              ) : knowledge.error ? (
                <UnavailableState retry={knowledge.refetch} />
              ) : knowledge.data?.items.length ? (
                <>
                  <div className="entry-grid">
                    {knowledge.data.items.map((entry) => (
                      <EntryCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                  {knowledge.data.pages > 1 && (
                    <nav className="pagination" aria-label="Knowledge pages">
                      <button
                        className="button secondary"
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setParams({ page: String(page - 1) })}
                      >
                        Previous
                      </button>
                      <span>
                        Page {page} of {knowledge.data.pages}
                      </span>
                      <button
                        className="button secondary"
                        type="button"
                        disabled={page >= knowledge.data.pages}
                        onClick={() => setParams({ page: String(page + 1) })}
                      >
                        Next
                      </button>
                    </nav>
                  )}
                </>
              ) : (
                <EmptyState
                  title="Every revelation has its moment."
                  icon={LockOutlinedIcon}
                >
                  <p>
                    Knowledge and private handouts will appear here when your GM
                    shares them with your character.
                  </p>
                </EmptyState>
              )}
            </>
          )}
          <Link to="/world" className="text-link">
            Explore the knowledge shared with your party →
          </Link>
        </>
      )}
    </div>
  );
}
