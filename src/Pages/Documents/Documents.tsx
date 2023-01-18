import Typography from "@mui/material/Typography";
import MuiList from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Grid from "@mui/material/Grid";
import { documentsData } from "Constants/documents";

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
          {documentsData.map((doc) => {
            return (
              <ListItem key={doc.displayText}>
                <a
                  style={{ textDecoration: "none", color: "white" }}
                  href={doc.documentSrc}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Typography variant="h3">{doc.displayText}</Typography>
                </a>
              </ListItem>
            );
          })}
        </MuiList>
      </Grid>
    </Grid>
  );
}
