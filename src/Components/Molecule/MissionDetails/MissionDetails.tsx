import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

export interface MissionDetailsProps {
  missionName: string;
  location: string;
  setter: string;
  reward: string;
  description: string;
}

export default function MissionDetails({
  missionName,
  location,
  setter,
  reward,
  description,
}: MissionDetailsProps) {
  return (
    <>
      <Grid item flexDirection="row" marginBottom={4}>
        <Typography variant="h3" textAlign="center">
          {missionName}
        </Typography>
      </Grid>
      <Grid container item flexDirection="row">
        <Grid item xs={5}>
          <Typography variant="h4">Location:</Typography>
        </Grid>
        <Grid item xs={5}>
          <Typography variant="h5">{location}</Typography>
        </Grid>
      </Grid>
      <Grid container item flexDirection="row">
        <Grid item xs={5}>
          <Typography variant="h4">Who:</Typography>
        </Grid>
        <Grid item xs={5}>
          <Typography variant="h5">{setter}</Typography>
        </Grid>
      </Grid>
      <Grid container item flexDirection="row">
        <Grid item xs={5}>
          <Typography variant="h4">Reward:</Typography>
        </Grid>
        <Grid item xs={5}>
          <Typography variant="h5">{reward}</Typography>
        </Grid>
      </Grid>
      <Grid container item flexDirection="column">
        <Grid item>
          <Typography variant="h4">Description:</Typography>
        </Grid>
        <Grid item>
          <Typography variant="h6">{description}</Typography>
        </Grid>
      </Grid>
    </>
  );
}
