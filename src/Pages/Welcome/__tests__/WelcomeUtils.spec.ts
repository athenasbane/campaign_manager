import { nextSession } from "../WelcomeUtils";

const date = new Date("2025-01-01");
jest.useFakeTimers().setSystemTime(date);

describe("Welcome Utils", () => {
  it("should return the date provided", () => {
    expect(nextSession("2020-01-01")).toBe("Wednesday, 1 January 2020");
  });

  it("should return the next wednesday", () => {
    expect(nextSession()).toBe("Wednesday, 1 January 2025");
  });
});
