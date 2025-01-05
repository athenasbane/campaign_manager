import { textProcessor } from "../../helpers/text_processor/text_processor";
import { EContentType } from "../../Types/Enum/content.enum";
import { ITextBlock } from "../../Types/Interfaces/content.interface";

export const mockTextBlockOne: ITextBlock = {
  contentType: EContentType.TextBlock,
  displayText:
    "This is a sample text that has a [link](link text){path}[/link] this will output again [link](link text 2){path 2}[/link]",
};

export const mockTextBlockTwo: ITextBlock = {
  contentType: EContentType.TextBlock,
  displayText:
    "This is a sample text that has a [link](link text){path} this will output again [link](link text 2){path 2}[/link]",
};

export const mockTextBlockThree: ITextBlock = {
  contentType: EContentType.TextBlock,
  displayText:
    "This is a sample text that has a [link](link text){path}[/link] this will output again [link](link text 2)path 2}[/link]",
};

export const expectedOne = [
  {
    textType: "text",
    displayText: "This is a sample text that has a ",
  },
  {
    textType: "link",
    displayText: "link text",
    path: "path",
  },
  {
    textType: "text",
    displayText: " this will output again ",
  },
  {
    textType: "link",
    displayText: "link text 2",
    path: "path 2",
  },
  {
    textType: "text",
    displayText: "",
  },
];

export const expectedTwo = [
  {
    textType: "text",
    displayText:
      "This is a sample text that has a [link](link text){path} this will output again [link](link text 2){path 2}[/link]",
  },
];

export const expectedThree = [
  {
    textType: "text",
    displayText: "This is a sample text that has a ",
  },
  { textType: "link", displayText: "link text", path: "path" },
  { textType: "text", displayText: " this will output again " },
  { textType: "text", displayText: "(link text 2)path 2}" },
  { textType: "text", displayText: "" },
];

describe("Atom - TextBlock", () => {
  it.each`
    input                 | expected
    ${mockTextBlockOne}   | ${expectedOne}
    ${mockTextBlockTwo}   | ${expectedTwo}
    ${mockTextBlockThree} | ${expectedThree}
  `(
    "should convert text with Links to Typography and with child links",
    ({ input, expected }) => {
      const resultArray = textProcessor(input.displayText);
      expect(resultArray).toEqual(expected);
    }
  );
});
