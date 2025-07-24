import { render } from "@testing-library/react";
import Line from "./Line";

describe("Molecule - Line", () => {
  it("renders line element with coordinates", () => {
    const { container } = render(
      <Line x1={0} y1={1} x2={2} y2={3} divHeight={10} divWidth={20} />
    );
    const line = container.querySelector("line");
    expect(line).toHaveAttribute("x1", "0");
    expect(line).toHaveAttribute("y1", "1");
    expect(line).toHaveAttribute("x2", "2");
    expect(line).toHaveAttribute("y2", "3");
  });
});
