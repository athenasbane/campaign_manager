import MuiList from "@mui/material/List";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import { useNavigate, useParams } from "react-router-dom";
import { useGetListPageQuery } from "Store/slices/backend";
import Link from "Components/Atom/Link/Link";
import { useEffect } from "react";
import { EPage } from "Types/Enum/page.enum";

export default function List() {
  const { slug } = useParams();
  const { data, error, isLoading } = useGetListPageQuery(slug as string);
  const navigate = useNavigate();

  useEffect(() => {
    if (error || (!isLoading && !data)) {
      navigate("/404");
    }
  }, [error, data, isLoading, navigate]);

  const linkObj = {
    [EPage.List]: "/list/",
    [EPage.Lore]: "/content/",
    [EPage.Map]: "/map/",
  };

  const body =
    data && !isLoading ? (
      <MuiList key={slug}>
        <ListItem>
          <Typography align="center" variant="h2">
            {data.pageTitle}
          </Typography>
        </ListItem>
        {data.linksCollection.items.map((link: any) => (
          <ListItem key={link.sys.id}>
            <Link
              typographyVariant="h5"
              linkDisplayLabel={link.pageTitle}
              path={linkObj[link["__typename"] as EPage] + link.sys.id}
            />
          </ListItem>
        ))}
      </MuiList>
    ) : (
      <></>
    );

  return <>{body}</>;
}
