import Welcome from "../Welcome";
import { renderWithProviders } from "../../../utils/test-utils";
import { PAGE_RESPONSE } from "../__mocks__/api_responses/page_response";
import { MemoryRouter } from "react-router-dom";
import { useGetFrontPageQuery } from "../../../Store/slices/backend";

jest.mock("../../../Store/slices/backend", () => {
  const originalModule = jest.requireActual("../../../Store/slices/backend");
  return { ...originalModule, useGetFrontPageQuery: jest.fn() };
});

describe("Page - Welcome", () => {
  it("should render the header", () => {
    (useGetFrontPageQuery as jest.Mock).mockImplementation(() => ({
      data: PAGE_RESPONSE,
    }));
    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );

    expect(getByText("Next Session")).toBeInTheDocument();
  });
});
