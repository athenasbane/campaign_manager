import Typography from "@mui/material/Typography";
import MuiList from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Grid from "@mui/material/Grid";
import { useGetDocumentPageQuery } from "../../Store/slices/backend";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StyledLink } from "./DocumentsStyles";

export default function Documents() {
  const { data, error, isLoading, isSuccess } = useGetDocumentPageQuery(
    "65YbxCftv5moFtLY7YnpJd"
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (error || (!isLoading && !data)) {
      navigate("/404");
    }
  }, [error, data, isLoading, navigate]);

  const body = isSuccess ? (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="h3">{data.pageTitle}</Typography>
      </Grid>
      <Grid item>
        <Typography>
          Homebrewed Rule Sets for the Campaign for you to Download
        </Typography>
      </Grid>
      <Grid item>
        <MuiList>
          {data.documentsCollection.items.map((document: any) => (
            <ListItem key={document.title}>
              <StyledLink
                href={document.document.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Typography variant="h3">{document.title}</Typography>
              </StyledLink>
            </ListItem>
          ))}
        </MuiList>
      </Grid>
    </Grid>
  ) : (
    <></>
  );
  return <>{body}</>;
}
