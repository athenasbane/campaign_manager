import Timeline from "@mui/lab/Timeline";
import TimelineItem from "../../Components/Organism/TimelineItem/TimelineItem";
import Item, { timelineItemClasses } from "@mui/lab/TimelineItem";
import { timeline } from "Constants/timeline";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineContent from "@mui/lab/TimelineContent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMediaQuery, useTheme } from "@mui/material";

export default function History() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const items = timeline.map((item, index) => (
    <TimelineItem
      key={item.title}
      {...item}
      order={isSmall ? "row" : index % 2 === 0 ? "row" : "row-reverse"}
    />
  ));
  return (
    <>
      <Typography variant="h1" textAlign="center">
        History
      </Typography>
      <Timeline
        sx={
          isSmall
            ? {
                [`& .${timelineItemClasses.root}:before`]: {
                  flex: 0,
                  padding: 0,
                },
              }
            : null
        }
        position={isSmall ? "right" : "alternate"}
      >
        {items}
        <Item>
          <TimelineSeparator>
            <TimelineDot />
          </TimelineSeparator>
          <TimelineContent>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid
                  container
                  justifyContent="space-between"
                  textAlign="center"
                  alignItems="center"
                >
                  <Grid item>
                    <Typography sx={{ fontSize: 20 }} variant="h3">
                      836 AF
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h3" sx={{ fontSize: 30 }}>
                      Present Day
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Typography textAlign="justify">
                  The events of the "Midnight" campaign take place here
                </Typography>
              </AccordionDetails>
            </Accordion>
          </TimelineContent>
        </Item>
      </Timeline>
    </>
  );
}
