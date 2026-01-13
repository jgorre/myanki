const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'vocab.json');

app.use(express.json());
app.use(express.static(__dirname));

// Get all cards
app.get('/api/cards', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  res.json(data);
});

// Save all cards
app.post('/api/cards', (req, res) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n  🇸🇪 MyAnki running at http://localhost:${PORT}\n`);
});
