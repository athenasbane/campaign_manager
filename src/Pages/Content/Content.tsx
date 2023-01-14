import Typography from "@mui/material/Typography/Typography";
import Grid from "@mui/material/Grid/Grid";
import Table from "Components/Molecule/Table/Table";
import { alignmentContent } from "Constants/content";
import { EContentType } from "Types/Enum/content.enum";
import Section from "Components/Molecule/Section/Section";

export default function Content() {
  const body = alignmentContent.map((content, index) => {
    switch (content.contentType) {
      case EContentType.Table:
        return (
          <Grid item key={content.contentType + index}>
            <Table {...content} />
          </Grid>
        );
      case EContentType.Title:
        return (
          <Grid item key={content.contentType + index}>
            <Typography variant="h4">{content.displayLabel}</Typography>
          </Grid>
        );
      case EContentType.TextBlock:
        return (
          <Grid item key={content.contentType + index}>
            <Typography textAlign="justify">{content.displayText}</Typography>
          </Grid>
        );
      case EContentType.Image:
        // [TODO] convert this to a component that regulates the size of the image
        return (
          <Grid item key={content.contentType + index}>
            <img alt={content.altText} src={content.imageSrc} />
          </Grid>
        );
      case EContentType.Section:
        return (
          <Grid item container>
            <Section key={content.contentType + index} {...content} />
          </Grid>
        );
      default:
        return null;
    }
  });
  return (
    <Grid container item direction="column">
      {body}
    </Grid>
  );
}
