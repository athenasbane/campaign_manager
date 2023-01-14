import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Navbar from "Components/Molecule/Navbar/Navbar";

describe("Molecule - Navbar", () => {
  let onMenuButtonClickStub: jest.Mock;
  beforeEach(() => {
    onMenuButtonClickStub = jest.fn();
  });

  it("should match the snapshot", () => {
    const { container } = render(
      <Navbar onMenuButtonClick={onMenuButtonClickStub} />,
      {
        wrapper: BrowserRouter,
      }
    );

    expect(container).toMatchSnapshot();
  });
  it("should call stub when menu button clicked", async () => {
    render(<Navbar onMenuButtonClick={onMenuButtonClickStub} />, {
      wrapper: BrowserRouter,
    });

    userEvent.click(screen.queryByTestId("menu__button") as HTMLElement);

    expect(onMenuButtonClickStub).toHaveBeenCalled();
  });
});
