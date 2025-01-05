import styled from "@mui/material/styles/styled";

export const StyledImg = styled("img", {
  shouldForwardProp: (prop) => !["width", "height"].includes(prop as string),
})(({ theme: _, width, height }) => ({
  width,
  height,
  position: "relative",
}));
