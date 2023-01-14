import { maps } from "Constants/map";
import { selectMap } from "Store/slices/map";

describe("Store Slice", () => {
  describe("Selectors", () => {
    it("should return the correct map", () => {
      const result = selectMap(maps, "klilcaithness");
      expect(result).toEqual(maps[0]);
    });
  });
});
