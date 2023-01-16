import { ISection } from "Types/Interfaces";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

export interface ISectionProps extends ISection {}

export default function Section({
  image,
  textBlock,
  swapSections,
}: ISectionProps) {
  return (
    <Grid item container direction="row">
      {swapSections ? (
        <>
          <Grid item>
            <Typography data-testid="section_element" textAlign="justify">
              {textBlock.displayText}
            </Typography>
            <img
              style={{ width: "50vw" }}
              data-testid="section_element"
              alt={image.altText}
              src={image.imageSrc}
            />
          </Grid>
        </>
      ) : (
        <>
          <Grid item>
            <img
              data-testid="section_element"
              style={{ width: "40vw", float: "left", marginRight: "5px" }}
              alt={image.altText}
              src={image.imageSrc}
            />
            <Typography data-testid="section_element" textAlign="justify">
              {textBlock.displayText}
            </Typography>
          </Grid>
        </>
      )}
    </Grid>
  );
}
