# AGENTS.md

## Project Overview

MyAnki is a local-first Swedish vocabulary trainer using spaced repetition. It's a simple single-page web app with a minimal Express backend.

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (no framework)
- **Backend**: Node.js with Express
- **Data**: JSON file (`vocab.json`) - no database

## Architecture

```
index.html    → Single page app UI
style.css     → Dark mode styling
app.js        → Frontend logic (SPA routing, spaced repetition, UI, backup triggers)
server.js     → Express server (static files, CRUD for vocab, git backup API)
vocab.json    → Vocabulary data store (git-tracked)
.githubtoken  → GitHub PAT for auto-backup (git-ignored)
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

## Auto-Backup System

The app automatically commits and pushes `vocab.json` to GitHub:

### Triggers
1. **After adding cards** → `added X cards - YYYY-MM-DD`
2. **After session complete** (due cards goes from >0 to 0) → `session completed - YYYY-MM-DD`

### Implementation
- `POST /api/backup` endpoint in `server.js`
- Reads GitHub PAT from `.githubtoken` file
- Runs: `git add vocab.json && git commit -m "..." && git push`
- Handles "nothing to commit" gracefully
- UI shows spinner during backup, success/error status after

### Security
- `.githubtoken` is in `.gitignore` - never committed
- Token only used server-side, never exposed to frontend

## Agent Guidelines

### After Making Changes
If you've made meaningful changes to the codebase (new features, architectural changes, bug fixes), ask the user:
> "Should I update the README and/or AGENTS.md to reflect these changes?"

### Key Files to Understand
- `app.js` - All frontend logic including spaced repetition algorithm
- `server.js` - Simple Express server with `/api/cards` and `/api/backup` endpoints
- `vocab.json` - The data format for cards

### Code Style
- Vanilla JS, no frameworks
- Simple and readable over clever
- Comments for non-obvious logic only
