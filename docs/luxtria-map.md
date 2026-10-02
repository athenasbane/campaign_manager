# Luxtria city atlas

The atlas lives at `/world/map`, linked from World. Existing archive links to Luxtria redirect here, including `?dmTools=true` sketch links. The original artwork, tile geometry, scale and 16 already-public features are preserved in `server/campaign/luxtria-map.json`. This snapshot does not publish any imported Obsidian draft, and does not automatically synchronise later Contentful edits.

Players can search every known place regardless of zoom, filter by feature type, select a place to focus the map, read its Markdown description, follow permitted lore links, hide display layers or labels, measure a multi-point path, expand the map, and copy a link to the selected place and camera. The phone interface gives the map the full stage and opens places and details in a bottom sheet. Distance is an estimate using the archived map's existing 10 Miles scale; it is not a new surveyed scale or travel-time calculation.

The local sketch studio preserves pins, polygons, polylines, rectangles, undo, clearing, zoom limits, JSON and Contentful field exports, and adds redo and an export shaped for Codex. Close the phone sheet to draw, then reopen “Continue sketch” to edit or copy. Finishing a sketch keeps it ready to edit or export, and measurements use separate points. Clear explicitly removes the sketch. Sketches are temporary browser memory; copying a sketch does not create, publish or persist an entry.

## Authoring with Codex MCP

`get_campaign_map` returns the map dimensions, stable keys and published map features. `create_entry_draft` and `update_entry_draft` accept an optional `mapFeature`:

```json
{
  "mapId": "luxtria",
  "key": "market-square",
  "type": "landmark",
  "geometry": { "type": "point", "coordinates": [600, 450] },
  "minZoom": -2,
  "maxZoom": 2
}
```

Coordinates are the original image coordinates: x from left to right, y from bottom to top, both between 0 and 1254. Other geometry forms are `polygon`/`polyline` with an array of coordinate pairs, and `rectangle` with `bounds: [[minX,minY],[maxX,maxY]]`. Polygons require at least three points and polylines at least two. Geometry and effective zoom limits are validated before saving and again before publication. Omitted zoom limits inherit the original artwork’s limits for an existing key, or the feature type defaults for a new key; they never inherit another entry’s overrides. Use null to remove a limit, or provide both limits when moving an existing place to a different zoom range.

A new stable key creates a mapped location using the published entry's title and summary. An existing key attaches the entry to that place's “Follow the story” links. A published `place` entry with an existing key can also update its geometry and explicit zoom limits. Each readable article with a map placement links back to its place on the atlas. To attach a clue to an existing place, copy its geometry and key from `get_campaign_map`, and keep the entry's own type (such as `knowledge`).

Draft → set audience → preview change and character view → publish remains the authoring flow. Public, party and selected-character audiences work exactly as for articles. A private feature or lore link is omitted from other characters' server responses, including its name and coordinates. Drafts never enter the atlas. Unpublishing withdraws the feature or link. Assigning a map placement does not expand the entry's audience. The MCP GM key stays in the server process, never in the frontend.

The artwork is already public. Private overlays cannot hide information drawn into that artwork. The map renderer retains fog-overlay support for map datasets, but this source map has no configured fog areas; the initial release hides private locations and lore server-side rather than disclosing their shapes to unassigned players.

## Validation

Regression coverage checks search across zoom levels, share-view validation, multi-point measurements, complete sketch geometry, persistent place details, mobile sketch sheet reopening, archive redirects without legacy map fetches, recipient-filtered map payloads, publication and withdrawal, and end-to-end MCP → HTTP → actor-specific atlas reads. Identity changes clear the campaign API cache, including map data.
