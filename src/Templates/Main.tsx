import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../Components/Molecule/Navbar/Navbar";
import Draw from "../Components/Molecule/Draw/Draw";
import {
  CampaignNavigation,
  CampaignSidebar,
} from "../Components/Campaign/Navigation";
export interface IMainTemplateProps {
  children: ReactNode;
  NavbarProps: { onMenuButtonClick: () => void };
  DrawProps: {
    open: boolean;
    closeModal: () => void;
    openSingleModal: () => void;
  };
}
export default function MainTemplate({
  children,
  NavbarProps,
  DrawProps,
}: IMainTemplateProps) {
  const { pathname, hash, search } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo?.({ top: 0 });
  }, [pathname, hash, search]);
  return (
    <div className="campaign-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar {...NavbarProps} />
      <CampaignSidebar />
      <main id="main-content" className={`campaign-main ${pathname === "/world/map" ? "atlas-main" : ""}`}>
        {children}
        <footer className="page-footer">
          <span>Luxtria</span>
          <span>A chapter of Teratin</span>
        </footer>
      </main>
      <CampaignNavigation mobile />
      <Draw {...DrawProps} />
    </div>
  );
}
