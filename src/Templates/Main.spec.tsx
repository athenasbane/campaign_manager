import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Main from "../Templates/Main";
import { Provider } from "react-redux";
import store from "../Store/store";

describe("Template - Main", () => {
  it("should have the element rendered", () => {
    const { getByText } = render(
      <Provider store={store}>
        <Main
          NavbarProps={{ onMenuButtonClick: jest.fn() }}
          DrawProps={{
            open: false,
            closeModal: jest.fn(),
            openSingleModal: jest.fn(),
          }}
        >
          <div>Test</div>
        </Main>
      </Provider>,
      { wrapper: BrowserRouter }
    );

    expect(getByText("Test")).toBeInTheDocument();
  });
});
