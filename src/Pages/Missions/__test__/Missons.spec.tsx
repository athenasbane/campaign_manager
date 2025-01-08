import { MemoryRouter } from "react-router-dom";
import { useGetMissionsPageQuery } from "../../../Store/slices/backend";
import { renderWithProviders } from "../../../utils/test-utils";
import Missions from "../Missions";
import { PAGE_RESPONSE } from "../__mocks__/page_response";

jest.mock("../../../Store/slices/backend", () => {
  const originalModule = jest.requireActual("../../../Store/slices/backend");
  return { ...originalModule, useGetMissionsPageQuery: jest.fn() };
});

describe("Page - Missions", () => {
  it("should render the header", () => {
    (useGetMissionsPageQuery as jest.Mock).mockImplementation(() => ({
      data: PAGE_RESPONSE,
    }));
    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <Missions />
      </MemoryRouter>
    );

    expect(getByText("Missions")).toBeInTheDocument();
  });
});
