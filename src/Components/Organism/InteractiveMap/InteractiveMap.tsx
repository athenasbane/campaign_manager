import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L, { LatLngBoundsExpression } from "leaflet";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  InteractiveMapData,
  MapFeature,
  MapFeatureType,
} from "../../../Types/Interfaces/interactiveMap.interface";
import {
  DetailPanel,
  DmToolsPanel,
  FeatureSearch,
  StyledMapContainer,
} from "./InteractiveMapStyles";

import {
  toLeafletPoint,
  getFeatureBounds,
  normaliseMapCoordinate,
  createSimpleImageTileLayer,
  buildDraftGeometry,
  renderDraftGeometry,
  addSelectedFeatureLayer,
  addFeatureLayer,
  addFogLayer,
  isFeatureVisibleAtZoom,
  parseOptionalNumber,
  MAP_FEATURE_TYPE_OPTIONS,
  DmGeometryMode,
} from "./mapLayers";

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
    [imageSrc],
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
  const [dmFeatureKey, setDmFeatureKey] = useState("");
  const [dmFeatureName, setDmFeatureName] = useState("");
  const [dmFeatureType, setDmFeatureType] =
    useState<MapFeatureType>("landmark");
  const [dmMinZoom, setDmMinZoom] = useState("");
  const [dmMaxZoom, setDmMaxZoom] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(
    null,
  );
  const [featureFilter, setFeatureFilter] = useState("");
  const [currentZoom, setCurrentZoom] = useState(data.defaultZoom);

  const bounds: LatLngBoundsExpression = useMemo(
    () => [
      [0, 0],
      [data.imageHeight, data.imageWidth],
    ],
    [data.imageHeight, data.imageWidth],
  );

  const visibleFeatures = useMemo(() => {
    const filter = featureFilter.trim().toLowerCase();

    return data.features.filter((feature) => {
      const matchesSearch =
        !filter ||
        `${feature.name} ${feature.type}`.toLowerCase().includes(filter);

      return matchesSearch && isFeatureVisibleAtZoom(feature, currentZoom);
    });
  }, [currentZoom, data.features, featureFilter]);

  const visibleFogFeatures = useMemo(
    () =>
      data.fogFeatures.filter((feature) =>
        isFeatureVisibleAtZoom(feature, currentZoom),
      ),
    [currentZoom, data.fogFeatures],
  );

  const draftGeometry = useMemo(
    () => buildDraftGeometry(dmMode, dmPoints),
    [dmMode, dmPoints],
  );
  const draftGeometryText = draftGeometry
    ? JSON.stringify(draftGeometry, null, 2)
    : "";
  const draftContentfulGeometry = useMemo(() => {
    if (!draftGeometry) {
      return null;
    }

    const minZoom = parseOptionalNumber(dmMinZoom);
    const maxZoom = parseOptionalNumber(dmMaxZoom);

    return {
      ...draftGeometry,
      ...(minZoom == null ? {} : { minZoom }),
      ...(maxZoom == null ? {} : { maxZoom }),
    };
  }, [dmMaxZoom, dmMinZoom, draftGeometry]);
  const draftContentfulFields = useMemo(() => {
    if (!draftContentfulGeometry) {
      return null;
    }

    return {
      key: dmFeatureKey.trim(),
      name: dmFeatureName.trim(),
      type: dmFeatureType,
      geometry: JSON.stringify(draftContentfulGeometry),
      publicSummary: "",
      revealedSummary: "",
      visibilityKey: "",
    };
  }, [draftContentfulGeometry, dmFeatureKey, dmFeatureName, dmFeatureType]);
  const draftContentfulFieldsText = draftContentfulFields
    ? JSON.stringify(draftContentfulFields, null, 2)
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

  const copyDraftContentfulFields = () => {
    if (!draftContentfulFieldsText || !navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(draftContentfulFieldsText);
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
    [focusFeature],
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
    setCurrentZoom(map.getZoom());
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [
    bounds,
    data.defaultCenter,
    data.defaultZoom,
    data.maxZoom,
    data.minZoom,
  ]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const map = mapRef.current;
    const updateZoom = () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      setSelectedFeature((selected) =>
        selected && !isFeatureVisibleAtZoom(selected, zoom) ? null : selected,
      );
    };

    updateZoom();
    map.on("zoomend", updateZoom);

    return () => {
      map.off("zoomend", updateZoom);
    };
  }, []);

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
        }).addTo(mapRef.current)
      : L.imageOverlay(data.imageSrc, bounds).addTo(mapRef.current);
  }, [bounds, data.imageSrc, data.maxZoom, data.minZoom, data.tileUrlTemplate]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    featureLayerRef.current?.remove();
    const group = L.layerGroup().addTo(mapRef.current);

    visibleFeatures.forEach((feature) =>
      addFeatureLayer(group, feature, handleFeatureSelect),
    );

    featureLayerRef.current = group;
  }, [handleFeatureSelect, visibleFeatures]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    fogLayerRef.current?.remove();
    const group = L.layerGroup().addTo(mapRef.current);
    visibleFogFeatures.forEach((feature) => addFogLayer(group, feature));
    fogLayerRef.current = group;
  }, [visibleFogFeatures]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const handleClick = (event: L.LeafletMouseEvent) => {
      const point = normaliseMapCoordinate(
        [event.latlng.lng, event.latlng.lat],
        data,
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
                <TextField
                  size="small"
                  label="Contentful key"
                  value={dmFeatureKey}
                  onChange={(event) => setDmFeatureKey(event.target.value)}
                />
                <TextField
                  size="small"
                  label="Contentful name"
                  value={dmFeatureName}
                  onChange={(event) => setDmFeatureName(event.target.value)}
                />
                <TextField
                  select
                  size="small"
                  label="Contentful type"
                  value={dmFeatureType}
                  onChange={(event) =>
                    setDmFeatureType(event.target.value as MapFeatureType)
                  }
                >
                  {MAP_FEATURE_TYPE_OPTIONS.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <Stack direction="row" sx={{ gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Min zoom"
                    value={dmMinZoom}
                    onChange={(event) => setDmMinZoom(event.target.value)}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Max zoom"
                    value={dmMaxZoom}
                    onChange={(event) => setDmMaxZoom(event.target.value)}
                  />
                </Stack>
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
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!draftContentfulFieldsText}
                    onClick={copyDraftContentfulFields}
                  >
                    Copy Contentful
                  </Button>
                </Stack>
                <Divider />
                <Typography variant="body2">
                  Points: {dmPoints.length}
                </Typography>
                <Typography variant="body2">Geometry JSON</Typography>
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
                <Typography variant="body2">Contentful fields</Typography>
                <Box
                  component="pre"
                  sx={{
                    fontSize: 12,
                    margin: 0,
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {draftContentfulFieldsText ||
                    "Add geometry to generate Contentful fields."}
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
