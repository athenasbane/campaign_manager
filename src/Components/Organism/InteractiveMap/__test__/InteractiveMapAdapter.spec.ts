import { normaliseMapPage } from "../InteractiveMapAdapter";

const mapPage = {
  map: {
    url: "https://example.com/map.png",
    width: 2000,
    height: 1000,
  },
  featureCollection: {
    items: [
      {
        key: "market",
        name: "Market Gate",
        type: "gate" as const,
        geometry: {
          type: "point" as const,
          coordinates: [120, 250] as [number, number],
        },
        publicSummary: "A busy public gate.",
      },
      {
        key: "hidden-vault",
        name: "Hidden Vault",
        type: "landmark" as const,
        geometry: JSON.stringify({
          type: "point",
          coordinates: [500, 500],
        }),
        visibilityKey: "vault-known",
        revealedSummary: "A concealed vault below the old mint.",
      },
      {
        key: "dock-fog",
        name: "Dock Ward",
        type: ["district"] as const,
        geometry: {
          type: "polygon" as const,
          coordinates: [
            [0, 0],
            [200, 0],
            [200, 200],
            [0, 200],
          ] as [number, number][],
        },
        visibilityKey: "dock-revealed",
      },
      {
        key: "copper-lane",
        name: "Copper Lane",
        type: "street" as const,
        geometry: {
          type: "polyline" as const,
          coordinates: [
            [10, 10],
            [80, 10],
          ] as [number, number][],
        },
      },
      {
        key: "watchtower",
        name: "Watchtower",
        type: "landmark" as const,
        minZoom: 1,
        maxZoom: 3,
        geometry: {
          type: "point" as const,
          coordinates: [900, 300] as [number, number],
        },
      },
      {
        key: "hidden-alley",
        name: "Hidden Alley",
        type: "street" as const,
        geometry: JSON.stringify({
          type: "polyline",
          coordinates: [
            [20, 20],
            [90, 20],
          ],
          minZoom: 3,
          maxZoom: 4,
        }),
      },
    ],
  },
};

describe("normaliseMapPage", () => {
  it("keeps public features visible without a player", () => {
    const result = normaliseMapPage(mapPage);

    expect(result.features.map((feature) => feature.key)).toContain("market");
  });

  it("hides player-gated features until they are known", () => {
    const result = normaliseMapPage(mapPage);

    expect(result.features.map((feature) => feature.key)).not.toContain(
      "hidden-vault"
    );
  });

  it("shows known player features", () => {
    const result = normaliseMapPage(mapPage, {
      knownMapFeatureKeys: ["vault-known"],
    });

    expect(result.features.map((feature) => feature.key)).toContain(
      "hidden-vault"
    );
  });

  it("generates fog for unrevealed polygon areas", () => {
    const result = normaliseMapPage(mapPage);

    expect(result.fogFeatures.map((feature) => feature.key)).toContain(
      "dock-fog"
    );
  });

  it("removes fog once an area has been revealed", () => {
    const result = normaliseMapPage(mapPage, {
      revealedMapAreaKeys: ["dock-revealed"],
    });

    expect(result.fogFeatures).toHaveLength(0);
  });

  it("normalises Contentful array feature types", () => {
    const result = normaliseMapPage(mapPage);

    expect(
      result.features.find((feature) => feature.key === "dock-fog")?.type
    ).toBe("district");
  });

  it("adds default zoom visibility for detailed feature types", () => {
    const result = normaliseMapPage(mapPage);

    expect(
      result.features.find((feature) => feature.key === "dock-fog")?.minZoom
    ).toBe(0);
    expect(
      result.features.find((feature) => feature.key === "copper-lane")?.minZoom
    ).toBe(2);
  });

  it("preserves explicit feature zoom visibility", () => {
    const result = normaliseMapPage(mapPage);

    expect(
      result.features.find((feature) => feature.key === "watchtower")?.minZoom
    ).toBe(1);
    expect(
      result.features.find((feature) => feature.key === "watchtower")?.maxZoom
    ).toBe(3);
  });

  it("reads feature zoom visibility from geometry JSON", () => {
    const result = normaliseMapPage(mapPage);

    expect(
      result.features.find((feature) => feature.key === "hidden-alley")?.minZoom
    ).toBe(3);
    expect(
      result.features.find((feature) => feature.key === "hidden-alley")?.maxZoom
    ).toBe(4);
  });
});
