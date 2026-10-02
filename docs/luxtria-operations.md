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

Use `preview_obsidian_import` to obtain a manifest and digest, then `import_obsidian_drafts` for bounded batches (max 30) against that digest. Existing notes require exact expected versions. Source changes invalidate the digest. Imports do not publish. Stable IDs derive from the source path: renaming a source file creates a different ID, so resolve renames deliberately rather than importing duplicates.

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

**This release is running locally, not deployed.** The earlier production site deploys static assets to S3/CloudFront. A static upload alone cannot run the new API. The deployment workflow now requires a configured HTTPS `REACT_APP_CAMPAIGN_API_URL` before shipping the redesigned frontend.

Choose either:

1. One persistent Node host serving the built frontend and API on the same HTTPS origin. Build without `REACT_APP_CAMPAIGN_API_URL`, bind the Node server with `LUXTRIA_API_HOST=0.0.0.0`, and set `LUXTRIA_DB_PATH` to a durable mounted path. Terminate HTTPS with the host/reverse proxy. Install full dependencies: this existing project currently keeps some runtime dependencies such as dotenv in devDependencies.
2. Retain S3/CloudFront for the frontend and run the API on a persistent Node host. Build with `REACT_APP_CAMPAIGN_API_URL=https://api.example`, configure `LUXTRIA_ALLOWED_ORIGIN` as the exact frontend origin, and point the local MCP's `LUXTRIA_API_URL` at the HTTPS API. Supply the same verified Cognito pool/client to both components.

The API base URL should be the origin, without `/api/campaigns` appended. HTTPS is required for a remote MCP target. Do not run this SQLite implementation in an ephemeral Lambda filesystem or across independent replicas. A future multi-instance deployment needs shared database persistence and migrations. Live Cognito sign-in, DNS/TLS, CORS, hosting, and existing Contentful archive credentials need verification on the chosen deployed environment. No cloud resources, user accounts, or live content were changed by this implementation.

Back up SQLite with its online backup API or stop the API before copying the database. Do not copy only the main file while live WAL writes are occurring. Keep backups private; they contain unpublished notes and all character knowledge. Protect and rotate the GM key as a server credential, and update the API and local MCP together. No public attachment store is provisioned by this release.

## Verification

```sh
yarn build
yarn typecheck
yarn lint
yarn test --watchAll=false --runInBand
yarn test:campaign
```

Backend tests cover signature/claims validation, anonymous/unassigned/party/exact-character access, draft exclusion, private discovery and references, read-state isolation, stale edits, retries, rollback, restore, withdrawal, bounded search and Obsidian import. The SDK MCP client is tested through an actual localhost API and separately through stdio against the real draft database. Frontend tests include account-switch cache clearing. Phone browser checks cover navigation, empty states, search, populated pagination, reader headings, tables, references, and responsive widths. No real player password was used; real deployed sign-in remains a rollout check.
