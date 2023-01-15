import { Routes, Route } from "react-router-dom";
import Welcome from "Pages/Welcome/Welcome";
import Map from "Pages/Map/Map";
import MainTemplate from "Templates/Main";
import { useAppDispatch, useAppSelector } from "hooks/store.hooks";
import { closeAll, EnumModalSlice, openSingleModal } from "Store/slices/modals";
import List from "Pages/List/List";
import NotFound from "Pages/NotFound/NotFound";
import Sessions from "Pages/Sessions/Sessions";
import { ThemeProvider } from "@mui/material/styles";
import theme from "theme";
import CssBaseline from "@mui/material/CssBaseline";
import Content from "Pages/Content/Content";

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
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/map/:slug" element={<Map />} />
            <Route path="/list/:slug" element={<List />} />
            <Route path="/content/:slug" element={<Content />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainTemplate>
      </div>
    </ThemeProvider>
  );
}

export default App;
