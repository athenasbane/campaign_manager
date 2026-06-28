import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "../../utils/test-utils";
import { useGetPlayerProfileQuery } from "../../Store/slices/playerApi";
import Player from "./Player";

jest.mock("../../Store/slices/playerApi", () => {
  const originalModule = jest.requireActual("../../Store/slices/playerApi");
  return { ...originalModule, useGetPlayerProfileQuery: jest.fn() };
});

describe("Page - Player", () => {
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
});
