import styled from "@mui/material/styles/styled";
import ZoomImage from "react-image-zooom";

export const StyledZoomImg = styled(ZoomImage, {
  shouldForwardProp: (prop) => !["width", "height"].includes(prop as string),
})(({ theme: _, width, height }) => ({
  width,
  height,
  position: "relative",
}));

export const StyledImg = styled("img", {
  shouldForwardProp: (prop) => !["width", "height"].includes(prop as string),
})(({ theme: _, width, height }) => ({
  width,
  height,
  position: "relative",
}));
