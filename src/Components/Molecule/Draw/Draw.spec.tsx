import { render } from "@testing-library/react";
import Draw from "Components/Molecule/Draw/Draw";
import { BrowserRouter } from "react-router-dom";

describe("Molecule - Draw", () => {
  const closeModalStub = jest.fn();
  const openSingleModalStub = jest.fn();
  it("should match snapshot", () => {
    const { container } = render(
      <Draw
        open={true}
        closeModal={closeModalStub}
        openSingleModal={openSingleModalStub}
      />,
      { wrapper: BrowserRouter }
    );

    expect(container).toMatchSnapshot();
  });
});
