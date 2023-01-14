import { Box, Typography, Button, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import theme from "theme";

export interface INavbarProps {
  onMenuButtonClick: () => void;
}

export default function Navbar({ onMenuButtonClick }: INavbarProps) {
  return (
    <Box
      sx={{
        width: "100vw",
        pt: 8,
        pb: 4,
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <Grid container justifyContent="space-evenly">
        <Grid item>
          <Link
            style={{
              textDecoration: "none",
              color: "white",
            }}
            to="/"
          >
            <Typography variant="h3" align="center" textAlign="center">
              Tordenhelm
            </Typography>
          </Link>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={onMenuButtonClick}
          >
            Menu
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
