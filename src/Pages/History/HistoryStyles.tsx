import { Timeline, timelineItemClasses } from "@mui/lab";
import styled from "@mui/material/styles/styled";

export const StyledTimeline = styled(Timeline, {
  shouldForwardProp: (prop) => prop !== "isSmall",
})<{ isSmall: boolean }>(({ isSmall }) => ({
  ...(isSmall
    ? {
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }
    : null),
}));
