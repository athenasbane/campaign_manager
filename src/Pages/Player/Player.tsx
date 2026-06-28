import { Button, Skeleton, Stack, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useGetPlayerProfileQuery } from "../../Store/slices/playerApi";
import { logout } from "../../Store/slices/auth";
import { useAppDispatch } from "../../hooks/store.hooks";
import { StyledPlayerSection } from "./PlayerStyles";

export default function Player() {
  const { data, error, isLoading } = useGetPlayerProfileQuery();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      navigate("/login");
    }
  }, [error, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (isLoading) {
    return (
      <Stack direction="column" gap={2}>
        <Skeleton variant="text" />
        <Skeleton variant="rectangular" height={120} />
      </Stack>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Stack component="main" direction="column" gap={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h2">{data.characterName}</Typography>
        <Button
          startIcon={<LogoutIcon />}
          variant="outlined"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Stack>
      <Typography variant="h4">For {data.displayName}</Typography>
      {data.privateSections.map((section) => (
        <StyledPlayerSection key={section.title}>
          <Stack direction="column" gap={1}>
            <Typography variant="h3">{section.title}</Typography>
            <Typography>{section.body}</Typography>
          </Stack>
        </StyledPlayerSection>
      ))}
    </Stack>
  );
}
