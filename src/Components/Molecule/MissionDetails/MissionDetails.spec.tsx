import { fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../utils/test-utils";
import MissionDetails from "./MissionDetails";
import { useNavigate } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

describe("Molecule - MissionDetails", () => {
  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    mockNavigate.mockClear();
  });

  it("dispatches mission and navigates on map click", () => {
    const missionLocation = {
      name: "loc",
      xCoordinate: 1,
      yCoordinate: 2,
      imageWidth: 3,
      imageHeight: 4,
      mapReference: { sys: { id: "map-id" } },
    };

    const { store, getByText } = renderWithProviders(
      <MissionDetails
        missionName="mission"
        location="here"
        setter="npc"
        reward="gold"
        description="desc"
        missionLocation={missionLocation}
      />
    );

    fireEvent.click(getByText("Map"));

    const state = store.getState();
    expect(state.activeMission.mission).toEqual({
      missionName: "mission",
      location: "here",
      setter: "npc",
      reward: "gold",
      description: "desc",
      missionLocation,
    });
    expect(mockNavigate).toHaveBeenCalledWith("/map/" + missionLocation.mapReference.sys.id);
  });

  it("does not render map button without mission location", () => {
    const { queryByText } = renderWithProviders(
      <MissionDetails
        missionName="mission"
        location="here"
        setter="npc"
        reward="gold"
        description="desc"
      />
    );
    expect(queryByText("Map")).toBeNull();
  });
});
