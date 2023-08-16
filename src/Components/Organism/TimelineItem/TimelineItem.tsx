import Item from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Grid from "@mui/material/Grid";

interface TimelineItemProps {
  title: string;
  summary: string;
  year: string;
  order: "row" | "row-reverse";
}

export default function TimelineItem({
  title,
  summary,
  year,
  order,
}: TimelineItemProps) {
  return (
    <Item>
      <TimelineSeparator>
        <TimelineDot />
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid
              container
              justifyContent="space-between"
              flexDirection={order}
            >
              <Grid item>
                <Typography sx={{ fontSize: 20 }} variant="h3">
                  {year}
                </Typography>
              </Grid>
              <Grid item>
                <Typography sx={{ fontSize: 30 }} variant="h3">
                  {title}
                </Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Typography textAlign="justify">{summary}</Typography>
          </AccordionDetails>
        </Accordion>
      </TimelineContent>
    </Item>
  );
}
