import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import NotFound from "../../Pages/NotFound/NotFound";
import { Provider } from "react-redux";
import store from "../../Store/store";

describe("Page - NotFound", () => {
  it("should have correct text", () => {
    const { getByText } = render(
      <Provider store={store}>
        <NotFound />
      </Provider>,
      { wrapper: BrowserRouter }
    );
    expect(getByText("404 Page Not Found")).toBeInTheDocument();
  });
});
