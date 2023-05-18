import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Link, useLocation } from "react-router-dom";
import theme from "theme";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";

export interface INavbarProps {
  onMenuButtonClick: () => void;
}

export default function Navbar({ onMenuButtonClick }: INavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Box
      sx={{
        width: "100vw",
        pt: 8,
        pb: 4,
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <Grid container direction="row">
        <Grid item xs={3} textAlign="center">
          {location.pathname !== "/" ? (
            <Button onClick={() => navigate(-1)}>
              <ArrowBackIosIcon color="info" />
            </Button>
          ) : null}
        </Grid>
        <Grid item xs={6}>
          <Link
            style={{
              textDecoration: "none",
              color: "white",
            }}
            to="/"
          >
            <Typography variant="h4" textAlign="center">
              Tordenhelm
            </Typography>
          </Link>
        </Grid>
        <Grid item xs={3} textAlign="center">
          <Button
            data-testid="menu__button"
            variant="contained"
            color="secondary"
            onClick={onMenuButtonClick}
          >
            <Typography>Menu</Typography>
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
