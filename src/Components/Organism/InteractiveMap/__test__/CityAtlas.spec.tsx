import { StrictMode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CityAtlas from "../CityAtlas";
import type { InteractiveMapData } from "../../../../Types/Interfaces/interactiveMap.interface";
const mockFocus = jest.fn();
jest.mock("../AtlasCanvas", () => {
  const React = jest.requireActual("react");
  return {
    AtlasCanvas: React.forwardRef(
      (
        props: {
          onZoom: (zoom: number) => void;
          onPoint: (point: [number, number]) => void;
        },
        ref: unknown,
      ) => {
        React.useImperativeHandle(ref, () => ({
          focus: mockFocus,
          zoom: () => props.onZoom(-3),
          overview: () => props.onZoom(-3),
          view: () => "-1,500,500",
        }));
        return (
          <div>
            <button onClick={() => props.onPoint([50, 50])}>Tap canvas</button>
          </div>
        );
      },
    ),
  };
});
const data: InteractiveMapData = {
  mapId: "luxtria",
  imageSrc: "city.png",
  imageWidth: 1000,
  imageHeight: 1000,
  minZoom: -3,
  maxZoom: 2,
  defaultZoom: -2,
  defaultCenter: [500, 500],
  features: [
    {
      key: "market",
      name: "Market Avenue",
      type: "street",
      minZoom: 2,
      geometry: {
        type: "polyline",
        coordinates: [
          [10, 10],
          [20, 20],
        ],
      },
      publicSummary: "# Market Avenue\nA **busy** street.",
      entries: [
        {
          id: "market-lore",
          title: "The market story",
          type: "place",
          private: false,
        },
      ],
    },
  ],
  fogFeatures: [],
};
beforeEach(() => mockFocus.mockClear());
test("finds a detailed street, renders its lore, and keeps its details and lore link while zooming out", () => {
  render(
    <MemoryRouter>
      <CityAtlas data={data} />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "Market" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Market Avenue street" }));
  expect(mockFocus).toHaveBeenCalledWith(data.features[0]);
  expect(
    screen.getByRole("heading", { name: "Market Avenue" }),
  ).toBeInTheDocument();
  expect(screen.getByText("busy").tagName).toBe("STRONG");
  fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
  expect(
    screen.getByRole("heading", { name: "Market Avenue" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "The market story" }),
  ).toHaveAttribute("href", "/world/market-lore");
});
test("mobile sketch can close and reopen its sheet without discarding geometry", async () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  render(
    <MemoryRouter>
      <CityAtlas data={data} />
    </MemoryRouter>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Open map sketch studio" }),
  );
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Test pin" },
  });
  fireEvent.change(screen.getByLabelText("Stable key"), {
    target: { value: "test-pin" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Tap canvas" }));
  fireEvent.click(screen.getByRole("button", { name: "Close places panel" }));
  fireEvent.click(screen.getByRole("button", { name: /Continue sketch/ }));
  const studio = screen.getByRole("complementary", {
    name: "Map sketch studio",
  });
  expect(within(studio).getByText(/1 point · Ready/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Copy draft for Codex" }));
  const draft = JSON.parse(writeText.mock.calls[0][0]);
  expect(draft).toMatchObject({
    title: "Test pin",
    mapFeature: {
      key: "test-pin",
      mapId: "luxtria",
      geometry: { type: "point", coordinates: [50, 50] },
    },
  });
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Draft copied for Codex.",
  );
});
test("shared selected views retain the supplied camera instead of immediately recentering", () => {
  render(
    <MemoryRouter initialEntries={["/world/map?place=market&view=-1,500,500"]}>
      <CityAtlas data={data} />
    </MemoryRouter>,
  );
  expect(mockFocus).not.toHaveBeenCalled();
  expect(
    screen.getByRole("heading", { name: "Market Avenue" }),
  ).toBeInTheDocument();
});

test("expanded map is a labelled dialog and Escape restores page scrolling", () => {
  render(
    <MemoryRouter>
      <CityAtlas data={data} />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Expand map" }));
  expect(
    screen.getByRole("dialog", { name: "Expanded Luxtria map" }),
  ).toHaveAttribute("aria-modal", "true");
  expect(document.body.style.overflow).toBe("hidden");
  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe("");
});

test("selected place focuses after development StrictMode reinitialises the canvas", () => {
  render(
    <StrictMode>
      <MemoryRouter initialEntries={["/world/map?place=market"]}>
        <CityAtlas data={data} />
      </MemoryRouter>
    </StrictMode>,
  );
  expect(mockFocus).toHaveBeenCalledWith(data.features[0]);
  expect(
    screen.getByRole("heading", { name: "Market Avenue" }),
  ).toBeInTheDocument();
});

test("finishing a sketch retains geometry for export and measurement does not overwrite it", async () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  render(
    <MemoryRouter>
      <CityAtlas data={data} />
    </MemoryRouter>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Open map sketch studio" }),
  );
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Retained pin" },
  });
  fireEvent.change(screen.getByLabelText("Stable key"), {
    target: { value: "retained-pin" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Tap canvas" }));
  fireEvent.click(screen.getByRole("button", { name: "Finish sketching" }));
  expect(screen.getByText(/1 point · Ready to copy/)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Copy draft for Codex" }),
  ).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Measure distance" }));
  fireEvent.click(screen.getByRole("button", { name: "Tap canvas" }));
  fireEvent.click(screen.getByRole("button", { name: "Tap canvas" }));
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Open map sketch studio" }),
  );
  expect(screen.getByText(/1 point · Ready to copy/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Copy draft for Codex" }));
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Draft copied for Codex.",
  );
  expect(JSON.parse(writeText.mock.calls[0][0]).mapFeature.geometry).toEqual({
    type: "point",
    coordinates: [50, 50],
  });
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(
    screen.getByRole("button", { name: "Copy draft for Codex" }),
  ).toBeDisabled();
});
