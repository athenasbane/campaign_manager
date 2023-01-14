import { ISection } from "Types/Interfaces";
import Typography from "@mui/material/Typography/Typography";
import Grid from "@mui/material/Grid/Grid";

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
            <Typography textAlign="justify">{textBlock.displayText}</Typography>
          </Grid>
          <Grid item xs={6}>
            <img alt={image.altText} src={image.imageSrc} />
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={6}>
            <img
              style={{ width: "100%", float: "left" }}
              alt={image.altText}
              src={image.imageSrc}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography textAlign="justify">{textBlock.displayText}</Typography>
          </Grid>
        </>
      )}
    </Grid>
  );
}
