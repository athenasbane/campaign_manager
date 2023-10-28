import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useNavigate, useParams } from "react-router-dom";
import { useGetContentPageQuery } from "Store/slices/backend";
import Skeleton from "@mui/material/Skeleton";
import { useEffect } from "react";
import RichContentRenderer from "helpers/RichContentRenderer";

export default function Content() {
  const { slug } = useParams();
  const navigate = useNavigate();
  // const { data, error, isLoading } = useGetContentBySlugQuery(slug as string);
  const { data, error, isLoading } = useGetContentPageQuery(slug);
  useEffect(() => {
    if (error || (!isLoading && !data)) {
      navigate("/404");
    }
  }, [error, data, navigate, isLoading]);

  return (
    <Grid container item direction="column" sx={{ maxWidth: "100vw" }}>
      {data && !isLoading ? (
        <>
          <Typography
            variant="h3"
            textAlign="center"
            sx={{ maxWidth: "100vw" }}
          >
            {data.pageTitle || " "}
          </Typography>
          <RichContentRenderer
            content={data.pageContentCollection.items[0].content}
          />
        </>
      ) : (
        <Skeleton variant="text" />
      )}
    </Grid>
  );
}
