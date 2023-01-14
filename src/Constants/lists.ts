export interface linkItem {
  displayLabel: string;
  value: string;
  path: string;
}

export interface IListType {
  param: string;
  displayLabel: string;
  parentDisplayLabel?: string;
  links: linkItem[];
}

export const list: IListType[] = [
  {
    param: "maps",
    displayLabel: "Maps",
    parentDisplayLabel: undefined,
    links: [
      { displayLabel: "Tordenhelm", value: "1", path: "/map/tordenhelm" },
      { displayLabel: "The Nals", value: "2", path: "/list/the_nals" },
    ],
  },
  {
    param: "the_nals",
    displayLabel: "The Nals",
    parentDisplayLabel: "Maps",
    links: [
      {
        displayLabel: "Cities, Towns & Villages",
        value: "1",
        path: "/list/the_nals_ctv",
      },
      { displayLabel: "Cirrain Coast", value: "2", path: "/map/cirrain_coast" },
    ],
  },
  {
    param: "the_nals_ctv",
    displayLabel: "Cities, Towns & Villages",
    parentDisplayLabel: "Maps",
    links: [
      {
        displayLabel: "Klilcaithness",
        value: "1",
        path: "/map/klilcaithness",
      },
      { displayLabel: "The Shambles", value: "2", path: "/map/shambles" },
    ],
  },
];
