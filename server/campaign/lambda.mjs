import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import serverless from "serverless-http";
import { createAuthenticator } from "./auth.mjs";
import { createCampaignApp } from "./app.mjs";
import { createDynamoService } from "./dynamo-store.mjs";
import { CampaignError } from "./service.mjs";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ maxAttempts: 2 }),
);
const durable = createDynamoService(client, process.env.LUXTRIA_TABLE);
const authenticate = createAuthenticator();
const service = new Proxy(
  {},
  {
    get:
      (_target, operation) =>
      (...args) =>
        durable.execute(operation, ...args),
  },
);
const app = createCampaignApp(service, authenticate, {
  allowedOrigin: process.env.LUXTRIA_ALLOWED_ORIGIN,
});
const invoke = serverless(app);
export async function handler(event, context) {
  try {
    // Validate the path/body before spending database capacity. CORS preflight
    // uses no quota; every real request must pass durable monthly/daily limits.
    const path = event.rawPath || "";
    if (!path.startsWith("/api/campaigns/luxtria") || path.length > 500)
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Endpoint not found." }),
      };
    if ((event.body?.length || 0) > 5_600_000)
      throw new CampaignError(413, "Request is too large.");
    if ((event.headers?.authorization?.length || 0) > 8192)
      throw new CampaignError(401, "Please sign in again.");
    if (event.requestContext?.http?.method !== "OPTIONS") {
      await authenticate(event.headers?.authorization);
      await durable.quota();
    }
    return await invoke(event, context);
  } catch (error) {
    const statusCode = error instanceof CampaignError ? error.status : 503;
    if (statusCode === 503)
      console.error("Campaign backend unavailable:", error.name);
    return {
      statusCode,
      headers: {
        "content-type": "application/json",
        "cache-control": "private, no-store",
        "access-control-allow-origin": process.env.LUXTRIA_ALLOWED_ORIGIN,
        vary: "Origin, Authorization",
      },
      body: JSON.stringify({
        message:
          statusCode === 503
            ? "Campaign is busy. Please try later."
            : error.message,
      }),
    };
  }
}
