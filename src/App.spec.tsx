import { render } from "@testing-library/react";
import App from "./App";
import { Provider } from "react-redux";
import store from "./Store/store";
import { BrowserRouter } from "react-router-dom";

it("should render the title", () => {
  const { getByText } = render(
    <Provider store={store}>
      <App />
    </Provider>,
    { wrapper: BrowserRouter }
  );
  expect(getByText("Teratin")).toBeInTheDocument();
});
