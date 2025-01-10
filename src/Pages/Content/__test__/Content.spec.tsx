import { MemoryRouter } from "react-router-dom";
import { useGetContentPageQuery } from "../../../Store/slices/backend";
import { renderWithProviders } from "../../../utils/test-utils";
import Content from "../Content";
import { PAGE_RESPONSE } from "../__mocks__/content_api_response";

jest.mock("../../../Store/slices/backend", () => {
  const originalModule = jest.requireActual("../../../Store/slices/backend");
  return { ...originalModule, useGetContentPageQuery: jest.fn() };
});

describe("Page - Content", () => {
  it("should render the header", () => {
    (useGetContentPageQuery as jest.Mock).mockImplementation(() => ({
      data: PAGE_RESPONSE,
      isSuccess: true,
    }));
    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <Content />
      </MemoryRouter>
    );

    expect(
      getByText("Cloaks: The Essence of Magical Disciplines")
    ).toBeInTheDocument();
  });
});
