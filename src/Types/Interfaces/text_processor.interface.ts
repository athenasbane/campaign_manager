import { ETextBlockType } from "Types/Enum/text_block.enum";

export interface ITextBlockText {
  textType: ETextBlockType.Text;
  displayText: string;
}

export interface ITextBlockLink {
  textType: ETextBlockType.Link;
  displayText: string;
  path: string;
}
