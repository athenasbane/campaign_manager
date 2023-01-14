import MuiList from "@mui/material/List";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import { useParams } from "react-router-dom";
import { useAppSelector } from "hooks/store.hooks";
import { selectFilteredList } from "Store/slices/lists";
import Link from "Components/Atom/Link/Link";

export default function List() {
  const { slug } = useParams();
  const lists = useAppSelector((state) =>
    selectFilteredList(state.lists, slug)
  );

  const list = lists.map((list) => {
    return (
      <MuiList key={list.param}>
        <ListItem>
          {list.parentDisplayLabel ? (
            <Typography align="center" variant="h2">
              {list.parentDisplayLabel}
            </Typography>
          ) : null}
        </ListItem>
        <ListItem>
          <Typography align="center" variant="h3">
            {list.displayLabel}
          </Typography>
        </ListItem>
        {list.links.map((link) => {
          return (
            <ListItem key={link.value}>
              <Link
                typographyVariant="h5"
                linkDisplayLabel={link.displayLabel}
                route={link.path}
              />
            </ListItem>
          );
        })}
      </MuiList>
    );
  });

  return <>{list}</>;
}
