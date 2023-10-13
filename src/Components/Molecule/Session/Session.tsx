import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ISession } from "Types/Interfaces";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

export interface ISessionProps {
  session: ISession;
}

export default function Session({ session }: ISessionProps) {
  return (
    <Accordion sx={{ maxWidth: "96vw" }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>{`Session ${session.sessionNumber} - ${session.shortDescription}`}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {documentToReactComponents(session.longDescription.json as any)}
      </AccordionDetails>
    </Accordion>
  );
}
