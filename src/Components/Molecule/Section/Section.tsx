import { ISection } from "../../../Types/Interfaces/content.interface";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

export interface ISectionProps extends ISection {}

export default function Section({
  image,
  textBlock,
  swapSections,
}: ISectionProps) {
  return (
    <Stack direction="row">
      {swapSections ? (
        <Box>
          <Typography data-testid="section_element" textAlign="justify">
            {textBlock.displayText}
          </Typography>
          <img
            style={{ width: "50vw" }}
            data-testid="section_element"
            alt={image.altText}
            src={image.imageSrc}
          />
        </Box>
      ) : (
        <Box>
          <img
            data-testid="section_element"
            style={{ width: "40vw", float: "left", marginRight: "5px" }}
            alt={image.altText}
            src={image.imageSrc}
          />
          <Typography data-testid="section_element" textAlign="justify">
            {textBlock.displayText}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
