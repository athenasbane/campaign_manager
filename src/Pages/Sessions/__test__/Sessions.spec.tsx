import { MemoryRouter } from "react-router-dom";
import { useGetSessionsDataQuery } from "../../../Store/slices/backend";
import { renderWithProviders } from "../../../utils/test-utils";
import Sessions from "../Sessions";
import { PAGE_RESPONSE } from "../__mocks__/sessions_api_response";

jest.mock("../../../Store/slices/backend", () => {
  const originalModule = jest.requireActual("../../../Store/slices/backend");
  return { ...originalModule, useGetSessionsDataQuery: jest.fn() };
});

describe("Page - Sessions", () => {
  it("should render the header", () => {
    (useGetSessionsDataQuery as jest.Mock).mockImplementation(() => ({
      data: PAGE_RESPONSE,
    }));
    const { getAllByText } = renderWithProviders(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>
    );

    expect(getAllByText("Chapter 3")[0]).toBeInTheDocument();
  });
});
