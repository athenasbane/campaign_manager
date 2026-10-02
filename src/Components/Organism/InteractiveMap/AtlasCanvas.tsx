import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import L from "leaflet";
import type {
  InteractiveMapData,
  MapFeature,
  MapFeatureType,
} from "../../../Types/Interfaces/interactiveMap.interface";
import {
  addFeatureLayer,
  addFogLayer,
  addSelectedFeatureLayer,
  createSimpleImageTileLayer,
  getFeatureBounds,
  isFeatureVisibleAtZoom,
  normaliseMapCoordinate,
  renderDraftGeometry,
  type DmGeometryMode,
} from "./mapLayers";
import { atlasFeatureType, parseAtlasView } from "./atlasUtils";

export interface AtlasController {
  zoom: (direction: 1 | -1) => void;
  overview: () => void;
  focus: (feature: MapFeature) => void;
  view: () => string;
}
interface Props {
  data: InteractiveMapData;
  selected?: MapFeature;
  layers: MapFeatureType[];
  labels: boolean;
  mode: "explore" | "measure" | "draw";
  geometryMode: DmGeometryMode;
  points: [number, number][];
  initialView?: string | null;
  onSelect: (feature: MapFeature) => void;
  onPoint: (point: [number, number]) => void;
  onZoom: (zoom: number) => void;
}
export const AtlasCanvas = forwardRef<AtlasController, Props>(
  function AtlasCanvas(props, ref) {
    const container = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const current = useRef(props);
    const featureGroup = useRef<L.LayerGroup | null>(null);
    const selectedGroup = useRef<L.LayerGroup | null>(null);
    const fogGroup = useRef<L.LayerGroup | null>(null);
    const drawingGroup = useRef<L.LayerGroup | null>(null);
    const { data } = props;
    const bounds = useMemo(
      () => L.latLngBounds([0, 0], [data.imageHeight, data.imageWidth]),
      [data.imageHeight, data.imageWidth],
    );
    useEffect(() => {
      current.current = props;
    });
    useImperativeHandle(
      ref,
      () => ({
        zoom(direction) {
          const map = mapRef.current;
          if (map) {
            if (direction === 1) map.zoomIn();
            else map.zoomOut();
          }
        },
        overview() {
          mapRef.current?.fitBounds(bounds, {
            padding: [20, 20],
            animate: false,
          });
        },
        focus(feature) {
          const map = mapRef.current;
          if (!map) return;
          const canvasRect = container.current?.getBoundingClientRect();
          const sheet =
            container.current?.parentElement?.querySelector<HTMLElement>(
              ".atlas-panel",
            );
          const sheetRect = sheet?.getBoundingClientRect();
          const covered =
            canvasRect &&
            sheetRect &&
            sheetRect.top > canvasRect.top &&
            sheetRect.left < canvasRect.right &&
            sheetRect.right > canvasRect.left
              ? Math.max(0, canvasRect.bottom - sheetRect.top)
              : 0;
          const target = L.latLngBounds(
            getFeatureBounds(feature) as L.LatLngTuple[],
          );
          const min = Math.max(data.minZoom, feature.minZoom ?? data.minZoom);
          const max = Math.min(data.maxZoom, feature.maxZoom ?? data.maxZoom);
          const zoom =
            feature.geometry.type === "point"
              ? Math.max(min, Math.min(max, Math.max(map.getZoom(), 0)))
              : Math.max(
                  min,
                  Math.min(
                    max,
                    map.getBoundsZoom(target, false, L.point(70, 70 + covered)),
                  ),
                );
          map.setView(target.getCenter(), zoom, { animate: false });
          if (covered) map.panBy([0, covered / 2], { animate: false });
        },
        view() {
          const map = mapRef.current;
          const center = map?.getCenter();
          return map && center
            ? `${map.getZoom()},${Math.round(center.lng)},${Math.round(center.lat)}`
            : "";
        },
      }),
      [bounds, data.minZoom, data.maxZoom],
    );

    useEffect(() => {
      if (!container.current) return;
      const map = L.map(container.current, {
        crs: L.CRS.Simple,
        minZoom: data.minZoom,
        maxZoom: data.maxZoom,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        zoomControl: false,
        attributionControl: false,
        maxBounds: bounds.pad(0.15),
        maxBoundsViscosity: 0.8,
      });
      mapRef.current = map;
      const view = parseAtlasView(
        current.current.initialView,
        current.current.data,
      );
      if (view) map.setView([view.y, view.x], view.zoom);
      else map.fitBounds(bounds, { padding: [20, 20] });
      const updateZoom = () => current.current.onZoom(map.getZoom());
      updateZoom();
      map.on("zoomend", updateZoom);
      map.on("click", (event: L.LeafletMouseEvent) => {
        if (current.current.mode !== "explore")
          current.current.onPoint(
            normaliseMapCoordinate(
              [event.latlng.lng, event.latlng.lat],
              current.current.data,
            ),
          );
      });
      let oldWidth = container.current.clientWidth;
      let oldHeight = container.current.clientHeight;
      const resize = new ResizeObserver(() => {
        if (!container.current) return;
        if (
          oldWidth === container.current.clientWidth &&
          oldHeight === container.current.clientHeight
        )
          return;
        const wasOverview =
          Math.abs(map.getZoom() - map.getBoundsZoom(bounds)) < 0.1;
        oldWidth = container.current.clientWidth;
        oldHeight = container.current.clientHeight;
        map.invalidateSize({ pan: false });
        if (wasOverview && !current.current.selected)
          map.fitBounds(bounds, { padding: [20, 20], animate: false });
      });
      resize.observe(container.current);
      return () => {
        resize.disconnect();
        map.remove();
        mapRef.current = null;
      };
    }, [bounds, data.minZoom, data.maxZoom]);

    useEffect(() => {
      const map = mapRef.current;
      const view = parseAtlasView(props.initialView, current.current.data);
      if (map && view)
        map.setView([view.y, view.x], view.zoom, { animate: false });
    }, [
      props.initialView,
      data.minZoom,
      data.maxZoom,
      data.imageWidth,
      data.imageHeight,
    ]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      const layer = data.tileUrlTemplate
        ? createSimpleImageTileLayer(data.tileUrlTemplate, {
            bounds,
            minZoom: data.minZoom,
            maxZoom: data.maxZoom,
            noWrap: true,
          })
        : L.imageOverlay(data.imageSrc, bounds, { pane: "tilePane" });
      layer.addTo(map);
      let fallback: L.ImageOverlay | undefined;
      let loaded = 0;
      let errors = 0;
      if (data.tileUrlTemplate) {
        layer.on("tileload", () => {
          loaded++;
          fallback?.remove();
          fallback = undefined;
        });
        layer.on("tileerror", () => {
          errors++;
        });
        layer.on("load", () => {
          if (!loaded && errors && !fallback && data.imageSrc)
            fallback = L.imageOverlay(data.imageSrc, bounds, {
              pane: "tilePane",
            }).addTo(map);
        });
      }
      return () => {
        layer.remove();
        fallback?.remove();
      };
    }, [
      bounds,
      data.imageSrc,
      data.tileUrlTemplate,
      data.minZoom,
      data.maxZoom,
    ]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      const draw = () => {
        featureGroup.current?.remove();
        fogGroup.current?.remove();
        const group = L.layerGroup().addTo(map);
        const fog = L.layerGroup().addTo(map);
        const state = current.current;
        for (const feature of state.data.features)
          if (
            state.layers.includes(atlasFeatureType(feature)) &&
            isFeatureVisibleAtZoom(feature, map.getZoom())
          ) {
            addFeatureLayer(
              group,
              feature,
              (selected) => {
                if (current.current.mode === "explore")
                  current.current.onSelect(selected);
              },
              { popups: false, labels: state.labels, atlas: true },
            );
          }
        for (const feature of state.data.fogFeatures) addFogLayer(fog, feature);
        featureGroup.current = group;
        fogGroup.current = fog;
      };
      draw();
      map.on("zoomend", draw);
      return () => {
        map.off("zoomend", draw);
        featureGroup.current?.remove();
        fogGroup.current?.remove();
      };
    }, [data.features, data.fogFeatures, props.layers, props.labels]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      selectedGroup.current?.remove();
      const group = L.layerGroup().addTo(map);
      if (props.selected) addSelectedFeatureLayer(group, props.selected, true);
      selectedGroup.current = group;
      return () => {
        group.remove();
      };
    }, [props.selected]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      drawingGroup.current?.remove();
      const group = L.layerGroup().addTo(map);
      if (props.mode !== "explore")
        renderDraftGeometry(
          group,
          props.mode === "measure" ? "polyline" : props.geometryMode,
          props.points,
        );
      if (props.mode === "explore") map.doubleClickZoom.enable();
      else map.doubleClickZoom.disable();
      drawingGroup.current = group;
      return () => {
        group.remove();
      };
    }, [props.mode, props.geometryMode, props.points]);
    return (
      <div
        ref={container}
        className={`atlas-map ${props.mode !== "explore" ? "drawing" : ""}`}
        role="region"
        aria-label="Interactive city map. Use the places list to select a location."
        data-testid="atlas-canvas"
      />
    );
  },
);
