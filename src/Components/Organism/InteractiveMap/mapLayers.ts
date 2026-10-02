import L, { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import {
  InteractiveMapData,
  MapFeature,
  MapFeatureType,
  MapGeometry,
} from "../../../Types/Interfaces/interactiveMap.interface";

export const toLeafletPoint = ([x, y]: [number, number]): LatLngExpression => [
  y,
  x,
];

const toLeafletPath = (coordinates: [number, number][]) =>
  coordinates.map(toLeafletPoint);

export const getRectangleBounds = (
  bounds: [[number, number], [number, number]],
): LatLngBoundsExpression => [
  [bounds[0][1], bounds[0][0]],
  [bounds[1][1], bounds[1][0]],
];

const getCoordinateBounds = (
  coordinates: [number, number][],
): LatLngBoundsExpression => {
  const xValues = coordinates.map(([x]) => x);
  const yValues = coordinates.map(([, y]) => y);

  return [
    [Math.min(...yValues), Math.min(...xValues)],
    [Math.max(...yValues), Math.max(...xValues)],
  ];
};

export const getFeatureBounds = (
  feature: MapFeature,
): LatLngBoundsExpression => {
  if (feature.geometry.type === "point") {
    const [x, y] = feature.geometry.coordinates;

    return [
      [y, x],
      [y, x],
    ];
  }

  if (
    feature.geometry.type === "polygon" ||
    feature.geometry.type === "polyline"
  ) {
    return getCoordinateBounds(feature.geometry.coordinates);
  }

  return getRectangleBounds(feature.geometry.bounds);
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getStreetLabelPlacement = (
  coordinates: [number, number][],
): {
  midpoint: [number, number];
  angle: number;
  length: number;
} | null => {
  let longestSegment: {
    midpoint: [number, number];
    angle: number;
    length: number;
  } | null = null;

  for (let index = 1; index < coordinates.length; index += 1) {
    const point = coordinates[index];
    const start = coordinates[index - 1];
    const dx = point[0] - start[0];
    const dy = point[1] - start[1];
    const length = Math.hypot(dx, dy);

    if (length === 0 || (longestSegment && length <= longestSegment.length)) {
      continue;
    }

    let angle = (Math.atan2(-dy, dx) * 180) / Math.PI;

    if (angle > 90 || angle < -90) {
      angle += 180;
    }

    longestSegment = {
      midpoint: [(start[0] + point[0]) / 2, (start[1] + point[1]) / 2],
      angle,
      length,
    };
  }

  return longestSegment;
};

const addStreetLabel = (
  group: L.LayerGroup,
  name: string,
  coordinates: [number, number][],
) => {
  const placement = getStreetLabelPlacement(coordinates);

  if (!placement) {
    return;
  }

  L.marker(toLeafletPoint(placement.midpoint), {
    interactive: false,
    keyboard: false,
    icon: L.divIcon({
      className: "interactive-map-street-label-marker",
      html: `<span class="interactive-map-street-label" style="--street-label-angle: ${placement.angle}deg;">${escapeHtml(
        name,
      )}</span>`,
      iconAnchor: [0, 0],
      iconSize: [0, 0],
    }),
  }).addTo(group);
};

const addDistrictLabel = (
  group: L.LayerGroup,
  name: string,
  coordinates: [number, number][],
) => {
  const center = L.latLngBounds(toLeafletPath(coordinates)).getCenter();

  L.marker(center, {
    interactive: false,
    keyboard: false,
    icon: L.divIcon({
      className: "interactive-map-district-label-marker",
      html: `<span class="interactive-map-district-label">${escapeHtml(
        name,
      )}</span>`,
      iconAnchor: [0, 0],
      iconSize: [0, 0],
    }),
  }).addTo(group);
};

export type DmGeometryMode = "point" | "polygon" | "polyline" | "rectangle";

const roundCoordinate = (value: number) => Math.round(value);
const TILE_ASSET_VERSION = "2026-07-07-circular-city";
export const MAP_FEATURE_TYPE_OPTIONS: MapFeatureType[] = [
  "landmark",
  "district",
  "route",
  "gate",
  "street",
];

const withTileAssetVersion = (urlTemplate: string) => {
  if (!urlTemplate.includes("/maps/circular-city/")) {
    return urlTemplate;
  }

  const separator = urlTemplate.includes("?") ? "&" : "?";
  return `${urlTemplate}${separator}v=${TILE_ASSET_VERSION}`;
};

export const normaliseMapCoordinate = (
  point: [number, number],
  data: InteractiveMapData,
): [number, number] => [
  Math.min(Math.max(roundCoordinate(point[0]), 0), data.imageWidth),
  Math.min(Math.max(roundCoordinate(point[1]), 0), data.imageHeight),
];

export const createSimpleImageTileLayer = (
  urlTemplate: string,
  options: L.TileLayerOptions,
) => {
  const versionedUrlTemplate = withTileAssetVersion(urlTemplate);
  const layer = L.tileLayer(versionedUrlTemplate, options);

  layer.getTileUrl = (coords) => {
    return L.Util.template(versionedUrlTemplate, {
      ...layer.options,
      x: coords.x,
      y: -coords.y - 1,
      z: coords.z,
      r: L.Browser.retina ? "@2x" : "",
    });
  };

  return layer;
};

export const buildDraftGeometry = (
  mode: DmGeometryMode,
  points: [number, number][],
): MapGeometry | null => {
  if (mode === "point") {
    return points[0]
      ? {
          type: "point",
          coordinates: points[0],
        }
      : null;
  }

  if (mode === "rectangle") {
    if (points.length < 2) {
      return null;
    }

    const [start, end] = points;

    return {
      type: "rectangle",
      bounds: [
        [Math.min(start[0], end[0]), Math.min(start[1], end[1])],
        [Math.max(start[0], end[0]), Math.max(start[1], end[1])],
      ],
    };
  }

  if (points.length < (mode === "polygon" ? 3 : 2)) {
    return null;
  }

  return {
    type: mode,
    coordinates: points,
  };
};

export const parseOptionalNumber = (value: string) => {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

export const renderDraftGeometry = (
  group: L.LayerGroup,
  mode: DmGeometryMode,
  points: [number, number][],
) => {
  const options = {
    color: "#1976d2",
    fillColor: "#1976d2",
    fillOpacity: 0.18,
    smoothFactor: 0,
    weight: 3,
  };

  points.forEach((point) =>
    L.circleMarker(toLeafletPoint(point), {
      color: "#1976d2",
      fillColor: "#ffffff",
      fillOpacity: 1,
      radius: 5,
      weight: 2,
    }).addTo(group),
  );

  if (mode === "polygon" && points.length >= 3) {
    L.polygon(toLeafletPath(points), options).addTo(group);
  }

  if (mode === "polyline" && points.length >= 2) {
    points.slice(1).forEach((point, index) => {
      L.polyline(
        [toLeafletPoint(points[index]), toLeafletPoint(point)],
        options,
      ).addTo(group);
    });
  }

  if (mode === "rectangle" && points.length >= 2) {
    const geometry = buildDraftGeometry(mode, points);

    if (geometry?.type === "rectangle") {
      L.rectangle(
        getRectangleBounds(
          geometry.bounds as [[number, number], [number, number]],
        ),
        options,
      ).addTo(group);
    }
  }
};

export const addSelectedFeatureLayer = (
  group: L.LayerGroup,
  feature: MapFeature,
  atlas = false,
) => {
  const selectedOptions = {
    color: atlas ? "#5c4020" : "#ffffff",
    fillColor: atlas ? "#ebc780" : "#1976d2",
    fillOpacity: 0.28,
    opacity: 1,
    smoothFactor: 0,
    weight: 5,
    interactive: false,
  };

  if (feature.geometry.type === "point") {
    L.circleMarker(toLeafletPoint(feature.geometry.coordinates), {
      ...selectedOptions,
      radius: 12,
    }).addTo(group);
  }

  if (feature.geometry.type === "polygon") {
    L.polygon(
      toLeafletPath(feature.geometry.coordinates),
      selectedOptions,
    ).addTo(group);
  }

  if (feature.geometry.type === "polyline") {
    const coordinates = feature.geometry.coordinates;

    coordinates.slice(1).forEach((point, index) => {
      L.polyline(
        [toLeafletPoint(coordinates[index]), toLeafletPoint(point)],
        selectedOptions,
      ).addTo(group);
    });
  }

  if (feature.geometry.type === "rectangle") {
    L.rectangle(
      getRectangleBounds(feature.geometry.bounds),
      selectedOptions,
    ).addTo(group);
  }
};

export const addFeatureLayer = (
  group: L.LayerGroup,
  feature: MapFeature,
  onSelect: (feature: MapFeature) => void,
  options: { popups?: boolean; labels?: boolean; atlas?: boolean } = {},
) => {
  const popupText = feature.revealedSummary || feature.publicSummary || "";
  const commonOptions = {
    color: "#f6c453",
    fillColor: "#2a9d8f",
    fillOpacity: 0.1,
    opacity: 0.35,
    smoothFactor: 0,
    weight: 2,
  };
  let layer: L.Layer | null = null;

  if (feature.geometry.type === "point") {
    layer = L.circleMarker(toLeafletPoint(feature.geometry.coordinates), {
      ...commonOptions,
      radius: options.atlas ? 8 : 7,
      ...(options.atlas
        ? { opacity: 1, fillOpacity: 1, fillColor: "#26352e", color: "#d7ba7c" }
        : {}),
    });
  }

  if (feature.geometry.type === "polygon") {
    layer = L.polygon(
      toLeafletPath(feature.geometry.coordinates),
      commonOptions,
    );

    if (feature.type === "district" && options.labels !== false) {
      addDistrictLabel(group, feature.name, feature.geometry.coordinates);
    }
  }

  if (feature.geometry.type === "polyline") {
    const coordinates = feature.geometry.coordinates;
    const segments = coordinates.slice(1).map((point, index) =>
      L.polyline([toLeafletPoint(coordinates[index]), toLeafletPoint(point)], {
        color: "#f6c453",
        opacity: 0.35,
        smoothFactor: 0,
        weight: 3,
      }),
    );

    if (feature.type === "street" && options.labels !== false) {
      addStreetLabel(group, feature.name, coordinates);
    }

    segments.forEach((segment) => {
      if (feature.type !== "street") {
        segment.bindTooltip(feature.name);
      }
      segment.on("click", () => onSelect(feature));
      segment.on("mouseover", () => {
        segments.forEach((item) => item.setStyle({ opacity: 1, weight: 5 }));
      });
      segment.on("mouseout", () => {
        segments.forEach((item) => item.setStyle({ opacity: 0.35, weight: 3 }));
      });
      segment.addTo(group);
    });

    if (popupText && options.popups !== false) {
      segments.forEach((segment) =>
        segment.bindPopup(
          `<strong>${escapeHtml(feature.name)}</strong><br />${escapeHtml(
            popupText,
          )}`,
          {
            maxWidth: 320,
            minWidth: 180,
            autoPan: false,
            keepInView: false,
          },
        ),
      );
    }

    return;
  }

  if (feature.geometry.type === "rectangle") {
    layer = L.rectangle(
      getRectangleBounds(feature.geometry.bounds),
      commonOptions,
    );
  }

  if (!layer) {
    return;
  }

  if (feature.type !== "district") {
    layer.bindTooltip(feature.name);
  }
  layer.on("click", () => onSelect(feature));

  if (
    (feature.geometry.type === "polygon" ||
      feature.geometry.type === "rectangle") &&
    layer instanceof L.Path
  ) {
    layer.on("mouseover", () => {
      layer.setStyle({ fillOpacity: 0.26, opacity: 1, weight: 3 });
    });
    layer.on("mouseout", () => {
      layer.setStyle({ fillOpacity: 0.1, opacity: 0.35, weight: 2 });
    });
  }

  if (popupText && options.popups !== false) {
    layer.bindPopup(
      `<strong>${escapeHtml(feature.name)}</strong><br />${escapeHtml(
        popupText,
      )}`,
      {
        maxWidth: 320,
        minWidth: 180,
        autoPan: false,
        keepInView: false,
      },
    );
  }

  layer.addTo(group);
};

export const addFogLayer = (group: L.LayerGroup, feature: MapFeature) => {
  const fogOptions = {
    color: "#0b1118",
    fillColor: "#0b1118",
    fillOpacity: 0.62,
    opacity: 0.75,
    weight: 1,
    interactive: false,
  };

  if (feature.geometry.type === "polygon") {
    L.polygon(toLeafletPath(feature.geometry.coordinates), fogOptions).addTo(
      group,
    );
  }

  if (feature.geometry.type === "rectangle") {
    L.rectangle(getRectangleBounds(feature.geometry.bounds), fogOptions).addTo(
      group,
    );
  }
};

export const isFeatureVisibleAtZoom = (feature: MapFeature, zoom: number) => {
  return (
    (feature.minZoom == null || zoom >= feature.minZoom) &&
    (feature.maxZoom == null || zoom <= feature.maxZoom)
  );
};
