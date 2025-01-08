import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "../../../utils/test-utils";
import History from "../History";

describe("Page - History", () => {
  it("should render the header", () => {
    const { getByText } = renderWithProviders(
      <MemoryRouter>
        <History />
      </MemoryRouter>
    );

    expect(getByText("History")).toBeInTheDocument();
  });
});
