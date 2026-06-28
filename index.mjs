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
    include: "2",
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
    return node.content.map(richTextToPlainText).join("");
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

const buildPrivateSections = (playerContent) => {
  const configuredSections = normalisePrivateSections(
    playerContent.privateSections
  );

  if (configuredSections.length) {
    return configuredSections;
  }

  if (playerContent.resolvedContent) {
    return [
      {
        title: playerContent.resolvedContent.fields.name || "Private Notes",
        body: richTextToPlainText(playerContent.resolvedContent.fields.content),
      },
    ];
  }

  return [];
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
        playerContent.resolvedContent?.fields.name ||
        "Unknown Character",
      privateSections: buildPrivateSections(playerContent),
    });
  } catch (error) {
    console.error(error);

    return buildResponse(500, {
      message: "Unable to load player content.",
    });
  }
};
