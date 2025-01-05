import { render } from "@testing-library/react";
import DistanceTool from "./DistanceTool";
const args = {
  pinOneActive: true,
  isPinOneVisable: true,
  isPinTwoVisable: true,
  detail: 100,
  handlePinOneActive: () => {},
  unitOfDistance: "km",
};
describe("Molecule - Distance Tool", () => {
  it("should reflect unit of distance", () => {
    const { getByText } = render(<DistanceTool {...args} />);

    expect(getByText(/km/)).toBeInTheDocument();
  });
});
