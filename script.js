const STORAGE_KEY = `custom-challenges-${CHALLENGE_SETTINGS.version}`;
let completed;
try { completed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { completed = []; }
if (!Array.isArray(completed)) completed = [];
completed = [...new Set(completed.filter(id => CHALLENGES.some(c => c.id === id)))];
let selected = CHALLENGES.find(c => !completed.includes(c.id))?.id || 1;
const detail = document.getElementById('detailContent');
const geoDialog = document.createElement('dialog');
geoDialog.className = 'geo-dialog';
geoDialog.setAttribute('aria-label', 'Location challenge');
document.body.append(geoDialog);
let geoOpener;
function closeGeo() { geoDialog.close(); geoDialog.replaceChildren(); geoOpener?.focus(); }
geoDialog.addEventListener('cancel', event => { event.preventDefault(); closeGeo(); });
function openGeo(challenge, opener) {
  geoOpener = opener;
  const frame = document.createElement('iframe'); frame.id = 'geoGameFrame';
  frame.title = 'Full-screen location challenge'; frame.src = `geo.html?mission=${challenge.id}`;
  geoDialog.replaceChildren(frame); geoDialog.showModal();
}
function unlockTime(index) {
  const start = Date.parse(CHALLENGE_SETTINGS.unlockStart);
  const end = Date.parse(CHALLENGE_SETTINGS.unlockEnd);
  return start + (end - start) * index / Math.max(1, CHALLENGES.length - 1);
}
function timeUnlocked(index) { return !CHALLENGE_SETTINGS.timedUnlocks || Date.now() >= unlockTime(index); }
function unlockLabel(index) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Ljubljana', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(unlockTime(index));
}
function available(index) {
  return timeUnlocked(index) && (index === 0 || completed.includes(CHALLENGES[index - 1].id));
}
function render() {
  const percent = Math.round(completed.length / CHALLENGES.length * 100);
  document.getElementById('progressText').textContent = `${percent}%`;
  document.getElementById('progressBar').style.width = `${percent}%`;
  document.getElementById('statusText').textContent = percent === 100 ? 'COMPLETE' : 'ACTIVE';
  const list = document.getElementById('missionList'); list.replaceChildren();
  CHALLENGES.forEach((challenge, index) => {
    const button = document.createElement('button');
    button.className = `mission-button ${selected === challenge.id ? 'is-active' : ''} ${available(index) ? '' : 'is-locked'}`;
    button.innerHTML = `<span>MISSION ${String(challenge.id).padStart(2, '0')}</span><span class="icon" aria-hidden="true">${completed.includes(challenge.id) ? '✓' : available(index) ? '›' : '⌑'}</span>`;
    button.type = 'button';
    button.setAttribute('aria-disabled', String(!available(index)));
    button.setAttribute('aria-current', String(selected === challenge.id));
    button.onclick = () => { selected = challenge.id; render(); }; list.append(button);
  });
  const index = CHALLENGES.findIndex(c => c.id === selected), challenge = CHALLENGES[index];
  detail.innerHTML = `<div class="fade-in"><div class="detail-top"><div><h2 id="detailHeading" class="detail-title">MISSION ${String(selected).padStart(2, '0')}</h2><div class="badge">${completed.includes(selected) ? 'COMPLETED' : available(index) ? 'AVAILABLE' : 'LOCKED'}</div></div></div><div class="rule"></div><div id="missionBody"></div></div>`;
  const body = document.getElementById('missionBody');
  const message = document.createElement('p'); message.className = 'detail-copy'; body.append(message);
  if (completed.includes(selected)) message.textContent = percent === 100 ? 'All 16 challenges complete. See you soon! ♥' : 'Challenge complete! Select the next mission.';
  else if (!available(index)) message.textContent = !timeUnlocked(index) ? `Unlocks on ${unlockLabel(index)} (Ljubljana time).` : `Complete Mission ${String(CHALLENGES[index - 1].id).padStart(2, '0')} first.`;
  else {
    message.remove();
    if (challenge.type === 'geo') {
      const launch = document.createElement('button'); launch.type = 'button'; launch.className = 'terminal-button geo-launch';
      launch.textContent = 'LAUNCH LOCATION CHALLENGE ↗';
      launch.onclick = () => openGeo(challenge, launch);
      body.append(launch); return;
    }
    const launch = document.createElement('div'); launch.className = 'majdle-launch';
    const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'terminal-button';
    toggle.textContent = 'ACCESS ENCRYPTED TERMINAL'; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', 'puzzleShell');
    const shell = document.createElement('div'); shell.id = 'puzzleShell'; shell.className = 'majdle-shell'; shell.hidden = true;
    const frame = document.createElement('iframe'); frame.id = 'puzzleFrame'; frame.className = 'majdle-frame';
    frame.title = challenge.type === 'geo' ? 'Location challenge' : 'Word challenge';
    const source = `${challenge.type === 'geo' ? 'geo.html' : 'majdle.html'}?mission=${selected}`;
    toggle.onclick = () => {
      shell.hidden = !shell.hidden;
      if (!frame.hasAttribute('src')) frame.src = source;
      toggle.textContent = shell.hidden ? 'ACCESS ENCRYPTED TERMINAL' : 'HIDE ENCRYPTED TERMINAL';
      toggle.setAttribute('aria-expanded', String(!shell.hidden));
    };
    shell.append(frame); launch.append(toggle, shell); body.append(launch);
  }
}
window.addEventListener('message', event => {
  const frame = geoDialog.open ? document.getElementById('geoGameFrame') : document.getElementById('puzzleFrame');
  if (!frame || event.source !== frame.contentWindow || event.origin !== location.origin) return;
  if (event.data?.type === 'challenge-close' && event.data.id === selected) { closeGeo(); return; }
  if (event.data?.type !== 'challenge-complete' || event.data.id !== selected) return;
  const index = CHALLENGES.findIndex(c => c.id === selected);
  if (!available(index) || completed.includes(selected)) return;
  completed.push(selected);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(completed)); } catch {}
  if (geoDialog.open) closeGeo();
  render();
});
function updateCountdown() {
  const seconds = Math.max(0, Math.floor((new Date(CHALLENGE_SETTINGS.countdownTarget) - Date.now()) / 1000));
  const values = { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
  Object.entries(values).forEach(([id, value]) => document.getElementById(id).textContent = String(value).padStart(2, '0'));
}
document.querySelector('[role="timer"]').title = '1 November 2026, 08:45 (Ljubljana time)';
document.querySelector('.footnote p').textContent = 'One mission unlocks every 26 minutes, 31 October 17:30–1 November 00:00 (Ljubljana).';
function unlockState() { return CHALLENGES.map((_, index) => timeUnlocked(index)).join(','); }
let lastUnlockState = unlockState();
setInterval(() => {
  updateCountdown();
  const nextState = unlockState();
  if (lastUnlockState !== nextState) { lastUnlockState = nextState; render(); }
}, 1000);
// Keep the photo full-height and center the people in the actual panel gap.
const backgroundPhoto = new Image();
backgroundPhoto.onload = positionBackground;
backgroundPhoto.src = 'assets/background.jpg';
function positionBackground() {
  const left = document.querySelector('.panel-left').getBoundingClientRect();
  const right = document.querySelector('.panel-right').getBoundingClientRect();
  const gap = right.left - left.right;
  if (gap <= 0) return;
  const ratio = backgroundPhoto.naturalWidth / backgroundPhoto.naturalHeight || 0.75;
  const photoWidth = window.innerHeight * ratio;
  const peopleCenter = 0.42;
  document.documentElement.style.setProperty('--photo-left', `${left.right + gap / 2 - photoWidth * peopleCenter}px`);
}
new ResizeObserver(positionBackground).observe(document.querySelector('.app-shell'));
window.addEventListener('resize', positionBackground);
positionBackground();
updateCountdown(); render();
