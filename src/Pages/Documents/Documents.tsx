import Typography from "@mui/material/Typography";
import MuiList from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Grid from "@mui/material/Grid";

export default function Documents() {
  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h3">Documents</Typography>
      </Grid>
      <Grid item>
        <Typography>
          Homebrewed Rule Sets for the Campaign for you to Download
        </Typography>
      </Grid>
      <Grid item>
        <MuiList>
          <ListItem>
            <a
              style={{ textDecoration: "none", color: "white" }}
              href={
                process.env.REACT_APP_BACKEND_URL + "public/better_crafting"
              }
              rel="noopener noreferrer"
              target="_blank"
            >
              <Typography variant="h3">
                Better Crafting Document (V1)
              </Typography>
            </a>
          </ListItem>
          <ListItem>
            <a
              style={{ textDecoration: "none", color: "white" }}
              href={
                process.env.REACT_APP_BACKEND_URL + "public/augmentine_class"
              }
              rel="noopener noreferrer"
              target="_blank"
            >
              <Typography variant="h3">
                Augmentine Class Guide (V0.5)
              </Typography>
            </a>
          </ListItem>
        </MuiList>
      </Grid>
    </Grid>
  );
}
