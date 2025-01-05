import { useNavigate, useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { useGetMapPageQuery } from "../../Store/slices/backend";
import Skeleton from "@mui/material/Skeleton";
import { useEffect } from "react";
import InteractiveMap from "../../Components/Organism/InteractiveMap/InteractiveMap";

export default function Map() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetMapPageQuery(slug as string);

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
