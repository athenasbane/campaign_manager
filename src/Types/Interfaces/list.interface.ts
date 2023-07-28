export interface linkItem {
  displayText: string;
  value: string;
  path: string;
}

export interface IListType {
  param: string;
  displayText: string;
  parentDisplayLabel?: string;
  links: linkItem[];
}
