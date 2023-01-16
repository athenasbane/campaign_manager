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
          <Grid item xs={6}>
            <Typography data-testid="section_element" textAlign="justify">
              {textBlock.displayText}
            </Typography>
          </Grid>
          <Grid style={{ width: "100%", float: "left" }} item xs={6}>
            <img
              data-testid="section_element"
              alt={image.altText}
              src={image.imageSrc}
            />
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={6}>
            <img
              data-testid="section_element"
              style={{ width: "100%", float: "left" }}
              alt={image.altText}
              src={image.imageSrc}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography data-testid="section_element" textAlign="justify">
              {textBlock.displayText}
            </Typography>
          </Grid>
        </>
      )}
    </Grid>
  );
}
