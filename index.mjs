const CONTENTFUL_ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || "master";

const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify(body),
});

const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
};

const fetchPlayerContent = async (cognitoSub) => {
  const spaceId = getRequiredEnv("CONTENTFUL_SPACE_ID");
  const accessToken = getRequiredEnv("CONTENTFUL_ACCESS_TOKEN");
  const params = new URLSearchParams({
    content_type: "playerContent",
    "fields.cognitoSub": cognitoSub,
    limit: "1",
    include: "10",
  });

  const response = await fetch(
    `https://cdn.contentful.com/spaces/${spaceId}/environments/${CONTENTFUL_ENVIRONMENT}/entries?${params.toString()}`,
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const body = await response.json();

  if (!response.ok) {
    console.error(JSON.stringify(body));
    throw new Error("Unable to fetch player content");
  }

  const playerEntry = body.items[0];

  if (!playerEntry) {
    return undefined;
  }

  const includedEntries = new Map(
    (body.includes?.Entry || []).map((entry) => [entry.sys.id, entry])
  );
  const includedAssets = new Map(
    (body.includes?.Asset || []).map((asset) => [asset.sys.id, asset])
  );

  return {
    ...playerEntry.fields,
    includedEntries,
    includedAssets,
    resolvedContent:
      playerEntry.fields.content?.sys?.id &&
      includedEntries.get(playerEntry.fields.content.sys.id),
  };
};

const richTextToPlainText = (node) => {
  if (!node) {
    return "";
  }

  if (typeof node.value === "string") {
    return node.value;
  }

  if (Array.isArray(node.content)) {
    const childText = node.content.map(richTextToPlainText).filter(Boolean);

    if (node.nodeType === "document") {
      return childText.join("\n\n");
    }

    if (node.nodeType === "unordered-list" || node.nodeType === "ordered-list") {
      return childText.join("\n");
    }

    if (node.nodeType === "list-item") {
      return `- ${childText.join(" ").trim()}`;
    }

    if (node.nodeType?.startsWith("heading-") || node.nodeType === "paragraph") {
      return childText.join("").trim();
    }

    return childText.join("");
  }

  return "";
};

const normalisePrivateSections = (privateSections) => {
  if (Array.isArray(privateSections)) {
    return privateSections;
  }

  if (privateSections && typeof privateSections === "object") {
    return Object.entries(privateSections).map(([title, body]) => ({
      title,
      body: String(body),
    }));
  }

  return [];
};

const normaliseStringList = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string");
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const buildPrivateSections = (playerContent) => {
  const configuredSections = normalisePrivateSections(
    playerContent.privateSections
  );

  if (configuredSections.length) {
    return configuredSections;
  }

  if (playerContent.resolvedContent) {
    return buildSectionsFromEntry(
      playerContent.resolvedContent,
      playerContent.includedEntries
    );
  }

  return [];
};

const getEntryTitle = (entry) =>
  entry?.fields.name ||
  entry?.fields.pageTitle ||
  entry?.fields.contentName ||
  null;

const getLinkedEntry = (link, includedEntries) =>
  link?.sys?.id ? includedEntries.get(link.sys.id) : undefined;

const getLinkedAsset = (link, includedAssets) =>
  link?.sys?.id ? includedAssets.get(link.sys.id) : undefined;

const getLinkedEntries = (links, includedEntries) =>
  Array.isArray(links)
    ? links
        .map((link) => getLinkedEntry(link, includedEntries))
        .filter(Boolean)
    : [];

const CONTENTFUL_TYPENAME = {
  lorePage: "LorePage",
  listPage: "ListPage",
  mapPage: "MapPage",
};

const getContentType = (entry) => entry?.sys?.contentType?.sys?.id;

const collectAllowedEntryIds = (entry, includedEntries, visited = new Set()) => {
  if (!entry || visited.has(entry.sys.id)) {
    return visited;
  }

  visited.add(entry.sys.id);

  for (const value of Object.values(entry.fields || {})) {
    const links = Array.isArray(value) ? value : [value];

    for (const link of links) {
      if (link?.sys?.linkType !== "Entry") {
        continue;
      }

      collectAllowedEntryIds(getLinkedEntry(link, includedEntries), includedEntries, visited);
    }
  }

  return visited;
};

const collectRichTextTargets = (node, nodeType, ids = new Set()) => {
  if (!node || typeof node !== "object") {
    return ids;
  }

  if (node.nodeType === nodeType && node.data?.target?.sys?.id) {
    ids.add(node.data.target.sys.id);
  }

  if (Array.isArray(node.content)) {
    node.content.forEach((child) => collectRichTextTargets(child, nodeType, ids));
  }

  return ids;
};

const buildRichTextAsset = (asset) => ({
  sys: { id: asset.sys.id },
  title: asset.fields.title,
  description: asset.fields.description,
  url: buildAsset(asset)?.url,
  width: asset.fields.file?.details?.image?.width,
  height: asset.fields.file?.details?.image?.height,
});

const buildRichTextContent = (content, includedAssets) => ({
  json: content,
  links: {
    assets: {
      block: Array.from(
        collectRichTextTargets(content, "embedded-asset-block")
      )
        .map((id) => includedAssets.get(id))
        .filter(Boolean)
        .map(buildRichTextAsset),
    },
    entries: { block: [], inline: [] },
  },
});

const buildContentPage = (entry, includedEntries, includedAssets) => ({
  pageTitle: entry.fields.pageTitle || getEntryTitle(entry) || "",
  pageContentCollection: {
    items: getLinkedEntries(entry.fields.pageContent, includedEntries)
      .filter((contentEntry) => contentEntry.fields.content)
      .map((contentEntry) => ({
        sys: { id: contentEntry.sys.id },
        content: buildRichTextContent(contentEntry.fields.content, includedAssets),
      })),
  },
});

const buildListPage = (entry, includedEntries) => ({
  pageTitle: entry.fields.pageTitle || getEntryTitle(entry) || "",
  linksCollection: {
    items: getLinkedEntries(entry.fields.links, includedEntries)
      .filter((linkedEntry) => CONTENTFUL_TYPENAME[getContentType(linkedEntry)])
      .map((linkedEntry) => ({
        __typename: CONTENTFUL_TYPENAME[getContentType(linkedEntry)],
        pageTitle: linkedEntry.fields.pageTitle || getEntryTitle(linkedEntry) || "",
        sys: { id: linkedEntry.sys.id },
      })),
  },
});

const buildAsset = (asset) => {
  if (!asset) {
    return null;
  }

  const url = asset.fields.file?.url || "";

  return {
    title: asset.fields.title,
    url: url.startsWith("//") ? `https:${url}` : url,
    width: asset.fields.file?.details?.image?.width,
    height: asset.fields.file?.details?.image?.height,
  };
};

const buildMapFeature = (entry) => ({
  key: entry.fields.key,
  name: entry.fields.name,
  type: entry.fields.type,
  geometry: entry.fields.geometry,
  publicSummary: entry.fields.publicSummary,
  revealedSummary: entry.fields.revealedSummary,
  visibilityKey: entry.fields.visibilityKey,
  minZoom: entry.fields.minZoom,
  maxZoom: entry.fields.maxZoom,
});

const buildMapPage = (entry, includedEntries, includedAssets) => ({
  pageTitle: entry.fields.pageTitle || getEntryTitle(entry) || "",
  unitOfDistance: entry.fields.unitOfDistance || null,
  levelOfDetail: entry.fields.levelOfDetail || null,
  map: buildAsset(getLinkedAsset(entry.fields.map, includedAssets)) || {
    title: "",
    url: "",
  },
  mapId: entry.fields.mapId,
  tileUrlTemplate: entry.fields.tileUrlTemplate,
  imageWidth: entry.fields.imageWidth,
  imageHeight: entry.fields.imageHeight,
  minZoom: entry.fields.minZoom,
  maxZoom: entry.fields.maxZoom,
  defaultZoom: entry.fields.defaultZoom,
  defaultCenter: entry.fields.defaultCenter,
  featureCollection: {
    items: getLinkedEntries(entry.fields.featureCollection, includedEntries).map(
      buildMapFeature
    ),
  },
});

const buildPage = (entry, playerContent) => {
  const contentType = getContentType(entry);

  if (contentType === "listPage") {
    return buildListPage(entry, playerContent.includedEntries);
  }

  if (contentType === "lorePage") {
    return buildContentPage(
      entry,
      playerContent.includedEntries,
      playerContent.includedAssets
    );
  }

  if (contentType === "mapPage") {
    return buildMapPage(
      entry,
      playerContent.includedEntries,
      playerContent.includedAssets
    );
  }

  return null;
};

const getRequestedEntry = (event, playerContent, expectedContentType) => {
  const id = event.pathParameters?.id;
  const entry = id ? playerContent.includedEntries.get(id) : null;
  const allowedEntryIds = collectAllowedEntryIds(
    playerContent.resolvedContent,
    playerContent.includedEntries
  );

  if (!entry || !allowedEntryIds.has(id)) {
    return null;
  }

  return getContentType(entry) === expectedContentType ? entry : null;
};

const getEntryBody = (entry, includedEntries, visited = new Set()) => {
  if (!entry || visited.has(entry.sys.id)) {
    return "";
  }

  visited.add(entry.sys.id);

  if (entry.fields.content) {
    return richTextToPlainText(entry.fields.content).trim();
  }

  return getLinkedEntries(entry.fields.pageContent, includedEntries)
    .map((linkedEntry) => getEntryBody(linkedEntry, includedEntries, visited))
    .filter(Boolean)
    .join("\n\n");
};

const getEntryRichText = (entry, includedEntries, visited = new Set()) => {
  if (!entry || visited.has(entry.sys.id)) {
    return null;
  }

  visited.add(entry.sys.id);

  if (entry.fields.content) {
    return entry.fields.content;
  }

  const linkedBodies = getLinkedEntries(entry.fields.pageContent, includedEntries)
    .map((linkedEntry) =>
      getEntryRichText(linkedEntry, includedEntries, visited)
    )
    .filter(Boolean);

  return linkedBodies[0] || null;
};

const buildSectionsFromEntry = (entry, includedEntries) => {
  const linkedSections = getLinkedEntries(entry.fields.links, includedEntries)
    .map((linkedEntry) => ({
      title: getEntryTitle(linkedEntry) || "Private Notes",
      body: getEntryBody(linkedEntry, includedEntries),
      bodyRichText: getEntryRichText(linkedEntry, includedEntries),
    }))
    .filter((section) => section.body || section.bodyRichText);

  if (linkedSections.length) {
    return linkedSections;
  }

  const body = getEntryBody(entry, includedEntries);

  return body
    ? [
        {
          title: getEntryTitle(entry) || "Private Notes",
          body,
          bodyRichText: getEntryRichText(entry, includedEntries),
        },
      ]
    : [];
};

export const handler = async (event) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const playerContent = await fetchPlayerContent(claims.sub);

    if (!playerContent) {
      return buildResponse(404, {
        message: "No player content was found for this account.",
      });
    }

    if (event.routeKey === "GET /player/list/{id}") {
      const entry = getRequestedEntry(event, playerContent, "listPage");

      return entry
        ? buildResponse(200, buildListPage(entry, playerContent.includedEntries))
        : buildResponse(404, { message: "No player list page was found." });
    }

    if (event.routeKey === "GET /player/content/{id}") {
      const entry = getRequestedEntry(event, playerContent, "lorePage");

      return entry
        ? buildResponse(
            200,
            buildContentPage(
              entry,
              playerContent.includedEntries,
              playerContent.includedAssets
            )
          )
        : buildResponse(404, { message: "No player content page was found." });
    }

    if (event.routeKey === "GET /player/map/{id}") {
      const entry = getRequestedEntry(event, playerContent, "mapPage");

      return entry
        ? buildResponse(
            200,
            buildMapPage(
              entry,
              playerContent.includedEntries,
              playerContent.includedAssets
            )
          )
        : buildResponse(404, { message: "No player map page was found." });
    }

    return buildResponse(200, {
      displayName: playerContent.displayName || claims.email,
      characterName:
        playerContent.characterName ||
        getEntryTitle(playerContent.resolvedContent) ||
        "Unknown Character",
      privateSections: buildPrivateSections(playerContent),
      rootPageId: playerContent.resolvedContent?.sys.id || null,
      rootPageType: getContentType(playerContent.resolvedContent) || null,
      rootPage: playerContent.resolvedContent
        ? buildPage(playerContent.resolvedContent, playerContent)
        : null,
      defaultMapSlug: playerContent.defaultMapSlug || null,
      knownMapFeatureKeys: normaliseStringList(playerContent.knownMapFeatureKeys),
      revealedMapAreaKeys: normaliseStringList(playerContent.revealedMapAreaKeys),
    });
  } catch (error) {
    console.error(error);

    return buildResponse(500, {
      message: "Unable to load player content.",
    });
  }
};
