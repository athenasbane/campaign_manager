import { useNavigate, useParams } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useGetMapBySlugQuery } from "Store/slices/backend";
import Skeleton from "@mui/material/Skeleton";
import { useEffect } from "react";

export default function Map() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetMapBySlugQuery(slug as string);

  useEffect(() => {
    if (error) {
      navigate("/404");
    }
  }, [error, navigate]);

  const map =
    data && !isLoading ? (
      <>
        <Typography align="center" variant="h3">
          {data.displayText}
        </Typography>
        <Container sx={{ ml: 1 }}>
          <img style={{ width: "90vw" }} src={data.imageSrc} alt="map" />
        </Container>
      </>
    ) : (
      <>
        <Skeleton variant="text" sx={{ fontSize: "2rem" }} />
        <Skeleton variant="rectangular" height={300} />
      </>
    );

  return map;
}
