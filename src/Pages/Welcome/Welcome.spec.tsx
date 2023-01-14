import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Welcome from "Pages/Welcome/Welcome";
import { Provider } from "react-redux";
import store from "Store/store";

describe("Page - Welcome", () => {
  it("should match snapshot", () => {
    const { container } = render(
      <Provider store={store}>
        <Welcome />
      </Provider>,
      { wrapper: BrowserRouter }
    );

    expect(container).toMatchSnapshot();
  });
});
