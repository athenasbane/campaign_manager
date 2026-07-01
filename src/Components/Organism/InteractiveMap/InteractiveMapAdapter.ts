import {
  InteractiveMapData,
  MapFeature,
  MapFeatureType,
  MapGeometry,
  PlayerMapVisibility,
} from "../../../Types/Interfaces/interactiveMap.interface";

interface RawMapFeature
  extends Partial<Omit<MapFeature, "geometry" | "type">> {
  type?:
    | MapFeature["type"]
    | readonly MapFeature["type"][]
    | string
    | readonly string[]
    | null;
  geometry?: MapFeature["geometry"] | string | null;
}

interface RawMapPage {
  mapId?: string | null;
  tileUrlTemplate?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  minZoom?: number | null;
  maxZoom?: number | null;
  defaultZoom?: number | null;
  defaultCenter?: [number, number] | string | null;
  map?: {
    url?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  featuresCollection?: {
    items?: RawMapFeature[] | null;
  } | null;
  featureCollection?: {
    items?: RawMapFeature[] | null;
  } | null;
}

interface NormalisedRawMapFeature
  extends Partial<Omit<MapFeature, "geometry" | "type">> {
  type?: MapFeatureType | null;
  geometry?: MapGeometry | null;
}

const DEFAULT_IMAGE_WIDTH = 1000;
const DEFAULT_IMAGE_HEIGHT = 1000;
const MAP_FEATURE_TYPES = new Set<MapFeatureType>([
  "landmark",
  "district",
  "route",
  "gate",
  "street",
]);
const DEFAULT_FEATURE_MIN_ZOOM: Partial<Record<MapFeatureType, number>> = {
  district: 0,
  route: 1,
  street: 2,
};

const parseJsonField = <T,>(value: T | string | null | undefined): T | null => {
  if (!value) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const isCoordinate = (value: unknown): value is [number, number] => {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
};

const normaliseCoordinates = (value: unknown): [number, number][] => {
  if (!Array.isArray(value)) {
    return [];
  }

  if (value.every(isCoordinate)) {
    return value;
  }

  const firstRing = value[0];

  if (Array.isArray(firstRing) && firstRing.every(isCoordinate)) {
    return firstRing;
  }

  return [];
};

const normaliseGeometry = (geometry: unknown): MapGeometry | null => {
  if (!geometry || typeof geometry !== "object" || !("type" in geometry)) {
    return null;
  }

  const rawGeometry = geometry as {
    type?: string;
    coordinates?: unknown;
    bounds?: unknown;
  };

  if (rawGeometry.type === "point" && isCoordinate(rawGeometry.coordinates)) {
    return {
      type: "point",
      coordinates: rawGeometry.coordinates,
    };
  }

  if (rawGeometry.type === "polygon" || rawGeometry.type === "polyline") {
    const coordinates = normaliseCoordinates(rawGeometry.coordinates);

    if (
      (rawGeometry.type === "polygon" && coordinates.length < 3) ||
      (rawGeometry.type === "polyline" && coordinates.length < 2)
    ) {
      return null;
    }

    return {
      type: rawGeometry.type,
      coordinates,
    };
  }

  if (rawGeometry.type === "rectangle" && Array.isArray(rawGeometry.bounds)) {
    const bounds = rawGeometry.bounds;

    if (isCoordinate(bounds[0]) && isCoordinate(bounds[1])) {
      return {
        type: "rectangle",
        bounds: [bounds[0], bounds[1]],
      };
    }
  }

  return null;
};

const normaliseFeatureType = (type: RawMapFeature["type"]) => {
  const value = Array.isArray(type) ? type[0] : type;

  return typeof value === "string" && MAP_FEATURE_TYPES.has(value as MapFeatureType)
    ? (value as MapFeatureType)
    : null;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const getDefaultFeatureMinZoom = (type: MapFeatureType) =>
  DEFAULT_FEATURE_MIN_ZOOM[type] ?? null;

const isFogAreaFeature = (feature: MapFeature) =>
  feature.geometry.type === "polygon" || feature.geometry.type === "rectangle";

const isMapFeature = (
  feature: NormalisedRawMapFeature
): feature is MapFeature => {
  return Boolean(feature.key && feature.name && feature.type && feature.geometry);
};

const normaliseFeature = (feature: RawMapFeature): NormalisedRawMapFeature => {
  const type = normaliseFeatureType(feature.type);
  const parsedGeometry = parseJsonField<
    MapFeature["geometry"] & {
      minZoom?: unknown;
      maxZoom?: unknown;
    }
  >(feature.geometry);

  return {
    ...feature,
    type,
    geometry: normaliseGeometry(parsedGeometry),
    minZoom: isFiniteNumber(feature.minZoom)
      ? feature.minZoom
      : isFiniteNumber(parsedGeometry?.minZoom)
        ? parsedGeometry.minZoom
      : type
        ? getDefaultFeatureMinZoom(type)
        : null,
    maxZoom: isFiniteNumber(feature.maxZoom)
      ? feature.maxZoom
      : isFiniteNumber(parsedGeometry?.maxZoom)
        ? parsedGeometry.maxZoom
        : null,
  };
};

export const normaliseMapPage = (
  page: RawMapPage,
  visibility?: PlayerMapVisibility
): InteractiveMapData => {
  const imageWidth =
    page.imageWidth || page.map?.width || DEFAULT_IMAGE_WIDTH;
  const imageHeight =
    page.imageHeight || page.map?.height || DEFAULT_IMAGE_HEIGHT;
  const knownFeatureKeys = new Set(visibility?.knownMapFeatureKeys || []);
  const revealedAreaKeys = new Set(visibility?.revealedMapAreaKeys || []);

  const features = (
    page.featuresCollection?.items ||
    page.featureCollection?.items ||
    []
  )
    .map(normaliseFeature)
    .filter(isMapFeature);

  const isKnown = (feature: MapFeature) => {
    if (isFogAreaFeature(feature)) {
      return true;
    }

    if (!feature.visibilityKey) {
      return true;
    }

    return (
      knownFeatureKeys.has(feature.key) ||
      knownFeatureKeys.has(feature.visibilityKey)
    );
  };

  const isRevealed = (feature: MapFeature) => {
    if (!feature.visibilityKey) {
      return true;
    }

    return (
      revealedAreaKeys.has(feature.key) ||
      revealedAreaKeys.has(feature.visibilityKey)
    );
  };

  return {
    mapId: page.mapId,
    imageSrc: page.map?.url || "",
    tileUrlTemplate: page.tileUrlTemplate,
    imageWidth,
    imageHeight,
    minZoom: page.minZoom ?? -3,
    maxZoom: page.maxZoom ?? 4,
    defaultZoom: page.defaultZoom ?? -1,
    defaultCenter:
      parseJsonField<[number, number]>(page.defaultCenter) || [
        imageWidth / 2,
        imageHeight / 2,
      ],
    features: features.filter(isKnown),
    fogFeatures: features.filter(
      (feature) => !isRevealed(feature) && isFogAreaFeature(feature)
    ),
  };
};
