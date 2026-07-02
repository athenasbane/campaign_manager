import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { useGetMapPageQuery } from "../../Store/slices/backend";
import Skeleton from "@mui/material/Skeleton";
import { useEffect, useMemo } from "react";
import InteractiveMap from "../../Components/Organism/InteractiveMap/InteractiveMap";
import { useAppSelector } from "../../hooks/store.hooks";
import { useGetPlayerProfileQuery } from "../../Store/slices/playerApi";
import { normaliseMapPage } from "../../Components/Organism/InteractiveMap/InteractiveMapAdapter";
import { PlayerProfile } from "../../Types/Interfaces/player.interface";

interface MapViewProps {
  data: any;
  playerProfile?: PlayerProfile;
  enableDmTools?: boolean;
}

export function MapView({ data, playerProfile, enableDmTools }: MapViewProps) {
  const mapData = useMemo(
    () => normaliseMapPage(data, playerProfile),
    [data, playerProfile]
  );

  return (
    <>
      <Typography align="center" variant="h3">
        {data.pageTitle}
      </Typography>
      <InteractiveMap
        imageSrc={data.map.url}
        unitOfDistance={data.unitOfDistance}
        width="100%"
        detail={data.levelOfDetail}
        mapData={mapData}
        enableDmTools={enableDmTools}
      />
    </>
  );
}

export default function Map() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetMapPageQuery(slug as string);
  const token = useAppSelector((state) => state.auth.token);
  const { data: playerProfile } = useGetPlayerProfileQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (error || (!data && !isLoading)) {
      navigate("/404");
    }
  }, [error, navigate, data, isLoading]);

  const map =
    data && !isLoading ? (
      <MapView
        data={data}
        playerProfile={playerProfile}
        enableDmTools={searchParams.get("dmTools") === "true"}
      />
    ) : (
      <>
        <Skeleton variant="text" sx={{ fontSize: "2rem" }} />
        <Skeleton variant="rectangular" height={300} />
      </>
    );

  return map;
}
