import type { MapGeometry, MapFeatureType } from "./interactiveMap.interface";
export type EntryType =
  | "person"
  | "place"
  | "faction"
  | "history"
  | "culture"
  | "rules"
  | "lore"
  | "session"
  | "mission"
  | "knowledge"
  | "handout";
export interface CampaignEntry {
  id: string;
  type: EntryType;
  title: string;
  summary: string;
  aliases: string[];
  tags: string[];
  relatedIds?: string[];
  private: boolean;
  version: number;
  updatedAt: string;
  unread?: boolean;
  bookmarked?: boolean;
}
export interface CampaignArticle extends CampaignEntry {
  body: string;
  mapFeature?: {
    mapId: string;
    key: string;
    type: MapFeatureType;
    geometry: MapGeometry;
    minZoom?: number | null;
    maxZoom?: number | null;
  } | null;
  related: CampaignEntry[];
  backlinks: CampaignEntry[];
}
export interface CampaignOverview {
  id: string;
  name: string;
  description: string;
  nextSession: string | null;
  timezone: string;
  primerId: string | null;
  total: number;
  member: {
    characterId: string;
    characterName: string;
    displayName: string;
  } | null;
  recent: CampaignEntry[];
  latestSession: CampaignEntry | null;
  missions: CampaignEntry[];
  unreadKnowledge: number;
}
export interface CampaignSearch {
  items: CampaignEntry[];
  total: number;
  unreadTotal: number;
  page: number;
  pages: number;
  types: Partial<Record<EntryType, number>>;
}
