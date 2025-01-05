import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { IDrawListItem } from "../../../Types/Interfaces/DrawListItem";

export interface DrawItemProps {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  item: IDrawListItem;
}

export default function DrawItem({ onClick, item }: DrawItemProps) {
  return (
    <ListItem data-testid="draw_item" key={item.displayText} disablePadding>
      <ListItemButton onClick={onClick}>
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.displayText} />
      </ListItemButton>
    </ListItem>
  );
}
