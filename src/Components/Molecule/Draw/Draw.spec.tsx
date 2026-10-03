import { fireEvent, render, screen } from "@testing-library/react";
import Draw from "./Draw";
import { MemoryRouter } from "react-router-dom";

function setup() {
  const closeModal = jest.fn();
  render(
    <MemoryRouter initialEntries={["/world"]}>
      <Draw open closeModal={closeModal} openSingleModal={jest.fn()} />
    </MemoryRouter>,
  );
  return closeModal;
}
test("campaign menu shares primary navigation, identifies the current page, and retains archive shortcuts", () => {
  setup();
  expect(
    screen.getByRole("dialog", { name: /Luxtria.*Campaign menu/ }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "World" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(screen.getByRole("link", { name: /City atlas/ })).toHaveAttribute(
    "href",
    "/world/map",
  );
  expect(
    screen.getByRole("link", { name: /Earlier chapters/ }),
  ).toHaveAttribute("href", "/archive");
  fireEvent.click(screen.getByText("Archive shortcuts"));
  expect(screen.getByRole("link", { name: "Missions" })).toHaveAttribute(
    "href",
    "/missions",
  );
  expect(
    screen.getByRole("link", { name: "Earlier character pages" }),
  ).toHaveAttribute("href", "/me");
  expect(screen.queryByText(/Exchange rates/i)).not.toBeInTheDocument();
});
test("keyboard navigation keeps the menu open and selecting a page or the close button dismisses it", () => {
  const closeModal = setup();
  const world = screen.getByRole("link", { name: "World" });
  fireEvent.keyDown(world, { key: "Tab" });
  expect(closeModal).not.toHaveBeenCalled();
  fireEvent.click(world);
  expect(closeModal).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Close campaign menu" }));
  expect(closeModal).toHaveBeenCalledTimes(2);
});
