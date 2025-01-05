import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import Navbar from "../../../Components/Molecule/Navbar/Navbar";
import { Provider } from "react-redux";
import store from "../../../Store/store";

describe("Molecule - Navbar", () => {
  let onMenuButtonClickStub: jest.Mock;
  beforeEach(() => {
    onMenuButtonClickStub = jest.fn();
  });

  it("should call stub when menu button clicked", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Navbar onMenuButtonClick={onMenuButtonClickStub} />
        </MemoryRouter>
      </Provider>
    );

    userEvent.click(screen.queryByTestId("menu__button") as HTMLElement);

    expect(onMenuButtonClickStub).toHaveBeenCalled();
  });
});
