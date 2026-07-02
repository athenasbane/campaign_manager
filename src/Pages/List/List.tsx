import MuiList from "@mui/material/List";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import { useNavigate, useParams } from "react-router-dom";
import { useGetListPageQuery } from "../../Store/slices/backend";
import Link from "../../Components/Atom/Link/Link";
import { useEffect } from "react";
import { EPage } from "../../Types/Enum/page.enum";

interface ListViewProps {
  data: any;
  slug?: string;
  basePath?: string;
}

export function ListView({ data, slug, basePath = "" }: ListViewProps) {
  const linkObj = {
    [EPage.List]: `${basePath}/list/`,
    [EPage.Lore]: `${basePath}/content/`,
    [EPage.Map]: `${basePath}/map/`,
  };

  return (
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
  );
}

export default function List() {
  const { slug } = useParams();
  const { data, error, isLoading } = useGetListPageQuery(slug as string);
  const navigate = useNavigate();

  useEffect(() => {
    if (error || (!isLoading && !data)) {
      navigate("/404");
    }
  }, [error, data, isLoading, navigate]);

  const body = data && !isLoading ? <ListView data={data} slug={slug} /> : <></>;

  return <>{body}</>;
}
