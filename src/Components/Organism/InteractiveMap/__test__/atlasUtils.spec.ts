import { atlasDistance, findAtlasPlaces, parseAtlasView } from "../atlasUtils";
import { buildDraftGeometry, isAtlasFeatureVisibleAtZoom } from "../mapLayers";
import type {
  InteractiveMapData,
  MapFeature,
} from "../../../../Types/Interfaces/interactiveMap.interface";
const features: MapFeature[] = [
  {
    key: "street",
    name: "Market Avenue",
    type: "street",
    geometry: {
      type: "polyline",
      coordinates: [
        [0, 0],
        [100, 100],
      ],
    },
    minZoom: 2,
  },
  {
    key: "gate",
    name: "North Gate",
    type: "landmark",
    geometry: { type: "point", coordinates: [50, 50] },
    maxZoom: 0,
  },
];
const data: InteractiveMapData = {
  imageSrc: "map.png",
  imageWidth: 1000,
  imageHeight: 1000,
  minZoom: -3,
  maxZoom: 2,
  defaultZoom: -2,
  defaultCenter: [500, 500],
  features,
  fogFeatures: [],
  distanceScale: 10,
  unitOfDistance: "Miles",
};
test("search includes detailed streets at overview and categorises the existing gate landmarks", () => {
  expect(findAtlasPlaces(features, " MARKET street ")).toEqual([features[0]]);
  expect(findAtlasPlaces(features, "", "gate")).toEqual([features[1]]);
  expect(findAtlasPlaces(features, "unknown")).toEqual([]);
});
test("shared views accept finite coordinates within the artwork and reject malformed or out-of-bounds views", () => {
  expect(parseAtlasView("-1.5,500,500", data)).toEqual({
    zoom: -1.5,
    x: 500,
    y: 500,
  });
  for (const value of [
    "1,0",
    "1,,50",
    "Infinity,50,50",
    "3,50,50",
    "1,-1,50",
    "1,50,1001",
  ])
    expect(parseAtlasView(value, data)).toBeNull();
});
test("measurement follows a multi-point route using the existing map scale", () => {
  expect(
    atlasDistance(
      [
        [0, 0],
        [500, 0],
        [500, 500],
      ],
      data,
    ),
  ).toBe(10);
  expect(atlasDistance([[0, 0]], data)).toBeNull();
  expect(
    atlasDistance(
      [
        [0, 0],
        [500, 500],
      ],
      { ...data, distanceScale: null },
    ),
  ).toBeNull();
});
test("sketch exports only complete shapes and sorts reversed rectangle corners", () => {
  expect(
    buildDraftGeometry("polygon", [
      [1, 1],
      [2, 2],
    ]),
  ).toBeNull();
  expect(buildDraftGeometry("polyline", [[1, 1]])).toBeNull();
  expect(
    buildDraftGeometry("rectangle", [
      [90, 10],
      [10, 80],
    ]),
  ).toEqual({
    type: "rectangle",
    bounds: [
      [10, 10],
      [90, 80],
    ],
  });
  expect(
    buildDraftGeometry("polygon", [
      [1, 1],
      [1, 2],
      [2, 1],
    ])?.type,
  ).toBe("polygon");
});

test("overview markers remain visible throughout fractional zooms until detailed streets take over", () => {
  const landmark = { ...features[1], minZoom: -2, maxZoom: 0 };
  const street = { ...features[0], minZoom: 1, maxZoom: 2 };
  for (const zoom of [0, 0.25, 0.5, 0.75, 0.99]) {
    expect(isAtlasFeatureVisibleAtZoom(landmark, zoom)).toBe(true);
    expect(isAtlasFeatureVisibleAtZoom(street, zoom)).toBe(false);
  }
  expect(isAtlasFeatureVisibleAtZoom(landmark, 1)).toBe(false);
  expect(isAtlasFeatureVisibleAtZoom(street, 1)).toBe(true);
  expect(isAtlasFeatureVisibleAtZoom(landmark, -2.25)).toBe(false);
  for (let zoom = -2; zoom <= 2; zoom += 0.25)
    expect(
      [landmark, street].some((feature) =>
        isAtlasFeatureVisibleAtZoom(feature, zoom),
      ),
    ).toBe(true);
});
test("explicit fractional feature limits remain exact", () => {
  const feature = { ...features[1], minZoom: 0.25, maxZoom: 0.5 };
  expect(isAtlasFeatureVisibleAtZoom(feature, 0)).toBe(false);
  expect(isAtlasFeatureVisibleAtZoom(feature, 0.25)).toBe(true);
  expect(isAtlasFeatureVisibleAtZoom(feature, 0.5)).toBe(true);
  expect(isAtlasFeatureVisibleAtZoom(feature, 0.75)).toBe(false);
});
