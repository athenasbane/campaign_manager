import Skeleton from "@mui/material/Skeleton";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useGetPlayerListPageQuery } from "../../Store/slices/playerApi";
import { ListView } from "../List/List";

export default function PlayerList() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetPlayerListPageQuery(slug as string);

  useEffect(() => {
    if (error || (!isLoading && !data)) {
      navigate("/me");
    }
  }, [data, error, isLoading, navigate]);

  return data && !isLoading ? (
    <ListView data={data} slug={slug} basePath="/me" />
  ) : (
    <Skeleton variant="text" />
  );
}
