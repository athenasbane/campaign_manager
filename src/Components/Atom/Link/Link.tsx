import Typography, { TypographyProps } from "@mui/material/Typography";
import { TTypographyVariant } from "Types/Types/link.type";
import { Link as RouterLink } from "react-router-dom";

interface ILinkProps {
  typographyVariant: TTypographyVariant;
  route: string;
  linkDisplayLabel: string;
  typographyComponentProps?: TypographyProps;
}

export default function Link({
  typographyVariant,
  route,
  linkDisplayLabel,
  typographyComponentProps = {},
}: ILinkProps) {
  return (
    <RouterLink style={{ textDecoration: "none", color: "inherit" }} to={route}>
      <Typography {...typographyComponentProps} variant={typographyVariant}>
        {linkDisplayLabel}
      </Typography>
    </RouterLink>
  );
}
