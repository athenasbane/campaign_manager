import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L, { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  InteractiveMapData,
  MapFeature,
} from "../../../Types/Interfaces/interactiveMap.interface";
import {
  DetailPanel,
  DmToolsPanel,
  FeatureSearch,
  StyledMapContainer,
} from "./InteractiveMapStyles";

export interface InteractiveMapProps {
  imageSrc: string;
  unitOfDistance: string | null;
  detail?: number | null;
  width?: number | string;
  height?: number | string;
  mapData?: InteractiveMapData;
  enableDmTools?: boolean;
}

export interface IPin {
  top: number;
  left: number;
  visable: boolean;
}

const toLeafletPoint = ([x, y]: [number, number]): LatLngExpression => [y, x];

const toLeafletPath = (coordinates: [number, number][]) =>
  coordinates.map(toLeafletPoint);

const getRectangleBounds = (
  bounds: [[number, number], [number, number]]
): LatLngBoundsExpression => [
  [bounds[0][1], bounds[0][0]],
  [bounds[1][1], bounds[1][0]],
];

const getCoordinateBounds = (
  coordinates: [number, number][]
): LatLngBoundsExpression => {
  const xValues = coordinates.map(([x]) => x);
  const yValues = coordinates.map(([, y]) => y);

  return [
    [Math.min(...yValues), Math.min(...xValues)],
    [Math.max(...yValues), Math.max(...xValues)],
  ];
};

const getFeatureBounds = (feature: MapFeature): LatLngBoundsExpression => {
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

type DmGeometryMode = "point" | "polygon" | "polyline" | "rectangle";

const roundCoordinate = (value: number) => Math.round(value);

const normaliseMapCoordinate = (
  point: [number, number],
  data: InteractiveMapData
): [number, number] => [
  Math.min(Math.max(roundCoordinate(point[0]), 0), data.imageWidth),
  Math.min(Math.max(roundCoordinate(point[1]), 0), data.imageHeight),
];

const createSimpleImageTileLayer = (
  urlTemplate: string,
  options: L.TileLayerOptions,
  imageHeight: number
) => {
  const layer = L.tileLayer(urlTemplate, options);

  layer.getTileUrl = (coords) => {
    const tileSize = layer.getTileSize().y;
    const rowCount = Math.ceil((imageHeight * 2 ** coords.z) / tileSize);

    return L.Util.template(urlTemplate, {
      ...layer.options,
      x: coords.x,
      y: coords.y + rowCount,
      z: coords.z,
      r: L.Browser.retina ? "@2x" : "",
    });
  };

  return layer;
};

const buildDraftGeometry = (
  mode: DmGeometryMode,
  points: [number, number][]
) => {
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

  if (points.length < 2) {
    return null;
  }

  return {
    type: mode,
    coordinates: points,
  };
};

const renderDraftGeometry = (
  group: L.LayerGroup,
  mode: DmGeometryMode,
  points: [number, number][]
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
    }).addTo(group)
  );

  if (mode === "polygon" && points.length >= 3) {
    L.polygon(toLeafletPath(points), options).addTo(group);
  }

  if (mode === "polyline" && points.length >= 2) {
    points.slice(1).forEach((point, index) => {
      L.polyline([toLeafletPoint(points[index]), toLeafletPoint(point)], options)
        .addTo(group);
    });
  }

  if (mode === "rectangle" && points.length >= 2) {
    const geometry = buildDraftGeometry(mode, points);

    if (geometry?.type === "rectangle") {
      L.rectangle(getRectangleBounds(geometry.bounds as [[number, number], [number, number]]), options).addTo(
        group
      );
    }
  }
};

const addSelectedFeatureLayer = (group: L.LayerGroup, feature: MapFeature) => {
  const selectedOptions = {
    color: "#ffffff",
    fillColor: "#1976d2",
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
      selectedOptions
    ).addTo(group);
  }

  if (feature.geometry.type === "polyline") {
    const coordinates = feature.geometry.coordinates;

    coordinates.slice(1).forEach((point, index) => {
      L.polyline(
        [toLeafletPoint(coordinates[index]), toLeafletPoint(point)],
        selectedOptions
      ).addTo(group);
    });
  }

  if (feature.geometry.type === "rectangle") {
    L.rectangle(
      getRectangleBounds(feature.geometry.bounds),
      selectedOptions
    ).addTo(group);
  }
};

const addFeatureLayer = (
  group: L.LayerGroup,
  feature: MapFeature,
  onSelect: (feature: MapFeature) => void
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
      radius: 7,
    });
  }

  if (feature.geometry.type === "polygon") {
    layer = L.polygon(toLeafletPath(feature.geometry.coordinates), commonOptions);
  }

  if (feature.geometry.type === "polyline") {
    const coordinates = feature.geometry.coordinates;
    const segments = coordinates.slice(1).map((point, index) =>
        L.polyline(
          [
            toLeafletPoint(coordinates[index]),
            toLeafletPoint(point),
          ],
          {
            color: "#f6c453",
            opacity: 0.35,
            smoothFactor: 0,
            weight: 3,
          }
        )
      );

    segments.forEach((segment) => {
      segment.bindTooltip(feature.name);
      segment.on("click", () => onSelect(feature));
      segment.on("mouseover", () => {
        segments.forEach((item) => item.setStyle({ opacity: 1, weight: 5 }));
      });
      segment.on("mouseout", () => {
        segments.forEach((item) =>
          item.setStyle({ opacity: 0.35, weight: 3 })
        );
      });
      segment.addTo(group);
    });

    if (popupText) {
      segments.forEach((segment) =>
        segment.bindPopup(
          `<strong>${escapeHtml(feature.name)}</strong><br />${escapeHtml(
            popupText
          )}`,
          {
            maxWidth: 320,
            minWidth: 180,
            autoPan: false,
            keepInView: false,
          }
        )
      );
    }

    return;
  }

  if (feature.geometry.type === "rectangle") {
    layer = L.rectangle(getRectangleBounds(feature.geometry.bounds), commonOptions);
  }

  if (!layer) {
    return;
  }

  layer.bindTooltip(feature.name);
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

  if (popupText) {
    layer.bindPopup(
      `<strong>${escapeHtml(feature.name)}</strong><br />${escapeHtml(
        popupText
      )}`,
      {
        maxWidth: 320,
        minWidth: 180,
        autoPan: false,
        keepInView: false,
      }
    );
  }

  layer.addTo(group);
};

const addFogLayer = (group: L.LayerGroup, feature: MapFeature) => {
  const fogOptions = {
    color: "#0b1118",
    fillColor: "#0b1118",
    fillOpacity: 0.62,
    opacity: 0.75,
    weight: 1,
    interactive: false,
  };

  if (feature.geometry.type === "polygon") {
    L.polygon(
      toLeafletPath(feature.geometry.coordinates),
      fogOptions
    ).addTo(group);
  }

  if (feature.geometry.type === "rectangle") {
    L.rectangle(getRectangleBounds(feature.geometry.bounds), fogOptions).addTo(
      group
    );
  }
};

export default function InteractiveMap({
  imageSrc,
  width = "100%",
  height = 640,
  mapData,
  enableDmTools = false,
}: InteractiveMapProps) {
  const fallbackMapData: InteractiveMapData = useMemo(
    () => ({
      imageSrc,
      imageWidth: 1000,
      imageHeight: 1000,
      minZoom: -3,
      maxZoom: 4,
      defaultZoom: -1,
      defaultCenter: [500, 500],
      features: [],
      fogFeatures: [],
    }),
    [imageSrc]
  );
  const data = mapData || fallbackMapData;
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const baseLayerRef = useRef<L.Layer | null>(null);
  const featureLayerRef = useRef<L.LayerGroup | null>(null);
  const fogLayerRef = useRef<L.LayerGroup | null>(null);
  const dmLayerRef = useRef<L.LayerGroup | null>(null);
  const selectedLayerRef = useRef<L.LayerGroup | null>(null);
  const [dmMode, setDmMode] = useState<DmGeometryMode>("point");
  const [dmPoints, setDmPoints] = useState<[number, number][]>([]);
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(
    null
  );
  const [featureFilter, setFeatureFilter] = useState("");

  const bounds: LatLngBoundsExpression = useMemo(
    () => [
      [0, 0],
      [data.imageHeight, data.imageWidth],
    ],
    [data.imageHeight, data.imageWidth]
  );

  const visibleFeatures = useMemo(() => {
    const filter = featureFilter.trim().toLowerCase();

    if (!filter) {
      return data.features;
    }

    return data.features.filter((feature) =>
      `${feature.name} ${feature.type}`.toLowerCase().includes(filter)
    );
  }, [data.features, featureFilter]);

  const draftGeometry = useMemo(
    () => buildDraftGeometry(dmMode, dmPoints),
    [dmMode, dmPoints]
  );
  const draftGeometryText = draftGeometry
    ? JSON.stringify(draftGeometry, null, 2)
    : "";

  const handleDmModeChange = (mode: DmGeometryMode) => {
    setDmMode(mode);
    setDmPoints([]);
  };

  const undoDmPoint = () => {
    setDmPoints((prev) => prev.slice(0, -1));
  };

  const copyDraftGeometry = () => {
    if (!draftGeometryText || !navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(draftGeometryText);
  };

  const focusFeature = useCallback((feature: MapFeature) => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (feature.geometry.type === "point") {
      map.setView(toLeafletPoint(feature.geometry.coordinates), map.getZoom(), {
        animate: false,
      });
      return;
    }

    map.fitBounds(getFeatureBounds(feature), {
      animate: false,
      padding: [32, 32],
    });
  }, []);

  const handleFeatureSelect = useCallback(
    (feature: MapFeature) => {
      setSelectedFeature(feature);
      focusFeature(feature);
    },
    [focusFeature]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: data.minZoom,
      maxZoom: data.maxZoom,
      zoomControl: true,
      attributionControl: false,
    });

    map.setMaxBounds(bounds);
    map.setView(toLeafletPoint(data.defaultCenter), data.defaultZoom);
    map.fitBounds(bounds);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [bounds, data.defaultCenter, data.defaultZoom, data.maxZoom, data.minZoom]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (baseLayerRef.current) {
      baseLayerRef.current.remove();
    }

    baseLayerRef.current = data.tileUrlTemplate
      ? createSimpleImageTileLayer(data.tileUrlTemplate, {
          bounds,
          maxZoom: data.maxZoom,
          minZoom: data.minZoom,
          noWrap: true,
        }, data.imageHeight).addTo(mapRef.current)
      : L.imageOverlay(data.imageSrc, bounds).addTo(mapRef.current);
  }, [
    bounds,
    data.imageSrc,
    data.maxZoom,
    data.minZoom,
    data.tileUrlTemplate,
  ]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    featureLayerRef.current?.remove();
    const group = L.layerGroup().addTo(mapRef.current);

    visibleFeatures.forEach((feature) =>
      addFeatureLayer(group, feature, handleFeatureSelect)
    );

    featureLayerRef.current = group;
  }, [handleFeatureSelect, visibleFeatures]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    fogLayerRef.current?.remove();
    const group = L.layerGroup().addTo(mapRef.current);
    data.fogFeatures.forEach((feature) => addFogLayer(group, feature));
    fogLayerRef.current = group;
  }, [data.fogFeatures]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const handleClick = (event: L.LeafletMouseEvent) => {
      const point = normaliseMapCoordinate(
        [event.latlng.lng, event.latlng.lat],
        data
      );

      if (enableDmTools) {
        setDmPoints((prev) => {
          if (dmMode === "point") {
            return [point];
          }

          if (dmMode === "rectangle") {
            return [...prev.slice(-1), point].slice(0, 2);
          }

          return [...prev, point];
        });
      }
    };

    mapRef.current.on("click", handleClick);

    return () => {
      mapRef.current?.off("click", handleClick);
    };
  }, [data, dmMode, enableDmTools]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    dmLayerRef.current?.remove();
    const group = L.layerGroup().addTo(mapRef.current);

    if (enableDmTools) {
      renderDraftGeometry(group, dmMode, dmPoints);
    }

    dmLayerRef.current = group;
  }, [dmMode, dmPoints, enableDmTools]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    selectedLayerRef.current?.remove();
    const group = L.layerGroup().addTo(mapRef.current);

    if (selectedFeature) {
      addSelectedFeatureLayer(group, selectedFeature);
    }

    selectedLayerRef.current = group;
  }, [selectedFeature]);

  return (
    <Box>
      <Stack direction={{ xs: "column", md: "row" }} sx={{ gap: 2 }}>
        <FeatureSearch elevation={2}>
          <TextField
            fullWidth
            size="small"
            label="Search known places"
            value={featureFilter}
            onChange={(event) => setFeatureFilter(event.target.value)}
          />
          <List dense>
            {visibleFeatures.map((feature) => (
              <ListItemButton
                key={feature.key}
                selected={selectedFeature?.key === feature.key}
                onClick={() => handleFeatureSelect(feature)}
              >
                <ListItemText primary={feature.name} secondary={feature.type} />
              </ListItemButton>
            ))}
          </List>
          {enableDmTools ? (
            <DmToolsPanel elevation={0}>
              <Stack direction="column" sx={{ gap: 1.5 }}>
                <Typography variant="h4">DM Tools</Typography>
                <ButtonGroup size="small" variant="outlined">
                  <Button
                    variant={dmMode === "point" ? "contained" : "outlined"}
                    onClick={() => handleDmModeChange("point")}
                  >
                    Point
                  </Button>
                  <Button
                    variant={dmMode === "polygon" ? "contained" : "outlined"}
                    onClick={() => handleDmModeChange("polygon")}
                  >
                    Polygon
                  </Button>
                  <Button
                    variant={dmMode === "polyline" ? "contained" : "outlined"}
                    onClick={() => handleDmModeChange("polyline")}
                  >
                    Line
                  </Button>
                  <Button
                    variant={dmMode === "rectangle" ? "contained" : "outlined"}
                    onClick={() => handleDmModeChange("rectangle")}
                  >
                    Box
                  </Button>
                </ButtonGroup>
                <Stack direction="row" sx={{ gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!dmPoints.length}
                    onClick={undoDmPoint}
                  >
                    Undo
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!dmPoints.length}
                    onClick={() => setDmPoints([])}
                  >
                    Clear
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!draftGeometryText}
                    onClick={copyDraftGeometry}
                  >
                    Copy JSON
                  </Button>
                </Stack>
                <Divider />
                <Typography variant="body2">
                  Points: {dmPoints.length}
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    fontSize: 12,
                    margin: 0,
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {draftGeometryText || "Click the map to draft geometry."}
                </Box>
              </Stack>
            </DmToolsPanel>
          ) : null}
        </FeatureSearch>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <StyledMapContainer
            data-testid="interactive-map"
            ref={containerRef}
            sx={{ width, height }}
          />
          {selectedFeature ? (
            <DetailPanel elevation={3}>
              <Typography variant="h4">{selectedFeature.name}</Typography>
              <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                {selectedFeature.type}
              </Typography>
              <Typography>
                {selectedFeature.revealedSummary ||
                  selectedFeature.publicSummary ||
                  "No details recorded."}
              </Typography>
            </DetailPanel>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
}
