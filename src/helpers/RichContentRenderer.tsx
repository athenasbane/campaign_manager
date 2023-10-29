import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";

import Typography from "@mui/material/Typography";

function renderOptions(links: any) {
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
    renderNode: {
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
      [BLOCKS.HEADING_1]: (node: any) => {
        return (
          <Typography variant="h1" align="center">
            {node.content[0].value}
          </Typography>
        );
      },
      [BLOCKS.HEADING_2]: (node: any) => {
        return (
          <Typography variant="h2" align="center">
            {node.content[0].value}
          </Typography>
        );
      },
      [BLOCKS.HEADING_3]: (node: any) => {
        return (
          <Typography variant="h3" align="center">
            {node.content[0].value}
          </Typography>
        );
      },
      [BLOCKS.HEADING_4]: (node: any) => {
        return <Typography variant="h4">{node.content[0].value}</Typography>;
      },
      [BLOCKS.PARAGRAPH]: (node: any) => {
        return <Typography>{node.content[0].value}</Typography>;
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
