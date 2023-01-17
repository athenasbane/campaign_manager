import { MALFORMED_LINK_TAG } from "Constants/error_warnings";

export const textProcessor = (text: string) => {
  debugger;
  const openingLink = (text.match(/\[link\]/g) || [])?.length;
  const closingLink = (text.match(/\[\/link\]/g) || [])?.length;
  if (openingLink && closingLink && openingLink === closingLink) {
    const split = text.split(/\[link\]|\[\/link\]/g).map((item, i) => {
      if (i % 2 === 1) {
        const matches = item.match(/(?<=\()(.*?)(?=\))|(?<=\{)(.*?)(?=\})/g);
        if (!matches || !matches[0] || !matches[1]) {
          console.warn(MALFORMED_LINK_TAG);
          return {
            textType: "text",
            displayText: item,
          };
        }
        return {
          textType: "link",
          displayText: matches[0],
          path: matches[1],
        };
      }
      return {
        textType: "text",
        displayText: item,
      };
    });
    return split;
  }
  return [
    {
      textType: "text",
      displayText: text,
    },
  ];
};
