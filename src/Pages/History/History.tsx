import TimelineItem from "../../Components/Organism/TimelineItem/TimelineItem";
import Item from "@mui/lab/TimelineItem";
import { timeline } from "../../Constants/timeline";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineContent from "@mui/lab/TimelineContent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMediaQuery, useTheme } from "@mui/material";
import { StyledTimeline } from "./HistoryStyles";

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
      <StyledTimeline
        isSmall={isSmall}
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
                <Stack
                  justifyContent="space-between"
                  textAlign="center"
                  alignItems="center"
                  direction="row"
                >
                  <Box>
                    <Typography fontSize={20} variant="h3">
                      836 AF
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h3" fontSize={30}>
                      Present Day
                    </Typography>
                  </Box>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Typography textAlign="justify">
                  The events of the "Midnight" campaign take place here
                </Typography>
              </AccordionDetails>
            </Accordion>
          </TimelineContent>
        </Item>
      </StyledTimeline>
    </>
  );
}
