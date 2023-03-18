import { Grid } from "@mui/material";

import {
  A1,
  A2,
  B1,
  B2,
  C1,
  C2,
  A3,
  B3,
  C3,
  A4,
  B4,
  C4,
} from "../../Constants/images/index";

export default function WorldMap() {
  return (
    <>
      <Grid container direction="row" columnSpacing={0}>
        <Grid container item direction="column" spacing={0} xs={3}>
          <Grid item xs={4}>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
              alt="A1"
              src={A1}
              loading="lazy"
            />
          </Grid>
          <Grid item>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
              alt="B1"
              src={B1}
              loading="lazy"
            />
          </Grid>
          <Grid item>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
              alt="C1"
              src={C1}
              loading="lazy"
            />
          </Grid>
        </Grid>
        <Grid container item direction="column" xs={3}>
          <Grid item>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
              alt="A2"
              src={A2}
              loading="lazy"
            />
          </Grid>
          <Grid item>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
              alt="B2"
              src={B2}
              loading="lazy"
            />
          </Grid>
          <Grid item>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
              alt="C2"
              src={C2}
              loading="lazy"
            />
          </Grid>
        </Grid>
        <Grid container item direction="column" xs={3}>
          <Grid item>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
              alt="A3"
              src={A3}
              loading="lazy"
            />
          </Grid>
          <Grid item>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
              alt="B3"
              src={B3}
              loading="lazy"
            />
          </Grid>
          <Grid item>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
              alt="C3"
              src={C3}
              loading="lazy"
            />
          </Grid>
        </Grid>
        <Grid container item direction="column" xs={3}>
          <Grid item>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
              alt="A4"
              src={A4}
              loading="lazy"
            />
          </Grid>
          <Grid item>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
              alt="B4"
              src={B4}
              loading="lazy"
            />
          </Grid>
          <Grid item>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                overflow: "hidden",
              }}
              alt="C4"
              src={C4}
              loading="lazy"
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
