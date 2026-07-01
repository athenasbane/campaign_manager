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

  return {
    ...playerEntry.fields,
    includedEntries,
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

const getLinkedEntries = (links, includedEntries) =>
  Array.isArray(links)
    ? links
        .map((link) => getLinkedEntry(link, includedEntries))
        .filter(Boolean)
    : [];

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

    return buildResponse(200, {
      displayName: playerContent.displayName || claims.email,
      characterName:
        playerContent.characterName ||
        getEntryTitle(playerContent.resolvedContent) ||
        "Unknown Character",
      privateSections: buildPrivateSections(playerContent),
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
