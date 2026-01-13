# 🇸🇪 MyAnki

A simple, local-first Swedish vocabulary trainer using spaced repetition.

## Quick Start

```bash
# Install dependencies
npm install

# Start the app
npm start
```

Then open [http://localhost:3000](http://localhost:3000)

## How It Works

### Study Mode
1. See an English word
2. Press **Space** (or click) to reveal the Swedish translation
3. Rate your recall:
   - **1 (Again)** - Didn't know it, see it again at the end of today's session
   - **2 (Hard)** - Got it with difficulty, see it tomorrow
   - **3 (Good)** - Normal recall, follows standard progression
   - **4 (Easy)** - Too easy, skip ahead in the schedule
4. Delete cards you no longer need with the 🗑️ button or press **D**

### Add Cards
- Enter cards in bulk, one per line
- Format: `english - swedish` or `english, swedish`
- Press **Ctrl+Enter** to add quickly

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Space | Reveal answer |
| 1-4 | Rate card |
| D / Backspace | Delete card (when revealed) |
| Ctrl+Enter | Add cards (in Add view) |

## Spaced Repetition

Uses a simplified SM-2 algorithm. Each card tracks:
- **interval** - days until next review
- **easeFactor** - personal difficulty multiplier (starts at 2.5)
- **repetitions** - successful reviews in a row

### Review Schedule

| Button | 1st Review | 2nd Review | After That |
|--------|-----------|------------|------------|
| Again | End of today | End of today | End of today |
| Hard | 1 day | 2 days | interval × 1.2 |
| Good | 1 day | 6 days | interval × easeFactor |
| Easy | 4 days | 4+ days | interval × easeFactor × 1.3 |

Cards you struggle with get a lower ease factor, so they appear more often even after you start getting them right.

## Data Storage

Your vocabulary is stored in `vocab.json` - a simple JSON file that you can:
- Check into git
- Edit manually if needed
- Back up easily

## Project Structure

```
myanki/
├── index.html   # Single page app
├── style.css    # Dark mode UI
├── app.js       # Frontend logic
├── server.js    # Minimal Express server
├── vocab.json   # Your vocabulary database
└── package.json
```

## License

MIT
