import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Link, useLocation } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useMemo } from "react";
import { useAppDispatch } from "../../../hooks/store.hooks";
import { EnumLayout, setLayoutValue } from "../../../Store/slices/layout";
import { Spark, StyledNavbar } from "./NavbarStyles";

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
  const sparks = useMemo(
    () =>
      Array.from({ length: 15 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
      })),
    []
  );

  return (
    <StyledNavbar ref={navRef}>
      {sparks.map((s, i) => (
        <Spark key={i} top={s.top} left={s.left} delay={s.delay} />
      ))}
      <Stack direction="row" alignItems="center">
        <Box sx={{ width: "25%", textAlign: "center" }}>
          {location.pathname !== "/" ? (
            <Button color="primary" onClick={() => navigate(-1)}>
              <ArrowBackIosIcon color="inherit" />
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
            color="primary"
            onClick={onMenuButtonClick}
          >
            <Typography sx={{ color: "#ffff" }}>Menu</Typography>
          </Button>
        </Box>
      </Stack>
    </StyledNavbar>
  );
}
