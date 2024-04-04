import styled from "styled-components";

export const StyledImg = styled("img").withConfig({
  shouldForwardProp: (prop) => !["width", "height"].includes(prop),
})(({ theme: _, width, height }) => ({
  width,
  height,
  position: "relative",
}));
