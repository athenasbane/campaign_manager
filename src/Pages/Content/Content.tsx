import Typography from "@mui/material/Typography/Typography";
import Grid from "@mui/material/Grid/Grid";
import Table from "Components/Molecule/Table/Table";
import { EContentType } from "Types/Enum/content.enum";
import Section from "Components/Molecule/Section/Section";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "hooks/store.hooks";
import { selectContent } from "Store/slices/content";
import { ITable } from "Types/Interfaces";

export default function Content() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const content = useAppSelector((state) => {
    if (!slug) {
      navigate("/404");
      return [];
    }
    return selectContent(state.content, slug);
  });

  const body = content.map((element, index) => {
    switch (element.contentType) {
      case EContentType.Table:
        return (
          <Grid item key={element.contentType + index}>
            <Table {...(element satisfies ITable)} />
          </Grid>
        );
      case EContentType.Title:
        return (
          <Grid item key={element.contentType + index}>
            <Typography
              align={element.align || "left"}
              variant={element.variant || "h4"}
            >
              {element.displayLabel}
            </Typography>
          </Grid>
        );
      case EContentType.TextBlock:
        return (
          <Grid item key={element.contentType + index}>
            <Typography textAlign="justify">{element.displayText}</Typography>
          </Grid>
        );
      case EContentType.Image:
        // [TODO] convert this to a component that regulates the size of the image
        return (
          <Grid item key={element.contentType + index}>
            <img
              style={{ maxWidth: "96vw" }}
              alt={element.altText}
              src={element.imageSrc}
            />
          </Grid>
        );
      case EContentType.Section:
        return (
          <Grid item container>
            <Section key={element.contentType + index} {...element} />
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
