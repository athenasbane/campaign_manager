import type {
  InteractiveMapData,
  MapFeature,
  MapFeatureType,
} from "../../../Types/Interfaces/interactiveMap.interface";
import { mapCoordinateDistanceCalc } from "./InteractiveMapUtils";

export const atlasFeatureType = (feature: MapFeature): MapFeatureType =>
  feature.type === "landmark" &&
  feature.geometry.type === "point" &&
  /\bgate$/i.test(feature.name.trim())
    ? "gate"
    : feature.type;
export function findAtlasPlaces(
  features: MapFeature[],
  query: string,
  category = "all",
) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return features
    .filter(
      (feature) =>
        (category === "all" || atlasFeatureType(feature) === category) &&
        terms.every((term) =>
          `${feature.name} ${atlasFeatureType(feature)}`
            .toLocaleLowerCase()
            .includes(term),
        ),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}
export function parseAtlasView(
  value: string | null | undefined,
  data: InteractiveMapData,
) {
  if (!value) return null;
  const parts = value.split(",");
  if (parts.length !== 3 || parts.some((part) => !part.trim())) return null;
  const [zoom, x, y] = parts.map(Number);
  return [zoom, x, y].every(Number.isFinite) &&
    zoom >= data.minZoom &&
    zoom <= data.maxZoom &&
    x >= 0 &&
    x <= data.imageWidth &&
    y >= 0 &&
    y <= data.imageHeight
    ? { zoom, x, y }
    : null;
}
export function atlasDistance(
  points: [number, number][],
  data: InteractiveMapData,
) {
  const scale = data.distanceScale;
  if (!scale || scale <= 0 || !data.unitOfDistance || points.length < 2)
    return null;
  return points
    .slice(1)
    .reduce(
      (sum, point, index) =>
        sum +
        mapCoordinateDistanceCalc(
          points[index],
          point,
          data.imageHeight,
          data.imageWidth,
        ) *
          scale,
      0,
    );
}
