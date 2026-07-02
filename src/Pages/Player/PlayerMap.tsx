import Skeleton from "@mui/material/Skeleton";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import {
  useGetPlayerMapPageQuery,
  useGetPlayerProfileQuery,
} from "../../Store/slices/playerApi";
import { MapView } from "../Map/Map";

export default function PlayerMap() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetPlayerMapPageQuery(slug as string);
  const { data: playerProfile } = useGetPlayerProfileQuery();

  useEffect(() => {
    if (error || (!isLoading && !data)) {
      navigate("/me");
    }
  }, [data, error, isLoading, navigate]);

  return data && !isLoading ? (
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
}
