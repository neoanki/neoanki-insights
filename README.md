# Collection Insights

See what is in your collection and what needs attention today. Collection Insights summarizes due cards, deck sizes, frequently used tags, and notes with missing prompts or answers.

## Features

- See total notes, total cards, and cards due today at a glance.
- Compare note and card counts across decks.
- Find the tags you use most often.
- Spot empty prompts, empty answers, and untagged notes.
- Refresh the report at any time without changing your collection.

Collection Insights reports collection facts and workload. It does not estimate mastery or predict learning outcomes.

## Install

Download the `.neoanki-extension` file from the latest release, then open **Settings → Extensions → Install from file** in Neo Anki.

## Privacy and permissions

Collection Insights can read the prompt, answer, deck, tags, and due state needed to build the report. It cannot edit your collection or connect to the internet.

- `content:read` — read the collection fields included in the report.
- `ui:page` — add the Collection Insights page.

## Development

Clone this repository beside `neoanki/neo-anki`, then run `npm install`, `npm run typecheck`, `npm test`, `npm run check`, and `npm run build`.
