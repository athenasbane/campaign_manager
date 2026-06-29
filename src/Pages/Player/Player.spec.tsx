import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "../../utils/test-utils";
import { useGetPlayerProfileQuery } from "../../Store/slices/playerApi";
import { useGetMapPageQuery } from "../../Store/slices/backend";
import { PAGE_RESPONSE } from "../Map/__mocks__/map_api_response";
import Player from "./Player";

const mockInteractiveMap = jest.fn((_: unknown) => (
  <div data-testid="personal-map" />
));

jest.mock("../../Store/slices/playerApi", () => {
  const originalModule = jest.requireActual("../../Store/slices/playerApi");
  return { ...originalModule, useGetPlayerProfileQuery: jest.fn() };
});

jest.mock("../../Store/slices/backend", () => {
  const originalModule = jest.requireActual("../../Store/slices/backend");
  return { ...originalModule, useGetMapPageQuery: jest.fn() };
});

jest.mock(
  "../../Components/Organism/InteractiveMap/InteractiveMap",
  () => (props: unknown) => mockInteractiveMap(props)
);

describe("Page - Player", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInteractiveMap.mockImplementation((_: unknown) => (
      <div data-testid="personal-map" />
    ));
    (useGetMapPageQuery as jest.Mock).mockImplementation(() => ({}));
  });

  it("renders private player sections", () => {
    (useGetPlayerProfileQuery as jest.Mock).mockImplementation(() => ({
      data: {
        displayName: "Laura",
        characterName: "Fane",
        privateSections: [
          {
            title: "Known Secrets",
            body: "The Iron Bank vault contains a hidden ledger.",
          },
        ],
      },
    }));

    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <Player />
      </MemoryRouter>
    );

    expect(getByText("Fane")).toBeInTheDocument();
    expect(getByText("For Laura")).toBeInTheDocument();
    expect(getByText("Known Secrets")).toBeInTheDocument();
    expect(
      getByText("The Iron Bank vault contains a hidden ledger.")
    ).toBeInTheDocument();
  });

  it("renders a personal map when the player has a default map", () => {
    (useGetPlayerProfileQuery as jest.Mock).mockImplementation(() => ({
      data: {
        displayName: "Laura",
        characterName: "Fane",
        defaultMapSlug: "city-map",
        privateSections: [],
        knownMapFeatureKeys: ["market"],
        revealedMapAreaKeys: [],
      },
    }));
    (useGetMapPageQuery as jest.Mock).mockImplementation(() => ({
      data: PAGE_RESPONSE,
    }));

    const { getByText, getByTestId } = renderWithProviders(
      <MemoryRouter>
        <Player />
      </MemoryRouter>
    );

    expect(getByText("Personal Map")).toBeInTheDocument();
    expect(getByTestId("personal-map")).toBeInTheDocument();
    expect(mockInteractiveMap).toHaveBeenCalledWith(
      expect.objectContaining({
        mapData: expect.objectContaining({
          imageSrc: PAGE_RESPONSE.map.url,
        }),
      })
    );
  });
});
