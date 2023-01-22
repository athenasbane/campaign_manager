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

export const list: IListType[] = [
  {
    param: "maps",
    displayText: "Maps",
    parentDisplayLabel: undefined,
    links: [
      { displayText: "Tordenhelm", value: "1", path: "/map/tordenhelm" },
      { displayText: "The Nals", value: "2", path: "/list/the_nals" },
    ],
  },
  {
    param: "the_nals",
    displayText: "The Nals",
    parentDisplayLabel: "Maps",
    links: [
      {
        displayText: "Cities, Towns & Villages",
        value: "1",
        path: "/list/the_nals_ctv",
      },
      { displayText: "Cirrane Coast", value: "2", path: "/map/cirrain_coast" },
      { displayText: "Mere Lands", value: "3", path: "/map/mere_lands" },
      {
        displayText: "Hirane Mount Coast",
        value: "4",
        path: "/map/hirane_mount_coast",
      },
      {
        displayText: "Nirwod",
        value: "5",
        path: "/map/nirwod",
      },
    ],
  },
  {
    param: "the_nals_ctv",
    displayText: "Cities, Towns & Villages",
    parentDisplayLabel: "Maps",
    links: [
      {
        displayText: "Klilcaithness",
        value: "1",
        path: "/map/klilcaithness",
      },
      { displayText: "The Shambles", value: "2", path: "/map/shambles" },
      { displayText: "Thorpeness", value: "3", path: "/map/thorpeness" },
    ],
  },
  {
    param: "content",
    displayText: "Basic Overview",
    parentDisplayLabel: "Lore",
    links: [
      {
        displayText: "The Imperium",
        value: "0",
        path: "/content/the_imperium",
      },
      {
        displayText: "Alignment",
        value: "1",
        path: "/content/alignment",
      },
      {
        displayText: "Dead Gods",
        value: "2",
        path: "/content/dead_gods",
      },
      {
        displayText: "The Pact Mortalis",
        value: "3",
        path: "/content/pact_mortalis",
      },
      {
        displayText: "Demons",
        value: "4",
        path: "/content/demons",
      },
    ],
  },
];
