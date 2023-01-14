import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Sessions from "Pages/Sessions/Sessions";
import { Provider } from "react-redux";
import store from "Store/store";

describe("Page - Sessions", () => {
  it("should match snapshot", () => {
    const { container } = render(
      <Provider store={store}>
        <Sessions />
      </Provider>,
      { wrapper: BrowserRouter }
    );

    expect(container).toMatchSnapshot();
  });
});
