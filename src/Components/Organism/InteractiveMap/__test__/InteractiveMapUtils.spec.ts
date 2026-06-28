import { distanceCalc, mapCoordinateDistanceCalc } from "../InteractiveMapUtils";

describe("InteractiveMapUtils", () => {
  it("should return the correct distance", () => {
    const distance = distanceCalc(1, 1, 1, 2, 10, 10);

    expect(distance).toBe(0.1);
  });

  it("calculates distance from map coordinates", () => {
    const distance = mapCoordinateDistanceCalc(
      [100, 100],
      [100, 200],
      1000,
      1000
    );

    expect(distance).toBe(0.1);
  });
});
