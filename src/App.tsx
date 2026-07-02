import { Routes, Route } from "react-router-dom";
import MainTemplate from "./Templates/Main";
import { useAppDispatch, useAppSelector } from "./hooks/store.hooks";
import {
  closeAll,
  EnumModalSlice,
  openSingleModal,
} from "./Store/slices/modals";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import { lazy, Suspense } from "react";
import { StyledSkeleton } from "./AppStyles";
import ProtectedRoute from "./Components/Organism/ProtectedRoute/ProtectedRoute";

const Welcome = lazy(() => import("./Pages/Welcome/Welcome"));
const Map = lazy(() => import("./Pages/Map/Map"));
const List = lazy(() => import("./Pages/List/List"));
const Content = lazy(() => import("./Pages/Content/Content"));
const Sessions = lazy(() => import("./Pages/Sessions/Sessions"));
const Documents = lazy(() => import("./Pages/Documents/Documents"));
const History = lazy(() => import("./Pages/History/History"));
const Missions = lazy(() => import("./Pages/Missions/Missions"));
const ExchangeRates = lazy(() =>
  import("./Pages/ExchangeRates/ExchangeRates").then((module) => ({
    default: module.ExchangeRates,
  }))
);
const Login = lazy(() => import("./Pages/Login/Login"));
const Player = lazy(() => import("./Pages/Player/Player"));
const PlayerList = lazy(() => import("./Pages/Player/PlayerList"));
const PlayerContent = lazy(() => import("./Pages/Player/PlayerContent"));
const PlayerMap = lazy(() => import("./Pages/Player/PlayerMap"));
const NotFound = lazy(() => import("./Pages/NotFound/NotFound"));

function App() {
  const navOpen = useAppSelector((state) => state.modals[EnumModalSlice.Menu]);
  const dispatch = useAppDispatch();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <MainTemplate
          DrawProps={{
            open: navOpen,
            closeModal: () => dispatch(closeAll()),
            openSingleModal: () =>
              dispatch(openSingleModal(EnumModalSlice.Menu)),
          }}
          NavbarProps={{
            onMenuButtonClick: () =>
              dispatch(openSingleModal(EnumModalSlice.Menu)),
          }}
        >
          <Suspense fallback={<StyledSkeleton variant="rectangular" />}>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/map/:slug" element={<Map />} />
              <Route path="/list/:slug" element={<List />} />
              <Route path="/content/:slug" element={<Content />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/history" element={<History />} />
              <Route path="/missions" element={<Missions />} />
              <Route path="/exchange" element={<ExchangeRates />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/me"
                element={
                  <ProtectedRoute>
                    <Player />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/me/list/:slug"
                element={
                  <ProtectedRoute>
                    <PlayerList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/me/content/:slug"
                element={
                  <ProtectedRoute>
                    <PlayerContent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/me/map/:slug"
                element={
                  <ProtectedRoute>
                    <PlayerMap />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </MainTemplate>
      </div>
    </ThemeProvider>
  );
}

export default App;
