import { render } from "@testing-library/react";
import RichContentRenderer from "./RichContentRenderer";

const mockContent = {
  json: {
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "heading-1",
        data: {},
        content: [{ nodeType: "text", value: "Heading", marks: [] }],
      },
      {
        nodeType: "paragraph",
        data: {},
        content: [
          { nodeType: "text", value: "some ", marks: [] },
          { nodeType: "text", value: "italic", marks: [{ type: "italic" }] },
        ],
      },
      {
        nodeType: "embedded-asset-block",
        content: [],
        data: { target: { sys: { id: "asset1" } } },
      },
      {
        nodeType: "embedded-entry-block",
        content: [],
        data: { target: { sys: { id: "code1" } } },
      },
      {
        nodeType: "embedded-entry-block",
        content: [],
        data: { target: { sys: { id: "video1" } } },
      },
    ],
  },
  links: {
    assets: {
      block: [
        {
          sys: { id: "asset1" },
          url: "https://example.com/img.png",
          description: "desc",
        },
      ],
    },
    entries: {
      block: [
        { sys: { id: "code1" }, __typename: "CodeBlock", code: "console.log(1)" },
        {
          sys: { id: "video1" },
          __typename: "VideoEmbed",
          embedUrl: "https://example.com/video",
          title: "vid",
        },
      ],
      inline: [],
    },
  },
};

describe("RichContentRenderer", () => {
  it("renders various rich text nodes", () => {
    const { getByRole, container } = render(
      <RichContentRenderer content={mockContent} />
    );

    expect(getByRole("heading", { level: 1 })).toHaveTextContent("Heading");
    expect(container.querySelector("i")?.textContent).toBe("italic");
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "https://example.com/img.png"
    );
    expect(container.querySelector("pre code")?.textContent).toBe(
      "console.log(1)"
    );
    expect(container.querySelector("iframe")?.getAttribute("src")).toBe(
      "https://example.com/video"
    );
  });
});
