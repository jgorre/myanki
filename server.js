const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'vocab.json');
const TOKEN_FILE = path.join(__dirname, '.githubtoken');

// Pull latest changes from GitHub on startup
function pullOnStartup() {
  return new Promise((resolve) => {
    let token;
    try {
      token = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    } catch (err) {
      console.log('⚠️  No GitHub token found, skipping pull');
      return resolve();
    }

    const repoUrl = `https://jgorre:${token}@github.com/jgorre/myanki.git`;
    exec(`git pull ${repoUrl}`, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  Pull failed:', stderr || error.message);
      } else if (stdout.includes('Already up to date')) {
        console.log('✓ Already up to date');
      } else {
        console.log('✓ Pulled latest changes:', stdout.trim());
        
        // Check if code files were updated
        const codeFilesChanged = ['app.js', 'server.js', 'index.html', 'style.css']
          .filter(file => stdout.includes(file));
        
        if (codeFilesChanged.length > 0) {
          console.log('\n  ⚠️  WARNING: Code files were updated:', codeFilesChanged.join(', '));
          console.log('  ⚠️  Restart the server to apply these changes!\n');
        }
      }
      resolve();
    });
  });
}

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

// Backup to GitHub
app.post('/api/backup', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, error: 'Commit message required' });
  }
  
  // Read GitHub token
  let token;
  try {
    token = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'GitHub token not found' });
  }
  
  // Configure git to use token and run commit + push
  const repoUrl = `https://jgorre:${token}@github.com/jgorre/myanki.git`;
  const commands = [
    'git add vocab.json',
    `git commit -m "${message.replace(/"/g, '\\"')}"`,
    `git push ${repoUrl} HEAD`
  ].join(' && ');
  
  exec(commands, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      // Check if it's just "nothing to commit" (appears in stdout)
      if (stdout.includes('nothing to commit') || stdout.includes('no changes added to commit')) {
        return res.json({ success: true, message: 'Nothing to commit' });
      }
      console.error('Backup error:', stderr || stdout || error.message);
      return res.status(500).json({ success: false, error: 'Backup failed' });
    }
    
    console.log('Backup successful:', message);
    res.json({ success: true, message: 'Backed up successfully' });
  });
});

// Start server after pulling latest changes
pullOnStartup().then(() => {
  app.listen(PORT, () => {
    console.log(`\n  🇸🇪 MyAnki running at http://localhost:${PORT}\n`);
  });
});
