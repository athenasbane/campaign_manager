import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ISession } from "Types/Interfaces";

export interface ISessionProps {
  session: ISession;
}

export default function Session({ session }: ISessionProps) {
  return (
    <Accordion sx={{ width: "96vw" }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>{`Session ${session.sessionNo} - ${session.shortDescription}`}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>{session.longDescription}</Typography>
      </AccordionDetails>
    </Accordion>
  );
}
