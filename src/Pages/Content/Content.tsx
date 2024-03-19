import Grid from "@mui/material/Grid";
import { useNavigate, useParams } from "react-router-dom";
import { useGetContentPageQuery } from "Store/slices/backend";
import Skeleton from "@mui/material/Skeleton";
import { useEffect } from "react";
import RichContentRenderer from "helpers/RichContentRenderer";
import { StyledTypography } from "./ContentStyles";

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
          <StyledTypography variant="h3" textAlign="center">
            {data.pageTitle || " "}
          </StyledTypography>
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
