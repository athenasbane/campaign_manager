# Luxtria campaign journal: redesign and implementation plan

Date: 2 October 2026. Status: first release implemented and locally verified. This document records the agreed direction; concrete implementation and rollout instructions are in `luxtria-operations.md`.

## Agreed brief

The next campaign is Luxtria. Players are the primary audience and mostly use phones. They need to catch up and find campaign information. The owner wants a much better-looking site, with a sleek dark journal aesthetic, restrained fantasy accents, and excellent readability. The GM should publish knowledge to individual characters and occasionally share the same secret with selected characters. Authoring through an MCP connected to Codex is more useful than building a large administration UI. Reinventing navigation and introducing new features is within the planning scope.

The owner supplied the Luxtria/Campaign directory from Obsidian. Its 129 notes are imported as GM-only drafts pending selection of player-safe content. Player/account mappings and the next session date have not been supplied. The interface uses honest empty states and does not invent campaign facts.

The owner subsequently clarified that Luxtria will contain a large amount of lore. Structured world browsing, authorized search, and batch authoring are therefore first-release requirements. The exact volume, source formats, and longest articles remain sizing inputs; a large archive alone does not justify replacing the current framework or CMS.

## What the review established

Browser review covered the current home, session recaps, lore index, mission screen, and login entry. Code review covered routing, the shared shell, public content queries, maps and visibility filtering, character pages, login, player API, and Lambda content delivery. Authenticated character screens were reviewed in source; no player account was used. Deployed API authorization and Contentful token/environment restrictions were not independently audited.

- The home leads with a date and long setting introduction, with no direct route to the latest recap or character knowledge. When no date is supplied, its helper calculates the next Wednesday; the redesign should display an honest unscheduled state.
- Nine main destinations sit behind a bottom drawer. Campaign selection lives within recaps; lore uses separate generic lists. Campaign context is not consistently carried across the site.
- Recaps have extensive material, but appear in a long accordion list. There is no cross-site search or concise catch-up view.
- The observed mission screen showed an empty selector beside “Select a mission.” This is a confirmed UX problem; its cause was not diagnosed in this planning review.
- Cognito login, player-specific page retrieval, a character landing page, and interactive maps already exist. Reuse these foundations where appropriate.
- Map features and revealed summaries are requested through the public Contentful query and filtered in the client adapter. The private map serializer also returns linked feature data without applying character visibility there. Hiding features in the interface does not establish confidentiality.
- The browser is configured with a Contentful delivery token. Whether that token can reach existing private entries depends on the actual environment and token configuration. Verify this before migrating secrets.
- Some CMS request failures become a 404, and some loading views are blank. Introduce distinct loading, empty, unavailable, and genuinely missing states.

Relevant existing files: `src/theme.ts`, `src/Templates/Main.tsx`, `src/Components/Molecule/Navbar`, `src/Components/Molecule/Draw`, `src/Pages/Welcome`, `src/Pages/Sessions`, `src/Pages/Player`, `src/Store/slices/backendQueries.ts`, `src/Store/slices/playerApi.ts`, `src/Components/Organism/InteractiveMap`, and `index.mjs`.

## The five improvements, ranked

### 1. Give Luxtria a distinctive, phone-first journal design

Replace the current large fantasy headings, animated sparks, broad text layouts, and hidden navigation with a deliberate visual system. Start with charcoal surfaces, warm readable text, a muted metallic accent, quiet separators, and modest serif display headings alongside a clear body font. Treat the precise accent as a prototype choice until Luxtria's setting is known. Use illustrations where they convey setting or location, rather than as a prerequisite for every entry.

On phones, use four persistent destinations: **Home, Journal, World, Character**. Put missions inside Journal; put maps, people, factions, locations, and lore inside World. Search opens from the header. Rules and documents live in a secondary library. Give desktop the same structure in a compact side navigation with a readable central column. Luxtria is the initial campaign; older campaigns are reachable through an archive switcher.

First design deliverables: mobile home, searchable world library, long-form lore reader, and private character dossier. Include empty, loading, and long-title examples. Use comfortable body text, touch targets around 44 pixels, visible keyboard focus, reduced-motion support, and readable contrast. Validate at 360–430 pixel phone widths and on desktop.

Success: a player can identify the active campaign and navigate to recaps, world information, and their character without opening a general menu; reading a long recap is comfortable on a phone.

### 2. Make private character dossiers the signature feature

Rebuild the character area around **Your knowledge**, **Newly revealed**, and **Personal handouts**, with character identity and a clear explanation that this view contains information available to that character. Show unread and updated indicators without requiring email or push notifications for launch.

A knowledge entry has a title, body, related world entries, campaign, explicit recipients, and a publication state. Support one character, selected characters, and the whole campaign party. GM-only drafts are separate. “Party” means authenticated campaign members; it does not mean the public web. Public publication is a distinct action when needed. Store a shared secret once and attach grants, so corrections reach its recipients consistently. Do not expose other recipients in the player UI by default.

The server determines membership and character identity from verified authentication, then filters entry bodies, titles, metadata, search, and map features before returning data. It must also control access to private attachments. A publicly reachable image or PDF is unsuitable for a confidential handout. Fog must not be used to protect secret labels already printed into an accessible map image; supply a player-safe base map and authorized overlays.

Success: character A can open their own secret; character B cannot retrieve it through a guessed URL, search query, map payload, or attachment URL. A selected shared secret is accessible to precisely its recipients. Revocation stops subsequent retrieval; it cannot undo knowledge already read or copied.

### 3. Let the GM maintain Luxtria through Codex

Build a small campaign-specific MCP with purposeful tools, backed by the same content service as the website. Start with a local STDIO server for the GM's Codex setup. It calls an authenticated GM API for shared content operations. A remote authenticated MCP can follow if authoring from other machines becomes necessary. Codex supports both transports; a publicly exposed MCP endpoint is not required for the first release.

Example intended commands:

- “Add these notes as Luxtria's latest recap and link the people and places already mentioned.”
- “Update this faction's lore using the supplied text and show what changed.”
- “Give this knowledge to Character A and Character B; keep it private from the rest of the party.”
- “Show exactly what Character A will see after this update.”

Proposed tools:

| Tool | Responsibility |
| --- | --- |
| `search_campaign_content` | Find canonical entries within an explicit campaign and author scope. |
| `get_entry` | Read an entry and its current version. |
| `list_campaign_characters` | Resolve stable recipient identities within Luxtria. |
| `create_entry_draft` | Create recap, lore, mission, or knowledge content with explicit audience. |
| `update_entry_draft` | Apply a structured patch against an expected version. |
| `set_draft_audience` | Assign exact character recipients or party/public visibility. |
| `preview_change` | Return the content diff, resolved recipients, and target character view. |
| `publish_change` | Publish the identified draft/version to its explicit audience. |
| `restore_entry_version` | Restore a retained version without losing the change history. |
| `prepare_lore_import` | Turn supplied material into a bounded batch of proposed entries; preserve source references and report possible duplicates, unresolved links, and audience assignments. |
| `apply_lore_import` | Save an identified, validated batch as drafts with retry-safe identifiers and per-entry results; resume failed items without duplicating successful ones. |

Writes validate schemas and references, reject ambiguous characters, and do not silently overwrite concurrent changes. Retry-safe mutation identifiers prevent duplicated entries. Audit records preserve the author, operation, version, and recipient changes. Secrets default to a GM-only draft until their audience is explicit. Publishing follows the GM's instruction; an ordinary request to draft does not imply publication. Codex uses supplied campaign facts and existing lore, and flags unresolved contradictions instead of inventing canon.

Keep credentials outside browser bundles, committed files, and tool outputs. Player authentication cannot authorize GM tools. Build a small reusable authoring skill alongside the MCP to describe Luxtria's content conventions and the draft/preview/publish workflow; campaign prose is data, not tool instructions.

For bulk lore, accept supplied documents or text in bounded batches. Propose categories, aliases, summaries, and links using the source material; preserve the original body and source location. Flag contradictions and suspected duplicates for resolution instead of silently merging canon. Import into GM-only drafts until an audience is explicitly assigned. Preview and publish identified entries or batches, with version checks and an exact audience manifest. Each import reports created, updated, skipped, and failed items. Start with the owner's actual source formats rather than building a universal document importer.

Success: one natural-language request can create and publish an explicitly addressed character secret, which appears on the recipient's phone without editing source code or deploying the frontend. A correction can be previewed and restored.

### 4. Replace the welcome page with a campaign briefing

The Luxtria home answers: **What happened? What matters now? What is new for me?**

Order its content for phone use: campaign identity and next scheduled session; a short latest recap with a read link; current goals or unresolved threads; newly revealed knowledge for the signed-in character; a current place/map link when configured. Put the setting introduction in “About Luxtria.” On launch, before any session exists, show the campaign primer and preparation material instead of fabricated activity.

Give recaps dedicated, shareable reader routes, with a brief summary, key developments, linked people and places, and the full narrative. Retain act/chapter grouping for browsing older sessions. Track unread knowledge and the last recap read as persistent per-user state, isolated by campaign and character. Logged-out visitors see only deliberately public material and a sign-in route.

Success: a returning player can understand the latest developments and identify their next useful action in about a minute. Treat this as a usability target to test with players, not a claimed measurement of the current site.

### 5. Turn the lore archive into a connected world library

Give people, factions, locations, lore, missions, maps, and recaps consistent titles, summaries, and relationships. World entries answer “Where did we encounter this?” and “What does my character know?” Link a recap's location to its map, a mission to its relevant faction, and a secret to the subject it concerns. Favor readable entry pages and useful links over a complex relationship graph on a phone.

Add search scoped to the current campaign, with optional type filters. Search the shared content and the user's permitted knowledge on the server; unauthorized titles, result counts, excerpts, and relationship labels must not leak. Allow bookmarks after the core reading/search flow works. Maps should open relevant permitted details in a mobile sheet and support direct feature links that survive refresh.

Because Luxtria will have substantial lore, ship the searchable library with the initial release. Use a small set of useful entry types: people, places, factions, history, culture, and rules, with curated collections when needed. Support canonical names and aliases so players can find an entry using familiar names. Start World with a campaign primer, relevant collections, and recently updated permitted entries; keep the full catalogue one step away.

Each article starts with a short source-grounded summary, then the full text. Long articles get a section index, stable heading links, related entries, and backlinks. Maintain one canonical entry per subject; link character-specific revelations as separately authorized knowledge rather than embedding every secret inside a shared rich-text body. A character's view can combine the permitted portions without exposing restricted titles or implying that an unseen secret exists.

Fetch article bodies on demand and paginate lists and search on the server. Maintain a searchable representation of published entries with campaign/audience filtering applied before snippets, counts, and facets are returned. Publication must update discovery promptly; revocation must deny access even while search updates are pending. Test browsing and search with a representative volume of fixtures and long articles on phones. Choose the search implementation after measuring that volume and evaluating existing infrastructure; do not assume a dedicated external search service is necessary.

Success: a player can find a known person or place by name and reach its relevant recap or map in a few taps, while secret information remains specific to that character.

## Proposed architecture

The implementation reuses React, routing/state, and Cognito. Earlier campaigns retain their Contentful delivery path. Luxtria uses a private SQLite database and server-side FTS search, shared by its API and MCP. This keeps the imported private notes outside the existing browser-accessible Contentful environment without requiring external CMS configuration before local review. SQLite requires a persistent single-instance Node host; deployment is a separate rollout step.

For Luxtria, route all content through a campaign service that owns access checks, references, validation, publication, and revisions. The website receives a role-appropriate view. The GM MCP calls authenticated authoring operations on that service. Existing public archives can keep their current delivery path during rollout.

Place Luxtria content in a server-only Contentful environment or space that the old browser token cannot access. Verify the isolation using that token before loading real secrets. Only the server holds Luxtria delivery credentials and management credentials. If the deployed Contentful setup cannot supply the needed isolation, store secrets and grants in a private server database instead. Resolve that through a short configuration spike, not an assumption that hidden entries are private.

Suggested logical models:

- Campaign: identity, slug, settings, next session, current place, archive state.
- Membership and character: verified user identity, campaign, role, stable character ID.
- Entry: stable ID, campaign, type, canonical title, aliases, source-grounded summary, rich body with stable heading IDs, source/import references, related entry IDs, collections/tags, version, draft/published state, audience.
- Knowledge grant: entry, campaign, character recipient(s) or party grant, grant/revoke timestamps.
- Reader state: user/character/campaign, bookmarks, read version or last-read marker.
- Change record: mutation ID, actor, previous/new version, content/audience diff, publication state.

Some models may initially map to Contentful fields; mutable grants, read state, and audit history should use server-managed persistence where CMS modeling is unsuitable. Select the concrete storage during the spike based on existing infrastructure and operational overhead. Do not let the website, MCP, and CMS each implement independent visibility rules.

## Build order and reviewable milestones

| Milestone | Deliverable | Completion gate |
| --- | --- | --- |
| A. Validate the foundation | Luxtria campaign/schema; identity and GM role mapping; private storage boundary; revision strategy | Two test characters and a GM demonstrate permitted and denied reads; browser token cannot retrieve private content. |
| B. Establish the visual system | Four phone prototypes and responsive shell; campaign/archive navigation; content states | Owner reviews home, world library, long article, and dossier against the chosen dark journal direction; no invented Luxtria lore. |
| C. Ship the lore foundation | Structured world entries, aliases, article summaries/section index, authorized search, bounded batch import drafts | A representative lore batch imports without duplicates on retry; players find and read permitted entries comfortably on phones. |
| D. Ship the signature workflow | Private dossier plus GM MCP: draft, assign, preview, publish, correct; batch audience/publication support | A GM command delivers one secret to a character and a shared secret to two characters, with no unintended recipients; imported lore can be published to an explicit audience. |
| E. Complete the player experience | Campaign briefing, recap readers, mission summaries, read state, richer backlinks and map deep links | New campaign and catch-up flows work on phones; players navigate world references; dates come from configured data. |
| F. Roll out | Luxtria content setup through MCP, player sign-in/onboarding, archive access, deployment | Owner can maintain the campaign through Codex; players complete the core tasks on their actual phones. |

The revised first coherent release is B + C + D backed by A: a polished mobile shell, a searchable lore library, batch authoring, and private knowledge publishing. E completes the broader player experience. Search and lore ingestion cannot wait until after launch when substantial lore is present from the outset. Build the MCP vertical slice alongside the library and dossier rather than leaving authoring until the end.

## Validation and scope limits

Use targeted API integration tests for cross-character and cross-campaign denial, missing/expired authentication, draft exclusion, unauthorized attachments, publication recipients, and conflict/retry behavior. Verify cache separation between characters and clear private UI/query data on logout or character change. Avoid storing authenticated API responses in a shared offline cache.

Use focused phone browser checks for reading, navigation, search, empty/error states, and map interaction. Test the complete GM-command-to-player-view workflow with fixture accounts and content before real secrets. Run the existing required build/type/lint/test checks when implementing; this planning-only review has not run them.

Add meaningful checks for alias lookup, pagination, long-article section links, broken references, duplicate/retried imports, concurrent batch edits, and visibility changes in discovery. Set measurable performance targets after the representative lore sample is available; validate a phone does not download the whole archive to render World or search.

Initial release excludes a full visual CMS, collaborative player writing, live chat, AI-generated canon, push notifications, an offline private vault, a combat/VTT system, and broad automated campaign migration. Rules, exchange tools, documents, and old history remain accessible as relevant secondary resources. Luxtria should only surface features that its campaign uses.

Remaining implementation inputs: Luxtria's primer and rules, approximate lore volume and existing source formats, actual character/user assignments, date/time/timezone, desired public landing content, and deployed Cognito/Contentful/AWS configuration. These do not prevent prototyping with clearly labeled fixtures.

## Primary references checked

- [Official OpenAI documentation: MCP configuration and supported transports](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).
- [Official OpenAI documentation: building an MCP server](https://developers.openai.com/plugins/build/mcp-server).
- [Contentful delivery API: environment access tokens](https://www.contentful.com/developers/docs/references/content-delivery-api/overview/). Token access is scoped to an environment; a per-character access policy belongs in the campaign service.
- [AWS API Gateway JWT authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html). The existing Lambda expects authorizer claims, so deployment verification is required before relying on this identity boundary.
