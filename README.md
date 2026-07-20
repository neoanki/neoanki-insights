# NeoAnki Insights

A signed, isolated NeoAnki extension for inspecting the current collection. It reports workload and organization facts; it does not claim to measure mastery.

## Privacy and permissions

Insights has no network or write access. It requests paginated read-only note projections and renders them in a sandboxed page.

- `content:read` — read prompt, answer, deck, tags, and bounded card projections.
- `ui:page` — render the Insights page.

## Development

Clone this repository beside `neoanki/neo-anki`, then run `npm install`, `npm run typecheck`, `npm test`, `npm run check`, and `npm run build`.

