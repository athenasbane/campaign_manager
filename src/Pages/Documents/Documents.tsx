import Typography from "@mui/material/Typography";
import MuiList from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
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
    <Stack direction="column">
      <Box>
        <Typography variant="h3">{data.pageTitle}</Typography>
      </Box>
      <Box>
        <Typography>
          Homebrewed Rule Sets for the Campaign for you to Download
        </Typography>
      </Box>
      <Box>
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
      </Box>
    </Stack>
  ) : (
    <></>
  );
  return <>{body}</>;
}
