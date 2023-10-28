import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import theme from "theme";
import { useGetFrontPageQuery } from "Store/slices/backend";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RichContentRenderer from "helpers/RichContentRenderer";
import { Skeleton } from "@mui/material";
import styles from "./Welcome.module.css";

export default function Welcome() {
  const { data, error, isLoading } = useGetFrontPageQuery(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    if (error || (!data && !isLoading)) {
      navigate("/404");
    }
  }, [error, navigate, data, isLoading]);

  const nextThur = () => {
    const d = new Date();
    d.setDate(d.getDate() + ((4 + 7 - d.getDay()) % 7));
    return d;
  };
  return (
    <Grid item container direction="column">
      {data && !isLoading ? (
        <>
          <Grid item>
            <Typography variant="h4" align="center">
              <span>Welcome to </span>
              <span className={[styles.text, styles.light].join(" ")}>
                Tordenhelm
              </span>

              <span className={[styles.text, styles.shadow].join(" ")}>
                The Lands of Treachery
              </span>
            </Typography>
          </Grid>
          <RichContentRenderer content={data.introduction} />
          <Grid item container direction="column">
            <Grid item>
              <Paper sx={{ backgroundColor: theme.palette.secondary.main }}>
                <Grid item container direction="column">
                  <Grid item>
                    <Typography variant="h2" textAlign="center">
                      Next Session
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h4" textAlign="center">
                      {data.nextSession ?? nextThur().toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
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
