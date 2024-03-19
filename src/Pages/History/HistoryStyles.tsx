import { Timeline, timelineItemClasses } from "@mui/lab";
import styled from "styled-components";

export const StyledTimeline = styled(Timeline).withConfig({
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
