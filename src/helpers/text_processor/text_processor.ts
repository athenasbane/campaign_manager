import { MALFORMED_LINK_TAG } from "Constants/error_warnings";
import { ETextBlockType } from "Types/Enum/text_block.enum";
import { TTextBlock } from "Types/Types/text_block.type";

export const textProcessor = (text: string): TTextBlock[] => {
  const openingLink = (text.match(/\[link\]/g) || [])?.length;
  const closingLink = (text.match(/\[\/link\]/g) || [])?.length;
  if (openingLink && closingLink && openingLink === closingLink) {
    return text.split(/\[link\]|\[\/link\]/g).map((item, i) => {
      if (i % 2 === 1) {
        const matches = item
          .match(/(?:\()(.*?)(?=\))|(?:\{)(.*?)(?=\})/g)
          ?.map((match) => match.replace(/[({}]/, ""));
        if (!matches || !matches[0] || !matches[1]) {
          console.warn(MALFORMED_LINK_TAG);
          return {
            textType: ETextBlockType.Text,
            displayText: item,
          };
        }
        return {
          textType: ETextBlockType.Link,
          displayText: matches[0],
          path: matches[1],
        };
      }
      return {
        textType: ETextBlockType.Text,
        displayText: item,
      };
    });
  }
  return [
    {
      textType: ETextBlockType.Text,
      displayText: text,
    },
  ];
};
