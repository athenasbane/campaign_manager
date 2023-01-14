import { render, screen } from "@testing-library/react";
import Link, { ILinkProps } from "Components/Atom/Link/Link";
import { BrowserRouter } from "react-router-dom";

const genericProps: ILinkProps = {
  typographyVariant: "h1",
  route: "/test/route",
  linkDisplayLabel: "Testable Link Text",
};

describe("Atom - Link", () => {
  describe("generic prop usage", () => {
    it("should display the correct text", () => {
      render(<Link {...genericProps} />, {
        wrapper: BrowserRouter,
      });
      expect(screen.getByText(/Testable Link Text/i)).toBeInTheDocument();
    });
  });
  describe("Snapshot - Test", () => {
    it("should match snapshot", () => {
      const { container } = render(<Link {...genericProps} />, {
        wrapper: BrowserRouter,
      });
      expect(container).toMatchSnapshot();
    });
  });
});
