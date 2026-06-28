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
        type: "district" as const,
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
});
