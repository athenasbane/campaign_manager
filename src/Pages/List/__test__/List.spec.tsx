import { MemoryRouter } from "react-router-dom";
import { useGetListPageQuery } from "../../../Store/slices/backend";
import { renderWithProviders } from "../../../utils/test-utils";
import List from "../List";
import { PAGE_RESPONSE } from "../__mocks__/list_page_response";

jest.mock("../../../Store/slices/backend", () => {
  const originalModule = jest.requireActual("../../../Store/slices/backend");
  return { ...originalModule, useGetListPageQuery: jest.fn() };
});

describe("Page - List", () => {
  it("should render the header", () => {
    (useGetListPageQuery as jest.Mock).mockImplementation(() => ({
      data: PAGE_RESPONSE,
    }));
    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <List />
      </MemoryRouter>
    );

    expect(getByText("Lore")).toBeInTheDocument();
  });
});
