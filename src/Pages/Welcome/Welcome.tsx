import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import theme from "../../theme";
import { useGetFrontPageQuery } from "../../Store/slices/backend";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import RichContentRenderer from "../../helpers/RichContentRenderer";
import { Skeleton } from "@mui/material";
import EmbeddedVideo from "../../Components/Molecule/EmbeddedVideo/EmbeddedVideo";
import { nextSession } from "./WelcomeUtils";
import { StyledPaper } from "./WelcomeStyles";

export default function Welcome() {
  const { data, error, isLoading } = useGetFrontPageQuery(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    if (error || (!data && !isLoading)) {
      console.error(error);
      navigate("/404");
    }
  }, [error, navigate, data, isLoading]);

  const nextSessionDate = useMemo(
    () => nextSession(data?.nextSession),
    [data?.nextSession]
  );

  return (
    <Grid item container direction="column">
      {data && !isLoading ? (
        <>
          <Grid item>
            <Typography variant="h4" align="center">
              <span>{data.pageTitle}</span>
            </Typography>
            <StyledPaper>
              <Grid item container direction="column">
                <Grid item>
                  <Typography variant="h2" textAlign="center">
                    Next Session
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h4" textAlign="center">
                    {nextSessionDate}
                  </Typography>
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>
          <EmbeddedVideo videoId="MYmcBURqxck" title="Trailer" />
          <RichContentRenderer content={data.introduction} />
        </>
      ) : (
        <>
          <Skeleton variant="rectangular" />
          <Skeleton variant="rectangular" />
          <Skeleton variant="rectangular" />
        </>
      )}
    </Grid>
  );
}
