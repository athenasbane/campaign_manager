import ListItem from "@mui/material/ListItem";
import MuiList from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import {
  LIFE_STONE_MORNING_STAR_IMG,
  THE_LEADER_SYMBOL_SMALL,
} from "Constants/images";

export default function Welcome() {
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
        <Grid item>
          This site is a work in progress so any suggestions you have for things
          you would like to see would be greatly appreciated. Here's the work I
          have planned:
        </Grid>
        <Grid item>
          <MuiList>
            <ListItem>
              - Add further maps that I have so you can reference them.
            </ListItem>
            <ListItem>
              - Download of "Better Crafting" Rule sets developed for this
              campaign.
            </ListItem>
          </MuiList>
        </Grid>
      </Grid>
    </>
  );
}
