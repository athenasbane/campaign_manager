import { MemoryRouter } from "react-router-dom";
import { useGetMapPageQuery } from "../../../Store/slices/backend";
import { useGetPlayerProfileQuery } from "../../../Store/slices/playerApi";
import { renderWithProviders } from "../../../utils/test-utils";
import Map from "../Map";
import { PAGE_RESPONSE } from "../__mocks__/map_api_response";

const mockInteractiveMap = jest.fn((_: unknown) => (
  <div data-testid="interactive-map" />
));

jest.mock("../../../Store/slices/backend", () => {
  const originalModule = jest.requireActual("../../../Store/slices/backend");
  return { ...originalModule, useGetMapPageQuery: jest.fn() };
});

jest.mock("../../../Store/slices/playerApi", () => {
  const originalModule = jest.requireActual("../../../Store/slices/playerApi");
  return { ...originalModule, useGetPlayerProfileQuery: jest.fn() };
});

jest.mock(
  "../../../Components/Organism/InteractiveMap/InteractiveMap",
  () => (props: unknown) => mockInteractiveMap(props)
);

describe("Page - Map", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInteractiveMap.mockImplementation((_: unknown) => (
      <div data-testid="interactive-map" />
    ));
    (useGetPlayerProfileQuery as jest.Mock).mockImplementation(() => ({}));
  });

  it("should render the header", () => {
    (useGetMapPageQuery as jest.Mock).mockImplementation(() => ({
      data: PAGE_RESPONSE,
    }));
    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <Map />
      </MemoryRouter>
    );

    expect(getByText("Full Map")).toBeInTheDocument();
  });

  it("passes logged-in player visibility to the interactive map", () => {
    (useGetMapPageQuery as jest.Mock).mockImplementation(() => ({
      data: {
        ...PAGE_RESPONSE,
        featureCollection: {
          items: [
            {
              key: "hidden-vault",
              name: "Hidden Vault",
              type: "landmark",
              geometry: {
                type: "point",
                coordinates: [100, 100],
              },
              visibilityKey: "vault-known",
            },
          ],
        },
      },
    }));
    (useGetPlayerProfileQuery as jest.Mock).mockImplementation(() => ({
      data: {
        knownMapFeatureKeys: ["vault-known"],
        revealedMapAreaKeys: [],
      },
    }));

    renderWithProviders(
      <MemoryRouter>
        <Map />
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            token: "token",
            playerName: "Fane",
          },
        },
      }
    );

    expect(mockInteractiveMap).toHaveBeenCalledWith(
      expect.objectContaining({
        mapData: expect.objectContaining({
          features: [
            expect.objectContaining({
              key: "hidden-vault",
            }),
          ],
        }),
      })
    );
  });
});
