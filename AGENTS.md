# AGENTS.md

## Project Overview

MyAnki is a local-first Swedish vocabulary trainer using spaced repetition. It's a simple single-page web app with a minimal Express backend.

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (no framework)
- **Backend**: Node.js with Express
- **Data**: JSON file (`vocab.json`) - no database

## Architecture

```
index.html   → Single page app UI
style.css    → Dark mode styling
app.js       → Frontend logic (SPA routing, spaced repetition, UI)
server.js    → Minimal Express server (serves static files, CRUD for vocab)
vocab.json   → Vocabulary data store (git-tracked)
```

## Key Concepts

### Spaced Repetition (SM-2 variant)
Cards have: `interval`, `easeFactor`, `repetitions`
- **Again (1)**: Reset, show again today
- **Hard (2)**: 1 day interval, keep progress
- **Good (3)**: Standard progression (1 → 3 → 7 → 14 → ×easeFactor)
- **Easy (4)**: Accelerated progression

### Data Flow
1. Frontend fetches vocab from server
2. User studies/adds/deletes cards
3. Changes POST back to server
4. Server writes to `vocab.json`

## Development

```bash
npm install
npm start  # http://localhost:3000
```

## Important Notes

- `vocab.json` is the source of truth and is git-tracked
- No build step required
- No external database - everything is file-based
- Designed for personal use (single user)

## Auto-Commit Consideration

Since `vocab.json` changes frequently during study sessions and is meant to be git-tracked, consider automating commits/pushes to preserve vocabulary progress across devices.
