import { MemoryRouter } from "react-router-dom";
import { useGetDocumentPageQuery } from "../../../Store/slices/backend";
import { renderWithProviders } from "../../../utils/test-utils";
import Documents from "../Documents";
import { PAGE_RESPONSE } from "../__mocks__/api_response";

jest.mock("../../../Store/slices/backend", () => {
  const originalModule = jest.requireActual("../../../Store/slices/backend");
  return { ...originalModule, useGetDocumentPageQuery: jest.fn() };
});

describe("Page - Documents", () => {
  it("should render the header", () => {
    (useGetDocumentPageQuery as jest.Mock).mockImplementation(() => ({
      data: PAGE_RESPONSE,
      isSuccess: true,
    }));
    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <Documents />
      </MemoryRouter>
    );

    expect(getByText("Better Crafting Document (V1)")).toBeInTheDocument();
  });
});
