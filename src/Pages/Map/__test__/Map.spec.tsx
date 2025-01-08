import { MemoryRouter } from "react-router-dom";
import { useGetMapPageQuery } from "../../../Store/slices/backend";
import { renderWithProviders } from "../../../utils/test-utils";
import Map from "../Map";
import { PAGE_RESPONSE } from "../__mocks__/page_response";

jest.mock("../../../Store/slices/backend", () => {
  const originalModule = jest.requireActual("../../../Store/slices/backend");
  return { ...originalModule, useGetMapPageQuery: jest.fn() };
});

describe("Page - Map", () => {
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
});
