import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import List from "../../Pages/List/List";
import { Provider } from "react-redux";
import store from "../../Store/store";

describe("Page - List", () => {
  it("should match snapshot", () => {
    const { container } = render(
      <Provider store={store}>
        <List />
      </Provider>,
      { wrapper: BrowserRouter }
    );

    expect(container).toMatchSnapshot();
  });
});
