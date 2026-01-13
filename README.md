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

### Button Behaviors

| Button | What it means | Behavior |
|--------|---------------|----------|
| **Again** | No idea | Back in today's deck, resets progress |
| **Hard** | Struggled | Tomorrow (always 1 day), keeps progress |
| **Good** | Got it | Gradual progression |
| **Easy** | Too easy | Faster progression |

### Review Progression

**Good** (pressing Good every time):
| Review | Next in |
|--------|---------|
| 1st | 1 day |
| 2nd | 3 days |
| 3rd | 7 days |
| 4th | 14 days |
| 5th+ | ×easeFactor |

**Easy** (pressing Easy every time):
| Review | Next in |
|--------|---------|
| 1st | 1 day |
| 2nd | 6 days |
| 3rd | 14 days |
| 4th+ | ×easeFactor ×1.3 |

**Hard** always resets to 1 day but keeps your repetition count, so you can continue your progression once you hit Good again.

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
