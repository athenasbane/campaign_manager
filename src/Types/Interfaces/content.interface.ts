import { EContentType } from "Types/Enum/content.enum";
import { TTypographyVariant } from "Types/Types/link.type";
export interface ITextBlock {
  contentType: EContentType.TextBlock;
  displayText: string;
}

export interface IImage {
  contentType: EContentType.Image;
  imageSrc: string;
  altText: string;
}

export interface ISection {
  contentType: EContentType.Section;
  image: IImage;
  textBlock: ITextBlock;
  swapSections: boolean;
}

export interface ITable {
  contentType: EContentType.Table;
  tableHeader: string[];
  body: string[][];
}

export interface ITitle {
  contentType: EContentType.Title;
  displayLabel: string;
  variant?: TTypographyVariant;
  align?: "left" | "center" | "right";
}
