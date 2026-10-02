import { render, screen, fireEvent } from "@testing-library/react";
import Missions from "./Missions";
import { useGetMissionsPageQuery } from "../../Store/slices/backend";

jest.mock("../../Store/slices/backend", () => ({
  useGetMissionsPageQuery: jest.fn(),
}));
jest.mock("../../Components/Molecule/MissionDetails/MissionDetails", () => ({
  __esModule: true,
  default: ({ missionName }: { missionName: string }) => (
    <div data-testid="mission-details">{missionName}</div>
  ),
}));

test("archived missions remain visible and selectable with an active mission open initially", () => {
  (useGetMissionsPageQuery as jest.Mock).mockReturnValue({
    data: {
      title: "Campaign missions",
      missionsCollection: {
        items: [
          {
            sys: { id: "done" },
            complete: true,
            missionName: "Completed journey",
          },
          {
            sys: { id: "active" },
            complete: false,
            missionName: "Find the gate",
          },
        ],
      },
    },
    isLoading: false,
  });
  render(<Missions />);
  expect(screen.getByTestId("mission-details")).toHaveTextContent(
    "Find the gate",
  );
  fireEvent.click(screen.getByRole("button", { name: "Completed journey" }));
  expect(screen.getByTestId("mission-details")).toHaveTextContent(
    "Completed journey",
  );
  expect(
    screen.getByRole("button", { name: "Completed journey" }),
  ).toHaveAttribute("aria-current", "true");
});
