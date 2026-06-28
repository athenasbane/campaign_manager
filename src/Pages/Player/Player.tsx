import { Button, Skeleton, Stack, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useGetPlayerProfileQuery } from "../../Store/slices/playerApi";
import { logout } from "../../Store/slices/auth";
import { useAppDispatch } from "../../hooks/store.hooks";
import { StyledPlayerSection } from "./PlayerStyles";
import { useGetMapPageQuery } from "../../Store/slices/backend";
import { normaliseMapPage } from "../../Components/Organism/InteractiveMap/InteractiveMapAdapter";
import InteractiveMap from "../../Components/Organism/InteractiveMap/InteractiveMap";

export default function Player() {
  const { data, error, isLoading } = useGetPlayerProfileQuery();
  const { data: mapPage, isLoading: isMapLoading } = useGetMapPageQuery(
    data?.defaultMapSlug || "",
    {
      skip: !data?.defaultMapSlug,
    }
  );
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
      {data.defaultMapSlug ? (
        <StyledPlayerSection>
          <Stack direction="column" gap={2}>
            <Typography variant="h3">Personal Map</Typography>
            {isMapLoading || !mapPage ? (
              <Skeleton variant="rectangular" height={360} />
            ) : (
              <InteractiveMap
                imageSrc={mapPage.map.url}
                unitOfDistance={mapPage.unitOfDistance}
                width="100%"
                height={520}
                detail={mapPage.levelOfDetail}
                mapData={normaliseMapPage(mapPage, data)}
              />
            )}
          </Stack>
        </StyledPlayerSection>
      ) : null}
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
