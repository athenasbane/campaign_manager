import { render } from "@testing-library/react";
import Draw from "../../../Components/Molecule/Draw/Draw";
import { BrowserRouter } from "react-router-dom";

describe("Molecule - Draw", () => {
  const closeModalStub = jest.fn();
  const openSingleModalStub = jest.fn();

  it("should render the correct number of draw items", () => {
    const { getAllByTestId } = render(
      <Draw
        open={true}
        closeModal={closeModalStub}
        openSingleModal={openSingleModalStub}
      />,
      { wrapper: BrowserRouter }
    );

    expect(getAllByTestId("draw_item").length).toBe(7);
  });
});
