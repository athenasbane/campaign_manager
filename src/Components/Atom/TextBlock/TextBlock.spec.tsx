import { render } from "@testing-library/react";
import TextBlock, {
  ITextBlockProps,
} from "Components/Atom/TextBlock/TextBlock";
import { BrowserRouter } from "react-router-dom";
import { EContentType } from "Types/Enum/content.enum";

const mockProps: ITextBlockProps = {
  contentType: EContentType.TextBlock,
  displayText: "This is a [link](Test){/route/to/test}[/link]",
};

describe("Atom - TextBlock", () => {
  it("should render correctly given the correct props", () => {
    const { container } = render(<TextBlock {...mockProps} />, {
      wrapper: BrowserRouter,
    });

    expect(container).toMatchSnapshot();
  });
});
