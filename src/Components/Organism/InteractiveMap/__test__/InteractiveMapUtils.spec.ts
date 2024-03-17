import { distanceCalc } from "../InteractiveMapUtils";

describe("InteractiveMapUtils", () => {
  it("should return the correct distance", () => {
    const distance = distanceCalc(1, 1, 1, 2, 10, 10);

    expect(distance).toBe(0.1);
  });
});
