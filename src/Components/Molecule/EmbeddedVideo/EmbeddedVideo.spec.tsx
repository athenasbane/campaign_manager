import { render } from "@testing-library/react";
import EmbeddedVideo from "./EmbeddedVideo";

describe("Molecule - EmbeddedVideo", () => {
  it("renders iframe with youtube url", () => {
    const { getByTitle } = render(
      <EmbeddedVideo videoId="123" title="video" />
    );
    const iframe = getByTitle("video") as HTMLIFrameElement;
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/123"
    );
  });

  it("adds autoplay when enabled", () => {
    const { getByTitle } = render(
      <EmbeddedVideo videoId="abc" title="auto" autoPlay />
    );
    const iframe = getByTitle("auto") as HTMLIFrameElement;
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/abc?autoplay=1"
    );
  });
});
