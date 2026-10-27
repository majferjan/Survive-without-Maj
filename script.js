const STORAGE_KEY = `custom-challenges-${CHALLENGE_SETTINGS.version}`;
let completed;
try { completed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { completed = []; }
if (!Array.isArray(completed)) completed = [];
completed = [...new Set(completed.filter(id => CHALLENGES.some(c => c.id === id)))];
let selected = CHALLENGES.find(c => !completed.includes(c.id))?.id || CHALLENGES[0].id;
const detail = document.getElementById('detailContent');
const geoDialog = document.createElement('dialog');
geoDialog.className = 'geo-dialog';
geoDialog.setAttribute('aria-label', 'Location challenge');
document.body.append(geoDialog);
let geoOpener;
function closeGeo() { geoDialog.close(); geoDialog.replaceChildren(); syncActivity(); geoOpener?.focus(); }
geoDialog.addEventListener('cancel', event => { event.preventDefault(); closeGeo(); });
function openGeo(challenge, opener) {
  geoOpener = opener;
  geoDialog.classList.toggle('wordle-dialog', challenge.type === 'wordle');
  geoDialog.setAttribute('aria-label', challenge.type === 'wordle' ? 'Word challenge' : 'Location challenge');
  const frame = document.createElement('iframe'); frame.id = 'geoGameFrame';
  frame.title = challenge.type === 'wordle' ? 'Large word challenge' : 'Full-screen location challenge';
  frame.src = `${challenge.type === 'wordle' ? 'majdle.html' : 'geo.html'}?mission=${challenge.id}`;
  geoDialog.replaceChildren(frame); geoDialog.showModal(); syncActivity();
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
    button.onclick = () => { if (selected === challenge.id) return; selected = challenge.id; render(); }; list.append(button);
  });
  const index = CHALLENGES.findIndex(c => c.id === selected), challenge = CHALLENGES[index];
  detail.innerHTML = `<div class="fade-in"><div class="detail-top"><div><h2 id="detailHeading" class="detail-title">MISSION ${String(selected).padStart(2, '0')}</h2><div class="badge">${completed.includes(selected) ? 'COMPLETED' : available(index) ? 'AVAILABLE' : 'LOCKED'}</div></div></div><div class="rule"></div><div id="missionBody"></div></div>`;
  const body = document.getElementById('missionBody');
  const message = document.createElement('p'); message.className = 'detail-copy'; body.append(message);
  if (completed.includes(selected)) message.textContent = percent === 100 ? `All ${CHALLENGES.length} challenges complete. See you soon! ♥` : 'Challenge complete! Select the next mission.';
  else if (!available(index)) message.textContent = !timeUnlocked(index) ? `Unlocks on ${unlockLabel(index)} (Ljubljana time).` : `Complete Mission ${String(CHALLENGES[index - 1].id).padStart(2, '0')} first.`;
  else {
    message.remove();
    if (challenge.type === 'text') {
      renderTextChallenge(body, challenge, () => completeMission(challenge.id));
      return;
    }
    if (challenge.type === 'geo' || challenge.type === 'wordle') {
      const launch = document.createElement('button'); launch.type = 'button'; launch.className = 'terminal-button geo-launch';
      launch.textContent = challenge.type === 'wordle' ? 'OPEN WORD CHALLENGE ↗' : 'LAUNCH LOCATION CHALLENGE ↗';
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
function completeMission(id) {
  if (!progressSessionCurrent()) { refreshAfterProgressReset(); return; }
  const index = CHALLENGES.findIndex(c => c.id === id);
  if (index < 0 || id !== selected || !available(index) || completed.includes(id)) return;
  completed.push(id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(completed)); } catch {}
  if (geoDialog.open) closeGeo();
  render();
}
window.addEventListener('message', event => {
  if (!progressSessionCurrent()) { refreshAfterProgressReset(); return; }
  const frame = geoDialog.open ? document.getElementById('geoGameFrame') : document.getElementById('puzzleFrame');
  if (!frame || event.source !== frame.contentWindow || event.origin !== location.origin) return;
  if (event.data?.type === 'challenge-close' && event.data.id === selected) { closeGeo(); return; }
  if (event.data?.type !== 'challenge-complete' || event.data.id !== selected) return;
  completeMission(selected);
});
const countdownTarget = Date.parse(CHALLENGE_SETTINGS.countdownTarget);
const countdownNodes = Object.fromEntries(['days', 'hours', 'minutes', 'seconds'].map(id => [id, document.getElementById(id)]));
function updateCountdown() {
  const seconds = Math.max(0, Math.floor((countdownTarget - Date.now()) / 1000));
  const values = { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
  Object.entries(values).forEach(([id, value]) => {
    const text = String(value).padStart(2, '0');
    if (countdownNodes[id].textContent !== text) countdownNodes[id].textContent = text;
  });
}
document.querySelector('[role="timer"]').title = '1 November 2026, 08:45 (Ljubljana time)';
const scheduleStart = unlockLabel(0);
const scheduleEnd = unlockLabel(CHALLENGES.length - 1);
document.querySelector('.footnote p').textContent = CHALLENGE_SETTINGS.timedUnlocks
  ? (CHALLENGES.length === 1 ? 'Mission unlocks on ' + scheduleStart + ' (Ljubljana).' : CHALLENGES.length + ' missions unlock evenly from ' + scheduleStart + ' to ' + scheduleEnd + ' (Ljubljana).')
  : CHALLENGES.length + ' missions. Complete them in order.';
function unlockState() { return CHALLENGES.map((_, index) => timeUnlocked(index)).join(','); }
let lastUnlockState = unlockState();
function tick() {
  updateCountdown();
  const nextState = unlockState();
  if (lastUnlockState !== nextState) { lastUnlockState = nextState; render(); }
}
let clockTimer;
function syncActivity() {
  clearInterval(clockTimer);
  const suspended = document.hidden || geoDialog.open;
  document.documentElement.classList.toggle('effects-suspended', suspended);
  if (!suspended) { tick(); clockTimer = setInterval(tick, 1000); }
}
document.addEventListener('visibilitychange', syncActivity);
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
  const offset = `${left.right + gap / 2 - photoWidth * peopleCenter + (Number(CHALLENGE_SETTINGS.backgroundOffsetX) || 0)}px`;
  if (document.documentElement.style.getPropertyValue('--photo-left') !== offset) document.documentElement.style.setProperty('--photo-left', offset);
}
let backgroundFrame;
function scheduleBackground() {
  if (backgroundFrame) return;
  backgroundFrame = requestAnimationFrame(() => { backgroundFrame = null; positionBackground(); });
}
new ResizeObserver(scheduleBackground).observe(document.querySelector('.app-shell'));
window.addEventListener('resize', scheduleBackground);
positionBackground();
updateCountdown(); render(); syncActivity();
