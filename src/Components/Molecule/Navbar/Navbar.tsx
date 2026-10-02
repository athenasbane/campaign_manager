import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import { useAppDispatch, useAppSelector } from "../../../hooks/store.hooks";
import { EnumLayout, setLayoutValue } from "../../../Store/slices/layout";
export interface INavbarProps {
  onMenuButtonClick: () => void;
}
export default function Navbar({ onMenuButtonClick }: INavbarProps) {
  const dispatch = useAppDispatch();
  const navRef = useRef<HTMLElement>(null);
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();
  useEffect(() => {
    const node = navRef.current;
    if (!node) return;
    const measure = () => {
      const { height, width } = node.getBoundingClientRect();
      dispatch(
        setLayoutValue({
          component: EnumLayout.NavBar,
          details: { height, width },
        }),
      );
    };
    measure();
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    observer?.observe(node);
    return () => observer?.disconnect();
  }, [dispatch]);
  const section = location.pathname.startsWith("/world")
    ? "The world"
    : location.pathname.startsWith("/journal")
      ? "The journal"
      : location.pathname.startsWith("/character")
        ? "Your character"
        : "Campaign journal";
  return (
    <header className="campaign-header" ref={navRef}>
      <Link to="/" className="brand" aria-label="Teratin home">
        <span className="brand-mark" aria-hidden="true">
          T
        </span>
        <span>
          TERATIN<span className="brand-subtitle">CHRONICLES</span>
        </span>
      </Link>
      <div className="header-section">
        <span className="eyebrow">Luxtria</span>
        <span className="header-slash">/</span>
        <span>{section}</span>
      </div>
      <div className="header-actions">
        <Link
          to="/world?search=1"
          className="icon-button"
          aria-label="Search the world"
        >
          <SearchIcon fontSize="small" />
        </Link>
        <span className="header-rule" />
        <Link
          to={token ? "/character" : "/login"}
          state={{ from: { pathname: "/character" } }}
          className="account-button"
          aria-label={token ? "Your character" : "Sign in"}
        >
          <PersonOutlineIcon fontSize="small" />
          <span>{token ? "Your character" : "Sign in"}</span>
        </Link>
        <button
          type="button"
          className="icon-button archive-menu-button"
          aria-label="Open archive menu"
          data-testid="menu__button"
          onClick={onMenuButtonClick}
        >
          <MenuIcon fontSize="small" />
        </button>
      </div>
    </header>
  );
}
