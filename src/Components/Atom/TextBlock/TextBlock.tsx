import { Typography } from "@mui/material";
import { textProcessor } from "helpers/text_processor/text_processor";
import theme from "theme";
import { ETextBlockType } from "Types/Enum/text_block.enum";
import { ITextBlock } from "Types/Interfaces";
import Link from "../Link/Link";

export interface ITextBlockProps extends ITextBlock {}

export default function TextBlock({ displayText }: ITextBlockProps) {
  const elements = textProcessor(displayText).map((el, i) => {
    switch (el.textType) {
      case ETextBlockType.Link:
        return (
          <Link
            key={el.displayText + i}
            typographyVariant="body1"
            color={theme.palette.primary.light}
            route={el.path}
            linkDisplayLabel={el.displayText}
            display="inline-block"
          />
        );
      case ETextBlockType.Text:
        return (
          <Typography
            sx={{ display: "inline" }}
            textAlign="justify"
            key={el.displayText + i}
          >
            {el.displayText}
          </Typography>
        );
      default:
        return null;
    }
  });
  return <>{elements}</>;
}
