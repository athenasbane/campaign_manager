import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Map from "Pages/Map/Map";
import { Provider } from "react-redux";
import store from "Store/store";

describe("Page - Map", () => {
  it("should match snapshot", () => {
    const { container } = render(
      <Provider store={store}>
        <Map />
      </Provider>,
      { wrapper: BrowserRouter }
    );

    expect(container).toMatchSnapshot();
  });
});
