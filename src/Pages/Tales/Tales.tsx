import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Table from "Components/Molecule/Table/Table";
import { EContentType } from "Types/Enum/content.enum";
import Section from "Components/Molecule/Section/Section";
import { useNavigate, useParams } from "react-router-dom";
import { useGetContentBySlugQuery } from "Store/slices/backend";
import { ITable, ITitle } from "Types/Interfaces";
import { HashLink } from "react-router-hash-link";
import Skeleton from "@mui/material/Skeleton";
import { useEffect } from "react";

export default function Tales() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetContentBySlugQuery(slug as string);

  useEffect(() => {
    if (error) {
      navigate("/404");
    }
  }, [error, navigate]);

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
              <Grid
                id={element.displayText}
                item
                key={element.contentType + index}
              >
                <Typography
                  align={element.align || "left"}
                  variant={element.variant || "h4"}
                  maxWidth="100vw"
                >
                  {element.displayText}
                </Typography>
              </Grid>
            );
          case EContentType.TextBlock:
            return (
              <Grid
                sx={{ maxWidth: "96vw" }}
                item
                textAlign="left"
                key={element.contentType + index}
              >
                <Typography
                  sx={{ maxWidth: "96vw" }}
                  textAlign="justify"
                  key={element.displayText}
                >
                  {element.displayText}
                </Typography>
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

  const tableOfContents =
    data && !isLoading ? (
      data
        .filter((content) => content.contentType === EContentType.Title)
        .map((title) => (
          <Grid item key={(title as ITitle).displayText}>
            <HashLink
              style={{ textDecoration: "none" }}
              smooth
              to={`#${(title as ITitle).displayText}`}
            >
              <Typography
                color="white"
                sx={{ maxWidth: "96vw", textDecoration: "none" }}
                textAlign="justify"
              >
                {(title as ITitle).displayText}
              </Typography>
            </HashLink>
          </Grid>
        ))
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
    <Grid color={"#f2eecb"} container item direction="column" maxWidth={"96vw"}>
      <Grid item>
        <Typography
          color="white"
          sx={{ maxWidth: "96vw", textDecoration: "none" }}
          textAlign="center"
          variant="h4"
        >
          Table of Contents:
        </Typography>
      </Grid>
      <Grid sx={{ marginBottom: 10 }} item container direction="column">
        {tableOfContents}
      </Grid>
      {body}
    </Grid>
  );
}
