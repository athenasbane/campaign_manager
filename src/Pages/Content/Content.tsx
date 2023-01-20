import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Table from "Components/Molecule/Table/Table";
import { EContentType } from "Types/Enum/content.enum";
import Section from "Components/Molecule/Section/Section";
import { useParams } from "react-router-dom";
import { useGetContentBySlugQuery } from "Store/slices/content";
import { ITable } from "Types/Interfaces";
import TextBlock from "Components/Atom/TextBlock/TextBlock";
import Skeleton from "@mui/material/Skeleton";

export default function Content() {
  const { slug } = useParams();
  const { data, error, isLoading } = useGetContentBySlugQuery(slug as string);

  const body =
    data && !isLoading ? (
      data.map((element, index) => {
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
                  {element.displayText}
                </Typography>
              </Grid>
            );
          case EContentType.TextBlock:
            return (
              <Grid item textAlign="justify" key={element.contentType + index}>
                <TextBlock {...element} />
              </Grid>
            );
          case EContentType.Image:
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
              <Grid key={element.contentType + index} item container>
                <Section key={element.contentType + index} {...element} />
              </Grid>
            );
          default:
            return null;
        }
      })
    ) : (
      <>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="rectangular" height={100} />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </>
    );
  return (
    <Grid container item direction="column">
      {body}
    </Grid>
  );
}
