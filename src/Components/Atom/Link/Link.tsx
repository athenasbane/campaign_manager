import Typography, { TypographyProps } from "@mui/material/Typography";
import { TTypographyVariant } from "Types/Types/link.type";
import { Link as RouterLink } from "react-router-dom";
import theme from "theme";

export interface ILinkProps {
  typographyVariant: TTypographyVariant;
  path: string;
  linkDisplayLabel: string;
  typographyComponentProps?: TypographyProps;
  display?: string;
  color?: string;
}

export default function Link({
  typographyVariant,
  path,
  linkDisplayLabel,
  typographyComponentProps = {},
  display,
  color = theme.palette.contrastText,
}: ILinkProps) {
  return (
    <RouterLink style={{ textDecoration: "none", color: "inherit" }} to={path}>
      <Typography
        data-testid="link_typography"
        color={color}
        sx={{ display: display || "" }}
        {...typographyComponentProps}
        variant={typographyVariant}
      >
        {linkDisplayLabel}
      </Typography>
    </RouterLink>
  );
}
