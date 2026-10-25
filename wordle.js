const missionId = Number(new URLSearchParams(location.search).get('mission') || 1);
const challenge = CHALLENGES.find(c => c.id === missionId);
const answer = (challenge?.word || '').trim().toLowerCase();
const message = document.getElementById('message'), board = document.getElementById('board'), keyboard = document.getElementById('keyboard'), retry = document.getElementById('retry');
const storageKey = `wordle-${CHALLENGE_SETTINGS.version}-${missionId}-${answer}`;
let guesses = [], input = '', finished = false;
try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(saved)) guesses = saved.filter(w => /^[a-z]{5}$/.test(w)).slice(0, 6); } catch {}
function complete() { parent.postMessage({ type: 'challenge-complete', id: missionId }, location.origin === 'null' ? '*' : location.origin); }
function draw() {
  board.replaceChildren();
  const keyStates = {}, rank = { absent: 1, present: 2, correct: 3 };
  for (let r = 0; r < 6; r++) {
    const row = document.createElement('div'); row.className = 'row';
    const word = guesses[r] || (r === guesses.length ? input : ''), scores = guesses[r] ? scoreWord(word, answer) : [];
    for (let c = 0; c < 5; c++) {
      const tile = document.createElement('div'); tile.className = `tile ${scores[c] || (word[c] ? 'filled' : '')}`; tile.textContent = word[c] || '';
      tile.setAttribute('aria-label', word[c] ? `${word[c]}${scores[c] ? ': ' + scores[c] : ''}` : 'Empty'); row.append(tile);
      if (scores[c] && (rank[scores[c]] > (rank[keyStates[word[c]]] || 0))) keyStates[word[c]] = scores[c];
    }
    board.append(row);
  }
  keyboard.querySelectorAll('button').forEach(b => { b.className = `key ${b.dataset.key.length > 1 ? 'wide' : ''} ${keyStates[b.dataset.key] || ''}`; b.disabled = finished; });
}
function handle(key) {
  if (finished || document.getElementById('help').open) return;
  if (key === 'Backspace') input = input.slice(0, -1);
  else if (/^[a-z]$/i.test(key) && input.length < 5) input += key.toLowerCase();
  else if (key === 'Enter') {
    if (input.length !== 5) { message.textContent = 'Enter five letters.'; return; }
    if (!VALID_WORDS.has(input) && input !== answer) { message.textContent = 'Not in the word list.'; return; }
    guesses.push(input); input = '';
    try { localStorage.setItem(storageKey, JSON.stringify(guesses)); } catch {}
    checkFinished();
  }
  draw();
}
function checkFinished() {
  const won = guesses.includes(answer); finished = won || guesses.length === 6;
  message.textContent = won ? 'Brilliant! Challenge complete.' : finished ? 'Six tries used. Try again — the answer stays hidden.' : 'Find the five-letter word.';
  retry.hidden = !finished || won;
  if (won) complete();
}
document.getElementById('helpButton').onclick = () => document.getElementById('help').showModal();
document.getElementById('closeHelp').onclick = () => document.getElementById('help').close();
if (challenge?.type !== 'wordle' || !/^[a-z]{5}$/.test(answer)) {
  finished = true; message.textContent = 'This challenge is waiting for its creator to add a five-letter word in challenges.js.';
} else {
  ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].forEach((letters, i) => {
    const row = document.createElement('div'); row.className = 'keyrow';
    const keys = i === 2 ? ['Enter', ...letters, 'Backspace'] : [...letters];
    keys.forEach(key => { const b = document.createElement('button'); b.dataset.key = key; b.textContent = key === 'Backspace' ? '⌫' : key; b.setAttribute('aria-label', key); b.onclick = () => handle(key); row.append(b); }); keyboard.append(row);
  });
  document.addEventListener('keydown', e => { if (e.ctrlKey || e.metaKey || e.altKey) return; if (/^[a-z]$/i.test(e.key) || ['Enter', 'Backspace'].includes(e.key)) { if (document.getElementById('help').open) return; e.preventDefault(); handle(e.key); } });
  retry.onclick = () => { guesses = []; input = ''; finished = false; try { localStorage.removeItem(storageKey); } catch {} checkFinished(); draw(); };
  checkFinished(); draw();
}
