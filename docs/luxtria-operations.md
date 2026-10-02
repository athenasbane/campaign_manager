# Luxtria: authoring and operations

The first release provides Home, Journal, World, Character, a Markdown reader with heading navigation and permitted backlinks, and a local GM MCP. Earlier campaigns remain in the archive. Real Luxtria notes are private drafts until the owner chooses what to publish.

## Local use

Requires Node 24.11+ and Yarn 1.22.22. From this project:

```sh
yarn install --frozen-lockfile
yarn setup:campaign
yarn start
```

The site opens at http://127.0.0.1:3000. The API uses port 3001. Vite forwards `/api/campaigns` to the API. `setup:campaign` generates an ignored, mode-0600 `.env.campaign` with a random GM key and database location; it preserves an existing file. The SQLite database, WAL files, import reports, and screenshots are ignored under `.local`.

The local server also serves `build` when present. For a production-like local check, run `yarn build` and open http://127.0.0.1:3001. Dev and API processes stop together on Ctrl-C. The MCP requires the campaign API to be running.

## Codex MCP

The `luxtria` stdio MCP is registered in this owner's Codex configuration. New chats may need to reload MCP connections before its tools appear. Its command uses this project's absolute environment-file and server paths; the actual key is not stored in the Codex command or browser bundle. To register it on another machine, use that machine's absolute paths:

```sh
codex mcp add luxtria -- node --env-file=/absolute/path/campaign_manager/.env.campaign /absolute/path/campaign_manager/server/mcp/server.mjs
```

There are 19 tools, including `get_campaign_map` for atlas placement. See [map authoring](luxtria-map.md). Discovery and import preview are separate from publishing. Example requests:

- “Use Luxtria to list the imported drafts and show the original Player Guide entries, including their canon and audience flags. Do not publish yet.”
- “Review this note for player-safe content, propose a short summary using only its text, and show the draft change.”
- “Give this supplied secret to these exact character IDs. Preview their view, then publish the reviewed version.”
- “Draft this session recap, link the people and places already in the campaign, and show unresolved references.”
- “Withdraw this entry from player views, retaining its history.”

See `luxtria-authoring.md` for the workflow. No external AI API or autonomous content generation is built into the website; Codex is the GM authoring client.

## Obsidian import

The configured root is the owner-supplied `Luxtria/Campaign` directory. Reads stay inside that root; hidden folders, symlinks, and non-Markdown files are excluded. Source files are never edited.

129 notes were imported as GM-only drafts. Frontmatter such as `lore_audience`, `knowledge`, `canon`, and `lore_include` is retained as source metadata. Folder names never authorize publication. The initial report contains 162 link/attachment warnings and 17 possible duplicate names, largely because several guides share subject names and some references point outside the selected directory. These are review items; the importer does not merge similarly named canon or import protected attachments.

Use `preview_obsidian_import` to obtain a manifest and digest, then `import_obsidian_drafts` for bounded batches (max 25) against that digest. Existing notes require exact expected versions. Source changes invalidate the digest. Imports do not publish. Stable IDs derive from the source path: renaming a source file creates a different ID, so resolve renames deliberately rather than importing duplicates.

The initial local CLI can be rerun:

```sh
yarn import:obsidian
```

It adds new notes, skips deeply equal notes, and reports differing existing drafts without overwriting them. Reports are `.local/obsidian-import-review.md` and `.local/obsidian-import-report.json`. Review original bodies with `get_entry`; the manifest alone does not establish that a note is player-safe. Attachments are placeholders pending a protected attachment feature. Unresolved wiki links become text and are reported. Review that text before publication.

## Player identity and knowledge

Use the existing Cognito pool/client, configured for both the frontend and API. The API verifies RS256 signatures, issuer, client audience, expiry, subject, and ID-token use. Frontend Cognito settings are public IDs; the GM key remains server-only. The optional `luxtria-gm` Cognito group authorizes GM API operations, with a configurable group name.

Map each verified Cognito `sub` to one exact campaign character with `register_campaign_character`. Names are display text, not identity. Account reassignment is intentionally rejected. No real player mappings have been created. The owner must supply the actual account subjects before dossiers can be used by players; the signed-in site explains an unassigned account honestly.

Audiences:

| Audience | Access |
| --- | --- |
| `gm` | Authoring draft only; cannot be published. |
| `public` | Everyone, including signed-out visitors. |
| `party` | Authenticated, registered Luxtria characters. |
| `characters` | Exactly the selected character IDs. |

An edit or recipient change saves a new draft and leaves the published snapshot unchanged. Publish the expected reviewed version to apply it. `unpublish_entry` removes the entry from subsequent player reads and search, retaining draft/revisions. Restoration makes a new draft; publish explicitly to change the live page.

The service filters titles, bodies, totals, facets, related entries, backlinks, and primer links before returning player data. Hidden internal link labels are removed from article bodies and all internal link labels are excluded from indexed body text. It cannot remove a secret manually copied into an otherwise public paragraph; review each entry's text and audience. Player responses contain neither recipient lists nor source metadata. Authenticated responses are no-store. Signing in, switching accounts, or signing out clears private query caches.

Read status and bookmarks persist per campaign character and entry version. Updated knowledge becomes unread again. The home gets actual scheduling data through `configure_campaign`; the initial session remains unscheduled.

## Persistence and deployment

Production retains S3/CloudFront at https://teratin.online and uses the existing London HTTP API Gateway for `/api/campaigns/*`. Cognito stays in the existing player pool. `infrastructure/luxtria.yaml` describes the new infrastructure, including IAM roles limited to the campaign table and logs.

DynamoDB is authoritative in production. `dynamo-store.mjs` hydrates a disposable in-memory SQLite view to reuse the tested permission rules and FTS search. Reader operations hydrate only published notes, never GM drafts. History and mutation records are fetched by exact key when needed. Writes commit changed durable rows, publication snapshots, history, audit and mutation results in one DynamoDB transaction, protected by a campaign revision. Reads detect a concurrent commit during hydration and retry once. Cloud imports accept up to 25 notes per atomic batch. The local development API continues to use private SQLite on disk.

The first cloud release copies the 129 local imported notes as GM-only drafts; it does not publish them. Source notes and private deployment parameters are never uploaded to the public frontend bucket. The local MCP targets the production HTTPS API after rollout. To author against a local development database instead, use `LUXTRIA_API_URL=http://127.0.0.1:3001` in the ignored `.env.campaign` and restart the MCP connection.

### Cost controls

- DynamoDB has fixed 25 read / 5 write capacity units, without autoscaling or secondary indexes. Its existing free allowance may cover this capacity and the first 25 GB of storage; eligibility and usage are shared with other tables. Provisioned capacity is charged even while idle if outside that allowance.
- The campaign gateway route is throttled to 1 request/second with a burst of 10. The account concurrency quota remains 10; AWS disallowed reserving two executions at that quota. Other API routes are unchanged. No public Lambda Function URL exists to bypass the gateway throttle.
- Every real API request must pass durable daily (1,000) and monthly (10,000) quotas. Quotas fail closed; rejected admissions are cached briefly to reduce database work. Preflight requests perform no database work.
- API memory is 512 MB, timeout 15 seconds, logs expire after 7 days, and there is no provisioned concurrency, EC2, load balancer, NAT gateway, RDS, or paid search service.
- The account-wide `Luxtria monthly cost guard` budget emails the owner at $2 and $5 actual monthly spend. Its $5 SNS alert invokes an isolated cutoff function that sets only the new campaign API's concurrency to zero. Existing applications are not shut down. Billing updates and alerts can be delayed: this is not a guaranteed $5 bill cap. Existing AWS resources count towards the account-wide budget.
- If cut off, investigate the cause and cost before explicitly restoring access with `aws lambda delete-function-concurrency --function-name luxtria-campaign-api --region eu-west-2`. It does not automatically resume next month. Quota and capacity changes require a deliberate release.
- Hydration is bounded to 5,000 rows and 8 MB compressed per prefix and 32 MB materialized per operation; oversized notes/batches are rejected. Review storage design before exceeding that campaign size rather than silently increasing capacity.

Build the code-only Lambda zip with `yarn build:lambda`. The merge deployment workflow updates the Lambda, checks the live anonymous atlas, then builds/uploads the frontend and invalidates CloudFront. The private CloudFormation parameters are prepared with `node scripts/prepare-luxtria-deployment.mjs` into an ignored mode-0600 file. Never print that file or add it to Git. Infrastructure updates are separate from routine code deployment and must preserve the NoEcho GM credential, fixed capacity, gateway throttle and budget subscription. The protected table is retained on stack deletion.

Keep offline backups private: unpublished notes and character knowledge are sensitive. Export via the GM API or a private DynamoDB export/backup; backups have their own storage charges. The current rollout does not automatically enable paid PITR. Keep the local pre-deployment SQLite copy for recovery. Protect and rotate the GM key together in Lambda and the local MCP. No public attachment store is provisioned.

## Verification

```sh
yarn build
yarn typecheck
yarn lint
yarn test --watchAll=false --runInBand
yarn test:campaign
```

Backend tests cover signature/claims validation, anonymous/unassigned/party/exact-character access, draft exclusion, private discovery and references, read-state isolation, stale edits, retries, rollback, restore, withdrawal, bounded search and Obsidian import. The SDK MCP client is tested through an actual localhost API and separately through stdio against the real draft database. Frontend tests include account-switch cache clearing. Phone browser checks cover navigation, empty states, search, populated pagination, reader headings, tables, references, and responsive widths. No real player password was used; real deployed sign-in remains a rollout check.
