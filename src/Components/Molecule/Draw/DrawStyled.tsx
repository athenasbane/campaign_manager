import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Box from "@mui/material/Box";

import styled from "@mui/material/styles/styled";

export const StyledSwipeableDrawer = styled(SwipeableDrawer)(
  ({ theme: _ }) => ({
    zIndex: 1401,
  })
);

export const StyledBox = styled(Box)(({ theme: _ }) => ({
  width: "auto",
}));
