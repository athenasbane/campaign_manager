import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useParams } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useAppSelector } from "hooks/store.hooks";
import { selectMap } from "Store/slices/map";

export default function Map() {
  const { slug } = useParams();
  const map = useAppSelector((state) => selectMap(state.maps, slug));

  return (
    <>
      <Typography align="center" variant="h3">
        {map.displayLabel}
      </Typography>
      <Container sx={{ ml: 1 }}>
        <Zoom>
          <img style={{ width: "90vw" }} src={map.imageSrc} alt="map" />
        </Zoom>
      </Container>
    </>
  );
}
