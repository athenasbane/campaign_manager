import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import NotFound from "Pages/NotFound/NotFound";
import { Provider } from "react-redux";
import store from "Store/store";

describe("Page - NotFound", () => {
  it("should match snapshot", () => {
    const { container } = render(
      <Provider store={store}>
        <NotFound />
      </Provider>,
      { wrapper: BrowserRouter }
    );

    expect(container).toMatchSnapshot();
  });
});
