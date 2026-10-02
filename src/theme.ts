import { createTheme } from "@mui/material/styles";
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ceb18b" },
    secondary: { main: "#a8afa6" },
    background: { default: "#111413", paper: "#1b201e" },
    text: { primary: "#ecece3", secondary: "#9fa69f" },
    divider: "#303630",
  },
  spacing: 4,
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    h1: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400 },
    h2: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400 },
    h3: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400 },
    h4: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400 },
    body1: { lineHeight: 1.8 },
    button: { textTransform: "none", fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: { root: { minHeight: 44, boxShadow: "none" } },
    },
    MuiAccordion: { styleOverrides: { root: { boxShadow: "none" } } },
  },
});
export default theme;
