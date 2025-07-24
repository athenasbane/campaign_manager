import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Link, useLocation } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "../../../hooks/store.hooks";
import { EnumLayout, setLayoutValue } from "../../../Store/slices/layout";

export interface INavbarProps {
  onMenuButtonClick: () => void;
}

export default function Navbar({ onMenuButtonClick }: INavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<null | HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (navRef.current) {
      const { height, width } = navRef.current.getBoundingClientRect();
      dispatch(
        setLayoutValue({
          component: EnumLayout.NavBar,
          details: { height, width },
        })
      );
    }
  });
  return (
    <Box
      ref={navRef}
      sx={{
        width: "100vw",
        pt: 8,
        pb: 4,
        background:
          "linear-gradient(90deg, #ff9003 0%, rgba(0,212,255,1) 100%)",
      }}
    >
      <Stack direction="row">
        <Box sx={{ width: "25%", textAlign: "center" }}>
          {location.pathname !== "/" ? (
            <Button onClick={() => navigate(-1)}>
              <ArrowBackIosIcon color="secondary" />
            </Button>
          ) : null}
        </Box>
        <Box sx={{ width: "50%" }}>
          <Link
            style={{
              textDecoration: "none",
              color: "white",
            }}
            to="/"
          >
            <Typography variant="h3" textAlign="center">
              Teratin
            </Typography>
          </Link>
        </Box>
        <Box sx={{ width: "25%", textAlign: "center" }}>
          <Button
            data-testid="menu__button"
            variant="contained"
            color="secondary"
            onClick={onMenuButtonClick}
          >
            <Typography sx={{ color: "#ffff" }}>Menu</Typography>
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
