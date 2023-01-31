import MuiList from "@mui/material/List";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import { useNavigate, useParams } from "react-router-dom";
import { useGetListBySlugQuery } from "Store/slices/lists";
import Link from "Components/Atom/Link/Link";
import { useEffect } from "react";

export default function List() {
  const { slug } = useParams();
  const { data, error, isLoading } = useGetListBySlugQuery(slug as string);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      navigate("/404");
    }
  }, [error, navigate]);

  const body =
    data && !isLoading ? (
      <MuiList key={data.param}>
        <ListItem>
          {data.parentDisplayLabel ? (
            <Typography align="center" variant="h2">
              {data.parentDisplayLabel}
            </Typography>
          ) : null}
        </ListItem>
        <ListItem>
          <Typography align="center" variant="h3">
            {data.displayText}
          </Typography>
        </ListItem>
        {data.links.map((link) => {
          return (
            <ListItem key={link.value}>
              <Link
                typographyVariant="h5"
                linkDisplayLabel={link.displayText}
                path={link.path}
              />
            </ListItem>
          );
        })}
      </MuiList>
    ) : (
      <></>
    );

  return <>{body}</>;
}
