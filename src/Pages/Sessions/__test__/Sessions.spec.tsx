import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "../../../utils/test-utils";
import Sessions from "../Sessions";
import { PAGE_RESPONSE } from "../__mocks__/sessions_api_response";

const mockUseGetSessionsDataQuery = jest.fn();

jest.mock("../../../Store/slices/backend", () => {
  const originalModule = jest.requireActual("../../../Store/slices/backend");
  return {
    __esModule: true,
    ...originalModule,
    useGetSessionsDataQuery: (...args: unknown[]) =>
      mockUseGetSessionsDataQuery(...args),
  };
});

describe("Page - Sessions", () => {
  it("should render the header", () => {
    mockUseGetSessionsDataQuery.mockImplementation(() => ({
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
