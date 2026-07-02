import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useGetPlayerContentPageQuery } from "../../Store/slices/playerApi";
import { ContentView } from "../Content/Content";

export default function PlayerContent() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetPlayerContentPageQuery(
    slug as string
  );

  useEffect(() => {
    if (error || (!isLoading && !data)) {
      navigate("/me");
    }
  }, [data, error, isLoading, navigate]);

  return (
    <Stack direction="column" sx={{ maxWidth: "100vw" }}>
      {data && !isLoading ? <ContentView data={data} /> : <Skeleton variant="text" />}
    </Stack>
  );
}
