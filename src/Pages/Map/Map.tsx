import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { useGetMapPageQuery } from "../../Store/slices/backend";
import Skeleton from "@mui/material/Skeleton";
import { useEffect, useMemo } from "react";
import InteractiveMap from "../../Components/Organism/InteractiveMap/InteractiveMap";
import { useAppSelector } from "../../hooks/store.hooks";
import { useGetPlayerProfileQuery } from "../../Store/slices/playerApi";
import { normaliseMapPage } from "../../Components/Organism/InteractiveMap/InteractiveMapAdapter";

export default function Map() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetMapPageQuery(slug as string);
  const token = useAppSelector((state) => state.auth.token);
  const { data: playerProfile } = useGetPlayerProfileQuery(undefined, {
    skip: !token,
  });
  const mapData = useMemo(
    () => (data ? normaliseMapPage(data, playerProfile) : undefined),
    [data, playerProfile]
  );

  useEffect(() => {
    if (error || (!data && !isLoading)) {
      navigate("/404");
    }
  }, [error, navigate, data, isLoading]);

  const map =
    data && !isLoading ? (
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
          enableDmTools={searchParams.get("dmTools") === "true"}
        />
      </>
    ) : (
      <>
        <Skeleton variant="text" sx={{ fontSize: "2rem" }} />
        <Skeleton variant="rectangular" height={300} />
      </>
    );

  return map;
}
