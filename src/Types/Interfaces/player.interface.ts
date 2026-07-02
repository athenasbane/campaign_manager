export interface PlayerSection {
  title: string;
  body: string;
  bodyRichText?: unknown;
}

export interface PlayerProfile {
  displayName: string;
  characterName: string;
  privateSections: PlayerSection[];
  rootPage?: unknown;
  rootPageId?: string | null;
  rootPageType?: string | null;
  defaultMapSlug?: string | null;
  knownMapFeatureKeys?: string[];
  revealedMapAreaKeys?: string[];
}
