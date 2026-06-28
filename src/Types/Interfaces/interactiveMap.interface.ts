export type MapFeatureType =
  | "landmark"
  | "district"
  | "route"
  | "gate"
  | "street";

export type MapGeometry =
  | {
      type: "point";
      coordinates: [number, number];
    }
  | {
      type: "polygon";
      coordinates: [number, number][];
    }
  | {
      type: "polyline";
      coordinates: [number, number][];
    }
  | {
      type: "rectangle";
      bounds: [[number, number], [number, number]];
    };

export interface MapFeature {
  key: string;
  name: string;
  type: MapFeatureType;
  geometry: MapGeometry;
  publicSummary?: string | null;
  revealedSummary?: string | null;
  visibilityKey?: string | null;
}

export interface PlayerMapVisibility {
  knownMapFeatureKeys?: string[];
  revealedMapAreaKeys?: string[];
}

export interface InteractiveMapData {
  mapId?: string | null;
  imageSrc: string;
  tileUrlTemplate?: string | null;
  imageWidth: number;
  imageHeight: number;
  minZoom: number;
  maxZoom: number;
  defaultZoom: number;
  defaultCenter: [number, number];
  features: MapFeature[];
  fogFeatures: MapFeature[];
}
