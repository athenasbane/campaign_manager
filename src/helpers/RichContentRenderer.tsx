import {
  documentToReactComponents,
  Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";

import Typography from "@mui/material/Typography";

function renderOptions(links: any): Options {
  // create an asset map
  const assetMap = new Map();
  // loop through the assets and add them to the map
  for (const asset of links.assets.block) {
    assetMap.set(asset.sys.id, asset);
  }

  // create an entry map
  const entryMap = new Map();
  // loop through the block linked entries and add them to the map
  for (const entry of links.entries.block) {
    entryMap.set(entry.sys.id, entry);
  }

  // loop through the inline linked entries and add them to the map
  for (const entry of links.entries.inline) {
    entryMap.set(entry.sys.id, entry);
  }

  return {
    preserveWhitespace: true,
    renderMark: {
      [MARKS.BOLD]: (text) => <b>{text}</b>,
      [MARKS.ITALIC]: (text) => <i>{text}</i>,
    },
    renderNode: {
      [BLOCKS.EMBEDDED_ENTRY]: (node, children) => {
        // find the entry in the entryMap by ID
        const entry = entryMap.get(node.data.target.sys.id);

        // render the entries as needed by looking at the __typename
        // referenced in the GraphQL query
        if (entry.__typename === "CodeBlock") {
          return (
            <pre>
              <code>{entry.code}</code>
            </pre>
          );
        }

        if (entry.__typename === "VideoEmbed") {
          return (
            <iframe
              src={entry.embedUrl}
              height="100%"
              width="100%"
              title={entry.title}
              allowFullScreen={true}
            />
          );
        }
      },
      [BLOCKS.EMBEDDED_ASSET]: (node: any, next: any) => {
        // find the asset in the assetMap by ID
        const asset = assetMap.get(node.data.target.sys.id);

        // render the asset accordingly
        return (
          <img
            src={asset.url}
            alt={asset.description}
            style={{ maxWidth: "100%" }}
          />
        );
      },
      [BLOCKS.HEADING_1]: (node: any, children: any) => {
        return (
          <Typography variant="h1" align="center">
            {children}
          </Typography>
        );
      },
      [BLOCKS.HEADING_2]: (node: any, children: any) => {
        return (
          <Typography variant="h2" align="center">
            {children}
          </Typography>
        );
      },
      [BLOCKS.HEADING_3]: (node: any, children: any) => {
        return (
          <Typography variant="h3" align="center">
            {children}
          </Typography>
        );
      },
      [BLOCKS.HEADING_4]: (node: any, children: any) => {
        return <Typography variant="h4">{children}</Typography>;
      },
      [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
        return <Typography>{children}</Typography>;
      },
      [BLOCKS.TABLE]: (node: any, children: any) => {
        return (
          <div style={{ overflow: "scroll", maxWidth: "95vw" }}>
            <table>
              <tbody>{children}</tbody>
            </table>
          </div>
        );
      },
    },
  };
}

export interface IContent {
  content: {
    json: any;
    links: any;
  };
}

export default function RichContentRenderer({ content }: IContent) {
  return (
    <>{documentToReactComponents(content.json, renderOptions(content.links))}</>
  );
}
