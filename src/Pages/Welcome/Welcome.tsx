import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { THE_LEADER_SYMBOL_SMALL } from "Constants/images";
import theme from "theme";
import { useGetNextSessionQuery } from "Store/slices/backend";

export default function Welcome() {
  const nextSession = useGetNextSessionQuery(undefined);
  const nextThur = () => {
    const d = new Date();
    d.setDate(d.getDate() + ((4 + 7 - d.getDay()) % 7));
    return d;
  };
  return (
    <>
      <Grid item container direction="column">
        <Grid item>
          <Typography variant="h4" align="center">
            Welcome To Tordenhelm
          </Typography>
        </Grid>
        <Grid item container direction="row">
          <Grid item xs={6} lg={6}>
            <Typography textAlign="justify">
              This site aims to to be a reference for all your campaign lore,
              maps and tools needs. If you're sat at home between sessions and
              wondering about something I hope this will give you some of the
              information needed.
            </Typography>
          </Grid>
          <Grid item xs={6} lg={6}>
            <img
              style={{
                width: "90%",
                margin: "10px",
                marginTop: "35px",
                borderRadius: "15px",
              }}
              alt="lifestone morningstar"
              src={THE_LEADER_SYMBOL_SMALL}
            />
          </Grid>
        </Grid>
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
                    {nextSession?.data?.toString() ?? nextThur().toDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
