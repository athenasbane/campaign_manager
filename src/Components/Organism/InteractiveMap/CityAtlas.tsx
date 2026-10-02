import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Markdown from "react-markdown";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import StraightenIcon from "@mui/icons-material/Straighten";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import type {
  InteractiveMapData,
  MapFeature,
  MapFeatureType,
} from "../../../Types/Interfaces/interactiveMap.interface";
import { AtlasCanvas, type AtlasController } from "./AtlasCanvas";
import {
  atlasDistance,
  atlasFeatureType,
  findAtlasPlaces,
  parseAtlasView,
} from "./atlasUtils";
import {
  buildDraftGeometry,
  parseOptionalNumber,
  type DmGeometryMode,
} from "./mapLayers";

const categories: { type: MapFeatureType; label: string }[] = [
  { type: "landmark", label: "Landmarks" },
  { type: "gate", label: "Gates" },
  { type: "district", label: "Districts" },
  { type: "street", label: "Streets" },
  { type: "route", label: "Routes" },
];
const allLayers = categories.map((item) => item.type);
function featureDescription(feature: MapFeature) {
  const text = feature.revealedSummary || feature.publicSummary || "";
  const lines = text.trim().split("\n");
  if (
    lines[0]
      .replace(/^#+\s*/, "")
      .trim()
      .toLowerCase() === feature.name.trim().toLowerCase()
  )
    lines.shift();
  return lines.join("\n").trim();
}

export default function CityAtlas({ data }: { data: InteractiveMapData }) {
  const [params, setParams] = useSearchParams();
  const selectedKey = params.get("place") || "";
  const selected = data.features.find((feature) => feature.key === selectedKey);
  const controller = useRef<AtlasController>(null);
  const root = useRef<HTMLDivElement>(null);
  const focusedKey = useRef<string | null>(null);
  const focusedController = useRef<AtlasController | null>(null);
  const sharedView = Boolean(parseAtlasView(params.get("view"), data));
  const searchInput = useRef<HTMLInputElement>(null);
  const [panel, setPanel] = useState<"places" | "details" | "studio" | null>(
    selectedKey
      ? "details"
      : params.get("dmTools") === "true"
        ? "studio"
        : null,
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [layers, setLayers] = useState<MapFeatureType[]>(allLayers);
  const [labels, setLabels] = useState(true);
  const [layerMenu, setLayerMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(data.defaultZoom);
  const [mode, setMode] = useState<"explore" | "measure" | "draw">(
    params.get("dmTools") === "true" ? "draw" : "explore",
  );
  const [geometryMode, setGeometryMode] = useState<DmGeometryMode>("point");
  const [sketchPoints, setSketchPoints] = useState<[number, number][]>([]);
  const [measurementPoints, setMeasurementPoints] = useState<
    [number, number][]
  >([]);
  const points = mode === "measure" ? measurementPoints : sketchPoints;
  const setPoints = mode === "measure" ? setMeasurementPoints : setSketchPoints;
  const [redo, setRedo] = useState<[number, number][]>([]);
  const [featureKey, setFeatureKey] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [featureType, setFeatureType] = useState<MapFeatureType>("landmark");
  const [minZoom, setMinZoom] = useState("");
  const [maxZoom, setMaxZoom] = useState("");
  const [status, setStatus] = useState("");
  const results = useMemo(
    () => findAtlasPlaces(data.features, query, category),
    [data.features, query, category],
  );
  const distance = atlasDistance(points, data);
  const geometry = buildDraftGeometry(geometryMode, sketchPoints);
  const lower = parseOptionalNumber(minZoom);
  const upper = parseOptionalNumber(maxZoom);
  const validZoom =
    (minZoom === "" ||
      (lower != null && lower >= data.minZoom && lower <= data.maxZoom)) &&
    (maxZoom === "" ||
      (upper != null && upper >= data.minZoom && upper <= data.maxZoom)) &&
    (lower == null || upper == null || lower <= upper);
  const exportedGeometry = geometry
    ? {
        ...geometry,
        ...(lower != null ? { minZoom: lower } : {}),
        ...(upper != null ? { maxZoom: upper } : {}),
      }
    : null;

  useEffect(() => {
    if (
      selectedKey === focusedKey.current &&
      focusedController.current === controller.current
    )
      return;
    if (selected && !sharedView) controller.current?.focus(selected);
    focusedKey.current = selectedKey;
    focusedController.current = controller.current;
  }, [selected, selectedKey, params, sharedView]);
  useEffect(() => {
    if (panel === "places") searchInput.current?.focus();
  }, [panel]);
  useEffect(() => {
    if (!expanded) return;
    const priorFocus = document.activeElement as HTMLElement | null;
    const prior = document.body.style.overflow;
    root.current
      ?.querySelector<HTMLButtonElement>(
        'button[aria-label="Exit expanded map"]',
      )
      ?.focus();
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
      if (event.key === "Tab") {
        const elements = Array.from(
          root.current?.querySelectorAll<HTMLElement>(
            "a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),summary",
          ) || [],
        ).filter((element) => element.getClientRects().length > 0);
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = prior;
      window.removeEventListener("keydown", escape);
      priorFocus?.focus();
    };
  }, [expanded]);
  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(""), 5000);
    return () => window.clearTimeout(timer);
  }, [status]);
  const pick = useCallback(
    (feature: MapFeature) => {
      const next = new URLSearchParams(params);
      next.set("place", feature.key);
      next.delete("view");
      controller.current?.focus(feature);
      setParams(next);
      setPanel("details");
      setMode("explore");
      setLayerMenu(false);
    },
    [params, setParams],
  );
  const addPoint = useCallback(
    (point: [number, number]) => {
      if (mode !== "measure") setRedo([]);
      setPoints((previous) =>
        mode === "measure" ||
        geometryMode === "polyline" ||
        geometryMode === "polygon"
          ? [...previous, point]
          : geometryMode === "point"
            ? [point]
            : [...previous.slice(-1), point].slice(0, 2),
      );
    },
    [geometryMode, mode, setPoints],
  );
  function explore() {
    setMode("explore");
  }
  function selectMode(value: "measure" | "draw") {
    setMode(value);
    if (value === "measure") setMeasurementPoints([]);
    setLayerMenu(false);
    if (value === "draw") setPanel("studio");
    else setPanel(null);
  }
  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(message);
    } catch {
      setStatus("Copy is unavailable in this browser.");
    }
  }
  function closeDetails() {
    const next = new URLSearchParams(params);
    next.delete("place");
    setParams(next);
    setPanel("places");
  }
  function showOverview() {
    controller.current?.overview();
    explore();
  }
  const studio = (
    <div className="atlas-studio">
      <span className="eyebrow">Local sketch</span>
      <h2>Shape the city.</h2>
      <p>
        Draw on the map, then copy the draft to Codex. Local sketches aren’t
        saved to the campaign. Copy your draft before leaving.
      </p>
      <div className="atlas-sketch-modes" aria-label="Sketch geometry">
        {(["point", "polygon", "polyline", "rectangle"] as const).map(
          (value) => (
            <button
              type="button"
              key={value}
              aria-pressed={geometryMode === value}
              onClick={() => {
                setGeometryMode(value);
                setPoints([]);
                setRedo([]);
                setMode("draw");
              }}
            >
              {
                {
                  point: "Pin",
                  polygon: "Area",
                  polyline: "Line",
                  rectangle: "Box",
                }[value]
              }
            </button>
          ),
        )}
      </div>
      <label>
        Name
        <input
          value={featureName}
          onChange={(event) => setFeatureName(event.target.value)}
          maxLength={150}
        />
      </label>
      <label>
        Stable key
        <input
          value={featureKey}
          onChange={(event) => setFeatureKey(event.target.value)}
          pattern="[a-zA-Z0-9_-]+"
          maxLength={100}
          placeholder="e.g. market-square"
        />
      </label>
      <label>
        Feature type
        <select
          value={featureType}
          onChange={(event) =>
            setFeatureType(event.target.value as MapFeatureType)
          }
        >
          {categories.map((item) => (
            <option value={item.type} key={item.type}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <div className="atlas-sketch-actions">
        <button
          type="button"
          disabled={!points.length}
          onClick={() => {
            setRedo((previous) => [...previous, points[points.length - 1]]);
            setPoints((previous) => previous.slice(0, -1));
          }}
        >
          <UndoIcon />
          Undo
        </button>
        <button
          type="button"
          disabled={!redo.length}
          onClick={() => {
            setPoints((previous) => [...previous, redo[redo.length - 1]]);
            setRedo((previous) => previous.slice(0, -1));
          }}
        >
          <RedoIcon />
          Redo
        </button>
        <button
          type="button"
          disabled={!points.length}
          onClick={() => {
            setPoints([]);
            setRedo([]);
          }}
        >
          Clear
        </button>
      </div>
      <p className="atlas-sketch-count">
        {points.length} {points.length === 1 ? "point" : "points"} ·{" "}
        {geometry ? "Ready to copy" : "Add points to complete this shape"}
      </p>
      <button
        className="button primary"
        type="button"
        disabled={
          !geometry ||
          !/^[a-zA-Z0-9_-]{1,100}$/.test(featureKey) ||
          !featureName.trim() ||
          !validZoom
        }
        onClick={() =>
          void copy(
            JSON.stringify(
              {
                title: featureName.trim(),
                mapFeature: {
                  mapId: data.mapId || "luxtria",
                  key: featureKey,
                  type: featureType,
                  geometry,
                  ...(lower != null ? { minZoom: lower } : {}),
                  ...(upper != null ? { maxZoom: upper } : {}),
                },
              },
              null,
              2,
            ),
            "Draft copied for Codex.",
          )
        }
      >
        Copy draft for Codex
      </button>
      <details className="atlas-export">
        <summary>Zoom limits &amp; exports</summary>
        <label>
          Minimum zoom (optional)
          <input
            type="number"
            min={data.minZoom}
            max={data.maxZoom}
            value={minZoom}
            onChange={(event) => setMinZoom(event.target.value)}
          />
        </label>
        <label>
          Maximum zoom (optional)
          <input
            type="number"
            min={data.minZoom}
            max={data.maxZoom}
            value={maxZoom}
            onChange={(event) => setMaxZoom(event.target.value)}
          />
        </label>
        {!validZoom && (
          <p role="alert">
            Use zoom levels within the map range, with minimum at or below
            maximum.
          </p>
        )}
        <pre>
          {geometry
            ? JSON.stringify(exportedGeometry, null, 2)
            : "Your geometry will appear here."}
        </pre>
        <button
          type="button"
          disabled={!geometry || !validZoom}
          onClick={() =>
            void copy(
              JSON.stringify(exportedGeometry, null, 2),
              "Geometry copied.",
            )
          }
        >
          Copy JSON
        </button>
        <button
          type="button"
          disabled={!geometry || !validZoom}
          onClick={() =>
            void copy(
              JSON.stringify(
                {
                  key: { "en-US": featureKey },
                  name: { "en-US": featureName },
                  type: { "en-US": [featureType] },
                  geometry: { "en-US": exportedGeometry },
                },
                null,
                2,
              ),
              "Contentful fields copied.",
            )
          }
        >
          Copy Contentful fields
        </button>
      </details>
      <button
        className="text-link"
        type="button"
        onClick={() => {
          explore();
          setPanel("places");
        }}
      >
        Back to exploring
      </button>
    </div>
  );
  return (
    <div
      ref={root}
      role={expanded ? "dialog" : undefined}
      aria-modal={expanded ? true : undefined}
      aria-label={expanded ? "Expanded Luxtria map" : undefined}
      className={`city-atlas ${expanded ? "expanded" : ""}`}
    >
      <header className="atlas-heading">
        <div>
          <Link to="/world" className="text-link">
            <ArrowBackIcon fontSize="inherit" />
            World library
          </Link>
          <h1>
            Luxtria<span>City atlas</span>
          </h1>
        </div>
        <div className="atlas-heading-actions">
          <span>{data.features.length} known places</span>
          <button
            type="button"
            className="icon-button"
            aria-label="Share this map view"
            onClick={() => {
              const link = new URL(window.location.href);
              link.searchParams.delete("dmTools");
              if (selected) link.searchParams.set("place", selected.key);
              link.searchParams.set("view", controller.current?.view() || "");
              void copy(
                link.toString(),
                "Map link copied. Each player will see their own permitted places.",
              );
            }}
          >
            <ShareOutlinedIcon />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={expanded ? "Exit expanded map" : "Expand map"}
            aria-pressed={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
          </button>
        </div>
      </header>
      <div className="atlas-stage">
        <AtlasCanvas
          ref={controller}
          data={data}
          selected={selected}
          layers={layers}
          labels={labels}
          mode={mode}
          geometryMode={geometryMode}
          points={points}
          initialView={params.get("view")}
          onSelect={pick}
          onPoint={addPoint}
          onZoom={setZoom}
        />
        <aside
          className={`atlas-panel ${panel ? "sheet-open" : ""}`}
          aria-label={
            panel === "studio"
              ? "Map sketch studio"
              : selected && panel !== "places"
                ? "Selected place"
                : "Known places"
          }
        >
          <div className="atlas-panel-controls">
            <span className="eyebrow">
              {panel === "studio"
                ? "Map studio"
                : selected && panel !== "places"
                  ? "In the city"
                  : "Explore Luxtria"}
            </span>
            <button
              className="icon-button atlas-sheet-close"
              aria-label="Close places panel"
              type="button"
              onClick={() => {
                setPanel(null);
              }}
            >
              <CloseIcon />
            </button>
          </div>
          {panel === "studio" ? (
            studio
          ) : selected && panel !== "places" ? (
            <div className="atlas-place-details">
              <button
                className="text-link"
                type="button"
                onClick={closeDetails}
              >
                <ArrowBackIcon fontSize="small" />
                All known places
              </button>
              <div className="atlas-place-type">
                <span>{atlasFeatureType(selected)}</span>
                {selected.private && (
                  <span>
                    <LockOutlinedIcon fontSize="inherit" />
                    Your knowledge
                  </span>
                )}
              </div>
              <h2>{selected.name}</h2>
              <div className="atlas-place-prose">
                <Markdown components={{ img: () => null }}>
                  {featureDescription(selected) ||
                    "No description has been shared for this place yet."}
                </Markdown>
              </div>
              {Boolean(selected.entries?.length) && (
                <section className="atlas-place-links">
                  <span className="eyebrow">Follow the story</span>
                  {selected.entries?.map((entry) => (
                    <Link key={entry.id} to={`/world/${entry.id}`}>
                      <span>
                        {entry.private && (
                          <LockOutlinedIcon fontSize="inherit" />
                        )}
                        {entry.title}
                      </span>
                      <ArrowOutwardIcon fontSize="small" />
                    </Link>
                  ))}
                </section>
              )}
              <button
                className="button secondary"
                type="button"
                onClick={() => controller.current?.focus(selected)}
              >
                <CenterFocusWeakIcon fontSize="small" />
                Center on this place
              </button>
            </div>
          ) : (
            <>
              <div className="atlas-place-search">
                <SearchIcon />
                <input
                  ref={searchInput}
                  type="search"
                  aria-label="Search all known map places"
                  placeholder="Find a place, district, or street…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  maxLength={200}
                />
              </div>
              <div
                className="atlas-place-filters"
                aria-label="Filter map places"
              >
                <button
                  type="button"
                  aria-pressed={category === "all"}
                  onClick={() => setCategory("all")}
                >
                  All places
                </button>
                {categories
                  .filter((item) =>
                    data.features.some(
                      (feature) => atlasFeatureType(feature) === item.type,
                    ),
                  )
                  .map((item) => (
                    <button
                      type="button"
                      key={item.type}
                      aria-pressed={category === item.type}
                      onClick={() => setCategory(item.type)}
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
              <div className="atlas-results-count" aria-live="polite">
                {results.length} {results.length === 1 ? "place" : "places"}
                {query && ` matching “${query}”`}
              </div>
              <div className="atlas-place-list">
                {results.map((feature) => (
                  <button
                    key={feature.key}
                    type="button"
                    aria-pressed={selectedKey === feature.key}
                    onClick={() => pick(feature)}
                  >
                    <span
                      className={`atlas-feature-symbol ${atlasFeatureType(feature)}`}
                      aria-hidden="true"
                    >
                      {atlasFeatureType(feature) === "gate"
                        ? "⌑"
                        : atlasFeatureType(feature) === "district"
                          ? "◈"
                          : atlasFeatureType(feature) === "street" ||
                              atlasFeatureType(feature) === "route"
                            ? "⌁"
                            : "◆"}
                    </span>
                    <span>
                      <strong>{feature.name}</strong>
                      <small>
                        {atlasFeatureType(feature)}
                        {feature.private && " · Your knowledge"}
                      </small>
                    </span>
                    <ArrowOutwardIcon fontSize="small" />
                  </button>
                ))}
                {!results.length && (
                  <p className="atlas-no-results">
                    No known places match. Try another name or category.
                  </p>
                )}
              </div>
              <p className="atlas-search-note">
                All known places are searchable at every zoom.
              </p>
            </>
          )}
        </aside>
        <div className="atlas-map-tools">
          <div className="atlas-zoom-controls">
            <button
              type="button"
              aria-label="Zoom in"
              disabled={zoom >= data.maxZoom}
              onClick={() => controller.current?.zoom(1)}
            >
              <AddIcon />
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              disabled={zoom <= data.minZoom}
              onClick={() => controller.current?.zoom(-1)}
            >
              <RemoveIcon />
            </button>
          </div>
          <button
            type="button"
            aria-label="Show whole city"
            onClick={showOverview}
          >
            <CenterFocusWeakIcon />
          </button>
          <button
            type="button"
            aria-label="Map layers"
            aria-expanded={layerMenu}
            onClick={() => setLayerMenu((value) => !value)}
          >
            <LayersOutlinedIcon />
          </button>
          <button
            type="button"
            aria-label={
              mode === "measure" ? "Stop measuring" : "Measure distance"
            }
            aria-pressed={mode === "measure"}
            onClick={() =>
              mode === "measure" ? explore() : selectMode("measure")
            }
          >
            <StraightenIcon />
          </button>
          <button
            type="button"
            aria-label="Open map sketch studio"
            aria-pressed={panel === "studio"}
            onClick={() =>
              mode === "draw"
                ? setPanel(panel === "studio" ? null : "studio")
                : selectMode("draw")
            }
          >
            <EditOutlinedIcon />
          </button>
        </div>
        {layerMenu && (
          <section className="atlas-layer-menu" aria-label="Visible map layers">
            <div>
              <h2>Map layers</h2>
              <button
                type="button"
                className="icon-button"
                aria-label="Close layers"
                onClick={() => setLayerMenu(false)}
              >
                <CloseIcon />
              </button>
            </div>
            {categories.map((item) => (
              <label key={item.type}>
                <input
                  type="checkbox"
                  checked={layers.includes(item.type)}
                  onChange={() =>
                    setLayers((previous) =>
                      previous.includes(item.type)
                        ? previous.filter((value) => value !== item.type)
                        : [...previous, item.type],
                    )
                  }
                />
                {item.label}
              </label>
            ))}
            <label>
              <input
                type="checkbox"
                checked={labels}
                onChange={() => setLabels((value) => !value)}
              />
              Street and district names
            </label>
            <p>
              Layers change the display. Your character’s access stays the same.
            </p>
          </section>
        )}
        {mode === "draw" && (
          <div className="atlas-draw-hint">
            Tap the map to add {geometryMode === "point" ? "a pin" : "points"}.
            <button
              type="button"
              onClick={() => {
                explore();
                setPanel("studio");
              }}
            >
              Finish sketching
            </button>
          </div>
        )}
        {mode === "measure" && (
          <section
            className="atlas-measure"
            aria-label="Map distance measurement"
          >
            <span className="eyebrow">Measure the map</span>
            <strong>
              {distance == null
                ? "Tap two or more points"
                : `${distance.toFixed(2)} ${data.unitOfDistance}`}
            </strong>
            <p>
              {data.distanceScale
                ? "An estimate using the map’s existing scale. Add points to follow a path."
                : "A real-world scale hasn’t been set for this map."}
            </p>
            <div>
              <button
                type="button"
                disabled={!points.length}
                onClick={() => setPoints((previous) => previous.slice(0, -1))}
              >
                Undo
              </button>
              <button
                type="button"
                disabled={!points.length}
                onClick={() => setPoints([])}
              >
                Clear
              </button>
              <button type="button" onClick={explore}>
                Done
              </button>
            </div>
          </section>
        )}
        <button
          type="button"
          className="atlas-mobile-places"
          aria-expanded={Boolean(panel)}
          onClick={() => {
            if (mode === "draw") setPanel("studio");
            else {
              setPanel(selected ? "details" : "places");
              explore();
            }
          }}
        >
          <PlaceOutlinedIcon />
          <span>
            {mode === "draw"
              ? "Continue sketch"
              : selected && panel !== "places"
                ? selected.name
                : "Explore places"}
            <small>
              {mode === "draw"
                ? `${points.length} points · edit and copy your draft`
                : `${data.features.length} known places · search the city`}
            </small>
          </span>
          <SearchIcon />
        </button>
        <div className="atlas-map-caption">
          <span>Luxtria</span>
          <span>Pan to explore · zoom for detail</span>
        </div>
      </div>
      {status && (
        <div className="atlas-status" role="status">
          {status}
        </div>
      )}
    </div>
  );
}
