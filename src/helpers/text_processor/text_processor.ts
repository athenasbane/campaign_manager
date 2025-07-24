import { MALFORMED_LINK_TAG } from "../../Constants/error_warnings";
import { ETextBlockType } from "../../Types/Enum/text_block.enum";
import { TTextBlock } from "../../Types/Types/text_block.type";

/**
 * Convert a text block that contains custom [link](label){path} markup into
 * an array describing the plain text and link segments. This is used by the
 * TextBlock component to render mixed content.
 */
export const textProcessor = (text: string): TTextBlock[] => {
  const openTags = (text.match(/\[link\]/g) || []).length;
  const closeTags = (text.match(/\[\/link\]/g) || []).length;

  if (!openTags || !closeTags || openTags !== closeTags) {
    return [{ textType: ETextBlockType.Text, displayText: text }];
  }

  return text.split(/\[link\]|\[\/link\]/g).map((segment, index) => {
    if (index % 2 === 0) {
      return { textType: ETextBlockType.Text, displayText: segment };
    }

    const matches = segment
      .match(/(?:\()(.*?)(?=\))|(?:\{)(.*?)(?=\})/g)
      ?.map((match) => match.replace(/[({}]/g, ""));

    if (!matches || matches.length < 2) {
      console.warn(MALFORMED_LINK_TAG);
      return { textType: ETextBlockType.Text, displayText: segment };
    }

    return {
      textType: ETextBlockType.Link,
      displayText: matches[0],
      path: matches[1],
    };
  });
};

