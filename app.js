// ===== State =====
let data = { cards: [], nextId: 1 };
let currentCard = null;
let dueCards = [];
let previousDueCount = 0; // Track for session completion detection

// ===== DOM Elements =====
const studyView = document.getElementById('study-view');
const addView = document.getElementById('add-view');
const navBtns = document.querySelectorAll('.nav-btn');

const dueCountEl = document.getElementById('due-count');
const totalCountEl = document.getElementById('total-count');
const emptyState = document.getElementById('empty-state');
const flashcard = document.getElementById('flashcard');
const card = document.getElementById('card');
const cardFrontText = document.getElementById('card-front-text');
const cardBackText = document.getElementById('card-back-text');
const cardAnswer = document.getElementById('card-answer');
const cardHint = document.getElementById('card-hint');
const ratingButtons = document.getElementById('rating-buttons');
const deleteBtn = document.getElementById('delete-btn');

const bulkInput = document.getElementById('bulk-input');
const addCardsBtn = document.getElementById('add-cards-btn');
const addFeedback = document.getElementById('add-feedback');
const recentList = document.getElementById('recent-list');

const backupStatus = document.getElementById('backup-status');
const backupSpinner = backupStatus.querySelector('.backup-spinner');
const backupText = document.getElementById('backup-text');

// ===== API =====
async function loadData() {
  const res = await fetch('/api/cards');
  data = await res.json();
  updateDueCards();
  updateStats();
  showNextCard();
  renderRecentCards();
}

async function saveData() {
  await fetch('/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// ===== Git Backup =====
function getFormattedDate() {
  return new Date().toISOString().split('T')[0];
}

function showBackupStatus(message, isLoading = false, isError = false) {
  backupSpinner.classList.toggle('hidden', !isLoading);
  backupText.textContent = message;
  backupStatus.classList.remove('success', 'error');
  if (!isLoading && !isError) backupStatus.classList.add('success');
  if (isError) backupStatus.classList.add('error');
  backupStatus.classList.add('visible');
}

function hideBackupStatus(delay = 3000) {
  setTimeout(() => {
    backupStatus.classList.remove('visible');
  }, delay);
}

async function backupToGit(commitMessage) {
  showBackupStatus('Backing up...', true);
  
  try {
    const res = await fetch('/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: commitMessage })
    });
    
    const result = await res.json();
    
    if (result.success) {
      const now = new Date().toLocaleTimeString();
      localStorage.setItem('lastBackup', now);
      showBackupStatus(`✓ Backed up at ${now}`);
      hideBackupStatus();
    } else {
      showBackupStatus('✗ Backup failed', false, true);
      hideBackupStatus(5000);
    }
  } catch (err) {
    console.error('Backup error:', err);
    showBackupStatus('✗ Backup failed', false, true);
    hideBackupStatus(5000);
  }
}

// ===== Spaced Repetition (SM-2) =====
function getToday() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function updateDueCards() {
  const today = getToday();
  dueCards = data.cards.filter(c => c.nextReview <= today);
  // Shuffle for variety
  dueCards.sort(() => Math.random() - 0.5);
}

function calculateNextReview(card, rating) {
  // rating: 2=Hard, 3=Good, 4=Easy (Again is handled separately)
  let { interval, easeFactor, repetitions } = card;
  
  if (rating === 2) {
    // Hard - always tomorrow, lower ease factor
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.15);
    // Keep repetitions (don't reset progress)
  } else if (rating === 3) {
    // Good - gradual progression: 1 → 3 → 7 → 14 → multiply
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else if (repetitions === 2) {
      interval = 7;
    } else if (repetitions === 3) {
      interval = 14;
    } else {
      interval = Math.ceil(interval * easeFactor);
    }
    repetitions++;
  } else if (rating === 4) {
    // Easy - faster progression: 1 → 6 → 14 → multiply faster
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else if (repetitions === 2) {
      interval = 14;
    } else {
      interval = Math.ceil(interval * easeFactor * 1.3);
    }
    easeFactor += 0.15;
    repetitions++;
  }
  
  return {
    interval,
    easeFactor,
    repetitions,
    nextReview: addDays(getToday(), interval)
  };
}

// ===== UI Updates =====
function updateStats() {
  dueCountEl.textContent = `${dueCards.length} card${dueCards.length !== 1 ? 's' : ''} due`;
  totalCountEl.textContent = `${data.cards.length} total`;
}

function showNextCard() {
  if (dueCards.length === 0) {
    flashcard.classList.add('hidden');
    emptyState.classList.remove('hidden');
    currentCard = null;
    return;
  }
  
  emptyState.classList.add('hidden');
  flashcard.classList.remove('hidden');
  
  currentCard = dueCards[0];
  cardFrontText.textContent = currentCard.english;
  cardBackText.textContent = currentCard.swedish;
  
  // Reset card state
  card.classList.remove('revealed');
  cardAnswer.classList.add('hidden');
  cardHint.classList.remove('hidden');
  ratingButtons.classList.add('hidden');
  deleteBtn.classList.add('hidden');
}

function revealCard() {
  if (!currentCard || card.classList.contains('revealed')) return;
  card.classList.add('revealed');
  cardAnswer.classList.remove('hidden');
  cardHint.classList.add('hidden');
  ratingButtons.classList.remove('hidden');
  deleteBtn.classList.remove('hidden');
}

function deleteCard() {
  if (!currentCard) return;
  
  // Remove from data
  data.cards = data.cards.filter(c => c.id !== currentCard.id);
  
  // Remove from due cards
  dueCards.shift();
  
  // Save and continue
  saveData();
  updateDueCards();
  updateStats();
  renderRecentCards();
  showNextCard();
}

function rateCard(rating) {
  if (!currentCard) return;
  
  // Track previous count for session completion detection
  const prevCount = dueCards.length;
  
  // Remove from front of due cards
  dueCards.shift();
  
  if (rating === 1) {
    // Again - put back in today's deck (at the end)
    dueCards.push(currentCard);
  } else {
    // Hard/Good/Easy - calculate next review and save
    const updates = calculateNextReview(currentCard, rating);
    const cardIndex = data.cards.findIndex(c => c.id === currentCard.id);
    if (cardIndex !== -1) {
      Object.assign(data.cards[cardIndex], updates);
    }
    saveData();
  }
  
  updateStats();
  showNextCard();
  
  // Check for session completion: went from >0 to 0 due cards
  if (prevCount > 0 && dueCards.length === 0) {
    backupToGit(`session completed - ${getFormattedDate()}`);
  }
}

function renderRecentCards() {
  // Show last 10 cards, newest first
  const recent = [...data.cards].reverse().slice(0, 10);
  recentList.innerHTML = recent.map(c => `
    <li>
      <span class="english">${escapeHtml(c.english)}</span>
      <span class="swedish">${escapeHtml(c.swedish)}</span>
    </li>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Add Cards =====
function addCards() {
  const lines = bulkInput.value.trim().split('\n').filter(l => l.trim());
  let added = 0;
  
  for (const line of lines) {
    // Support both "english - swedish" and "english, swedish"
    const separator = line.includes(' - ') ? ' - ' : ',';
    const parts = line.split(separator).map(s => s.trim());
    
    if (parts.length >= 2 && parts[0] && parts[1]) {
      const [english, swedish] = parts;
      
      data.cards.push({
        id: data.nextId++,
        english,
        swedish,
        nextReview: getToday(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0
      });
      added++;
    }
  }
  
  if (added > 0) {
    saveData();
    updateDueCards();
    updateStats();
    renderRecentCards();
    bulkInput.value = '';
    addFeedback.textContent = `✓ Added ${added} card${added !== 1 ? 's' : ''}`;
    setTimeout(() => { addFeedback.textContent = ''; }, 3000);
    
    // Backup to git
    backupToGit(`added ${added} card${added !== 1 ? 's' : ''} - ${getFormattedDate()}`);
  } else {
    addFeedback.textContent = 'No valid cards found';
    addFeedback.style.color = 'var(--accent-orange)';
    setTimeout(() => { 
      addFeedback.textContent = ''; 
      addFeedback.style.color = '';
    }, 3000);
  }
}

// ===== Navigation =====
function switchView(viewName) {
  navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  
  studyView.classList.toggle('active', viewName === 'study');
  addView.classList.toggle('active', viewName === 'add');
  
  if (viewName === 'study') {
    updateDueCards();
    updateStats();
    showNextCard();
  }
}

// ===== Event Listeners =====
navBtns.forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

card.addEventListener('click', (e) => {
  // Don't reveal if clicking delete button
  if (e.target.closest('.delete-btn')) return;
  revealCard();
});

deleteBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  deleteCard();
});

document.querySelectorAll('.rate-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    rateCard(parseInt(btn.dataset.rating));
  });
});

addCardsBtn.addEventListener('click', addCards);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Only handle shortcuts in study view
  if (!studyView.classList.contains('active')) {
    // In add view, Ctrl+Enter to add cards
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      addCards();
    }
    return;
  }
  
  if (!currentCard) return;
  
  if (e.code === 'Space' && !card.classList.contains('revealed')) {
    e.preventDefault();
    revealCard();
  } else if (card.classList.contains('revealed')) {
    if (e.key === '1') rateCard(1);
    else if (e.key === '2') rateCard(2);
    else if (e.key === '3') rateCard(3);
    else if (e.key === '4') rateCard(4);
    else if (e.key === 'd' || e.key === 'D' || e.key === 'Backspace') deleteCard();
  }
});

// ===== Initialize =====
loadData();

// Show last backup time if available
const lastBackup = localStorage.getItem('lastBackup');
if (lastBackup) {
  showBackupStatus(`Last backup: ${lastBackup}`);
  hideBackupStatus(5000);
}
