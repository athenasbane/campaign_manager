import { Routes, Route } from "react-router-dom";
import History from "Pages/History/History";
import Welcome from "Pages/Welcome/Welcome";
import Map from "Pages/Map/Map";
import MainTemplate from "Templates/Main";
import { useAppDispatch, useAppSelector } from "hooks/store.hooks";
import { closeAll, EnumModalSlice, openSingleModal } from "Store/slices/modals";
import List from "Pages/List/List";
import NotFound from "Pages/NotFound/NotFound";
import Sessions from "Pages/Sessions/Sessions";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import theme from "theme";
import CssBaseline from "@mui/material/CssBaseline";
import Content from "Pages/Content/Content";
import Documents from "Pages/Documents/Documents";
import { lazy, Suspense } from "react";
import { Skeleton } from "@mui/material";
import Tales from "Pages/Tales/Tales";
const WorldMap = lazy(() => import("Pages/WorldMap/WorldMap"));

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
          <Suspense
            fallback={
              <Skeleton
                variant="rectangular"
                sx={{ width: "100%", height: "100%" }}
              />
            }
          >
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/map/:slug" element={<Map />} />
              <Route path="/list/:slug" element={<List />} />
              <Route path="/content/:slug" element={<Content />} />
              <Route path="/tales/:slug" element={<Tales />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/world_map" element={<WorldMap />} />
              <Route path="/history" element={<History />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </MainTemplate>
      </div>
    </ThemeProvider>
  );
}

export default App;
