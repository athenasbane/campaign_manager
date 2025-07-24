import createTheme from "@mui/material/styles/createTheme";

const theme: any = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#B8860B",
    },
    secondary: {
      main: "#8B4513",
    },
  },
  spacing: 4,
  typography: {
    fontFamily: "'Roboto Slab', serif",
    h1: {
      fontFamily: "'IM Fell English SC', serif",
    },
    h2: {
      fontFamily: "'IM Fell English SC', serif",
    },
    h3: {
      fontFamily: "'IM Fell English SC', serif",
    },
    h4: {
      fontFamily: "'IM Fell English SC', serif",
    },
  },
});
export default theme;
