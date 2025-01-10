import Paper from "@mui/material/Paper";
import styled from "@mui/material/styles/styled";

export const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  marginTop: "20px",
  marginBottom: "20px",
}));
