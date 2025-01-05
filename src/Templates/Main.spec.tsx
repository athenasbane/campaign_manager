import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Main from "../Templates/Main";

describe("Template - Main", () => {
  it("should match snapshot", () => {
    const { container } = render(
      <Main
        NavbarProps={{ onMenuButtonClick: jest.fn() }}
        DrawProps={{
          open: false,
          closeModal: jest.fn(),
          openSingleModal: jest.fn(),
        }}
      >
        <div>Test</div>
      </Main>,
      { wrapper: BrowserRouter }
    );

    expect(container).toMatchSnapshot();
  });
});
