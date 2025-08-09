import TimelineItem from "../../Components/Organism/TimelineItem/TimelineItem";
import { timeline } from "../../Constants/timeline";
import Typography from "@mui/material/Typography";
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
      </StyledTimeline>
    </>
  );
}
